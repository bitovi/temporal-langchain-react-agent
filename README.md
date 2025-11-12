# Temporal LangChain ReAct Agent

This project implements a ReAct (Reasoning and Acting) agent using Temporal workflows and LangChain for intelligent task execution.

## Overview

The agent follows the ReAct pattern to break down complex queries into a series of thoughts, actions, and observations, allowing it to reason through problems step-by-step while leveraging external tools.

## Getting Started

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/bitovi/temporal-langchain-react-agent
   cd temporal-langchain-react-agent
   ```

2. **Install Dependencies**:

   This project uses `npm` for package management.

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:

   Copy `.env.example` to `.env` and fill in your OpenAI API key, Anthropic API key, and other configurations.

4. **Start Temporal Server**:

   Ensure you have a Temporal server running locally or configure the connection to a remote server.

   The easiest way to do this is by installing the [Temporal CLI](https://docs.temporal.io/cli#install). Then run:

   ```bash
   npm run temporal
   ```

5. **Run the Worker**:

   This starts the Temporal worker that will execute the workflows.

   ```bash
   npm run worker
   ```

6. **Start the Workflow**:

   This starts the client that will initiate the ReAct agent workflow.

   ```bash
   npm run client
   ```

## Architecture

### Workflow: `agentWorkflow`

The main workflow orchestrates the ReAct loop:

1. **Thought Phase**: Analyzes the user question and current context to decide next action
2. **Action Phase**: Executes the chosen tool with specified inputs
3. **Observation Phase**: Processes action results and updates context
4. **Loop**: Continues until a final answer is reached

### Activities

#### `thought(query, context)`

- Generates agent reasoning based on user query and accumulated context
- Returns either a tool action to execute or a final answer
- Uses Anthropic LLM with structured output

#### `action(toolName, input)`

- Executes the specified tool with given inputs
- Handles tool discovery and error management
- Returns structured results or error messages

#### `observation(query, context, actionResult)`

- Processes action results into meaningful observations
- Updates the reasoning context for subsequent iterations
- Uses OpenAI LLM to interpret and synthesize information

## Features

- **Fault Tolerance**: Temporal's retry policies ensure reliable execution
- **Tool Integration**: Extensible tool system via LangChain
- **Context Management**: Maintains conversation history throughout the reasoning process
- **Error Handling**: Graceful handling of tool failures and API errors

## Configuration

The project uses environment-based configuration for:

- [OpenAI API credentials](https://platform.openai.com/api-keys)
- [Anthropic API credentials](https://console.anthropic.com/settings/keys)
- [TMDB API credentials](https://developer.themoviedb.org/docs/getting-started)
- Model selection

Refer to the `.env.example` file for all configurable options.
