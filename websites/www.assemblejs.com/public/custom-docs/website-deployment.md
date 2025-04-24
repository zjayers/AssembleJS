# Website Deployment Guide

AssembleJS websites are deployed to AWS S3 and optionally served through CloudFront for global content delivery. This guide explains the deployment architecture, setup process, and how to add new websites to the deployment pipeline.

## Deployment Architecture

The deployment system uses a modular architecture with the following components:

1. **Main Orchestrator Workflow** (`deploy-websites.yml`): Detects changed websites and triggers specific deployments.
2. **Website-Specific Workflows** (e.g., `deploy-website-assemblejs.yml`): Handle the build and deployment for each website.
3. **Website Template** (`deploy-website-template.yml`): Template for adding new website deployments.

### Deployment Paths

Websites are deployed to different S3 paths based on the deployment environment and version:

- **Staging (@next versions)**:
  - Path: `s3://assemblejs-websites/next/`
  - URL: `https://staging.assemblejs.com/next/`

- **Staging (Non-@next versions)**:
  - Path: `s3://assemblejs-websites/staging/`
  - URL: `https://staging.assemblejs.com/staging/`

- **Production**:
  - Version-specific path: `s3://assemblejs-websites/v1.2.3/`
  - Root path (main website only): `s3://assemblejs-websites/`
  - URLs:
    - `https://assemblejs.com/v1.2.3/`
    - `https://assemblejs.com/` (main website only)

## AWS Setup

To support the deployment infrastructure, the following AWS resources are required:

### S3 Buckets

- **Website Bucket**: `assemblejs-websites`
  - Public read access
  - Static website hosting enabled
  - CORS configured for cross-origin access
  - Versioning enabled (recommended)

