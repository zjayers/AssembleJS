import VectorDB from "../modules/vectordb.js";
import { initKnowledgeNetwork as initNetworkVisualization } from "../modules/knowledgeNetwork.js";

// Initialize the Knowledge Base view
function initKnowledgeBaseView() {
  // Initialize with loading state
  const knowledgeBaseView = document.getElementById("knowledge-base-view");
  if (!knowledgeBaseView) return;

  const contentContainer =
    knowledgeBaseView.querySelector(".kb-content") ||
    knowledgeBaseView.querySelector(".content-body");

  if (!contentContainer) return;

  // We won't recreate the HTML - use the EJS templates instead

  // Add event listener for tab switching
  const tabButtons = knowledgeBaseView.querySelectorAll(".kb-tab");
  tabButtons.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and content
      knowledgeBaseView
        .querySelectorAll(".kb-tab")
        .forEach((t) => t.classList.remove("active"));
      knowledgeBaseView
        .querySelectorAll(".kb-tab-content")
        .forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      // Show corresponding content
      const viewName = tab.getAttribute("data-view");
      if (viewName) {
        const contentView = knowledgeBaseView.querySelector(
          `#kb-${viewName}-tab-view`
        );
        if (contentView) {
          contentView.classList.add("active");

          // Initialize specific content if needed
          if (viewName === "collections") {
            loadCollections();
          } else if (viewName === "network") {
            // Use our enhanced network visualization instead of the basic one
            initNetworkVisualization();
          }
        }
      }
    });
  });

  // Add event listener for search button
  const searchButton = knowledgeBaseView.querySelector("#kb-search-button");
  const searchInput = knowledgeBaseView.querySelector("#kb-search-input");
  if (searchButton && searchInput) {
    searchButton.addEventListener("click", () => {
      performKnowledgeSearch();
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performKnowledgeSearch();
      }
    });
  }

  // Add event listener for filter changes
  const filterInputs = knowledgeBaseView.querySelectorAll(
    ".kb-search-filter select"
  );
  filterInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (searchInput.value.trim()) {
        performKnowledgeSearch();
      }
    });
  });

  // Initialize network controls
  const networkControls = knowledgeBaseView.querySelectorAll(
    ".kb-network-controls select"
  );
  networkControls.forEach((control) => {
    control.addEventListener("change", () => {
      updateKnowledgeNetwork();
    });
  });

  // Update agent filter with available agent collections
  updateAgentFilter();

  // Set up file drag and drop for the knowledge base view
  setupFileDragAndDrop(knowledgeBaseView);
}

// Initialize the Knowledge Network visualization
function initKnowledgeNetwork() {
  // In a real application, this would use D3.js or a similar library
  // For this demo, we'll create a static visualization with some interactivity

  // Get SVG container and create connections
  const svg = document.querySelector(".kb-connections");
  if (!svg) return;

  // Clear existing connections
  while (svg.lastChild) {
    if (svg.lastChild.tagName === "defs") break;
    svg.removeChild(svg.lastChild);
  }

  // Get all nodes
  const centralNode = document.querySelector(".kb-central-node");
  const agentNodes = document.querySelectorAll(".kb-agent-node");
  const knowledgeNodes = document.querySelectorAll(".kb-knowledge-node");

  // Connect central node to all agent nodes
  agentNodes.forEach((node) => {
    createConnection(svg, centralNode, node, "primary");
  });

  // Connect knowledge nodes to relevant agent nodes (simplified for demo)
  // In a real application, these connections would be data-driven
  createConnection(svg, agentNodes[0], knowledgeNodes[0], "secondary"); // Admin to Components
  createConnection(svg, agentNodes[1], knowledgeNodes[1], "secondary"); // Browser to Events
  createConnection(svg, agentNodes[2], knowledgeNodes[2], "secondary"); // Server to Renderers
  createConnection(svg, agentNodes[3], knowledgeNodes[3], "secondary"); // Utils to Types

  // Add cross-connections between knowledge nodes
  createConnection(svg, knowledgeNodes[0], knowledgeNodes[1], "tertiary");
  createConnection(svg, knowledgeNodes[1], knowledgeNodes[2], "tertiary");
  createConnection(svg, knowledgeNodes[2], knowledgeNodes[3], "tertiary");
  createConnection(svg, knowledgeNodes[3], knowledgeNodes[0], "tertiary");

  // Add click event to all nodes to show details
  const allNodes = document.querySelectorAll(
    ".kb-central-node, .kb-agent-node, .kb-knowledge-node"
  );
  allNodes.forEach((node) => {
    node.addEventListener("click", () => {
      showNetworkNodeDetails(node);
    });
  });
}

