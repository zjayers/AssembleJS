/**
 * Knowledge Document Editor
 * Handles document editing, viewing, and saving in the knowledge base
 */

import VectorDB from "../modules/vectordb.js";

// Current document state
let currentDocument = null;
let isEditMode = false;
let hasUnsavedChanges = false;

// Initialize document editor
function initDocumentEditor() {
  // Get document editor elements
  const editToggleBtn = document.getElementById("kb-document-edit-toggle");
  const documentView = document.getElementById("kb-document-view");
  const documentEditForm = document.getElementById("kb-document-edit-form");
  const saveDocBtn = document.getElementById("kb-document-save");
  const cancelBtn = document.getElementById("kb-document-cancel");
  const relatedBtn = document.getElementById("kb-document-related");
  const exportBtn = document.getElementById("kb-document-export");
  const metadataToggle = document.querySelector(".kb-metadata-toggle");
  const metadataEditor = document.getElementById("kb-document-metadata");

  // Set up editor toolbar actions
  setupEditorToolbar();

  // Toggle between view and edit mode
  if (editToggleBtn) {
    editToggleBtn.addEventListener("click", () => {
      toggleEditMode();
    });
  }

  // Save document
  if (saveDocBtn) {
    saveDocBtn.addEventListener("click", async () => {
      await saveDocument();
    });
  }

  // Cancel editing
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      cancelEditing();
    });
  }

  // Find related documents
  if (relatedBtn) {
    relatedBtn.addEventListener("click", () => {
      findRelatedDocuments();
    });
  }

  // Export document
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      exportDocument();
    });
  }

  // Toggle metadata editor
  if (metadataToggle && metadataEditor) {
    metadataToggle.addEventListener("click", () => {
      const isVisible = metadataEditor.style.display !== "none";
      metadataEditor.style.display = isVisible ? "none" : "block";

      // Update toggle text and icon
      const toggleText = metadataToggle.querySelector("span");
      const toggleIcon = metadataToggle.querySelector("svg");

      if (toggleText) {
        toggleText.textContent = isVisible
          ? "Show Metadata Editor"
          : "Hide Metadata Editor";
      }

      if (toggleIcon) {
        // Rotate the icon
        toggleIcon.style.transform = isVisible
          ? "rotate(0deg)"
          : "rotate(180deg)";
      }
    });
  }

  // Add form change detection
  const formInputs = document.querySelectorAll(
    "#kb-document-edit-form input, #kb-document-edit-form textarea, #kb-document-edit-form select"
  );
  formInputs.forEach((input) => {
    input.addEventListener("change", () => {
      hasUnsavedChanges = true;
    });

    if (input.tagName === "TEXTAREA") {
      input.addEventListener("input", () => {
        hasUnsavedChanges = true;
      });
    }
  });

  // Setup tag input handler
  setupTagInput();
}

// Setup tag input with add/remove functionality
function setupTagInput() {
  const tagInput = document.getElementById("kb-document-tags-input");
  const tagsContainer = document.querySelector(".kb-input-tags");

  if (!tagInput || !tagsContainer) return;

  // Handle tag input
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

  // Handle existing tag removal
  const removeButtons = tagsContainer.querySelectorAll(".kb-tag-remove");
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const tagElement = btn.parentElement;
      if (tagElement) {
        tagElement.remove();
        hasUnsavedChanges = true;
      }
    });
  });
}

// Add a new tag to the tags container
function addTag(tagText) {
  const tagsContainer = document.querySelector(".kb-input-tags");
  if (!tagsContainer) return;

  const tagElement = document.createElement("span");
  tagElement.className = "kb-input-tag";
  tagElement.innerHTML = `${tagText}<button class="kb-tag-remove">×</button>`;

  // Insert before the input
  const tagInput = document.getElementById("kb-document-tags-input");
  tagsContainer.insertBefore(tagElement, tagInput);

  // Add remove handler
  const removeBtn = tagElement.querySelector(".kb-tag-remove");
  if (removeBtn) {
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      tagElement.remove();
      hasUnsavedChanges = true;
    });
  }

  hasUnsavedChanges = true;
}

