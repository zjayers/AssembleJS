# Real-time Updates

<iframe src="https://placeholder-for-assemblejs-real-time-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

## Overview

Real-time features are essential for modern, interactive web applications. This cookbook demonstrates how to implement WebSockets, Server-Sent Events, and other real-time communication patterns in AssembleJS applications.

## Prerequisites

- Basic knowledge of AssembleJS components and blueprints
- Understanding of asynchronous JavaScript
- Familiarity with WebSockets or Server-Sent Events concepts

## Implementation Steps

### Step 1: Create a WebSocket Service

First, let's create a service to manage WebSocket connections:

1. Use the CLI to generate a WebSocket service:

```bash
npx asm
# Select "Service" from the list
# Enter "websocket" as the name
# Follow the prompts
```

2. Implement the WebSocket service:

```typescript
// src/services/websocket.service.ts
import { Service } from 'asmbl';
import { events } from 'asmbl';

type MessageHandler = (data: any) => void;
type ConnectionHandler = () => void;

export class WebSocketService extends Service {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionHandlers: {
    onConnect: Set<ConnectionHandler>;
    onDisconnect: Set<ConnectionHandler>;
    onError: Set<(error: Event) => void>;
  } = {
    onConnect: new Set(),
    onDisconnect: new Set(),
    onError: new Set()
  };

  constructor(url: string) {
    super();
    this.url = url;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    try {
      this.socket = new WebSocket(this.url);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
    this.socket.close();
    this.socket = null;
  }

  /**
   * Send a message to the WebSocket server
   */
  send(type: string, data: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    try {
      const message = JSON.stringify({ type, data });
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  /**
   * Subscribe to a specific message type
   */
  on(messageType: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }

    this.messageHandlers.get(messageType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(messageType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(messageType);
        }
      }
    };
  }

  /**
   * Register connection event handlers
   */
  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.onConnect.add(handler);
    return () => this.connectionHandlers.onConnect.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.onDisconnect.add(handler);
    return () => this.connectionHandlers.onDisconnect.delete(handler);
  }

  onError(handler: (error: Event) => void): () => void {
    this.connectionHandlers.onError.add(handler);
    return () => this.connectionHandlers.onError.delete(handler);
  }

  /**
   * Check if the WebSocket is connected
   */
  isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  private handleOpen(event: Event): void {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    
    // Notify connection handlers
    this.connectionHandlers.onConnect.forEach(handler => handler());
    
    // Publish event to event bus
    this.events.publish('websocket:connected', {});
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const { type, data } = JSON.parse(event.data);
      
      // Notify specific message handlers
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.forEach(handler => handler(data));
      }
      
      // Publish to event bus
      this.events.publish(`websocket:message:${type}`, data);
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
    
    // Notify disconnect handlers
    this.connectionHandlers.onDisconnect.forEach(handler => handler());
    
    // Publish event to event bus
    this.events.publish('websocket:disconnected', { 
      code: event.code, 
      reason: event.reason 
    });
    
    this.socket = null;
    this.attemptReconnect();
  }

  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    
    // Notify error handlers
    this.connectionHandlers.onError.forEach(handler => handler(event));
    
    // Publish event to event bus
    this.events.publish('websocket:error', { event });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }
}
```

### Step 2: Create a Server-Sent Events Service

Let's also create a service for SSE, which is useful for one-way real-time updates:

```bash
npx asm
# Select "Service" from the list
# Enter "sse" as the name
# Follow the prompts
```

Implement the SSE service:

