/**
 * Collections Routes
 * API routes for vector collections management
 */

const express = require("express");
const router = express.Router();
const collectionsController = require("../controllers/collectionsController");

// Get all collections
router.get("/", collectionsController.getAllCollections);

// Create a new collection
router.post("/:name", collectionsController.createCollection);

// Delete a collection
router.delete("/:name", collectionsController.deleteCollection);

// Add document to collection
router.post("/:name/add", collectionsController.addDocument);

// Add batch of documents to collection
router.post("/:name/batch", collectionsController.addDocumentBatch);

// Query collection
router.post("/:name/query", collectionsController.queryCollection);

// Delete document from collection
router.delete("/:name/documents/:docId", collectionsController.deleteDocument);

module.exports = router;
