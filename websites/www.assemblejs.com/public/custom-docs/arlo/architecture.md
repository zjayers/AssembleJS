# A.R.L.O. Architecture

A.R.L.O. (AssembleJS Repository Logic Orchestrator) is designed with a modular architecture that enables specialized AI agents to work together effectively. This document explains the core components and how they interact.

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
│   ├── /models               # Data models and storage
│   └── /routes               # API route definitions
├── /data                     # Data storage directory
│   ├── /collections          # Agent knowledge collections
│   └── /tasks                # Task storage
├── /ui                       # User interface files
│   └── /static               # Static assets
│       ├── /css              # Stylesheet directory
│       └── /js               # JavaScript modules
│           ├── app.js        # Main application entry point
│           ├── /modules      # Core functionality modules
│           ├── /views        # View-specific modules
│           └── /utils        # Utility function modules
└── /views                    # EJS view templates
    ├── index.ejs             # Main application template
    └── /partials             # Template partials
        ├── /agents           # Agent-specific components
        ├── /workflow         # Workflow view components
        └── /knowledge-base   # Knowledge base components
```

## Core Components

### Interface Layer

- **Web Interface**: Browser-based interface for interacting with ARLO
- **Task Dashboard**: Visual monitoring of task progress
- **Agents UI**: Interface for directly interacting with specific agents

### API Layer

- **Collections API**: CRUD operations for knowledge collections
- **Agent API**: Endpoints for agent-specific knowledge operations
- **Tasks API**: Task creation, monitoring, and management
- **Admin API**: System-wide operations and task delegation

### Storage Layer

- **Collections**: File-based JSON storage for agent knowledge
- **Tasks**: Individual JSON files for tasks with full history
- **Semantic Search**: Simple text-based search for knowledge retrieval

### Agent Layer

A.R.L.O.'s sixteen specialist agents, each with domain-specific knowledge:

- **Admin Agent**: Central coordinator for all workflows
- **Analyzer Agent**: Performance analysis specialist
- **Browser Agent**: Frontend architecture expert
- **Bundler Agent**: Build system specialist
- **Config Agent**: Configuration expert
- ...and others (see [A.R.L.O. Agents](arlo/agents) documentation)

Each agent has:
- Domain-specific knowledge stored in its collection
- Specialized functions for its domain
- Communication capabilities with other agents

## Knowledge Management System

A.R.L.O. implements a file-based knowledge management system:

- **JSON Storage**: All knowledge and tasks stored as JSON files
- **Collections**: Each agent has a dedicated knowledge collection
- **Simple Semantic Search**: Text-based matching for knowledge retrieval
- **Metadata Indexing**: Document classification with metadata

## Communication Flow

1. User submits task through the web interface
2. Task is stored in the task database
3. Admin agent processes and routes the task
4. Specialist agents collaborate on implementation
5. Task progress is updated in real-time
6. Results are returned to the user via the interface

## Technical Implementation

A.R.L.O. is implemented using:

- **Express.js**: Server framework for web and API interfaces
- **EJS Templates**: Server-side rendering for UI components
- **ES Modules**: Modular JavaScript architecture
- **JSON Files**: Simple file-based storage
- **REST API**: RESTful endpoints for all operations

## Extensibility

A.R.L.O. is designed to be extensible:

- New agents can be added easily
- API endpoints can be extended
- Knowledge can be incrementally improved
- New UI views can be incorporated
- Storage system can be enhanced

## Next Steps

To understand how these components work together to execute tasks, see the [A.R.L.O. Workflow](arlo/workflow) documentation, which provides detailed information on how tasks progress through the system.