```typescript
// src/services/sse.service.ts
import { Service } from 'asmbl';
import { events } from 'asmbl';

type EventHandler = (data: any) => void;

export class SSEService extends Service {
  private eventSource: EventSource | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();

  constructor(url: string) {
    super();
    this.url = url;
  }

  /**
   * Connect to the SSE endpoint
   */
  connect(): void {
    if (this.eventSource) {
      console.log('EventSource already connected');
      return;
    }

    try {
      this.eventSource = new EventSource(this.url);
      
      this.eventSource.onopen = this.handleOpen.bind(this);
      this.eventSource.onerror = this.handleError.bind(this);
      
      // Listen for message event
      this.eventSource.addEventListener('message', this.handleMessage.bind(this));
      
      // Set up reconnection mechanism
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('EventSource connection error:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from the SSE endpoint
   */
  disconnect(): void {
    if (!this.eventSource) {
      return;
    }

    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
    this.eventSource.close();
    this.eventSource = null;
  }

  /**
   * Subscribe to a specific event type
   */
  on(eventType: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
      
      // Add event listener for this type if EventSource exists
      if (this.eventSource) {
        this.eventSource.addEventListener(eventType, (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            this.handleEventData(eventType, data);
          } catch (error) {
            console.error(`Error parsing SSE '${eventType}' event data:`, error);
          }
        });
      }
    }

    this.eventHandlers.get(eventType)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventType);
        }
      }
    };
  }

  /**
   * Check if the SSE connection is active
   */
  isConnected(): boolean {
    return !!this.eventSource && this.eventSource.readyState === EventSource.OPEN;
  }

  private handleOpen(event: Event): void {
    console.log('SSE connected');
    this.reconnectAttempts = 0;
    
    // Publish event to event bus
    this.events.publish('sse:connected', {});
  }

  private handleError(event: Event): void {
    console.error('SSE error:', event);
    
    // Publish event to event bus
    this.events.publish('sse:error', { event });
    
    // If the connection is closed, attempt to reconnect
    if (this.eventSource && this.eventSource.readyState === EventSource.CLOSED) {
      this.eventSource = null;
      this.attemptReconnect();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.handleEventData('message', data);
    } catch (error) {
      console.error('Error parsing SSE message data:', error);
    }
  }

  private handleEventData(type: string, data: any): void {
    // Notify specific event handlers
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
    
    // Publish to event bus
    this.events.publish(`sse:event:${type}`, data);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = 1000 * Math.pow(1.5, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }
}
```

### Step 3: Register the Services

Register these services in your server.ts file:

```typescript
// src/server.ts
import { createBlueprintServer, EventBus } from "asmbl";
import { WebSocketService } from "./services/websocket.service";
import { SSEService } from "./services/sse.service";

// Create an event bus instance
const eventBus = new EventBus();

// Create WebSocket and SSE services
const wsService = new WebSocketService('wss://your-websocket-server.com', eventBus);
const sseService = new SSEService('https://your-sse-endpoint.com/events', eventBus);

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [],
    services: [
      {
        name: 'eventBus',
        service: eventBus
      },
      {
        name: 'wsService',
        service: wsService
      },
      {
        name: 'sseService',
        service: sseService
      }
    ]
  }
});
```

### Step 4: Create a Real-time Chat Component

Let's create a real-time chat component that uses our WebSocket service:

```bash
npx asm
# Select "Component" from the list
# Enter "chat/message-list" as the name
# Follow the prompts
```

First, implement the factory:

```typescript
// src/components/chat/message-list/message-list.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { WebSocketService } from '../../../services/websocket.service';

interface ChatMessage {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  timestamp: number;
}

export class MessageListFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Set initial messages (empty array)
    context.data.set('messages', []);
    
    // Set user info (in a real app, this would come from an auth service)
    context.data.set('currentUser', {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: 'User ' + Math.floor(Math.random() * 1000)
    });
    
    // Get WebSocket service
    const wsService = context.services.get('wsService') as WebSocketService;
    
    // Pass the service to the client side
    context.data.set('wsService', wsService);
    
    // Connect to WebSocket if not already connected
    if (!wsService.isConnected()) {
      wsService.connect();
    }
  }
}
```

Now, implement the view:

