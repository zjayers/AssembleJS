# Development Setup

This guide will help you set up your development environment for AssembleJS projects. Follow these steps to ensure you have everything needed to build, test, and run your AssembleJS applications.

## Prerequisites

Before setting up an AssembleJS project, make sure you have the following installed:

- **Node.js** (version 16.x or later) - [Download Node.js](https://nodejs.org/)
- **npm** (included with Node.js) or **yarn** (optional alternative package manager)
- **Git** for version control - [Download Git](https://git-scm.com/)
- A code editor with TypeScript support (we recommend [Visual Studio Code](https://code.visualstudio.com/))

## Creating a New Project

### Using the AssembleJS CLI

The easiest way to get started is by using the AssembleJS CLI to generate a new project:

```bash
# Install the CLI globally (optional)
npm install -g asmbl

# Generate a new project using the CLI
npx asmgen
```

When prompted, select "Project" and follow the interactive prompts to configure your project.

### Manual Setup

If you prefer to set up a project manually, follow these steps:

1. Create a new directory for your project:

```bash
mkdir my-assemblejs-app
cd my-assemblejs-app
```

2. Initialize a new npm project:

```bash
npm init -y
```

3. Install AssembleJS and its dependencies:

```bash
npm install asmbl@next typescript fastify
```

4. Create a minimal TypeScript configuration (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment",
    "outDir": "dist",
    "sourceMap": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "lib": ["dom", "es2020"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

5. Create a basic project structure:

```bash
mkdir -p src/blueprints/home/welcome
mkdir -p src/components/header/main
```

6. Create a server entry point (`src/server.ts`):

```typescript
import { createBlueprintServer } from 'asmbl';
import viteDevServer from 'vavite/vite-dev-server';
import vaviteHttpServer from 'vavite/http-dev-server';

const server = createBlueprintServer({
  port: 3000,
  host: 'localhost',
  serverRoot: import.meta.url,
  componentDirs: ['./blueprints', './components'],
  // HTTP and development server configuration
  httpServer: vaviteHttpServer,
  devServer: viteDevServer
});

server.start().then(() => {
  console.log('Server running at http://localhost:3000');
});
```

## Project Structure

A typical AssembleJS project has the following structure:

```
my-assemblejs-app/
├── src/
│   ├── blueprints/      # Page blueprints (routes)
│   ├── components/      # Reusable UI components
│   ├── controllers/     # API controllers
│   ├── factories/       # Data fetching factories
│   ├── services/        # Shared services
│   └── server.ts        # Main server entry point
├── public/              # Static assets
├── tests/               # Test files
├── package.json         # Project configuration
└── tsconfig.json        # TypeScript configuration
```

## IDE Setup

### Visual Studio Code

VS Code provides excellent support for TypeScript and AssembleJS projects. We recommend the following extensions:

- **ESLint** - For linting
- **Prettier** - For code formatting
- **Debugger for Chrome** - For debugging client-side code
- **Jest Runner** - For running tests

Add a `.vscode/settings.json` file to your project with the following settings:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Linting and Formatting

Set up ESLint and Prettier for consistent code style:

```bash
npm install --save-dev eslint prettier typescript-eslint eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-prettier
```

Create an `.eslintrc.js` file:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ],
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'prettier/prettier': ['error']
  }
};
```

Create a `.prettierrc` file:

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

## Running the Project

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint "src/**/*.{ts,tsx}" --fix",
    "format": "prettier --write "src/**/*.{ts,tsx}""
  }
}
```

Install the development dependencies:

```bash
npm install --save-dev ts-node-dev typescript
```

To start the development server:

```bash
npm run dev
```

## Testing Setup

AssembleJS works well with Jest for testing. To set up Jest:

```bash
npm install --save-dev jest ts-jest @types/jest
```

Create a `jest.config.js` file:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
```

Add a test script to `package.json`:

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

## Debugging

### Server-Side Debugging

For debugging server-side code, add a `.vscode/launch.json` file:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Server",
      "program": "${workspaceFolder}/src/server.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true
    }
  ]
}
```

### Client-Side Debugging

For client-side debugging, use Chrome DevTools or add to your `.vscode/launch.json`:

```json
{
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## Next Steps

Now that your development environment is set up, you can:

1. Learn about the [Core Concepts](core-concepts-blueprints.md) of AssembleJS
2. Follow the [Development Workflow](development-workflow.md) guidelines
3. Explore the [API Reference](api/global.md) for detailed documentation

With this setup, you'll have a professional development environment for building AssembleJS applications.