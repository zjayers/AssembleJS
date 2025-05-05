/**
 * Knowledge Validator
 * Validates and sanitizes knowledge documents before storage
 */

const { isValidJSON } = require("../../utils/validation");

// Allowed metadata fields
const ALLOWED_METADATA_FIELDS = [
  "title",
  "type",
  "timestamp",
  "tags",
  "source",
  "author",
  "version",
  "priority",
  "status",
  "category",
  "related",
  "filepath",
  "language",
  "dependencies",
  "task_id",
  "confidence",
];

// Document type definitions and required fields
const DOCUMENT_TYPES = {
  documentation: {
    required: ["title"],
    description: "Framework or system documentation",
  },
  "code-knowledge": {
    required: ["title", "filepath"],
    description: "Code-specific knowledge about files or components",
  },
  architecture: {
    required: ["title"],
    description: "System architecture information",
  },
  tutorial: {
    required: ["title"],
    description: "Step-by-step guides for features or tasks",
  },
  "api-reference": {
    required: ["title"],
    description: "API endpoint or interface documentation",
  },
  "best-practice": {
    required: ["title"],
    description: "Coding standards and best practices",
  },
  pattern: {
    required: ["title"],
    description: "Design patterns or common solutions",
  },
  task: {
    required: ["task_id"],
    description: "Information about user-submitted tasks",
  },
  "system-knowledge": {
    required: [],
    description: "General system knowledge",
  },
  "agent-reflection": {
    required: ["author"],
    description: "Agent reflections on code or tasks",
  },
  "error-knowledge": {
    required: ["title"],
    description: "Common errors and their solutions",
  },
};

// Maximum document content length
const MAX_DOCUMENT_LENGTH = 1000000; // 1MB

/**
 * Validate a knowledge document
 * @param {Object} document - The document to validate
 * @return {Object} Validation result with success flag and errors
 */
function validateDocument(document) {
  const errors = [];

  // Basic structure checks
  if (!document) {
    return {
      success: false,
      errors: ["Document is required"],
    };
  }

  if (typeof document !== "object") {
    return {
      success: false,
      errors: ["Document must be an object"],
    };
  }

  // Check document content
  if (!document.document && !document.content) {
    errors.push(
      "Document content is required (either document or content field)"
    );
  } else {
    // Normalize to use document field
    if (!document.document && document.content) {
      document.document = document.content;
      delete document.content;
    }

    // Check content length
    if (document.document && typeof document.document === "string") {
      if (document.document.length > MAX_DOCUMENT_LENGTH) {
        errors.push(
          `Document content exceeds maximum length of ${MAX_DOCUMENT_LENGTH} characters`
        );
      }
      if (document.document.length < 10) {
        errors.push("Document content is too short (minimum 10 characters)");
      }
    } else if (document.document) {
      // If document is an object or array, convert to string first
      try {
        const contentString = JSON.stringify(document.document);
        if (contentString.length > MAX_DOCUMENT_LENGTH) {
          errors.push(
            `Document content exceeds maximum length of ${MAX_DOCUMENT_LENGTH} characters`
          );
        }
        // Convert JSON objects to strings for storage consistency
        document.document = contentString;
      } catch (error) {
        errors.push("Invalid document content structure");
      }
    }
  }

  // Check metadata
  if (!document.metadata) {
    document.metadata = {};
  }

  if (typeof document.metadata !== "object") {
    errors.push("Metadata must be an object");
  } else {
    // Ensure timestamp exists
    if (!document.metadata.timestamp) {
      document.metadata.timestamp = new Date().toISOString();
    } else {
      // Validate timestamp format
      try {
        new Date(document.metadata.timestamp);
      } catch (error) {
        errors.push("Invalid timestamp format");
        // Fix it
        document.metadata.timestamp = new Date().toISOString();
      }
    }

    // Check document type
    if (document.metadata.type) {
      if (!DOCUMENT_TYPES[document.metadata.type]) {
        errors.push(
          `Unknown document type: ${
            document.metadata.type
          }. Allowed types: ${Object.keys(DOCUMENT_TYPES).join(", ")}`
        );
      } else {
        // Check required fields for this document type
        const requiredFields = DOCUMENT_TYPES[document.metadata.type].required;
        requiredFields.forEach((field) => {
          if (!document.metadata[field]) {
            errors.push(
              `Field '${field}' is required for document type '${document.metadata.type}'`
            );
          }
        });
      }
    } else {
      // Default type
      document.metadata.type = "documentation";
    }

    // Remove disallowed metadata fields
    Object.keys(document.metadata).forEach((key) => {
      if (!ALLOWED_METADATA_FIELDS.includes(key)) {
        console.warn(`Removing disallowed metadata field: ${key}`);
        delete document.metadata[key];
      }
    });

    // Validate tags format
    if (document.metadata.tags && !Array.isArray(document.metadata.tags)) {
      if (typeof document.metadata.tags === "string") {
        // Convert string to array
        document.metadata.tags = document.metadata.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      } else {
        errors.push("Tags must be an array or comma-separated string");
        document.metadata.tags = [];
      }
    }

    // Validate related documents format
    if (
      document.metadata.related &&
      !Array.isArray(document.metadata.related)
    ) {
      errors.push("Related documents must be an array");
      document.metadata.related = [];
    }

    // Validate priority if present
    if (document.metadata.priority) {
      const priority = parseInt(document.metadata.priority);
      if (isNaN(priority) || priority < 1 || priority > 5) {
        errors.push("Priority must be a number between 1 and 5");
        document.metadata.priority = 3; // Default to medium priority
      } else {
        document.metadata.priority = priority;
      }
    }

    // Ensure confidence is a number between 0 and 1 if present
    if (document.metadata.confidence !== undefined) {
      const confidence = parseFloat(document.metadata.confidence);
      if (isNaN(confidence) || confidence < 0 || confidence > 1) {
        errors.push("Confidence must be a number between 0 and 1");
        document.metadata.confidence = 0.7; // Default confidence
      } else {
        document.metadata.confidence = confidence;
      }
    }
  }

  // Return validation result
  return {
    success: errors.length === 0,
    errors,
    document: document,
  };
}