// Helper function to create connections between nodes
function createConnection(svg, sourceNode, targetNode, type) {
  if (!sourceNode || !targetNode) return;

  // Get source and target positions
  const sourceRect = sourceNode.getBoundingClientRect();
  const targetRect = targetNode.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();

  // Calculate centers relative to SVG
  const sourceX = sourceRect.left + sourceRect.width / 2 - svgRect.left;
  const sourceY = sourceRect.top + sourceRect.height / 2 - svgRect.top;
  const targetX = targetRect.left + targetRect.width / 2 - svgRect.left;
  const targetY = targetRect.top + targetRect.height / 2 - svgRect.top;

  // Create line
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", sourceX);
  line.setAttribute("y1", sourceY);
  line.setAttribute("x2", targetX);
  line.setAttribute("y2", targetY);
  line.setAttribute(
    "stroke",
    type === "primary"
      ? "rgba(255,255,255,0.6)"
      : type === "secondary"
      ? "rgba(255,255,255,0.4)"
      : "rgba(255,255,255,0.2)"
  );
  line.setAttribute("stroke-width", type === "primary" ? "2" : "1");
  line.setAttribute("marker-end", "url(#arrowhead)");

  // Add line to SVG
  svg.appendChild(line);
}

// Update the knowledge network based on filters
function updateKnowledgeNetwork() {
  // Get selected filters
  const filterType = document.getElementById("network-filter").value;
  const layoutType = document.getElementById("network-layout").value;
  const focusNode = document.getElementById("network-focus").value;

  // In a real application, this would regenerate the network visualization
  // based on the selected filters. For this demo, we'll just change some styles.

  // Update connections based on filter
  const connections = document.querySelectorAll(".kb-connections line");
  connections.forEach((line) => {
    if (filterType === "direct") {
      // Show only primary connections
      line.style.opacity =
        line.getAttribute("stroke-width") === "2" ? "1" : "0.1";
    } else if (filterType === "strong") {
      // Show primary and secondary connections
      line.style.opacity =
        line.getAttribute("stroke") !== "rgba(255,255,255,0.2)" ? "1" : "0.1";
    } else if (filterType === "weak") {
      // Show only tertiary connections
      line.style.opacity =
        line.getAttribute("stroke") === "rgba(255,255,255,0.2)" ? "1" : "0.1";
    } else {
      // Show all connections
      line.style.opacity = "1";
    }
  });

  // Update layout (in a real app, this would reposition nodes)
  const container = document.querySelector(".kb-node-container");
  if (container) {
    container.className = "kb-node-container kb-layout-" + layoutType;
  }

  // Update focus node
  const allNodes = document.querySelectorAll(
    ".kb-central-node, .kb-agent-node, .kb-knowledge-node"
  );
  allNodes.forEach((node) => {
    node.classList.remove("kb-focus-node");
    if (focusNode && node.textContent.trim() === focusNode) {
      node.classList.add("kb-focus-node");

      // Show details for focused node
      showNetworkNodeDetails(node);
    }
  });
}

