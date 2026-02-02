import { fetchStructuredTools } from "../internals/tools";
import { StructuredTool } from "langchain";

export async function action(
  toolName: string,
  input: object | string,
): Promise<string> {
  const tools: StructuredTool[] = fetchStructuredTools();
  const tool = tools.find((t) => t.name === toolName);
  if (tool) {
    try {
      const result = await tool.invoke(input);
      return result as string;
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
