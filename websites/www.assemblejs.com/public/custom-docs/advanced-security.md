# Security Best Practices in AssembleJS

Security is a crucial concern for any web application. AssembleJS provides several built-in security features and best practices to help you build secure applications. This guide covers the most important security considerations and how to implement them effectively.

## Core Security Principles

AssembleJS is built with these security principles in mind:

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Components only have access to what they need
3. **Secure by Default**: Security features enabled without extra configuration
4. **Fail Securely**: When errors occur, systems default to secure states
5. **Keep Security Simple**: Easy-to-implement best practices

## Server-Side Security

### Authentication and Authorization

AssembleJS provides a flexible authentication system:

```typescript
// Authentication service
export class AuthService extends Service {
  async verifyUser(username: string, password: string): Promise<User | null> {
    // Fetch user from database
    const user = await this.userRepository.findByUsername(username);
    
    if (!user) return null;
    
    // Verify password using secure comparison
    const passwordValid = await this.comparePassword(password, user.passwordHash);
    
    if (!passwordValid) return null;
    
    // Return user without sensitive data
    return this.sanitizeUser(user);
  }
  
  async generateToken(user: User): Promise<string> {
    // Generate a secure JWT token
    return jwt.sign(
      { id: user.id, role: user.role },
      this.config.jwtSecret,
      { expiresIn: '24h' }
    );
  }
  
  // More authentication methods
}

// Authentication controller
export class AuthController extends BlueprintController {
  @Inject()
  private authService: AuthService;
  
  async login(request, reply) {
    const { username, password } = request.body;
    
    // Validate input
    if (!username || !password) {
      return reply.code(400).send({ error: 'Username and password required' });
    }
    
    // Verify credentials
    const user = await this.authService.verifyUser(username, password);
    
    if (!user) {
      // Don't reveal which part was incorrect
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = await this.authService.generateToken(user);
    
    // Set secure, httpOnly cookie
    reply.setCookie('auth_token', token, {
      httpOnly: true,
      secure: this.environment.isProduction,
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    });
    
    return reply.send({ success: true, user: user });
  }
}
```

### Implementing Authorization

Secure your routes with role-based authorization:

```typescript
// Authorization hook
export function requireAuth(roles: string[] = []) {
  return async (request, reply) => {
    // Get token from cookie or Authorization header
    const token = request.cookies.auth_token || 
                 request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.code(401).send({ error: 'Authentication required' });
    }
    
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Check role if roles are specified
      if (roles.length && !roles.includes(decoded.role)) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }
      
      // Attach user to request
      request.user = decoded;
      
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }
  };
}

// Using the authorization hook
export class UserController extends BlueprintController {
  setup() {
    // Public endpoints
    this.get('/', this.getPublicUserProfile);
    
    // Protected endpoints
    this.get('/profile', { preHandler: requireAuth() }, this.getProfile);
    this.put('/profile', { preHandler: requireAuth() }, this.updateProfile);
    
    // Admin-only endpoints
    this.get('/users', { preHandler: requireAuth(['admin']) }, this.getAllUsers);
    this.delete('/users/:id', { preHandler: requireAuth(['admin']) }, this.deleteUser);
  }
}
```

### Content Security Policy (CSP)

Configure a strong Content Security Policy to prevent XSS and other injection attacks:

```typescript
// Set up CSP in your server configuration
export function setupSecurityHeaders(server) {
  server.register(require('fastify-helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'strict-dynamic'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https://static.example.com'],
        connectSrc: ["'self'", 'https://api.example.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: []
      }
    }
  });
}

// Generate nonce for each request
server.addHook('onRequest', (request, reply, done) => {
  // Generate a random nonce for this request
  const nonce = crypto.randomBytes(16).toString('base64');
  reply.locals = reply.locals || {};
  reply.locals.cspNonce = nonce;
  done();
});
```

### CSRF Protection

