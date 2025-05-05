/**
 * Agent Brain View Module
 * Manages the UI for the agent brain tab in agent details view
 */
import { makeRequest } from "../utils/api.js";
import { formatDate } from "../utils/formatters.js";
import EventEmitter from "../utils/eventEmitter.js";

class AgentBrainView {
  constructor() {
    this.eventEmitter = new EventEmitter();
    this.agentId = null;
    this.activeSection = "memories-panel";
    this.brainData = {
      memories: [],
      entities: [],
      preferences: [],
      rules: [],
      successRate: 0,
      tasksCompleted: 0,
    };

    this.init();
  }

  init() {
    // Initialize the view when the brain tab is activated
    document.addEventListener("agent:tabChanged", (e) => {
      if (e.detail.tab === "brain" && e.detail.agentId) {
        this.agentId = e.detail.agentId;
        this.loadBrainData();
        this.setupBrainEvents();
      }
    });
  }

  setupBrainEvents() {
    // Add event listeners to brain section tabs
    const tabs = document.querySelectorAll(".brain-tab");
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const panelId = tab.dataset.tab;
        this.activateTab(tab, panelId);
      });
    });

    // Add refresh button handlers
    document.querySelectorAll(".refresh-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.loadBrainData();
      });
    });

    // Add filter change handlers
    const memoryFilter = document.getElementById("memory-type-filter");
    if (memoryFilter) {
      memoryFilter.addEventListener("change", () => {
        this.filterMemories(memoryFilter.value);
      });
    }

    const entityFilter = document.getElementById("entity-type-filter");
    if (entityFilter) {
      entityFilter.addEventListener("change", () => {
        this.filterEntities(entityFilter.value);
      });
    }
  }

  activateTab(tabElement, panelId) {
    // Update active tab
    document.querySelectorAll(".brain-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    tabElement.classList.add("active");

    // Show active panel
    document.querySelectorAll(".brain-panel").forEach((panel) => {
      panel.classList.remove("active");
    });
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }

    this.activeSection = panelId;
  }

  async loadBrainData() {
    try {
      // Show loading indicators
      document.querySelectorAll(".loading-state").forEach((loader) => {
        loader.style.display = "flex";
      });

      // Mock delay for loading effect
      await new Promise((resolve) => setTimeout(resolve, 500));

      const brain = await this.fetchBrainData();
      if (!brain) {
        this.showDefaultData();
        return;
      }

      this.brainData = {
        memories: brain.memories || [],
        entities: brain.entities || [],
        preferences: brain.preferences || [],
        rules: brain.rules || [],
        successRate: brain.stats?.successRate || 0,
        tasksCompleted: brain.stats?.tasksCompleted || 0,
      };

      // Update stats and UI
      this.updateMetrics();
      this.renderMemories();
      this.renderEntities();
      this.renderPreferences();
      this.renderRules();
    } catch (error) {
      console.error("Error loading brain data:", error);
      this.showDefaultData();
    } finally {
      // Hide loading indicators
      document.querySelectorAll(".loading-state").forEach((loader) => {
        loader.style.display = "none";
      });
    }
  }

  showDefaultData() {
    // Set default data for demo purposes
    this.brainData = {
      memories: [
        {
          id: "mem1",
          type: "observation",
          content:
            "Identified that the API endpoints in server.js are using Express 4.x style routing.",
          importance: 7,
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: "mem2",
          type: "decision",
          content:
            "Chose to implement the brain system with a file-based storage approach to simplify development.",
          importance: 8,
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          id: "mem3",
          type: "entity",
          content:
            "Learned about the .arlo/api/models directory structure and its organization pattern.",
          importance: 6,
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
      entities: [
        {
          id: "ent1",
          name: "BlueprintController",
          type: "class",
          properties: {
            path: "/src/server/abstract/blueprint.controller.ts",
            extends: "Loggable",
            methods: "initialize, loadComponents, registerRoutes",
            purpose: "Core controller for blueprint functionality",
          },
        },
        {
          id: "ent2",
          name: "EventBus",
          type: "class",
          properties: {
            path: "/src/browser/eventing/event.bus.ts",
            methods: "publish, subscribe, unsubscribe",
            purpose: "Central event messaging system",
          },
        },
      ],
      preferences: [
        {
          key: "codeStyle",
          value: "Typescript with strict typing",
          category: "Development",
        },
        {
          key: "testFramework",
          value: "Jest with isolated component tests",
          category: "Testing",
        },
        {
          key: "componentNaming",
          value: "PascalCase for classes, camelCase for functions",
          category: "Development",
        },
      ],
      rules: [
        {
          id: "rule1",
          name: "Component Structure",
          condition: "When creating a new component:",
          action:
            "Include a client.ts, view template, and styles file in the component directory",
          priority: 8,
        },
        {
          id: "rule2",
          name: "Error Handling",
          condition: "When implementing API endpoints:",
          action:
            "Always use try/catch blocks and return standardized error responses",
          priority: 9,
        },
      ],
      successRate: 87,
      tasksCompleted: 42,
    };

    // Update UI with default data
    this.updateMetrics();
    this.renderMemories();
    this.renderEntities();
    this.renderPreferences();
    this.renderRules();
  }

  async fetchBrainData() {
    try {
      // This would be a real API call in production
      // For now, we'll return null to trigger the default data
      return null;

      // Real implementation would look like:
      // const response = await makeRequest(`/api/agent/${this.agentId}/brain`, 'GET');
      // return response.data;
    } catch (error) {
      console.error("API error fetching brain data:", error);
      return null;
    }
  }

  updateMetrics() {
    // Update metric counts
    document.getElementById("entity-count").textContent =
      this.brainData.entities.length.toString();
    document.getElementById("memory-count").textContent =
      this.brainData.memories.length.toString();
    document.getElementById("rule-count").textContent =
      this.brainData.rules.length.toString();
    document.getElementById("task-count").textContent =
      this.brainData.tasksCompleted.toString();

    // Update success rate
    const successRate = this.brainData.successRate;
    document.getElementById(
      "success-rate-progress"
    ).style.width = `${successRate}%`;
    document.getElementById(
      "success-rate-value"
    ).textContent = `${successRate}%`;

    // Adjust success rate color based on value
    const successElement = document.getElementById("success-rate-progress");
    if (successElement) {
      if (successRate >= 80) {
        successElement.style.backgroundColor = "#4caf50"; // Green
      } else if (successRate >= 60) {
        successElement.style.backgroundColor = "#ff9800"; // Orange
      } else {
        successElement.style.backgroundColor = "#f44336"; // Red
      }
    }
  }

  renderMemories() {
    const container = document.getElementById("memories-container");
    if (!container) return;

    // Filter value
    const filterValue =
      document.getElementById("memory-type-filter")?.value || "all";
    const memories =
      filterValue === "all"
        ? this.brainData.memories
        : this.brainData.memories.filter((m) => m.type === filterValue);

    if (memories.length === 0) {
      container.innerHTML =
        '<div class="empty-message">No memories found. This agent hasn\'t recorded any memories yet.</div>';
      return;
    }

    // Sort by timestamp (newest first)
    const sortedMemories = [...memories].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    const html = sortedMemories
      .map(
        (memory) => `
            <div class="memory-card">
                <div class="memory-header">
                    <div class="memory-title">
                        <span class="memory-type ${memory.type}">${
          memory.type
        }</span>
                    </div>
                    <div class="memory-meta">
                        <div class="memory-importance">Importance: ${
                          memory.importance
                        }/10</div>
                        <div class="memory-timestamp">${this.formatDate(
                          memory.timestamp
                        )}</div>
                    </div>
                </div>
                <div class="memory-content">
                    <div class="memory-content-text">${memory.content}</div>
                </div>
            </div>
        `
      )
      .join("");

    container.innerHTML = html;
  }

  renderEntities() {
    const container = document.getElementById("entities-container");
    if (!container) return;

    // Filter value
    const filterValue =
      document.getElementById("entity-type-filter")?.value || "all";
    const entities =
      filterValue === "all"
        ? this.brainData.entities
        : this.brainData.entities.filter((e) => e.type === filterValue);

    if (entities.length === 0) {
      container.innerHTML =
        '<div class="empty-message">No entities found. This agent hasn\'t registered any knowledge entities yet.</div>';
      return;
    }

    // Sort by name
    const sortedEntities = [...entities].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const html = sortedEntities
      .map(
        (entity) => `
            <div class="entity-card">
                <div class="entity-header">
                    <div class="entity-name">${entity.name}</div>
                    <div class="entity-type">${entity.type}</div>
                </div>
                <div class="entity-content">
                    <div class="entity-properties">
                        ${Object.entries(entity.properties || {})
                          .map(
                            ([key, value]) => `
                            <div class="entity-property-label">${key}:</div>
                            <div class="entity-property-value">${value}</div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    container.innerHTML = html;
  }

  renderPreferences() {
    const container = document.getElementById("preferences-container");
    if (!container) return;

    if (this.brainData.preferences.length === 0) {
      container.innerHTML =
        '<div class="empty-message">No preferences found. This agent hasn\'t set any preferences yet.</div>';
      return;
    }

    // Group preferences by category
    const preferencesByCategory = this.brainData.preferences.reduce(
      (acc, pref) => {
        const category = pref.category || "General";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(pref);
        return acc;
      },
      {}
    );

    const html = Object.entries(preferencesByCategory)
      .map(
        ([category, prefs]) => `
            <div class="preference-category">
                <div class="preference-category-title">${category}</div>
                <div class="preference-items">
                    ${prefs
                      .map(
                        (pref) => `
                        <div class="preference-key">${pref.key}:</div>
                        <div class="preference-value">${pref.value}</div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `
      )
      .join("");

    container.innerHTML = html;
  }

  renderRules() {
    const container = document.getElementById("rules-container");
    if (!container) return;

    if (this.brainData.rules.length === 0) {
      container.innerHTML =
        '<div class="empty-message">No rules found. This agent hasn\'t defined any decision rules yet.</div>';
      return;
    }

    // Sort by priority (highest first)
    const sortedRules = [...this.brainData.rules].sort(
      (a, b) => b.priority - a.priority
    );

    const html = sortedRules
      .map(
        (rule, index) => `
            <div class="rule-card">
                <div class="rule-header">
                    <div class="rule-id">Rule #${index + 1}: ${rule.name}</div>
                    <div class="rule-priority">Priority: ${
                      rule.priority
                    }/10</div>
                </div>
                <div class="rule-content">
                    <div class="rule-section">
                        <div class="rule-section-title">Condition</div>
                        <div class="rule-code">${rule.condition}</div>
                    </div>
                    <div class="rule-section">
                        <div class="rule-section-title">Action</div>
                        <div class="rule-code">${rule.action}</div>
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    container.innerHTML = html;
  }

  filterMemories(type) {
    // Re-render memories with filter
    this.renderMemories();
  }

  filterEntities(type) {
    // Re-render entities with filter
    this.renderEntities();
  }

  formatDate(dateString) {
    if (!dateString) return "Unknown";

    // If formatDate utility is available, use it
    if (typeof formatDate === "function") {
      return formatDate(dateString);
    }

    // Otherwise, simple format
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = diffMs / (1000 * 60 * 60);

    if (diffHrs < 24) {
      return `${Math.round(diffHrs)} hours ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }
}

// Initialize the module
const agentBrainView = new AgentBrainView();

// Export the module for access from other components
export { AgentBrainView, agentBrainView };