```tsx
// src/components/chat/message-list/message-list.view.tsx
import React, { useState, useEffect, useRef } from 'react';
import { WebSocketService } from '../../../services/websocket.service';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface ChatMessage {
  id: string;
  user: User;
  text: string;
  timestamp: number;
}

interface MessageListProps {
  data: {
    messages: ChatMessage[];
    currentUser: User;
    wsService: WebSocketService;
  };
}

const MessageList: React.FC<MessageListProps> = ({ data }) => {
  const { currentUser, wsService } = data;
  const [messages, setMessages] = useState<ChatMessage[]>(data.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(wsService.isConnected() ? 'connected' : 'disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up WebSocket event listeners
  useEffect(() => {
    // Handle new messages
    const unsubscribeMessage = wsService.on('chat_message', (data: ChatMessage) => {
      setMessages(prevMessages => [...prevMessages, data]);
    });

    // Handle connection status changes
    const unsubscribeConnect = wsService.onConnect(() => {
      setConnectionStatus('connected');
    });

    const unsubscribeDisconnect = wsService.onDisconnect(() => {
      setConnectionStatus('disconnected');
    });

    // Connect if not already connected
    if (!wsService.isConnected()) {
      wsService.connect();
    }

    // Clean up event listeners on unmount
    return () => {
      unsubscribeMessage();
      unsubscribeConnect();
      unsubscribeDisconnect();
    };
  }, [wsService]);

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: 'msg-' + Date.now(),
      user: currentUser,
      text: newMessage.trim(),
      timestamp: Date.now()
    };
    
    // Send message via WebSocket
    if (wsService.send('chat_message', message)) {
      // Optimistically add message to the list (server will broadcast it back)
      // In a real app, you might want to mark it as 'pending' until confirmed
      setMessages(prevMessages => [...prevMessages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className={`connection-status ${connectionStatus}`}>
        {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
        {connectionStatus === 'disconnected' && (
          <button 
            className="reconnect-button"
            onClick={() => wsService.connect()}
          >
            Reconnect
          </button>
        )}
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet</div>
        ) : (
          <>
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.user.id === currentUser.id ? 'own-message' : 'other-message'}`}
              >
                <div className="message-header">
                  <span className="user-name">{message.user.name}</span>
                  <span className="timestamp">{formatTime(message.timestamp)}</span>
                </div>
                <div className="message-text">{message.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={connectionStatus !== 'connected'}
        />
        <button 
          type="submit" 
          disabled={connectionStatus !== 'connected' || !newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageList;
```

Add some styles for the chat component:

```scss
// src/components/chat/message-list/message-list.styles.scss
.chat-container {
  display: flex;
  flex-direction: column;
  height: 500px;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  font-family: Arial, sans-serif;
  
  .connection-status {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    &.connected {
      background-color: #dff6dd;
      color: #107c10;
    }
    
    &.disconnected {
      background-color: #fed9cc;
      color: #d83b01;
    }
    
    .reconnect-button {
      background-color: #0078d4;
      color: white;
      border: none;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      
      &:hover {
        background-color: #106ebe;
      }
    }
  }
  
  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: #f5f5f5;
    
    .no-messages {
      text-align: center;
      color: #666;
      margin-top: 20px;
      font-style: italic;
    }
    
    .message {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 8px;
      position: relative;
      word-break: break-word;
      
      .message-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 12px;
        
        .user-name {
          font-weight: bold;
        }
        
        .timestamp {
          color: #666;
        }
      }
      
      &.own-message {
        align-self: flex-end;
        background-color: #dcf8c6;
        
        .message-header {
          color: #56914f;
        }
      }
      
      &.other-message {
        align-self: flex-start;
        background-color: white;
        
        .message-header {
          color: #0078d4;
        }
      }
    }
  }
  
  .message-form {
    display: flex;
    padding: 12px;
    background-color: white;
    border-top: 1px solid #e1e1e1;
    
    input {
      flex: 1;
      padding: 12px;
      border: 1px solid #e1e1e1;
      border-radius: 4px;
      margin-right: 8px;
      font-size: 16px;
      
      &:disabled {
        background-color: #f5f5f5;
      }
    }
    
    button {
      background-color: #0078d4;
      color: white;
      border: none;
      padding: 0 20px;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      
      &:hover:not(:disabled) {
        background-color: #106ebe;
      }
      
      &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    }
  }
}
```

### Step 5: Implement Client-Side Logic

Add client-side functionality to the chat component:

```typescript
// src/components/chat/message-list/message-list.client.ts
import { Blueprint } from 'asmbl';
import { WebSocketService } from '../../../services/websocket.service';

export class MessageListClient extends Blueprint {
  private wsService: WebSocketService | null = null;
  private unsubscribers: Array<() => void> = [];

  protected override onMount(): void {
    super.onMount();
    
    // Get WebSocket service from data
    this.wsService = this.data.get('wsService');
    
    if (this.wsService) {
      // Connect if not already connected
      if (!this.wsService.isConnected()) {
        this.wsService.connect();
      }
      
      // Setup event listeners
      this.setupEventListeners();
    }
  }
  