// Show details for a selected network node
function showNetworkNodeDetails(node) {
  const nodeType = node.classList.contains("kb-agent-node")
    ? "agent"
    : node.classList.contains("kb-knowledge-node")
    ? "knowledge"
    : "central";
  const nodeName = node.textContent.trim();

  // Get details container
  const detailsContainer = document.getElementById("kb-network-details");
  if (!detailsContainer) return;

  // Clear previous content
  detailsContainer.innerHTML = "";

  // Add header based on node type
  const header = document.createElement("div");
  header.className = "kb-details-header";

  if (nodeType === "agent") {
    // Get the background color from the node
    const nodeColor = window.getComputedStyle(node).backgroundColor;

    header.innerHTML = `
            <div class="kb-details-title" style="border-left: 4px solid ${nodeColor}">
                <h3>${nodeName} Agent</h3>
                <div class="kb-details-subtitle">Agent Knowledge</div>
            </div>
            <div class="kb-details-actions">
                <button class="secondary-button">View Agent</button>
            </div>
        `;
  } else if (nodeType === "knowledge") {
    header.innerHTML = `
            <div class="kb-details-title">
                <h3>${nodeName}</h3>
                <div class="kb-details-subtitle">Knowledge Domain</div>
            </div>
            <div class="kb-details-actions">
                <button class="secondary-button">Search Related</button>
            </div>
        `;
  } else {
    header.innerHTML = `
            <div class="kb-details-title">
                <h3>Knowledge Hub</h3>
                <div class="kb-details-subtitle">Central Knowledge Repository</div>
            </div>
            <div class="kb-details-actions">
                <button class="secondary-button">View All</button>
            </div>
        `;
  }

  detailsContainer.appendChild(header);

  // Add content based on node type
  const content = document.createElement("div");
  content.className = "kb-details-content";

  if (nodeType === "agent") {
    content.innerHTML = `
            <div class="kb-details-section">
                <h4>Related Knowledge</h4>
                <ul class="kb-details-list">
                    <li>
                        <div class="kb-details-item">
                            <div class="kb-details-item-title">Design Patterns</div>
                            <div class="kb-details-item-meta">Last updated: 2h ago</div>
                        </div>
                    </li>
                    <li>
                        <div class="kb-details-item">
                            <div class="kb-details-item-title">Component Integration</div>
                            <div class="kb-details-item-meta">Last updated: 1d ago</div>
                        </div>
                    </li>
                    <li>
                        <div class="kb-details-item">
                            <div class="kb-details-item-title">API Documentation</div>
                            <div class="kb-details-item-meta">Last updated: 3d ago</div>
                        </div>
                    </li>
                </ul>
            </div>
            
            <div class="kb-details-section">
                <h4>Recent Tasks</h4>
                <ul class="kb-details-list">
                    <li>
                        <div class="kb-details-item">
                            <div class="kb-details-item-title">Update responsive styling</div>
                            <div class="kb-details-item-meta">Completed: 4h ago</div>
                        </div>
                    </li>
                    <li>
                        <div class="kb-details-item">
                            <div class="kb-details-item-title">Fix navigation bug</div>
                            <div class="kb-details-item-meta">Completed: 2d ago</div>
                        </div>
                    </li>
                </ul>
            </div>
        `;
  } else if (nodeType === "knowledge") {
    content.innerHTML = `
            <div class="kb-details-section">
                <h4>Domain Overview</h4>
                <p>The ${nodeName} domain contains core knowledge about AssemblyJS ${nodeName.toLowerCase()} system, including architecture, implementation details, and usage patterns.</p>
            </div>
            
            <div class="kb-details-section">
                <h4>Related Agents</h4>
                <ul class="kb-details-list">
                    <li>
                        <div class="kb-details-item">
                            <div class="kb-details-item-title">Admin</div>
                            <div class="kb-details-item-meta">Primary contributor</div>
                        </div>
                    </li>
                    <li>
                        <div class="kb-details-item">
                            <div class="kb-details-item-title">Browser</div>
                            <div class="kb-details-item-meta">Secondary contributor</div>
                        </div>
                    </li>
                </ul>
            </div>
            
            <div class="kb-details-section">
                <h4>Knowledge Items</h4>
                <ul class="kb-details-list">
                    <li>
                        <div class="kb-details-item">
                            <div class="kb-details-item-title">Architecture Overview</div>
                            <div class="kb-details-item-meta">Created: 2d ago</div>
                        </div>
                    </li>
                    <li>
                        <div class="kb-details-item">
                            <div class="kb-details-item-title">Integration Patterns</div>
                            <div class="kb-details-item-meta">Created: 5d ago</div>
                        </div>
                    </li>
                </ul>
            </div>
        `;
  } else {
    content.innerHTML = `
            <div class="kb-details-section">
                <h4>Knowledge Hub Stats</h4>
                <div class="kb-stats-grid">
                    <div class="kb-stat-item">
                        <div class="kb-stat-value">16</div>
                        <div class="kb-stat-label">Agents</div>
                    </div>
                    <div class="kb-stat-item">
                        <div class="kb-stat-value">243</div>
                        <div class="kb-stat-label">Knowledge Items</div>
                    </div>
                    <div class="kb-stat-item">
                        <div class="kb-stat-value">57</div>
                        <div class="kb-stat-label">Connections</div>
                    </div>
                    <div class="kb-stat-item">
                        <div class="kb-stat-value">12</div>
                        <div class="kb-stat-label">Domains</div>
                    </div>
                </div>
            </div>
            
            <div class="kb-details-section">
                <h4>Most Active Domains</h4>
                <ul class="kb-details-list">
                    <li>
                        <div class="kb-details-item">
                            <div class="kb-details-item-title">Components</div>
                            <div class="kb-details-item-meta">42 items, last updated 2h ago</div>
                        </div>
                    </li>
                    <li>
                        <div class="kb-details-item">
                            <div class="kb-details-item-title">Events</div>
                            <div class="kb-details-item-meta">38 items, last updated 6h ago</div>
                        </div>
                    </li>
                    <li>
                        <div class="kb-details-item">
                            <div class="kb-details-item-title">Renderers</div>
                            <div class="kb-details-item-meta">35 items, last updated 1d ago</div>
                        </div>
                    </li>
                </ul>
            </div>
        `;
  }

  detailsContainer.appendChild(content);
}

