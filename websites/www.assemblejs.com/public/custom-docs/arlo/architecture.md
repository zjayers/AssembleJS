# A.R.L.O. Architecture

A.R.L.O. (AssembleJS Repository Logic Orchestrator) is designed with a modular architecture that enables specialized AI agents to work together effectively. This document explains the core components, how they interact, and provides comprehensive API documentation.

## System Overview

A.R.L.O. consists of four main layers:

1. **Interface Layer** - Web UI and API for user interaction
2. **API Layer** - RESTful endpoints for system communication
3. **Storage Layer** - File-based storage for knowledge and tasks
4. **Agent Layer** - Specialist agents with domain expertise

Here's a visual representation of A.R.L.O.'s architecture:

```
┌────────────────────────────────────────────────────────────┐
│                     INTERFACE LAYER                         │
│                                                            │
│    Web Interface    │    Task Dashboard    │    Agents UI   │
└────────────┬─────────────────────────────────────┬─────────┘
             │                                     │
┌────────────┼─────────────────────────────────────┼─────────┐
│                        API LAYER                            │
│                                                            │
│  Collections API  │  Agent API  │  Tasks API  │  Admin API  │
└────────────┬─────────────────────────────────────┬─────────┘
             │                                     │
┌────────────┼─────────────────────────────────────┼─────────┐
│                      STORAGE LAYER                          │
│                                                            │
│     Collections     │    Tasks    │     Semantic Search     │
└────────────┬─────────────────────────────────────┬─────────┘
             │                                     │
┌────────────┼─────────────────────────────────────┼─────────┐
│                       AGENT LAYER                           │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐     ┌─────────┐        │
│ │  Admin  │ │Analyzer │ │ Browser │ ... │ Version │        │
│ └─────────┘ └─────────┘ └─────────┘     └─────────┘        │
└────────────────────────────────────────────────────────────┘
```

## The `.arlo` Directory Structure

All A.R.L.O. components reside in the `.arlo` directory, organized as follows:

```
/.arlo
├── server.js                 # Express server for web interface
├── package.json              # Project dependencies and scripts
├── /api                      # API modules
│   ├── index.js              # API routes configuration
│   ├── /controllers          # API endpoint controllers
│   │   ├── agentController.js    # Agent-specific operations
│   │   ├── collectionsController.js # Collection management
│   │   ├── searchController.js   # Search functionality
│   │   ├── tasksController.js    # Task management
│   │   └── adminController.js    # System administration
│   ├── /middleware           # API middleware
│   │   ├── errorHandler.js   # Error handling middleware
│   │   ├── authMiddleware.js # Authentication middleware
│   │   └── loggerMiddleware.js # Request logging
│   ├── /models               # Data models and storage
│   │   ├── fileDB.js         # File-based database operations
│   │   ├── agentConfig.js    # Agent configuration management
│   │   ├── enhancedSearch.js # Search functionality
│   │   └── tasksDB.js        # Task database operations
│   ├── /routes               # API route definitions
│   │   ├── agentRoutes.js    # Agent API routes
│   │   ├── collectionRoutes.js # Collection API routes
│   │   ├── searchRoutes.js   # Search API routes
│   │   ├── tasksRoutes.js    # Task API routes
│   │   └── adminRoutes.js    # Admin API routes
│   └── /utils                # Utility functions
│       ├── errorUtils.js     # Error utilities
│       ├── validationUtils.js # Input validation
│       └── formatters.js     # Response formatting
├── /data                     # Data storage directory
│   ├── /collections          # Agent knowledge collections
│   │   ├── agent_Admin.json  # Admin agent knowledge
│   │   ├── agent_Browser.json # Browser agent knowledge
│   │   └── ...               # Other agent collections
│   └── /tasks                # Task storage
│       ├── task_001.json     # Individual task records
│       └── ...               # Other task files
├── /ui                       # User interface files
│   └── /static               # Static assets
│       ├── /css              # Stylesheet directory
│       │   ├── main.css      # Main stylesheet
│       │   ├── dashboard.css # Dashboard styles
│       │   └── agents.css    # Agent-specific styles
│       └── /js               # JavaScript modules
│           ├── app.js        # Main application entry point
│           ├── /modules      # Core functionality modules
│           │   ├── eventEmitter.js # Event system
│           │   ├── agentBrain.js   # Agent brain functionality
│           │   └── api.js          # API client
│           ├── /views        # View-specific modules
│           │   ├── dashboard.js    # Dashboard functionality
│           │   ├── agentView.js    # Agent view functionality
│           │   └── taskView.js     # Task view functionality
│           └── /utils        # Utility function modules
│               ├── formatters.js   # Data formatting utilities
│               └── validators.js   # Input validation utilities
└── /views                    # EJS view templates
    ├── index.ejs             # Main application template
    └── /partials             # Template partials
        ├── /agents           # Agent-specific components
        │   ├── agent-card.ejs     # Agent card component
        │   ├── agent-details.ejs  # Agent details component
        │   └── agent-brain.ejs    # Agent brain component
        ├── /workflow         # Workflow view components
        │   ├── task-card.ejs      # Task card component
        │   ├── task-details.ejs   # Task details component
        │   └── pipeline.ejs       # Pipeline visualization
        └── /knowledge-base   # Knowledge base components
            ├── knowledge-card.ejs # Knowledge card component
            ├── search-results.ejs # Search results component
            └── document-view.ejs  # Document view component
```

