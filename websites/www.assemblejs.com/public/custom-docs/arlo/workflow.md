# A.R.L.O. Workflow

The A.R.L.O. (AssembleJS Repository Logic Orchestrator) workflow defines how tasks are processed from submission to completion. This document provides a comprehensive explanation of the task pipeline, states, transitions, and monitoring capabilities.

## Workflow Overview

The A.R.L.O. workflow follows these main phases:

1. **Task Submission** - Developer submits a task request
2. **Admin Analysis** - Initial evaluation of the request
3. **Planning** - Creation of an execution plan
4. **Execution** - Implementation of necessary changes
5. **Validation** - Quality assurance and testing
6. **Git Operations** - Repository management and PR creation

## End-to-End Task Execution Flow

### 1. Task Submission

The workflow begins when a supervisor submits a task through the web interface:

```
Supervisor → Task Form → Task Storage
```

During submission, the supervisor provides:
- Detailed task description
- Optional context or requirements
- Any specific constraints or preferences
- Priority level (optional)
- Target completion date (optional)

The task is assigned a unique ID and stored in a JSON file with the following structure:

```json
{
  "id": "task_123",
  "description": "Implement caching for blueprint renderer",
  "status": "submitted",
  "priority": "high",
  "created": "2025-04-28T15:30:00Z",
  "modified": "2025-04-28T15:30:00Z",
  "targetDate": "2025-05-05T00:00:00Z",
  "assignedAgents": [],
  "logs": [
    {
      "timestamp": "2025-04-28T15:30:00Z",
      "message": "Task created",
      "agent": "System",
      "type": "info"
    }
  ],
  "metadata": {
    "source": "supervisor",
    "tags": ["performance", "rendering", "caching"]
  }
}
```

### 2. Admin Analysis

The Admin agent evaluates the task and begins the orchestration process:

```
Admin Agent → Task Analysis → Requirements Assessment → Team Assignment
```

During analysis, the Admin agent:
- Parses the task description to identify the scope
- Determines which specialist agents are required
- Formulates an initial high-level approach
- Evaluates the task complexity and estimated effort
- Updates the task status to "analyzing"

The Admin agent then interviews the supervisor for clarification if needed:
- Asks targeted questions to clarify requirements
- Gathers additional context information
- Confirms expectations for the task outcome
- Establishes success criteria

After the analysis, the task record is updated:

```json
{
  "id": "task_123",
  "status": "analyzing",
  "assignedAgents": ["Admin", "Server", "Browser", "Validator"],
  "logs": [
    // Previous logs...
    {
      "timestamp": "2025-04-28T15:35:00Z",
      "message": "Task analysis started",
      "agent": "Admin",
      "type": "info"
    },
    {
      "timestamp": "2025-04-28T15:42:00Z",
      "message": "Required specialists identified: Server, Browser, Validator",
      "agent": "Admin",
      "type": "info"
    }
  ],
  "analysis": {
    "scope": "Implement caching mechanism for rendered blueprints to improve performance",
    "complexity": "medium",
    "estimatedEffort": "2 days",
    "specialists": ["Server", "Browser", "Validator"],
    "affectedAreas": ["/src/server/renderers", "/src/browser/client"]
  }
}
```

### 3. Planning

The Admin agent collaborates with the Config agent to create a detailed execution plan:

```
Admin + Config Agents → Planning → Execution Strategy → Supervisor Approval
```

The planning phase includes:
- Step-by-step implementation approach
- Resource requirements and dependencies
- Technical specifications and integration points
- Potential challenges and mitigations
- Testing strategy

The Admin agent presents this plan to the supervisor for approval:
- Detailed implementation approach
- Expected outcomes and benefits
- Potential risks and their mitigations
- Estimated timeline for completion

Upon receiving approval, the task status is updated to "planning approved":

