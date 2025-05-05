// Import required modules
import agentConfig from "./agentConfig.js";
import "./agentBrain.js";

// Initialize the agents view with unique colors instead of avatars
async function initAgentsView() {
  console.log("initAgentsView called");

  // Instead of forcing sidebar width with inline styles, respect the sidebar's CSS classes
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    console.log("Ensuring sidebar state is preserved in initAgentsView");
    // Remove any inline styles that might be causing problems
    sidebar.removeAttribute("style");

    // Make sure we respect the collapsed state
    const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    if (isCollapsed) {
      sidebar.classList.add("collapsed");
    } else {
      sidebar.classList.remove("collapsed");
    }
  }

  // Make sure main-content layout is preserved but don't override any CSS
  const mainContent = document.querySelector(".main-content");
  if (mainContent) {
    console.log("Setting main-content display to flex");
    mainContent.style.display = "flex";
  }

  // Make sure the layout isn't disrupted
  const agentsView = document.getElementById("agents-view");
  if (agentsView) {
    // Don't set any width/height properties
    console.log("Ensuring agents-view doesn't have layout-breaking styles");
    if (agentsView.style.width === "100%") {
      agentsView.style.width = "";
    }
    if (agentsView.style.height === "100%") {
      agentsView.style.height = "";
    }

    // Fix the scrolling issue by setting proper height constraints
    agentsView.style.maxHeight = "100vh";
    agentsView.style.overflowY = "auto";
  }

  // Apply better styling to the agents container
  const agentsContainer = document.querySelector(".agents-container");
  if (agentsContainer) {
    agentsContainer.style.display = "flex";
    agentsContainer.style.height = "calc(100vh - 120px)"; // Adjust height to prevent excessive scrolling
    agentsContainer.style.overflow = "hidden"; // Prevent double scrollbars
  }

  // Make the agents list scrollable independently
  const agentsList = document.querySelector("#agents-view .agents-list");
  if (agentsList) {
    agentsList.style.overflowY = "auto";
    agentsList.style.maxHeight = "100%";
    agentsList.style.paddingBottom = "20px";
  }

  // Make the agent details section scrollable independently
  const agentDetails = document.querySelector(".agent-details");
  if (agentDetails) {
    agentDetails.style.overflowY = "auto";
    agentDetails.style.maxHeight = "100%";
    agentDetails.style.paddingBottom = "20px";
  }

  // Define a smooth rainbow color spectrum for agents (sorted from red to violet)
  const agentColors = {
    Admin: "#F44336", // Red
    Types: "#E91E63", // Pink
    Utils: "#9C27B0", // Purple
    Validator: "#673AB7", // Deep Purple
    Developer: "#3F51B5", // Indigo
    Browser: "#2196F3", // Blue
    Version: "#03A9F4", // Light Blue
    Server: "#00BCD4", // Cyan
    Testbed: "#009688", // Teal
    Pipeline: "#4CAF50", // Green
    Generator: "#8BC34A", // Light Green
    Config: "#CDDC39", // Lime
    Docs: "#FFEB3B", // Yellow
    Git: "#FFC107", // Amber
    Analyzer: "#FF9800", // Orange
    Bundler: "#FF5722", // Deep Orange
    ARLO: "#607D8B", // Blue Grey
  };

  // Fetch agents from the API
  let fetchedAgents = [];
  try {
    const response = await fetch("/api/agent");
    if (response.ok) {
      fetchedAgents = await response.json();
      console.log("Fetched agents:", fetchedAgents);
    } else {
      console.error("Failed to fetch agents:", response.statusText);
      // Use default agents if fetch fails
    }
  } catch (error) {
    console.error("Error fetching agents:", error);
    // Use default agents if fetch fails
  }

  // If API fetch failed, use default agents
  if (fetchedAgents.length === 0) {
    console.log("Using default agent data");
    // Use default agent categories
  }

  // Organize fetched agents into categories
  let agentCategories = [];

  if (fetchedAgents.length > 0) {
    // Map specializations to categories
    const specializationToCategory = {
      coordination: "Orchestration",
      codebase: "Framework Core",
      development: "Development Tools",
      testing: "Quality & Performance",
      performance: "Quality & Performance",
      infrastructure: "Integration & Delivery",
      documentation: "Knowledge & Documentation",
    };

    // Create categories and group agents
    const categoryMap = {};

    fetchedAgents.forEach((agent) => {
      const category =
        specializationToCategory[agent.specialization] || "Other";

      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          agents: [],
        };
      }

      categoryMap[category].agents.push({
        id: agent.id,
        name: agent.name,
        description: agent.role,
        status: "active",
      });
    });

    // Convert the map to an array and sort categories
    agentCategories = Object.values(categoryMap).sort((a, b) => {
      // Custom category order
      const order = [
        "Orchestration",
        "Framework Core",
        "Development Tools",
        "Quality & Performance",
        "Integration & Delivery",
        "Knowledge & Documentation",
        "Other",
      ];

      return order.indexOf(a.name) - order.indexOf(b.name);
    });
  } else {
    // Use default categories
    agentCategories = [
      {
        name: "Orchestration",
        agents: [
          {
            id: "admin",
            name: "Admin",
            description: "Workflow coordinator",
            status: "active",
          },
        ],
      },
      {
        name: "Framework Core",
        agents: [
          {
            id: "browser",
            name: "Browser",
            description: "Frontend expert",
            status: "active",
          },
          {
            id: "server",
            name: "Server",
            description: "Backend expert",
            status: "active",
          },
          {
            id: "types",
            name: "Types",
            description: "Type system expert",
            status: "active",
          },
          {
            id: "utils",
            name: "Utils",
            description: "Utility function expert",
            status: "active",
          },
        ],
      },
      {
        name: "Development Tools",
        agents: [
          {
            id: "developer",
            name: "Developer",
            description: "Development tooling expert",
            status: "active",
          },
          {
            id: "generator",
            name: "Generator",
            description: "Scaffolding specialist",
            status: "active",
          },
          {
            id: "bundler",
            name: "Bundler",
            description: "Build system specialist",
            status: "active",
          },
          {
            id: "config",
            name: "Config",
            description: "Configuration expert",
            status: "active",
          },
        ],
      },
      {
        name: "Quality & Performance",
        agents: [
          {
            id: "validator",
            name: "Validator",
            description: "Quality assurance",
            status: "active",
          },
          {
            id: "analyzer",
            name: "Analyzer",
            description: "Performance specialist",
            status: "active",
          },
          {
            id: "testbed",
            name: "Testbed",
            description: "Testbed project specialist",
            status: "active",
          },
        ],
      },
      {
        name: "Integration & Delivery",
        agents: [
          {
            id: "git",
            name: "Git",
            description: "Repository operations",
            status: "active",
          },
          {
            id: "pipeline",
            name: "Pipeline",
            description: "CI/CD configuration",
            status: "active",
          },
          {
            id: "version",
            name: "Version",
            description: "Package versioning",
            status: "active",
          },
        ],
      },
      {
        name: "Knowledge & Documentation",
        agents: [
          {
            id: "docs",
            name: "Docs",
            description: "Documentation specialist",
            status: "active",
          },
          {
            id: "arlo",
            name: "ARLO",
            description: "Self-maintenance specialist",
            status: "active",
          },
        ],
      },
    ];
  }

  // Get the agents list container
  if (!agentsList) return;

  // Populate agents list with categorized, colored icons
  let htmlContent = "";

  agentCategories.forEach((category) => {
    htmlContent += `
            <div class="agent-category">
                <div class="agent-category-header">${category.name}</div>
                <div class="agent-category-items">
        `;

    category.agents.forEach((agent) => {
      const agentColor = agentColors[agent.name] || "#4CAF50";
      htmlContent += `
                <div class="agent-list-item" data-agent="${
                  agent.name
                }" data-agent-id="${agent.id}" data-color="${agentColor}">
                    <div class="agent-list-icon" style="background-color: ${agentColor};">
                        ${agent.name.charAt(0)}
                    </div>
                    <div class="agent-list-name">${agent.name}</div>
                </div>
            `;
    });

    htmlContent += `
                </div>
            </div>
        `;
  });

  agentsList.innerHTML = htmlContent;

  // Create a flat list of all agents for lookup
  const allAgents = agentCategories.flatMap((category) => category.agents);

  // Add click event to show agent details
  const agentItems = document.querySelectorAll(".agent-list-item");
  agentItems.forEach((item) => {
    item.addEventListener("click", async function () {
      // Get the agent data
      const agentName = this.getAttribute("data-agent");
      const agentId = this.getAttribute("data-agent-id");
      const agentColor = this.getAttribute("data-color") || "#4CAF50";

      // Find agent in data
      const agent = allAgents.find((a) => a.name === agentName);
      if (!agent) return;

      // Update active status
      agentItems.forEach((el) => {
        el.classList.remove("active");
        el.style.borderLeft = "3px solid transparent";
      });
      this.classList.add("active");
      this.style.borderLeft = `3px solid ${agentColor}`;

      // Get DOM elements
      if (!agentDetails || !agentsView) return;

      // Ensure the agents list remains visible
      if (agentsList) {
        agentsList.style.display = "block";
      }

      // Update agent details with mode-aware styling
      const isLightMode =
        document.documentElement.classList.contains("light-theme");
      agentDetails.setAttribute("data-agent", agentName);
      agentDetails.setAttribute("data-agent-id", agentId);

      // Use appropriate background color based on theme
      agentDetails.style.backgroundColor = isLightMode
        ? "rgba(255, 255, 255, 0.9)"
        : "rgba(22, 27, 34, 0.8)";

      agentDetails.style.borderLeft = `4px solid ${agentColor}`;

      // Adjust shadow for light/dark mode
      agentDetails.style.boxShadow = isLightMode
        ? `0 6px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px ${agentColor}20`
        : `0 6px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px ${agentColor}30`;

      // Update background with a mode-aware effect, but don't change layout
      const baseColor = isLightMode ? "#ffffff" : "var(--color-bg)";
      const opacity = isLightMode ? "15" : "25";

      agentsView.style.background = `
                radial-gradient(circle at top right, ${agentColor}${
        isLightMode ? "15" : "35"
      }, transparent 60%), 
                radial-gradient(circle at bottom left, ${agentColor}${
        isLightMode ? "15" : "35"
      }, transparent 60%),
                linear-gradient(135deg, ${baseColor}, ${agentColor}${opacity})
            `;

      // Preserve sidebar state when applying styles to agent view
      if (sidebar) {
        // Don't override sidebar CSS - respect the collapsed state
        sidebar.removeAttribute("style");

        // Make sure we respect the sidebar collapsed state
        const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
        if (isCollapsed) {
          sidebar.classList.add("collapsed");
        } else {
          sidebar.classList.remove("collapsed");
        }
      }

      // Update header content
      const agentHeader = agentDetails.querySelector(".agent-header");
      if (agentHeader) {
        agentHeader.innerHTML = `
                    <div class="agent-title-area">
                        <div class="agent-avatar" style="background-color: ${agentColor};">
                            ${agentName.charAt(0)}
                        </div>
                        <div>
                            <h3>${agentName} Agent</h3>
                            <div>${agent.description}</div>
                        </div>
                    </div>
                    <div class="agent-status-badge">
                        <div class="status-indicator ${agent.status}"></div>
                        ${agent.status === "active" ? "Online" : "Offline"}
                    </div>
                `;
      }

      // Load agent configuration
      try {
        // Initialize agent config with the current agent ID
        if (window.agentConfig) {
          window.agentConfig.init(agentId);
        }
      } catch (error) {
        console.error("Error initializing agent configuration:", error);
      }
    });
  });

  // Set up event handlers for agent configuration
  setupAgentConfigHandlers();

  // Activate first agent by default
  if (agentItems.length > 0) {
    agentItems[0].click();
  }
}

