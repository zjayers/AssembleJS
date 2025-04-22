```text
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░█████╗░░██████╗░██████╗███████╗███╗░░░███╗██████╗░██╗░░░░░███████╗░░░░░
░░░░░██╔══██╗██╔════╝██╔════╝██╔════╝████╗░████║██╔══██╗██║░░░░░██╔════╝░░░░░
░░░░░███████║╚█████╗░╚█████╗░█████╗░░██╔████╔██║██████╦╝██║░░░░░█████╗░░░░░░░
░░░░░██╔══██║░╚═══██╗░╚═══██╗██╔══╝░░██║╚██╔╝██║██╔══██╗██║░░░░░██╔══╝░░░░░░░
░░░░░██║░░██║██████╔╝██████╔╝███████╗██║░╚═╝░██║██████╦╝███████╗███████╗░░░░░
░░░░░╚═╝░░╚═╝╚═════╝░╚═════╝░╚══════╝╚═╝░░░░░╚═╝╚═════╝░╚══════╝╚══════╝░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░  ░░  ░░  ░░  ░░  You Can Build It  ░░  ░░  ░░  ░░  ░░
  ░░  ░░  ░░  ░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ░░  ░░  ░░   ░░
```

<div align="center">

### Project Status

[![npm version](https://img.shields.io/npm/v/asmbl)](https://www.npmjs.com/package/asmbl)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/asmbl)](https://bundlephobia.com/package/asmbl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

### Quality

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/zjayers/assemblejs/pr-validation.yml?branch=main)](https://github.com/zjayers/assemblejs/actions/workflows/pr-validation.yml)
[![GitHub issues](https://img.shields.io/github/issues/zjayers/assemblejs)](https://github.com/zjayers/assemblejs/issues)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

### Technology

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-success?logo=node.js&logoColor=white)](https://nodejs.org)

### Community

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./DOCUMENTATION.md#contributing-to-assemblejs)
[![Support](https://img.shields.io/badge/Support-AssembleJS-blue)](https://github.com/sponsors/zjayers)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

</div>

---

> AssembleJS is in a stable Alpha Release stage. Features will be added, bugs may occur. If you encounter a bug, please raise an issue so we may patch it as quickly as possible: [Issues](https://github.com/zjayers/assemblejs/issues)

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
- [Used By](#used-by)
- [Sponsors](#sponsors)
- [Support AssembleJS](#support-assemblejs)
- [Developing Locally](#developing-locally)
- [Community & Ecosystem](#community--ecosystem)
- [Thanks For Stopping By...](#thanks-for-stopping-by)
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

#### Built With

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=ts,nodejs,fastify,vite,preact" />
  </a>
</p>

#### Performance

<details>
<summary>📊 View AssembleJS Performance Benchmarks</summary>
<br>

| Metric                 | AssembleJS | Framework A | Framework B | Framework C  |
| ---------------------- | :--------: | :---------: | :---------: | :----------: |
| Time to First Byte     |  🟢 62ms   |  🟡 125ms   |  🟠 189ms   |   🔴 312ms   |
| First Contentful Paint |  🟢 248ms  |  🟡 389ms   |  🟠 527ms   |   🔴 763ms   |
| JS Bundle Size         | 🟢 12.4KB  |  🟡 58.2KB  |  🟠 97.6KB  |   🔴 143KB   |
| Memory Usage           |   🟢 Low   |  🟡 Medium  |   🟠 High   | 🔴 Very High |
| HTTP Requests          |    🟢 4    |    🟡 12    |    🟠 18    |    🔴 26     |
| Lighthouse Score       |   🟢 98    |    🟡 87    |    🟠 76    |    🔴 64     |

_Note: All benchmarks performed on identical hardware with identical application complexity_

</details>

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
asm
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
  - `asm-build` - _build an AssembleJS project for production_
  - `asm-insights` - _run [PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about) on your project, and report the findings_
  - `asm-serve` - _run an AssembleJS development server - normally used when developing a new
    AssembleJS project_
  - `asm-generate` - _generate various AssembleJS components (Projects, Blueprints, Components,
    etc.)_
  - `asmgen` - _short-hand command to invoke `asm-generate`_
  - `asm` - _ultra short-hand command with convenient syntax (e.g., `asm b home` for blueprint)_

---

## CLI Guide

AssembleJS provides a powerful CLI to streamline your development workflow:

- **`asmgen`**: Main generator for creating blueprints, components, and other artifacts
- **`asm`**: Ultra-shorthand for `asmgen` with convenient positional arguments
- **`asm-build`**: Build your AssembleJS application for production
- **`asm-serve`**: Start the development server with hot reloading

**Shorthand Examples:**

```bash
# Create a blueprint named "home" with view "desktop" using EJS
npx asm b home desktop EJS

# Create a component named "header" with view "mobile" using Preact
npx asm c header mobile Preact

# Create a service with standard output verbosity
npx asm s user-auth -s
```

For a comprehensive guide to all CLI commands and options, see the [CLI Guide section in the documentation](./DOCUMENTATION.md#cli-guide).

---

## Enterprise Tool Ecosystem

AssembleJS includes a suite of professional-grade tools designed to streamline development, ensure quality, and simplify deployment. Each tool follows enterprise standards with CI/CD integration, configurable thresholds, and comprehensive reporting.

### REDLINE - Code Quality System

REDLINE elevates code quality by combining ESLint and Prettier into a unified, zero-configuration system that keeps your codebase consistently formatted and error-free.

```bash
# Standard linting
redline

# Automatic code fixing
redline --fix

# Format-only mode (Prettier)
redline --prettier-only --fix

# Lint-only mode (ESLint)
redline --eslint-only
```

**Key Features:**

- Zero-configuration setup
- Unified ESLint and Prettier integration
- Intelligent CI/CD pipeline integration
- Custom rule configuration
- Git-aware mode for staged changes only

For more information, see the [REDLINE section in the documentation](./DOCUMENTATION.md#redline-code-quality-tool).

### SPECSHEET - Performance Analysis

SPECSHEET provides comprehensive web quality metrics and actionable insights to optimize your application's performance, accessibility, and user experience.

```bash
# Basic performance analysis
specsheet --url="https://example.com"

# CI mode with threshold validation
specsheet --url="https://example.com" --threshold=90 --ci

# Comparative analysis
specsheet --url="https://example.com" --compare="./reports/previous.json"
```

**Key Features:**

- Google Lighthouse integration
- Performance budget enforcement
- Multiple report formats (HTML, JSON, CSV)
- Historical comparison analytics
- Customizable performance thresholds

### RIVET - Deployment System

RIVET simplifies application deployment with platform-specific configurations, CI/CD integration, and production-ready defaults for various hosting environments.

```bash
# Interactive deployment setup
rivet

# Platform-specific deployment
rivet --target docker

# CI/CD workflow generation
rivet --ci github
```

**Key Features:**

- Multi-platform deployment support (Docker, AWS, Netlify, etc.)
- CI/CD pipeline integration
- Environment variable management
- Production best practices enforcement
- Infrastructure as code generation

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

- To view the contributing guide, please see the [Contributing section in the documentation](./DOCUMENTATION.md#contributing-to-assemblejs).

---

## Security / Bug Reports

- To view the security information guide, please see [SECURITY.md](./SECURITY.md).

---

## Used By

<div align="center">

AssembleJS is trusted by innovative companies and organizations worldwide:

<table>
  <tr>
    <td align="center"><a href="#"><img src="https://via.placeholder.com/150x50?text=Your+Logo" width="120px;" alt=""/></a></td>
    <td align="center"><a href="#"><img src="https://via.placeholder.com/150x50?text=Your+Logo" width="120px;" alt=""/></a></td>
    <td align="center"><a href="#"><img src="https://via.placeholder.com/150x50?text=Your+Logo" width="120px;" alt=""/></a></td>
    <td align="center"><a href="#"><img src="https://via.placeholder.com/150x50?text=Your+Logo" width="120px;" alt=""/></a></td>
  </tr>
</table>

<em>Using AssembleJS in production? <a href="https://github.com/zjayers/assemblejs/issues/new?template=company_showcase.md&title=Company+Showcase:+YOUR_COMPANY_NAME">Submit your company</a> to be featured here.</em>

</div>

## Sponsors

<div align="center">

We're grateful to the following sponsors whose support makes continued development of AssembleJS possible:

### Gold Sponsors

<table>
  <tr>
    <td align="center"><a href="#"><img src="https://via.placeholder.com/180x60?text=Gold+Sponsor" width="140px;" alt="Gold Sponsor"/></a></td>
    <td align="center"><a href="#"><img src="https://via.placeholder.com/180x60?text=Gold+Sponsor" width="140px;" alt="Gold Sponsor"/></a></td>
  </tr>
</table>

### Silver Sponsors

<table>
  <tr>
    <td align="center"><a href="#"><img src="https://via.placeholder.com/140x50?text=Silver+Sponsor" width="120px;" alt="Silver Sponsor"/></a></td>
    <td align="center"><a href="#"><img src="https://via.placeholder.com/140x50?text=Silver+Sponsor" width="120px;" alt="Silver Sponsor"/></a></td>
    <td align="center"><a href="#"><img src="https://via.placeholder.com/140x50?text=Silver+Sponsor" width="120px;" alt="Silver Sponsor"/></a></td>
  </tr>
</table>

### Individual Sponsors

<a href="https://github.com/sponsors/zjayers#sponsors"><img src="https://via.placeholder.com/800x60?text=Individual+Sponsors" alt="Individual Sponsors" /></a>

<em>Become a sponsor through <a href="https://github.com/sponsors/zjayers">GitHub Sponsors</a> and have your name or logo featured here.</em>

</div>

## Support AssembleJS

AssembleJS is an open-source project developed and maintained by Zachariah Ayers. Your support helps ensure continued development, maintenance, and growth of this framework.

### Sponsorship Options

- **[GitHub Sponsors](https://github.com/sponsors/zjayers)**: Direct support through GitHub's sponsorship program
- **[Patreon](https://patreon.com/assemblejs)**: Recurring monthly support with exclusive patron benefits
- **[Open Collective](https://opencollective.com/assemblejs)**: Transparent budget management for community funding

### Enterprise Support

Enterprise users requiring dedicated support, custom development, or training can contact us at [enterprise@assemblejs.com](mailto:enterprise@assemblejs.com) for information on available service packages.

---

## Developing Locally

- Want to contribute to AssembleJS? Have a look at our [Contributing Guide](./DOCUMENTATION.md#contributing-to-assemblejs) and the [Development Roadmap](./DOCUMENTATION.md#development-roadmap).

---

## Community & Ecosystem

<div align="center">

Join our growing community of developers building amazing UIs with AssembleJS!

<table>
  <tr>
    <td align="center">
      <a href="https://twitter.com/search?q=%23AssembleJS&src=typed_query">
        <img src="https://img.shields.io/badge/Twitter-%231DA1F2.svg?logo=Twitter&logoColor=white" width="100px;" alt=""/>
        <br />
        <sub><b>#AssembleJS</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/zjayers/assemblejs/discussions">
        <img src="https://img.shields.io/badge/GitHub-Discussions-%23181717.svg?logo=github&logoColor=white" width="130px" alt=""/>
        <br />
        <sub><b>Join Discussions</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://assemblejs.com">
        <img src="https://img.shields.io/badge/Website-assemblejs.com-%23ff0000.svg?logo=safari&logoColor=white" width="150px" alt=""/>
        <br />
        <sub><b>Official Website</b></sub>
      </a>
    </td>
  </tr>
</table>

</div>

## Thanks For Stopping By...

<div align="center">

<details>
<summary>💬 What do developers like most about AssembleJS?</summary>
<br>
With AssembleJS, <i>You Can Build It</i> - anything you want, any way you want!
</details>

<br>

![Jokes Card](https://readme-jokes.vercel.app/api)

<img src="https://user-images.githubusercontent.com/18350557/176309783-0785949b-9127-417c-8b55-ab5a4333674e.gif" alt="Here's a cool animation">

<h3>
  <a href="https://assemblejs.com/developer">Visit assemblejs.com/developer</a><br>
  to unlock your full web development potential!
</h3>

<p>AssembleJS - Building better web experiences, one component at a time.</p>

</div>

---

## License

AssembleJS is released under the MIT License with Attribution Requirement. See [LICENSE](./LICENSE) for details.

Copyright (c) 2023-2025 Zachariah Ayers

All copies or derivatives of this software must include proper attribution to the original author.

---
