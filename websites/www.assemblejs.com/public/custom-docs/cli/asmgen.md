# asmgen - AssembleJS Generator Command

The `asmgen` command is the primary code generator for AssembleJS, helping you quickly create various project artifacts including blueprints, components, factories, services, controllers, and more.

## Overview

`asmgen` provides an interactive command-line interface that guides you through the process of creating different elements of your AssembleJS application. It generates files with proper structure, boilerplate code, and TypeScript types to accelerate your development workflow.

## Usage

```bash
npx asmgen [options]
```

Or if you have asmbl installed globally:

```bash
asmgen [options]
```

## Command Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--output=MODE` | `-o` | Set output verbosity [minimal\|standard\|verbose] |
| `--standard` | `-s` | Use standard output mode (more detailed than minimal) |
| `--verbose` | `-v` | Use verbose output mode (maximum detail with examples) |
| `--help` | `-h` | Display help information |

## Generator Types

When you run `asmgen`, you'll be prompted to select the type of artifact you want to generate:

### Project

Generates a complete AssembleJS project with the recommended directory structure, configuration files, and base components.

**Example:**
```bash
npx asmgen
# Select "Project" from the list
# Enter "my-project" as the name
```

### Blueprint

Creates a new Blueprint, which serves as a composition layer for multiple components.

**Example:**
```bash
npx asmgen
# Select "Blueprint" from the list
# Enter "feature-name" as the name
# Follow the prompts for additional configuration
```

### Component

Generates a new Component with template, styles, and client-side code.

**Example:**
```bash
npx asmgen
# Select "Component" from the list
# Enter "header" as the name
# Select the template engine (HTML, EJS, Markdown, Preact, etc.)
# Follow the prompts for additional configuration
```

### Factory

Creates a new Factory for data preparation and transformation.

**Example:**
```bash
npx asmgen
# Select "Factory" from the list
# Enter "data-provider" as the name
# Follow the prompts for Factory configuration
```

### Service

Generates a new Service for shared functionality.

**Example:**
```bash
npx asmgen
# Select "Service" from the list
# Enter "authentication" as the name
# Follow the prompts for Service configuration
```

### Controller

Creates a new API Controller for handling HTTP requests.

**Example:**
```bash
npx asmgen
# Select "Controller" from the list
# Enter "users" as the name
# Follow the prompts for Controller configuration
```

### Model

Generates a data model with proper TypeScript interfaces.

**Example:**
```bash
npx asmgen
# Select "Model" from the list
# Enter "user" as the name
# Follow the prompts for Model configuration
```

## Output Verbosity Levels

`asmgen` provides three levels of output verbosity to match your needs:

1. **Minimal** (default): Just the essential information to get started
2. **Standard** (`-s`): More detailed information with examples
3. **Verbose** (`-v`): Maximum detail with comprehensive examples

**Examples:**
```bash
# Minimal output (default)
npx asmgen 

# Standard output
npx asmgen -s

# Verbose output
npx asmgen -v
```

## Common Workflows

### Creating a New Project

```bash
# Create a new project
npx asmgen
# Select "Project" from the list
# Enter "my-project" as the name

# Navigate to project 
cd my-project

# Start development server
npm run dev
```

### Building a Feature with Components

```bash
# Create a new blueprint
npx asmgen
# Select "Blueprint" from the list
# Enter "feature-name" as the name
# Follow the prompts

# Create components for the feature
npx asmgen
# Select "Component" from the list
# Enter "header" as the name
# Follow the prompts

# Repeat for other components
```

### Creating API Controllers

```bash
# Create controllers for your API
npx asmgen
# Select "Controller" from the list
# Enter "users" as the name
# Follow the prompts

# Repeat for other controllers
```

## Best Practices

- Use consistent naming conventions for your Blueprints and Components
- Follow the suggested directory structure for optimal organization
- Take advantage of the Factory system for data preparation
- Create Components that are focused on a single responsibility
- Leverage the Event System for communication between Components

## Related Commands

- [asm-build](./asm-build.md) - Build your AssembleJS application for production
- [asm-serve](./asm-serve.md) - Start the development server
- [asm-insights](./asm-insights.md) - Analyze and optimize your application