  protected override onUnmount(): void {
    super.onUnmount();
    
    // Clean up event listeners
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
  }
  
  private setupEventListeners(): void {
    if (!this.wsService) return;
    
    // Update connection status display
    const updateConnectionStatus = () => {
      const statusEl = this.root.querySelector('.connection-status');
      if (statusEl) {
        statusEl.classList.remove('connected', 'disconnected');
        statusEl.classList.add(this.wsService?.isConnected() ? 'connected' : 'disconnected');
        statusEl.textContent = this.wsService?.isConnected() ? 'Connected' : 'Disconnected';
        
        // Add reconnect button if disconnected
        if (!this.wsService?.isConnected()) {
          const reconnectBtn = document.createElement('button');
          reconnectBtn.className = 'reconnect-button';
          reconnectBtn.textContent = 'Reconnect';
          reconnectBtn.addEventListener('click', () => this.wsService?.connect());
          statusEl.appendChild(reconnectBtn);
        }
      }
    };
    
    // Register connection event handlers
    this.unsubscribers.push(
      this.wsService.onConnect(() => {
        updateConnectionStatus();
      })
    );
    
    this.unsubscribers.push(
      this.wsService.onDisconnect(() => {
        updateConnectionStatus();
      })
    );
    
    // Initialize status
    updateConnectionStatus();
  }
}

export default MessageListClient;
```

### Step 6: Create a Real-time Demo Blueprint

Now, let's create a blueprint to showcase our real-time components:

```bash
npx asm
# Select "Blueprint" from the list
# Enter "real-time-demo" as the name
# Follow the prompts
```

Implement the blueprint view:

```tsx
// src/blueprints/real-time-demo/main/main.view.tsx
import React from 'react';

const RealTimeDemo: React.FC = () => {
  return (
    <div className="real-time-demo">
      <header className="header">
        <h1>Real-time Features Demo</h1>
        <p>This demo showcases WebSocket and Server-Sent Events integration in AssembleJS</p>
      </header>
      
      <div className="demo-container">
        <section className="chat-section">
          <h2>Real-time Chat</h2>
          <p>This component uses WebSockets for bidirectional real-time communication.</p>
          <div className="chat-wrapper" data-component="chat/message-list"></div>
        </section>
        
        <section className="notifications-section">
          <h2>Live Notifications</h2>
          <p>This component uses Server-Sent Events for one-way real-time updates.</p>
          <div className="notifications-wrapper" data-component="notifications/live-feed"></div>
        </section>
      </div>
    </div>
  );
};

export default RealTimeDemo;
```

Add styles for the demo:

```scss
// src/blueprints/real-time-demo/main/main.styles.scss
.real-time-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  
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
  
  .demo-container {
    display: flex;
    gap: 30px;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
    
    section {
      flex: 1;
      
      h2 {
        margin-bottom: 10px;
        color: #333;
      }
      
      p {
        margin-bottom: 20px;
        color: #666;
      }
    }
  }
}
```

### Step 7: Implement a WebSocket Server Controller

For this demo, let's create a simple WebSocket server controller in AssembleJS:

```bash
npx asm
# Select "Controller" from the list
# Enter "websocket" as the name
# Follow the prompts
```

Implement the WebSocket controller:

```typescript
// src/controllers/websocket.controller.ts
import { BlueprintController } from 'asmbl';
import WebSocket from 'ws';
import http from 'http';

interface Client {
  id: string;
  ws: WebSocket;
  user: {
    id: string;
    name: string;
  };
}

interface ChatMessage {
  id: string;
  user: {
    id: string;
    name: string;
  };
  text: string;
  timestamp: number;
}

export class WebSocketController extends BlueprintController {
  private wss: WebSocket.Server | null = null;
  private clients: Client[] = [];

  override onRegister(): void {
    super.onRegister();
    
    // Initialize WebSocket server when HTTP server is ready
    this.server.ready(() => {
      this.setupWebSocketServer();
    });
  }