// Set up markdown editor toolbar
function setupEditorToolbar() {
  const toolbar = document.querySelector(".kb-editor-toolbar");
  if (!toolbar) return;

  const markdownEditor = document.getElementById("kb-document-content");
  if (!markdownEditor) return;

  // Get all toolbar buttons
  const buttons = toolbar.querySelectorAll(".kb-toolbar-button");

  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();

      // Get button type from title or icon
      const buttonType = button.getAttribute("title").toLowerCase();
      const editorValue = markdownEditor.value || "";
      const selectionStart = markdownEditor.selectionStart;
      const selectionEnd = markdownEditor.selectionEnd;
      const selectedText = editorValue.substring(selectionStart, selectionEnd);

      let replacement = "";
      let cursorOffset = 0;

      // Apply markdown formatting based on button type
      switch (buttonType) {
        case "bold":
          replacement = `**${selectedText}**`;
          cursorOffset = selectedText ? 0 : 2;
          break;

        case "italic":
          replacement = `*${selectedText}*`;
          cursorOffset = selectedText ? 0 : 1;
          break;

        case "header":
          replacement = `## ${selectedText}`;
          cursorOffset = selectedText ? 0 : 3;
          break;

        case "code block":
          replacement = `\`\`\`\n${selectedText}\n\`\`\``;
          cursorOffset = selectedText ? 0 : 4;
          break;

        case "list":
          replacement = selectedText
            ? selectedText
                .split("\n")
                .map((line) => `- ${line}`)
                .join("\n")
            : "- ";
          cursorOffset = selectedText ? 0 : 2;
          break;

        case "link":
          replacement = selectedText ? `[${selectedText}](url)` : "[](url)";
          cursorOffset = selectedText ? selectedText.length + 3 : 1;
          break;
      }

      // Insert the replacement
      if (replacement) {
        const newValue =
          editorValue.substring(0, selectionStart) +
          replacement +
          editorValue.substring(selectionEnd);

        markdownEditor.value = newValue;

        // Set cursor position
        if (selectedText) {
          markdownEditor.setSelectionRange(
            selectionStart + replacement.length,
            selectionStart + replacement.length
          );
        } else {
          markdownEditor.setSelectionRange(
            selectionStart + replacement.length - cursorOffset,
            selectionStart + replacement.length - cursorOffset
          );
        }

        markdownEditor.focus();
        hasUnsavedChanges = true;
      }
    });
  });
}

// Toggle between view and edit modes
function toggleEditMode() {
  const documentView = document.getElementById("kb-document-view");
  const documentEditForm = document.getElementById("kb-document-edit-form");
  const editToggleBtn = document.getElementById("kb-document-edit-toggle");

  if (!documentView || !documentEditForm || !editToggleBtn) return;

  isEditMode = !isEditMode;

  // Toggle display
  documentView.style.display = isEditMode ? "none" : "block";
  documentEditForm.style.display = isEditMode ? "block" : "none";

  // Update button text
  if (isEditMode) {
    editToggleBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
            Cancel Edit
        `;
  } else {
    editToggleBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Edit Document
        `;
  }

  // If switching to edit mode, we need to populate the form
  if (isEditMode && currentDocument) {
    populateEditForm(currentDocument);
  }

  // If switching back to view mode and has changes, confirm
  if (!isEditMode && hasUnsavedChanges) {
    const confirmDiscard = confirm(
      "You have unsaved changes. Are you sure you want to discard them?"
    );

    if (!confirmDiscard) {
      // If user cancels, switch back to edit mode
      toggleEditMode();
    } else {
      // Reset flag
      hasUnsavedChanges = false;
    }
  }
}

// Cancel editing
function cancelEditing() {
  if (isEditMode) {
    toggleEditMode();
  }
}

