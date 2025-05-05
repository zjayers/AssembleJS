# ARLO Chatbot Integration

This document provides instructions for integrating the ARLO AI chatbot with the AssemblyJS website.

## Overview

ARLO (AssemblyJS Repository Logic Orchestrator) includes a specialized public API endpoint that serves as a knowledge base for the AssemblyJS framework. This API is designed to be consumed by a chatbot component on the main website, allowing users to ask questions about AssemblyJS and receive informed responses.

## Architecture

The system consists of:

1. **ARLO Backend**: Deployed as a Docker container on AWS App Runner

   - Uses the ECR image from the `assemblejs-arlo` repository
   - Runs in `API_ONLY_MODE=true` to restrict access to internal endpoints
   - Uses file-based storage in the container for knowledge data

2. **Chatbot Frontend**: React component on the AssemblyJS website
   - Located at `websites/www.assemblejs.com/src/components/common/Chatbot.js`
   - Communicates with the ARLO API using a secure API key

## Security

The chatbot API is secured using:

1. **API Key Authentication**: All requests must include a valid API key

   - Sent via `X-API-Key` header or `api_key` query parameter
   - Key is stored as an environment variable in AWS App Runner

2. **Rate Limiting**: Prevents abuse by limiting requests per IP address

   - Default: 100 requests per 15-minute window

3. **Access Restrictions**: When deployed, ARLO runs in API-only mode
   - Only the `/api/chatbot/*` endpoints and `/api/status` are accessible
   - All internal routes are blocked

## Deployment Process

The deployment process is automated through GitHub Actions:

1. The `deploy-next-version.yml` workflow builds and pushes the ARLO Docker image to ECR
2. The image is tagged with `next-{timestamp}` and `next-latest`
3. Further deployment to AWS App Runner is handled manually through the AWS console

## API Endpoints

The following endpoints are available for chatbot integration:

### 1. Query Knowledge Base

```
POST /api/chatbot/query
```

Request body:

```json
{
  "query": "How do I create a component?",
  "limit": 5
}
```

Response:

```json
{
  "success": true,
  "query": "How do I create a component?",
  "count": 3,
  "results": [
    {
      "id": "123abc",
      "content": "To create a component...",
      "score": 0.85,
      "agent": "Browser",
      "metadata": {
        "title": "Creating Components",
        "tags": ["component", "tutorial"]
      }
    },
    ...
  ]
}
```

### 2. Get Document by ID

```
GET /api/chatbot/document/{id}
```

Response:

```json
{
  "success": true,
  "document": {
    "id": "123abc",
    "content": "Full document content here...",
    "agent": "Browser",
    "metadata": {
      "title": "Creating Components",
      "tags": ["component", "tutorial"],
      "timestamp": "2023-05-15T12:30:45Z"
    }
  }
}
```

### 3. Get Topics

```
GET /api/chatbot/topics
```

Response:

```json
{
  "success": true,
  "count": 15,
  "topics": [
    {
      "name": "component",
      "count": 25
    },
    {
      "name": "server-side-rendering",
      "count": 18
    },
    ...
  ]
}
```

## Integration Steps

To integrate the chatbot with the AssemblyJS website:

1. Import the Chatbot component in your layout file:

   ```jsx
   import Chatbot from "../components/common/Chatbot";
   ```

2. Add the component to your layout:

   ```jsx
   <Layout>
     {/* Other components */}
     <Chatbot />
   </Layout>
   ```

3. Configure the environment variables in your deployment:
   ```
   REACT_APP_ARLO_API_ENDPOINT=https://your-arlo-api.app-runner-url.com
   REACT_APP_ARLO_API_KEY=your-api-key
   ```

## Local Development

For local development:

1. Start the ARLO server locally:

   ```
   cd .arlo
   npm run dev
   ```

2. Set the environment variables in your React app's `.env.development` file:

   ```
   REACT_APP_ARLO_API_ENDPOINT=http://localhost:8000
   REACT_APP_ARLO_API_KEY=development-key
   ```

3. Start the React development server:
   ```
   cd websites/www.assemblejs.com
   npm start
   ```

## Future Enhancements

Planned enhancements for the chatbot integration:

1. **Conversation Memory**: Implement short-term memory for multi-turn conversations
2. **Personalization**: Customize responses based on user preferences/needs
3. **Code Examples**: Include runnable code examples in responses
4. **Feedback System**: Allow users to rate responses to improve quality
5. **Analytics**: Track common questions to improve documentation
