import dotenv from "dotenv";
import { Connection, Client } from "@temporalio/client";
import { v4 as uuidv4 } from "uuid";
import { movieReActAgentWorkflow } from "./workflows";
import { Config } from "./config";

dotenv.config();

async function main() {
  const connection = await Connection.connect(Config.TEMPORAL_CLIENT_OPTIONS);

  const client = new Client({
    connection,
    namespace: Config.TEMPORAL_NAMESPACE,
  });

  const workflowId = `${uuidv4()}`;

  const workflowOptions = {
    taskQueue: Config.TEMPORAL_TASK_QUEUE,
    workflowId: workflowId,
  };

  try {
    const handle = await client.workflow.start(movieReActAgentWorkflow, {
      args: ["What movies were directed by Maggie Kang?"],
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
