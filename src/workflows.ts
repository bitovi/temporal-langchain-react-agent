import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities";

const { thought, action, observation } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
  retry: {
    backoffCoefficient: 1,
    initialInterval: "3 seconds",
    maximumAttempts: 3,
  },
});

export async function agentWorkflow(query: string): Promise<string> {
  const context: string[] = [];

  while (true) {
    const agentThought = await thought(query, context);

    if (agentThought.__type === "answer") {
      return agentThought.answer;
    }

    context.push(`<thought>\n${agentThought.thought}\n</thought>`);

    context.push(
      `<action><reason>\n${agentThought.action.reason}\n</reason><name>${agentThought.action.name}</name><input>${JSON.stringify(agentThought.action.input)}</input></action>`
    );

    const agentAction = await action(
      agentThought.action.name,
      agentThought.action.input
    );

    const agentObservation = await observation(query, context, agentAction);
    context.push(`<observation>\n${agentObservation}\n</observation>`);
  }
}
