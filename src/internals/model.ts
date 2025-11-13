import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOpenAI } from "@langchain/openai";
import { Config } from "./config";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOllama } from "@langchain/ollama";

export function getChatModel(): BaseChatModel {
  switch (Config.MODEL_PROVIDER) {
    case "openai": {
      return new ChatOpenAI({
        model: Config.OPENAI_MODEL,
        apiKey: Config.OPENAI_API_KEY,
        streaming: false,
      });
    }

    case "anthropic": {
      return new ChatAnthropic({
        model: Config.ANTHROPIC_MODEL,
        apiKey: Config.ANTHROPIC_API_KEY,
        streaming: false,
      });
    }

    case "ollama": {
      return new ChatOllama({
        model: Config.OLLAMA_MODEL,
      });
    }

    default: {
      throw new Error(`Unsupported model provider: ${Config.MODEL_PROVIDER}`);
    }
  }
}
