import {
  continueAsNew,
  proxyActivities,
  workflowInfo,
} from "@temporalio/workflow";
import type * as activities from "./activities";
import { calculateTokenUsage, type AgentUsage } from "./internals/usage";

const { thought, action, observation, compact } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: "1 minute",
  retry: {
    maximumAttempts: 5,
  },
});

export type AgentWorkflowInput = {
  query: string;
  continueAsNew?: {
    context: string[];
    usage: AgentUsage[];
  };
};

export async function agentWorkflow(
  input: AgentWorkflowInput,
): Promise<{ answer: string; usage: AgentUsage }> {
  const context: string[] = input.continueAsNew
    ? input.continueAsNew.context
    : [];
  const usage: AgentUsage[] = input.continueAsNew
    ? input.continueAsNew.usage
    : [];

  while (true) {
    if (
      workflowInfo().continueAsNewSuggested ||
      calculateTokenUsage(context) > 12000
    ) {
      const compactContext = await compact(input.query, context);
      if (compactContext.usage) {
        usage.push(compactContext.usage);
      }
      return continueAsNew<typeof agentWorkflow>({
        query: input.query,
        continueAsNew: {
          context: compactContext.context,
          usage,
        },
      });
    }

    const agentThought = await thought(input.query, context);

    if (agentThought.usage) {
      usage.push(agentThought.usage);
    }

    context.push(`<thought>\n${agentThought.thought}\n</thought>`);

    if (agentThought.answer) {
      // Calculate the final usage metrics based on the collected metadata
      const finalUsage: AgentUsage = usage.reduce(
        (acc, curr) => {
          acc.input_tokens += curr.input_tokens;
          acc.output_tokens += curr.output_tokens;
          acc.total_tokens += curr.total_tokens;
          acc.cost += curr.cost;

          return acc;
        },
        {
          input_tokens: 0,
          output_tokens: 0,
          total_tokens: 0,
          cost: 0,
        } as AgentUsage,
      );

      return { answer: agentThought.answer, usage: finalUsage };
    }

    if (agentThought.action) {
      context.push(
        `<action><reason>\n${agentThought.action.reason}\n</reason><name>${agentThought.action.name}</name><input>${JSON.stringify(agentThought.action.input)}</input></action>`,
      );

      const agentAction = await action(
        agentThought.action.name,
        agentThought.action.input,
      );

      const agentObservation = await observation(
        input.query,
        context,
        agentAction,
      );

      if (agentObservation.usage) {
        usage.push(agentObservation.usage);
      }

      context.push(
        `<observation>\n${agentObservation.observations}\n</observation>`,
      );
    }
  }
}

export async function agentWorkflowSimple(query: string): Promise<string> {
  const context: string[] = [];

  while (true) {
    const agentThought = await thought(query, context);
    context.push(`<thought>\n${agentThought.thought}\n</thought>`);

    if (agentThought.answer) {
      return agentThought.answer;
    }

    if (agentThought.action) {
      context.push(
        `<action><reason>\n${agentThought.action.reason}\n</reason><name>${agentThought.action.name}</name><input>${JSON.stringify(agentThought.action.input)}</input></action>`,
      );

      const agentAction = await action(
        agentThought.action.name,
        agentThought.action.input,
      );

      const agentObservation = await observation(query, context, agentAction);
      context.push(
        `<observation>\n${agentObservation.observations}\n</observation>`,
      );
    }
  }
}