/**
 * Set up event handlers for agent configuration
 */
function setupAgentConfigHandlers() {
  // Tab navigation
  const tabs = document.querySelectorAll(".agent-tab");
  const tabContents = document.querySelectorAll(".agent-tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Get the target tab ID
      const targetId = tab.getAttribute("data-tab");
      
      // Create the full tab content ID (matching the HTML structure)
      const targetContentId = `${targetId}-tab`;

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Show the target content
      tabContents.forEach((content) => {
        content.classList.remove("active");
        content.style.display = "none";
      });

      const targetContent = document.getElementById(targetContentId);
      if (targetContent) {
        targetContent.classList.add("active");
        targetContent.style.display = "block";
      }

      // Dispatch tab change event for other modules (like agentBrain.js)
      const agentId = document
        .querySelector(".agent-details")
        .getAttribute("data-agent-id");
      const tabChangeEvent = new CustomEvent("agent:tabChanged", {
        detail: {
          tab: targetId,
          agentId: agentId,
        },
        bubbles: true,
      });
      document.dispatchEvent(tabChangeEvent);
    });
  });

  // Custom attributes toggle
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

  // Tag input handling
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("kb-tag-remove")) {
      const tag = event.target.parentElement;
      if (tag) {
        tag.remove();
        // Trigger change event for config tracking
        const changeEvent = new Event("change", { bubbles: true });
        document
          .querySelector(".input-tags-container")
          ?.dispatchEvent(changeEvent);
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
          const tag = document.createElement("span");
          tag.className = "kb-input-tag";
          tag.innerHTML = `${tagText}<button class="kb-tag-remove">×</button>`;

          tagInput.parentElement.insertBefore(tag, tagInput);
          tagInput.value = "";

          // Trigger change event for config tracking
          const changeEvent = new Event("change", { bubbles: true });
          tagInput.dispatchEvent(changeEvent);
        }
      }
    });
  }

  // Temperature range input
  const temperatureInput = document.getElementById("agent-temperature");
  if (temperatureInput) {
    temperatureInput.addEventListener("input", (e) => {
      const valueDisplay =
        temperatureInput.parentElement.querySelector(".range-value");
      if (valueDisplay) {
        valueDisplay.textContent = parseFloat(e.target.value).toFixed(2);
      }
    });
  }

  // Add custom attribute button
  const addAttributeBtn = document.getElementById("add-attribute-btn");
  if (addAttributeBtn) {
    addAttributeBtn.addEventListener("click", () => {
      const keyInput = document.getElementById("attribute-key");
      const valueInput = document.getElementById("attribute-value");

      if (!keyInput || !valueInput) return;

      const key = keyInput.value.trim();
      const value = valueInput.value.trim();

      if (!key || !value) {
        console.log("Both key and value are required");
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
        const attributeItem = document.createElement("div");
        attributeItem.className = "attribute-item";
        attributeItem.innerHTML = `
                    <div class="attribute-content">
                        <div class="attribute-key">${key}</div>
                        <div class="attribute-value">${value}</div>
                    </div>
                    <div class="attribute-actions">
                        <button class="delete-attribute-btn">×</button>
                    </div>
                `;

        // Add delete handler
        const deleteBtn = attributeItem.querySelector(".delete-attribute-btn");
        if (deleteBtn) {
          deleteBtn.addEventListener("click", () => {
            attributeItem.remove();

            // If no attributes left, show empty state
            if (container.children.length === 0) {
              container.innerHTML =
                '<div class="no-attributes">No custom attributes defined</div>';
            }
          });
        }

        container.appendChild(attributeItem);

        // Clear inputs
        keyInput.value = "";
        valueInput.value = "";
      }
    });
  }
}

export { initAgentsView };
