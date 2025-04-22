# AssembleJS Development Guide

## Project Overview
AssembleJS is a modern micro-frontend framework for building distributed component-based UIs. It enables teams to work independently while creating a cohesive user experience by managing the compilation, bundling, and serving of UI components in a distributed architecture.

## Branding Standards

### Official Names
- **Product Name**: AssembleJS
- **GitHub Repository**: zjayers/assemblejs
- **npm Package Name**: asmbl
  - Package imports: `import { ... } from "asmbl"`
  - CLI installation: `npm install -g asmbl`

### Terminology
| Term | Description |
|------|-------------|
| Blueprint | Top-level page/screen composition (formerly "mesh") |
| Component | Reusable UI element (formerly "face") |
| Factory | Data transformation logic (formerly "preprocessor") |

### CLI Commands
- Standard prefix: `asm-*` (asm-build, asm-serve, etc.)
- Generator command: `asmgen` for scaffolding operations

### Environment Variables
- Official prefix: `ASSEMBLEJS_*`

## Architecture

### Core Components
- **BlueprintClient**: Handles client-side registration and initialization
- **BlueprintController**: Manages server-side routing and rendering
- **Component Renderers**: Specialized renderers for different templating systems
- **Factory System**: For server-side data fetching
- **Event Bus**: For component communication

### Project Structure
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

### Component Structure
Each component consists of:
1. **View File** (.view.tsx, .view.ejs, etc.) - The template
2. **Client File** (.client.ts) - Client-side behavior
3. **Styles File** (.styles.scss) - Component styling

## Framework Support

AssembleJS supports multiple UI frameworks with a consistent structure:

### Supported Frameworks
- **Preact** (built-in)
- **React** (built-in)
- **Vue** (built-in)
- **Svelte** (built-in)

## Best Practices

### 1. Event System
Use AssembleJS event system:
```typescript
events.emit('eventName', data);
events.on('eventName', callback);
events.off('eventName', callback);
```

### 2. Strongly Typed Components
```typescript
export class MyComponent extends Blueprint<MyPublicData, MyParams> {
  // Type-safe access to this.publicData and this.context.params
}
```

### 3. Server-side Parameter Handling
```typescript
protected override async onRequest(req: ApiRequest): Promise<void> {
  super.onRequest(req);
  req.componentParams = req.componentParams || {};
  req.componentParams.filter = req.query.filter || 'default';
}
```

### 4. Client-side Registration
```typescript
// Register the client-side behavior with AssembleJS
BlueprintClient.registerComponentCodeBehind(ComponentClass);
```

## Development Workflow

1. Create a project: `npx asmgen project my-project`
2. Add components: `npx asmgen component my-component`
3. Add blueprints: `npx asmgen blueprint my-blueprint`
4. Start development server: `npm run dev`
5. Build for production: `npm run build`

## Current Development Priorities

### High Priority
- Update dependencies (Fastify, TypeScript, Vite, Axios)
- Fix ESM compatibility issues
- Improve CLI command processing

### Next Steps
- Website Development (assemblejs.com)
- Visual Designer Implementation
- Additional Examples and Testbeds