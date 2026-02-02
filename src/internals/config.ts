interface TemporalClientOptions {
  address: string;
  tls?: {
    clientCertPair: {
      crt: Buffer;
      key: Buffer;
    };
  };
}

export class Config {
  static get OPENAI_API_KEY(): string {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in environment variables");
    }

    return process.env.OPENAI_API_KEY;
  }

  static get OPENAI_MODEL_LOW(): string {
    if (!process.env.OPENAI_MODEL_LOW) {
      return "gpt-5-mini-2025-08-07";
    }

    return process.env.OPENAI_MODEL_LOW;
  }

  static get OPENAI_MODEL_HIGH(): string {
    if (!process.env.OPENAI_MODEL_HIGH) {
      return "gpt-5.2-2025-12-11";
    }

    return process.env.OPENAI_MODEL_HIGH;
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
