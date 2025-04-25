# Rivet - Deployment System

The `rivet` command is AssembleJS's comprehensive deployment system that simplifies the process of deploying your applications to various environments and platforms.

## Overview

Rivet handles the complex orchestration involved in deploying AssembleJS applications - from building and optimizing your code to configuring servers, managing environment variables, and monitoring deployments. It supports multiple deployment targets and strategies, making it adaptable to a wide range of project requirements.

## Installation

Rivet is included with the AssembleJS CLI. If you've installed the AssembleJS CLI, you already have access to Rivet.

```bash
# Verify installation
npx rivet --version
```

## Basic Usage

```bash
# Deploy to the default environment (usually development)
npx rivet deploy

# Deploy to a specific environment
npx rivet deploy --env production

# Generate deployment configuration
npx rivet init

# View deployment status
npx rivet status
```

## Command Reference

### `rivet init`

Initializes a new Rivet configuration in your project.

```bash
npx rivet init [options]
```

Options:
- `--template <name>` - Use a specific template (aws, azure, gcp, vercel, netlify)
- `--force` - Overwrite existing configuration
- `--interactive` - Run in interactive mode (guided setup)

### `rivet deploy`

Deploys your application.

```bash
npx rivet deploy [options]
```

Options:
- `--env <environment>` - Deploy to specific environment (dev, staging, production)
- `--config <path>` - Use specific configuration file
- `--dry-run` - Simulate deployment without making changes
- `--verbose` - Show detailed deployment logs
- `--skip-build` - Skip build step (use existing build artifacts)
- `--skip-tests` - Skip running tests before deployment
- `--incremental` - Perform incremental deployment (when supported)
- `--rollback <id>` - Rollback to a specific deployment

### `rivet status`

Shows the status of your deployments.

```bash
npx rivet status [options]
```

Options:
- `--env <environment>` - Show status for specific environment
- `--watch` - Watch for status changes in real-time
- `--json` - Output status in JSON format

### `rivet logs`

Shows deployment and application logs.

```bash
npx rivet logs [options]
```

Options:
- `--env <environment>` - Show logs for specific environment
- `--follow` - Follow logs in real-time
- `--tail <n>` - Show last n log entries
- `--filter <pattern>` - Filter logs by pattern

### `rivet rollback`

Rolls back to a previous deployment.

```bash
npx rivet rollback [id] [options]
```

Options:
- `--env <environment>` - Rollback in specific environment
- `--force` - Force rollback without confirmation
- `--to-previous` - Rollback to immediately previous deployment

## Configuration

Rivet is configured through a `rivet.config.js` file in your project root.

```javascript
// rivet.config.js
module.exports = {
  // Project configuration
  project: {
    name: 'my-assemblejs-app',
    buildCommand: 'npm run build',
    outputDir: 'dist'
  },
  
  // Environment configurations
  environments: {
    // Development environment
    development: {
      platform: 'vercel',
      domain: 'dev.myapp.com',
      variables: {
        NODE_ENV: 'development',
        API_URL: 'https://dev-api.myapp.com'
      }
    },
    
    // Production environment
    production: {
      platform: 'aws',
      domain: 'myapp.com',
      variables: {
        NODE_ENV: 'production',
        API_URL: 'https://api.myapp.com'
      },
      scaling: {
        minInstances: 2,
        maxInstances: 10
      },
      cdn: {
        enabled: true
      }
    }
  },
  
  // Platform configurations
  platforms: {
    aws: {
      region: 'us-west-2',
      services: {
        compute: 'lambda',
        storage: 's3',
        cdn: 'cloudfront'
      }
    },
    vercel: {
      team: 'my-team',
      projectId: 'proj_123456'
    }
  },
  
  // Optimization settings
  optimization: {
    minify: true,
    splitChunks: true,
    treeshake: true,
    lazyLoad: true
  },
  
  // Notification settings
  notifications: {
    slack: {
      webhook: 'https://hooks.slack.com/services/XXX/YYY/ZZZ'
    },
    email: ['team@mycompany.com']
  },
  
  // Hooks
  hooks: {
    preDeploy: 'npm run test',
    postDeploy: 'npm run e2e-tests'
  }
};
```

## Supported Platforms

Rivet supports deploying to multiple platforms:

- **Cloud Providers**
  - AWS (Lambda, EC2, ECS, S3, CloudFront)
  - Google Cloud (Cloud Functions, Cloud Run, App Engine)
  - Azure (Functions, App Service)
  
- **Specialized Platforms**
  - Vercel
  - Netlify
  - Cloudflare Workers
  - Digital Ocean App Platform
  
- **Containerization**
  - Docker
  - Kubernetes

## Deployment Strategies

Rivet supports several deployment strategies:

- **Basic Deployment** - Simple replace deployment
- **Blue-Green Deployment** - Zero downtime deployment with two identical environments
- **Canary Deployment** - Gradual rollout to a percentage of users
- **A/B Testing** - Deploy multiple versions simultaneously to test features

## CI/CD Integration

Rivet can be easily integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow with Rivet
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - name: Deploy to production
        run: npx rivet deploy --env production
        env:
          RIVET_TOKEN: ${{ secrets.RIVET_TOKEN }}
```

## Best Practices

1. **Environment Configuration** - Keep environment-specific configuration in Rivet
2. **Infrastructure as Code** - Use Rivet to define your infrastructure
3. **Automated Deployments** - Integrate Rivet with your CI/CD pipeline
4. **Monitoring** - Use Rivet's monitoring capabilities to track deployment health
5. **Rollback Plan** - Always have a rollback strategy for production deployments

## Advanced Topics

### Custom Deployment Plugins

You can extend Rivet with custom plugins for specialized deployment needs:

```javascript
// rivet-custom-platform.js
module.exports = {
  name: 'custom-platform',
  
  // Deploy implementation
  async deploy(config, context) {
    // Implementation details...
  },
  
  // Rollback implementation
  async rollback(deploymentId, config, context) {
    // Implementation details...
  }
};
```

### Multi-Region Deployments

Rivet supports deploying to multiple geographic regions:

```javascript
// rivet.config.js
module.exports = {
  // ...
  environments: {
    production: {
      regions: [
        {
          name: 'us',
          platform: 'aws',
          region: 'us-west-2'
        },
        {
          name: 'eu',
          platform: 'aws',
          region: 'eu-west-1'
        },
        {
          name: 'asia',
          platform: 'aws',
          region: 'ap-southeast-1'
        }
      ]
    }
  }
};
```

## Related Topics

- [Deployment Guide](deployment-guide)
- [Redline Code Quality Tool](redline-code-quality-tool)
- [Development Workflow](development-workflow)