Protect against Cross-Site Request Forgery attacks:

```typescript
// Set up CSRF protection
server.register(require('fastify-csrf'), {
  cookieOpts: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Add CSRF token to all form submissions
export class BaseController extends BlueprintController {
  preRender(context) {
    // Add CSRF token to all rendered views
    context.data.set('csrfToken', this.request.csrfToken());
  }
}

// Use the token in form submissions
export function ContactForm(context) {
  return (
    <form action="/contact" method="post">
      <input type="hidden" name="_csrf" value={context.data.csrfToken} />
      {/* Form fields */}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Rate Limiting

Protect your APIs from abuse with rate limiting:

```typescript
// Set up rate limiting
server.register(require('fastify-rate-limit'), {
  max: 100, // Max 100 requests
  timeWindow: '1 minute', // Per minute
  
  // Custom handler for rate limit exceeded
  errorResponseBuilder: (request, context) => {
    return {
      code: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${context.after}`,
      expiresIn: context.after
    };
  }
});

// Apply different limits to different routes
export class AuthController extends BlueprintController {
  setup() {
    // More strict rate limiting for sensitive endpoints
    this.post('/login', { 
      config: { 
        rateLimit: { 
          max: 5,
          timeWindow: '15 minutes'
        } 
      }
    }, this.login);
    
    // Even stricter for password reset
    this.post('/reset-password', { 
      config: { 
        rateLimit: { 
          max: 3,
          timeWindow: '60 minutes'
        } 
      }
    }, this.resetPassword);
  }
}
```

## Client-Side Security

### Secure State Management

Keep sensitive data out of client-side state:

```typescript
// Example of a secure user store
export const userStore = createStore({
  state: {
    // Never store sensitive information like passwords or tokens
    id: null,
    username: null,
    displayName: null,
    email: null,
    role: null,
    isAuthenticated: false,
    preferences: {}
  },
  
  actions: {
    setUser(state, user) {
      // Clean the user object to ensure no sensitive data
      return {
        ...state,
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        isAuthenticated: true
      };
    },
    
    clearUser(state) {
      return {
        ...state,
        id: null,
        username: null,
        displayName: null,
        email: null,
        role: null,
        isAuthenticated: false,
        preferences: {}
      };
    }
  }
});
```

### Sanitizing User Input

Properly handle user input to prevent XSS and injection attacks:

```typescript
// Utility for input sanitization
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Component using sanitization
export function CommentDisplay(context) {
  const { comment } = context.data;
  
  return (
    <div className="comment">
      <h3>{sanitizeInput(comment.author)}</h3>
      <p>{sanitizeInput(comment.text)}</p>
      <footer>Posted on: {new Date(comment.timestamp).toLocaleDateString()}</footer>
    </div>
  );
}

// Form handling with sanitization
export class CommentController extends BlueprintController {
  async addComment(request, reply) {
    const { text } = request.body;
    
    // Validation
    if (!text || text.length > 1000) {
      return reply.code(400).send({ error: 'Comment must be between 1 and 1000 characters' });
    }
    
    // Create comment with sanitized input
    const comment = await this.commentService.create({
      author: request.user.username,
      authorId: request.user.id,
      text: sanitizeInput(text),
      timestamp: new Date()
    });
    
    return reply.send({ success: true, comment });
  }
}
```

### Secure Event Communication

Secure the event system to prevent leaking sensitive information:

```typescript
// Secure event filtering
events.addFilter((event, listener) => {
  // Don't allow subscribers to receive sensitive events unless authorized
  if (event.address.startsWith('user.private.') && !isAuthorized(listener, event)) {
    return false;
  }
  
  // Sensitive data can be filtered out
  if (event.address === 'user.profile.updated') {
    // Clone the event to avoid modifying the original
    const safeEvent = { ...event };
    
    // Remove sensitive fields if present
    if (safeEvent.data.password) delete safeEvent.data.password;
    if (safeEvent.data.token) delete safeEvent.data.token;
    
    return safeEvent;
  }
  
  return event;
});

// Helper function to check if a listener is authorized
function isAuthorized(listener, event) {
  // Implementation depends on your authentication system
  return listener.userId === event.data.userId || listener.role === 'admin';
}
```

## Data Validation and Sanitization

### Input Validation

Implement thorough validation for all inputs:

```typescript
import { z } from 'zod';

// Define validation schemas
const UserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  role: z.enum(['user', 'admin']).default('user')
});

// Use schemas in controllers
export class UserController extends BlueprintController {
  setup() {
    this.post('/', {
      schema: {
        body: UserSchema
      }
    }, this.createUser);
  }
  
  async createUser(request, reply) {
    // The request is already validated thanks to schema
    const userData = request.body;
    
    // Process the validated data
    const newUser = await this.userService.create(userData);
    
    return reply.code(201).send(newUser);
  }
}
```

### Secure File Uploads

Handle file uploads securely:

```typescript
// Secure file upload configuration
const fileUploadConfig = {
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Check mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, and GIF files are allowed'));
    }
    
    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Only JPG, PNG, and GIF files are allowed'));
    }
    
    cb(null, true);
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Store files in a non-public directory
      cb(null, '/path/to/secure/uploads');
    },
    filename: (req, file, cb) => {
      // Use a secure, random filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  })
};

// File upload handling
export class MediaController extends BlueprintController {
  setup() {
    this.post('/upload', { 
      preHandler: this.upload.single('file'),
      preValidation: requireAuth()
    }, this.handleUpload);
  }
  
  async handleUpload(request, reply) {
    // File is already validated and stored
    const file = request.file;
    
    // Process the file (e.g., scan for viruses, resize images)
    await this.mediaService.processUpload(file);
    
    // Store metadata in database with user ownership
    const mediaItem = await this.mediaService.createMediaItem({
      userId: request.user.id,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    });
    
    return reply.send({
      success: true,
      mediaId: mediaItem.id,
      url: `/media/${mediaItem.id}`
    });
  }
  
  // Secure media serving
  async getMedia(request, reply) {
    const { id } = request.params;
    
    // Fetch media metadata
    const media = await this.mediaService.getById(id);
    
    if (!media) {
      return reply.code(404).send({ error: 'Media not found' });
    }
    
    // Check permissions
    if (media.isPrivate && media.userId !== request.user?.id) {
      return reply.code(403).send({ error: 'Access denied' });
    }
    
    // Send the file
    return reply.sendFile(path.basename(media.path), path.dirname(media.path));
  }
}
```

## Database Security

### Query Parameters

Use parameterized queries to prevent SQL injection:

```typescript
// WRONG - Vulnerable to SQL injection
async function unsafeQuery(userId) {
  return db.query(`SELECT * FROM users WHERE id = ${userId}`);
}

// RIGHT - Using parameterized query
async function safeQuery(userId) {
  return db.query('SELECT * FROM users WHERE id = $1', [userId]);
}

// Example service with secure queries
export class UserService extends Service {
  async findByUsername(username) {
    return this.db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
  }
  
  async updateProfile(userId, data) {
    return this.db.query(
      'UPDATE users SET name = $1, email = $2, bio = $3 WHERE id = $4 RETURNING *',
      [data.name, data.email, data.bio, userId]
    );
  }
}
```

### Data Encryption

Encrypt sensitive data before storing:

```typescript
// Utility for encryption
export class EncryptionService extends Service {
  constructor() {
    super();
    this.algorithm = 'aes-256-gcm';
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }
  
  encrypt(text) {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the auth tag
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return everything needed for decryption
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag
    };
  }
  
  decrypt(data) {
    // Create decipher
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(data.iv, 'hex')
    );
    
    // Set auth tag
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
    
    // Decrypt the data
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Example user service that encrypts sensitive data
export class UserService extends Service {
  @Inject()
  private encryptionService: EncryptionService;
  
  async createUser(userData) {
    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12);
    
    // Encrypt sensitive information
    const encryptedSSN = userData.ssn ? 
      this.encryptionService.encrypt(userData.ssn) : null;
    
    // Store user with encrypted data
    const user = await this.db.query(
      `INSERT INTO users (
        username, email, password_hash, encrypted_ssn, encrypted_ssn_iv, encrypted_ssn_auth_tag
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        userData.username,
        userData.email,
        passwordHash,
        encryptedSSN?.encrypted,
        encryptedSSN?.iv,
        encryptedSSN?.authTag
      ]
    );
    
    return this.sanitizeUser(user);
  }
  
  async getSSN(userId) {
    // Verify the user has permission to access this data
    if (!this.hasPermission(userId, 'view_ssn')) {
      throw new Error('Access denied');
    }
    
    // Retrieve encrypted data
    const userData = await this.db.query(
      `SELECT encrypted_ssn, encrypted_ssn_iv, encrypted_ssn_auth_tag 
       FROM users WHERE id = $1`,
      [userId]
    );
    
    if (!userData || !userData.encrypted_ssn) {
      return null;
    }
    
    // Decrypt the data
    return this.encryptionService.decrypt({
      encrypted: userData.encrypted_ssn,
      iv: userData.encrypted_ssn_iv,
      authTag: userData.encrypted_ssn_auth_tag
    });
  }
}
```

## Logging and Monitoring

### Secure Logging

Implement proper logging without exposing sensitive information:

```typescript
export class SecureLogger extends Service {
  private sensitiveFields = [
    'password', 'token', 'secret', 'ssn', 'creditCard', 'cvv'
  ];
  
  info(message, data) {
    this.log('info', message, data);
  }
  
  error(message, data) {
    this.log('error', message, data);
  }
  
  warn(message, data) {
    this.log('warn', message, data);
  }
  
  private log(level, message, data) {
    // Sanitize data to remove sensitive information
    const sanitizedData = data ? this.sanitize(data) : undefined;
    
    // Log the sanitized information
    console[level](message, sanitizedData);
    
    // In production, would send to proper logging service
    if (this.environment.isProduction) {
      this.loggingService.log(level, message, sanitizedData);
    }
  }
  
  private sanitize(data) {
    if (!data) return data;
    
    // Handle different data types
    if (typeof data !== 'object') return data;
    if (data instanceof Date) return data;
    
    // Clone the object to avoid modifying the original
    const result = Array.isArray(data) ? [...data] : { ...data };
    
    // Recursively sanitize nested objects
    for (const key in result) {
      // Check if this is a sensitive field
      if (this.sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        result[key] = '[REDACTED]';
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        // Recursively sanitize nested objects
        result[key] = this.sanitize(result[key]);
      }
    }
    
    return result;
  }
}
```

### Security Monitoring

Set up monitoring for security events:

```typescript
// Security monitoring service
export class SecurityMonitor extends Service {
  @Inject()
  private logger: SecureLogger;
  
  initialize() {
    // Listen for security-related events
    events.on('auth.login.failed', this.handleFailedLogin.bind(this));
    events.on('auth.password.reset', this.handlePasswordReset.bind(this));
    events.on('user.role.changed', this.handleRoleChange.bind(this));
    events.on('security.violation', this.handleSecurityViolation.bind(this));
  }
  
  async handleFailedLogin(event) {
    const { username, ip, userAgent, timestamp } = event.data;
    
    // Log the event
    this.logger.warn('Failed login attempt', {
      username,
      ip,
      userAgent,
      timestamp
    });
    
    // Check for brute force attempts
    const recentFailures = await this.getRecentFailures(username, ip);
    
    if (recentFailures >= 5) {
      // Trigger account lockout
      await this.lockAccount(username);
      
      // Notify admin
      this.notifyAdmin('Possible brute force attack', {
        username,
        ip,
        attempts: recentFailures
      });
    }
  }
  
  // Other event handlers
  
  async notifyAdmin(subject, data) {
    // Send notification to security admin
    if (this.environment.isProduction) {
      await this.notificationService.send({
        channel: 'security',
        subject,
        data,
        priority: 'high'
      });
    } else {
      console.warn('SECURITY ALERT:', subject, data);
    }
  }
}
```

## Deployment Security

### Secrets Management

Never hardcode secrets in your codebase:

```typescript
// server.config.ts

// Load environment variables from appropriate source
import dotenv from 'dotenv';

// Load different env files based on environment
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';

dotenv.config({ path: envFile });

// Configuration with secrets
export const config = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    }
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    tokenExpiry: process.env.TOKEN_EXPIRY || '24h',
    saltRounds: 12
  },
  email: {
    apiKey: process.env.EMAIL_API_KEY,
    from: process.env.EMAIL_FROM
  }
};