// Perform a search in the knowledge base
async function performKnowledgeSearch() {
  const searchInput = document.getElementById("kb-search-input");
  const agentFilter = document.getElementById("kb-search-agent");
  const typeFilter = document.getElementById("kb-search-type");
  const limitFilter = document.getElementById("kb-search-limit");

  if (!searchInput) return;

  const query = searchInput.value.trim();
  if (!query) return;

  const agentName = agentFilter ? agentFilter.value : "";
  const docType = typeFilter ? typeFilter.value : "";
  const limit = limitFilter ? parseInt(limitFilter.value) : 10;

  // Update UI to show loading state
  const resultsContainer = document.getElementById("kb-search-results");
  if (resultsContainer) {
    resultsContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Searching...</p>
            </div>
        `;
  }

  try {
    // Perform the search
    let results = [];

    if (agentName) {
      // Search in a specific agent's knowledge
      results = await VectorDB.queryAgentKnowledge(agentName, query, limit);
    } else {
      // Search across all collections (simplified for demo)
      // In a real app, we would use a dedicated endpoint for global search
      const agents = [
        "Admin",
        "Browser",
        "Types",
        "Utils",
        "Validator",
        "Developer",
        "Server",
        "Testbed",
        "Pipeline",
        "Generator",
        "Config",
        "Docs",
        "Git",
        "Analyzer",
        "Bundler",
        "Version",
        "ARLO",
      ];

      // Query each agent's knowledge and combine results
      const allResultsPromises = agents.map((agent) =>
        VectorDB.queryAgentKnowledge(
          agent,
          query,
          Math.ceil(limit / agents.length)
        )
          .then((results) => results.map((r) => ({ ...r, agent })))
          .catch(() => [])
      );

      const allResults = await Promise.all(allResultsPromises);
      results = allResults.flat();

      // Sort by relevance and limit to requested count
      results.sort((a, b) => b.score - a.score);
      results = results.slice(0, limit);
    }

    // Filter by document type if specified
    if (docType) {
      results = results.filter(
        (item) => item.metadata && item.metadata.type === docType
      );
    }

    // Update the search results
    updateSearchResults(results);
  } catch (error) {
    console.error("Error searching knowledge base:", error);

    if (resultsContainer) {
      resultsContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-state-icon">❌</div>
                    <div class="error-state-text">Error searching knowledge: ${error.message}</div>
                </div>
            `;
    }
  }
}

