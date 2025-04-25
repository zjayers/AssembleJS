# asmgen - AssembleJS Generator Command

The `asmgen` command is the primary code generator for AssembleJS, helping you quickly create various project artifacts including blueprints, components, factories, services, controllers, and more through an interactive CLI experience.

## Overview

`asmgen` provides an interactive command-line interface that guides you through the process of creating different elements of your AssembleJS application. It generates files with proper structure, boilerplate code, and TypeScript types to accelerate your development workflow.

## Server Configuration

When creating a Blueprint server with `createBlueprintServer()`, make sure to include these required configuration options:

```typescript
// src/server.ts
import { createBlueprintServer } from 'asmbl';

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,  // Required for development server
  devServer: viteDevServer,      // Required for development server
  
  // Other configuration options
});
```

## Usage

To run the generator, use:

```bash
npm run asm
```

Or directly:

```bash
npx asmgen [options]
```

## Command Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--output=MODE` | `-o` | Set output verbosity [minimal|standard|verbose] |
| `--standard` | `-s` | Use standard output mode (more detailed than minimal) |
| `--verbose` | `-v` | Use verbose output mode (maximum detail with examples) |
| `--help` | `-h` | Display help information |

## Interactive Generator Workflow

`asmgen` uses a fully interactive approach with prompts that guide you through the generation process:

### Project Generation

```bash
npx asmgen
• Select "Project" from the menu
--> Enter project name
• Choose project features
```

### Component Generation

```bash
npx asmgen
• Select "Component" from the menu
• Choose to create new component or add view to existing one
--> Enter component name (for new components)
--> Enter view name
• Select parent components (optional)
• Select template language (HTML, EJS, Markdown, Preact, etc.)
```

### Blueprint Generation

```bash
npx asmgen
• Select "Blueprint" from the menu
--> Enter blueprint name
--> Enter view name
• Select view template language
```

### Controller Generation

```bash
npx asmgen
• Select "Controller" from the menu
--> Enter controller name
• Choose whether to register in server.ts (yes/no)
```

### Factory Generation

```bash
npx asmgen
• Select "Factory" from the menu
--> Enter factory name
```

### Service Generation

```bash
npx asmgen
• Select "Service" from the menu
--> Enter service name
• Choose whether to register in service container
```

### Model Generation

```bash
npx asmgen
• Select "Model" from the menu
--> Enter model name
```

## Output Verbosity Levels

`asmgen` provides three levels of output verbosity to match your needs:

1. **Minimal** (default): Just the essential information to get started
2. **Standard** (`-s`): More detailed information with examples
3. **Verbose** (`-v`): Maximum detail with comprehensive examples

```bash
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
• Select "Project" from the menu
--> Enter "my-project" as the name
• Select desired features

# Navigate to project 
cd my-project

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building a Feature with Components

```bash
# Create a new blueprint
npx asmgen
• Select "Blueprint" from the menu
--> Enter "feature-name" as the name
--> Enter view name
• Select template language

# Create components for the feature
npx asmgen
• Select "Component" from the menu
--> Enter "header" as the name
--> Enter view name
• Select parent components (optional)
• Select template language
```

## Best Practices

- Use consistent naming conventions for your Blueprints and Components
- Follow kebab-case naming for components and blueprints (e.g., "user-profile")
- Create Components that are focused on a single responsibility
- Use the interactive generator for all artifacts instead of creating files manually
- Leverage the server configuration with required parameters

## Related Commands

- [asm-build](./asm-build.md) - Build your AssembleJS application for production
- [asm-serve](./asm-serve.md) - Start the development server
- [asm-insights](./asm-insights.md) - Analyze and optimize your application