  private setupWebSocketServer(): void {
    const httpServer = this.server.server as http.Server;
    
    // Create WebSocket server
    this.wss = new WebSocket.Server({ server: httpServer });
    
    console.log('WebSocket server initialized');
    
    // Handle new connections
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = 'client-' + Math.random().toString(36).substring(2, 9);
      
      // Add client to list (with a temporary user ID)
      const client: Client = {
        id: clientId,
        ws,
        user: {
          id: 'unknown',
          name: 'Anonymous'
        }
      };
      
      this.clients.push(client);
      
      console.log(`Client connected: ${clientId}, total clients: ${this.clients.length}`);
      
      // Handle messages from this client
      ws.on('message', (messageData: string) => {
        try {
          const message = JSON.parse(messageData);
          this.handleClientMessage(client, message);
        } catch (error) {
          console.error('Error parsing client message:', error);
        }
      });
      
      // Handle client disconnection
      ws.on('close', () => {
        this.clients = this.clients.filter(c => c.id !== clientId);
        console.log(`Client disconnected: ${clientId}, remaining clients: ${this.clients.length}`);
      });
      
      // Send welcome message
      this.sendToClient(client, 'system_message', {
        id: 'msg-system-' + Date.now(),
        user: { id: 'system', name: 'System' },
        text: 'Welcome to the chat! You are now connected.',
        timestamp: Date.now()
      });
    });
  }

  private handleClientMessage(client: Client, message: any): void {
    const { type, data } = message;
    
    switch (type) {
      case 'chat_message':
        // Update client user info if needed
        if (data.user && data.user.id) {
          client.user = data.user;
        }
        
        // Broadcast message to all clients
        this.broadcastMessage('chat_message', data);
        break;
        
      case 'user_info':
        // Update client user info
        client.user = data;
        break;
        
      default:
        console.log(`Unknown message type: ${type}`);
    }
  }

  private sendToClient(client: Client, type: string, data: any): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({ type, data }));
    }
  }

  private broadcastMessage(type: string, data: any): void {
    const message = JSON.stringify({ type, data });
    
    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }
}
```

### Step 8: Register the Components and Blueprints

Update your server.ts to include the new components, blueprints, and controllers:

```typescript
// src/server.ts
import { createBlueprintServer, EventBus } from "asmbl";
import { WebSocketService } from "./services/websocket.service";
import { SSEService } from "./services/sse.service";
import { MessageListFactory } from "./components/chat/message-list/message-list.factory";
import { WebSocketController } from "./controllers/websocket.controller";

// Create an event bus instance
const eventBus = new EventBus();

// In a development environment, WebSocket URL would be local
// In production, it would point to your deployed WebSocket server
const wsUrl = process.env.NODE_ENV === 'production' 
  ? 'wss://your-production-websocket-server.com' 
  : `ws://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`;

// Create WebSocket service
const wsService = new WebSocketService(wsUrl, eventBus);

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'chat/message-list',
        views: [{
          viewName: 'default',
          templateFile: 'message-list.view.tsx',
          factory: new MessageListFactory()
        }]
      }
    ],
    blueprints: [
      {
        path: 'real-time-demo',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/real-time-demo'
        }]
      }
    ],
    services: [
      {
        name: 'eventBus',
        service: eventBus
      },
      {
        name: 'wsService',
        service: wsService
      }
    ],
    controllers: [
      new WebSocketController()
    ]
  }
});
```

## Advanced Topics

### Implementing Offline Support

To provide offline support, you can enhance the WebSocket service:

```typescript
// Add to WebSocketService class
private messageQueue: Array<{ type: string; data: any }> = [];
private isOffline: boolean = false;

/**
 * Send message with offline support
 */
sendWithOfflineSupport(type: string, data: any): boolean {
  if (this.isConnected()) {
    return this.send(type, data);
  } else {
    // Store message in queue for later sending
    this.messageQueue.push({ type, data });
    this.isOffline = true;
    console.log('Device is offline, message queued for later sending');
    return true;
  }
}

