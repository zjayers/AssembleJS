// Import core modules
import VectorDB from "./modules/vectordb.js";
import {
  submitTask,
  updateTaskHistory,
  showTaskDetails,
  tasks,
  currentTaskId,
  taskIdCounter,
} from "./modules/tasks.js";
import {
  initializePipeline,
  updatePipeline,
  renderPipeline,
  pipelineSteps,
  calculatePipelineProgress,
} from "./modules/pipeline.js";
import codeExecutor from "./modules/codeExecutor.js";
import { initKnowledgeNetwork } from "./modules/knowledgeNetwork.js";
import { connectToTaskUpdates, closeTaskConnection, hasActiveConnection } from "./modules/taskUpdates.js";

// Import view modules
import { initAgentsView } from "./views/agents.js";
import {
  initKnowledgeBaseView,
  performKnowledgeSearch,
  loadCollections,
} from "./views/knowledgeBase.js";
import { initCollectionsView } from "./views/collections.js";
import { initConnectionsView } from "./views/connections.js";
import { setupTaskControls, setCurrentTask, renderTaskExecution } from "./views/task.js";
import { setupKnowledgeBaseSearch } from "./views/search.js";
import {
  initDocumentEditor,
  loadDocument as loadDocumentUtil,
  createNewDocument,
} from "./views/knowledgeDocument.js";
import "./views/agentCollaboration.js";

// Import utility modules
import { setupLogActions } from "./utils/logViewer.js";
import { setupThemeToggle, setupSidebarToggle } from "./utils/theme.js";
import {
  setupAdvancedOptionsToggle,
  setupOutputTabs,
  setupTaskHistorySelection,
  setupTaskHistoryFilter,
} from "./utils/ui.js";
import { createNotification } from "./utils/index.js";

// Make functions available globally
window.submitTask = submitTask;
window.updateTaskHistory = updateTaskHistory;
window.showTaskDetails = showTaskDetails;
window.initAgentsView = initAgentsView;
window.initKnowledgeBaseView = initKnowledgeBaseView;
window.initCollectionsView = initCollectionsView;
window.initConnectionsView = initConnectionsView;
window.performKnowledgeSearch = performKnowledgeSearch;
window.loadCollections = loadCollections;
window.calculatePipelineProgress = calculatePipelineProgress;
window.loadDocument = loadDocumentUtil;
window.createNewDocument = createNewDocument;
window.codeExecutor = codeExecutor;
window.initKnowledgeNetwork = initKnowledgeNetwork;
window.setCurrentTask = setCurrentTask;
window.renderTaskExecution = renderTaskExecution;
window.currentTaskId = currentTaskId;
window.connectToTaskUpdates = connectToTaskUpdates;
window.closeTaskConnection = closeTaskConnection;
window.hasActiveConnection = hasActiveConnection;

// Note: loadDocument function is now imported from ./views/knowledgeDocument.js
// See the import statement at the top of this file

// Note: createNewDocument function is now imported from ./views/knowledgeDocument.js
// See the import statement at the top of this file

