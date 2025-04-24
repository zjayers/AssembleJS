# Deployment Guide

This guide covers the best practices for deploying AssembleJS applications to various environments, from simple static hosting to complex containerized deployments.

## Preparing for Deployment

Before deploying your AssembleJS application, ensure you have:

1. Run a production build using `npm run build` or `yarn build`
2. Tested your application thoroughly in a staging environment
3. Set up environment variables for different deployment targets
4. Optimized assets for production

### Production Build

AssembleJS provides an optimized build process that:

- Minifies JavaScript and CSS
- Optimizes images and other assets
- Applies tree-shaking for smaller bundles
- Splits code intelligently for better caching
- Pre-renders static content where possible

Run a production build with:

```bash
# Using npm
npm run build

# Using yarn
yarn build
```

This creates a production-ready build in the `dist` directory.

## Deployment Options

AssembleJS applications can be deployed to various platforms, depending on your needs:

### Static Hosting (JAMstack)

For highly cacheable applications with minimal server requirements:

#### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize Netlify configuration (if not already present)
netlify init

# Deploy the site
netlify deploy --prod
```

Create a `netlify.toml` file in your project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy the site
vercel --prod
```

Create a `vercel.json` file in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "buildCommand": "npm run build",
        "outputDirectory": "dist"
      }
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Server Deployment

For applications requiring server-side rendering or API functionality:

#### Node.js Server

AssembleJS applications run on Node.js servers by default:

1. Transfer your production files to the server:
   - `dist/` directory
   - `package.json`
   - `.env.production` (if used)

2. Install production dependencies:
   ```bash
   npm ci --only=production
   ```

3. Start the server:
   ```bash
   NODE_ENV=production node dist/server.js
   ```

#### PM2 for Process Management

Use PM2 to ensure your application stays running:

```bash
# Install PM2
npm install -g pm2

# Start the application with PM2
pm2 start dist/server.js --name "assemblejs-app"

# Configure PM2 to start on system boot
pm2 startup
pm2 save
```

### Docker Deployment

Containerize your AssembleJS application for consistent deployment:

Create a `Dockerfile` in your project root:

```dockerfile
# Build stage
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:16-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/.env.production ./.env.production

RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

Build and run the Docker container:

```bash
# Build the Docker image
docker build -t assemblejs-app .

# Run the container
docker run -p 3000:3000 -d assemblejs-app
```

### Kubernetes Deployment

For scaling and orchestrating multiple instances:

Create a `kubernetes.yaml` file:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: assemblejs-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: assemblejs-app
  template:
    metadata:
      labels:
        app: assemblejs-app
    spec:
      containers:
      - name: assemblejs-app
        image: assemblejs-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          limits:
            cpu: "0.5"
            memory: "512Mi"
          requests:
            cpu: "0.2"
            memory: "256Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: assemblejs-app-service
spec:
  selector:
    app: assemblejs-app
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

Apply the configuration:

```bash
kubectl apply -f kubernetes.yaml
```

## Environment Variables

Properly manage environment variables for different deployment environments:

```bash
# .env.development
API_URL=http://localhost:8080/api
DEBUG=true

# .env.production
API_URL=https://api.yourservice.com
DEBUG=false
```

In your application, access these variables:

```typescript
// Using environment variables safely
const apiUrl = process.env.API_URL || 'https://api.yourservice.com';
const debug = process.env.DEBUG === 'true';
```

## CDN Integration

For improved performance, use a Content Delivery Network (CDN):

### Setup with AWS CloudFront

1. Create a CloudFront distribution
2. Set your origin to your deployed application
3. Configure caching behavior:
   - Cache static assets (JS, CSS, images) with a long TTL
   - Set appropriate headers for cache control

### Asset Path Configuration

Update your AssembleJS configuration to use the CDN URL for assets:

```typescript
// In your build configuration
export default {
  // Other config...
  assetPathPrefix: process.env.NODE_ENV === 'production'
    ? 'https://cdn.yourdomain.com'
    : '',
  // More config...
};
```

## Server Optimization

Optimize your server for production:

### Compression

Enable compression for faster page loads:

```typescript
import compression from 'compression';

// In your server setup
server.use(compression());
```

### CORS Configuration

Set up CORS policies correctly:

```typescript
import cors from 'cors';

// In your server setup
server.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Security Headers

Implement security headers:

```typescript
import helmet from 'helmet';

// In your server setup
server.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.yourdomain.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.yourdomain.com'],
      imgSrc: ["'self'", 'data:', 'https://cdn.yourdomain.com'],
      connectSrc: ["'self'", 'https://api.yourdomain.com']
    }
  }
}));
```

## Continuous Integration/Deployment

Automate your deployment with CI/CD pipelines:

### GitHub Actions

Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Production
      uses: netlify/actions/cli@master
      with:
        args: deploy --prod
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### GitLab CI

Create a `.gitlab-ci.yml` file:

```yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: node:16
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  image: node:16
  script:
    - npm ci
    - npm test

deploy:
  stage: deploy
  image: node:16
  script:
    - npm install -g netlify-cli
    - netlify deploy --prod --auth $NETLIFY_AUTH_TOKEN --site $NETLIFY_SITE_ID
  only:
    - main
```

## Monitoring in Production

Set up monitoring for your deployed application:

### Application Performance Monitoring

Integrate with a monitoring service like New Relic or DataDog:

```typescript
import newrelic from 'newrelic';

// In your server setup
server.use((req, res, next) => {
  newrelic.setTransactionName(`${req.method} ${req.route.path}`);
  next();
});
```

### Error Tracking

Implement error tracking with a service like Sentry:

```typescript
import * as Sentry from '@sentry/node';

// Initialize Sentry
Sentry.init({
  dsn: 'https://your-sentry-dsn.io/project',
  environment: process.env.NODE_ENV
});

// In your server setup
server.use(Sentry.Handlers.requestHandler());

// Error handler
server.use(Sentry.Handlers.errorHandler());
```

### Logging

Set up proper logging for production:

```typescript
import winston from 'winston';

// Create a logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// In production, also log to the console
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Usage
logger.info('Server started on port 3000');
```

## Deployment Checklist

Before going live, verify:

1. **Performance**
   - Run Lighthouse tests for performance scores
   - Check bundle sizes with `npm run analyze`
   - Verify efficient loading of assets

2. **Security**
   - Ensure all API endpoints are properly secured
   - Check for exposed environment variables
   - Run security audits with `npm audit`

3. **SEO & Accessibility**
   - Verify meta tags and OpenGraph data
   - Check accessibility with tools like axe
   - Ensure proper semantic HTML structure

4. **Browser Compatibility**
   - Test across major browsers (Chrome, Firefox, Safari, Edge)
   - Verify responsive design on different screen sizes
   - Check for polyfills for older browsers if needed

5. **Backup & Recovery**
   - Implement database backups if applicable
   - Document recovery procedures
   - Test restoration from backups

## Next Steps

After deploying your application, consider:

- Setting up [Performance Optimization](performance-optimization.md) strategies
- Implementing [Testing](testing-guide.md) processes
- Exploring [Advanced Security](advanced-security.md) measures

With these deployment strategies, your AssembleJS application will be ready for production use with reliability, performance, and security.