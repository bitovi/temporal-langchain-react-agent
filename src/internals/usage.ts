import { UsageMetadata } from "@langchain/core/messages";

export type AgentUsage = {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost: number;
};

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
    input_tokens: usage.input_tokens ?? 0,
    output_tokens: usage.output_tokens ?? 0,
    total_tokens: usage.total_tokens ?? 0,
    cost: total,
  };
}
