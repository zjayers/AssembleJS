# Getting Started with A.R.L.O.

This guide will help you set up and begin using A.R.L.O. (AssembleJS Repository Logic Orchestrator) in your AssembleJS development workflow. A.R.L.O.'s specialist agents provide valuable assistance for various aspects of framework development.

## Prerequisites

Before using A.R.L.O., ensure you have:

- A local clone of the AssembleJS repository
- Node.js (v14 or higher)
- npm or yarn

## Installation

A.R.L.O. is integrated directly into the AssembleJS repository. To set up A.R.L.O.:

1. Navigate to your AssembleJS repository root:

```bash
cd path/to/your/assemblejs/repo
```

2. Install dependencies:

```bash
npm install
```

3. Start the A.R.L.O. server:

```bash
cd .arlo
npm run dev
```

This will start the A.R.L.O. server, typically at http://localhost:8000.

## Accessing the A.R.L.O. Interface

After starting the server, you can access the web interface by opening your browser and navigating to:

```
http://localhost:8000
```

The interface provides several views:

- **Workflow**: Submit and monitor tasks
- **Agents**: View agent profiles and expertise
- **Knowledge Base**: Search and browse the collective knowledge
- **Collections**: Manage knowledge collections

## Your First Task with A.R.L.O.

Let's submit a simple task to A.R.L.O. to verify it's working correctly:

1. Navigate to the Workflow view in the web interface
2. In the task input field, enter a description like "Explain the blueprint registration process in AssembleJS"
3. Click "Submit Task"
4. A.R.L.O. will analyze the request and process it through the pipeline:
   - Admin agent will analyze the task
   - Appropriate specialist agents will be assigned
   - The task will move through the execution pipeline
   - You'll receive a detailed response when completed

## Understanding the Pipeline

When you submit a task, it goes through a structured pipeline:

1. **Admin Analysis**: Initial evaluation of requirements
2. **Planning**: Creating an execution strategy
3. **Execution**: Implementation by specialist agents
4. **Validation**: Quality checks and testing
5. **Git Operations**: Repository changes if needed

You can track the progress of your task in real-time on the task details page.

## Working with Knowledge Collections

A.R.L.O. stores knowledge in collections, with each agent having its own collection. You can explore these through the Collections view:

- Browse agent collections to see their specialized knowledge
- Search across collections for specific information
- Add new knowledge to help agents learn
- Create custom collections for specific domains

## API Endpoints

For programmatic access, A.R.L.O. offers a RESTful API:

- `/api/collections` - Manage knowledge collections
- `/api/agent` - Interact with specific agents
- `/api/tasks` - Submit and manage tasks
- `/api/admin` - System-wide operations

## Agent Capabilities

Each agent in A.R.L.O. specializes in a specific domain:

- **Admin**: Workflow coordination
- **Browser**: Frontend architecture
- **Server**: Backend implementation
- **Utils**: Utility functions
- ...and many more

You can learn more about each agent in the [A.R.L.O. Agents](arlo/agents) documentation.

## Best Practices for Working with A.R.L.O.

To get the most out of A.R.L.O.:

1. **Be specific** in your task descriptions
2. **Provide context** when referencing code or features
3. **Review changes** before implementing them
4. **Give feedback** to help agents improve
5. **Start small** before delegating complex tasks

## Next Steps

Now that you have A.R.L.O. up and running, explore these resources to learn more:

- [A.R.L.O. Architecture](arlo/architecture) - Understand how A.R.L.O. is structured
- [A.R.L.O. Workflow](arlo/workflow) - Learn about the task execution flow
- [A.R.L.O. Agents](arlo/agents) - Details on all specialist agents