```json
{
  "id": "task_123",
  "status": "planning_approved",
  "logs": [
    // Previous logs...
    {
      "timestamp": "2025-04-28T16:15:00Z",
      "message": "Execution plan created",
      "agent": "Config",
      "type": "info"
    },
    {
      "timestamp": "2025-04-28T16:30:00Z",
      "message": "Execution plan approved by supervisor",
      "agent": "Admin",
      "type": "success"
    }
  ],
  "plan": {
    "steps": [
      {
        "id": "step_1",
        "description": "Create Git feature branch",
        "assignedAgent": "Git",
        "status": "pending"
      },
      {
        "id": "step_2",
        "description": "Implement server-side cache store",
        "assignedAgent": "Server",
        "status": "pending"
      },
      {
        "id": "step_3",
        "description": "Add cache invalidation mechanism",
        "assignedAgent": "Server",
        "status": "pending"
      },
      {
        "id": "step_4",
        "description": "Implement client-side cache checking",
        "assignedAgent": "Browser",
        "status": "pending"
      },
      {
        "id": "step_5",
        "description": "Write unit tests for caching functionality",
        "assignedAgent": "Validator",
        "status": "pending"
      },
      {
        "id": "step_6",
        "description": "Update documentation",
        "assignedAgent": "Docs",
        "status": "pending"
      },
      {
        "id": "step_7",
        "description": "Create pull request",
        "assignedAgent": "Git",
        "status": "pending"
      }
    ],
    "dependencies": [
      {"stepId": "step_2", "dependsOn": ["step_1"]},
      {"stepId": "step_3", "dependsOn": ["step_2"]},
      {"stepId": "step_4", "dependsOn": ["step_3"]},
      {"stepId": "step_5", "dependsOn": ["step_2", "step_3", "step_4"]},
      {"stepId": "step_6", "dependsOn": ["step_5"]},
      {"stepId": "step_7", "dependsOn": ["step_5", "step_6"]}
    ]
  }
}
```

### 4. Execution

The Admin agent coordinates the specialist agents to implement the solution:

```
Admin Agent → Git Branch Creation → Step-by-Step Implementation → Code Changes
```

During execution:
- Git agent creates a feature branch
- Server, Browser, and other specialists implement their assigned steps
- Each step is tracked with status updates
- Code is developed according to the plan
- Documentation is updated

Each step's completion is recorded in the task log:

```json
{
  "id": "task_123",
  "status": "executing",
  "logs": [
    // Previous logs...
    {
      "timestamp": "2025-04-28T17:00:00Z",
      "message": "Created feature branch: feature/blueprint-caching",
      "agent": "Git",
      "type": "success"
    },
    {
      "timestamp": "2025-04-28T18:15:00Z",
      "message": "Implemented server-side cache store in /src/server/renderers/cache-store.ts",
      "agent": "Server",
      "type": "success"
    },
    {
      "timestamp": "2025-04-28T19:30:00Z",
      "message": "Added cache invalidation in /src/server/renderers/rendering/pre.render.template.ts",
      "agent": "Server",
      "type": "success"
    }
    // Additional logs...
  ],
  "plan": {
    "steps": [
      {
        "id": "step_1",
        "status": "completed",
        "completedAt": "2025-04-28T17:00:00Z",
        "artifacts": ["feature/blueprint-caching"]
      },
      {
        "id": "step_2",
        "status": "completed",
        "completedAt": "2025-04-28T18:15:00Z",
        "artifacts": ["/src/server/renderers/cache-store.ts"]
      },
      // Updated status for other steps...
    ]
  },
  "changes": [
    {
      "file": "/src/server/renderers/cache-store.ts",
      "type": "added",
      "summary": "Created new cache store implementation"
    },
    {
      "file": "/src/server/renderers/rendering/pre.render.template.ts",
      "type": "modified",
      "summary": "Added cache checking and invalidation"
    }
    // Other changed files...
  ]
}
```

### 5. Validation

The Validator agent performs comprehensive quality assurance:

```
Validator Agent → Testing → Code Review → Quality Verification
```

Validation includes:
- Running unit and integration tests
- Verifying code against quality standards
- Ensuring adherence to requirements
- Performance testing
- Security analysis

