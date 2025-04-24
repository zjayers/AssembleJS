# State Management

<iframe src="https://placeholder-for-assemblejs-state-management-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

## Overview

Managing application state effectively is crucial for building robust and maintainable applications. This cookbook demonstrates how to implement various state management patterns in AssembleJS applications, from simple component-level state to complex global state management systems.

## Prerequisites

- Basic knowledge of AssembleJS components and blueprints
- Understanding of JavaScript/TypeScript fundamentals
- Familiarity with event-driven programming concepts

## Implementation Steps

### Step 1: Create a Basic State Management Service

First, let's create a versatile state management service:

1. Use the CLI to generate a state service:

```bash
npx asm
# Select "Service" from the list
# Enter "state" as the name
# Follow the prompts
```

2. Implement the state service:

```typescript
// src/services/state.service.ts
import { Service } from 'asmbl';
import { events } from 'asmbl';

export type StateChangeListener<T = any> = (newValue: T, oldValue: T | undefined, path: string) => void;

export interface StateOptions {
  // Whether to persist state to localStorage
  persistent?: boolean;
  // Storage key if persistent is true
  storageKey?: string;
  // Whether to log state changes (useful for debugging)
  debug?: boolean;
}

export class StateService extends Service {
  private state: Record<string, any> = {};
  private listeners: Map<string, Set<StateChangeListener>> = new Map();
  private options: StateOptions;

  constructor(
    initialState: Record<string, any> = {},
    options: StateOptions = {}
  ) {
    super();
    this.options = {
      persistent: false,
      storageKey: 'asmbl_state',
      debug: false,
      ...options
    };
    
    // Initialize state
    this.state = this.loadState(initialState);
  }
  
  /**
   * Load initial state, potentially from localStorage if persistent option is enabled
   */
  private loadState(initialState: Record<string, any>): Record<string, any> {
    if (this.options.persistent && typeof window !== 'undefined') {
      try {
        const storedState = localStorage.getItem(this.options.storageKey || 'asmbl_state');
        if (storedState) {
          return { ...initialState, ...JSON.parse(storedState) };
        }
      } catch (error) {
        console.error('Error loading persisted state:', error);
      }
    }
    
    return { ...initialState };
  }
  
  /**
   * Save state to localStorage if persistent option is enabled
   */
  private saveState(): void {
    if (this.options.persistent && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          this.options.storageKey || 'asmbl_state',
          JSON.stringify(this.state)
        );
      } catch (error) {
        console.error('Error persisting state:', error);
      }
    }
  }
  
  /**
   * Get a value from state by path (e.g., 'user.profile.name')
   */
  get<T>(path: string, defaultValue?: T): T {
    const value = this.getNestedValue(this.state, path);
    return value !== undefined ? value : (defaultValue as T);
  }
  
  /**
   * Set a value in state by path
   */
  set<T>(path: string, value: T): void {
    const oldValue = this.get(path);
    
    // Skip if value is the same (by reference)
    if (value === oldValue) return;
    
    // Set value in state
    this.setNestedValue(this.state, path, value);
    
    // Debug log
    if (this.options.debug) {
      console.log(`[StateService] ${path} changed:`, oldValue, ' -> ', value);
    }
    
    // Notify listeners
    this.notifyListeners(path, value, oldValue);
    
    // Persist state if needed
    this.saveState();
  }
  
  /**
   * Update a part of the state (shallow merge)
   */
  update(path: string, value: Record<string, any>): void {
    const currentValue = this.get(path, {});
    
    if (typeof currentValue !== 'object' || currentValue === null) {
      throw new Error(`Cannot update non-object value at path: ${path}`);
    }
    
    this.set(path, { ...currentValue, ...value });
  }
  
  /**
   * Remove a value from state
   */
  remove(path: string): void {
    const segments = path.split('.');
    const lastSegment = segments.pop();
    
    if (!lastSegment) {
      throw new Error('Invalid path');
    }
    
    if (segments.length === 0) {
      // Top-level property
      const oldValue = this.state[lastSegment];
      delete this.state[lastSegment];
      
      // Debug log
      if (this.options.debug) {
        console.log(`[StateService] ${path} removed:`, oldValue);
      }
      
      // Notify listeners
      this.notifyListeners(path, undefined, oldValue);
      
      // Persist state if needed
      this.saveState();
    } else {
      // Nested property
      const parentPath = segments.join('.');
      const parent = this.get(parentPath);
      
      if (parent && typeof parent === 'object') {
        const oldValue = parent[lastSegment];
        delete parent[lastSegment];
        
        // Debug log
        if (this.options.debug) {
          console.log(`[StateService] ${path} removed:`, oldValue);
        }
        
        // Notify listeners
        this.notifyListeners(path, undefined, oldValue);
        
        // Persist state if needed
        this.saveState();
      }
    }
  }
  
  /**
   * Clear all state or state at a path
   */
  clear(path?: string): void {
    if (path) {
      this.set(path, typeof this.get(path) === 'object' ? {} : undefined);
    } else {
      const oldState = { ...this.state };
      this.state = {};
      
      // Debug log
      if (this.options.debug) {
        console.log('[StateService] State cleared:', oldState);
      }
      
      // Notify listeners for all paths
      for (const key of Object.keys(oldState)) {
        this.notifyListeners(key, undefined, oldState[key]);
      }
      
      // Persist state if needed
      this.saveState();
    }
  }
  
  /**
   * Subscribe to state changes at a specific path
   */
  subscribe<T>(path: string, listener: StateChangeListener<T>): () => void {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    
    this.listeners.get(path)!.add(listener as StateChangeListener);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(path);
      if (listeners) {
        listeners.delete(listener as StateChangeListener);
        if (listeners.size === 0) {
          this.listeners.delete(path);
        }
      }
    };
  }
  
  /**
   * Subscribe to all state changes
   */
  subscribeToAll(listener: (path: string, newValue: any, oldValue: any) => void): () => void {
    return this.subscribe('*', listener);
  }

  /**
   * Export the current state
   */
  getState(): Record<string, any> {
    return { ...this.state };
  }
  
  /**
   * Replace the entire state
   */
  setState(newState: Record<string, any>): void {
    const oldState = { ...this.state };
    this.state = { ...newState };
    
    // Debug log
    if (this.options.debug) {
      console.log('[StateService] State replaced:', oldState, ' -> ', this.state);
    }
    
    // Notify all relevant listeners
    const allPaths = [...new Set([
      ...Object.keys(oldState),
      ...Object.keys(this.state)
    ])];
    
    for (const path of allPaths) {
      if (oldState[path] !== this.state[path]) {
        this.notifyListeners(path, this.state[path], oldState[path]);
      }
    }
    
    // Notify global listeners
    this.notifyListeners('*', this.state, oldState);
    
    // Persist state if needed
    this.saveState();
  }
  
  /**
   * Notify listeners about state changes
   */
  private notifyListeners(path: string, newValue: any, oldValue: any): void {
    // Notify specific path listeners
    const listeners = this.listeners.get(path);
    if (listeners) {
      for (const listener of listeners) {
        listener(newValue, oldValue, path);
      }
    }
    
    // Notify parent path listeners (if a nested property changed)
    const segments = path.split('.');
    while (segments.length > 1) {
      segments.pop();
      const parentPath = segments.join('.');
      const parentListeners = this.listeners.get(parentPath);
      
      if (parentListeners) {
        const parentValue = this.get(parentPath);
        for (const listener of parentListeners) {
          listener(parentValue, parentValue, parentPath);
        }
      }
    }
    
    // Notify global listeners
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      for (const listener of globalListeners) {
        listener(newValue, oldValue, path);
      }
    }
    
    // Publish event
    events.publish({ channel: 'state', topic: `changed:${path}` }, { path, newValue, oldValue });
  }
  
  /**
   * Get a nested value from an object using a dot-notation path
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    if (!path) return undefined;
    
    const segments = path.split('.');
    let current = obj;
    
    for (const key of segments) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    
    return current;
  }
  
  /**
   * Set a nested value in an object using a dot-notation path
   */
  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    if (!path) return;
    
    const segments = path.split('.');
    const lastSegment = segments.pop();
    
    if (!lastSegment) return;
    
    let current = obj;
    
    // Ensure all parent objects exist
    for (const key of segments) {
      if (current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    // Set the value
    current[lastSegment] = value;
  }
}
```