// Set up knowledge document editing and saving
// Render markdown content in the document view
function renderMarkdownContent(markdown) {
  const documentView = document.getElementById("kb-document-view");
  if (!documentView) return;

  // Get the document body or create it if it doesn't exist
  let documentBody = documentView.querySelector(".kb-document-body");
  if (!documentBody) {
    documentBody = document.createElement("div");
    documentBody.className = "kb-document-body";
    documentView.appendChild(documentBody);
  }

  // Handle empty content
  if (!markdown) {
    documentBody.textContent = "No content";
    return;
  }

  // Split content into sections
  const sections = [];
  let currentSection = {
    title: "Overview",
    content: "",
  };

  // Process line by line
  const lines = markdown.split("\n");
  for (const line of lines) {
    if (line.startsWith("# ")) {
      // Add previous section if not empty
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }

      // Start new section with h1 header
      currentSection = {
        title: line.substring(2).trim(),
        content: "",
      };
    } else if (line.startsWith("## ")) {
      // Add previous section if not empty
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }

      // Start new section with h2 header
      currentSection = {
        title: line.substring(3).trim(),
        content: "",
      };
    } else {
      // Add line to current section
      currentSection.content += line + "\n";
    }
  }

  // Add the last section
  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }

  // Create a document fragment to build the content safely
  const fragment = document.createDocumentFragment();

  // Render each section
  sections.forEach((section) => {
    // Create section header
    const header = document.createElement("h3");
    header.textContent = section.title || "Overview";
    fragment.appendChild(header);

    // Process content more safely
    let content = section.content;

    // Create a temporary container for the section content
    const sectionContainer = document.createElement("div");

    // Process code blocks (replacing with placeholder and handling later)
    const codeBlocks = [];
    content = content.replace(/```(.+?)```/gs, (match, code) => {
      const id = `code-block-${codeBlocks.length}`;
      codeBlocks.push({ id, code: code.trim() });
      return `[[${id}]]`;
    });

    // Process lists (replacing with placeholder and handling later)
    const listItems = [];
    content = content.replace(/^- (.*)$/gm, (match, item) => {
      const id = `list-item-${listItems.length}`;
      listItems.push({ id, item });
      return `[[${id}]]`;
    });

    // Split content into paragraphs
    const paragraphs = content.split(/\n\n+/);

    paragraphs.forEach((paragraph) => {
      // Skip empty paragraphs
      if (!paragraph.trim()) return;

      // Check for code block placeholder
      const codeBlockMatch = paragraph.match(/\[\[(code-block-\d+)\]\]/);
      if (codeBlockMatch) {
        const blockId = codeBlockMatch[1];
        const codeBlock = codeBlocks.find((block) => block.id === blockId);

        if (codeBlock) {
          const preElement = document.createElement("pre");
          const codeElement = document.createElement("code");
          codeElement.textContent = codeBlock.code;
          preElement.appendChild(codeElement);

          const codeBlockDiv = document.createElement("div");
          codeBlockDiv.className = "kb-code-block";
          codeBlockDiv.appendChild(preElement);
          sectionContainer.appendChild(codeBlockDiv);
        }
        return;
      }

      // Check if paragraph contains list items
      const listItemMatches = paragraph.match(/\[\[(list-item-\d+)\]\]/g);
      if (listItemMatches && listItemMatches.length > 0) {
        const ulElement = document.createElement("ul");
        ulElement.className = "kb-document-list";

        listItemMatches.forEach((placeholder) => {
          const itemId = placeholder.replace("[[", "").replace("]]", "");
          const listItem = listItems.find((item) => item.id === itemId);

          if (listItem) {
            const liElement = document.createElement("li");
            liElement.textContent = listItem.item;
            ulElement.appendChild(liElement);
          }
        });

        sectionContainer.appendChild(ulElement);
        return;
      }

      // Regular paragraph
      const p = document.createElement("p");

      // Process text formatting in the paragraph more safely
      let paragraphText = paragraph;

      // Bold text
      const boldElements = [];
      paragraphText = paragraphText.replace(
        /\*\*(.*?)\*\*/g,
        (match, content) => {
          const id = `bold-${boldElements.length}`;
          boldElements.push({ id, content });
          return `[[${id}]]`;
        }
      );

      // Italic text
      const italicElements = [];
      paragraphText = paragraphText.replace(/\*(.*?)\*/g, (match, content) => {
        const id = `italic-${italicElements.length}`;
        italicElements.push({ id, content });
        return `[[${id}]]`;
      });

      // Inline code
      const codeElements = [];
      paragraphText = paragraphText.replace(/`(.*?)`/g, (match, content) => {
        const id = `code-${codeElements.length}`;
        codeElements.push({ id, content });
        return `[[${id}]]`;
      });

      // Build the paragraph element with properly escaped text
      let currentPosition = 0;
      const textNodes = [];

      // Helper function to find all placeholders
      function findPlaceholders(text) {
        const regex = /\[\[(bold|italic|code)-(\d+)\]\]/g;
        const placeholders = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
          placeholders.push({
            placeholder: match[0],
            type: match[1],
            index: match[2],
            position: match.index,
          });
        }

        return placeholders.sort((a, b) => a.position - b.position);
      }

      const placeholders = findPlaceholders(paragraphText);

      if (placeholders.length === 0) {
        // No formatting, just add text
        p.textContent = paragraphText;
      } else {
        // Add text with formatting
        placeholders.forEach((placeholder) => {
          // Add text before the placeholder
          if (placeholder.position > currentPosition) {
            const textBefore = paragraphText.substring(
              currentPosition,
              placeholder.position
            );
            p.appendChild(document.createTextNode(textBefore));
          }

          // Handle the placeholder
          let element;
          let content;

          if (placeholder.type === "bold") {
            element = document.createElement("strong");
            content = boldElements[placeholder.index].content;
          } else if (placeholder.type === "italic") {
            element = document.createElement("em");
            content = italicElements[placeholder.index].content;
          } else if (placeholder.type === "code") {
            element = document.createElement("code");
            content = codeElements[placeholder.index].content;
          }

          if (element) {
            element.textContent = content;
            p.appendChild(element);
          }

          // Update current position
          currentPosition =
            placeholder.position + placeholder.placeholder.length;
        });

        // Add any remaining text
        if (currentPosition < paragraphText.length) {
          const textAfter = paragraphText.substring(currentPosition);
          p.appendChild(document.createTextNode(textAfter));
        }
      }

      sectionContainer.appendChild(p);
    });

    // Add the section content to the fragment
    fragment.appendChild(sectionContainer);
  });

  // Clear the container and add the new content
  documentBody.innerHTML = "";
  documentBody.appendChild(fragment);
}