// Populate edit form with document data
function populateEditForm(document) {
  // Get form fields
  const titleInput = document.getElementById("kb-document-title");
  const collectionSelect = document.getElementById("kb-document-collection");
  const typeSelect = document.getElementById("kb-document-type");
  const contentTextarea = document.getElementById("kb-document-content");
  const metadataTextarea = document.getElementById("kb-document-metadata");
  const tagsContainer = document.querySelector(".kb-input-tags");

  // Reset tags container except for the input
  if (tagsContainer) {
    const tagInput = document.getElementById("kb-document-tags-input");
    tagsContainer.innerHTML = "";
    if (tagInput) {
      tagsContainer.appendChild(tagInput);
    }
  }

  // Populate form fields if document exists
  if (document) {
    if (titleInput) titleInput.value = document.title || "";

    // Set collection if known
    if (collectionSelect && document.collection) {
      const option = collectionSelect.querySelector(
        `option[value="${document.collection}"]`
      );
      if (option) {
        option.selected = true;
      }
    }

    // Set document type if known
    if (typeSelect && document.type) {
      const option = typeSelect.querySelector(
        `option[value="${document.type}"]`
      );
      if (option) {
        option.selected = true;
      }
    }

    // Set content
    if (contentTextarea) contentTextarea.value = document.content || "";

    // Set metadata as JSON
    if (metadataTextarea && document.metadata) {
      metadataTextarea.value = JSON.stringify(document.metadata, null, 2);
    }

    // Add tags
    if (tagsContainer && document.tags && Array.isArray(document.tags)) {
      document.tags.forEach((tag) => {
        addTag(tag);
      });
    }
  }

  // Reset changes flag
  hasUnsavedChanges = false;
}