Example bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::assemblejs-websites/*"
    }
  ]
}
```

### CloudFront Distribution

- **Origin**: The S3 bucket
- **Default behavior**: 
  - Compress objects automatically
  - Redirect HTTP to HTTPS
  - Cache based on headers
  - Use all edge locations
- **Custom Behaviors**:
  - Short cache time for HTML files
  - Long cache time for static assets

Example CloudFront configuration:

```yaml
Origins:
  - DomainName: assemblejs-websites.s3.amazonaws.com
    Id: S3Origin
    S3OriginConfig:
      OriginAccessIdentity: ""

DefaultCacheBehavior:
  TargetOriginId: S3Origin
  ViewerProtocolPolicy: redirect-to-https
  Compress: true
  MinTTL: 0
  DefaultTTL: 86400
  MaxTTL: 31536000
  ForwardedValues:
    QueryString: false
    Cookies:
      Forward: none

CustomErrorResponses:
  - ErrorCode: 404
    ResponsePagePath: /index.html
    ResponseCode: 200
    ErrorCachingMinTTL: 300
```

### IAM Role for GitHub Actions

Create an IAM role with the following:

- **Trust Relationship**: Allow GitHub Actions OIDC provider
- **Permissions**:
  - S3 bucket write access
  - CloudFront invalidation permissions

Example trust relationship:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:assemblejs/assemblejs:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

Example permissions policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::assemblejs-websites",
        "arn:aws:s3:::assemblejs-websites/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

## GitHub Workflows

### Main Orchestrator Workflow

The main workflow (`deploy-websites.yml`) handles:

1. Detecting which websites have changed
2. Triggering the appropriate website-specific workflows
3. Handling both automatic deployments (on push to main) and manual deployments

Example workflow:

```yaml
name: Deploy Websites

on:
  push:
    branches: [main]
    paths:
      - 'websites/**'
  workflow_dispatch:
    inputs:
      website:
        description: 'Website to deploy (leave empty to detect changes)'
        required: false
        type: string

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      websites: ${{ steps.filter.outputs.websites }}
    steps:
      - uses: actions/checkout@v3
      
      - name: Detect changed websites
        id: filter
        run: |
          if [ -n "${{ github.event.inputs.website }}" ]; then
            echo "websites=[\"${{ github.event.inputs.website }}\"]" >> $GITHUB_OUTPUT
          else
            # Logic to detect changed websites
            changed_websites=$(git diff --name-only HEAD~1 HEAD | grep -oP 'websites/\K[^/]+' | sort -u | jq -R -s -c 'split("\n")[:-1]')
            echo "websites=$changed_websites" >> $GITHUB_OUTPUT
          fi
  
  deploy:
    needs: detect-changes
    strategy:
      matrix:
        website: ${{ fromJson(needs.detect-changes.outputs.websites) }}
    uses: ./.github/workflows/deploy-website-${{ matrix.website }}.yml
```

### Website-Specific Workflow

Each website has its own deployment workflow:

```yaml
name: Deploy AssembleJS Website

on:
  workflow_call:
    inputs:
      environment:
        description: 'Deployment environment'
        default: 'production'
        required: false
        type: string

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    
    permissions:
      id-token: write
      contents: read
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: cd websites/assemblejs.com && npm ci
      
      - name: Build website
        run: cd websites/assemblejs.com && npm run build
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          version=$(node -p "require('./package.json').version")
          
          # Deploy to version-specific path
          aws s3 sync websites/assemblejs.com/build/ s3://assemblejs-websites/v$version/ --delete
          
          # If this is the main website, also deploy to root
          if [[ "${{ matrix.website }}" == "assemblejs" ]]; then
            aws s3 sync websites/assemblejs.com/build/ s3://assemblejs-websites/ --delete
          fi
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## Adding New Websites

To add a new website for deployment:

1. **Create the website directory** in the `websites` folder
   ```bash
   mkdir -p websites/my-new-website
   ```

2. **Copy the template workflow file** for deployment
   ```bash
   cp .github/workflows/deploy-website-template.yml .github/workflows/deploy-website-my-new-website.yml
   ```

3. **Edit the new workflow file** to replace all instances of `WEBSITE_NAME` with your website name
   ```bash
   sed -i 's/WEBSITE_NAME/my-new-website/g' .github/workflows/deploy-website-my-new-website.yml
   ```

4. **Configure environment variables** in the GitHub repository
   - Add appropriate secrets for AWS credentials
   - Configure environment-specific variables if needed

5. **Add the website to the trigger list** in the main workflow file if needed
   ```yaml
   on:
     push:
       branches: [main]
       paths:
         - 'websites/**'
         - 'packages/**'  # If the website depends on shared packages
   ```

## Testing Deployments

Before triggering a production deployment, you can test your deployment in a staging environment:

1. **Push to a non-main branch** to trigger a staging deployment
   ```bash
   git checkout -b feature/my-new-website
   git add .
   git commit -m "Add new website"
   git push origin feature/my-new-website
   ```

2. **Manual deployment to staging** using the workflow dispatch feature
   - Go to Actions tab in GitHub
   - Select "Deploy Websites" workflow
   - Click "Run workflow"
   - Select appropriate branch
   - Enter your website name in the input
   - Choose "staging" as the environment

## Monitoring Deployments

Once deployed, you can monitor your website using:

1. **AWS CloudWatch**: For S3 and CloudFront metrics
2. **GitHub Actions**: For deployment logs and status
3. **External monitoring tools**: Set up uptime and performance monitoring

## Security Considerations

- Ensure S3 bucket has appropriate access controls
- Use versioning to enable rollbacks if needed
- Store secrets securely in GitHub repository settings
- Follow principle of least privilege for IAM roles
- Enable S3 bucket logging for auditing purposes

## Optimizations

- Enable CloudFront compression for faster content delivery
- Set appropriate cache headers based on content type
- Use a CDN for global distribution
- Configure error pages for better user experience
- Set up redirection rules for backward compatibility

## Related Topics

- [Deployment Guide](deployment-guide)
- [RIVET Deployment System](rivet-deployment-system)
- [Performance Optimization](performance-optimization)
- [Security Best Practices](advanced-security)