/**
 * File-based Database System
 * Simple JSON file-based storage with semantic search capabilities
 */

const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const knowledgeValidator = require("./knowledgeValidator");

// Base data directory - use environment variable if set
const DATA_DIR = process.env.DATA_DIR
  ? path.isAbsolute(process.env.DATA_DIR)
    ? process.env.DATA_DIR
    : path.join(__dirname, "../../", process.env.DATA_DIR)
  : path.join(__dirname, "../../data");

const COLLECTIONS_DIR = path.join(DATA_DIR, "collections");
const TASKS_DIR = path.join(DATA_DIR, "tasks");

// Ensure all necessary directories exist
const ensureDirsExist = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(COLLECTIONS_DIR, { recursive: true });
  await fs.mkdir(TASKS_DIR, { recursive: true });
};

// Improved similarity scoring function with better performance
// Still a simplified version of proper vector search, but more efficient
const calculateSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;

  // Convert to lowercase for case-insensitive comparison
  const a = text1.toLowerCase();
  const b = text2.toLowerCase();

  // Extract words and build frequency maps
  const wordsA = a.split(/\W+/).filter((w) => w.length > 2);
  const wordsB = b.split(/\W+/).filter((w) => w.length > 2);

  // Use Map for better performance with large documents
  const freqMapA = new Map();
  const freqMapB = new Map();

  // Build frequency maps
  for (const word of wordsA) {
    freqMapA.set(word, (freqMapA.get(word) || 0) + 1);
  }

  for (const word of wordsB) {
    freqMapB.set(word, (freqMapB.get(word) || 0) + 1);
  }

  // Get unique words from both texts
  const uniqueWords = new Set([...freqMapA.keys(), ...freqMapB.keys()]);

  // Calculate dot product
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  // Calculate cosine similarity components
  for (const word of uniqueWords) {
    const freqA = freqMapA.get(word) || 0;
    const freqB = freqMapB.get(word) || 0;

    dotProduct += freqA * freqB;
    magnitudeA += freqA * freqA;
    magnitudeB += freqB * freqB;
  }

  // Calculate cosine similarity
  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

  if (magnitude === 0) return 0;
  return dotProduct / magnitude;
};

// Get all agents
const agents = [
  "Admin",
  "Analyzer",
  "Browser",
  "Bundler",
  "Config",
  "Developer",
  "Generator",
  "Git",
  "Pipeline",
  "Docs",
  "Server",
  "Testbed",
  "Types",
  "Utils",
  "Validator",
  "Version",
  "ARLO", // Agent dedicated to ARLO system maintenance and updates
];

// Collection operations

// Create a collection
const createCollection = async (name) => {
  await ensureDirsExist();

  const collectionPath = path.join(COLLECTIONS_DIR, `${name}.json`);

  try {
    // Check if collection already exists
    await fs.access(collectionPath);
    return {
      success: false,
      message: `Collection '${name}' already exists`,
    };
  } catch (error) {
    // Collection doesn't exist, create it
    await fs.writeFile(collectionPath, JSON.stringify({ documents: [] }));
    return {
      success: true,
      message: `Collection '${name}' created successfully`,
    };
  }
};

// List all collections
const listCollections = async () => {
  await ensureDirsExist();

  // Read collection directory
  const files = await fs.readdir(COLLECTIONS_DIR);
  const collections = [];

  for (const file of files) {
    if (file.endsWith(".json")) {
      const name = file.replace(".json", "");
      const collectionPath = path.join(COLLECTIONS_DIR, file);

      try {
        const data = JSON.parse(await fs.readFile(collectionPath, "utf8"));
        collections.push({
          name,
          count: data.documents ? data.documents.length : 0,
        });
      } catch (error) {
        console.error(`Error reading collection ${name}:`, error);
        collections.push({
          name,
          count: 0,
        });
      }
    }
  }

  return collections;
};