// Update the search results display
function updateSearchResults(results) {
  const resultsContainer = document.getElementById("kb-search-results");
  if (!resultsContainer) return;

  if (!results || results.length === 0) {
    resultsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">No results found. Try a different search query.</div>
            </div>
        `;
    return;
  }

  // Define agent colors
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

  // Render results
  resultsContainer.innerHTML = results
    .map((result) => {
      const { document, metadata, score, agent } = result;
      const resultAgent = agent || (metadata && metadata.agent) || "Unknown";
      const agentColor = agentColors[resultAgent] || "#808080";

      // Format date if available
      const date =
        metadata && metadata.timestamp
          ? new Date(metadata.timestamp).toLocaleString()
          : "Unknown date";

      // Determine result type and icon
      let typeText = "Knowledge";
      let typeIcon = "📄";

      if (metadata && metadata.type) {
        switch (metadata.type) {
          case "task":
            typeText = "Task";
            typeIcon = "📋";
            break;
          case "task_knowledge":
            typeText = "Analysis";
            typeIcon = "🔍";
            break;
          case "task_completion":
            typeText = "Completion";
            typeIcon = "✅";
            break;
          case "file_upload":
            typeText = "File";
            typeIcon = "📁";
            break;
        }
      }

      // Get a preview of the document text
      const previewText =
        document.length > 120 ? document.substring(0, 120) + "..." : document;

      return `
            <div class="kb-search-result" data-id="${
              metadata?.id || ""
            }" data-agent="${resultAgent}">
                <div class="kb-result-header">
                    <div class="kb-result-icon">${typeIcon}</div>
                    <div class="kb-result-title">
                        ${metadata?.title || typeText}
                        <div class="kb-result-agent" style="background-color: ${agentColor}20; color: ${agentColor}">
                            ${resultAgent}
                        </div>
                    </div>
                </div>
                <div class="kb-result-preview">${previewText}</div>
                <div class="kb-result-meta">
                    <div class="kb-result-date">${date}</div>
                    <div class="kb-result-score">Relevance: ${Math.round(
                      score * 100
                    )}%</div>
                </div>
            </div>
        `;
    })
    .join("");

  // Add click handlers to show result details
  document.querySelectorAll(".kb-search-result").forEach((item) => {
    item.addEventListener("click", () => {
      const resultId = item.getAttribute("data-id");
      const agentName = item.getAttribute("data-agent");
      // In a real application, fetch the full details of this item
      // For demo purposes, we'll just show a static view
      showSearchResultDetails(resultId, agentName);

      // Mark this result as selected
      document.querySelectorAll(".kb-search-result").forEach((r) => {
        r.classList.remove("selected");
      });
      item.classList.add("selected");
    });
  });

  // Select the first result by default
  const firstResult = document.querySelector(".kb-search-result");
  if (firstResult) {
    firstResult.click();
  }
}

// Show details of a selected search result
function showSearchResultDetails(resultId, agentName) {
  const detailsView = document.getElementById("kb-search-view");
  if (!detailsView) return;

  // In a real application, we would fetch the complete document details
  // For the demo, we'll show a static representation

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

  const agentColor = agentColors[agentName] || "#808080";

  detailsView.innerHTML = `
        <div class="kb-detail-card">
            <div class="kb-detail-card-header" style="border-left: 4px solid ${agentColor}">
                <div class="kb-detail-card-agent">
                    <div class="agent-avatar-small" style="background-color: ${agentColor};">
                        ${agentName.charAt(0)}
                    </div>
                    <span>${agentName} Agent</span>
                </div>
                <div class="kb-detail-card-actions">
                    <button class="secondary-button-small">View Related</button>
                    <button class="secondary-button-small">Export</button>
                </div>
            </div>
            <div class="kb-detail-card-content">
                <h3>Knowledge Item #${resultId || "Unknown"}</h3>
                <div class="kb-detail-date">Added on ${new Date().toLocaleDateString()}</div>
                
                <div class="kb-detail-document">
                    <p>This is a sample knowledge item from the ${agentName} agent related to the AssemblyJS framework architecture.</p>
                    
                    <p>The item contains information about core components, APIs, and best practices for the module system.</p>
                    
                    <h4>Key Points</h4>
                    <ul>
                        <li>Component architecture follows a reactive model</li>
                        <li>Events are propagated using the observer pattern</li>
                        <li>State management is handled via immutable stores</li>
                        <li>Rendering is optimized with incremental updates</li>
                    </ul>
                    
                    <h4>Code Example</h4>
                    <pre><code>// Example component definition
const MyComponent = defineComponent({
  props: {
    name: String,
    count: Number
  },
  setup(props) {
    const state = reactive({
      clickCount: props.count || 0
    });
    
    function increment() {
      state.clickCount++;
    }
    
    return {
      state,
      increment
    };
  }
});</code></pre>
                    
                    <p>This pattern ensures proper reactivity and component encapsulation.</p>
                </div>
                
                <div class="kb-detail-metadata">
                    <div class="kb-metadata-item">
                        <div class="kb-metadata-label">Type</div>
                        <div class="kb-metadata-value">Documentation</div>
                    </div>
                    <div class="kb-metadata-item">
                        <div class="kb-metadata-label">Format</div>
                        <div class="kb-metadata-value">Markdown</div>
                    </div>
                    <div class="kb-metadata-item">
                        <div class="kb-metadata-label">Tags</div>
                        <div class="kb-metadata-value">
                            <span class="kb-tag">architecture</span>
                            <span class="kb-tag">components</span>
                            <span class="kb-tag">reactivity</span>
                        </div>
                    </div>
                </div>
                
                <div class="kb-detail-relations">
                    <h4>Related Knowledge</h4>
                    <div class="kb-relations-list">
                        <div class="kb-relation-item">
                            <div class="kb-relation-title">Component Lifecycle Events</div>
                            <div class="kb-relation-meta">Server Agent • 85% similar</div>
                        </div>
                        <div class="kb-relation-item">
                            <div class="kb-relation-title">State Management Patterns</div>
                            <div class="kb-relation-meta">Utils Agent • 72% similar</div>
                        </div>
                        <div class="kb-relation-item">
                            <div class="kb-relation-title">Optimizing Render Performance</div>
                            <div class="kb-relation-meta">Browser Agent • 68% similar</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load collections from the vector database
async function loadCollections() {
  try {
    const collections = await VectorDB.listCollections();

    const knowledgeBaseView = document.getElementById("knowledge-base-view");
    if (!knowledgeBaseView) return;

    // Get the collections view container
    const collectionsView = knowledgeBaseView.querySelector(
      "#kb-collections-view"
    );
    if (!collectionsView) return;

    // Calculate stats
    const totalDocuments = collections.reduce(
      (sum, collection) => sum + (collection.count || 0),
      0
    );
    const agentCollections = collections.filter((c) =>
      c.name.startsWith("agent_")
    );
    const nonAgentCollections = collections.filter(
      (c) => !c.name.startsWith("agent_")
    );

    if (collections.length === 0) {
      collectionsView.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <div class="empty-state-text">No collections found. Create a new collection to get started.</div>
                    <button id="create-collection-btn" class="primary-button">
                        Create Collection
                    </button>
                </div>
            `;

      // Add event listener for create collection button
      const createBtn = collectionsView.querySelector("#create-collection-btn");
      if (createBtn) {
        createBtn.addEventListener("click", showCreateCollectionModal);
      }

      return;
    }

    // Render collections in a grid with statistics
    collectionsView.innerHTML = `
            <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-label">Total Collections</div>
                    <div class="stat-value">${collections.length}</div>
                    <div class="stat-description">Vector databases</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Documents</div>
                    <div class="stat-value">${totalDocuments}</div>
                    <div class="stat-description">Embedded texts</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Agent Collections</div>
                    <div class="stat-value">${agentCollections.length}</div>
                    <div class="stat-description">Auto-managed</div>
                </div>
            </div>
            
            <div class="actions-bar">
                <button id="create-collection-btn" class="primary-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"></path>
                    </svg>
                    New Collection
                </button>
            </div>
            
            <div class="collections-grid">
                ${collections
                  .map((collection) => {
                    const isAgentCollection =
                      collection.name.startsWith("agent_");
                    const agentName = isAgentCollection
                      ? collection.name.replace("agent_", "")
                      : null;
                    let agentColor = "#4CAF50";

                    // Get agent color if it's an agent collection
                    if (isAgentCollection) {
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
                      agentColor = agentColors[agentName] || agentColor;
                    }

                    return `
                        <div class="collection-card ${
                          isAgentCollection ? "agent-collection" : ""
                        }" 
                             data-collection="${collection.name}" 
                             ${
                               isAgentCollection
                                 ? `style="border-top: 3px solid ${agentColor};"`
                                 : ""
                             }>
                            <div class="collection-card-header">
                                <h3>
                                    ${collection.name}
                                    ${
                                      isAgentCollection
                                        ? `<span class="agent-badge" style="background-color: ${agentColor}20; color: ${agentColor}">
                                          ${agentName}
                                       </span>`
                                        : ""
                                    }
                                </h3>
                                <div class="collection-meta">
                                    ${collection.count || 0} documents
                                </div>
                            </div>
                            <div class="collection-card-actions">
                                <button class="view-collection-btn" data-collection="${
                                  collection.name
                                }">View</button>
                                <button class="delete-collection-btn" data-collection="${
                                  collection.name
                                }">Delete</button>
                            </div>
                        </div>
                    `;
                  })
                  .join("")}
            </div>
        `;

    // Add event listeners
    const createBtn = collectionsView.querySelector("#create-collection-btn");
    if (createBtn) {
      createBtn.addEventListener("click", showCreateCollectionModal);
    }

    // Add event listeners for view and delete buttons
    const viewButtons = collectionsView.querySelectorAll(
      ".view-collection-btn"
    );
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const collectionName = btn.getAttribute("data-collection");
        viewCollection(collectionName);
      });
    });

    const deleteButtons = collectionsView.querySelectorAll(
      ".delete-collection-btn"
    );
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const collectionName = btn.getAttribute("data-collection");
        deleteCollection(collectionName);
      });
    });
  } catch (error) {
    console.error("Error loading collections:", error);

    const collectionsView = document.querySelector("#kb-collections-view");
    if (collectionsView) {
      collectionsView.innerHTML = `
                <div class="error-state">
                    <div class="error-state-icon">❌</div>
                    <div class="error-state-text">Error loading collections: ${error.message}</div>
                    <button onclick="loadCollections()" class="primary-button">Retry</button>
                </div>
            `;
    }
  }
}

// Show modal to create a new collection
function showCreateCollectionModal() {
  // Create modal element
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create New Collection</h3>
                <button class="modal-close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="collection-name">Collection Name</label>
                    <input type="text" id="collection-name" placeholder="Enter collection name">
                    <div class="form-help">Use only letters, numbers, and underscores</div>
                </div>
                <div class="form-group">
                    <label>Collection Type</label>
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="collection-type" value="standard" checked>
                            Standard Collection
                        </label>
                        <label>
                            <input type="radio" name="collection-type" value="agent">
                            Agent Knowledge Base
                        </label>
                    </div>
                </div>
                <div class="form-group" id="agent-select-group" style="display: none;">
                    <label for="agent-select">Select Agent</label>
                    <select id="agent-select">
                        <option value="Admin">Admin</option>
                        <option value="Types">Types</option>
                        <option value="Utils">Utils</option>
                        <option value="Validator">Validator</option>
                        <option value="Developer">Developer</option>
                        <option value="Browser">Browser</option>
                        <option value="Server">Server</option>
                        <option value="Version">Version</option>
                        <option value="Testbed">Testbed</option>
                        <option value="Pipeline">Pipeline</option>
                        <option value="Generator">Generator</option>
                        <option value="Config">Config</option>
                        <option value="Docs">Docs</option>
                        <option value="Git">Git</option>
                        <option value="Analyzer">Analyzer</option>
                        <option value="Bundler">Bundler</option>
                        <option value="ARLO">ARLO</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="secondary-button modal-cancel-btn">Cancel</button>
                <button class="primary-button" id="create-collection-confirm-btn">Create Collection</button>
            </div>
        </div>
    `;

  // Add the modal to the document
  document.body.appendChild(modal);

  // Show agent select when agent type is selected
  const collectionTypeRadios = modal.querySelectorAll(
    'input[name="collection-type"]'
  );
  const agentSelectGroup = modal.querySelector("#agent-select-group");

  collectionTypeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "agent") {
        agentSelectGroup.style.display = "block";
      } else {
        agentSelectGroup.style.display = "none";
      }
    });
  });

  // Add event listeners
  const closeBtn = modal.querySelector(".modal-close-btn");
  const cancelBtn = modal.querySelector(".modal-cancel-btn");

  function closeModal() {
    document.body.removeChild(modal);
  }

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Handle outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Handle create collection
  const createBtn = modal.querySelector("#create-collection-confirm-btn");
  createBtn.addEventListener("click", async () => {
    const nameInput = modal.querySelector("#collection-name");
    const name = nameInput.value.trim();
    const collectionType = modal.querySelector(
      'input[name="collection-type"]:checked'
    ).value;
    const agentSelect = modal.querySelector("#agent-select");

    if (!name) {
      nameInput.classList.add("error");
      return;
    }

    // Generate the collection name
    let collectionName = name;
    if (collectionType === "agent" && agentSelect) {
      const selectedAgent = agentSelect.value;
      collectionName = `agent_${selectedAgent}`;
    }

    try {
      // Show loading state
      createBtn.disabled = true;
      createBtn.innerHTML = '<div class="spinner-small"></div> Creating...';

      // Create collection
      await VectorDB.createCollection(collectionName);

      // Close modal and refresh collections
      closeModal();
      loadCollections();
    } catch (error) {
      console.error("Error creating collection:", error);
      alert(`Error creating collection: ${error.message}`);
      createBtn.disabled = false;
      createBtn.textContent = "Create Collection";
    }
  });
}

