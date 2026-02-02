import { PromptTemplate } from "@langchain/core/prompts";

import { fetchStructuredToolsAsString } from "../internals/tools";
import { getChatModel } from "../internals/model";
import { calculateUsageCost, AgentUsage } from "../internals/usage";
import { UsageMetadata } from "@langchain/core/messages";

type AgentResult = {
  thought: string;
  action?: {
    name: string;
    reason: string;
    input: string | object;
  };
  answer?: string;
  usage?: AgentUsage;
};

export async function thought(
  query: string,
  context: string[],
): Promise<AgentResult> {
  const promptTemplate = thoughtPromptTemplate();
  const formattedPrompt = await promptTemplate.format({
    userQuery: query,
    currentDate: new Date().toISOString().split("T")[0],
    previousSteps: context.join("\n"),
    availableActions: fetchStructuredToolsAsString(),
  });

  const model = getChatModel("high");

  // Use structured output to enforce the response format, same as we define in the prompt
  const structure = model.withStructuredOutput<AgentResult>(
    {
      type: "object",
      additionalProperties: false,
      properties: {
        thought: {
          type: "string",
        },
        action: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: {
              type: "string",
            },
            reason: {
              type: "string",
            },
            input: {
              type: "object",
              additionalProperties: true,
            },
          },
          required: ["name", "reason", "input"],
        },
        answer: {
          type: "string",
        },
      },
      required: ["thought"],
    },
    {
      includeRaw: true,
    },
  );

  const { parsed, raw } = await structure.invoke([
    { role: "user", content: formattedPrompt },
  ]);

  const result = {
    thought: parsed.thought,
  } as Partial<AgentResult>;

  if (parsed.hasOwnProperty("answer")) {
    result.answer = parsed.answer;
  }

  if (parsed.hasOwnProperty("action")) {
    result.action = parsed.action;
  }

  // @ts-expect-error this property does exist
  if (raw.usage_metadata) {
    // @ts-expect-error this property does exist
    const usage = raw.usage_metadata as unknown as UsageMetadata;
    result.usage = calculateUsageCost(usage, "high");
  }

  return result as AgentResult;
}

function thoughtPromptTemplate() {
  const templateString = `You are a ReAct (Reasoning and Acting) agent tasked with answering the following query:

<user-query>
{userQuery}
</user-query>

Your goal is to reason about the query and decide on the best course of action to answer it accurately.

Instructions:
1. Analyze the query, previous reasoning steps, and observations.
2. Decide on the next action: use a tool or provide a final answer.
3. Respond in the following JSON format:

If you need to use a tool:
{{
    "thought": "Your detailed reasoning about what to do next",
    "action": {{
        "name": "Tool name",
        "reason": "Explanation of why you chose this tool",
        "input": "JSON object matching to tool input schema"
    }}
}}

If you have enough information to answer the query:
{{
    "thought": "Your final reasoning process",
    "answer": "Your comprehensive answer to the query"
}}

Remember:
- Be thorough in your reasoning.
- Use tools when you need more information.
- Use tools to validate your assumptions and internal knowledge.
- Be sure to match the tool input schema exactly.
- Always base your reasoning on the actual observations from tool use.
- If a tool returns no results or fails, acknowledge this and consider using a different tool or approach.
- Provide a final answer only when you're confident you have sufficient information.
- If you cannot find the necessary information after using available tools, admit that you don't have enough information to answer the query confidently.
- Your internal knowledge may be outdated. The current date is {currentDate}.

You do not need to include any XML tags such as <thought>, <action>, or <observation> in your response, those will be added automatically by the Agent Workflow.

In this thinking step, consider the following information from previous steps:

<previous-steps>
{previousSteps}
</previous-steps>

Based on that information, provide your thought process and decide on the next action.
<available-actions>
{availableActions}
</available-actions>
`;

  const prompt = new PromptTemplate({
    template: templateString,
    inputVariables: [
      "userQuery",
      "currentDate",
      "previousSteps",
      "availableActions",
    ],
  });

  return prompt;
}