function setupKnowledgeDocumentActions() {
  // Get document elements
  const editToggleBtn = document.getElementById("kb-document-edit-toggle");
  const documentView = document.getElementById("kb-document-view");
  const documentEditForm = document.getElementById("kb-document-edit-form");
  const saveDocBtn = document.getElementById("kb-document-save");
  const cancelBtn = document.getElementById("kb-document-cancel");

  // Toggle between view and edit mode
  if (editToggleBtn) {
    editToggleBtn.addEventListener("click", () => {
      // Toggle visibility
      if (documentView && documentEditForm) {
        const isEditMode = documentEditForm.style.display !== "none";
        documentView.style.display = isEditMode ? "block" : "none";
        documentEditForm.style.display = isEditMode ? "none" : "block";

        // Update button text
        if (isEditMode) {
          editToggleBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit Document
                    `;
        } else {
          editToggleBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
                        Cancel Edit
                    `;
        }
      }
    });
  }

  // Save document
  if (saveDocBtn) {
    saveDocBtn.addEventListener("click", async () => {
      // Show saving indicator
      saveDocBtn.innerHTML = '<div class="spinner-small"></div> Saving...';
      saveDocBtn.disabled = true;

      try {
        // Get form data
        const titleInput = document.getElementById("kb-document-title");
        const collectionSelect = document.getElementById(
          "kb-document-collection"
        );
        const typeSelect = document.getElementById("kb-document-type");
        const contentTextarea = document.getElementById("kb-document-content");

        // Create document object
        const documentData = {
          content: contentTextarea ? contentTextarea.value : "",
          metadata: {
            title: titleInput ? titleInput.value : "Untitled Document",
            type: typeSelect ? typeSelect.value : "documentation",
            timestamp: new Date().toISOString(),
          },
        };

        // Get collection name
        const collectionName = collectionSelect
          ? collectionSelect.value
          : "framework";

        // Add document to vector database
        const result = await VectorDB.addDocument(collectionName, documentData);

        if (result && result.success) {
          // Show success message
          showNotification("Document saved successfully!", "success");

          // Render markdown in the view
          renderMarkdownContent(documentData.content);

          // Update document title and metadata in the view
          const docTitle = documentView.querySelector(".kb-document-title");
          if (docTitle && titleInput) {
            docTitle.textContent = titleInput.value || "Untitled Document";
          }

          // Switch back to view mode
          if (editToggleBtn) editToggleBtn.click();
        } else {
          showNotification("Error saving document", "error");
        }
      } catch (error) {
        console.error("Error saving document:", error);
        showNotification(`Error: ${error.message}`, "error");
      } finally {
        // Reset button
        saveDocBtn.innerHTML = "Save Document";
        saveDocBtn.disabled = false;
      }
    });
  }

  // Cancel editing
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      // Switch back to view mode
      if (editToggleBtn) editToggleBtn.click();
    });
  }

  // Setup metadata toggle
  const metadataToggle = document.querySelector(".kb-metadata-toggle");
  const metadataEditor = document.getElementById("kb-document-metadata");

  if (metadataToggle && metadataEditor) {
    metadataToggle.addEventListener("click", () => {
      const isVisible = metadataEditor.style.display !== "none";
      metadataEditor.style.display = isVisible ? "none" : "block";
      metadataToggle.querySelector("span").textContent = isVisible
        ? "Show Metadata Editor"
        : "Hide Metadata Editor";
    });
  }

  // Setup tag input
  setupTagInput();

  // Setup markdown toolbar
  setupMarkdownToolbar();
}