// View a collection
async function viewCollection(collectionName) {
  console.log(`View collection: ${collectionName}`);
  // In a real application, this would show the collection's documents
  // For this demo, we'll just log to console
}

// Delete a collection
async function deleteCollection(collectionName) {
  if (
    !confirm(`Are you sure you want to delete collection "${collectionName}"?`)
  ) {
    return;
  }

  try {
    await VectorDB.deleteCollection(collectionName);
    loadCollections(); // Refresh the list
  } catch (error) {
    console.error("Error deleting collection:", error);
    alert(`Error deleting collection: ${error.message}`);
  }
}

// Update agent filter with available agent collections
async function updateAgentFilter() {
  try {
    const collections = await VectorDB.listCollections();
    const agentCollections = collections
      .filter((c) => c.name.startsWith("agent_"))
      .map((c) => c.name.replace("agent_", ""));

    const agentFilter = document.getElementById("kb-search-agent");
    if (!agentFilter) return;

    // Keep the "All Agents" option
    const allAgentsOption = agentFilter.querySelector('option[value=""]');

    // Clear existing options except "All Agents"
    agentFilter.innerHTML = "";
    if (allAgentsOption) {
      agentFilter.appendChild(allAgentsOption);
    } else {
      agentFilter.innerHTML = '<option value="">All Agents</option>';
    }

    // Add agent options
    agentCollections.forEach((agent) => {
      const option = document.createElement("option");
      option.value = agent;
      option.textContent = agent;
      agentFilter.appendChild(option);
    });
  } catch (error) {
    console.error("Error updating agent filter:", error);
  }
}

