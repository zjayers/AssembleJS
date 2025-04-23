```text
 █████╗  ██████╗ ██████╗███████╗███╗   ███╗██████╗ ██╗     ███████╗     
██╔══██╗██╔════╝██╔════╝██╔════╝████╗ ████║██╔══██╗██║     ██╔════╝     
███████║╚█████╗ ╚█████╗ █████╗  ██╔████╔██║██████╦╝██║     █████╗       
██╔══██║ ╚═══██╗ ╚═══██╗██╔══╝  ██║╚██╔╝██║██╔══██╗██║     ██╔══╝       
██║  ██║██████╔╝██████╔╝███████╗██║ ╚═╝ ██║██████╦╝███████╗███████╗     
╚═╝  ╚═╝╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═════╝ ╚══════╝╚══════╝     
```

> AssembleJS is in a stable Alpha Release stage. Features will be added, bugs may occur. If you encounter a bug, please raise an issue so we may patch it as quickly as possible: [Issues](https://github.com/zjayers/assemblejs/issues)

---

## Index

<!-- TOC -->

- [Index](#index)
- [About](#about)
  - [What is AssembleJS?](#what-is-assemblejs)
- [Getting Started / Prerequisites](#getting-started--prerequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [CLI Guide](#cli-guide)
- [Usage](#usage)
  - [Generating An AssembleJS Project](#generating-an-assemblejs-project)
  - [Running the Development Server](#running-the-development-server)
  - [Generating an AssembleJS Component](#generating-an-assemblejs-component)
    - [Blueprint](#blueprint)
    - [Component](#component)
    - [Factory](#factory)
    - [Controller](#controller)
    - [Service](#service)
- [Developer Documentation](#developer-documentation)
- [Examples](#examples)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [Security / Bug Reports](#security--bug-reports)
- [Sponsors](#sponsors)
- [Support AssembleJS](#support-assemblejs)
- [Developing Locally](#developing-locally)
- [License](#license)
<!-- TOC -->

---

## About

### What is AssembleJS?

- `AssembleJS` is a modern micro-frontend framework designed for building distributed, component-based UIs. It manages the compiling, bundling, and serving of UI blueprints and components in a distributed style that enables teams to work independently while creating a cohesive user experience. For the majority of cases, it should not be implemented directly, but instead generated using the `asmbl` npm package.

### Architecture

For a detailed explanation of the AssembleJS architecture, please see the [DOCUMENTATION.md](DOCUMENTATION.md) file. This document explains the system design, component interactions, and technical implementation details with comprehensive diagrams.

### Why Choose AssembleJS?

AssembleJS takes a unique approach to UI architecture that addresses common challenges faced by development teams:

#### Advantages Over Traditional Solutions

| Feature                     | AssembleJS | Single-SPA | Module Federation | NextJS | Micro-Frontends |
| --------------------------- | ---------- | ---------- | ----------------- | ------ | --------------- |
| Independent Deployment      | ✅         | ✅         | ✅                | ⚠️     | ✅              |
| Runtime Integration         | ✅         | ✅         | ✅                | ❌     | ⚠️              |
| Shared Styling              | ✅         | ❌         | ⚠️                | ✅     | ❌              |
| SEO Optimization            | ✅         | ❌         | ⚠️                | ✅     | ⚠️              |
| Server-Side Rendering       | ✅         | ❌         | ⚠️                | ✅     | ⚠️              |
| Cross-Framework Support     | ✅         | ✅         | ✅                | ❌     | ✅              |
| Low Bundle Size             | ✅         | ⚠️         | ⚠️                | ⚠️     | ✅              |
| No Framework Lock-in        | ✅         | ❌         | ❌                | ❌     | ⚠️              |
| Component-Level Integration | ✅         | ❌         | ⚠️                | ✅     | ❌              |
| Islands Architecture        | ✅         | ❌         | ⚠️                | ✅     | ❌              |
| True Micro Frontends        | ✅         | ✅         | ⚠️                | ❌     | ✅              |

#### Supported UI Languages and Frameworks

AssembleJS is designed to be framework-agnostic, supporting numerous UI languages and frameworks:

| UI Technology | Current Support | Future Plans |
| ------------- | --------------- | ------------ |
| HTML          | ✅              | ✅           |
| EJS Templates | ✅              | ✅           |
| Markdown      | ✅              | ✅           |
| Nunjucks      | ✅              | ✅           |
| Handlebars    | ✅              | ✅           |
| Pug           | ✅              | ✅           |
| WebComponents | ✅              | ✅           |
| Preact        | ✅              | ✅           |
| React         | ✅              | ✅           |
| Vue           | ✅              | ✅           |
| Svelte        | ✅              | ✅           |

✅ - Full Support | 🔄 - In Progress | 🚧 - Planned | ❌ - Not Supported

#### Key Benefits

1. **True Component Isolation** - Components are completely isolated with their own styles, scripts, and templates
2. **Factory System** - Server-side data fetching through the component factory system
3. **Blueprint Architecture** - Compose UIs from distributed components without tight coupling
4. **Multi-Framework Support** - Use different UI frameworks within the same application
5. **SSR & Island Architecture** - Server-side rendering with selective client-side hydration
6. **Minimal Client JavaScript** - Send only the JavaScript needed for each component
7. **Developer Experience** - CLI tools for scaffolding, building, and deploying

#### Ideal For

- Large organizations with multiple frontend teams
- Complex applications that need to evolve incrementally
- Projects requiring both strong team autonomy and consistent user experience
- Systems that need to blend static and dynamic content seamlessly
- Applications where SEO and performance are critical



---

## Getting Started / Prerequisites

- This project relies on [Node.js](https://nodejs.org/en/) LTS.

---

## Quick Start

<details>
<summary>🚀 Create your first AssembleJS project in 60 seconds</summary>
<br>

```bash
# Install the CLI
npm install -g asmbl@next

# Create a new project
asmgen
# Select 'Project' and follow the prompts

# Navigate to your new project
cd my-assemblejs-project

# Start the development server
npm run dev
```

Open your browser to http://localhost:3000 and start building!

</details>

## Installation

> NOTE: Some systems require you to **restart** your terminal before newly installed commands are
> available

- To get started with `AssembleJS` - you will need the `AssembleJS CLI`
- To install the CLI on your system, run the following command:

  ```bash
  # Globally install the AssembleJS CLI on your system.
  npm install -g asmbl@next
  ```

- Once installed, you will have a few _new_ commands available in your terminal:
  - `asmgen` - _generate various AssembleJS components (Projects, Blueprints, Components, etc.)_
  - `asm-build` - _build an AssembleJS project for production_
  - `asm-insights` - _run [PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about) on your project, and report the findings_
  - `asm-serve` - _run an AssembleJS development server - normally used when developing a new
    AssembleJS project_

---

## CLI Guide

AssembleJS provides a powerful CLI to streamline your development workflow:

- **`asmgen`**: Main generator for creating blueprints, components, and other artifacts
- **`asm-build`**: Build your AssembleJS application for production
- **`asm-serve`**: Start the development server with hot reloading

The CLI is designed to be used in interactive mode:

```bash
# Generate a blueprint, component, or other artifact
npx asmgen
# Follow the interactive prompts to select the type of artifact and configure it

# Build your application for production
npx asm-build

# Start the development server
npx asm-serve
```

For a comprehensive guide to all CLI commands and options, see the [CLI Guide section in the documentation](./DOCUMENTATION.md#cli-guide).

---

## Enterprise Tool Ecosystem

AssembleJS includes a suite of professional-grade tools designed to streamline development, ensure quality, and simplify deployment. Each tool follows enterprise standards with CI/CD integration, configurable thresholds, and comprehensive reporting.

### REDLINE - Code Quality System

REDLINE is a zero-configuration code quality tool that combines ESLint and Prettier to keep your codebase consistently formatted and error-free.

```bash
# Standard linting
redline

# Automatic code fixing
redline --fix
```

For more information, see the [REDLINE section in the documentation](./DOCUMENTATION.md#redline-code-quality-tool).

### SPECSHEET - Performance Analysis

SPECSHEET analyzes your application's performance, providing actionable insights to optimize speed, accessibility, and user experience.

```bash
# Performance analysis
specsheet --url="https://example.com"
```

### RIVET - Deployment System

RIVET simplifies deployment with platform-specific configurations for Docker, AWS, Netlify, and more.

```bash
# Interactive deployment setup
rivet
```

For more information, see the [RIVET section in the documentation](./DOCUMENTATION.md#rivet-deployment-system).

---

## Usage

### Generating An AssembleJS Project

- To generate a new project, use the `asmgen` command
- Select `Project` _(These options will expand as the AssembleJS ecosystem grows)_
- Follow the prompts to configure your new project

### Running the Development Server

- `cd` into your newly created project and run `npm run dev`
- The development server will start on the default port (3000 unless configured otherwise)
- Open your browser to the displayed URL to view your application

### Generating an AssembleJS Component

- To generate components for AssembleJS projects, use command `asmgen` once again.
- The `asmgen` command will ask different questions depending on your current working directory.

#### Blueprint

- Blueprints are the 'composition' layer of your UI. They are composed of many different `Components` from many different places!
- Use `asmgen blueprint` to create a new blueprint in your project

#### Component

- Components are the 'building blocks' of your UI. They are containerized in islands but may communicate through a global event system. You normally compose many components to build a `Blueprint`.
- Use `asmgen component` to create a new component

#### Factory

- Sometimes you may need to gather some data on the server side before rendering your Components, to do that, you'll need a `ComponentFactory`.
- `ComponentFactories` can do anything a NodeJS server can do—from file access, to template manipulation, to 3rd party API calls.
- Any data fetched on the server can be sent up to the client by utilizing the `context` object, check it out! [Component Factory Example](https://github.com/zjayers/assemblejs/blob/master/examples/simple-factory-example/src/factories/os-username.factory.ts)
- Use `asmgen factory` to create a new factory

#### Controller

- `Controllers` can be used to expose raw data to the client. These are standard API CRUD controllers and can be used as such.
- Use `asmgen controller` to create a new controller

#### Service

- Sometimes you might need a `Service` to handle more complex business logic. `asmgen` can add a base class for you to implement your service functionality!
- Use `asmgen service` to create a new service

---

## Developer Documentation

- For comprehensive documentation and tutorials, visit [assemblejs.com/developer](https://assemblejs.com/developer).

---

## Examples

- Please view the examples located here: [Examples](https://github.com/zjayers/assemblejs/tree/next/testbed)

---

## Changelog

- To view the most recent changelog, please see [CHANGELOG.md](./CHANGELOG.md).

---

## Contributing

- To view the contributing guide, please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

---

## Security / Bug Reports

- To view the security information guide, please see [SECURITY.md](./SECURITY.md).

---

## Sponsors

Your logo could be displayed here! If you find AssembleJS valuable and would like to support its continued development, consider becoming a sponsor.

## Support AssembleJS

AssembleJS is an open-source project developed and maintained by Zachariah Ayers. Your support helps ensure continued development, maintenance, and growth of this framework.

If you'd like to support the project, you can do so through:

- **[GitHub Sponsors](https://github.com/sponsors/zjayers)**: Direct support through GitHub's sponsorship program

---

## Developing Locally

- Want to contribute to AssembleJS? Have a look at our [Contributing Guide](./CONTRIBUTING.md) and the [Development Roadmap](./DOCUMENTATION.md#development-roadmap).

---


---

## License

AssembleJS is released under the MIT License with Attribution Requirement. See [LICENSE](./LICENSE) for details.

Copyright (c) 2023-2025 Zachariah Ayers

All copies or derivatives of this software must include proper attribution to the original author.

---