### Step 2: Create a Counter Component

Let's create a simple counter component that uses our state service:

```bash
npx asm
# Select "Component" from the list
# Enter "examples/counter" as the name
# Follow the prompts
```

First, implement the factory:

```typescript
// src/components/examples/counter/counter.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { StateService } from '../../../services/state.service';

export class CounterFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    const stateService = context.services.get('stateService') as StateService;
    
    // Set initial counter value if it doesn't exist
    if (stateService.get('counter') === undefined) {
      stateService.set('counter', 0);
    }
    
    // Pass current counter value to the component
    context.data.set('count', stateService.get('counter'));
    
    // Pass state service to client-side
    context.data.set('stateService', stateService);
  }
}
```

Now, implement the view:

```tsx
// src/components/examples/counter/counter.view.tsx
import React, { useState, useEffect } from 'react';
import { StateService } from '../../../services/state.service';

interface CounterProps {
  data: {
    count: number;
    stateService: StateService;
  };
}

const Counter: React.FC<CounterProps> = ({ data }) => {
  const { stateService } = data;
  const [count, setCount] = useState(data.count);
  
  // Subscribe to counter state changes
  useEffect(() => {
    const unsubscribe = stateService.subscribe<number>('counter', (newValue) => {
      setCount(newValue);
    });
    
    return () => {
      unsubscribe();
    };
  }, [stateService]);
  
  // Handle increment
  const increment = () => {
    stateService.set('counter', count + 1);
  };
  
  // Handle decrement
  const decrement = () => {
    stateService.set('counter', count - 1);
  };
  
  // Handle reset
  const reset = () => {
    stateService.set('counter', 0);
  };
  
  return (
    <div className="counter">
      <h2>Counter Example</h2>
      <div className="counter-value">{count}</div>
      <div className="counter-controls">
        <button className="counter-button decrement" onClick={decrement}>-</button>
        <button className="counter-button reset" onClick={reset}>Reset</button>
        <button className="counter-button increment" onClick={increment}>+</button>
      </div>
    </div>
  );
};

export default Counter;
```