// Set up file drag and drop for knowledge base uploads
function setupFileDragAndDrop(container) {
  if (!container) return;

  const dropZone = document.createElement("div");
  dropZone.className = "drop-zone";
  dropZone.innerHTML = `
        <div class="drop-zone-content">
            <div class="drop-zone-icon">📁</div>
            <div class="drop-zone-text">Drop files here to add to knowledge base</div>
        </div>
    `;

  // Initially hidden
  dropZone.style.display = "none";
  container.appendChild(dropZone);

  // Handle drag events
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.display = "flex";
  });

  container.addEventListener("dragleave", (e) => {
    if (!container.contains(e.relatedTarget)) {
      dropZone.style.display = "none";
    }
  });

  dropZone.addEventListener("dragleave", (e) => {
    if (!dropZone.contains(e.relatedTarget)) {
      dropZone.style.display = "none";
    }
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.display = "none";

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  });
}

// Handle file uploads to knowledge base
async function handleFileUpload(files) {
  // In a real application, this would process and store the files
  // For this demo, we'll just show a notification

  const notification = document.createElement("div");
  notification.className = "notification";
  notification.innerHTML = `
        <div class="notification-icon">✅</div>
        <div class="notification-content">
            <div class="notification-title">Files Uploaded</div>
            <div class="notification-message">${files.length} files added to knowledge base</div>
        </div>
        <button class="notification-close">&times;</button>
    `;

  document.body.appendChild(notification);

  // Remove notification after a delay
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 5000);

  // Add close button functionality
  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(notification);
  });
}

export { initKnowledgeBaseView, performKnowledgeSearch, loadCollections };
