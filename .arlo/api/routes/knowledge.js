/**
 * Knowledge Routes
 * API routes for knowledge document operations
 */

const express = require("express");
const router = express.Router();
const knowledgeController = require("../controllers/knowledgeController");

// Get all document types metadata
router.get("/types", knowledgeController.getDocumentTypes);

// Get all metadata fields
router.get("/metadata-fields", knowledgeController.getMetadataFields);

// Validate a document without storing it
router.post("/validate", knowledgeController.validateKnowledgeDocument);

// Add a document to a collection
router.post("/:collection", knowledgeController.addDocument);

// Get documents from a collection
router.get("/:collection", knowledgeController.getDocuments);

// Delete a document from a collection
router.delete("/:collection/:id", knowledgeController.deleteDocument);

module.exports = router;
