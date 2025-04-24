# Authentication Flow

<iframe src="https://placeholder-for-assemblejs-authentication-demo.vercel.app" width="100%" height="500px" frameborder="0"></iframe>

## Overview

Securing your application with proper authentication is critical. This cookbook demonstrates how to implement user authentication in AssembleJS applications using JSON Web Tokens (JWT) and best practices for security.

## Prerequisites

- Basic knowledge of AssembleJS components and blueprints
- Understanding of JWT (JSON Web Tokens)
- Familiarity with HTTP cookies and local storage concepts

## Implementation Steps

### Step 1: Create the Authentication Service

First, let's create a service to handle authentication operations:

```bash
mkdir -p src/services
touch src/services/auth.service.ts
```

Implement the authentication service:

```typescript
// src/services/auth.service.ts
import { Service } from 'asmbl';

interface AuthOptions {
  apiUrl: string;
  tokenKey?: string;
  refreshTokenKey?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export class AuthService extends Service {
  private apiUrl: string;
  private tokenKey: string;
  private refreshTokenKey: string;
  private currentUser: User | null = null;

  constructor(options: AuthOptions) {
    super();
    this.apiUrl = options.apiUrl;
    this.tokenKey = options.tokenKey || 'auth_token';
    this.refreshTokenKey = options.refreshTokenKey || 'refresh_token';
    
    // Load token from storage on initialization
    if (typeof window !== 'undefined') {
      this.loadTokenFromStorage();
    }
  }

  async login(username: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data: LoginResponse = await response.json();
      
      // Store tokens
      this.setTokens(data.token, data.refreshToken);
      
      // Store user
      this.currentUser = data.user;
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      const token = this.getToken();
      if (token) {
        await fetch(`${this.apiUrl}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user regardless of API call success
      this.clearTokens();
      this.currentUser = null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // If we already have the user, return it
    if (this.currentUser) {
      return this.currentUser;
    }

    // Otherwise fetch from API
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${this.apiUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }

      const user: User = await response.json();
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.apiUrl}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
      return data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return null;
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  hasRole(role: string): boolean {
    return this.currentUser?.roles.includes(role) || false;
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.refreshTokenKey);
  }

  private setTokens(token: string, refreshToken: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  private loadTokenFromStorage(): void {
    const token = this.getToken();
    if (token) {
      // You could validate the token here (check expiration)
      // For now, we'll just consider the user logged in if a token exists
    }
  }
}
```

### Step 2: Create an HTTP Interceptor for Authentication

Let's create an HTTP client service that will automatically handle token authentication:

```bash
touch src/services/http.service.ts
```

Implement the HTTP service with authentication support:

```typescript
// src/services/http.service.ts
import { Service } from 'asmbl';
import { AuthService } from './auth.service';

interface HttpOptions {
  baseUrl: string;
  timeout?: number;
}

export class HttpService extends Service {
  private baseUrl: string;
  private timeout: number;
  private authService: AuthService | null = null;

  constructor(options: HttpOptions) {
    super();
    this.baseUrl = options.baseUrl;
    this.timeout = options.timeout || 10000;
  }