Add some styles for the counter component:

```scss
// src/components/examples/counter/counter.styles.scss
.counter {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  max-width: 300px;
  margin: 0 auto;
  
  h2 {
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
  }
  
  .counter-value {
    font-size: 48px;
    font-weight: bold;
    color: #0066cc;
    margin-bottom: 20px;
  }
  
  .counter-controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    
    .counter-button {
      background-color: #f1f1f1;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 18px;
      color: #333;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: #e0e0e0;
      }
      
      &.increment {
        background-color: #4caf50;
        color: white;
        
        &:hover {
          background-color: #43a047;
        }
      }
      
      &.decrement {
        background-color: #f44336;
        color: white;
        
        &:hover {
          background-color: #e53935;
        }
      }
      
      &.reset {
        background-color: #2196f3;
        color: white;
        
        &:hover {
          background-color: #1e88e5;
        }
      }
    }
  }
}
```

### Step 3: Create a Todo List Component

Now, let's create a more complex component that manages a list of todos using our state service:

```bash
npx asm
# Select "Component" from the list
# Enter "examples/todo-list" as the name
# Follow the prompts
```

First, implement the factory:

```typescript
// src/components/examples/todo-list/todo-list.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { StateService } from '../../../services/state.service';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export class TodoListFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    const stateService = context.services.get('stateService') as StateService;
    
    // Initialize todos if they don't exist
    if (stateService.get('todos') === undefined) {
      stateService.set('todos', [
        {
          id: '1',
          text: 'Learn AssembleJS',
          completed: false,
          createdAt: Date.now()
        },
        {
          id: '2',
          text: 'Build an app with state management',
          completed: false,
          createdAt: Date.now()
        }
      ]);
    }
    
    // Pass current todos to the component
    context.data.set('todos', stateService.get<Todo[]>('todos'));
    
    // Pass state service to client-side
    context.data.set('stateService', stateService);
  }
}
```

Now, implement the view:

```tsx
// src/components/examples/todo-list/todo-list.view.tsx
import React, { useState, useEffect } from 'react';
import { StateService } from '../../../services/state.service';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface TodoListProps {
  data: {
    todos: Todo[];
    stateService: StateService;
  };
}

const TodoList: React.FC<TodoListProps> = ({ data }) => {
  const { stateService } = data;
  const [todos, setTodos] = useState<Todo[]>(data.todos || []);
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // Subscribe to todos state changes
  useEffect(() => {
    const unsubscribe = stateService.subscribe<Todo[]>('todos', (newTodos) => {
      setTodos(newTodos || []);
    });
    
    return () => {
      unsubscribe();
    };
  }, [stateService]);
  
  // Add a new todo
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTodoText.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: Date.now()
    };
    
    stateService.set('todos', [...todos, newTodo]);
    setNewTodoText('');
  };
  
  // Toggle todo completion status
  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    
    stateService.set('todos', updatedTodos);
  };
  
  // Delete a todo
  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    stateService.set('todos', updatedTodos);
  };
  
  // Clear completed todos
  const clearCompleted = () => {
    const updatedTodos = todos.filter(todo => !todo.completed);
    stateService.set('todos', updatedTodos);
  };
  
  // Filter todos based on completion status
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  // Count active todos
  const activeTodoCount = todos.filter(todo => !todo.completed).length;
  
  return (
    <div className="todo-list">
      <h2>Todo List</h2>
      
      <form className="todo-form" onSubmit={addTodo}>
        <input
          type="text"
          className="todo-input"
          placeholder="What needs to be done?"
          value={newTodoText}
          onChange={e => setNewTodoText(e.target.value)}
        />
        <button type="submit" className="todo-add-button">Add</button>
      </form>
      
      {todos.length > 0 && (
        <>
          <ul className="todos">
            {filteredTodos.map(todo => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  className="todo-checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span className="todo-text">{todo.text}</span>
                <button 
                  className="todo-delete-button"
                  onClick={() => deleteTodo(todo.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          
          <div className="todo-footer">
            <span className="todo-count">
              {activeTodoCount} item{activeTodoCount !== 1 ? 's' : ''} left
            </span>
            
            <div className="todo-filters">
              <button 
                className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-button ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
              <button 
                className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
            
            <button 
              className="clear-completed-button"
              onClick={clearCompleted}
              disabled={todos.every(todo => !todo.completed)}
            >
              Clear completed
            </button>
          </div>
        </>
      )}
      
      {todos.length === 0 && (
        <div className="empty-state">
          <p>No todos yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
};

export default TodoList;
```

