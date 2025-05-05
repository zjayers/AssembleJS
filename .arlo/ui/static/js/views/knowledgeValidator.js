/**
 * Knowledge Validator View
 * Client-side validation and metadata management for knowledge documents
 */

const knowledgeValidatorView = (() => {
  // DOM elements cache
  let elements = {};

  // Document types metadata
  let documentTypes = {};

  // Allowed metadata fields
  let metadataFields = [];

  /**
   * Initialize the knowledge validator view
   */
  function init() {
    // Cache DOM elements
    cacheElements();

    // Load metadata from API
    loadMetadata();

    // Set up event handlers
    setupEventHandlers();
  }

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements = {
      // Document editor elements
      documentEditor: document.getElementById("knowledge-document-editor"),
      documentContent: document.getElementById("document-content"),
      documentForm: document.getElementById("document-form"),

      // Metadata form elements
      metadataForm: document.getElementById("metadata-form"),
      documentTitle: document.getElementById("document-title"),
      documentType: document.getElementById("document-type"),
      documentTags: document.getElementById("document-tags"),

      // Validation elements
      validateBtn: document.getElementById("validate-document"),
      validationResults: document.getElementById("validation-results"),
      saveDocumentBtn: document.getElementById("save-document"),

      // Collection selection
      collectionSelect: document.getElementById("document-collection"),
    };
  }

  /**
   * Load document type metadata from API
   */
  async function loadMetadata() {
    try {
      // Load document types
      const typesResponse = await fetch("/api/knowledge/types");
      const typesData = await typesResponse.json();

      if (typesData.success) {
        documentTypes = typesData.types;
        populateDocumentTypes();
      }

      // Load metadata fields
      const fieldsResponse = await fetch("/api/knowledge/metadata-fields");
      const fieldsData = await fieldsResponse.json();

      if (fieldsData.success) {
        metadataFields = fieldsData.fields;
      }

      // Load collections for the dropdown
      const collectionsResponse = await fetch("/api/collections");
      const collectionsData = await collectionsResponse.json();

      if (collectionsData.length > 0 && elements.collectionSelect) {
        populateCollections(collectionsData);
      }
    } catch (error) {
      console.error("Error loading metadata:", error);
    }
  }

  /**
   * Populate document types dropdown
   */
  function populateDocumentTypes() {
    if (!elements.documentType) return;

    // Clear existing options
    elements.documentType.innerHTML = "";

    // Add each document type as an option
    Object.entries(documentTypes).forEach(([key, type]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${key} - ${type.description}`;
      elements.documentType.appendChild(option);
    });

    // Add event listener to update required fields
    elements.documentType.addEventListener("change", updateRequiredFields);

    // Initialize required fields
    updateRequiredFields();
  }

  /**
   * Populate collections dropdown
   * @param {Array} collections - List of collections
   */
  function populateCollections(collections) {
    // Clear existing options
    elements.collectionSelect.innerHTML = "";

    // Add each collection as an option
    collections.forEach((collection) => {
      const option = document.createElement("option");
      option.value = collection.name;
      option.textContent = `${collection.name} (${collection.count} docs)`;
      elements.collectionSelect.appendChild(option);
    });

    // Add agent collections
    const agentCollections = collections.filter((c) =>
      c.name.startsWith("agent_")
    );

    if (agentCollections.length > 0) {
      // Add a group for agent collections
      const agentGroup = document.createElement("optgroup");
      agentGroup.label = "Agent Knowledge";

      agentCollections.forEach((collection) => {
        const option = document.createElement("option");
        option.value = collection.name;
        // Format the agent name nicely (agent_Admin -> Admin Agent)
        const agentName = collection.name.replace("agent_", "");
        option.textContent = `${agentName} Agent (${collection.count} docs)`;
        agentGroup.appendChild(option);
      });

      elements.collectionSelect.appendChild(agentGroup);
    }
  }

  /**
   * Update required fields based on selected document type
   */
  function updateRequiredFields() {
    if (!elements.documentType) return;

    const selectedType = elements.documentType.value;
    const typeInfo = documentTypes[selectedType];

    if (!typeInfo) return;

    // Get all metadata input elements
    const metadataInputs = elements.metadataForm.querySelectorAll(
      "input, select, textarea"
    );

    // Reset all required attributes
    metadataInputs.forEach((input) => {
      input.required = false;

      // Remove required indicators
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) {
        label.classList.remove("required-field");
      }
    });

    // Set required fields based on document type
    typeInfo.requiredFields.forEach((field) => {
      const input = document.getElementById(`document-${field}`);
      if (input) {
        input.required = true;

        // Add visual indicator
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
          label.classList.add("required-field");
        }
      }
    });
  }

  /**
   * Set up event handlers
   */
  function setupEventHandlers() {
    // Validate button handler
    if (elements.validateBtn) {
      elements.validateBtn.addEventListener("click", validateDocument);
    }

    // Save document button handler
    if (elements.saveDocumentBtn) {
      elements.saveDocumentBtn.addEventListener("click", saveDocument);
    }

    // Handle tag input
    setupTagInput();
  }

  /**
   * Set up tag input functionality
   */
  function setupTagInput() {
    const tagInput = document.getElementById("document-tag-input");
    if (!tagInput) return;

    tagInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();

        const tagText = tagInput.value.trim();
        if (tagText) {
          addTag(tagText);
          tagInput.value = "";
        }
      }
    });

    // Add tag button handler
    const addTagBtn = document.getElementById("add-tag-btn");
    if (addTagBtn) {
      addTagBtn.addEventListener("click", () => {
        const tagText = tagInput.value.trim();
        if (tagText) {
          addTag(tagText);
          tagInput.value = "";
        }
      });
    }

    // Initial setup for existing tags
    document.querySelectorAll(".document-tag").forEach((tag) => {
      const removeBtn = tag.querySelector(".remove-tag");
      if (removeBtn) {
        removeBtn.addEventListener("click", () => {
          tag.remove();
        });
      }
    });
  }

  /**
   * Add a new tag to the tags container
   * @param {string} tagText - The tag text to add
   */
  function addTag(tagText) {
    const tagsContainer = document.getElementById("document-tags-container");
    if (!tagsContainer) return;

    // Create tag element
    const tag = document.createElement("span");
    tag.className = "document-tag";
    tag.innerHTML = `
      ${tagText}
      <button type="button" class="remove-tag">&times;</button>
    `;

    // Add remove handler
    const removeBtn = tag.querySelector(".remove-tag");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        tag.remove();
      });
    }

    // Add to container
    tagsContainer.appendChild(tag);
  }

  /**
   * Collect document data from form
   * @return {Object} Document data
   */
  function collectDocumentData() {
    if (!elements.documentForm || !elements.metadataForm) return null;

    // Get content
    const content = elements.documentContent.value;

    // Get metadata
    const metadata = {
      title: elements.documentTitle.value,
      type: elements.documentType.value,
      timestamp: new Date().toISOString(),
    };

    // Collect tags
    const tags = [];
    document.querySelectorAll(".document-tag").forEach((tag) => {
      // Extract tag text without the "×" button
      const tagText = tag.textContent.trim().replace("×", "").trim();
      if (tagText) {
        tags.push(tagText);
      }
    });

    metadata.tags = tags;

    // Add other metadata fields
    metadataFields.forEach((field) => {
      const input = document.getElementById(`document-${field}`);
      if (input && input.value.trim()) {
        metadata[field] = input.value.trim();
      }
    });

    return {
      document: content,
      metadata,
    };
  }

  /**
   * Validate the current document
   */
  async function validateDocument() {
    if (!elements.validationResults) return;

    // Collect data
    const document = collectDocumentData();
    if (!document) {
      showValidationResult(false, ["Failed to collect document data"]);
      return;
    }

    try {
      // Send to API for validation
      const response = await fetch("/api/knowledge/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(document),
      });

      const result = await response.json();

      // Display validation result
      showValidationResult(
        result.success,
        result.errors,
        result.success ? result.document : null
      );
    } catch (error) {
      console.error("Validation error:", error);
      showValidationResult(false, [error.message]);
    }
  }

  /**
   * Display validation result
   * @param {boolean} success - Whether validation succeeded
   * @param {Array} errors - Validation errors
   * @param {Object} validatedDocument - The validated document
   */
  function showValidationResult(success, errors, validatedDocument) {
    if (!elements.validationResults) return;

    // Clear previous results
    elements.validationResults.innerHTML = "";

    // Create result container
    const resultContainer = document.createElement("div");
    resultContainer.className = success
      ? "validation-success"
      : "validation-error";

    // Add header
    const header = document.createElement("h3");
    header.textContent = success ? "Document Valid" : "Validation Failed";
    resultContainer.appendChild(header);

    // Add errors if any
    if (!success && errors && errors.length > 0) {
      const errorsList = document.createElement("ul");
      errorsList.className = "validation-errors-list";

      errors.forEach((error) => {
        const errorItem = document.createElement("li");
        errorItem.textContent = error;
        errorsList.appendChild(errorItem);
      });

      resultContainer.appendChild(errorsList);
    }

    // Add validated document details if successful
    if (success && validatedDocument) {
      // Document content summary
      const contentSummary = document.createElement("div");
      contentSummary.className = "validation-content-summary";
      contentSummary.innerHTML = `
        <h4>Content</h4>
        <p>${validatedDocument.document.substring(0, 100)}${
        validatedDocument.document.length > 100 ? "..." : ""
      }</p>
      `;
      resultContainer.appendChild(contentSummary);

      // Metadata summary
      const metadataSummary = document.createElement("div");
      metadataSummary.className = "validation-metadata-summary";
      metadataSummary.innerHTML = `
        <h4>Metadata</h4>
        <pre>${JSON.stringify(validatedDocument.metadata, null, 2)}</pre>
      `;
      resultContainer.appendChild(metadataSummary);

      // Update metadata in the form if there are auto-generated tags
      if (
        validatedDocument.metadata.tags &&
        validatedDocument.metadata.tags.length > 0
      ) {
        // Clear existing tags
        document
          .querySelectorAll(".document-tag")
          .forEach((tag) => tag.remove());

        // Add validated tags
        validatedDocument.metadata.tags.forEach((tag) => {
          addTag(tag);
        });
      }
    }

    // Add to results container
    elements.validationResults.appendChild(resultContainer);

    // Enable/disable save button based on validation
    if (elements.saveDocumentBtn) {
      elements.saveDocumentBtn.disabled = !success;
    }
  }

  /**
   * Save the current document
   */
  async function saveDocument() {
    // Validate first
    await validateDocument();

    if (elements.saveDocumentBtn.disabled) {
      // Document is invalid
      return;
    }

    if (!elements.collectionSelect) {
      showValidationResult(false, ["No collection selected"]);
      return;
    }

    // Get selected collection
    const collection = elements.collectionSelect.value;
    if (!collection) {
      showValidationResult(false, ["Please select a collection"]);
      return;
    }

    // Collect document data
    const document = collectDocumentData();
    if (!document) {
      showValidationResult(false, ["Failed to collect document data"]);
      return;
    }

    try {
      // Save document
      const response = await fetch(`/api/knowledge/${collection}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(document),
      });

      const result = await response.json();

      if (result.success) {
        showSaveResult(true, result.message, result.id);

        // Optional: clear form after successful save
        clearForm();
      } else {
        showSaveResult(false, result.message);
      }
    } catch (error) {
      console.error("Error saving document:", error);
      showSaveResult(false, error.message);
    }
  }

  /**
   * Display save operation result
   * @param {boolean} success - Whether save succeeded
   * @param {string} message - Result message
   * @param {string} documentId - ID of saved document
   */
  function showSaveResult(success, message, documentId) {
    if (!elements.validationResults) return;

    // Clear previous results
    elements.validationResults.innerHTML = "";

    // Create result container
    const resultContainer = document.createElement("div");
    resultContainer.className = success ? "save-success" : "save-error";

    // Add header
    const header = document.createElement("h3");
    header.textContent = success ? "Document Saved" : "Save Failed";
    resultContainer.appendChild(header);

    // Add message
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    resultContainer.appendChild(messageElement);

    // Add document ID if successful
    if (success && documentId) {
      const idElement = document.createElement("p");
      idElement.innerHTML = `Document ID: <strong>${documentId}</strong>`;
      resultContainer.appendChild(idElement);
    }

    // Add to results container
    elements.validationResults.appendChild(resultContainer);
  }

  /**
   * Clear the document form
   */
  function clearForm() {
    if (elements.documentContent) {
      elements.documentContent.value = "";
    }

    if (elements.documentTitle) {
      elements.documentTitle.value = "";
    }

    // Clear tags
    document.querySelectorAll(".document-tag").forEach((tag) => tag.remove());

    // Reset other fields
    const metadataInputs = elements.metadataForm.querySelectorAll(
      "input, select, textarea"
    );
    metadataInputs.forEach((input) => {
      if (input.id !== "document-type") {
        input.value = "";
      }
    });
  }

  // Public API
  return {
    init,
  };
})();

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  // Check if the knowledge document editor exists on this page
  const knowledgeDocumentEditor = document.getElementById(
    "knowledge-document-editor"
  );
  if (knowledgeDocumentEditor) {
    knowledgeValidatorView.init();
  }
});

// Export module
if (typeof module !== "undefined" && module.exports) {
  module.exports = knowledgeValidatorView;
} else {
  window.knowledgeValidatorView = knowledgeValidatorView;
}
