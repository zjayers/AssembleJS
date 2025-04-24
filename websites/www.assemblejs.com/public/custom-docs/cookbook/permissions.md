# User Permissions & RBAC

<iframe src="https://placeholder-for-assemblejs-permissions-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

## Overview

Implementing a robust permissions system is crucial for applications that manage sensitive data or provide different functionality to different user groups. This cookbook demonstrates how to build a flexible role-based access control (RBAC) system in AssembleJS.

## Prerequisites

- Basic knowledge of AssembleJS components and blueprints
- Understanding of authentication concepts
- Familiarity with React component patterns

## Implementation Steps

### Step 1: Create a Permissions Service

First, let's create a service to manage permissions:

1. Use the CLI to generate a permissions service:

```bash
npx asm
# Select "Service" from the list
# Enter "permissions" as the name
# Follow the prompts
```

2. Implement the permissions service:

```typescript
// src/services/permissions.service.ts
import { Service } from 'asmbl';

export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  EDITOR = 'editor',
  ADMIN = 'admin'
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: UserRole;
  name: string;
  permissions: string[];
  inherits?: UserRole[];
}

export class PermissionsService extends Service {
  private permissions: Record<string, Permission> = {};
  private roles: Record<string, Role> = {};
  private currentRole: UserRole = UserRole.GUEST;

  constructor() {
    super();
    this.initializePermissions();
    this.initializeRoles();
  }

  private initializePermissions(): void {
    this.registerPermission('read:public', 'Read Public Content', 'Can read public content');
    this.registerPermission('read:protected', 'Read Protected Content', 'Can read protected content');
    this.registerPermission('create:content', 'Create Content', 'Can create new content');
    this.registerPermission('edit:content', 'Edit Content', 'Can edit existing content');
    this.registerPermission('delete:content', 'Delete Content', 'Can delete content');
    this.registerPermission('manage:users', 'Manage Users', 'Can manage user accounts');
    this.registerPermission('manage:roles', 'Manage Roles', 'Can manage user roles');
  }

  private initializeRoles(): void {
    // Guest role
    this.registerRole({
      id: UserRole.GUEST,
      name: 'Guest',
      permissions: ['read:public']
    });

    // User role inherits from Guest
    this.registerRole({
      id: UserRole.USER,
      name: 'User',
      permissions: ['read:protected', 'create:content'],
      inherits: [UserRole.GUEST]
    });

    // Editor role inherits from User
    this.registerRole({
      id: UserRole.EDITOR,
      name: 'Editor',
      permissions: ['edit:content', 'delete:content'],
      inherits: [UserRole.USER]
    });

    // Admin role inherits from Editor
    this.registerRole({
      id: UserRole.ADMIN,
      name: 'Administrator',
      permissions: ['manage:users', 'manage:roles'],
      inherits: [UserRole.EDITOR]
    });
  }

  registerPermission(id: string, name: string, description: string): void {
    this.permissions[id] = { id, name, description };
  }

  registerRole(role: Role): void {
    this.roles[role.id] = role;
  }

  setCurrentRole(role: UserRole): void {
    if (!this.roles[role]) {
      throw new Error(`Role ${role} does not exist`);
    }
    this.currentRole = role;
  }

  getCurrentRole(): UserRole {
    return this.currentRole;
  }

  getRoleDisplayName(): string {
    return this.roles[this.currentRole]?.name || 'Unknown';
  }

  getPermissions(): Permission[] {
    return Object.values(this.permissions);
  }

  getRoles(): Role[] {
    return Object.values(this.roles);
  }

  hasPermission(permissionId: string): boolean {
    const roleId = this.currentRole;
    
    // Helper function to check if role has permission
    const roleHasPermission = (role: Role, permId: string): boolean => {
      if (role.permissions.includes(permId)) {
        return true;
      }
      
      // Check inherited roles
      if (role.inherits && role.inherits.length > 0) {
        return role.inherits.some(inheritedRoleId => {
          const inheritedRole = this.roles[inheritedRoleId];
          return inheritedRole ? roleHasPermission(inheritedRole, permId) : false;
        });
      }
      
      return false;
    };
    
    const role = this.roles[roleId];
    return role ? roleHasPermission(role, permissionId) : false;
  }
}
```