Add some styles for the todo list component:

```scss
// src/components/examples/todo-list/todo-list.styles.scss
.todo-list {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
  
  h2 {
    font-size: 24px;
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }
  
  .todo-form {
    display: flex;
    margin-bottom: 20px;
    
    .todo-input {
      flex: 1;
      padding: 10px 15px;
      font-size: 16px;
      border: 1px solid #ddd;
      border-radius: 4px 0 0 4px;
      outline: none;
      
      &:focus {
        border-color: #0066cc;
      }
    }
    
    .todo-add-button {
      background-color: #0066cc;
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      padding: 0 20px;
      font-size: 16px;
      cursor: pointer;
      
      &:hover {
        background-color: #0055aa;
      }
    }
  }
  
  .todos {
    list-style: none;
    padding: 0;
    margin: 0 0 20px 0;
    
    .todo-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      &.completed .todo-text {
        text-decoration: line-through;
        color: #999;
      }
      
      .todo-checkbox {
        margin-right: 10px;
        height: 18px;
        width: 18px;
      }
      
      .todo-text {
        flex: 1;
        font-size: 16px;
        color: #333;
      }
      
      .todo-delete-button {
        background: none;
        border: none;
        color: #f44336;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.2s;
        padding: 0 8px;
        
        &:hover {
          opacity: 1;
        }
      }
    }
  }
  
  .todo-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #eee;
    font-size: 14px;
    color: #777;
    
    .todo-count {
      flex: 1;
    }
    
    .todo-filters {
      display: flex;
      gap: 5px;
      
      .filter-button {
        background: none;
        border: 1px solid transparent;
        padding: 3px 8px;
        border-radius: 3px;
        color: #777;
        cursor: pointer;
        
        &:hover {
          border-color: #ddd;
        }
        
        &.active {
          border-color: #0066cc;
          color: #0066cc;
        }
      }
    }
    
    .clear-completed-button {
      background: none;
      border: none;
      color: #777;
      cursor: pointer;
      margin-left: 10px;
      
      &:hover {
        text-decoration: underline;
      }
      
      &:disabled {
        color: #ccc;
        cursor: default;
        text-decoration: none;
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 30px 0;
    color: #999;
    font-style: italic;
  }
}
```

### Step 4: Create a State Management Demo Blueprint

Let's create a blueprint to showcase the state management capabilities:

```bash
npx asm
# Select "Blueprint" from the list
# Enter "state-management-demo" as the name
# Follow the prompts
```

Implement the blueprint view:

```tsx
// src/blueprints/state-management-demo/main/main.view.tsx
import React from 'react';

const StateManagementDemo: React.FC = () => {
  return (
    <div className="state-management-demo">
      <header className="header">
        <h1>State Management in AssembleJS</h1>
        <p>Demonstrating different ways to manage application state</p>
      </header>
      
      <main className="main-content">
        <section className="demo-section">
          <h2>Simple Counter</h2>
          <p>This component demonstrates basic state management with a counter.</p>
          <div className="counter-container" data-component="examples/counter"></div>
        </section>
        
        <section className="demo-section">
          <h2>Todo List</h2>
          <p>This component demonstrates more complex state management with a todo list.</p>
          <div className="todo-list-container" data-component="examples/todo-list"></div>
        </section>
        
        <section className="demo-section">
          <h2>Shared State</h2>
          <p>These counters share the same state. Updating one updates both.</p>
          <div className="shared-state-container">
            <div className="counter-container" data-component="examples/counter"></div>
            <div className="counter-container" data-component="examples/counter"></div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StateManagementDemo;
```

