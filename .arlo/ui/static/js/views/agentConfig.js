/**
 * Agent Configuration View
 * Handles the agent configuration interface logic
 */

const agentConfig = (() => {
  // Agent config state
  let currentAgent = null;
  let hasUnsavedChanges = false;
  let originalConfig = null;

  /**
   * Initialize the agent configuration
   * @param {string} agentId - The ID of the agent to configure
   */
  function init(agentId) {
    currentAgent = agentId;
    loadAgentConfig(agentId);
    loadAgentSystemPrompt(agentId);
    setupEventHandlers();
  }

  /**
   * Load agent configuration from the server
   * @param {string} agentId - The agent ID to load configuration for
   */
  async function loadAgentConfig(agentId) {
    try {
      const response = await fetch(`/api/agent/${agentId}/config`);
      if (!response.ok) {
        throw new Error(
          `Failed to load agent configuration: ${response.statusText}`
        );
      }

      const config = await response.json();
      originalConfig = { ...config };

      // Populate the form with the agent's configuration
      populateConfigForm(config);

      // Reset unsaved changes flag
      hasUnsavedChanges = false;
      updateSaveButton();
    } catch (error) {
      console.error("Error loading agent configuration:", error);
      showNotification(
        `Error loading configuration: ${error.message}`,
        "error"
      );
    }
  }

  /**
   * Populate the configuration form with agent data
   * @param {Object} config - The agent configuration object
   */
  function populateConfigForm(config) {
    // Basic settings
    setFormValue("agent-name", config.name);
    setFormValue("agent-model", config.model);
    setFormValue("agent-role", config.role);
    setFormValue("agent-specialization", config.specialization);
    setFormValue("agent-priority", config.priority);

    // Model parameters
    setFormValue("agent-temperature", config.temperature);
    updateRangeValue("agent-temperature", config.temperature);
    setFormValue("agent-context-window", config.contextWindow);
    setFormValue("reasoning-depth", config.reasoningDepth);
    setFormValue("agent-verbosity", config.verbosity);

    // Access permissions
    setFormValue("agent-system-access", config.systemAccess);
    setFormValue("agent-git-access", config.gitAccess);
    setFormValue("agent-file-write-access", config.fileWriteAccess);
    setFormValue("agent-api-access", config.apiAccess);

    // Knowledge management
    populateKnowledgeSources(config.knowledgeSources || []);
    setFormValue("knowledge-update-frequency", config.knowledgeUpdateFrequency);
    setFormValue("auto-learn-from-tasks", config.autoLearnFromTasks);
    setFormValue("enable-agent-memory", config.enableMemory);
    setFormValue("memory-retention", config.memoryRetention);

    // Collaboration settings
    populateCollaborators(config.collaborators || []);
    setFormValue("collaboration-mode", config.collaborationMode);

    // Custom attributes
    populateCustomAttributes(config.customAttributes || {});
  }

  /**
   * Set a form value based on input type
   * @param {string} id - The element ID
   * @param {any} value - The value to set
   */
  function setFormValue(id, value) {
    const element = document.getElementById(id);
    if (!element) return;

    if (element.type === "checkbox") {
      element.checked = Boolean(value);
    } else {
      element.value = value;
    }
  }

  /**
   * Update the display value for a range input
   * @param {string} id - The range input ID
   * @param {string|number} value - The value to display
   */
  function updateRangeValue(id, value) {
    const rangeElement = document.getElementById(id);
    if (!rangeElement) return;

    const valueDisplay =
      rangeElement.parentElement.querySelector(".range-value");
    if (valueDisplay) {
      if (id === "agent-temperature") {
        valueDisplay.textContent = Number(value).toFixed(2);
      } else {
        valueDisplay.textContent = value;
      }
    }
  }

  /**
   * Populate knowledge sources tags
   * @param {Array} sources - Array of knowledge source strings
   */
  function populateKnowledgeSources(sources) {
    const container = document.getElementById("knowledge-sources-tags");
    if (!container) return;

    // Clear existing tags except the input
    const input = container.querySelector(".tag-input");
    container.innerHTML = "";
    if (input) container.appendChild(input);

    // Add each source as a tag
    sources.forEach((source) => {
      const tag = createTag(source);
      container.insertBefore(tag, input);
    });
  }

  /**
   * Create a tag element
   * @param {string} text - The tag text
   * @return {HTMLElement} The tag element
   */
  function createTag(text) {
    const tag = document.createElement("span");
    tag.className = "kb-input-tag";
    tag.innerHTML = `${text}<button class="kb-tag-remove">×</button>`;

    // Add remove handler
    const removeBtn = tag.querySelector(".kb-tag-remove");
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        tag.remove();
        markAsChanged();
      });
    }

    return tag;
  }

  /**
   * Populate collaborator checkboxes
   * @param {Array} collaborators - Array of collaborator agent IDs
   */
  function populateCollaborators(collaborators) {
    const checkboxes = document.querySelectorAll(".collab-checkbox");
    checkboxes.forEach((checkbox) => {
      const agentId = checkbox.id.replace("collab-", "");
      checkbox.checked = collaborators.includes(agentId);
    });
  }

  /**
   * Populate custom attributes list
   * @param {Object} attributes - Object containing key-value attribute pairs
   */
  function populateCustomAttributes(attributes) {
    const container = document.getElementById("custom-attributes-list");
    if (!container) return;

    // Clear existing attributes
    container.innerHTML = "";

    // If no attributes, show empty state
    if (Object.keys(attributes).length === 0) {
      container.innerHTML =
        '<div class="no-attributes">No custom attributes defined</div>';
      return;
    }

    // Add each attribute
    Object.entries(attributes).forEach(([key, value]) => {
      const attributeItem = createAttributeItem(key, value);
      container.appendChild(attributeItem);
    });
  }

  /**
   * Create an attribute item element
   * @param {string} key - The attribute key
   * @param {string} value - The attribute value
   * @return {HTMLElement} The attribute item element
   */
  function createAttributeItem(key, value) {
    const item = document.createElement("div");
    item.className = "attribute-item";
    item.innerHTML = `
      <div class="attribute-content">
        <div class="attribute-key">${key}</div>
        <div class="attribute-value">${value}</div>
      </div>
      <div class="attribute-actions">
        <button class="delete-attribute-btn">×</button>
      </div>
    `;

    // Add delete handler
    const deleteBtn = item.querySelector(".delete-attribute-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        item.remove();
        markAsChanged();

        // If no attributes left, show empty state
        const container = document.getElementById("custom-attributes-list");
        if (container && container.children.length === 0) {
          container.innerHTML =
            '<div class="no-attributes">No custom attributes defined</div>';
        }
      });
    }

    return item;
  }

  /**
   * Load agent system prompt from the server
   * @param {string} agentId - The agent ID to load system prompt for
   */
  async function loadAgentSystemPrompt(agentId) {
    try {
      // Get the agent info which includes the execution config with system prompt
      const response = await fetch(`/api/agent/${agentId}/info`);
      if (!response.ok) {
        throw new Error(`Failed to load agent info: ${response.statusText}`);
      }

      const data = await response.json();

      // Check if we have an execution config with a system prompt
      if (data.agent && data.agent.config && data.agent.config.systemPrompt) {
        const systemPromptTextarea = document.getElementById(
          "agent-system-prompt"
        );
        if (systemPromptTextarea) {
          systemPromptTextarea.value = data.agent.config.systemPrompt;
        }
      } else if (data.agent && data.agent.systemPrompt) {
        // Alternate location for system prompt
        const systemPromptTextarea = document.getElementById(
          "agent-system-prompt"
        );
        if (systemPromptTextarea) {
          systemPromptTextarea.value = data.agent.systemPrompt;
        }
      }
    } catch (error) {
      console.error("Error loading agent system prompt:", error);
      showNotification(
        `Error loading system prompt: ${error.message}`,
        "error"
      );
    }
  }

  /**
   * Update the agent's system prompt
   */
  async function updateSystemPrompt() {
    if (!currentAgent) return;

    const systemPromptTextarea = document.getElementById("agent-system-prompt");
    if (!systemPromptTextarea) return;

    const systemPrompt = systemPromptTextarea.value.trim();

    if (systemPrompt.length < 10) {
      showNotification(
        "System prompt must be at least 10 characters long",
        "warning"
      );
      return;
    }

    try {
      const response = await fetch(`/api/agent/${currentAgent}/system-prompt`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ systemPrompt }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update system prompt: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        showNotification("System prompt updated successfully", "success");
      } else {
        throw new Error(result.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error updating system prompt:", error);
      showNotification(
        `Error updating system prompt: ${error.message}`,
        "error"
      );
    }
  }

  /**
   * Reset the agent's system prompt to default
   */
  async function resetSystemPrompt() {
    if (!currentAgent) return;

    try {
      const confirmed = confirm(
        "Are you sure you want to reset the system prompt to its default value?"
      );
      if (!confirmed) return;

      // We'll use the same endpoint but send an empty string to trigger a reset to default
      const response = await fetch(`/api/agent/${currentAgent}/system-prompt`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ systemPrompt: "DEFAULT_RESET" }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to reset system prompt: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        // Update the textarea with the default system prompt
        const systemPromptTextarea = document.getElementById(
          "agent-system-prompt"
        );
        if (systemPromptTextarea && result.agent && result.agent.systemPrompt) {
          systemPromptTextarea.value = result.agent.systemPrompt;
        }

        showNotification("System prompt reset to default", "success");
      } else {
        throw new Error(result.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error resetting system prompt:", error);
      showNotification(
        `Error resetting system prompt: ${error.message}`,
        "error"
      );
    }
  }

  /**
   * Set up event handlers for the configuration interface
   */
  function setupEventHandlers() {
    // Save button
    const saveBtn = document.getElementById("save-agent-config");
    if (saveBtn) {
      saveBtn.addEventListener("click", saveAgentConfig);
    }

    // Reset button
    const resetBtn = document.getElementById("reset-agent-config");
    if (resetBtn) {
      resetBtn.addEventListener("click", resetAgentConfig);
    }

    // Update system prompt button
    const updateSystemPromptBtn = document.getElementById(
      "update-system-prompt"
    );
    if (updateSystemPromptBtn) {
      updateSystemPromptBtn.addEventListener("click", updateSystemPrompt);
    }

    // Reset system prompt button
    const resetSystemPromptBtn = document.getElementById("reset-system-prompt");
    if (resetSystemPromptBtn) {
      resetSystemPromptBtn.addEventListener("click", resetSystemPrompt);
    }

    // Temperature range input
    const temperatureInput = document.getElementById("agent-temperature");
    if (temperatureInput) {
      temperatureInput.addEventListener("input", (e) => {
        updateRangeValue("agent-temperature", e.target.value);
        markAsChanged();
      });
    }

    // Change detection for inputs, selects, and checkboxes
    document
      .querySelectorAll(".config-form input, .config-form select")
      .forEach((element) => {
        // Skip the system prompt textarea as it has its own save button
        if (element.id !== "agent-system-prompt") {
          element.addEventListener("change", markAsChanged);
          if (element.type === "text" || element.type === "number") {
            element.addEventListener("input", markAsChanged);
          }
        }
      });

    // Knowledge sources tag input
    const tagInput = document.getElementById("knowledge-sources-input");
    if (tagInput) {
      tagInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault();

          const tagText = tagInput.value.trim();
          if (tagText) {
            const tag = createTag(tagText);
            tagInput.parentElement.insertBefore(tag, tagInput);
            tagInput.value = "";
            markAsChanged();
          }
        }
      });
    }

    // Custom attributes
    const addAttributeBtn = document.getElementById("add-attribute-btn");
    if (addAttributeBtn) {
      addAttributeBtn.addEventListener("click", addCustomAttribute);
    }

    // Toggle sections
    document.querySelectorAll(".section-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const section = toggle.nextElementSibling;
        const isVisible = section.style.display !== "none";

        section.style.display = isVisible ? "none" : "block";
        const icon = toggle.querySelector(".toggle-icon");
        if (icon) {
          icon.textContent = isVisible ? "+" : "-";
        }
      });
    });
  }

  /**
   * Mark the form as having unsaved changes
   */
  function markAsChanged() {
    hasUnsavedChanges = true;
    updateSaveButton();
  }

  /**
   * Update the save button state based on changes
   */
  function updateSaveButton() {
    const saveBtn = document.getElementById("save-agent-config");
    if (saveBtn) {
      saveBtn.disabled = !hasUnsavedChanges;
      saveBtn.classList.toggle("btn-primary", hasUnsavedChanges);
      saveBtn.classList.toggle("btn-secondary", !hasUnsavedChanges);
    }
  }

  /**
   * Add a custom attribute from the form inputs
   */
  function addCustomAttribute() {
    const keyInput = document.getElementById("attribute-key");
    const valueInput = document.getElementById("attribute-value");

    if (!keyInput || !valueInput) return;

    const key = keyInput.value.trim();
    const value = valueInput.value.trim();

    if (!key || !value) {
      showNotification("Both key and value are required", "warning");
      return;
    }

    // Create and add the attribute item
    const container = document.getElementById("custom-attributes-list");
    if (container) {
      // Remove empty state if present
      const emptyState = container.querySelector(".no-attributes");
      if (emptyState) {
        emptyState.remove();
      }

      // Add the new attribute
      const attributeItem = createAttributeItem(key, value);
      container.appendChild(attributeItem);

      // Clear inputs
      keyInput.value = "";
      valueInput.value = "";

      // Mark as changed
      markAsChanged();
    }
  }

  /**
   * Save the agent configuration
   */
  async function saveAgentConfig() {
    if (!currentAgent) return;

    try {
      // Collect all form data
      const config = collectFormData();

      // Save to server
      const response = await fetch(`/api/agent/${currentAgent}/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to save agent configuration: ${response.statusText}`
        );
      }

      // Update original config
      originalConfig = { ...config };

      // Reset unsaved changes flag
      hasUnsavedChanges = false;
      updateSaveButton();

      // Show success notification
      showNotification("Agent configuration saved successfully", "success");
    } catch (error) {
      console.error("Error saving agent configuration:", error);
      showNotification(`Error saving configuration: ${error.message}`, "error");
    }
  }

  /**
   * Collect all form data into a config object
   * @return {Object} The collected configuration
   */
  function collectFormData() {
    const config = {
      // Basic settings
      name: getFormValue("agent-name"),
      model: getFormValue("agent-model"),
      role: getFormValue("agent-role"),
      specialization: getFormValue("agent-specialization"),
      priority: getFormValue("agent-priority"),

      // Model parameters
      temperature: parseFloat(getFormValue("agent-temperature")),
      contextWindow: parseInt(getFormValue("agent-context-window"), 10),
      reasoningDepth: getFormValue("reasoning-depth"),
      verbosity: getFormValue("agent-verbosity"),

      // Access permissions
      systemAccess: getFormValue("agent-system-access"),
      gitAccess: getFormValue("agent-git-access"),
      fileWriteAccess: getFormValue("agent-file-write-access"),
      apiAccess: getFormValue("agent-api-access"),

      // Knowledge management
      knowledgeSources: collectKnowledgeSources(),
      knowledgeUpdateFrequency: getFormValue("knowledge-update-frequency"),
      autoLearnFromTasks: getFormValue("auto-learn-from-tasks"),
      enableMemory: getFormValue("enable-agent-memory"),
      memoryRetention: getFormValue("memory-retention"),

      // Collaboration settings
      collaborators: collectCollaborators(),
      collaborationMode: getFormValue("collaboration-mode"),

      // Custom attributes
      customAttributes: collectCustomAttributes(),
    };

    return config;
  }

  /**
   * Get a form value based on input type
   * @param {string} id - The element ID
   * @return {any} The form value
   */
  function getFormValue(id) {
    const element = document.getElementById(id);
    if (!element) return null;

    if (element.type === "checkbox") {
      return element.checked;
    } else {
      return element.value;
    }
  }

  /**
   * Collect knowledge sources from the tags
   * @return {Array} Array of knowledge source strings
   */
  function collectKnowledgeSources() {
    const container = document.getElementById("knowledge-sources-tags");
    if (!container) return [];

    const tags = container.querySelectorAll(".kb-input-tag");
    return Array.from(tags).map((tag) => {
      // Remove the button from the text content
      const text = tag.textContent.replace("×", "").trim();
      return text;
    });
  }

  /**
   * Collect collaborators from checkboxes
   * @return {Array} Array of collaborator agent IDs
   */
  function collectCollaborators() {
    const checkboxes = document.querySelectorAll(".collab-checkbox:checked");
    return Array.from(checkboxes).map((checkbox) => {
      return checkbox.id.replace("collab-", "");
    });
  }

  /**
   * Collect custom attributes from the list
   * @return {Object} Object of key-value attribute pairs
   */
  function collectCustomAttributes() {
    const container = document.getElementById("custom-attributes-list");
    if (!container) return {};

    const attributeItems = container.querySelectorAll(".attribute-item");
    const attributes = {};

    attributeItems.forEach((item) => {
      const key = item.querySelector(".attribute-key").textContent.trim();
      const value = item.querySelector(".attribute-value").textContent.trim();
      attributes[key] = value;
    });

    return attributes;
  }

  /**
   * Reset the agent configuration to its original state
   */
  function resetAgentConfig() {
    if (!originalConfig) return;

    // Confirm reset
    if (hasUnsavedChanges) {
      const confirmed = confirm(
        "Are you sure you want to reset? All unsaved changes will be lost."
      );
      if (!confirmed) return;
    }

    // Repopulate form with original config
    populateConfigForm(originalConfig);

    // Reset unsaved changes flag
    hasUnsavedChanges = false;
    updateSaveButton();

    // Show notification
    showNotification("Agent configuration reset to saved state", "info");
  }

  /**
   * Show a notification to the user
   * @param {string} message - The notification message
   * @param {string} type - The notification type (success, error, warning, info)
   */
  function showNotification(message, type = "info") {
    if (typeof window.showNotification === "function") {
      window.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
      alert(`${message}`);
    }
  }

  // Return public API
  return {
    init,
    saveAgentConfig,
    resetAgentConfig,
    updateSystemPrompt,
    resetSystemPrompt,
  };
})();

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Agent config will be initialized when an agent is selected
});

// Export the module as ES module default export
export default agentConfig;
// Also make it available on window for legacy code
window.agentConfig = agentConfig;