// Setup tag input for document editor
function setupTagInput() {
  const tagInput = document.getElementById("kb-document-tags-input");
  const tagsContainer = document.querySelector(".kb-input-tags");

  if (tagInput && tagsContainer) {
    tagInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();

        const tagText = tagInput.value.trim();
        if (tagText) {
          // Create new tag element
          const tagElement = document.createElement("span");
          tagElement.className = "kb-input-tag";
          tagElement.innerHTML = `${tagText}<button class="kb-tag-remove">×</button>`;

          // Add remove handler
          const removeBtn = tagElement.querySelector(".kb-tag-remove");
          if (removeBtn) {
            removeBtn.addEventListener("click", () => {
              tagElement.remove();
            });
          }

          // Insert before the input
          tagsContainer.insertBefore(tagElement, tagInput);
          tagInput.value = "";
        }
      }
    });

    // Add handlers to existing tag remove buttons
    const removeBtns = tagsContainer.querySelectorAll(".kb-tag-remove");
    removeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tag = btn.parentElement;
        if (tag) tag.remove();
      });
    });
  }
}

// Setup markdown editor toolbar functionality
function setupMarkdownToolbar() {
  const toolbar = document.querySelector(".kb-editor-toolbar");
  const contentTextarea = document.getElementById("kb-document-content");

  if (!toolbar || !contentTextarea) return;

  // Get toolbar buttons
  const buttons = toolbar.querySelectorAll(".kb-toolbar-button");

  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();

      // Get button type and current textarea state
      const buttonType = button.getAttribute("title").toLowerCase();
      const selectionStart = contentTextarea.selectionStart;
      const selectionEnd = contentTextarea.selectionEnd;
      const selectedText = contentTextarea.value.substring(
        selectionStart,
        selectionEnd
      );
      const beforeText = contentTextarea.value.substring(0, selectionStart);
      const afterText = contentTextarea.value.substring(selectionEnd);

      // Define formatting to apply
      let replacement = "";
      let cursorOffset = 0;

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
          if (selectedText) {
            replacement = selectedText
              .split("\n")
              .map((line) => `- ${line}`)
              .join("\n");
          } else {
            replacement = "- ";
          }
          cursorOffset = selectedText ? 0 : 2;
          break;

        case "link":
          if (selectedText) {
            replacement = `[${selectedText}](url)`;
            cursorOffset = replacement.length - 1;
          } else {
            replacement = "[link text](url)";
            cursorOffset = 1;
          }
          break;
      }

      // Apply the formatting
      contentTextarea.value = beforeText + replacement + afterText;

      // Focus the textarea and set the cursor position
      contentTextarea.focus();

      if (selectedText) {
        // If text was selected, place cursor at the end of the replacement
        contentTextarea.setSelectionRange(
          selectionStart + replacement.length,
          selectionStart + replacement.length
        );
      } else {
        // If no text was selected, place cursor at the appropriate position inside the markers
        contentTextarea.setSelectionRange(
          selectionStart + replacement.length - cursorOffset,
          selectionStart + replacement.length - cursorOffset
        );
      }
    });
  });
}