/**
 * Sanitize a document to ensure it meets requirements
 * @param {Object} document - The document to sanitize
 * @return {Object} Sanitized document
 */
function sanitizeDocument(document) {
  if (!document) return null;

  const sanitized = {
    document: "",
    metadata: {},
  };

  // Copy and sanitize document content
  if (typeof document.document === "string") {
    sanitized.document = document.document;
  } else if (document.content && typeof document.content === "string") {
    sanitized.document = document.content;
  } else if (document.document) {
    try {
      sanitized.document = JSON.stringify(document.document);
    } catch (error) {
      sanitized.document = String(document.document);
    }
  }

  // Truncate if needed
  if (sanitized.document.length > MAX_DOCUMENT_LENGTH) {
    sanitized.document = sanitized.document.substring(0, MAX_DOCUMENT_LENGTH);
  }

  // Copy and sanitize metadata
  if (document.metadata && typeof document.metadata === "object") {
    // Filter to allowed fields only
    ALLOWED_METADATA_FIELDS.forEach((field) => {
      if (document.metadata[field] !== undefined) {
        sanitized.metadata[field] = document.metadata[field];
      }
    });

    // Ensure timestamp
    if (!sanitized.metadata.timestamp) {
      sanitized.metadata.timestamp = new Date().toISOString();
    }

    // Ensure type
    if (!sanitized.metadata.type) {
      sanitized.metadata.type = "documentation";
    }

    // Ensure tags is an array
    if (sanitized.metadata.tags && !Array.isArray(sanitized.metadata.tags)) {
      if (typeof sanitized.metadata.tags === "string") {
        sanitized.metadata.tags = sanitized.metadata.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      } else {
        sanitized.metadata.tags = [];
      }
    }
  } else {
    // Default metadata
    sanitized.metadata = {
      timestamp: new Date().toISOString(),
      type: "documentation",
    };
  }

  return sanitized;
}

/**
 * Extract and generate tags from document content
 * @param {Object} document - The document to process
 * @return {Array} Generated tags
 */
function generateTags(document) {
  if (!document || !document.document) return [];

  const content = document.document;
  const existingTags = (document.metadata && document.metadata.tags) || [];

  // Extract common technical terms, frameworks, languages
  const technicalTerms = [
    "javascript",
    "typescript",
    "react",
    "vue",
    "svelte",
    "preact",
    "node",
    "express",
    "api",
    "component",
    "server",
    "client",
    "database",
    "function",
    "module",
    "class",
    "interface",
    "event",
    "template",
    "style",
    "animation",
    "layout",
    "controller",
    "model",
    "view",
    "router",
    "state",
    "hook",
    "middleware",
    "plugin",
    "render",
  ];

  const foundTags = new Set(existingTags);

  // Look for technical terms in content
  technicalTerms.forEach((term) => {
    const pattern = new RegExp(`\\b${term}\\b`, "i");
    if (pattern.test(content) && !foundTags.has(term)) {
      foundTags.add(term);
    }
  });

  // Extract document type as a tag
  if (document.metadata && document.metadata.type) {
    foundTags.add(document.metadata.type);
  }

  // Extract filepath components if available
  if (document.metadata && document.metadata.filepath) {
    const filepath = document.metadata.filepath;

    // Extract directory components
    const parts = filepath
      .split("/")
      .filter((part) => part && !part.includes("."));
    parts.forEach((part) => {
      if (part && part.length > 3 && !foundTags.has(part)) {
        foundTags.add(part);
      }
    });

    // Extract file extension
    const extension = filepath.split(".").pop();
    if (
      extension &&
      ["js", "ts", "jsx", "tsx", "vue", "svelte"].includes(extension)
    ) {
      foundTags.add(extension);
    }
  }

  return Array.from(foundTags);
}

/**
 * Process a document before storage
 * This combines validation, sanitization, and auto-tagging
 * @param {Object} document - The document to process
 * @return {Object} Processing result with success flag and processed document
 */
function processDocument(document) {
  // First validate
  const validationResult = validateDocument(document);

  if (!validationResult.success) {
    // If validation fails, try to sanitize and validate again
    const sanitized = sanitizeDocument(document);
    const secondValidation = validateDocument(sanitized);

    if (!secondValidation.success) {
      return {
        success: false,
        errors: secondValidation.errors,
        document: null,
      };
    }

    document = secondValidation.document;
  } else {
    document = validationResult.document;
  }

  // Generate tags
  const generatedTags = generateTags(document);

  // Append new tags to existing ones
  if (!document.metadata.tags) {
    document.metadata.tags = [];
  }

  generatedTags.forEach((tag) => {
    if (!document.metadata.tags.includes(tag)) {
      document.metadata.tags.push(tag);
    }
  });

  return {
    success: true,
    document,
  };
}

module.exports = {
  validateDocument,
  sanitizeDocument,
  generateTags,
  processDocument,
  DOCUMENT_TYPES,
  ALLOWED_METADATA_FIELDS,
};