The validation results are added to the task:

```json
{
  "id": "task_123",
  "status": "validating",
  "logs": [
    // Previous logs...
    {
      "timestamp": "2025-04-29T10:00:00Z",
      "message": "Running unit tests for caching functionality",
      "agent": "Validator",
      "type": "info"
    },
    {
      "timestamp": "2025-04-29T10:15:00Z",
      "message": "All tests passed successfully",
      "agent": "Validator",
      "type": "success"
    },
    {
      "timestamp": "2025-04-29T10:30:00Z",
      "message": "Performance benchmarks show 45% improvement in rendering speed",
      "agent": "Validator",
      "type": "success"
    }
  ],
  "validation": {
    "tests": {
      "unit": {
        "passed": 24,
        "failed": 0,
        "coverage": 92
      },
      "integration": {
        "passed": 8,
        "failed": 0
      },
      "performance": {
        "baseline": {
          "averageRenderTime": "120ms"
        },
        "current": {
          "averageRenderTime": "66ms"
        },
        "improvement": "45%"
      }
    },
    "codeQuality": {
      "linting": "passed",
      "typecheck": "passed",
      "complexity": "acceptable"
    },
    "status": "approved"
  }
}
```

### 6. Git Operations

The Git agent finalizes the code changes and prepares for integration:

```
Git Agent → Commit Creation → Push Changes → Pull Request Creation
```

Git operations include:
- Creating semantic commit messages
- Pushing changes to the remote repository
- Creating a well-formatted pull request
- Ensuring all CI checks pass

The task is updated with the PR information:

```json
{
  "id": "task_123",
  "status": "completed",
  "logs": [
    // Previous logs...
    {
      "timestamp": "2025-04-29T11:30:00Z",
      "message": "Created commit: 'feat: add blueprint rendering cache for improved performance'",
      "agent": "Git",
      "type": "success"
    },
    {
      "timestamp": "2025-04-29T11:35:00Z",
      "message": "Pushed changes to remote repository",
      "agent": "Git",
      "type": "success"
    },
    {
      "timestamp": "2025-04-29T11:40:00Z",
      "message": "Created PR #456: Blueprint Rendering Cache",
      "agent": "Git",
      "type": "success"
    },
    {
      "timestamp": "2025-04-29T11:45:00Z",
      "message": "Task completed successfully! PR ready for review.",
      "agent": "Admin",
      "type": "success"
    }
  ],
  "gitOperations": {
    "branch": "feature/blueprint-caching",
    "commits": [
      {
        "hash": "a1b2c3d4",
        "message": "feat: add blueprint rendering cache for improved performance",
        "timestamp": "2025-04-29T11:30:00Z"
      }
    ],
    "pullRequest": {
      "id": 456,
      "title": "Blueprint Rendering Cache",
      "url": "https://github.com/assemblejs/assemblejs/pull/456",
      "description": "## Summary\n- Adds server-side caching for rendered blueprints\n- Implements cache invalidation mechanism\n- Adds client-side cache checking\n\n## Test plan\n- Run unit tests with `npm test`\n- Verify performance improvement with `npm run benchmark`"
    }
  },
  "completedAt": "2025-04-29T11:45:00Z"
}
```

Finally, the Admin agent reports the completion to the supervisor with a link to the PR for review.

## Task States and Transitions

Tasks in the A.R.L.O. system move through several well-defined states:

1. **Submitted** - Task has been created but not yet processed
2. **Analyzing** - Admin agent is analyzing the requirements
3. **Planning** - Execution plan is being created
4. **Planning_Approved** - Execution plan has been approved by supervisor
5. **Executing** - Changes are being implemented according to the plan
6. **Validating** - Changes are being tested and reviewed
7. **Completed** - Task has been successfully completed with PR
8. **Failed** - Task has encountered an unrecoverable error
9. **Cancelled** - Task was explicitly cancelled by supervisor

The state transitions follow this pattern:

