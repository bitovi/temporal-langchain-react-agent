# Temporal LangChain ReAct Agent

This project implements a ReAct (Reasoning and Acting) agent using Temporal workflows and LangChain for intelligent task execution.

## Overview

The agent follows the ReAct pattern to break down complex queries into a series of thoughts, actions, and observations, allowing it to reason through problems step-by-step while leveraging external tools.

## Architecture

### Workflow: `movieReActAgentWorkflow`

The main workflow orchestrates the ReAct loop:

1. **Thought Phase**: Analyzes the user question and current context to decide next action
2. **Action Phase**: Executes the chosen tool with specified inputs
3. **Observation Phase**: Processes action results and updates context
4. **Loop**: Continues until a final answer is reached

### Activities

#### `thought(query, context)`

- Generates agent reasoning based on user query and accumulated context
- Returns either a tool action to execute or a final answer
- Uses OpenAI LLM with structured prompts

#### `action(toolName, input)`

- Executes the specified tool with given inputs
- Handles tool discovery and error management
- Returns structured results or error messages

#### `observation(query, context, actionResult)`

- Processes action results into meaningful observations
- Updates the reasoning context for subsequent iterations
- Uses LLM to interpret and synthesize information

## Features

- **Fault Tolerance**: Temporal's retry policies ensure reliable execution
- **Tool Integration**: Extensible tool system via LangChain
- **Context Management**: Maintains conversation history throughout the reasoning process
- **Error Handling**: Graceful handling of tool failures and API errors

## Configuration

The project uses environment-based configuration for:

- OpenAI API credentials
- Model selection
- Timeout and retry policies
