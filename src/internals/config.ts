interface TemporalClientOptions {
  address: string;
  tls?: {
    clientCertPair: {
      crt: Buffer;
      key: Buffer;
    };
  };
}

type ModelProvider = "openai" | "anthropic" | "ollama";

export class Config {
  static get MODEL_PROVIDER(): ModelProvider {
    if (!process.env.MODEL_PROVIDER) {
      return "openai";
    }

    return process.env.MODEL_PROVIDER as ModelProvider;
  }

  static get OPENAI_API_KEY(): string {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in environment variables");
    }

    return process.env.OPENAI_API_KEY;
  }

  static get OPENAI_MODEL(): string {
    if (!process.env.OPENAI_MODEL) {
      return "gpt-5";
    }

    return process.env.OPENAI_MODEL;
  }

  static get ANTHROPIC_API_KEY(): string {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not defined in environment variables",
      );
    }

    return process.env.ANTHROPIC_API_KEY;
  }

  static get OLLAMA_MODEL(): string {
    if (!process.env.OLLAMA_MODEL) {
      return "gpt-oss:20b";
    }

    return process.env.OLLAMA_MODEL;
  }

  static get ANTHROPIC_MODEL(): string {
    if (!process.env.ANTHROPIC_MODEL) {
      return "claude-sonnet-4-5";
    }

    return process.env.ANTHROPIC_MODEL;
  }

  static get TEMPORAL_NAMESPACE(): string {
    return process.env.TEMPORAL_NAMESPACE || "default";
  }

  static get TEMPORAL_TASK_QUEUE(): string {
    return process.env.TEMPORAL_TASK_QUEUE || "agent-queue";
  }

  static get TEMPORAL_HOST_PORT(): string {
    return process.env.TEMPORAL_HOST_PORT || "localhost:7233";
  }

  static get TMDB_API_KEY(): string {
    if (!process.env.TMDB_API_KEY) {
      throw new Error("TMDB_API_KEY is not defined in environment variables");
    }

    return process.env.TMDB_API_KEY;
  }

  static get TEMPORAL_CLIENT_OPTIONS(): TemporalClientOptions {
    const temporalClientOptions: TemporalClientOptions = {
      address: Config.TEMPORAL_HOST_PORT,
    };

    return temporalClientOptions;
  }
}