```
Submitted → Analyzing → Planning → Planning_Approved → Executing → Validating → Completed
     ↓           ↓          ↓              ↓              ↓            ↓           
     └───────────┴──────────┴──────────────┴──────────────┴────────────┴─→ Failed
     └───────────┴──────────┴──────────────┴──────────────┴────────────┴─→ Cancelled
```

At any point, a task can transition to the `Failed` or `Cancelled` states.

## Approval Gates and Review Processes

A.R.L.O. implements several approval gates to ensure quality and correctness:

### Planning Approval

- Admin agent presents the execution plan to the supervisor
- Supervisor reviews and approves or requests changes
- No implementation begins until plan is approved

### Step-by-Step Review

- Each implementation step is reviewed when completed
- Admin agent coordinates cross-agent reviews
- Validator agent performs automated verification
- Issues are logged and addressed before proceeding

### Final Validation

- All code changes are validated before PR creation
- Tests must pass completely
- Code quality requirements must be met
- Performance benchmarks must meet expected targets

## Monitoring and Troubleshooting

A.R.L.O. provides robust monitoring and troubleshooting capabilities:

### Real-time Pipeline Visualization

The web interface shows a real-time visualization of the task pipeline:

```
 ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
 │Submitted│───▶│Analyzing│───▶│ Planning│───▶│Executing│───▶│Validatin│───▶│Completed│
 └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                                    │              │              │
                                    ▼              ▼              ▼
                               ┌─────────┐    ┌─────────┐    ┌─────────┐
                               │ Failed  │    │ Failed  │    │ Failed  │
                               └─────────┘    └─────────┘    └─────────┘
```

Each step shows:
- Current status (in progress, completed, failed)
- Time spent in each step
- Active agents for the current step
- Percentage completion for the overall task

### Detailed Task Logs

The task detail view provides comprehensive logging:
- Chronological history of all events
- Agent-specific actions and messages
- Error details and troubleshooting information
- File changes and their impacts

### Troubleshooting Tools

For failed or stuck tasks, A.R.L.O. provides:
- Detailed error analysis
- Suggestions for resolving issues
- Manual intervention options
- Task recovery capabilities

## Task Storage and History

All tasks are stored in the file system for persistence and auditability:

- Each task is stored as an individual JSON file in `/data/tasks/`
- Task history is preserved indefinitely
- All state transitions are recorded with timestamps
- Agent actions and messages are logged comprehensively
- Tasks are searchable through the Knowledge Base
- Historical tasks provide learning opportunities for agents

## Communication Between Agents

Agents communicate through several mechanisms to ensure effective collaboration:

### Knowledge Collection Sharing

Agents share information by:
- Adding documents to their knowledge collections
- Reading from other agents' collections
- Cross-referencing related knowledge

Example of knowledge sharing:

```json
// In agent_Server.json knowledge collection
{
  "document": "The blueprint rendering system requires a cache invalidation mechanism that triggers on content changes.",
  "metadata": {
    "type": "implementation_note",
    "task_id": "task_123",
    "timestamp": "2025-04-28T18:30:00Z",
    "related_agents": ["Browser", "Validator"]
  }
}
```

### Task-Specific Communication

Agents communicate task-specific information by:
- Updating the shared task state
- Adding detailed logs to the task history
- Setting status flags for specific steps

### Brain-to-Brain Communication

Agents with "brain" capabilities can:
- Track entities and concepts across the system
- Share contextual understanding of complex problems
- Maintain memory of related interactions
- Build collaborative mental models

## Technical Implementation

The workflow system is implemented through:

- **File-based Task Storage**: Individual JSON files for each task
- **RESTful Task API**: Endpoints for task management
- **Event-driven Updates**: Real-time notifications of state changes
- **Pipeline Visualization**: Interactive UI component
- **Agent Coordination System**: Managed by Admin agent

## Next Steps

For more information on working with specific agents in the workflow, see the [A.R.L.O. Agents](arlo/agents) documentation which provides details on all available agents. To understand the technical architecture in more detail, see the [A.R.L.O. Architecture](arlo/architecture) documentation.