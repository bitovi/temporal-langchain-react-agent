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
    // 1. Get the agent's thought based on the current context
    const agentThought = await thought(query, context);

    // 2. Parse the agent's thought to determine action or final answer
    if (agentThought.__type === "answer") {
      return agentThought.answer;
    }

    // 3. Record the thoughts in the context
    context.push(`<thought>${agentThought.thought}</thought>`);

    // 4. Record the action reasoning and result
    context.push(
      `<action><reason>${agentThought.action.reason}</reason><name>${agentThought.action.name}</name><input>${JSON.stringify(agentThought.action.input)}</input></action>`
    );

    // 5. The action will call tools and return the result
    const agentAction = await action(
      agentThought.action.name,
      agentThought.action.input
    );

    // 6. The observation will take the result of the action and integrate it back into the context
    const agentObservation = await observation(query, context, agentAction);
    context.push(`<observation>${agentObservation}</observation>`);
  }
}
