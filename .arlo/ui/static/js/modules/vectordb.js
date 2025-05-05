// Vector database client functions
const VectorDB = {
  // List all collections
  async listCollections() {
    const response = await fetch("/api/collections");
    return await response.json();
  },

  // Create a new collection
  async createCollection(collectionName) {
    const response = await fetch(`/api/collections/${collectionName}`, {
      method: "POST",
    });
    return await response.json();
  },

  // Delete a collection
  async deleteCollection(collectionName) {
    const response = await fetch(`/api/collections/${collectionName}`, {
      method: "DELETE",
    });
    return await response.json();
  },

  // Add a document to a collection
  async addDocument(collectionName, document) {
    const response = await fetch(`/api/collections/${collectionName}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(document),
    });
    return await response.json();
  },

  // Add multiple documents to a collection
  async addDocumentBatch(collectionName, documents) {
    const response = await fetch(`/api/collections/${collectionName}/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(documents),
    });
    return await response.json();
  },

  // Query documents from a collection
  async queryCollection(collectionName, queryParams) {
    const response = await fetch(`/api/collections/${collectionName}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryParams),
    });
    return await response.json();
  },

  // Delete a document from a collection
  async deleteDocument(collectionName, documentId) {
    const response = await fetch(
      `/api/collections/${collectionName}/documents/${documentId}`,
      {
        method: "DELETE",
      }
    );
    return await response.json();
  },

  // Agent-specific functions

  // Add knowledge to an agent's collection
  async addAgentKnowledge(agentName, document) {
    const response = await fetch(`/api/agent/${agentName}/knowledge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(document),
    });
    return await response.json();
  },

  // Get all documents from an agent's collection
  async getAgentKnowledge(agentName, limit = 100) {
    const response = await fetch(
      `/api/agent/${agentName}/knowledge?limit=${limit}`
    );
    return await response.json();
  },

  // Query an agent's knowledge using semantic search
  async queryAgentKnowledge(agentName, query, limit = 5) {
    const response = await fetch(`/api/agent/${agentName}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        limit: limit,
      }),
    });
    return await response.json();
  },
};

export default VectorDB;
