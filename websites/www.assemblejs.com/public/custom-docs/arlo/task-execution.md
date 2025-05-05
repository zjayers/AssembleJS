# AI-Centric Task Execution System

ARLO's AI-centric task execution system leverages multiple AI providers to analyze, plan, implement, validate, and create pull requests for tasks. The system provides a streamlined workflow for handling development tasks in the AssembleJS framework.

## Overview

The task execution system uses a pipeline of specialized AI agents:

1. **Admin Agent**: Analyzes the task and determines which specialist agents should be involved
2. **Config Agent**: Creates a detailed implementation plan 
3. **Developer Agent**: Implements the code changes
4. **Validator Agent**: Tests and validates the implementation
5. **Git Agent**: Creates a pull request with an appropriate description

## AI Providers

The system supports multiple AI providers:

- **Ollama** (default): Local inference with code-optimized models
- **OpenAI**: Access to advanced language models via OpenAI API 
- **Anthropic**: Access to Claude models via Anthropic API

## Configuration

Configure AI providers through environment variables. See the `.env.example` file for all available configuration options:

```bash
# Default provider is Ollama
OLLAMA_ENDPOINT=http://localhost:11434

# OpenAI API (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic/Claude API (optional) 
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Other configuration options
PORT=8000
API_TIMEOUT=120000
CACHE_MAX_SIZE=1000
```

Additional configuration options control cache behavior, timeouts, logging levels, and more. The system is highly configurable to suit various development environments.

## API Endpoints

### Create a new task

```
POST /api/tasks
```

Creates a new task for ARLO to process using the AI-centric execution system.

**Request Body:**
```json
{
  "task_description": "The task to be executed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task_id": "task-uuid",
  "response": "Task received and being processed by the Admin agent."
}
```

### Get task execution status

```
GET /api/tasks/:id/execution
```

Returns task execution status with agent information.

**Response:**
```json
{
  "success": true,
  "task": {
    "id": "task-uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "pending|running|completed|failed",
    "timestamp": "2023-01-01T00:00:00Z",
    "logs": [
      "[12:00:00] Task created",
      "[12:00:05] Admin agent analyzing task..."
    ]
  },
  "agents": [
    {
      "name": "Admin",
      "color": "#F44336"
    },
    {
      "name": "Config",
      "color": "#CDDC39"
    }
  ]
}
```

## Task Execution Flow

1. **Task Creation**: A task is submitted with a description
2. **Admin Analysis**: The Admin agent analyzes the task to understand requirements
3. **Planning**: The Config agent creates a detailed implementation plan
4. **Implementation**: The Developer agent implements code changes based on the plan
5. **Validation**: The Validator agent tests the implementation
6. **Pull Request Creation**: The Git agent creates a pull request with appropriate description

## Logs and Monitoring

Task execution can be monitored through the task logs, which provide real-time updates on the progress of each step in the execution pipeline. 

Example log entries:
```
[10:15:30] Task execution started
[10:15:32] Admin agent analyzing task...
[10:15:45] Admin agent completed analysis
[10:15:46] Config agent creating task plan...
[10:16:10] Config agent completed task plan with 3 steps
[10:16:12] Developer agent implementing plan steps...
```

## Analytics

The system tracks various metrics about task execution, including:

- Task completion rates
- Average execution time
- Agent performance metrics
- AI provider usage statistics

This data helps optimize the system over time and identify areas for improvement.

## Error Handling

The system includes robust error handling to provide clear feedback when issues occur:

- AI provider connectivity issues
- Configuration errors
- Task implementation challenges

Each error is logged with relevant context to aid in troubleshooting.

## Example Usage

Here's an example of submitting a task via the API:

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"task_description": "Update the documentation for the new feature X"}'
```

Then monitor the task status:

```bash
curl -X GET http://localhost:8000/api/tasks/[task_id]/execution
```

The Web UI also provides a visual interface for monitoring task execution progress.