  setAuthService(authService: AuthService): void {
    this.authService = authService;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>('GET', url);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('POST', url, data);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('PUT', url, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('DELETE', url);
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  private async request<T>(
    method: string, 
    url: string, 
    data?: any
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Add authentication token if available
      if (this.authService) {
        const token = this.authService.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        credentials: 'include'
      });
      
      clearTimeout(timeoutId);
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && this.authService) {
        const newToken = await this.authService.refreshAccessToken();
        
        if (newToken) {
          // Retry the request with the new token
          return this.request<T>(method, url, data);
        } else {
          // If refresh failed, throw authentication error
          throw new Error('Authentication failed');
        }
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
```

### Step 3: Register the Services

Register both services in your server.ts:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { AuthService } from "./services/auth.service";
import { HttpService } from "./services/http.service";

const authService = new AuthService({
  apiUrl: 'https://api.example.com/auth'
});

const httpService = new HttpService({
  baseUrl: 'https://api.example.com'
});

// Connect the HTTP service to the auth service
httpService.setAuthService(authService);

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [],
    services: [
      {
        name: 'authService',
        service: authService
      },
      {
        name: 'httpService',
        service: httpService
      }
    ]
  }
});
```

### Step 4: Create a Login Form Component

Let's create a login form component:

```bash
mkdir -p src/components/auth
touch src/components/auth/login/login.view.tsx
touch src/components/auth/login/login.client.ts
touch src/components/auth/login/login.styles.scss
```

Implement the login view:

```tsx
// src/components/auth/login/login.view.tsx
import React from 'react';

interface LoginProps {
  data: {
    error: string | null;
    redirectUrl: string;
  };
}

const Login: React.FC<LoginProps> = ({ data }) => {
  const { error, redirectUrl } = data;
  
  return (
    <div className="login-container">
      <form className="login-form" id="login-form">
        <h2>Sign In</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            type="text" 
            id="username" 
            name="username" 
            placeholder="Enter your username" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            placeholder="Enter your password" 
            required 
          />
        </div>
        
        <div className="form-group">
          <button type="submit" className="login-button">
            Sign In
          </button>
        </div>
        
        <div className="form-footer">
          <p>Don't have an account? <a href="/register">Sign Up</a></p>
        </div>
        
        <input type="hidden" id="redirect-url" value={redirectUrl} />
      </form>
    </div>
  );
};

export default Login;
```

Create the client-side code for the login form:

```typescript
// src/components/auth/login/login.client.ts
import { Blueprint } from 'asmbl';
import { AuthService } from '../../../services/auth.service';

export class LoginClient extends Blueprint {
  private form: HTMLFormElement | null = null;
  private usernameInput: HTMLInputElement | null = null;
  private passwordInput: HTMLInputElement | null = null;
  private errorContainer: HTMLDivElement | null = null;
  private redirectUrlInput: HTMLInputElement | null = null;
  private authService: AuthService | null = null;

  protected override onMount(): void {
    super.onMount();
    
    // Get DOM elements
    this.form = this.root.querySelector('#login-form') as HTMLFormElement;
    this.usernameInput = this.root.querySelector('#username') as HTMLInputElement;
    this.passwordInput = this.root.querySelector('#password') as HTMLInputElement;
    this.errorContainer = this.root.querySelector('.error-message') as HTMLDivElement;
    this.redirectUrlInput = this.root.querySelector('#redirect-url') as HTMLInputElement;
    
    // Get auth service
    this.authService = this.services.get('authService') as AuthService;
    
    // Already authenticated? Redirect
    if (this.authService && this.authService.isAuthenticated()) {
      const redirectUrl = this.redirectUrlInput?.value || '/';
      window.location.href = redirectUrl;
      return;
    }
    
    // Add event listeners
    this.form?.addEventListener('submit', this.handleSubmit.bind(this));
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.form || !this.usernameInput || !this.passwordInput || !this.authService) {
      return;
    }
    
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;
    
    if (!username || !password) {
      this.showError('Please enter both username and password');
      return;
    }
    
    try {
      // Login button UI - show loading state
      const loginButton = this.form.querySelector('.login-button') as HTMLButtonElement;
      const originalText = loginButton.textContent;
      loginButton.disabled = true;
      loginButton.textContent = 'Signing in...';
      
      // Perform login
      await this.authService.login(username, password);
      
      // Redirect on success
      const redirectUrl = this.redirectUrlInput?.value || '/';
      window.location.href = redirectUrl;
    } catch (error) {
      // Handle error
      this.showError('Invalid username or password');
      
      // Reset login button
      const loginButton = this.form.querySelector('.login-button') as HTMLButtonElement;
      loginButton.disabled = false;
      loginButton.textContent = originalText || 'Sign In';
    }
  }

  private showError(message: string): void {
    if (!this.errorContainer) {
      return;
    }
    
    this.errorContainer.textContent = message;
    this.errorContainer.style.display = 'block';
  }
}

export default LoginClient;
```

Add styles for the login form:

```scss
// src/components/auth/login/login.styles.scss
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-form {
  h2 {
    margin-top: 0;
    margin-bottom: 24px;
    color: #333;
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 20px;
    
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #555;
    }
    
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      transition: border-color 0.3s;
      
      &:focus {
        border-color: #4a90e2;
        outline: none;
      }
    }
  }
  
  .login-button {
    width: 100%;
    padding: 12px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: #3a7bc8;
    }
    
    &:disabled {
      background-color: #a0c4f1;
      cursor: not-allowed;
    }
  }
  
  .form-footer {
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    color: #666;
    
    a {
      color: #4a90e2;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.error-message {
  padding: 10px;
  margin-bottom: 20px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
  font-size: 14px;
  display: none;
}
```

### Step 5: Create a Login Factory

Create a factory for the login component to handle server-side data:

```bash
touch src/components/auth/login/login.factory.ts
```

Implement the factory:

```typescript
// src/components/auth/login/login.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';

export class LoginFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Get the redirect URL from query parameters
    const redirectUrl = context.request?.query.redirect as string || '/';
    
    // Set initial data
    context.data.set('error', null);
    context.data.set('redirectUrl', redirectUrl);
  }
}
```

### Step 6: Create an Auth Guard Utility

Next, let's create a utility to protect routes:

```bash
mkdir -p src/utils
touch src/utils/auth.guard.ts
```

Implement the auth guard:

```typescript
// src/utils/auth.guard.ts
import { BlueprintController } from 'asmbl';
import { AuthService } from '../services/auth.service';

/**
 * Authentication guard for protecting routes
 */
export class AuthGuard {
  private authService: AuthService;
  
  constructor(authService: AuthService) {
    this.authService = authService;
  }
  
  /**
   * Middleware to protect routes that require authentication
   */
  public requireAuth(controller: BlueprintController): void {
    controller.hooks.onRoute.add(async (request, reply) => {
      // Skip auth check for public routes
      if (this.isPublicRoute(request.url)) {
        return;
      }
      
      // Check for cookie-based authentication on server
      const isAuthenticated = this.checkServerAuthentication(request.headers.cookie);
      
      if (!isAuthenticated) {
        // Redirect to login with the original URL as redirect parameter
        return reply.redirect(`/login?redirect=${encodeURIComponent(request.url)}`);
      }
    });
  }
  
  /**
   * Check if the route should be publicly accessible
   */
  private isPublicRoute(url: string): boolean {
    const publicRoutes = [
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/assets/',
      '/api/auth/'
    ];
    
    return publicRoutes.some(route => url.startsWith(route));
  }
  
  /**
   * Verify server-side authentication from cookies
   */
  private checkServerAuthentication(cookieHeader?: string): boolean {
    if (!cookieHeader) {
      return false;
    }
    
    // In a real implementation, you would verify the JWT token from the cookie
    // For this example, we'll just check if the auth cookie exists
    const cookies = this.parseCookies(cookieHeader);
    return !!cookies['auth_token'];
  }
  
  /**
   * Parse cookies from cookie header
   */
  private parseCookies(cookieHeader: string): Record<string, string> {
    return cookieHeader.split(';')
      .map(cookie => cookie.trim().split('='))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
  }
}
```

### Step 7: Create a Protected Component

Let's create a component that will be shown only to authenticated users:

```bash
mkdir -p src/components/profile
touch src/components/profile/profile.view.tsx
touch src/components/profile/profile.client.ts
touch src/components/profile/profile.factory.ts
touch src/components/profile/profile.styles.scss
```

Implement the profile view:

```tsx
// src/components/profile/profile.view.tsx
import React from 'react';

interface ProfileProps {
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      roles: string[];
    } | null;
    loading: boolean;
  };
}

const Profile: React.FC<ProfileProps> = ({ data }) => {
  const { user, loading } = data;
  
  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }
  
  if (!user) {
    return <div className="profile-error">User not found</div>;
  }
  
  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      
      <div className="profile-card">
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        
        <div className="profile-details">
          <div className="profile-field">
            <label>Username:</label>
            <span>{user.username}</span>
          </div>
          
          <div className="profile-field">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          
          <div className="profile-field">
            <label>Roles:</label>
            <span>{user.roles.join(', ')}</span>
          </div>
        </div>
      </div>
      
      <div className="profile-actions">
        <button id="logout-button" className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
```

Implement the profile factory:

```typescript
// src/components/profile/profile.factory.ts
import { ComponentContext, ComponentFactory } from 'asmbl';
import { AuthService } from '../../services/auth.service';

export class ProfileFactory implements ComponentFactory {
  async factory(context: ComponentContext): Promise<void> {
    // Set initial loading state
    context.data.set('loading', true);
    context.data.set('user', null);
    
    try {
      // Get the auth service
      const authService = context.services.get('authService') as AuthService;
      
      // Get current user
      const user = await authService.getCurrentUser();
      
      // Update component data
      context.data.set('user', user);
      context.data.set('loading', false);
    } catch (error) {
      console.error('Error loading user profile:', error);
      context.data.set('loading', false);
    }
  }
}
```

Implement the profile client:

```typescript
// src/components/profile/profile.client.ts
import { Blueprint } from 'asmbl';
import { AuthService } from '../../services/auth.service';

export class ProfileClient extends Blueprint {
  private logoutButton: HTMLButtonElement | null = null;
  private authService: AuthService | null = null;

  protected override onMount(): void {
    super.onMount();
    
    // Get DOM elements
    this.logoutButton = this.root.querySelector('#logout-button') as HTMLButtonElement;
    
    // Get auth service
    this.authService = this.services.get('authService') as AuthService;
    
    // Add event listeners
    this.logoutButton?.addEventListener('click', this.handleLogout.bind(this));
  }

  private async handleLogout(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.authService) {
      return;
    }
    
    try {
      // Update button state
      if (this.logoutButton) {
        this.logoutButton.disabled = true;
        this.logoutButton.textContent = 'Logging out...';
      }
      
      // Perform logout
      await this.authService.logout();
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Reset button state
      if (this.logoutButton) {
        this.logoutButton.disabled = false;
        this.logoutButton.textContent = 'Logout';
      }
    }
  }
}

export default ProfileClient;
```

Add styles for the profile component:

```scss
// src/components/profile/profile.styles.scss
.profile-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
}

.profile-loading,
.profile-error {
  padding: 20px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.profile-error {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.profile-card {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #4a90e2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  margin-right: 20px;
}

.profile-details {
  flex: 1;
}

.profile-field {
  margin-bottom: 10px;
  
  label {
    font-weight: bold;
    display: inline-block;
    width: 100px;
    color: #555;
  }
  
  span {
    color: #333;
  }
}

.profile-actions {
  margin-top: 20px;
  text-align: right;
}

.logout-button {
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #c82333;
  }
  
  &:disabled {
    background-color: #e4717a;
    cursor: not-allowed;
  }
}
```

### Step 8: Register Components and Apply Auth Guard

Update your server.ts to register components and apply the auth guard:

```typescript
// src/server.ts
import { createBlueprintServer } from "asmbl";
import { AuthService } from "./services/auth.service";
import { HttpService } from "./services/http.service";
import { AuthGuard } from "./utils/auth.guard";
import { LoginFactory } from "./components/auth/login/login.factory";
import { ProfileFactory } from "./components/profile/profile.factory";

// Create services
const authService = new AuthService({
  apiUrl: 'https://api.example.com/auth'
});

const httpService = new HttpService({
  baseUrl: 'https://api.example.com'
});

// Connect the HTTP service to the auth service
httpService.setAuthService(authService);

// Create auth guard
const authGuard = new AuthGuard(authService);

void createBlueprintServer({
  serverRoot: import.meta.url,
  httpServer: vaviteHttpServer,
  devServer: viteDevServer,
  
  manifest: {
    components: [
      {
        path: 'auth',
        views: [{
          viewName: 'login',
          templateFile: 'login.view.tsx',
          factory: new LoginFactory()
        }]
      },
      {
        path: 'profile',
        views: [{
          viewName: 'profile',
          templateFile: 'profile.view.tsx',
          factory: new ProfileFactory()
        }]
      }
    ],
    blueprints: [
      {
        path: 'login',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/login'
        }]
      },
      {
        path: 'profile',
        views: [{
          viewName: 'main',
          templateFile: 'main.view.tsx',
          route: '/profile'
        }]
      }
    ],
    services: [
      {
        name: 'authService',
        service: authService
      },
      {
        name: 'httpService',
        service: httpService
      }
    ]
  },
  
  hooks: {
    onReady: (server) => {
      // Apply authentication guard to protected routes
      authGuard.requireAuth(server);
    }
  }
});
```

### Step 9: Create Blueprint Views

Create the login and profile blueprint views:

```bash
mkdir -p src/blueprints/login/main
mkdir -p src/blueprints/profile/main
touch src/blueprints/login/main/main.view.tsx
touch src/blueprints/profile/main/main.view.tsx
```

Implement the login blueprint:

```tsx
// src/blueprints/login/main/main.view.tsx
import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <header className="header">
        <h1>AssembleJS Authentication</h1>
      </header>
      
      <main className="main-content">
        <div className="auth-wrapper" data-component="auth/login"></div>
      </main>
      
      <footer className="footer">
        <p>AssembleJS Authentication Example</p>
      </footer>
    </div>
  );
};

export default LoginPage;
```

Implement the profile blueprint:

```tsx
// src/blueprints/profile/main/main.view.tsx
import React from 'react';

const ProfilePage: React.FC = () => {
  return (
    <div className="profile-page">
      <header className="header">
        <h1>AssembleJS Authentication</h1>
        <nav className="nav">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/profile" className="active">Profile</a></li>
          </ul>
        </nav>
      </header>
      
      <main className="main-content">
        <div className="profile-wrapper" data-component="profile/profile"></div>
      </main>
      
      <footer className="footer">
        <p>AssembleJS Authentication Example</p>
      </footer>
    </div>
  );
};

export default ProfilePage;
```

## Advanced Topics

### Secure Cookie Storage

For better security, consider using HTTP-only cookies instead of localStorage:

```typescript
// Updated auth.service.ts constructor
constructor(options: AuthOptions) {
  super();
  this.apiUrl = options.apiUrl;
  this.tokenKey = options.tokenKey || 'auth_token';
  this.refreshTokenKey = options.refreshTokenKey || 'refresh_token';
  
  // Note: With HTTP-only cookies, we don't manually load tokens
  // as they're automatically sent with requests
}

// Login response would set HTTP-only cookies from the server
async login(username: string, password: string): Promise<User> {
  try {
    const response = await fetch(`${this.apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include' // Important for cookies
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.currentUser = data.user;
    return data.user;
    
    // Server will set HTTP-only cookies; no need to store tokens manually
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

### Role-Based Access Control

Extend your auth guard to support role-based access:

```typescript
// Add to auth.guard.ts
/**
 * Middleware to require specific roles
 */
public requireRole(roles: string[], controller: BlueprintController): void {
  controller.hooks.onRoute.add(async (request, reply) => {
    // First check if authenticated
    const isAuthenticated = this.checkServerAuthentication(request.headers.cookie);
    
    if (!isAuthenticated) {
      return reply.redirect(`/login?redirect=${encodeURIComponent(request.url)}`);
    }
    
    // Then check roles
    const userRoles = this.getUserRoles(request.headers.cookie);
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
  });
}

private getUserRoles(cookieHeader?: string): string[] {
  if (!cookieHeader) {
    return [];
  }
  
  // In a real implementation, you would extract roles from the JWT token
  // For this example, we'll return a hardcoded role
  return ['user'];
}
```

### Multi-Factor Authentication

Add support for multi-factor authentication:

```typescript
// Add to auth.service.ts
async requestMfaCode(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${this.apiUrl}/mfa/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ userId }),
      credentials: 'include'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error requesting MFA code:', error);
    return false;
  }
}

async verifyMfaCode(userId: string, code: string): Promise<boolean> {
  try {
    const response = await fetch(`${this.apiUrl}/mfa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ userId, code }),
      credentials: 'include'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error verifying MFA code:', error);
    return false;
  }
}
```

## Conclusion

This cookbook has demonstrated how to implement a complete authentication system in AssembleJS applications using JWT tokens. We've covered creating authentication services, protected routes, login/logout functionality, and profile management. The advanced topics show how to enhance security with HTTP-only cookies, implement role-based access control, and add multi-factor authentication.

By following these patterns, you can build secure applications that properly authenticate and authorize users while maintaining a good user experience. Remember that security is critical, so always follow best practices like HTTPS, secure password storage, and protection against common attacks such as CSRF and XSS.