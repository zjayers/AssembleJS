# GitHub Actions AWS Configuration Guide

This document explains how to configure AWS for GitHub Actions workflows using OIDC authentication.

## Setting up OIDC Authentication for GitHub Actions

### Step 1: Create an OIDC Identity Provider in AWS IAM

1. Sign in to the [AWS Management Console](https://console.aws.amazon.com/)
2. Go to the IAM console
3. In the navigation pane, choose **Identity providers**
4. Choose **Add Provider**
5. For **Provider Type**, select **OpenID Connect**
6. For **Provider URL**, enter: `https://token.actions.githubusercontent.com`
7. For **Audience**, enter: `sts.amazonaws.com`
8. Verify the provider information and choose **Add provider**

### Step 2: Create an IAM Role for GitHub Actions

1. In the IAM console, go to **Roles** and choose **Create role**
2. Select **Web Identity** as the trusted entity type
3. For **Identity provider**, select `token.actions.githubusercontent.com` (the one you just created)
4. For **Audience**, select `sts.amazonaws.com`
5. Under **Add a condition to restrict which repositories can use this role (optional)**, add:
   ```
   github:repo:zjayers/assemblejs:*
   ```
6. Choose **Next: Permissions**
7. Attach the required policies for your workflows:
   - For S3 website deployment: `AmazonS3FullAccess` (or a more restricted custom policy for specific buckets)
   - For CloudFront invalidations: `CloudFrontFullAccess` (or a more restricted custom policy)
8. Choose **Next: Tags** (add tags if needed)
9. Choose **Next: Review**
10. Enter a **Role name**, such as `GithubActionsAssembleJS`
11. Add a description like "Role for GitHub Actions in the AssembleJS repository"
12. Choose **Create role**

### Step 3: Configure GitHub Repository Secrets

In your GitHub repository, create the following repository secret:

1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click **New repository secret**
4. Add the following secret:
   - Name: `AWS_ROLE_ARN`
   - Value: The ARN of the role you created (e.g., `arn:aws:iam::123456789012:role/GithubActionsAssembleJS`)

### Step 4: Update GitHub Workflow Files

Make sure your workflow files use the OIDC authentication method:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: us-east-1
```

## Setting up S3 Buckets for Website Deployment

### Production Website Bucket

1. Create an S3 bucket named `www.assemblejs.com`:
   ```bash
   aws s3 mb s3://www.assemblejs.com
   ```

2. Enable static website hosting:
   ```bash
   aws s3 website s3://www.assemblejs.com --index-document index.html --error-document error.html
   ```

3. Configure bucket policy for public read access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::www.assemblejs.com/*"
       }
     ]
   }
   ```

### Next/Preview Website Bucket

1. Create an S3 bucket named `www.next.assemblejs.com`:
   ```bash
   aws s3 mb s3://www.next.assemblejs.com
   ```

2. Enable static website hosting:
   ```bash
   aws s3 website s3://www.next.assemblejs.com --index-document index.html --error-document error.html
   ```

3. Configure bucket policy for public read access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::www.next.assemblejs.com/*"
       }
     ]
   }
   ```

## Setting up DNS Records

Configure your DNS provider (e.g., Route 53) with:

1. For production website:
   - `www.assemblejs.com` → Point to S3 bucket endpoint or CloudFront distribution

2. For next/preview website:
   - `www.next.assemblejs.com` → Point to S3 bucket endpoint or CloudFront distribution

## IAM Policy Examples

### S3 Deployment Policy (Restricted)

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
        "arn:aws:s3:::www.assemblejs.com",
        "arn:aws:s3:::www.assemblejs.com/*",
        "arn:aws:s3:::www.next.assemblejs.com",
        "arn:aws:s3:::www.next.assemblejs.com/*"
      ]
    }
  ]
}
```

### CloudFront Invalidation Policy (Restricted)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::*:distribution/*"
    }
  ]
}
```