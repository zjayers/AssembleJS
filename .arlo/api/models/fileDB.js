/**
 * File-based Database System
 * Simple JSON file-based storage with semantic search capabilities
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Base data directory
const DATA_DIR = path.join(__dirname, '../../data');
const COLLECTIONS_DIR = path.join(DATA_DIR, 'collections');
const TASKS_DIR = path.join(DATA_DIR, 'tasks');

// Ensure all necessary directories exist
const ensureDirsExist = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(COLLECTIONS_DIR, { recursive: true });
  await fs.mkdir(TASKS_DIR, { recursive: true });
};

// Simple similarity scoring function (naive implementation)
// In a real app, we would use a proper vector embedding and cosine similarity
const calculateSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;
  
  // Convert to lowercase for case-insensitive comparison
  const a = text1.toLowerCase();
  const b = text2.toLowerCase();
  
  // Extract words
  const wordsA = a.split(/\W+/).filter(w => w.length > 2);
  const wordsB = b.split(/\W+/).filter(w => w.length > 2);
  
  // Count word overlaps
  let matches = 0;
  for (const wordA of wordsA) {
    if (wordsB.includes(wordA)) {
      matches++;
    }
  }
  
  // Calculate similarity score (Jaccard-inspired)
  const uniqueWords = new Set([...wordsA, ...wordsB]);
  return matches / uniqueWords.size;
};

// Get all agents
const agents = [
  'Admin',
  'Analyzer',
  'Browser',
  'Bundler',
  'Config',
  'Developer',
  'Generator',
  'Git',
  'Pipeline',
  'Docs',
  'Server',
  'Testbed',
  'Types',
  'Utils',
  'Validator',
  'Version',
  'ARLO'  // Agent dedicated to ARLO system maintenance and updates
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
      message: `Collection '${name}' already exists`
    };
  } catch (error) {
    // Collection doesn't exist, create it
    await fs.writeFile(collectionPath, JSON.stringify({ documents: [] }));
    return {
      success: true,
      message: `Collection '${name}' created successfully`
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
    if (file.endsWith('.json')) {
      const name = file.replace('.json', '');
      const collectionPath = path.join(COLLECTIONS_DIR, file);
      
      try {
        const data = JSON.parse(await fs.readFile(collectionPath, 'utf8'));
        collections.push({
          name,
          count: data.documents ? data.documents.length : 0
        });
      } catch (error) {
        console.error(`Error reading collection ${name}:`, error);
        collections.push({
          name,
          count: 0
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
      message: `Collection '${name}' deleted successfully`
    };
  } catch (error) {
    return {
      success: false,
      message: `Collection '${name}' not found`
    };
  }
};

// Add a document to a collection
const addDocument = async (collectionName, document) => {
  await ensureDirsExist();
  
  const collectionPath = path.join(COLLECTIONS_DIR, `${collectionName}.json`);
  
  try {
    // Try to read the collection
    let collection;
    try {
      collection = JSON.parse(await fs.readFile(collectionPath, 'utf8'));
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
      document: document.content || document.text || document.document || '',
      metadata: {
        ...document.metadata,
        timestamp: document.metadata?.timestamp || new Date().toISOString()
      }
    };
    
    // Add the document to the collection
    collection.documents.push(docToStore);
    
    // Save the collection
    await fs.writeFile(collectionPath, JSON.stringify(collection, null, 2));
    
    return {
      success: true,
      id: docId,
      message: `Document added to collection '${collectionName}'`
    };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    return {
      success: false,
      message: `Error adding document: ${error.message}`
    };
  }
};

// Add multiple documents to a collection
const addDocumentBatch = async (collectionName, documents) => {
  await ensureDirsExist();
  
  const collectionPath = path.join(COLLECTIONS_DIR, `${collectionName}.json`);
  
  try {
    // Try to read the collection
    let collection;
    try {
      collection = JSON.parse(await fs.readFile(collectionPath, 'utf8'));
    } catch (error) {
      // Collection doesn't exist, create it
      await createCollection(collectionName);
      collection = { documents: [] };
    }
    
    // Generate IDs for all documents
    const ids = [];
    
    // Add all documents
    for (const document of documents) {
      const docId = uuidv4();
      ids.push(docId);
      
      const docToStore = {
        id: docId,
        document: document.content || document.text || document.document || '',
        metadata: {
          ...document.metadata,
          timestamp: document.metadata?.timestamp || new Date().toISOString()
        }
      };
      
      collection.documents.push(docToStore);
    }
    
    // Save the collection
    await fs.writeFile(collectionPath, JSON.stringify(collection, null, 2));
    
    return {
      success: true,
      ids,
      message: `${documents.length} documents added to collection '${collectionName}'`
    };
  } catch (error) {
    console.error(`Error adding documents to ${collectionName}:`, error);
    return {
      success: false,
      message: `Error adding documents: ${error.message}`
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
      collection = JSON.parse(await fs.readFile(collectionPath, 'utf8'));
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
      filtered = filtered.filter(doc => {
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
      return filtered.slice(0, limit).map(doc => ({
        document: doc.document,
        metadata: doc.metadata,
        id: doc.id,
        score: 1.0
      }));
    }
    
    // Calculate similarity scores for all documents
    const scored = filtered.map(doc => ({
      document: doc.document,
      metadata: doc.metadata,
      id: doc.id,
      score: calculateSimilarity(query, doc.document)
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
      collection = JSON.parse(await fs.readFile(collectionPath, 'utf8'));
    } catch (error) {
      // Collection doesn't exist
      return {
        success: false,
        message: `Collection '${collectionName}' not found`
      };
    }
    
    // Check if document exists
    const initialCount = collection.documents.length;
    collection.documents = collection.documents.filter(doc => doc.id !== documentId);
    
    if (collection.documents.length === initialCount) {
      return {
        success: false,
        message: `Document '${documentId}' not found in collection '${collectionName}'`
      };
    }
    
    // Save the collection
    await fs.writeFile(collectionPath, JSON.stringify(collection, null, 2));
    
    return {
      success: true,
      message: `Document '${documentId}' deleted from collection '${collectionName}'`
    };
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    return {
      success: false,
      message: `Error deleting document: ${error.message}`
    };
  }
};

// Agent-specific functions

// Add knowledge to an agent's collection
const addAgentKnowledge = async (agentName, document) => {
  return addDocument(`agent_${agentName}`, document);
};

// Get all documents from an agent's collection
const getAgentKnowledge = async (agentName, limit = 100) => {
  await ensureDirsExist();
  
  const collectionName = `agent_${agentName}`;
  const collectionPath = path.join(COLLECTIONS_DIR, `${collectionName}.json`);
  
  try {
    // Try to read the collection
    let collection;
    try {
      collection = JSON.parse(await fs.readFile(collectionPath, 'utf8'));
    } catch (error) {
      // Collection doesn't exist
      return [];
    }
    
    // Return documents up to the limit
    return collection.documents.slice(0, limit).map(doc => ({
      document: doc.document,
      metadata: doc.metadata,
      id: doc.id
    }));
  } catch (error) {
    console.error(`Error getting agent knowledge for ${agentName}:`, error);
    return [];
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
  const generalCollections = ['project_docs', 'framework_api', 'tutorials', 'examples', 'tasks'];
  for (const collName of generalCollections) {
    await createCollection(collName);
  }
  
  console.log('File-based database initialized successfully');
  return true;
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
  agents
};