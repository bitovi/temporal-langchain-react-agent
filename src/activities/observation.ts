import { UsageMetadata } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";

import { getChatModel } from "../internals/model";

type ObservationResult = {
  observations: string;
  usage?: UsageMetadata;
};

export async function observation(
  query: string,
  context: string[],
  actionResult: string,
): Promise<ObservationResult> {
  const promptTemplate = observationPromptTemplate();
  const formattedPrompt = await promptTemplate.format({
    userQuery: query,
    previousSteps: context.join("\n"),
    actionResult: actionResult,
  });

  const model = getChatModel("low");
  const response = await model.invoke([
    { role: "user", content: formattedPrompt },
  ]);
  return {
    observations: response.content as string,
    usage: response.usage_metadata,
  };
}

function observationPromptTemplate() {
  const templateString = `You are a ReAct (Reasoning and Acting) agent tasked with answering the following query:

<user-query>
{userQuery}
</user-query>

Your goal is to extract insights from the results of your last action and provide a concise observation.

Instructions:
1. Analyze the query, previous reasoning steps, and observations.
2. Extract insights from the latest action result.
3. Respond with a concise observation that summarizes the results of the last action taken.

You do not need to include any XML tags such as <thought>, <action>, or <observation> in your response, those will be added automatically by the Agent Workflow.

In this observation step, consider the following information from previous steps:

<previous-steps>
{previousSteps}
</previous-steps>

Provide your observation based on the latest action result:
<action-result>
{actionResult}
</action-result>
`;

  const prompt = new PromptTemplate({
    template: templateString,
    inputVariables: ["userQuery", "previousSteps", "actionResult"],
  });

  return prompt;
}