Add some styles for the demo blueprint:

```scss
// src/blueprints/state-management-demo/main/main.styles.scss
.state-management-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  .header {
    text-align: center;
    margin-bottom: 40px;
    
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    
    p {
      color: #666;
    }
  }
  
  .demo-section {
    margin-bottom: 50px;
    
    h2 {
      color: #333;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    
    p {
      color: #666;
      margin-bottom: 20px;
    }
  }
  
  .shared-state-container {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
    
    .counter-container {
      flex: 1;
      min-width: 250px;
    }
  }
}
```

### Step 5: Create a Redux-like State Container

For more complex applications, let's create a Redux-like state container:

```bash
npx asm
# Select "Service" from the list
# Enter "store" as the name
# Follow the prompts
```

Implement the store service:

```typescript
// src/services/store.service.ts
import { Service } from 'asmbl';
import { events } from 'asmbl';

export type Reducer<S = any, A = any> = (state: S, action: A) => S;
export type Dispatch<A = any> = (action: A) => void;
export type Selector<S = any, R = any> = (state: S) => R;
export type Listener = () => void;
export type Middleware<S = any, A = any> = (store: Store<S, A>) => 
  (next: Dispatch<A>) => (action: A) => void;
export type Enhancer<S = any, A = any> = (createStore: any) => 
  (reducer: Reducer<S, A>, initialState: S) => Store<S, A>;

export interface Action<T = string> {
  type: T;
  [key: string]: any;
}

export class Store<S = any, A extends Action = Action> extends Service {
  private state: S;
  private reducer: Reducer<S, A>;
  private listeners: Set<Listener> = new Set();
  private middleware: Middleware<S, A>[] = [];
  private isDispatching: boolean = false;

  constructor(
    reducer: Reducer<S, A>,
    initialState: S,
    enhancer?: Enhancer<S, A>
  ) {
    super();
    
    if (typeof enhancer === 'function') {
      return enhancer(this.constructor as any)(reducer, initialState) as any;
    }
    
    this.reducer = reducer;
    this.state = initialState;
  }
  
  /**
   * Get the current state
   */
  getState(): S {
    if (this.isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing.'
      );
    }
    
    return this.state;
  }
  
  /**
   * Dispatch an action to update state
   */
  dispatch(action: A): A {
    if (this.isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }
    
    try {
      this.isDispatching = true;
      
      // Apply middleware
      if (this.middleware.length > 0) {
        const middlewareChain = this.middleware.map(middleware => middleware(this));
        const dispatch = middlewareChain.reduce(
          (next, middleware) => middleware(next),
          this.baseDispatch.bind(this)
        );
        
        return dispatch(action);
      }
      
      return this.baseDispatch(action);
    } finally {
      this.isDispatching = false;
    }
  }
  
  /**
   * Base dispatch implementation
   */
  private baseDispatch(action: A): A {
    const previousState = this.state;
    
    try {
      this.state = this.reducer(this.state, action);
    } catch (error) {
      console.error('Error in reducer:', error);
      throw error;
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener());
    
    // Publish event
    events.publish({ channel: 'store', topic: 'state:changed' }, {
      previousState,
      currentState: this.state,
      action
    });
    
    return action;
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener: Listener): () => void {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }
    
    if (this.isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing.'
      );
    }
    
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      if (this.isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing.'
        );
      }
      
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Replace the reducer
   */
  replaceReducer(nextReducer: Reducer<S, A>): void {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }
    
    this.reducer = nextReducer;
    
    // Dispatch a special action to notify that the reducer has been replaced
    this.dispatch({ type: '@@store/INIT' } as A);
  }
  
  /**
   * Apply middleware
   */
  applyMiddleware(...middleware: Middleware<S, A>[]): void {
    this.middleware = middleware;
  }
  
  /**
   * Select a part of the state using a selector function
   */
  select<R>(selector: Selector<S, R>): R {
    return selector(this.getState());
  }
}

/**
 * Combine multiple reducers into a single reducer
 */
export function combineReducers<S, A extends Action = Action>(
  reducers: Record<keyof S, Reducer<any, A>>
): Reducer<S, A> {
  const reducerKeys = Object.keys(reducers) as Array<keyof S>;
  
  return (state: S = {} as S, action: A): S => {
    let hasChanged = false;
    const nextState: Partial<S> = {};
    
    for (const key of reducerKeys) {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    
    return hasChanged ? (nextState as S) : state;
  };
}
```

### Step 6: Create a Todo App Using the Store

