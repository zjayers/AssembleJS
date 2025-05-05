/**
 * Collections Controller
 * Handles all vector collection operations
 */

const fileDB = require("../models/fileDB");

// Get all collections
const getAllCollections = async (req, res) => {
  try {
    const collections = await fileDB.listCollections();
    res.json(collections);
  } catch (error) {
    console.error("Error getting collections:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving collections",
      error: error.message,
    });
  }
};

// Create a new collection
const createCollection = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await fileDB.createCollection(name);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error(`Error creating collection ${req.params.name}:`, error);
    res.status(500).json({
      success: false,
      message: "Error creating collection",
      error: error.message,
    });
  }
};

// Delete a collection
const deleteCollection = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await fileDB.deleteCollection(name);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error(`Error deleting collection ${req.params.name}:`, error);
    res.status(500).json({
      success: false,
      message: "Error deleting collection",
      error: error.message,
    });
  }
};

// Add a document to a collection
const addDocument = async (req, res) => {
  try {
    const { name } = req.params;
    const document = req.body;

    const result = await fileDB.addDocument(name, document);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error(
      `Error adding document to collection ${req.params.name}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error adding document",
      error: error.message,
    });
  }
};

// Add multiple documents to a collection
const addDocumentBatch = async (req, res) => {
  try {
    const { name } = req.params;
    const documents = req.body;

    if (!Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        message: "Request body should be an array of documents",
      });
    }

    const result = await fileDB.addDocumentBatch(name, documents);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error(
      `Error adding document batch to collection ${req.params.name}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error adding document batch",
      error: error.message,
    });
  }
};

// Query a collection
const queryCollection = async (req, res) => {
  try {
    const { name } = req.params;
    const { query, limit = 10, filters = {} } = req.body;

    const results = await fileDB.queryCollection(name, {
      query,
      limit,
      filters,
    });
    res.json(results);
  } catch (error) {
    console.error(`Error querying collection ${req.params.name}:`, error);
    res.status(500).json({
      success: false,
      message: "Error querying collection",
      error: error.message,
    });
  }
};

// Delete a document from a collection
const deleteDocument = async (req, res) => {
  try {
    const { name, docId } = req.params;

    const result = await fileDB.deleteDocument(name, docId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error(
      `Error deleting document ${req.params.docId} from collection ${req.params.name}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error deleting document",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCollections,
  createCollection,
  deleteCollection,
  addDocument,
  addDocumentBatch,
  queryCollection,
  deleteDocument,
};