// Save document changes
async function saveDocument() {
  // Check if in edit mode
  if (!isEditMode) return;

  // Get form data
  const titleInput = document.getElementById("kb-document-title");
  const collectionSelect = document.getElementById("kb-document-collection");
  const typeSelect = document.getElementById("kb-document-type");
  const contentTextarea = document.getElementById("kb-document-content");
  const metadataTextarea = document.getElementById("kb-document-metadata");

  // Get tags
  const tagElements = document.querySelectorAll(".kb-input-tag");
  const tags = Array.from(tagElements).map((el) =>
    el.textContent.replace("×", "").trim()
  );

  // Validate required fields
  if (!titleInput || !titleInput.value.trim()) {
    alert("Please enter a document title");
    return;
  }

  if (!contentTextarea || !contentTextarea.value.trim()) {
    alert("Please enter document content");
    return;
  }

  if (!collectionSelect || !collectionSelect.value) {
    alert("Please select a collection");
    return;
  }

  // Prepare document data
  const documentData = {
    title: titleInput.value.trim(),
    collection: collectionSelect.value,
    type: typeSelect ? typeSelect.value : "documentation",
    content: contentTextarea.value,
    tags: tags,
  };

  // Parse metadata if provided
  if (metadataTextarea && metadataTextarea.value.trim()) {
    try {
      documentData.metadata = JSON.parse(metadataTextarea.value);
    } catch (error) {
      alert(`Invalid metadata JSON: ${error.message}`);
      return;
    }
  } else {
    // Default metadata
    documentData.metadata = {
      type: documentData.type,
      tags: tags,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // Show loading state
    const saveBtn = document.getElementById("kb-document-save");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<div class="spinner-small"></div> Saving...';
    }

    // Save to vector database
    const collection = documentData.collection;
    const document = {
      content: documentData.content,
      metadata: {
        ...documentData.metadata,
        title: documentData.title,
        tags: documentData.tags,
      },
    };

    // Check if editing existing document or creating new
    let result;
    if (currentDocument && currentDocument.id) {
      // Update existing document - not directly supported, so delete and recreate
      await VectorDB.deleteDocument(collection, currentDocument.id);
      result = await VectorDB.addDocument(collection, document);
    } else {
      // Add new document
      result = await VectorDB.addDocument(collection, document);
    }

    if (result && result.success) {
      // Update current document
      currentDocument = {
        ...documentData,
        id: result.id,
      };

      // Show success notification
      showNotification("Document saved successfully!", "success");

      // Switch back to view mode
      hasUnsavedChanges = false;
      toggleEditMode();

      // Update view with new content
      updateDocumentView(currentDocument);
    } else {
      // Show error
      alert("Error saving document: " + (result.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Error saving document:", error);
    alert(`Error saving document: ${error.message}`);
  } finally {
    // Reset save button
    const saveBtn = document.getElementById("kb-document-save");
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = "Save Document";
    }
  }
}

// Update document view with content
function updateDocumentView(document) {
  const documentView = document.getElementById("kb-document-view");
  if (!documentView) return;

  if (!document) {
    // Show empty state
    documentView.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📄</div>
                <div class="empty-state-text">No document selected</div>
            </div>
        `;
    return;
  }

  // Define agent colors
  const agentColors = {
    Admin: "#F44336",
    Types: "#E91E63",
    Utils: "#9C27B0",
    Validator: "#673AB7",
    Developer: "#3F51B5",
    Browser: "#2196F3",
    Version: "#03A9F4",
    Server: "#00BCD4",
    Testbed: "#009688",
    Pipeline: "#4CAF50",
    Generator: "#8BC34A",
    Config: "#CDDC39",
    Docs: "#FFEB3B",
    Git: "#FFC107",
    Analyzer: "#FF9800",
    Bundler: "#FF5722",
    ARLO: "#607D8B",
  };

  // Extract agent name from collection
  let agentName = "Unknown";
  let agentColor = "#808080";

  if (document.collection && document.collection.startsWith("agent_")) {
    agentName = document.collection.replace("agent_", "");
    agentColor = agentColors[agentName] || agentColor;
  }

  // Format date
  const timestamp = document.metadata?.timestamp || new Date().toISOString();
  const formattedDate = new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Render document header
  documentView.innerHTML = `
        <div class="kb-document-header">
            <h2 class="kb-document-title">${
              document.title || "Untitled Document"
            }</h2>
            <div class="kb-document-meta">
                <span class="kb-document-source" style="background-color: ${agentColor}20; color: ${agentColor};">
                    ${agentName} Agent
                </span>
                <span class="kb-document-date">Last Updated: ${formattedDate}</span>
            </div>
            <div class="kb-document-tags">
                ${
                  document.tags && document.tags.length
                    ? document.tags
                        .map((tag) => `<span class="kb-tag">${tag}</span>`)
                        .join("")
                    : ""
                }
            </div>
        </div>
        
        <div class="kb-document-body">
            <!-- Document content will be rendered here -->
        </div>
    `;

  // Render document content with markdown
  const documentBody = documentView.querySelector(".kb-document-body");
  if (documentBody && document.content) {
    // Simple markdown parsing (in a real app, use a markdown library)
    let html = "";

    // Split content into sections based on headers
    const sections = parseMarkdownSections(document.content);

    // Render each section
    sections.forEach((section) => {
      html += `
                <h3>${section.title || "Overview"}</h3>
                ${renderMarkdownContent(section.content)}
            `;
    });

    documentBody.innerHTML = html;
  }
}

// Parse markdown content into sections
function parseMarkdownSections(markdown) {
  if (!markdown) return [];

  // Split by headers
  const lines = markdown.split("\n");
  const sections = [];
  let currentSection = {
    title: "Overview",
    content: "",
  };

  for (const line of lines) {
    if (line.startsWith("# ")) {
      // Add previous section if not empty
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        title: line.substring(2).trim(),
        content: "",
      };
    } else if (line.startsWith("## ")) {
      // Add previous section if not empty
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }

      // Start new section with h2
      currentSection = {
        title: line.substring(3).trim(),
        content: "",
      };
    } else {
      // Add line to current section
      currentSection.content += line + "\n";
    }
  }

  // Add final section
  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }

  return sections;
}

// Render markdown content to HTML
function renderMarkdownContent(markdown) {
  if (!markdown) return "";

  let html = "";
  const codeBlocks = [];
  let inCodeBlock = false;
  let codeBlockContent = "";
  let codeBlockIndex = 0;

  // First pass - extract code blocks
  const lines = markdown.split("\n");
  const contentLines = [];

  for (const line of lines) {
    if (line.trim() === "```" || line.startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        codeBlocks.push(codeBlockContent);
        contentLines.push(`%%CODE_BLOCK_${codeBlockIndex}%%`);
        codeBlockIndex++;
        codeBlockContent = "";
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
      }
    } else if (inCodeBlock) {
      // Add to code block
      codeBlockContent += line + "\n";
    } else {
      // Regular content
      contentLines.push(line);
    }
  }

  // Second pass - process regular content
  let inParagraph = false;
  let inList = false;

  for (const line of contentLines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("%%CODE_BLOCK_")) {
      // Add code block
      const index = parseInt(trimmedLine.match(/%%CODE_BLOCK_(\d+)%%/)[1]);
      html += `<div class="kb-code-block"><pre><code>${codeBlocks[index]}</code></pre></div>`;

      if (inParagraph) {
        html += "</p>";
        inParagraph = false;
      }

      if (inList) {
        html += "</ul>";
        inList = false;
      }
    } else if (trimmedLine.startsWith("### ")) {
      // h3 heading
      if (inParagraph) {
        html += "</p>";
        inParagraph = false;
      }

      if (inList) {
        html += "</ul>";
        inList = false;
      }

      html += `<h4>${trimmedLine.substring(4)}</h4>`;
    } else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
      // List item
      if (inParagraph) {
        html += "</p>";
        inParagraph = false;
      }

      if (!inList) {
        html += '<ul class="kb-document-list">';
        inList = true;
      }

      // Process inline formatting in the list item
      const listItemContent = processInlineFormatting(trimmedLine.substring(2));
      html += `<li>${listItemContent}</li>`;
    } else if (trimmedLine === "") {
      // Empty line
      if (inParagraph) {
        html += "</p>";
        inParagraph = false;
      }
    } else {
      // Regular text
      if (!inParagraph) {
        html += "<p>";
        inParagraph = true;
      }

      // Process inline formatting
      html += processInlineFormatting(trimmedLine) + " ";
    }
  }

  // Close any open tags
  if (inParagraph) {
    html += "</p>";
  }

  if (inList) {
    html += "</ul>";
  }

  return html;
}