Let's implement a more advanced todo application using our Redux-like store:

```bash
npx asm
# Select "Component" from the list
# Enter "examples/redux-todo" as the name
# Follow the prompts
```

First, create the todo reducer:

```typescript
// src/components/examples/redux-todo/todo.reducer.ts
import { Action } from '../../../services/store.service';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  loading: boolean;
  error: string | null;
}

export enum TodoActionType {
  ADD_TODO = 'todos/add',
  TOGGLE_TODO = 'todos/toggle',
  DELETE_TODO = 'todos/delete',
  CLEAR_COMPLETED = 'todos/clearCompleted',
  SET_FILTER = 'todos/setFilter',
  LOAD_TODOS = 'todos/load',
  LOAD_TODOS_SUCCESS = 'todos/loadSuccess',
  LOAD_TODOS_FAILURE = 'todos/loadFailure'
}

export interface TodoAction extends Action<TodoActionType> {
  payload?: any;
}

// Action creators
export const addTodo = (text: string): TodoAction => ({
  type: TodoActionType.ADD_TODO,
  payload: {
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: Date.now()
  }
});

export const toggleTodo = (id: string): TodoAction => ({
  type: TodoActionType.TOGGLE_TODO,
  payload: { id }
});

export const deleteTodo = (id: string): TodoAction => ({
  type: TodoActionType.DELETE_TODO,
  payload: { id }
});

export const clearCompleted = (): TodoAction => ({
  type: TodoActionType.CLEAR_COMPLETED
});

export const setFilter = (filter: 'all' | 'active' | 'completed'): TodoAction => ({
  type: TodoActionType.SET_FILTER,
  payload: { filter }
});

// Selectors
export const selectTodos = (state: TodoState) => state.todos;
export const selectFilter = (state: TodoState) => state.filter;
export const selectFilteredTodos = (state: TodoState) => {
  const { todos, filter } = state;
  
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
};
export const selectActiveTodoCount = (state: TodoState) => 
  state.todos.filter(todo => !todo.completed).length;

// Initial state
export const initialTodoState: TodoState = {
  todos: [
    {
      id: '1',
      text: 'Learn AssembleJS Store',
      completed: false,
      createdAt: Date.now()
    },
    {
      id: '2',
      text: 'Build a Redux-like app',
      completed: false,
      createdAt: Date.now()
    }
  ],
  filter: 'all',
  loading: false,
  error: null
};

// Reducer
export function todoReducer(
  state: TodoState = initialTodoState,
  action: TodoAction
): TodoState {
  switch (action.type) {
    case TodoActionType.ADD_TODO:
      return {
        ...state,
        todos: [...state.todos, action.payload]
      };
      
    case TodoActionType.TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
      
    case TodoActionType.DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id)
      };
      
    case TodoActionType.CLEAR_COMPLETED:
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      };
      
    case TodoActionType.SET_FILTER:
      return {
        ...state,
        filter: action.payload.filter
      };
      
    case TodoActionType.LOAD_TODOS:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case TodoActionType.LOAD_TODOS_SUCCESS:
      return {
        ...state,
        todos: action.payload,
        loading: false
      };
      
    case TodoActionType.LOAD_TODOS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    default:
      return state;
  }
}
```

Now, implement the factory:

```typescript
// src/components/examples/redux-todo/redux-todo.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { Store } from '../../../services/store.service';
import { TodoState, todoReducer, initialTodoState } from './todo.reducer';

export class ReduxTodoFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    const store = context.services.get('todoStore') as Store<TodoState>;
    
    if (!store) {
      console.error('TodoStore not found in services');
      return;
    }
    
    // Pass store to client-side
    context.data.set('store', store);
    
    // Pass initial state to the component
    context.data.set('initialState', store.getState());
  }
}
```

Finally, implement the view:

