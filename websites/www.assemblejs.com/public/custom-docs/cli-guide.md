# CLI Guide

AssembleJS provides a powerful command-line interface (CLI) for quickly generating projects, blueprints, components, and other artifacts to streamline your development workflow.

## Installation

The CLI tools are included with the AssembleJS package. You can install globally or use npx for one-off commands:

```bash
# Global installation
npm install -g asmbl

# Or use with npx
npx asmbl <command>
```

## Available Commands

AssembleJS provides several CLI commands:

| Command | Description |
|---------|-------------|
| `asmgen` | Main generator for creating blueprints, components, and other artifacts |
| `asm-build` | Build your AssembleJS application for production |
| `asm-serve` | Start the development server |

## Generator Command (`asmgen`)

The `asmgen` command helps you generate various AssembleJS artifacts:

```bash
npx asmgen [options]
```

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--output=MODE` | `-o` | Set output verbosity [minimal\|standard\|verbose] |
| `--standard` | `-s` | Use standard output mode (more detailed than minimal) |
| `--verbose` | `-v` | Use verbose output mode (maximum detail with examples) |
| `--help` | `-h` | Display help information |

### Output Verbosity

AssembleJS CLI provides three output verbosity levels:

1. **Minimal** (default): Just the essential information to get started
2. **Standard** (`-s`): More detailed information with examples
3. **Verbose** (`-v`): Maximum detail with comprehensive examples

Example:
```bash
# Minimal output (default)
npx asmgen 

# Standard output
npx asmgen -s

# Verbose output
npx asmgen -v
```

## Common Workflows

### Creating a new project

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

### Creating a feature with a blueprint and components

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

# Create a factory for dynamic content
npx asmgen
# Select "Factory" from the list
# Enter "content-provider" as the name
# Follow the prompts

# Create a service for data processing
npx asmgen
# Select "Service" from the list
# Enter "data-processor" as the name
# Follow the prompts
```

### Creating API Controllers

```bash
# Create controllers for your API
npx asmgen
# Select "Controller" from the list
# Enter "users" as the name
# Follow the prompts

# Repeat for other controllers
# Create products controller
# Create auth controller
```