// Process inline markdown formatting
function processInlineFormatting(text) {
  if (!text) return "";

  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Code
  text = text.replace(/`(.*?)`/g, "<code>$1</code>");

  // Links
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  return text;
}

// Find related documents
async function findRelatedDocuments() {
  if (!currentDocument || !currentDocument.content) return;

  const content = currentDocument.content;
  const collection = currentDocument.collection;

  // Find related docs from same collection
  try {
    const results = await VectorDB.queryCollection(collection, {
      query: content,
      limit: 5,
    });

    // Filter out current document
    const relatedDocs = results.filter((doc) => doc.id !== currentDocument.id);

    // Show in related section
    updateRelatedDocuments(relatedDocs);
  } catch (error) {
    console.error("Error finding related documents:", error);
  }
}

// Update related documents section
function updateRelatedDocuments(documents) {
  const relatedSection = document.querySelector(".kb-document-related");
  if (!relatedSection) {
    // Create related section if it doesn't exist
    const documentBody = document.querySelector(".kb-document-body");
    if (!documentBody) return;

    const section = document.createElement("div");
    section.className = "kb-document-related";
    section.innerHTML = `
            <h3>Related Knowledge</h3>
            <div class="kb-related-items"></div>
        `;

    documentBody.appendChild(section);
  }

  // Get items container
  const itemsContainer = document.querySelector(".kb-related-items");
  if (!itemsContainer) return;

  if (!documents || documents.length === 0) {
    itemsContainer.innerHTML = `
            <div class="empty-state-small">
                <div class="empty-state-text">No related documents found</div>
            </div>
        `;
    return;
  }

  // Render related docs
  itemsContainer.innerHTML = documents
    .map((doc) => {
      const title = doc.metadata?.title || "Unnamed Document";
      const similarity = Math.round(doc.score * 100);

      return `
            <a href="#" class="kb-related-item" data-id="${
              doc.id
            }" data-collection="${doc.collection || ""}">
                <div class="kb-related-title">${title}</div>
                <div class="kb-related-similarity">${similarity}% similar</div>
            </a>
        `;
    })
    .join("");

  // Add click handlers
  document.querySelectorAll(".kb-related-item").forEach((item) => {
    item.addEventListener("click", async (e) => {
      e.preventDefault();

      const id = item.getAttribute("data-id");
      const collection = item.getAttribute("data-collection");

      if (id && collection) {
        // Load the related document
        // In a real app, you would fetch this from the server
        // For now just highlight it
        item.classList.add("active");
      }
    });
  });
}