```tsx
// src/components/examples/redux-todo/redux-todo.view.tsx
import React, { useState, useEffect } from 'react';
import { Store } from '../../../services/store.service';
import {
  TodoState,
  Todo,
  addTodo,
  toggleTodo,
  deleteTodo,
  clearCompleted,
  setFilter,
  selectFilteredTodos,
  selectActiveTodoCount,
  selectFilter
} from './todo.reducer';

interface ReduxTodoProps {
  data: {
    store: Store<TodoState>;
    initialState: TodoState;
  };
}

const ReduxTodo: React.FC<ReduxTodoProps> = ({ data }) => {
  const { store } = data;
  const [newTodoText, setNewTodoText] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilterState] = useState<'all' | 'active' | 'completed'>('all');
  const [activeTodoCount, setActiveTodoCount] = useState(0);
  
  // Subscribe to store changes
  useEffect(() => {
    // Update initial state
    setTodos(store.select(selectFilteredTodos));
    setFilterState(store.select(selectFilter));
    setActiveTodoCount(store.select(selectActiveTodoCount));
    
    // Subscribe to store changes
    const unsubscribe = store.subscribe(() => {
      setTodos(store.select(selectFilteredTodos));
      setFilterState(store.select(selectFilter));
      setActiveTodoCount(store.select(selectActiveTodoCount));
    });
    
    return unsubscribe;
  }, [store]);
  
  // Add a new todo
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTodoText.trim()) return;
    
    store.dispatch(addTodo(newTodoText.trim()));
    setNewTodoText('');
  };
  
  // Toggle todo completion status
  const handleToggleTodo = (id: string) => {
    store.dispatch(toggleTodo(id));
  };
  
  // Delete a todo
  const handleDeleteTodo = (id: string) => {
    store.dispatch(deleteTodo(id));
  };
  
  // Clear completed todos
  const handleClearCompleted = () => {
    store.dispatch(clearCompleted());
  };
  
  // Change filter
  const handleFilterChange = (newFilter: 'all' | 'active' | 'completed') => {
    store.dispatch(setFilter(newFilter));
  };
  
  return (
    <div className="redux-todo">
      <h2>Redux-like Todo List</h2>
      
      <form className="todo-form" onSubmit={handleAddTodo}>
        <input
          type="text"
          className="todo-input"
          placeholder="What needs to be done?"
          value={newTodoText}
          onChange={e => setNewTodoText(e.target.value)}
        />
        <button type="submit" className="todo-add-button">Add</button>
      </form>
      
      {todos.length > 0 ? (
        <>
          <ul className="todos">
            {todos.map(todo => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  className="todo-checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                />
                <span className="todo-text">{todo.text}</span>
                <button 
                  className="todo-delete-button"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          
          <div className="todo-footer">
            <span className="todo-count">
              {activeTodoCount} item{activeTodoCount !== 1 ? 's' : ''} left
            </span>
            
            <div className="todo-filters">
              <button 
                className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button 
                className={`filter-button ${filter === 'active' ? 'active' : ''}`}
                onClick={() => handleFilterChange('active')}
              >
                Active
              </button>
              <button 
                className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => handleFilterChange('completed')}
              >
                Completed
              </button>
            </div>
            
            <button 
              className="clear-completed-button"
              onClick={handleClearCompleted}
              disabled={activeTodoCount === todos.length}
            >
              Clear completed
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>No todos match the current filter.</p>
        </div>
      )}
    </div>
  );
};

export default ReduxTodo;
```

Add the Redux todo to the demo blueprint:

```tsx
// Add to src/blueprints/state-management-demo/main/main.view.tsx
<section className="demo-section">
  <h2>Redux-like State Container</h2>
  <p>This component demonstrates a Redux-like state management pattern.</p>
  <div className="redux-todo-container" data-component="examples/redux-todo"></div>
</section>
```

### Step 7: Register Services, Components, and Blueprints

Update your server.ts to include all the new services, components, and blueprints:

```typescript
// src/server.ts
import { createBlueprintServer, EventBus } from "asmbl";
import { StateService } from "./services/state.service";
import { Store } from "./services/store.service";
import { TodoState, todoReducer, initialTodoState } from "./components/examples/redux-todo/todo.reducer";
import { CounterFactory } from "./components/examples/counter/counter.factory";
import { TodoListFactory } from "./components/examples/todo-list/todo-list.factory";
import { ReduxTodoFactory } from "./components/examples/redux-todo/redux-todo.factory";

// Create state service
const stateService = new StateService(
  {
    counter: 0,
    todos: []
  },
  {
    persistent: true,
    debug: true
  }
);

// Create store for Redux example
const todoStore = new Store<TodoState>(
  todoReducer,
  initialTodoState
);

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'examples/counter',
        views: [{
          viewName: 'default',
          templateFile: 'counter.view.tsx',
          factory: new CounterFactory()
        }]
      },
      {
        path: 'examples/todo-list',
        views: [{
          viewName: 'default',
          templateFile: 'todo-list.view.tsx',
          factory: new TodoListFactory()
        }]
      },
      {
        path: 'examples/redux-todo',
        views: [{
          viewName: 'default',
          templateFile: 'redux-todo.view.tsx',
          factory: new ReduxTodoFactory()
        }]
      }
    ],
    blueprints: [
      {
        path: 'state-management-demo',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/state-management-demo'
        }]
      }
    ],
    services: [
      {
        name: 'stateService',
        service: stateService
      },
      {
        name: 'todoStore',
        service: todoStore
      }
    ]
  }
});
```