// Validate required configuration
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'EMAIL_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}
```

### Security Headers

Implement proper security headers:

```typescript
// Security headers setup
export function setupSecurityHeaders(server) {
  server.register(require('fastify-helmet'), {
    // Content Security Policy (covered above)
    
    // HTTP Strict Transport Security
    hsts: {
      maxAge: 15552000, // 180 days
      includeSubDomains: true,
      preload: true
    },
    
    // X-Frame-Options
    frameguard: {
      action: 'deny'
    },
    
    // X-Content-Type-Options
    contentTypeOptions: {
      nosniff: true
    },
    
    // X-XSS-Protection
    xssFilter: {
      reportUri: '/api/security/xss-report'
    },
    
    // Referrer-Policy
    referrerPolicy: {
      policy: 'same-origin'
    },
    
    // Feature-Policy / Permissions-Policy
    permissionsPolicy: {
      features: {
        camera: ["'none'"],
        geolocation: ["'self'"],
        microphone: ["'none'"],
        payment: ["'self'"]
      }
    }
  });
}
```

## Continuous Security Improvement

### Security Testing

Integrate security testing into your development workflow:

```typescript
// package.json
{
  "scripts": {
    // Other scripts
    "test:security": "npm run test:dependencies && npm run test:static && npm run test:integration",
    "test:dependencies": "npm audit",
    "test:static": "eslint --config .eslintrc.security.js .",
    "test:integration": "jest --config jest.security.config.js"
  },
  "devDependencies": {
    // Regular dependencies
    "eslint-plugin-security": "^1.4.0",
    "jest-security": "^1.0.0"
  }
}
```

### Security Updates

Keep dependencies updated:

```typescript
// Example GitHub Action for dependency updates
// .github/workflows/dependency-updates.yml
export const workflowFile = `
name: Dependency Updates

on:
  schedule:
    - cron: '0 0 * * 1'  # Run every Monday
  workflow_dispatch:     # Allow manual trigger

jobs:
  update-dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          
      - name: Check for updates
        run: npx npm-check-updates -u
        
      - name: Install dependencies
        run: npm install
        
      - name: Run tests
        run: npm test
        
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v4
        with:
          title: 'chore: update dependencies'
          body: 'Automated dependency updates'
          branch: 'deps-update'
          base: 'main'
          labels: 'dependencies'
`;
```

## Common Vulnerabilities and Mitigations

### XSS Prevention

Beyond CSP, implement these XSS protections:

```typescript
// Utility functions for XSS prevention
export const xss = {
  // Escape HTML entities
  escape(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },
  
  // Basic markup for allowed tags only
  sanitize(input, allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br']) {
    if (typeof input !== 'string') return input;
    
    // Very simple example - in production use a proper sanitizer
    const tempElement = document.createElement('div');
    tempElement.innerHTML = input;
    
    // Remove disallowed tags
    Array.from(tempElement.querySelectorAll('*')).forEach(el => {
      if (!allowedTags.includes(el.tagName.toLowerCase())) {
        el.parentNode?.replaceChild(
          document.createTextNode(el.outerHTML),
          el
        );
      }
      
      // Remove all attributes except for allowed ones on links
      if (el.tagName.toLowerCase() === 'a') {
        const href = el.getAttribute('href');
        // Only allow http, https, and mailto links
        if (href && /^(https?:\/\/|mailto:)/.test(href)) {
          const textContent = el.textContent;
          el.removeAttribute('onclick');
          el.removeAttribute('style');
          // Keep only safe attributes
          Array.from(el.attributes).forEach(attr => {
            if (attr.name !== 'href') {
              el.removeAttribute(attr.name);
            }
          });
        } else {
          // Remove unsafe links
          el.removeAttribute('href');
        }
      } else {
        // Remove all attributes from other tags
        Array.from(el.attributes).forEach(attr => {
          el.removeAttribute(attr.name);
        });
      }
    });
    
    return tempElement.innerHTML;
  }
};

