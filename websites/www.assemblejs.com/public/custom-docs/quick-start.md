# Quick Start Guide

This guide will help you set up your first AssembleJS project and understand the basics of working with components, blueprints, and the AssembleJS architecture.

## Prerequisites

Before you start, make sure you have:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Basic familiarity with TypeScript and web development

## Creating Your First Project

### Step 1: Install the AssembleJS CLI

You can use AssembleJS without any global installation using `npx`:

```bash
# No installation needed - use npx to run the CLI
npx asm
```

If you prefer, you can install it globally:

```bash
npm install -g asmbl@next
```

### Step 2: Generate a New Project

Create a new AssembleJS project using the interactive generator:

```bash
# Start the generator
npx asmgen
```

When prompted:
1. Select "Project" from the list
2. Enter a name for your project (e.g., "my-assemblejs-app")
3. Choose your preferred options in the following prompts

### Step 3: Navigate to Your Project and Install Dependencies

```bash
# Navigate to your project directory
cd my-assemblejs-app

# Install dependencies
npm install
```

### Step 4: Start the Development Server

```bash
# Start the development server
npm run dev
```

This will launch your application at [http://localhost:3000](http://localhost:3000).

## Understanding the Project Structure

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
├── package.json
└── tsconfig.json
```

## Creating a Blueprint (Page)

Blueprints in AssembleJS represent pages or routes in your application.

```bash
# Generate a new blueprint
npx asmgen
```

When prompted:
1. Select "Blueprint" from the list
2. Set the name (e.g., "home")
3. Set the view name (e.g., "welcome")
4. Choose a UI framework (e.g., "preact")

This will generate three files:

```
src/blueprints/home/welcome/
├── welcome.client.ts    # Client-side behavior
├── welcome.styles.scss  # Component styling
└── welcome.view.tsx     # Component template
```

## Creating a Component

Components are reusable UI elements that can be included in blueprints.

```bash
# Generate a new component
npx asmgen
```

When prompted:
1. Select "Component" from the list
2. Set the name (e.g., "navigation")
3. Set the view name (e.g., "main")
4. Choose a UI framework (e.g., "html")
5. When asked if you want to add it to a blueprint, select "Yes" and choose your blueprint

This will generate:

```
src/components/navigation/main/
├── main.client.ts      # Client-side behavior
├── main.styles.scss    # Component styling
└── main.view.html      # HTML template
```

## Using Components in a Blueprint

Components can be included in blueprints using the context API:

```tsx
export function Welcome(context: PreactViewContext) {
  return (
    <div className="home-welcome">
      {/* Include the navigation component */}
      <context.component.navigation.main />
      
      <main>
        <h1>Welcome to AssembleJS</h1>
        <p>Your first AssembleJS application is running!</p>
      </main>
      
      {/* Include stylesheet and client script */}
      <link href="welcome.styles.scss" rel="stylesheet" />
      <script src="welcome.client.ts"></script>
    </div>
  );
}
```

## Creating a Data Factory

Factories fetch and prepare data for components on the server:

```bash
# Generate a new factory
npx asmgen
```

When prompted:
1. Select "Factory" from the list
2. Set the name (e.g., "user-data")
3. Choose which blueprint or component to add it to

This will generate a factory file:

```typescript
// src/factories/user-data.factory.ts
import { ComponentFactory, ServerContext } from 'asmbl';

export class UserDataFactory implements ComponentFactory {
  priority = 10;
  
  async factory(context: ServerContext): Promise<void> {
    // Fetch data from an API or database
    const userData = await fetchUserData();
    
    // Add it to the component's data context
    context.data.set('user', userData);
  }
}
```

## Building and Deploying

### Build for Production

```bash
# Create a production build
npm run build
```

### Start Production Server

```bash
# Start the production server
npm start
```

## Next Steps

Congratulations! You've created your first AssembleJS application. Here are some next steps to explore:

1. Learn about [Core Concepts](core-concepts/blueprints.md) in depth
2. Explore the [Architecture Overview](architecture-overview.md)
3. Try out the [Storefront Tutorial](tutorials/storefront.md)
4. Review the [API Reference](api/global.md)

Happy coding with AssembleJS!