// Modify the handleOpen method to send queued messages
private handleOpen(event: Event): void {
  console.log('WebSocket connected');
  this.reconnectAttempts = 0;
  
  // Send queued messages if we were offline
  if (this.isOffline && this.messageQueue.length > 0) {
    console.log(`Sending ${this.messageQueue.length} queued messages`);
    
    this.messageQueue.forEach(message => {
      this.send(message.type, message.data);
    });
    
    this.messageQueue = [];
    this.isOffline = false;
  }
  
  // Notify connection handlers
  this.connectionHandlers.onConnect.forEach(handler => handler());
  
  // Publish event to event bus
  this.events.publish('websocket:connected', {});
}
```

### Implementing Optimistic UI Updates

For a better user experience, implement optimistic UI updates for real-time interactions:

```tsx
// Update the MessageList component's handleSendMessage method
const handleSendMessage = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!newMessage.trim()) return;
  
  const message: ChatMessage = {
    id: 'local-' + Date.now(),
    user: currentUser,
    text: newMessage.trim(),
    timestamp: Date.now(),
    status: 'pending' // Add status for optimistic UI
  };
  
  // Add message optimistically to UI immediately
  setMessages(prevMessages => [...prevMessages, message]);
  setNewMessage('');
  
  // Send message via WebSocket
  if (!wsService.send('chat_message', message)) {
    // If sending fails, mark as failed
    setMessages(prevMessages => 
      prevMessages.map(m => 
        m.id === message.id ? { ...m, status: 'failed' } : m
      )
    );
  }
};

// Update the MessageList component's useEffect hook to handle server acknowledgment
useEffect(() => {
  // Handle new messages or acknowledgments
  const unsubscribeMessage = wsService.on('chat_message', (data: ChatMessage) => {
    setMessages(prevMessages => {
      // Check if this is a server confirmation of our local message
      const localMessageIndex = prevMessages.findIndex(m => 
        m.status === 'pending' && 
        m.user.id === data.user.id && 
        m.text === data.text &&
        Math.abs(m.timestamp - data.timestamp) < 5000 // Within 5 seconds
      );
      
      if (localMessageIndex >= 0) {
        // Replace local message with server version
        const newMessages = [...prevMessages];
        newMessages[localMessageIndex] = data;
        return newMessages;
      }
      
      // Otherwise it's a new message from someone else
      return [...prevMessages, data];
    });
  });
  
  // Clean up on unmount
  return () => {
    unsubscribeMessage();
  };
}, [wsService]);
```

### Scaling Real-time Applications

For scaling real-time applications, you can implement a Redis adapter for WebSockets:

```typescript
// src/controllers/websocket.controller.ts with Redis adapter
import { BlueprintController } from 'asmbl';
import WebSocket from 'ws';
import http from 'http';
import Redis from 'ioredis';

export class WebSocketController extends BlueprintController {
  private wss: WebSocket.Server | null = null;
  private clients: Map<string, Client> = new Map();
  private pubClient: Redis;
  private subClient: Redis;
  private channelName = 'ws-messages';

  constructor() {
    super();
    
    // Create Redis clients
    this.pubClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.subClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    // Subscribe to Redis channel
    this.subClient.subscribe(this.channelName);
    this.subClient.on('message', (channel, message) => {
      if (channel === this.channelName) {
        this.handleRedisMessage(message);
      }
    });
  }

  // Handle messages from Redis
  private handleRedisMessage(messageStr: string): void {
    try {
      const { clientId, type, data } = JSON.parse(messageStr);
      
      // Don't send to the client that originated the message
      this.clients.forEach((client, id) => {
        if (id !== clientId && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify({ type, data }));
        }
      });
    } catch (error) {
      console.error('Error handling Redis message:', error);
    }
  }

  // Publish to Redis instead of directly to clients
  private broadcastMessage(originClientId: string, type: string, data: any): void {
    this.pubClient.publish(
      this.channelName,
      JSON.stringify({
        clientId: originClientId,
        type,
        data
      })
    );
  }
}
```

## Conclusion

This cookbook has demonstrated how to implement real-time features in AssembleJS applications using WebSockets and Server-Sent Events. We've covered creating reusable services for real-time communication, building interactive components that use these services, and implementing server-side controllers to handle WebSocket connections.

By following these patterns, you can build responsive, interactive AssembleJS applications with real-time capabilities. The advanced topics covered offline support, optimistic UI updates, and scaling considerations for larger applications.

Real-time features significantly enhance user experience by providing immediate feedback and live updates without requiring page refreshes, making your applications feel more responsive and engaging.