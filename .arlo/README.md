# ARLO - AssembleJS Repository Logic Orchestrator

ARLO is an advanced AI agent system for the AssembleJS framework. It helps maintain, extend, and provide expert knowledge about the framework.

## Getting Started

### Prerequisites

- Node.js 18+
- Ollama installed locally with codellama:7b-code model (or other models as configured)
- OR access to OpenAI or Anthropic APIs

### Installation

1. Install dependencies:

   ```bash
   cd .arlo
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   # Edit .env file with your preferred settings
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Access the web interface at `http://localhost:8000`

## AI-Centric Task Execution

ARLO uses a real AI-driven task execution system that can leverage multiple AI providers. The default provider is Ollama, but OpenAI and Anthropic/Claude can also be used if configured.

### Supported AI Providers

- **Ollama**: Local inference with models like CodeLlama
- **OpenAI**: GPT-4 and other models via OpenAI API
- **Anthropic**: Claude models via Anthropic API

### Agent System

The AI-centric task execution system uses specialized agents to handle different aspects of task execution:

1. **Admin Agent**: Analyzes tasks and coordinates other agents
2. **Config Agent**: Creates detailed implementation plans
3. **Developer Agent**: Implements code changes
4. **Validator Agent**: Tests implementations
5. **Git Agent**: Creates pull requests with appropriate descriptions

### How to Use

1. Submit a task via the web interface or API
2. The system will analyze your request and create a plan
3. Specialized agents will execute the task steps
4. View task execution status and logs in real-time
5. When completed, a PR will be created (simulated in the current version)

### API Endpoints

```
POST /api/tasks                 - Create a new task
GET /api/tasks                  - Get all tasks
GET /api/tasks/:id              - Get a specific task
GET /api/tasks/:id/execution    - Get task execution status with agent info
POST /api/tasks/:id/log         - Add a log to a task
POST /api/tasks/:id/status      - Update task status
```

### Environment Configuration

Use the `.env` file to configure AI providers and agent settings. See `.env.example` for available options.

## System Architecture

- **Express.js** server with EJS templating for the web interface
- **File-based JSON storage** for agent knowledge and collections
- **RESTful API** endpoints for agent communication
- **Analytics tracking** for system usage and performance monitoring

## Troubleshooting

If you encounter issues:

1. Check logs for error messages
2. Verify Ollama is running locally (if using Ollama provider)
3. Check API keys for OpenAI or Anthropic (if using those providers)
4. Make sure all required directories exist in the `.arlo/data` directory