// Component using the XSS utility
export function UserComment(context) {
  const { comment } = context.data;
  
  return (
    <div className="comment">
      <h3>{xss.escape(comment.author)}</h3>
      <div 
        className="comment-body"
        // Allow basic formatting but sanitize to prevent XSS
        dangerouslySetInnerHTML={{ __html: xss.sanitize(comment.text) }}
      ></div>
      <footer>Posted on: {new Date(comment.timestamp).toLocaleDateString()}</footer>
    </div>
  );
}
```

### SSRF Protection

Guard against Server-Side Request Forgery:

```typescript
// URL validation utility
export function validateUrl(url, options = {}) {
  const parsedUrl = new URL(url);
  
  // Block private IP ranges
  const blockedHosts = [
    '127.0.0.1', 'localhost', '0.0.0.0',
    '::1', '169.254.', '10.', '172.16.', '172.17.',
    '172.18.', '172.19.', '172.20.', '172.21.', '172.22.',
    '172.23.', '172.24.', '172.25.', '172.26.', '172.27.',
    '172.28.', '172.29.', '172.30.', '172.31.', '192.168.'
  ];
  
  // Check if host matches any blocked pattern
  if (blockedHosts.some(host => parsedUrl.hostname === host || 
                                parsedUrl.hostname.startsWith(host))) {
    return false;
  }
  
  // Allow only specific protocols
  const allowedProtocols = options.protocols || ['https:'];
  if (!allowedProtocols.includes(parsedUrl.protocol)) {
    return false;
  }
  
  // Optionally whitelist domains
  if (options.allowedDomains && options.allowedDomains.length > 0) {
    const domain = parsedUrl.hostname;
    if (!options.allowedDomains.some(allowedDomain => 
                                      domain === allowedDomain || 
                                      domain.endsWith(`.${allowedDomain}`))) {
      return false;
    }
  }
  
  return true;
}

// Using the URL validator in a service
export class ExternalApiService extends Service {
  async fetchResource(url) {
    // Validate URL before making request
    if (!validateUrl(url, {
      protocols: ['https:'],
      allowedDomains: ['api.example.com', 'cdn.example.com']
    })) {
      throw new Error('Invalid or disallowed URL');
    }
    
    // Safe to fetch
    return fetch(url);
  }
}
```

## Next Steps

Now that you understand security best practices in AssembleJS, explore these related topics:

- [Islands Architecture](advanced-islands-architecture.md) to learn about the component isolation model
- [Server-Side Rendering](advanced-server-side-rendering.md) for more on secure rendering practices
- [Cross-Framework State](advanced-cross-framework-state.md) to learn about secure state management
- [Component Lifecycle](advanced-component-lifecycle.md) for handling resources securely