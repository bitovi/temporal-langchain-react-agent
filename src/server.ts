import express from "express";
import { randomUUID } from "node:crypto";

import type { AgentCard, Message } from "@a2a-js/sdk";
import {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
  DefaultRequestHandler,
  InMemoryTaskStore,
} from "@a2a-js/sdk/server";
import { A2AExpressApp } from "@a2a-js/sdk/server/express";
import { Client, WorkflowClient, Connection } from "@temporalio/client";
import { agentWorkflow } from "./workflows";
import { startWorker } from "./worker";
import { UsageMetadata } from "@langchain/core/messages";
import { Config } from "./internals/config";

const helloAgentCard: AgentCard = {
  name: "TMDb Agent",
  description:
    "An agent that can perform deep research about movie, shows, actors, directors, and genres.",
  protocolVersion: "0.3.0",
  version: "0.1.0",
  url: "http://localhost:4000/",
  skills: [
    {
      id: "chat",
      name: "Movie Chat",
      description: "Ask about movies, shows, actors, directors, and genres.",
      tags: ["chat"],
    },
  ],
  capabilities: {},
  defaultInputModes: [],
  defaultOutputModes: [],
};

// 2. Implement the agent's logic.
class HelloExecutor implements AgentExecutor {
  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    // Print out the actual question
    console.log(`Received: ${JSON.stringify(requestContext)}`);

    const question = requestContext.userMessage.parts
      .map((part) => {
        if (part.kind === "text") {
          return part.text;
        }
        return "";
      })
      .join(" ");

    console.log(`Question Extracted: ${question}`);

    const connection = await Connection.connect(Config.TEMPORAL_CLIENT_OPTIONS);

    const client = new Client({
      connection,
      namespace: Config.TEMPORAL_NAMESPACE,
    });

    const workflowOptions = {
      taskQueue: Config.TEMPORAL_TASK_QUEUE,
      workflowId: requestContext.contextId,
    };

    try {
      const handle = await client.workflow.start(agentWorkflow, {
        args: [{ query: question }],
        ...workflowOptions,
      });

      console.log("Workflow started with ID: %s", handle.workflowId);

      const result: { answer: string; usage: UsageMetadata } =
        await handle.result();
      console.log(`Response: ${result.answer}`);
      console.log("Usage Metrics: ", JSON.stringify(result.usage, null, 2));

      // Create a direct message response.
      const responseMessage: Message = {
        kind: "message",
        messageId: randomUUID(),
        role: "agent",
        parts: [{ kind: "text", text: result.answer }],
        // Associate the response with the incoming request's context.
        contextId: requestContext.contextId,
      };

      // Publish the message and signal that the interaction is finished.
      eventBus.publish(responseMessage);
    } catch (error: any) {
      console.error("Error executing workflow:", error);
      // Create a direct message response.
      const responseErrorMessage: Message = {
        kind: "message",
        messageId: randomUUID(),
        role: "agent",
        parts: [{ kind: "text", text: `Error: ${error.message}` }],
        // Associate the response with the incoming request's context.
        contextId: requestContext.contextId,
      };

      // Publish the message and signal that the interaction is finished.
      eventBus.publish(responseErrorMessage);
    }

    eventBus.finished();
  }

  cancelTask = async (contextId: string): Promise<void> => {
    const connection = await Connection.connect(Config.TEMPORAL_CLIENT_OPTIONS);

    const client = new WorkflowClient({
      connection,
      namespace: Config.TEMPORAL_NAMESPACE,
    });

    const handle = client.getHandle(contextId);
    await handle.terminate("Task cancelled by user");
  };
}

// 3. Set up and run the server.
const agentExecutor = new HelloExecutor();
const requestHandler = new DefaultRequestHandler(
  helloAgentCard,
  new InMemoryTaskStore(),
  agentExecutor
);

const appBuilder = new A2AExpressApp(requestHandler);
const expressApp = appBuilder.setupRoutes(express());

// If this file is run directly, start the worker
if (require.main === module) {
  async function main() {
    try {
      console.log("Starting Express server...");
      expressApp.listen(Config.SERVER_PORT, () => {
        console.log(
          `🚀 Server started on http://localhost:${Config.SERVER_PORT}`
        );
      });

      console.log("Starting Temporal worker...");
      await startWorker();
    } catch (error) {
      console.error("Failed to start worker:", error);
      process.exit(1);
    }
  }

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\nReceived SIGINT, shutting down worker gracefully...");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\nReceived SIGTERM, shutting down worker gracefully...");
    process.exit(0);
  });

  // Start the worker
  main().catch((error) => {
    console.error("Unexpected error starting worker:", error);
    process.exit(1);
  });
}