### Step 2: Register the Permissions Service

1. Register the service in your server.ts file:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { PermissionsService } from "./services/permissions.service";

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [],
    services: [
      {
        name: 'permissionsService',
        service: new PermissionsService()
      }
    ]
  }
});
```

### Step 3: Create Permission-Aware Components

Let's create some components that use the permissions system. First, generate a protected content component:

```bash
npx asm
# Select "Component" from the list
# Enter "common/protected-content" as the name
# Follow the prompts
```

Then implement it:

```tsx
// src/components/common/protected-content/protected-content.view.tsx
import React from 'react';
import { useService } from 'asmbl/hooks';
import { PermissionsService } from '../../../services/permissions.service';

interface ProtectedContentProps {
  requiredPermission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const ProtectedContent: React.FC<ProtectedContentProps> = ({
  requiredPermission,
  fallback = null,
  children
}) => {
  const permissionsService = useService<PermissionsService>('permissionsService');
  
  if (!permissionsService.hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default ProtectedContent;
```

### Step 4: Create a Role Selector Component

Create a component to change the current user role (for demo purposes):

```bash
npx asm
# Select "Component" from the list
# Enter "permissions/role-selector" as the name
# Follow the prompts
```

First, implement the factory:

```typescript
// src/components/permissions/role-selector/role-selector.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { PermissionsService, UserRole } from '../../../services/permissions.service';

export class RoleSelectorFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    const permissionsService = context.services.get('permissionsService') as PermissionsService;
    
    context.data.set('roles', permissionsService.getRoles());
    context.data.set('currentRole', permissionsService.getCurrentRole());
    
    // Pass the service to handle role changes on the client side
    context.data.set('permissionsService', permissionsService);
  }
}
```

Now, implement the view:

```tsx
// src/components/permissions/role-selector/role-selector.view.tsx
import React, { useState } from 'react';
import { PermissionsService, UserRole, Role } from '../../../services/permissions.service';

interface RoleSelectorProps {
  data: {
    roles: Role[];
    currentRole: UserRole;
    permissionsService: PermissionsService;
  };
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ data }) => {
  const { roles, currentRole: initialRole, permissionsService } = data;
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    setSelectedRole(newRole);
    permissionsService.setCurrentRole(newRole);
    
    // Trigger a custom event to notify other components
    const event = new CustomEvent('role-changed', { detail: { role: newRole } });
    document.dispatchEvent(event);
  };
  
  return (
    <div className="role-selector">
      <h3>Current Role: {permissionsService.getRoleDisplayName()}</h3>
      <div className="form-group">
        <label htmlFor="role-select">Change Role:</label>
        <select 
          id="role-select" 
          value={selectedRole} 
          onChange={handleRoleChange}
          className="role-select"
        >
          {roles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RoleSelector;
```

### Step 5: Create a Permissions Demo Blueprint

Now, let's create a blueprint that demonstrates the permissions system:

```bash
npx asm
# Select "Blueprint" from the list
# Enter "permissions-demo" as the name
# Follow the prompts
```

First, implement the view:

```tsx
// src/blueprints/permissions-demo/main/main.view.tsx
import React from 'react';
import ProtectedContent from '../../../components/common/protected-content/protected-content.view';

const PermissionsDemo: React.FC = () => {
  return (
    <div className="permissions-demo">
      <header className="header">
        <h1>Permissions System Demo</h1>
        <p>Try changing roles to see how the content changes based on permissions</p>
      </header>
      
      <div className="role-selector-container" data-component="permissions/role-selector"></div>
      
      <div className="content-section">
        <h2>Content Access Levels</h2>
        
        <div className="content-card public">
          <h3>Public Content</h3>
          <ProtectedContent requiredPermission="read:public">
            <p>This content is visible to everyone (requires 'read:public' permission).</p>
          </ProtectedContent>
        </div>
        
        <div className="content-card protected">
          <h3>Protected Content</h3>
          <ProtectedContent 
            requiredPermission="read:protected"
            fallback={<p className="permission-denied">You need User level access to view this content.</p>}
          >
            <p>This is protected content only visible to registered users (requires 'read:protected' permission).</p>
          </ProtectedContent>
        </div>
        
        <div className="content-card editor">
          <h3>Editor Content</h3>
          <ProtectedContent 
            requiredPermission="edit:content"
            fallback={<p className="permission-denied">You need Editor level access to view this content.</p>}
          >
            <p>This content is only visible to editors (requires 'edit:content' permission).</p>
            <button className="action-button edit-button">Edit Content</button>
            <button className="action-button delete-button">Delete Content</button>
          </ProtectedContent>
        </div>
        
        <div className="content-card admin">
          <h3>Admin Settings</h3>
          <ProtectedContent 
            requiredPermission="manage:users"
            fallback={<p className="permission-denied">You need Administrator level access to view this content.</p>}
          >
            <p>This is the admin panel (requires 'manage:users' permission).</p>
            <button className="action-button admin-button">Manage Users</button>
            <button className="action-button admin-button">Manage Roles</button>
          </ProtectedContent>
        </div>
      </div>
    </div>
  );
};

export default PermissionsDemo;
```

Now, implement the client-side logic:

```typescript
// src/blueprints/permissions-demo/main/main.client.ts
import { Blueprint } from 'asmbl';

export class PermissionsDemoClient extends Blueprint {
  protected override onMount(): void {
    super.onMount();
    
    // Listen for role changes and refresh the page to update permissions
    document.addEventListener('role-changed', () => {
      this.refreshContent();
    });
  }
  
  private refreshContent(): void {
    // In a real application, you would selectively update UI components
    // For this demo, we'll just force a re-render of the blueprint
    window.location.reload();
  }
}

export default PermissionsDemoClient;
```

Finally, add some styles:

```scss
// src/blueprints/permissions-demo/main/main.styles.scss
.permissions-demo {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  
  .header {
    text-align: center;
    margin-bottom: 30px;
    
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    
    p {
      color: #666;
    }
  }
  
  .role-selector-container {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 5px;
    margin-bottom: 30px;
    text-align: center;
  }
  
  .content-section {
    h2 {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .content-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 20px;
      margin-bottom: 20px;
      
      h3 {
        margin-top: 0;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }
      
      p {
        margin-bottom: 15px;
      }
      
      &.public {
        border-left: 5px solid #4caf50;
      }
      
      &.protected {
        border-left: 5px solid #2196f3;
      }
      
      &.editor {
        border-left: 5px solid #ff9800;
      }
      
      &.admin {
        border-left: 5px solid #f44336;
      }
      
      .permission-denied {
        color: #f44336;
        font-style: italic;
      }
      
      .action-button {
        background-color: #2196f3;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
        
        &:hover {
          background-color: #0b7dda;
        }
        
        &.delete-button {
          background-color: #f44336;
        }
        
        &.admin-button {
          background-color: #9c27b0;
        }
      }
    }
  }
}
```

### Step 6: Register Components and Blueprints

Update your server.ts to include the new components and blueprints:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { PermissionsService } from "./services/permissions.service";
import { RoleSelectorFactory } from "./components/permissions/role-selector/role-selector.factory";

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'permissions/role-selector',
        views: [{
          viewName: 'default',
          templateFile: 'role-selector.view.tsx',
          factory: new RoleSelectorFactory()
        }]
      }
    ],
    blueprints: [
      {
        path: 'permissions-demo',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/permissions-demo'
        }]
      }
    ],
    services: [
      {
        name: 'permissionsService',
        service: new PermissionsService()
      }
    ]
  }
});
```

## Advanced Topics

### Server-Side Permission Enforcement

For critical security, enforce permissions on the server side as well:

```bash
npx asm
# Select "Controller" from the list
# Enter "secure-content" as the name
# Follow the prompts
```

```typescript
// Implement the controller
// src/controllers/secure-content.controller.ts
import { BlueprintController } from 'asmbl';
import { PermissionsService } from '../services/permissions.service';

export class SecureContentController extends BlueprintController {
  private permissionsService: PermissionsService;

  constructor() {
    super();
    // Note: In a real application, you would get the user's permissions
    // from their authenticated session
  }

  override onRegister(): void {
    super.onRegister();
    this.permissionsService = this.services.get('permissionsService') as PermissionsService;
    
    // Register secured routes
    this.server.get('/api/protected-data', this.getProtectedData.bind(this));
    this.server.post('/api/content', this.createContent.bind(this));
    this.server.delete('/api/content/:id', this.deleteContent.bind(this));
    this.server.get('/api/admin/users', this.getUsers.bind(this));
  }

  private async getProtectedData(request, reply) {
    // Check permission (in real app, would check user's session)
    if (!this.permissionsService.hasPermission('read:protected')) {
      return reply.status(403).send({ error: 'Permission denied' });
    }
    
    return reply.send({ data: 'This is protected data' });
  }

  private async createContent(request, reply) {
    if (!this.permissionsService.hasPermission('create:content')) {
      return reply.status(403).send({ error: 'Permission denied' });
    }
    
    // Create content logic
    return reply.send({ success: true, id: 'new-content-id' });
  }

  private async deleteContent(request, reply) {
    if (!this.permissionsService.hasPermission('delete:content')) {
      return reply.status(403).send({ error: 'Permission denied' });
    }
    
    // Delete content logic
    return reply.send({ success: true });
  }

  private async getUsers(request, reply) {
    if (!this.permissionsService.hasPermission('manage:users')) {
      return reply.status(403).send({ error: 'Permission denied' });
    }
    
    // Get users logic
    return reply.send({ users: [/* user data */] });
  }
}
```

### Combining with Authentication

Integrate the permissions system with authentication:

```bash
npx asm
# Select "Service" from the list
# Enter "auth" as the name
# Follow the prompts
```

```typescript
// Implement the service
// src/services/auth.service.ts
import { Service } from 'asmbl';
import { PermissionsService, UserRole } from './permissions.service';

interface User {
  id: string;
  username: string;
  role: UserRole;
}

export class AuthService extends Service {
  private permissionsService: PermissionsService;
  private currentUser: User | null = null;

  constructor(permissionsService: PermissionsService) {
    super();
    this.permissionsService = permissionsService;
  }

  async login(username: string, password: string): Promise<boolean> {
    // In a real app, you would validate credentials against a database
    // This is a simplified example
    
    // Mock user data
    const users = {
      'guest': { id: 'guest1', username: 'guest', role: UserRole.GUEST },
      'user': { id: 'user1', username: 'user', role: UserRole.USER },
      'editor': { id: 'editor1', username: 'editor', role: UserRole.EDITOR },
      'admin': { id: 'admin1', username: 'admin', role: UserRole.ADMIN }
    };
    
    const user = users[username];
    
    if (user) {
      this.currentUser = user;
      this.permissionsService.setCurrentRole(user.role);
      return true;
    }
    
    return false;
  }

  logout(): void {
    this.currentUser = null;
    this.permissionsService.setCurrentRole(UserRole.GUEST);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}
```

Register both services:

```typescript
// src/server.ts
// ...
const permissionsService = new PermissionsService();
const authService = new AuthService(permissionsService);

void createBlueprintServer({
  // ...
  manifest: {
    // ...
    services: [
      {
        name: 'permissionsService',
        service: permissionsService
      },
      {
        name: 'authService',
        service: authService
      }
    ]
  }
});
```

## Conclusion

This cookbook has demonstrated how to implement a flexible permissions system in AssembleJS. We've covered creating a permissions service, building permission-aware components, and integrating permissions with authentication.

By following these patterns, you can build secure AssembleJS applications with fine-grained access control that's both maintainable and scalable. Remember that for production applications, you should always enforce permissions on both the client and server side.