## Core Components

### Interface Layer

- **Web Interface**: Browser-based interface for interacting with ARLO
  - Dashboard for task management and system monitoring
  - Agent profiles and knowledge exploration
  - Task creation and monitoring interface
  
- **Task Dashboard**: Visual monitoring of task progress
  - Real-time pipeline visualization
  - Task progress indicators
  - Status updates and notifications
  
- **Agents UI**: Interface for directly interacting with specific agents
  - Agent profiles and capabilities
  - Knowledge base exploration
  - Direct agent interaction

### API Layer

The A.R.L.O. system provides a comprehensive RESTful API with the following endpoints:

#### Collections API

| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/api/collections` | GET | Get all collections | | Array of collection metadata |
| `/api/collections/:name` | GET | Get a specific collection | `name`: Collection name | Collection data |
| `/api/collections/:name/documents` | GET | Get documents in a collection | `name`: Collection name, <br>`limit`: (optional) Max documents, <br>`offset`: (optional) Pagination offset | Array of documents |
| `/api/collections/:name/documents/:id` | GET | Get a specific document | `name`: Collection name, <br>`id`: Document ID | Document data |
| `/api/collections/:name/documents` | POST | Add a document to a collection | `name`: Collection name, <br>Body: Document data | Created document |
| `/api/collections/:name/documents/:id` | PUT | Update a document | `name`: Collection name, <br>`id`: Document ID, <br>Body: Updated document | Updated document |
| `/api/collections/:name/documents/:id` | DELETE | Delete a document | `name`: Collection name, <br>`id`: Document ID | Success message |
| `/api/collections/:name/query` | POST | Query a collection | `name`: Collection name, <br>Body: Query parameters | Query results |

#### Agent API

| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/api/agent` | GET | Get all agents | | Array of agent metadata |
| `/api/agent/:name` | GET | Get a specific agent | `name`: Agent name | Agent data |
| `/api/agent/:name/config` | GET | Get agent configuration | `name`: Agent name | Agent configuration |
| `/api/agent/:name/config` | PUT | Update agent configuration | `name`: Agent name, <br>Body: Updated configuration | Updated configuration |
| `/api/agent/:name/knowledge` | GET | Get agent knowledge | `name`: Agent name, <br>`limit`: (optional) Max documents | Agent knowledge |
| `/api/agent/:name/knowledge` | POST | Add knowledge to agent | `name`: Agent name, <br>Body: Knowledge document | Added knowledge |
| `/api/agent/:name/query` | POST | Query agent knowledge | `name`: Agent name, <br>Body: { query, limit } | Query results |
| `/api/agent/:name/reset-config` | POST | Reset agent configuration | `name`: Agent name | Reset confirmation |

#### Tasks API

| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/api/tasks` | GET | Get all tasks | `status`: (optional) Filter by status, <br>`limit`: (optional) Max tasks, <br>`offset`: (optional) Pagination offset | Array of tasks |
| `/api/tasks/:id` | GET | Get a specific task | `id`: Task ID | Task data |
| `/api/tasks` | POST | Create a new task | Body: Task data including description | Created task |
| `/api/tasks/:id` | PUT | Update a task | `id`: Task ID, <br>Body: Updated task data | Updated task |
| `/api/tasks/:id/status` | PUT | Update task status | `id`: Task ID, <br>Body: { status, message } | Updated status |
| `/api/tasks/:id/log` | POST | Add to task log | `id`: Task ID, <br>Body: { message, agent, type } | Updated log |
| `/api/tasks/:id/log` | GET | Get task log | `id`: Task ID | Task log entries |
| `/api/tasks/:id/execute` | POST | Execute a task | `id`: Task ID | Execution status |
| `/api/tasks/:id/cancel` | POST | Cancel a task | `id`: Task ID | Cancellation status |

#### Search & Analytics API

| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/api/search` | GET | Global search | `q`: Search query, <br>`context`: (optional) Search context, <br>`limit`: (optional) Max results | Search results |
| `/api/search/suggestions` | GET | Get search suggestions | `q`: Partial query, <br>`type`: (optional) Suggestion type | Suggestions |
| `/api/search/popular` | GET | Get popular searches | | Popular search terms |
| `/api/search/analytics` | GET | Get search analytics | | Search analytics data |
| `/api/search/code` | POST | Get code suggestions | Body: { context, input } | Code suggestions |

#### Admin API

| Endpoint | Method | Description | Parameters | Response |
|----------|--------|-------------|------------|----------|
| `/api/admin/status` | GET | Get system status | | System status information |
| `/api/admin/stats` | GET | Get system statistics | | System statistics |
| `/api/admin/tasks/delegate` | POST | Delegate a task | Body: { taskId, agentName } | Delegation status |
| `/api/admin/system/settings` | GET | Get system settings | | System settings |
| `/api/admin/system/settings` | PUT | Update system settings | Body: Updated settings | Updated settings |
| `/api/admin/logs` | GET | Get system logs | `type`: Log type, <br>`limit`: (optional) Max logs | System logs |