## Advanced Topics

### Creating a Custom Hook for State Access

To make state usage more convenient in React components, create a custom hook:

```typescript
// src/hooks/use-state-service.ts
import { useState, useEffect } from 'react';
import { StateService } from '../services/state.service';

export function useStateService<T>(
  stateService: StateService,
  path: string,
  defaultValue?: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(stateService.get<T>(path, defaultValue));
  
  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = stateService.subscribe<T>(path, (newValue) => {
      setValue(newValue);
    });
    
    return unsubscribe;
  }, [stateService, path]);
  
  // Create setter function
  const setStateValue = (newValue: T) => {
    stateService.set(path, newValue);
  };
  
  return [value, setStateValue];
}
```

### Implementing State Middleware for Logging

Add middleware support to track state changes:

```typescript
// src/services/state-logger.service.ts
import { Service } from 'asmbl';
import { StateService } from './state.service';

export class StateLoggerService extends Service {
  private stateService: StateService;
  
  constructor(stateService: StateService) {
    super();
    this.stateService = stateService;
    this.setupLogging();
  }
  
  private setupLogging(): void {
    // Subscribe to all state changes
    this.stateService.subscribeToAll((path, newValue, oldValue) => {
      console.group(`%c State Change: ${path}`, 'color: #9E9E9E; font-weight: bold');
      console.log('%c Previous', 'color: #9E9E9E; font-weight: bold', oldValue);
      console.log('%c Current', 'color: #47B04B; font-weight: bold', newValue);
      console.groupEnd();
    });
  }
}
```

### Implementing Undo/Redo Functionality

Add history tracking for state changes to enable undo/redo:

```typescript
// src/services/state-history.service.ts
import { Service } from 'asmbl';
import { StateService } from './state.service';

interface StateHistoryEntry {
  state: Record<string, any>;
  timestamp: number;
}

export class StateHistoryService extends Service {
  private stateService: StateService;
  private history: StateHistoryEntry[] = [];
  private future: StateHistoryEntry[] = [];
  private maxHistorySize: number;
  private isPerformingAction: boolean = false;

  constructor(stateService: StateService, maxHistorySize: number = 50) {
    super();
    this.stateService = stateService;
    this.maxHistorySize = maxHistorySize;
    
    // Save initial state
    this.history.push({
      state: { ...stateService.getState() },
      timestamp: Date.now()
    });
    
    // Set up history tracking
    this.setupTracking();
  }
  
  private setupTracking(): void {
    // Subscribe to all state changes
    this.stateService.subscribeToAll(() => {
      // Don't record history for undo/redo operations
      if (this.isPerformingAction) return;
      
      // Add current state to history
      this.history.push({
        state: { ...this.stateService.getState() },
        timestamp: Date.now()
      });
      
      // Clear future when new changes are made
      this.future = [];
      
      // Limit history size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      }
    });
  }
  
  canUndo(): boolean {
    return this.history.length > 1;
  }
  
  canRedo(): boolean {
    return this.future.length > 0;
  }
  
  undo(): boolean {
    if (!this.canUndo()) return false;
    
    // Get current state and move to future
    const current = this.history.pop()!;
    this.future.push(current);
    
    // Apply previous state
    const previous = this.history[this.history.length - 1];
    this.isPerformingAction = true;
    this.stateService.setState(previous.state);
    this.isPerformingAction = false;
    
    return true;
  }
  
  redo(): boolean {
    if (!this.canRedo()) return false;
    
    // Get next state from future
    const next = this.future.pop()!;
    
    // Apply next state and add to history
    this.isPerformingAction = true;
    this.stateService.setState(next.state);
    this.isPerformingAction = false;
    
    this.history.push(next);
    
    return true;
  }
  
  getHistorySize(): number {
    return this.history.length;
  }
  
  getFutureSize(): number {
    return this.future.length;
  }
  
  clearHistory(): void {
    // Keep current state
    const currentState = { ...this.stateService.getState() };
    
    this.history = [{
      state: currentState,
      timestamp: Date.now()
    }];
    
    this.future = [];
  }
}
```

## Conclusion

This cookbook has demonstrated how to implement various state management patterns in AssembleJS applications. We've covered basic component-level state management, shared state across components, and complex global state management with a Redux-like store.

By following these patterns, you can build applications with clean and maintainable state management that fits your application's complexity. The basic StateService is great for simpler applications or components, while the Redux-like Store provides a more structured approach for complex applications with many state interactions.

Effective state management is crucial for building robust applications, and AssembleJS provides the flexibility to implement different state management patterns based on your specific needs.