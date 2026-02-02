import { AgentUsage } from "./type";
import { UsageMetadata } from "@langchain/core/messages";

const INPUT_COST_PER_1M_TOKENS_LOW = 0.25;
const OUTPUT_COST_PER_1M_TOKENS_LOW = 2.0;

const INPUT_COST_PER_1M_TOKENS_HIGH = 1.75;
const OUTPUT_COST_PER_1M_TOKENS_HIGH = 14.0;

export function calculateUsageCost(
  usage: UsageMetadata | undefined,
  tier: "low" | "high",
): AgentUsage | undefined {
  if (!usage) {
    return undefined;
  }

  let total = 0;

  if (usage.input_tokens) {
    total +=
      (usage.input_tokens / 1_000_000) *
      (tier === "low"
        ? INPUT_COST_PER_1M_TOKENS_LOW
        : INPUT_COST_PER_1M_TOKENS_HIGH);
  }

  if (usage.output_tokens) {
    total +=
      (usage.output_tokens / 1_000_000) *
      (tier === "low"
        ? OUTPUT_COST_PER_1M_TOKENS_LOW
        : OUTPUT_COST_PER_1M_TOKENS_HIGH);
  }

  return {
    ...usage,
    cost: total,
  };
}
