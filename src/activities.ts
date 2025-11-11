import { ChatOpenAI } from "@langchain/openai";

import { observationPrompt, thoughtPrompt } from "./prompt";
import { Config } from "./config";
import { fetchStructuredTools } from "./tools";
import { StructuredTool } from "langchain";

type AgentResult = AgentResultTool | AgentResultFinal;
type AgentResultTool = {
  thought: string;
  action: {
    name: string;
    reason: string;
    input: string | object;
  };
};

type AgentResultFinal = {
  thought: string;
  answer: string;
};

export async function thought(
  query: string,
  context: string[]
): Promise<AgentResult> {
  const prompt = thoughtPrompt(query, context);

  const model = new ChatOpenAI({
    model: Config.OPENAI_MODEL,
    apiKey: Config.OPENAI_API_KEY,
    streaming: false,
  });

  const response = await model.invoke([{ role: "user", content: prompt }]);

  const text = response.content;
  const parsed = JSON.parse(text as string) as AgentResult;

  return parsed;
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
  const prompt = observationPrompt(query, context, actionResult);

  const model = new ChatOpenAI({
    model: Config.OPENAI_MODEL,
    apiKey: Config.OPENAI_API_KEY,
    streaming: false,
  });

  const response = await model.invoke([{ role: "user", content: prompt }]);
  return response.content as string;
}