// Delete a collection
const deleteCollection = async (name) => {
  await ensureDirsExist();

  const collectionPath = path.join(COLLECTIONS_DIR, `${name}.json`);

  try {
    await fs.access(collectionPath);
    await fs.unlink(collectionPath);
    return {
      success: true,
      message: `Collection '${name}' deleted successfully`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Collection '${name}' not found`,
    };
  }
};

// File locking system to prevent race conditions
const locks = new Map();

// Helper function to acquire a lock for a file operation
const acquireLock = async (filePath, timeout = 5000) => {
  const start = Date.now();

  while (locks.has(filePath)) {
    // Check for timeout
    if (Date.now() - start > timeout) {
      throw new Error(`Timeout waiting for lock on ${filePath}`);
    }

    // Wait a bit before checking again
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  // Acquire the lock
  locks.set(filePath, true);
  return true;
};

// Helper function to release a lock
const releaseLock = (filePath) => {
  locks.delete(filePath);
  return true;
};

// Add a document to a collection with proper locking to prevent race conditions
const addDocument = async (collectionName, document) => {
  await ensureDirsExist();

  const collectionPath = path.join(COLLECTIONS_DIR, `${collectionName}.json`);

  // Acquire a lock for this collection
  try {
    await acquireLock(collectionPath);

    try {
      // Validate and process the document
      const processResult = knowledgeValidator.processDocument(document);

      if (!processResult.success) {
        return {
          success: false,
          message: `Document validation failed: ${processResult.errors.join(
            ", "
          )}`,
        };
      }

      // Use the processed document
      document = processResult.document;

      // Try to read the collection
      let collection;
      try {
        collection = JSON.parse(await fs.readFile(collectionPath, "utf8"));
      } catch (error) {
        // Collection doesn't exist, create it
        await createCollection(collectionName);
        collection = { documents: [] };
      }

      // Generate a unique ID
      const docId = uuidv4();

      // Prepare the document
      const docToStore = {
        id: docId,
        document: document.document,
        metadata: document.metadata,
      };

      // Add the document to the collection
      collection.documents.push(docToStore);

      // Save the collection
      await fs.writeFile(collectionPath, JSON.stringify(collection, null, 2));

      return {
        success: true,
        id: docId,
        message: `Document added to collection '${collectionName}'`,
        metadata: document.metadata,
      };
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      return {
        success: false,
        message: `Error adding document: ${error.message}`,
      };
    } finally {
      // Always release the lock
      releaseLock(collectionPath);
    }
  } catch (lockError) {
    console.error(`Lock acquisition error for ${collectionName}:`, lockError);
    return {
      success: false,
      message: `Could not acquire collection lock: ${lockError.message}`,
    };
  }
};

// Add multiple documents to a collection with proper locking
const addDocumentBatch = async (collectionName, documents) => {
  await ensureDirsExist();

  const collectionPath = path.join(COLLECTIONS_DIR, `${collectionName}.json`);

  // Acquire a lock for this collection
  try {
    await acquireLock(collectionPath);

    try {
      // Try to read the collection
      let collection;
      try {
        collection = JSON.parse(await fs.readFile(collectionPath, "utf8"));
      } catch (error) {
        // Collection doesn't exist, create it
        await createCollection(collectionName);
        collection = { documents: [] };
      }

      // Generate IDs for all documents
      const ids = [];
      const failures = [];

      // Process and add all valid documents
      for (const document of documents) {
        // Validate and process the document
        const processResult = knowledgeValidator.processDocument(document);

        if (!processResult.success) {
          failures.push({
            document: document,
            errors: processResult.errors,
          });
          continue;
        }

        // Use the processed document
        const validatedDoc = processResult.document;

        // Generate an ID and add to list
        const docId = uuidv4();
        ids.push(docId);

        const docToStore = {
          id: docId,
          document: validatedDoc.document,
          metadata: validatedDoc.metadata,
        };

        collection.documents.push(docToStore);
      }

      // Save the collection if any documents were valid
      if (ids.length > 0) {
        await fs.writeFile(collectionPath, JSON.stringify(collection, null, 2));
      }

      return {
        success: ids.length > 0,
        ids,
        failures,
        totalProcessed: documents.length,
        successCount: ids.length,
        failureCount: failures.length,
        message: `${ids.length} documents added to collection '${collectionName}' (${failures.length} failed validation)`,
      };
    } catch (error) {
      console.error(`Error adding documents to ${collectionName}:`, error);
      return {
        success: false,
        message: `Error adding documents: ${error.message}`,
      };
    } finally {
      // Always release the lock
      releaseLock(collectionPath);
    }
  } catch (lockError) {
    console.error(`Lock acquisition error for ${collectionName}:`, lockError);
    return {
      success: false,
      message: `Could not acquire collection lock: ${lockError.message}`,
    };
  }
};

// Query a collection
const queryCollection = async (collectionName, queryParams) => {
  await ensureDirsExist();

  const collectionPath = path.join(COLLECTIONS_DIR, `${collectionName}.json`);

  try {
    // Try to read the collection
    let collection;
    try {
      collection = JSON.parse(await fs.readFile(collectionPath, "utf8"));
    } catch (error) {
      // Collection doesn't exist
      return [];
    }

    const { query, limit = 10, filters = {} } = queryParams;

    // If no documents, return empty array
    if (!collection.documents || collection.documents.length === 0) {
      return [];
    }

    // Filter documents based on metadata if filters provided
    let filtered = collection.documents;
    if (Object.keys(filters).length > 0) {
      filtered = filtered.filter((doc) => {
        for (const [key, value] of Object.entries(filters)) {
          if (doc.metadata[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }

    // If query is empty, just return the first 'limit' documents
    if (!query) {
      return filtered.slice(0, limit).map((doc) => ({
        document: doc.document,
        metadata: doc.metadata,
        id: doc.id,
        score: 1.0,
      }));
    }

    // Calculate similarity scores for all documents
    const scored = filtered.map((doc) => ({
      document: doc.document,
      metadata: doc.metadata,
      id: doc.id,
      score: calculateSimilarity(query, doc.document),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Return top results
    return scored.slice(0, limit);
  } catch (error) {
    console.error(`Error querying collection ${collectionName}:`, error);
    return [];
  }
};

// Delete a document from a collection
const deleteDocument = async (collectionName, documentId) => {
  await ensureDirsExist();

  const collectionPath = path.join(COLLECTIONS_DIR, `${collectionName}.json`);

  try {
    // Try to read the collection
    let collection;
    try {
      collection = JSON.parse(await fs.readFile(collectionPath, "utf8"));
    } catch (error) {
      // Collection doesn't exist
      return {
        success: false,
        message: `Collection '${collectionName}' not found`,
      };
    }

    // Check if document exists
    const initialCount = collection.documents.length;
    collection.documents = collection.documents.filter(
      (doc) => doc.id !== documentId
    );

    if (collection.documents.length === initialCount) {
      return {
        success: false,
        message: `Document '${documentId}' not found in collection '${collectionName}'`,
      };
    }

    // Save the collection
    await fs.writeFile(collectionPath, JSON.stringify(collection, null, 2));

    return {
      success: true,
      message: `Document '${documentId}' deleted from collection '${collectionName}'`,
    };
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    return {
      success: false,
      message: `Error deleting document: ${error.message}`,
    };
  }
};

// Agent-specific functions

// Add knowledge to an agent's collection
const addAgentKnowledge = async (agentName, document) => {
  return addDocument(`agent_${agentName}`, document);
};

// Get all documents from an agent's collection with pagination
const getAgentKnowledge = async (
  agentName,
  limit = 100,
  page = 1,
  sortBy = "id",
  sortDir = "desc"
) => {
  await ensureDirsExist();

  const collectionName = `agent_${agentName}`;
  const collectionPath = path.join(COLLECTIONS_DIR, `${collectionName}.json`);

  try {
    // Try to read the collection
    let collection;
    try {
      collection = JSON.parse(await fs.readFile(collectionPath, "utf8"));
    } catch (error) {
      // Collection doesn't exist
      return {
        documents: [],
        totalCount: 0,
        page,
        totalPages: 0,
        hasMore: false,
      };
    }

    // Normalize page number
    page = Math.max(1, page);
    // Validate and limit results per page
    limit = Math.min(Math.max(1, limit), 500);

    // Calculate offsets
    const startIndex = (page - 1) * limit;
    const totalCount = collection.documents.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Sort documents
    const sortedDocuments = [...collection.documents];
    if (sortBy === "timestamp" && sortDir === "desc") {
      sortedDocuments.sort((a, b) => {
        const aTime = a.metadata?.timestamp
          ? new Date(a.metadata.timestamp).getTime()
          : 0;
        const bTime = b.metadata?.timestamp
          ? new Date(b.metadata.timestamp).getTime()
          : 0;
        return bTime - aTime; // Descending order (newest first)
      });
    } else if (sortBy === "timestamp" && sortDir === "asc") {
      sortedDocuments.sort((a, b) => {
        const aTime = a.metadata?.timestamp
          ? new Date(a.metadata.timestamp).getTime()
          : 0;
        const bTime = b.metadata?.timestamp
          ? new Date(b.metadata.timestamp).getTime()
          : 0;
        return aTime - bTime; // Ascending order (oldest first)
      });
    }

    // Paginate documents
    const paginatedDocuments = sortedDocuments
      .slice(startIndex, startIndex + limit)
      .map((doc) => ({
        document: doc.document,
        metadata: doc.metadata,
        id: doc.id,
      }));

    // Return paginated results with metadata
    return {
      documents: paginatedDocuments,
      totalCount,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  } catch (error) {
    console.error(`Error getting agent knowledge for ${agentName}:`, error);
    throw error; // Let the controller handle the error properly
  }
};

// Query an agent's knowledge using semantic search
const queryAgentKnowledge = async (agentName, query, limit = 5) => {
  return queryCollection(`agent_${agentName}`, { query, limit });
};

// Initialize the database
const initDatabase = async () => {
  await ensureDirsExist();

  // Create agent collections if they don't exist
  for (const agent of agents) {
    const collectionName = `agent_${agent}`;
    await createCollection(collectionName);
  }

  // Create general collections
  const generalCollections = [
    "project_docs",
    "framework_api",
    "tutorials",
    "examples",
    "tasks",
  ];
  for (const collName of generalCollections) {
    await createCollection(collName);
  }

  console.log("File-based database initialized successfully");
  return true;
};

// Ensure a directory exists
const ensureDirectory = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
  return true;
};

// Check if a file exists
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
};

// List files in a directory
const listFiles = async (dirPath) => {
  try {
    await ensureDirectory(dirPath);
    return await fs.readdir(dirPath);
  } catch (error) {
    console.error(`Error listing files in ${dirPath}:`, error);
    return [];
  }
};

// Read a JSON file
const readJSON = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    throw error;
  }
};

// Write to a JSON file
const writeJSON = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
    throw error;
  }
};

// Delete a file
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    throw error;
  }
};

module.exports = {
  initDatabase,
  listCollections,
  createCollection,
  deleteCollection,
  addDocument,
  addDocumentBatch,
  queryCollection,
  deleteDocument,
  addAgentKnowledge,
  getAgentKnowledge,
  queryAgentKnowledge,
  agents,
  // Additional file utilities
  ensureDirectory,
  fileExists,
  listFiles,
  readJSON,
  writeJSON,
  deleteFile,
};
