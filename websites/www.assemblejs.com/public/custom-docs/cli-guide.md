# CLI Guide

AssembleJS provides a powerful command-line interface (CLI) for quickly generating projects, blueprints, components, and other artifacts to streamline your development workflow.

## Installation

The CLI tools are included with the AssembleJS package. All required frameworks are already bundled with AssembleJS, so no additional installations are needed.

```bash
# Global installation
npm install -g asmbl@next

# Or use with npx (recommended)
npx asm
```

## Available Commands

AssembleJS provides several interactive CLI commands:

| Command | Description |
|---------|-------------|
| `asm` | Main interactive CLI with selection menu for all commands |
| `asmgen` | Generator for creating blueprints, components, and other artifacts |
| `asm-serve` | Start the development server |
| `asm-build` | Simple build tool for your AssembleJS application (in development) |

## Generator Command (`asmgen`)

The `asmgen` command helps you generate various AssembleJS artifacts through an interactive selection process:

```bash
npx asmgen
# Select an option from the interactive menu
# Follow the prompts
```

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--output=MODE` | `-o` | Set output verbosity [minimal\|standard\|verbose] |
| `--standard` | `-s` | Use standard output mode (more detailed than minimal) |
| `--verbose` | `-v` | Use verbose output mode (maximum detail with examples) |
| `--help` | `-h` | Display help information |
| `--type` | | Specify the type of artifact to generate |
| `--name` | | Specify the name of the artifact |

### Output Verbosity

AssembleJS CLI provides three output verbosity levels:

1. **Minimal** (default): Just the essential information to get started
2. **Standard** (`-s`): More detailed information with examples
3. **Verbose** (`-v`): Maximum detail with comprehensive examples

Example:
```bash
# Interactive mode (recommended)
npx asmgen
# Then select options from the menu

# With verbose output
npx asmgen -v
# Then select options from the menu
```

## Common Workflows

### Creating a new project

```bash
# Create a new project
npx asmgen
• Select "Project" from the menu
--> Enter "my-project" for the name

# Navigate to project 
cd my-project

# Start development server
npm run dev
```

### Creating a feature with a blueprint and components

```bash
# Create a new blueprint through interactive prompt
npx asmgen
• Select "Blueprint" from the menu
--> Enter "feature-name" for the name
• Select whether to register in server.ts (yes/no)

# Create components for the feature
npx asmgen
• Select "Component" from the menu
• Select "Create a new component" option
--> Enter "header" for the name
--> Enter "main" for the view name
• Select parent components to include this in (optional)
• Select template language (React, Preact, Vue, etc.)

# Repeat for other components

# Create a factory for dynamic content
npx asmgen
• Select "Factory" from the menu
--> Enter "content-provider" for the name

# Create a service for data processing
npx asmgen
• Select "Service" from the menu
--> Enter "data-processor" for the name
```

### Creating API Controllers

```bash
# Create controllers for your API through interactive prompts
npx asmgen
• Select "Controller" from the menu
--> Enter "users" for the name
• Select whether to register in server.ts (yes/no)

# Repeat for other controllers (products, auth, etc.)
```