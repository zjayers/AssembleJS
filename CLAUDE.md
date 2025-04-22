# AssembleJS Branding Standards

## Rebranding Summary
This project has been rebranded from "MiniMesh" to "AssembleJS" to better reflect its purpose of assembling modular UI components.

## Official Names and Standards
- **Product Name**: AssembleJS
- **GitHub Repository**: zjayers/assemblejs
- **npm Package Name**: asmbl
  - Package imports: `import { ... } from "asmbl"`
  - CLI installation: `npm install -g asmbl`

## Terminology Mappings
| Original Term | New Term |
|---------------|----------|
| mesh | blueprint |
| face | component |
| preprocessor | factory |

## CLI Command Standards
- Standard prefix: `asm-*` (asm-build, asm-serve, etc.)
- Generator alias: `asmgen` for common generator operations

## Environment Variable Standards
- Official prefix: `ASSEMBLEJS_*`

## High Priority TODOs

### 1. Dependency Updates
- Update npm packages to current versions
- High-Risk Updates: Fastify 4.x→5.x, TypeScript 4.x→5.x, Vite 3.x→6.x, Axios 0.27.2→1.8.4

### 2. CLI Fixes & Improvements
- Fix ESM compatibility issues in scripts
- Fix shorthand command processing

## Current Status of Rebranding Effort

### Completed Changes
- Core Type Definitions (renamed files to use blueprint/component terminology)
- Server and Client Components
- Constants and Config
- CLI and Generator templates
- Documentation
- Package Management (changed name to asmbl)
- Example Projects

### Remaining Tasks
- Final Testing (CLI commands, examples, ESM compatibility)
- Documentation Publishing
- GitHub Repository Updates
- Bug Fixes

## AssembleJS Roadmap: 2025

### Next Steps
1. Website Development (assemblejs.com)
2. Visual Designer Implementation (browser-based drag-and-drop)
3. Additional Examples and Testbeds

## Best Practices and Coding Standards

### 1. Client-side Event System
Use AssembleJS event system instead of DOM events:
- `events.emit('eventName', data)` instead of `dispatchEvent`
- `events.on('eventName', callback)` instead of `addEventListener`
- `events.off('eventName', callback)` instead of `removeEventListener`

### 2. Strongly Typed Component Pattern
```typescript
export class MyComponent extends Blueprint<MyPublicData, MyParams> {
  // Type-safe access to this.publicData and this.context.params
}
```

### 3. Server-side Parameter Handling
Always get parameters from server context:
```typescript
protected override async onRequest(req: ApiRequest): Promise<void> {
  super.onRequest(req);
  req.componentParams = req.componentParams || {};
  req.componentParams.filter = req.query.filter || 'default';
}
```

### 4. Project Structure
```
project-root/
├── src/
│   ├── blueprints/                  # Top-level pages/screens
│   ├── components/                  # Reusable components
│   ├── controllers/                 # Backend controllers
│   ├── services/                    # Shared services
│   ├── models/                      # Data models
│   ├── factories/                   # Data transformation logic
│   └── server.ts                    # Server entry point
```

### 5. Component Structure
Each component consists of:
1. **View File** (.view.tsx, .view.ejs, .view.html, .view.md, .view.jsx, .view.svelte, .view.vue, .view.njk, .view.hbs, .view.pug, or .view.wc)
2. **Client File** (.client.ts)
3. **Styles File** (.styles.scss)

## UI Framework Integration

AssembleJS supports multiple UI frameworks with a consistent structure:

### Supported Frameworks
- **Preact** (built-in)
- **React** (built-in)
- **Vue** (built-in)
- **Svelte** (built-in)

### Framework Template Structure
Each framework follows the same pattern:

```
component-name/
├── component-name.client.ts         # Client behavior + registration
├── component-name.styles.scss       # Styles (framework-agnostic)
└── component-name.view.[extension]  # View template (framework-specific)
```

### Client-side Registration
All component client files must include:
```typescript
// Register the client-side behavior with AssembleJS
BlueprintClient.registerComponentCodeBehind(ComponentClass);
```

### Framework Adapters
Each supported framework has a dedicated adapter that provides:
1. Server-side rendering
2. Client-side hydration
3. Sub-component rendering helpers
4. Framework-specific utilities