// Export document as markdown
function exportDocument() {
  if (!currentDocument) return;

  // Create download link
  const content = currentDocument.content;
  const title = currentDocument.title || "document";
  const filename = `${title.toLowerCase().replace(/\s+/g, "-")}.md`;

  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  // Clean up
  URL.revokeObjectURL(url);

  // Show notification
  showNotification("Document exported successfully!", "success");
}

// Create a notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;

  const icon =
    type === "success"
      ? "✅"
      : type === "error"
      ? "❌"
      : type === "warning"
      ? "⚠️"
      : "ℹ️";

  notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;

  document.body.appendChild(notification);

  // Remove after delay
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);

  // Add close button functionality
  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(notification);
  });
}

// Load a document by ID and collection
async function loadDocument(id, collection) {
  try {
    // In a real app, fetch the document from the server
    // For demo purposes, we'll use mock data

    // Show loading state
    const documentView = document.getElementById("kb-document-view");
    if (documentView) {
      documentView.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading document...</p>
                </div>
            `;
    }

    // Fetch document (in a real app)
    // const document = await VectorDB.getDocument(collection, id);

    // Mock document for demo
    const document = {
      id: id,
      collection: collection,
      title: "Component Lifecycle Events",
      content: `# Overview
AssembleJS components follow a specific lifecycle pattern with several key events that you can hook into. Understanding these events is crucial for managing side effects, optimizing performance, and ensuring proper cleanup.

# Lifecycle Events

## 1. Mounted
Called after the component has been mounted to the DOM. This is the ideal place to perform DOM interactions, fetch data, or set up event listeners.

\`\`\`js
const MyComponent = defineComponent({
  setup() {
    onMounted(() => {
      console.log('Component is mounted');
      fetchData();
    });
  }
});
\`\`\`

## 2. Updated
Called after a component's reactive state has changed and the DOM has been updated. Useful for post-update operations.

\`\`\`js
const MyComponent = defineComponent({
  setup() {
    onUpdated(() => {
      console.log('Component was updated');
    });
  }
});
\`\`\`

## 3. Before Unmount
Called right before a component is about to be unmounted and destroyed. Perfect for cleanup operations.

\`\`\`js
const MyComponent = defineComponent({
  setup() {
    onBeforeUnmount(() => {
      console.log('Component will unmount soon');
      clearEventListeners();
    });
  }
});
\`\`\`

## 4. Unmounted
Called after the component has been unmounted. The component instance is still available but the DOM element is gone.

\`\`\`js
const MyComponent = defineComponent({
  setup() {
    onUnmounted(() => {
      console.log('Component is unmounted');
    });
  }
});
\`\`\`

# Best Practices

* Always clean up subscriptions, timers, and event listeners in \`onBeforeUnmount\` hooks
* Avoid expensive operations in the \`updated\` hook
* Use state synchronization patterns when components need to react to their own lifecycle events
* Consider extracting reusable lifecycle logic into composable functions`,
      tags: ["components", "lifecycle", "hooks"],
      metadata: {
        type: "documentation",
        author: "Browser",
        timestamp: "2023-04-23T14:32:10Z",
        format: "markdown",
        version: "1.2",
      },
    };

    // Update current document
    currentDocument = document;

    // Update view
    updateDocumentView(document);
  } catch (error) {
    console.error("Error loading document:", error);

    // Show error
    const documentView = document.getElementById("kb-document-view");
    if (documentView) {
      documentView.innerHTML = `
                <div class="error-state">
                    <div class="error-state-icon">❌</div>
                    <div class="error-state-text">Error loading document: ${error.message}</div>
                </div>
            `;
    }
  }
}

// Create a new document
function createNewDocument() {
  // Reset current document
  currentDocument = {
    title: "New Document",
    content: "",
    tags: [],
    collection: "framework",
    metadata: {
      type: "documentation",
      timestamp: new Date().toISOString(),
    },
  };

  // Switch to edit mode
  isEditMode = false;
  toggleEditMode();
}

export { initDocumentEditor, loadDocument, createNewDocument };
