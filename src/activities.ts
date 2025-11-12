import { observationPromptTemplate, thoughtPromptTemplate } from "./prompt";
import { fetchStructuredTools, fetchStructuredToolsAsString } from "./tools";
import { StructuredTool } from "langchain";
import { getChatModel } from "./model";

type AgentResult = AgentResultTool | AgentResultFinal;
type AgentResultTool = {
  __type: "action";
  thought: string;
  action: {
    name: string;
    reason: string;
    input: string | object;
  };
};

type AgentResultFinal = {
  __type: "answer";
  thought: string;
  answer: string;
};

export async function thought(
  query: string,
  context: string[]
): Promise<AgentResult> {
  const promptTemplate = thoughtPromptTemplate();
  const formattedPrompt = await promptTemplate.format({
    userQuery: query,
    currentDate: new Date().toISOString().split("T")[0],
    previousSteps: context.join("\n"),
    availableActions: fetchStructuredToolsAsString(),
  });

  const model = getChatModel();
  const response = await model.invoke([
    { role: "user", content: formattedPrompt },
  ]);

  const parsed = JSON.parse(response.content as string);

  if (parsed.hasOwnProperty("answer")) {
    parsed.__type = "answer";
  }

  if (parsed.hasOwnProperty("action")) {
    parsed.__type = "action";
  }

  if (!parsed.hasOwnProperty("__type")) {
    throw new Error("Parsed agent result does not have a valid __type");
  }

  return parsed as AgentResult;
}

export async function action(
  toolName: string,
  input: object | string
): Promise<string> {
  const tools: StructuredTool[] = fetchStructuredTools();
  const tool = tools.find((t) => t.name === toolName);
  if (tool) {
    try {
      const result = await tool.invoke(input);
      return result;
    } catch (err: unknown) {
      const error = err as Error;
      return JSON.stringify({
        name: toolName,
        input: input,
        error: `Error invoking tool ${tool.name}: ${error.message}`,
      });
    }
  }

  return JSON.stringify({
    name: toolName,
    input: input,
    error: `Tool with name ${toolName} not found.`,
  });
}

export async function observation(
  query: string,
  context: string[],
  actionResult: string
): Promise<string> {
  const promptTemplate = observationPromptTemplate();
  const formattedPrompt = await promptTemplate.format({
    userQuery: query,
    previousSteps: context.join("\n"),
    actionResult: actionResult,
  });

  const model = getChatModel();
  const response = await model.invoke([
    { role: "user", content: formattedPrompt },
  ]);
  return response.content as string;
}
