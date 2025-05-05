/**
 * Knowledge Controller
 * Handles knowledge document operations
 */

const fileDB = require("../models/fileDB");
const knowledgeValidator = require("../models/knowledgeValidator");
const { isValidCollectionName } = require("../../utils/validation");
const { asyncHandler, requireValue } = require("../utils/errorUtils");
const {
  createValidationError,
  createNotFoundError,
} = require("../middleware/errorHandler");

/**
 * Get metadata about all available document types
 */
const getDocumentTypes = asyncHandler(async (req, res) => {
  const types = {};

  // Convert the document types to a more client-friendly format
  Object.entries(knowledgeValidator.DOCUMENT_TYPES).forEach(([key, value]) => {
    types[key] = {
      name: key,
      description: value.description,
      requiredFields: value.required,
    };
  });

  res.json({
    success: true,
    types,
  });
});

/**
 * Get metadata about all allowed metadata fields
 */
const getMetadataFields = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    fields: knowledgeValidator.ALLOWED_METADATA_FIELDS,
  });
});

/**
 * Add a document to a collection with validation
 */
const addDocument = asyncHandler(async (req, res) => {
  const { collection } = req.params;
  const document = req.body;

  // Validate collection name
  if (!isValidCollectionName(collection)) {
    throw createValidationError("Invalid collection name");
  }

  // Validate document first
  const validationResult = knowledgeValidator.validateDocument(document);

  let processedDocument;

  if (!validationResult.success) {
    // Try to sanitize and validate again if first validation failed
    const sanitized = knowledgeValidator.sanitizeDocument(document);
    const secondValidation = knowledgeValidator.validateDocument(sanitized);

    if (!secondValidation.success) {
      throw createValidationError(
        "Document validation failed even after sanitization",
        secondValidation.errors
      );
    }

    // Use the sanitized document
    processedDocument = secondValidation.document;
  } else {
    // Use the validated document
    processedDocument = validationResult.document;
  }

  // Generate tags
  processedDocument.metadata.tags = processedDocument.metadata.tags || [];
  const generatedTags = knowledgeValidator.generateTags(processedDocument);

  // Add new tags
  generatedTags.forEach((tag) => {
    if (!processedDocument.metadata.tags.includes(tag)) {
      processedDocument.metadata.tags.push(tag);
    }
  });

  // Add document to collection
  const result = await fileDB.addDocument(collection, processedDocument);

  if (!result.success) {
    throw createValidationError(
      result.message || "Failed to add document",
      result.error
    );
  }

  res.json(result);
});

/**
 * Get documents from a collection with filtering
 */
const getDocuments = asyncHandler(async (req, res) => {
  const { collection } = req.params;
  const { query, limit = 100, type, tags } = req.query;

  // Validate collection name
  if (!isValidCollectionName(collection)) {
    throw createValidationError("Invalid collection name");
  }

  // Build filters
  const filters = {};

  if (type) {
    filters.type = type;
  }

  // Convert tags query parameter to array
  let tagsList = [];
  if (tags) {
    if (Array.isArray(tags)) {
      tagsList = tags;
    } else if (typeof tags === "string") {
      tagsList = tags.split(",").map((tag) => tag.trim());
    }
  }

  // If we have a query, use semantic search
  if (query) {
    const results = await fileDB.queryCollection(collection, {
      query,
      limit: parseInt(limit) || 100,
      filters,
    });

    // Filter by tags if needed
    let filteredResults = results;
    if (tagsList.length > 0) {
      filteredResults = results.filter((doc) => {
        const docTags = doc.metadata.tags || [];
        return tagsList.some((tag) => docTags.includes(tag));
      });
    }

    res.json({
      success: true,
      count: filteredResults.length,
      results: filteredResults,
    });
  } else {
    // Without a query, just get all documents up to the limit
    const documents = await fileDB.queryCollection(collection, {
      limit: parseInt(limit) || 100,
      filters,
    });

    // Filter by tags if needed
    let filteredDocuments = documents;
    if (tagsList.length > 0) {
      filteredDocuments = documents.filter((doc) => {
        const docTags = doc.metadata.tags || [];
        return tagsList.some((tag) => docTags.includes(tag));
      });
    }

    res.json({
      success: true,
      count: filteredDocuments.length,
      results: filteredDocuments,
    });
  }
});

/**
 * Delete a document from a collection
 */
const deleteDocument = asyncHandler(async (req, res) => {
  const { collection, id } = req.params;

  // Validate collection name
  if (!isValidCollectionName(collection)) {
    throw createValidationError("Invalid collection name");
  }

  requireValue(id, "Document ID is required");

  // Delete document
  const result = await fileDB.deleteDocument(collection, id);

  if (!result.success) {
    throw createNotFoundError(
      result.message || `Document not found in collection '${collection}'`
    );
  }

  res.json(result);
});

/**
 * Process and validate a document without storing it
 */
const validateKnowledgeDocument = asyncHandler(async (req, res) => {
  const document = req.body;

  requireValue(document, "Document body is required");

  // Process the document
  const result = knowledgeValidator.processDocument(document);

  res.json({
    success: result.success,
    errors: result.errors,
    document: result.document,
  });
});

module.exports = {
  getDocumentTypes,
  getMetadataFields,
  addDocument,
  getDocuments,
  deleteDocument,
  validateKnowledgeDocument,
};
