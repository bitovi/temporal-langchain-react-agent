import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOpenAI } from "@langchain/openai";
import { Config } from "./config";

export function getChatModel(level: "high" | "low"): BaseChatModel {
  if (level === "high") {
    return new ChatOpenAI({
      model: Config.OPENAI_MODEL_HIGH,
      apiKey: Config.OPENAI_API_KEY,
      streaming: false,
    });
  }

  return new ChatOpenAI({
    model: Config.OPENAI_MODEL_LOW,
    apiKey: Config.OPENAI_API_KEY,
    streaming: false,
  });
}