// Show a notification - using the shared utility function
function showNotification(message, type = "info") {
  return createNotification(message, type);
}

// Add to global scope for other modules to use
window.showNotification = showNotification;

// Setup navigation with view initialization
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const viewContainers = document.querySelectorAll(".view-container");

  // Handle navigation clicks
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Update active navigation
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      // Show corresponding view
      const viewName = item.getAttribute("data-view");
      if (viewName) {
        // Hide all views first
        viewContainers.forEach((view) => {
          view.classList.remove("active-view");
          view.style.display = "none";
        });

        // Show the selected view
        const activeView = document.getElementById(`${viewName}-view`);
        if (activeView) {
          activeView.classList.add("active-view");
          activeView.style.display = "block";

          // Ensure we preserve the main layout
          const mainContent = document.querySelector(".main-content");
          if (mainContent) {
            mainContent.style.display = "flex";
          }

          // Make sure sidebar keeps correct state
          const sidebar = document.querySelector(".sidebar");
          if (sidebar) {
            // Remove any inline styles that might override our CSS classes
            sidebar.removeAttribute("style");

            // Check if we're collapsed or expanded
            const isCollapsed =
              localStorage.getItem("sidebarCollapsed") === "true";
            if (isCollapsed) {
              sidebar.classList.add("collapsed");
            } else {
              sidebar.classList.remove("collapsed");
            }
          }

          // Initialize specific views
          if (viewName === "agents") {
            // Use colored avatars version
            initAgentsView();
          } else if (viewName === "knowledge-base") {
            initKnowledgeBaseView();
          } else if (viewName === "collections") {
            initCollectionsView();
          } else if (viewName === "connections") {
            initConnectionsView();
          }
        }
      }
    });
  });
}

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
  // Initialize utilities
  setupLogActions();
  setupThemeToggle();

  // Initialize sidebar properly before setting up toggle
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    // Remove any explicit styles that might be causing issues
    sidebar.removeAttribute("style");

    // Get saved state from localStorage, default to expanded
    const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    if (isCollapsed) {
      sidebar.classList.add("collapsed");
    } else {
      sidebar.classList.remove("collapsed");
    }
  }

  // Now set up the toggle functionality
  setupSidebarToggle();
  setupAdvancedOptionsToggle();
  setupOutputTabs();
  setupTaskHistorySelection();
  setupTaskHistoryFilter();

  // Initialize navigation
  setupNavigation();

  // Initialize task-specific functionality
  setupTaskControls();

  // Initialize search functionality
  setupKnowledgeBaseSearch();

  // Initialize document editor
  try {
    initDocumentEditor();
  } catch (error) {
    console.error("Error initializing document editor:", error);
  }

  // Set up knowledge document edit/save functionality
  setupKnowledgeDocumentActions();

  // Set up MutationObserver to watch for new log viewers
  const observer = new MutationObserver(() => {
    setupLogActions();
  });

  // Start observing with childList and subtree options
  observer.observe(document.body, { childList: true, subtree: true });

  // Disconnect observer when page unloads to prevent memory leaks
  window.addEventListener("beforeunload", () => {
    observer.disconnect();
  });

  // Task form submission
  const taskForm = document.getElementById("task-form");
  if (taskForm) {
    taskForm.addEventListener("submit", submitTask);
  }

  // Initialize empty state if no tasks
  updateTaskHistory();

  // Activate default view if none is active
  const activeView = document.querySelector(".view-container.active-view");
  if (!activeView) {
    const defaultView =
      document.getElementById("workflow-view") ||
      document.getElementById("dashboard-view") ||
      document.querySelector(".view-container");

    if (defaultView) {
      // Show the default view
      defaultView.classList.add("active-view");
      defaultView.style.display = "block";

      // Also highlight the corresponding nav item
      const viewId = defaultView.id;
      const viewName = viewId.replace("-view", "");
      const navItem = document.querySelector(
        `.nav-item[data-view="${viewName}"]`
      );
      if (navItem) {
        navItem.classList.add("active");
      }
    }
  }
});