### Storage Layer

- **Collections**: File-based JSON storage for agent knowledge
  - Each agent has a dedicated collection file
  - Document storage includes metadata and content
  - Indexing for efficient retrieval

- **Tasks**: Individual JSON files for tasks with full history
  - Complete task lifecycle tracking
  - Detailed logs of agent actions
  - Status tracking and history

- **Semantic Search**: Simple text-based search for knowledge retrieval
  - Text-based similarity matching
  - Relevance ranking
  - Cross-collection search capabilities

### Agent Layer

A.R.L.O.'s specialized agents each have domain-specific knowledge and capabilities:

- **Admin Agent**: Central coordinator for all workflows
  - Task routing and delegation
  - Plan formulation and approval
  - Team coordination

- **Analyzer Agent**: Performance analysis specialist
  - Code profiling and optimization
  - Performance metrics tracking
  - Bottleneck identification

- **Browser Agent**: Frontend architecture expert
  - Client-side component development
  - UI pattern implementation
  - Frontend optimization

- **Bundler Agent**: Build system specialist
  - Asset compilation and optimization
  - Module bundling configuration
  - Build pipeline management

Each agent has:
- Domain-specific knowledge stored in its collection
- Specialized functions for its domain
- Communication capabilities with other agents
- Brain capabilities for context tracking and decision-making

## Knowledge Management System

A.R.L.O. implements a file-based knowledge management system with these key features:

- **JSON Storage**: All knowledge and tasks stored as JSON files
  - Document schema: `{ id, content, metadata, timestamp, type }`
  - Collection structure: `{ name, documents[], metadata }`
  - Task structure: `{ id, description, status, history[], agents[], timestamp }`

- **Brain System**: Each agent has a "brain" with:
  - Memory tracking for context retention
  - Entity recognition and tracking
  - Preferences and decision rules
  - Context-aware responses

- **Collections**: Each agent has a dedicated knowledge collection
  - Agent-specific knowledge organization
  - Domain-focused document storage
  - Specialized metadata for each agent type

- **Simple Semantic Search**: Text-based matching for knowledge retrieval
  - Basic vector similarity using TF-IDF
  - Metadata-based filtering
  - Cross-collection search capabilities

- **Agent Collaboration**: Knowledge sharing between agents
  - Inter-agent messaging system
  - Team formation for complex tasks
  - Knowledge integration across domains

## Communication Flow

1. User submits task through the web interface
2. Task is stored in the task database
3. Admin agent processes and routes the task
4. Specialist agents collaborate on implementation
5. Task progress is updated in real-time
6. Results are returned to the user via the interface

## Error Handling

A.R.L.O. implements comprehensive error handling through:

- **Custom Error Classes**: Typed errors for different scenarios
  - `AppError`: Base error class
  - Specialized error types for validation, authentication, etc.
  - Consistent error structure

- **Error Middleware**: Central error processing
  - Request ID tracking
  - Automatic logging
  - Appropriate status codes and messages

- **Error Utilities**: Helper functions for error management
  - Async handler for promise error catching
  - Validation utilities
  - Safe operation wrappers

## Authentication and Authorization

While primarily an internal system, A.R.L.O. implements basic security:

- **Request Validation**: Input validation for all API requests
- **Internal Authentication**: Simple authentication for sensitive operations
- **Role-Based Access**: Different access levels for operations

## Technical Implementation

A.R.L.O. is implemented using:

- **Express.js**: Server framework for web and API interfaces
  - RESTful API design
  - Middleware architecture
  - Stateless request handling

- **EJS Templates**: Server-side rendering for UI components
  - Dynamic content rendering
  - Reusable partial components
  - Clean separation of concerns

- **ES Modules**: Modular JavaScript architecture
  - Clean import/export patterns
  - Code organization by domain
  - Dependency management

- **File-based Storage**: Simple JSON file storage
  - No external database required
  - Simple backup and versioning
  - Direct file access patterns

- **Event System**: Custom event emitter for notifications
  - Real-time updates
  - Decoupled components
  - Extensible event types

## Extensibility

A.R.L.O. is designed to be extensible:

- **New Agents**: Adding new specialized agents
  - Agent template system
  - Standardized agent interface
  - Knowledge collection creation

- **API Extension**: Adding new endpoints and capabilities
  - Route definition patterns
  - Controller/model separation
  - Middleware integration

- **Storage Enhancement**: Improving the storage system
  - Alternative storage backends
  - Enhanced search capabilities
  - Better indexing

## Next Steps

To understand how these components work together to execute tasks, see the [A.R.L.O. Workflow](arlo/workflow) documentation, which provides detailed information on how tasks progress through the system.

For information on individual agents and their capabilities, see the [A.R.L.O. Agents](arlo/agents) documentation.