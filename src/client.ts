import { randomUUID } from "node:crypto";
import { A2AClient } from "@a2a-js/sdk/client";
import { Message, MessageSendParams, TextPart } from "@a2a-js/sdk";
import dotenv from "dotenv";
import { Connection, Client } from "@temporalio/client";
import { agentWorkflow } from "./workflows";
import { Config } from "./config";

dotenv.config();

async function main() {
  const question = "What movies were directed by Maggie Kang?";

  if (Config.CLIENT_MODE === "a2a") {
    await a2aClient(question);
  }

  if (Config.CLIENT_MODE === "temporal") {
    await temporalClient(question);
  }
}

async function a2aClient(question: string) {
  console.log("Creating A2A client and sending message...");

  // Create a client pointing to the agent's Agent Card URL.
  const client = await A2AClient.fromCardUrl(
    `http://localhost:${Config.SERVER_PORT}/.well-known/agent-card.json`
  );

  const sendParams: MessageSendParams = {
    message: {
      messageId: randomUUID(),
      role: "user",
      parts: [{ kind: "text", text: question }],
      kind: "message",
    },
  };

  const response = await client.sendMessage(sendParams);

  if ("error" in response) {
    console.error("Error:", response.error.message);
  } else {
    const result = (response as any).result as Message;
    console.log("Agent Response:", (result.parts[0] as TextPart).text);
  }
}

async function temporalClient(question: string) {
  console.log("Connecting to Temporal and starting workflow...");
  const connection = await Connection.connect(Config.TEMPORAL_CLIENT_OPTIONS);

  const client = new Client({
    connection,
    namespace: Config.TEMPORAL_NAMESPACE,
  });

  const workflowOptions = {
    taskQueue: Config.TEMPORAL_TASK_QUEUE,
    workflowId: randomUUID(),
  };

  try {
    const handle = await client.workflow.start(agentWorkflow, {
      args: [question],
      ...workflowOptions,
    });

    console.log("Workflow started with ID: %s", handle.workflowId);

    const result: string = await handle.result();

    console.log(`Response: ${result}`);
  } catch (error: any) {
    console.error("Error executing workflow:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
