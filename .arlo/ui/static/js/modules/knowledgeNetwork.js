// Knowledge Network Module
import VectorDB from "./vectordb.js";

// SVG constants and configuration
const SVG_NS = "http://www.w3.org/2000/svg";
const NODE_TYPES = {
  CENTRAL: "central",
  AGENT: "agent",
  KNOWLEDGE: "knowledge",
  DOCUMENT: "document",
  COLLECTION: "collection",
  TASK: "task",
};

const EDGE_TYPES = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
  TERTIARY: "tertiary",
};

// Agent colors mapping
const AGENT_COLORS = {
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

// Agent domain definitions
const AGENT_DOMAINS = {
  Admin: ["Components", "Architecture", "System"],
  Browser: ["DOM", "Events", "Rendering"],
  Server: ["API", "Middleware", "Services"],
  Utils: ["Helpers", "Functions", "Tools"],
  Types: ["Interfaces", "Types", "Schemas"],
  Validator: ["Validation", "Schemas", "Rules"],
  Developer: ["IDE", "Tools", "Workflow"],
  Version: ["Versioning", "Releases", "Changelog"],
  Testbed: ["Testing", "Mocks", "Scenarios"],
  Pipeline: ["Builds", "CI/CD", "Deployment"],
  Generator: ["Templates", "Scaffolding", "Code Gen"],
  Config: ["Settings", "Environment", "Options"],
  Docs: ["Documentation", "Tutorials", "Examples"],
  Git: ["Source Control", "Branching", "PRs"],
  Analyzer: ["Code Analysis", "Linting", "Quality"],
  Bundler: ["Packaging", "Assets", "Optimization"],
  ARLO: ["Agents", "Tasks", "Knowledge"],
};

// Predefined knowledge domain connections
const DOMAIN_CONNECTIONS = [
  { source: "Components", target: "DOM", strength: 0.8 },
  { source: "Events", target: "DOM", strength: 0.9 },
  { source: "Rendering", target: "Components", strength: 0.9 },
  { source: "API", target: "Services", strength: 0.7 },
  { source: "Middleware", target: "API", strength: 0.8 },
  { source: "Types", target: "Interfaces", strength: 0.9 },
  { source: "Schemas", target: "Types", strength: 0.8 },
  { source: "Tools", target: "Workflow", strength: 0.7 },
  { source: "Testing", target: "Scenarios", strength: 0.7 },
  { source: "Builds", target: "Deployment", strength: 0.8 },
  { source: "Templates", target: "Code Gen", strength: 0.9 },
  { source: "Documentation", target: "Tutorials", strength: 0.8 },
  { source: "Source Control", target: "Branching", strength: 0.9 },
  { source: "Code Analysis", target: "Linting", strength: 0.7 },
  { source: "Packaging", target: "Optimization", strength: 0.8 },
  { source: "Agents", target: "Tasks", strength: 0.9 },
  { source: "Knowledge", target: "Agents", strength: 0.8 },
];

// Knowledge Network Class
class KnowledgeNetwork {
  constructor(container) {
    this.container = container;
    this.svg = container.querySelector("svg.kb-connections");
    this.nodeContainer = container.querySelector(".kb-node-container");
    this.detailsPanel = document.getElementById("kb-network-details");

    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;

    // D3 specific properties
    this.simulation = null;
    this.zoom = null;
    this.transform = { k: 1, x: 0, y: 0 };

    // Viewport and minimap
    this.minimap = container.querySelector(".kb-network-minimap");
    this.minimapViewport = container.querySelector(".kb-minimap-viewport");

    // Initialize controls
    this.initControls();

    // Setup event handlers
    this.setupEventListeners();
  }

  async initialize() {
    // Clear existing nodes and edges
    this.clearNetwork();

    // Get view mode
    const viewMode = document.getElementById("kb-filter-connections").value;
    const layoutType = document.getElementById("kb-layout-type").value;
    const centralNodeType = document.getElementById("kb-central-node").value;

    // Create nodes and connections based on the selected view mode
    await this.createNetworkData(viewMode, centralNodeType);

    // Apply the selected layout
    this.applyLayout(layoutType);

    // Setup D3 force simulation
    this.setupForceSimulation();

    // Render the nodes and edges
    this.renderNetwork();

    // Initialize minimap
    this.initializeMinimap();
  }

  initControls() {
    // Setup filter control
    const filterSelect = document.getElementById("kb-filter-connections");
    filterSelect.addEventListener("change", () => this.initialize());

    // Setup layout control
    const layoutSelect = document.getElementById("kb-layout-type");
    layoutSelect.addEventListener("change", () => {
      const layout = layoutSelect.value;
      this.applyLayout(layout);
      this.renderNetwork();
    });

    // Setup central node control
    const centralNodeSelect = document.getElementById("kb-central-node");
    centralNodeSelect.addEventListener("change", () => this.initialize());

    // Setup refresh button
    const refreshButton = document.getElementById("kb-refresh-network");
    refreshButton.addEventListener("click", () => this.initialize());

    // Setup export button
    const exportButton = document.getElementById("kb-export-network");
    exportButton.addEventListener("click", () => this.exportAsPNG());

    // Setup fullscreen button
    const fullscreenButton = document.getElementById("kb-fullscreen-network");
    fullscreenButton.addEventListener("click", () => this.toggleFullscreen());

    // Setup zoom controls
    const zoomInButton = document.getElementById("kb-zoom-in");
    const zoomOutButton = document.getElementById("kb-zoom-out");
    const zoomResetButton = document.getElementById("kb-zoom-reset");

    zoomInButton.addEventListener("click", () => this.zoomIn());
    zoomOutButton.addEventListener("click", () => this.zoomOut());
    zoomResetButton.addEventListener("click", () => this.zoomReset());
  }

  setupEventListeners() {
    // Add node click handler
    this.nodeContainer.addEventListener("click", (e) => {
      const node = e.target.closest(".kb-node");
      if (node) {
        this.selectNode(node.getAttribute("data-id"));
      } else {
        // If clicked outside any node, deselect
        this.deselectNodes();
      }
    });

    // Setup pan and zoom functionality
    if (typeof d3 !== "undefined") {
      this.setupD3Zoom();
    } else {
      // Wait for D3 to load
      const checkD3 = setInterval(() => {
        if (typeof d3 !== "undefined") {
          clearInterval(checkD3);
          this.setupD3Zoom();
        }
      }, 100);
    }
  }

  setupD3Zoom() {
    this.zoom = d3
      .zoom()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        this.transform = event.transform;

        // Apply transformation to the node container
        this.nodeContainer.style.transform = `translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.k})`;

        // Update connections
        this.updateConnections();

        // Update minimap viewport
        this.updateMinimapViewport();
      });

    // Apply zoom behavior to the container
    d3.select(this.container).call(this.zoom);
  }

  clearNetwork() {
    // Clear node container
    while (this.nodeContainer.firstChild) {
      if (this.nodeContainer.firstChild.tagName === "svg") {
        // Keep the SVG element for connections
        break;
      }
      this.nodeContainer.removeChild(this.nodeContainer.firstChild);
    }

    // Clear connections
    const connections = this.svg.querySelectorAll(".kb-connection");
    connections.forEach((conn) => conn.remove());

    // Reset data
    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;
  }

  async createNetworkData(viewMode, centralNode) {
    // Create nodes and edges based on the view mode
    switch (viewMode) {
      case "agents":
        await this.createAgentNetwork(centralNode);
        break;
      case "knowledge":
        await this.createKnowledgeTypeNetwork(centralNode);
        break;
      case "documents":
        await this.createDocumentNetwork(centralNode);
        break;
      case "all":
      default:
        await this.createAllConnectionsNetwork(centralNode);
        break;
    }
  }

  async loadCollections() {
    try {
      return await VectorDB.listCollections();
    } catch (error) {
      console.error("Error loading collections:", error);
      return [];
    }
  }

  async createAgentNetwork(centralNode) {
    // Create central node (either Knowledge Hub or a specific agent)
    let centralNodeName = "Knowledge Hub";
    let centralNodeType = NODE_TYPES.CENTRAL;

    if (centralNode !== "knowledge") {
      centralNodeName =
        centralNode.charAt(0).toUpperCase() + centralNode.slice(1);
      centralNodeType = NODE_TYPES.AGENT;
    }

    this.nodes.push({
      id: "central",
      name: centralNodeName,
      type: centralNodeType,
      size: "large",
      color: centralNode !== "knowledge" ? AGENT_COLORS[centralNodeName] : null,
    });

    // Add all agents as nodes
    const agents = Object.keys(AGENT_COLORS);

    agents.forEach((agent) => {
      // Skip if this agent is the central node
      if (
        centralNode !== "knowledge" &&
        agent.toLowerCase() === centralNode.toLowerCase()
      ) {
        return;
      }

      this.nodes.push({
        id: `agent_${agent}`,
        name: agent,
        type: NODE_TYPES.AGENT,
        size: "medium",
        color: AGENT_COLORS[agent],
      });

      // Connect to central node
      this.edges.push({
        source: "central",
        target: `agent_${agent}`,
        type: EDGE_TYPES.PRIMARY,
      });
    });

    // Add connections between select agents
    const agentConnections = [
      { source: "Admin", target: "ARLO" },
      { source: "Browser", target: "Docs" },
      { source: "Server", target: "API" },
      { source: "Types", target: "Validator" },
      { source: "Utils", target: "Browser" },
      { source: "Generator", target: "Bundler" },
      { source: "Config", target: "Git" },
      { source: "Git", target: "Pipeline" },
      { source: "Analyzer", target: "Types" },
      { source: "Testbed", target: "Developer" },
      { source: "Developer", target: "Server" },
      { source: "Version", target: "Docs" },
    ];

    agentConnections.forEach((conn) => {
      // Skip if either agent is the central node
      if (
        centralNode !== "knowledge" &&
        (conn.source.toLowerCase() === centralNode.toLowerCase() ||
          conn.target.toLowerCase() === centralNode.toLowerCase())
      ) {
        return;
      }

      this.edges.push({
        source: `agent_${conn.source}`,
        target: `agent_${conn.target}`,
        type: EDGE_TYPES.SECONDARY,
      });
    });
  }

  async createKnowledgeTypeNetwork(centralNode) {
    // Create central node (either Knowledge Hub or a specific agent)
    let centralNodeName = "Knowledge Hub";
    let centralNodeType = NODE_TYPES.CENTRAL;

    if (centralNode !== "knowledge") {
      centralNodeName =
        centralNode.charAt(0).toUpperCase() + centralNode.slice(1);
      centralNodeType = NODE_TYPES.AGENT;
    }

    this.nodes.push({
      id: "central",
      name: centralNodeName,
      type: centralNodeType,
      size: "large",
      color: centralNode !== "knowledge" ? AGENT_COLORS[centralNodeName] : null,
    });

    // If central node is an agent, add its domains
    if (centralNode !== "knowledge") {
      const agentName = centralNodeName;
      const domains = AGENT_DOMAINS[agentName] || [];

      domains.forEach((domain) => {
        this.nodes.push({
          id: `domain_${domain}`,
          name: domain,
          type: NODE_TYPES.KNOWLEDGE,
          size: "medium",
        });

        this.edges.push({
          source: "central",
          target: `domain_${domain}`,
          type: EDGE_TYPES.PRIMARY,
        });
      });

      // Add related agents
      const relatedAgents = Object.keys(AGENT_COLORS).filter(
        (agent) => agent !== agentName
      );
      // Pick 3-5 random related agents
      const selectedAgents = relatedAgents
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      selectedAgents.forEach((agent) => {
        this.nodes.push({
          id: `agent_${agent}`,
          name: agent,
          type: NODE_TYPES.AGENT,
          size: "medium",
          color: AGENT_COLORS[agent],
        });

        this.edges.push({
          source: "central",
          target: `agent_${agent}`,
          type: EDGE_TYPES.SECONDARY,
        });

        // Add one domain from this agent
        const agentDomains = AGENT_DOMAINS[agent] || [];
        if (agentDomains.length > 0) {
          const domain = agentDomains[0];

          // Check if domain is already added
          const existingDomain = this.nodes.find(
            (n) => n.id === `domain_${domain}`
          );
          if (!existingDomain) {
            this.nodes.push({
              id: `domain_${domain}`,
              name: domain,
              type: NODE_TYPES.KNOWLEDGE,
              size: "small",
            });
          }

          this.edges.push({
            source: `agent_${agent}`,
            target: `domain_${domain}`,
            type: EDGE_TYPES.TERTIARY,
          });
        }
      });
    } else {
      // If central node is the Knowledge Hub, add multiple knowledge domains
      // Create a sample of knowledge domains from all agents
      const allDomains = [];
      Object.values(AGENT_DOMAINS).forEach((domains) => {
        domains.forEach((domain) => {
          if (!allDomains.includes(domain)) {
            allDomains.push(domain);
          }
        });
      });

      // Pick a subset of domains
      const selectedDomains = allDomains
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);

      selectedDomains.forEach((domain) => {
        this.nodes.push({
          id: `domain_${domain}`,
          name: domain,
          type: NODE_TYPES.KNOWLEDGE,
          size: "medium",
        });

        this.edges.push({
          source: "central",
          target: `domain_${domain}`,
          type: EDGE_TYPES.PRIMARY,
        });
      });

      // Add connections between domains based on predefined relationships
      DOMAIN_CONNECTIONS.forEach((conn) => {
        const sourceExists = selectedDomains.includes(conn.source);
        const targetExists = selectedDomains.includes(conn.target);

        if (sourceExists && targetExists) {
          this.edges.push({
            source: `domain_${conn.source}`,
            target: `domain_${conn.target}`,
            type:
              conn.strength > 0.7 ? EDGE_TYPES.SECONDARY : EDGE_TYPES.TERTIARY,
            strength: conn.strength,
          });
        }
      });
    }
  }

  async createDocumentNetwork(centralNode) {
    // Load collections data from API
    const collections = await this.loadCollections();

    // Create central node (either Knowledge Hub or a collection)
    let centralNodeName = "Knowledge Hub";
    let centralNodeType = NODE_TYPES.CENTRAL;

    if (centralNode !== "knowledge") {
      centralNodeName =
        centralNode.charAt(0).toUpperCase() + centralNode.slice(1);
      // Find if this matches a collection
      const matchingCollection = collections.find(
        (c) => c.name.toLowerCase() === `agent_${centralNode.toLowerCase()}`
      );

      centralNodeType = matchingCollection
        ? NODE_TYPES.COLLECTION
        : NODE_TYPES.AGENT;
    }

    this.nodes.push({
      id: "central",
      name: centralNodeName,
      type: centralNodeType,
      size: "large",
      color: centralNode !== "knowledge" ? AGENT_COLORS[centralNodeName] : null,
    });

    // Add collections
    const agentCollections = collections.filter((c) =>
      c.name.startsWith("agent_")
    );
    const otherCollections = collections.filter(
      (c) => !c.name.startsWith("agent_")
    );

    // Decide which collections to show based on central node
    let collectionsToShow = [];

    if (centralNode !== "knowledge") {
      const agentName = centralNodeName;
      // Show the agent's collection and 3-4 related collections
      const agentCollection = agentCollections.find(
        (c) => c.name.toLowerCase() === `agent_${centralNode.toLowerCase()}`
      );

      if (agentCollection) {
        collectionsToShow.push(agentCollection);
      }

      // Add a mix of agent and non-agent collections
      const otherAgentCollections = agentCollections
        .filter((c) => c !== agentCollection)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      const selectedOtherCollections = otherCollections
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      collectionsToShow = collectionsToShow.concat(
        otherAgentCollections,
        selectedOtherCollections
      );
    } else {
      // Show a representative sample of collections
      const selectedAgentCollections = agentCollections
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

      const selectedOtherCollections = otherCollections
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      collectionsToShow = selectedAgentCollections.concat(
        selectedOtherCollections
      );
    }

    // Add collection nodes
    collectionsToShow.forEach((collection) => {
      let name = collection.name;
      const type = NODE_TYPES.COLLECTION;
      let color = null;

      // If agent collection, extract agent name
      if (collection.name.startsWith("agent_")) {
        name = collection.name.replace("agent_", "");
        color = AGENT_COLORS[name];
      }

      this.nodes.push({
        id: `collection_${collection.name}`,
        name: name,
        type: type,
        size: "medium",
        color: color,
        data: {
          count: collection.count || 0,
        },
      });

      // Connect to central node
      this.edges.push({
        source: "central",
        target: `collection_${collection.name}`,
        type: EDGE_TYPES.PRIMARY,
      });
    });

    // Add document nodes (simulated)
    collectionsToShow.forEach((collection) => {
      const count = Math.min(collection.count || 0, 3); // Show up to 3 documents per collection

      for (let i = 0; i < count; i++) {
        const docId = `document_${collection.name}_${i}`;

        this.nodes.push({
          id: docId,
          name: `Doc ${i + 1}`,
          type: NODE_TYPES.DOCUMENT,
          size: "small",
          data: {
            collection: collection.name,
          },
        });

        // Connect to collection
        this.edges.push({
          source: `collection_${collection.name}`,
          target: docId,
          type: EDGE_TYPES.SECONDARY,
        });
      }
    });

    // Add some cross-collection document connections
    const documentNodes = this.nodes.filter(
      (n) => n.type === NODE_TYPES.DOCUMENT
    );
    if (documentNodes.length > 5) {
      // Create 3-5 random connections between documents
      const connections = Math.min(Math.floor(documentNodes.length * 0.3), 5);

      for (let i = 0; i < connections; i++) {
        const sourceIndex = Math.floor(Math.random() * documentNodes.length);
        let targetIndex;

        do {
          targetIndex = Math.floor(Math.random() * documentNodes.length);
        } while (targetIndex === sourceIndex);

        const sourceId = documentNodes[sourceIndex].id;
        const targetId = documentNodes[targetIndex].id;

        // Connect only if they're from different collections
        const sourceCollection = documentNodes[sourceIndex].data.collection;
        const targetCollection = documentNodes[targetIndex].data.collection;

        if (sourceCollection !== targetCollection) {
          this.edges.push({
            source: sourceId,
            target: targetId,
            type: EDGE_TYPES.TERTIARY,
          });
        }
      }
    }
  }

  async createAllConnectionsNetwork(centralNode) {
    // Create central node (Knowledge Hub or specific agent)
    let centralNodeName = "Knowledge Hub";
    let centralNodeType = NODE_TYPES.CENTRAL;

    if (centralNode !== "knowledge") {
      centralNodeName =
        centralNode.charAt(0).toUpperCase() + centralNode.slice(1);
      centralNodeType = NODE_TYPES.AGENT;
    }

    this.nodes.push({
      id: "central",
      name: centralNodeName,
      type: centralNodeType,
      size: "large",
      color: centralNode !== "knowledge" ? AGENT_COLORS[centralNodeName] : null,
    });

    // Load collections
    const collections = await this.loadCollections();

    // Select agents to visualize
    let agentsToShow = [];

    if (centralNode !== "knowledge") {
      // If central node is an agent, add related agents
      const centralAgentName = centralNodeName;
      const relatedAgents = Object.keys(AGENT_COLORS)
        .filter((agent) => agent !== centralAgentName)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      agentsToShow = [centralAgentName, ...relatedAgents];
    } else {
      // If central node is Knowledge Hub, select a diverse set of agents
      agentsToShow = Object.keys(AGENT_COLORS)
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);
    }

    // Add agent nodes
    agentsToShow.forEach((agent) => {
      // Skip if this is the central node
      if (centralNode !== "knowledge" && agent === centralNodeName) {
        return;
      }

      this.nodes.push({
        id: `agent_${agent}`,
        name: agent,
        type: NODE_TYPES.AGENT,
        size: "medium",
        color: AGENT_COLORS[agent],
      });

      // Connect to central node
      this.edges.push({
        source: "central",
        target: `agent_${agent}`,
        type: EDGE_TYPES.PRIMARY,
      });
    });

    // Add knowledge domain nodes
    const domainsToShow = [];

    agentsToShow.forEach((agent) => {
      // Get domains for this agent
      const agentDomains = AGENT_DOMAINS[agent] || [];
      // Select one domain per agent
      if (agentDomains.length > 0) {
        const domainIndex = Math.floor(Math.random() * agentDomains.length);
        const domain = agentDomains[domainIndex];

        // Check if we already added this domain
        if (!domainsToShow.includes(domain)) {
          domainsToShow.push(domain);

          this.nodes.push({
            id: `domain_${domain}`,
            name: domain,
            type: NODE_TYPES.KNOWLEDGE,
            size: "small",
          });

          // If central node is an agent and this is its domain, connect directly
          if (centralNode !== "knowledge" && agent === centralNodeName) {
            this.edges.push({
              source: "central",
              target: `domain_${domain}`,
              type: EDGE_TYPES.PRIMARY,
            });
          } else {
            // Connect to the agent
            this.edges.push({
              source: `agent_${agent}`,
              target: `domain_${domain}`,
              type: EDGE_TYPES.SECONDARY,
            });
          }
        }
      }
    });

    // Add document/collection nodes
    const agent_collections = [];

    agentsToShow.forEach((agent) => {
      // Find this agent's collection
      const collection = collections.find(
        (c) => c.name.toLowerCase() === `agent_${agent.toLowerCase()}`
      );

      if (collection) {
        agent_collections.push({
          agent: agent,
          collection: collection,
        });
      }
    });

    // Add collection and document nodes
    agent_collections.forEach(({ agent, collection }) => {
      this.nodes.push({
        id: `collection_${collection.name}`,
        name: agent,
        type: NODE_TYPES.COLLECTION,
        size: "small",
        color: AGENT_COLORS[agent],
        data: {
          count: collection.count || 0,
        },
      });

      // Connect collection to agent
      const sourceId =
        centralNode !== "knowledge" && agent === centralNodeName
          ? "central"
          : `agent_${agent}`;

      this.edges.push({
        source: sourceId,
        target: `collection_${collection.name}`,
        type: EDGE_TYPES.SECONDARY,
      });

      // Add one document per collection if it has documents
      if (collection.count && collection.count > 0) {
        const docId = `document_${collection.name}_1`;

        this.nodes.push({
          id: docId,
          name: `Doc`,
          type: NODE_TYPES.DOCUMENT,
          size: "small",
          data: {
            collection: collection.name,
          },
        });

        // Connect to collection
        this.edges.push({
          source: `collection_${collection.name}`,
          target: docId,
          type: EDGE_TYPES.TERTIARY,
        });
      }
    });

    // Add task nodes
    if (
      centralNode === "knowledge" ||
      centralNode === "admin" ||
      centralNode === "arlo"
    ) {
      // Add 2-3 task nodes
      const taskCount = centralNode === "knowledge" ? 3 : 2;

      for (let i = 0; i < taskCount; i++) {
        const taskId = `task_${i + 1}`;

        this.nodes.push({
          id: taskId,
          name: `Task ${i + 1}`,
          type: NODE_TYPES.TASK,
          size: "small",
        });

        // Connect task to central node or Admin agent
        const sourceId =
          centralNode === "knowledge"
            ? "central"
            : centralNode === "admin"
            ? "central"
            : "agent_Admin";

        this.edges.push({
          source: sourceId,
          target: taskId,
          type: EDGE_TYPES.SECONDARY,
        });

        // Connect task to a document if we have any
        const documentNodes = this.nodes.filter(
          (n) => n.type === NODE_TYPES.DOCUMENT
        );
        if (documentNodes.length > 0) {
          const docIndex = Math.floor(Math.random() * documentNodes.length);

          this.edges.push({
            source: taskId,
            target: documentNodes[docIndex].id,
            type: EDGE_TYPES.TERTIARY,
          });
        }
      }
    }
  }

  applyLayout(layoutType) {
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Remove any existing layout classes
    this.nodeContainer.classList.remove(
      "kb-layout-force",
      "kb-layout-circular",
      "kb-layout-hierarchical",
      "kb-layout-radial"
    );

    // Add the new layout class
    this.nodeContainer.classList.add(`kb-layout-${layoutType}`);

    switch (layoutType) {
      case "circular":
        this.applyCircularLayout(centerX, centerY);
        break;
      case "hierarchical":
        this.applyHierarchicalLayout(centerX, centerY);
        break;
      case "radial":
        this.applyRadialLayout(centerX, centerY);
        break;
      case "force":
      default:
        // For force layout, initial positions are random
        // D3 force simulation will handle the rest
        this.nodes.forEach((node) => {
          node.x = centerX + (Math.random() * 400 - 200);
          node.y = centerY + (Math.random() * 400 - 200);
        });
        break;
    }
  }

  applyCircularLayout(centerX, centerY) {
    const radius = Math.min(centerX, centerY) * 0.8;
    const angleStep = (2 * Math.PI) / (this.nodes.length - 1); // Exclude central node

    // Position central node in the center
    const centralNode = this.nodes.find((n) => n.id === "central");
    if (centralNode) {
      centralNode.x = centerX;
      centralNode.y = centerY;
    }

    // Position other nodes in a circle around the center
    let angle = 0;
    this.nodes.forEach((node) => {
      if (node.id !== "central") {
        node.x = centerX + radius * Math.cos(angle);
        node.y = centerY + radius * Math.sin(angle);
        angle += angleStep;
      }
    });
  }

  applyHierarchicalLayout(centerX, centerY) {
    // Group nodes by type
    const nodesByType = {
      [NODE_TYPES.CENTRAL]: [],
      [NODE_TYPES.AGENT]: [],
      [NODE_TYPES.KNOWLEDGE]: [],
      [NODE_TYPES.COLLECTION]: [],
      [NODE_TYPES.DOCUMENT]: [],
      [NODE_TYPES.TASK]: [],
    };

    this.nodes.forEach((node) => {
      if (nodesByType[node.type]) {
        nodesByType[node.type].push(node);
      }
    });

    // Position nodes in layers
    const layers = [
      nodesByType[NODE_TYPES.CENTRAL],
      nodesByType[NODE_TYPES.AGENT],
      nodesByType[NODE_TYPES.KNOWLEDGE],
      nodesByType[NODE_TYPES.COLLECTION],
      nodesByType[NODE_TYPES.DOCUMENT].concat(nodesByType[NODE_TYPES.TASK]),
    ];

    const layerSpacing = centerY * 0.4;

    layers.forEach((layer, layerIndex) => {
      const layerY =
        centerY -
        (layers.length / 2) * layerSpacing +
        layerIndex * layerSpacing;
      const nodeSpacing = containerWidth / (layer.length + 1);

      layer.forEach((node, nodeIndex) => {
        node.x = (nodeIndex + 1) * nodeSpacing;
        node.y = layerY;
      });
    });
  }

  applyRadialLayout(centerX, centerY) {
    // Similar to circular but with nodes grouped by type and in different orbits
    const orbits = {
      [NODE_TYPES.CENTRAL]: 0,
      [NODE_TYPES.AGENT]: 100,
      [NODE_TYPES.KNOWLEDGE]: 180,
      [NODE_TYPES.COLLECTION]: 240,
      [NODE_TYPES.DOCUMENT]: 290,
      [NODE_TYPES.TASK]: 290,
    };

    // Group nodes by type
    const nodesByType = {
      [NODE_TYPES.CENTRAL]: [],
      [NODE_TYPES.AGENT]: [],
      [NODE_TYPES.KNOWLEDGE]: [],
      [NODE_TYPES.COLLECTION]: [],
      [NODE_TYPES.DOCUMENT]: [],
      [NODE_TYPES.TASK]: [],
    };

    this.nodes.forEach((node) => {
      if (nodesByType[node.type]) {
        nodesByType[node.type].push(node);
      }
    });

    // Position central node in the center
    nodesByType[NODE_TYPES.CENTRAL].forEach((node) => {
      node.x = centerX;
      node.y = centerY;
    });

    // Position other nodes in their respective orbits
    Object.entries(nodesByType).forEach(([type, nodes]) => {
      if (type === NODE_TYPES.CENTRAL) return; // Skip central node

      const orbit = orbits[type];
      const angleStep = (2 * Math.PI) / (nodes.length || 1);

      nodes.forEach((node, index) => {
        const angle = index * angleStep;
        node.x = centerX + orbit * Math.cos(angle);
        node.y = centerY + orbit * Math.sin(angle);
      });
    });
  }

  setupForceSimulation() {
    if (typeof d3 === "undefined") {
      console.warn("D3.js is not available. Force simulation disabled.");
      return;
    }

    // Initialize D3 force simulation
    this.simulation = d3
      .forceSimulation(this.nodes)
      .force(
        "link",
        d3
          .forceLink(this.edges)
          .id((d) => d.id)
          .distance((d) => {
            // Adjust distance based on edge type
            if (d.type === EDGE_TYPES.PRIMARY) return 120;
            if (d.type === EDGE_TYPES.SECONDARY) return 180;
            return 240; // TERTIARY
          })
          .strength((d) => {
            // Adjust strength based on edge type
            if (d.type === EDGE_TYPES.PRIMARY) return 0.7;
            if (d.type === EDGE_TYPES.SECONDARY) return 0.5;
            return 0.3; // TERTIARY
          })
      )
      .force(
        "charge",
        d3.forceManyBody().strength((d) => {
          // Adjust charge based on node type
          if (d.type === NODE_TYPES.CENTRAL) return -800;
          if (d.type === NODE_TYPES.AGENT) return -500;
          if (d.type === NODE_TYPES.KNOWLEDGE) return -300;
          if (d.type === NODE_TYPES.COLLECTION) return -200;
          return -100; // DOCUMENT or TASK
        })
      )
      .force(
        "center",
        d3.forceCenter(
          this.container.clientWidth / 2,
          this.container.clientHeight / 2
        )
      )
      .force(
        "collide",
        d3
          .forceCollide()
          .radius((d) => {
            // Adjust collision radius based on node size
            if (d.size === "large") return 50;
            if (d.size === "medium") return 35;
            return 25; // small
          })
          .strength(0.8)
      )
      .on("tick", () => this.updatePositions());

    // Add drag behavior
    const dragBehavior = d3
      .drag()
      .on("start", this.dragStarted.bind(this))
      .on("drag", this.dragged.bind(this))
      .on("end", this.dragEnded.bind(this));

    // Apply to all node elements (needs to be applied after nodes are created)
    setTimeout(() => {
      d3.selectAll(".kb-node").call(dragBehavior);
    }, 100);
  }

  dragStarted(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragEnded(event, d) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  renderNetwork() {
    // Create node elements
    this.nodes.forEach((node) => {
      this.createNodeElement(node);
    });

    // Create edge elements
    this.edges.forEach((edge) => {
      this.createEdgeElement(edge);
    });
  }

  createNodeElement(node) {
    // Create node element
    const nodeElement = document.createElement("div");
    nodeElement.className = `kb-node ${node.type} ${node.size || "medium"}`;
    nodeElement.setAttribute("data-id", node.id);

    // Add label
    const labelElement = document.createElement("span");
    labelElement.className = "node-label";
    labelElement.textContent = node.name;
    nodeElement.appendChild(labelElement);

    // Set color if specified
    if (node.color) {
      nodeElement.style.setProperty("--agent-color", node.color);
    }

    // Set initial position if available
    if (node.x && node.y) {
      nodeElement.style.left = `${node.x}px`;
      nodeElement.style.top = `${node.y}px`;
    }

    // Add to container
    this.nodeContainer.appendChild(nodeElement);
  }

  createEdgeElement(edge) {
    // Create edge element (SVG line)
    const line = document.createElementNS(SVG_NS, "line");
    line.classList.add("kb-connection", edge.type);
    line.setAttribute("data-source", edge.source);
    line.setAttribute("data-target", edge.target);

    // Set markers based on edge type
    if (edge.type === EDGE_TYPES.PRIMARY) {
      line.setAttribute("marker-end", "url(#arrow-primary)");
    } else if (edge.type === EDGE_TYPES.SECONDARY) {
      line.setAttribute("marker-end", "url(#arrow-secondary)");
    } else if (edge.type === EDGE_TYPES.TERTIARY) {
      line.setAttribute("marker-end", "url(#arrow-tertiary)");
    }

    // Add to SVG
    this.svg.appendChild(line);
  }

  updatePositions() {
    // Update node positions
    this.nodes.forEach((node) => {
      const nodeElement = this.nodeContainer.querySelector(
        `.kb-node[data-id="${node.id}"]`
      );
      if (nodeElement && node.x && node.y) {
        nodeElement.style.left = `${node.x}px`;
        nodeElement.style.top = `${node.y}px`;
      }
    });

    // Update connection positions
    this.updateConnections();
  }

  updateConnections() {
    // Update connection positions
    const connections = this.svg.querySelectorAll(".kb-connection");

    connections.forEach((conn) => {
      const sourceId = conn.getAttribute("data-source");
      const targetId = conn.getAttribute("data-target");

      // Find source and target node elements
      const sourceElement = this.nodeContainer.querySelector(
        `.kb-node[data-id="${sourceId}"]`
      );
      const targetElement = this.nodeContainer.querySelector(
        `.kb-node[data-id="${targetId}"]`
      );

      if (sourceElement && targetElement) {
        // Calculate center positions of nodes
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const svgRect = this.svg.getBoundingClientRect();

        // Calculate centers relative to SVG
        const sourceX =
          (sourceRect.left + sourceRect.width / 2 - svgRect.left) /
            this.transform.k -
          this.transform.x / this.transform.k;
        const sourceY =
          (sourceRect.top + sourceRect.height / 2 - svgRect.top) /
            this.transform.k -
          this.transform.y / this.transform.k;
        const targetX =
          (targetRect.left + targetRect.width / 2 - svgRect.left) /
            this.transform.k -
          this.transform.x / this.transform.k;
        const targetY =
          (targetRect.top + targetRect.height / 2 - svgRect.top) /
            this.transform.k -
          this.transform.y / this.transform.k;

        // Apply transform scale to line position
        conn.setAttribute("x1", sourceX);
        conn.setAttribute("y1", sourceY);
        conn.setAttribute("x2", targetX);
        conn.setAttribute("y2", targetY);
      }
    });
  }

  selectNode(nodeId) {
    // Deselect any previously selected node
    this.deselectNodes();

    // Find the node element
    const nodeElement = this.nodeContainer.querySelector(
      `.kb-node[data-id="${nodeId}"]`
    );
    if (nodeElement) {
      // Mark as selected
      nodeElement.classList.add("selected");
      this.selectedNode = nodeId;

      // Highlight connected edges
      this.highlightConnections(nodeId);

      // Update details panel
      this.updateDetailsPanel(nodeId);
    }
  }

  deselectNodes() {
    // Remove selected class from all nodes
    const selectedNodes =
      this.nodeContainer.querySelectorAll(".kb-node.selected");
    selectedNodes.forEach((node) => {
      node.classList.remove("selected");
    });

    // Clear highlighted connections
    const connections = this.svg.querySelectorAll(".kb-connection.active");
    connections.forEach((conn) => {
      conn.classList.remove("active");
    });

    this.selectedNode = null;

    // Clear details panel
    this.clearDetailsPanel();
  }

  highlightConnections(nodeId) {
    // Find all connections involving this node
    const connections = this.svg.querySelectorAll(
      `.kb-connection[data-source="${nodeId}"], .kb-connection[data-target="${nodeId}"]`
    );

    connections.forEach((conn) => {
      conn.classList.add("active");
    });
  }

  updateDetailsPanel(nodeId) {
    // Find node data
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Find connected nodes
    const connectedNodes = this.findConnectedNodes(nodeId);

    // Clear panel
    this.clearDetailsPanel();

    // Create header section
    const header = document.createElement("div");
    header.className = "kb-details-header";

    let nodeColor = "";
    if (node.type === NODE_TYPES.AGENT && node.color) {
      nodeColor = `border-left: 4px solid ${node.color};`;
    }

    let title; let subtitle;
    switch (node.type) {
      case NODE_TYPES.AGENT:
        title = `${node.name} Agent`;
        subtitle = "Agent Information";
        break;
      case NODE_TYPES.CENTRAL:
        title = "Knowledge Hub";
        subtitle = "Central Knowledge Repository";
        break;
      case NODE_TYPES.KNOWLEDGE:
        title = node.name;
        subtitle = "Knowledge Domain";
        break;
      case NODE_TYPES.COLLECTION:
        title = node.name;
        subtitle = "Document Collection";
        break;
      case NODE_TYPES.DOCUMENT:
        title = `Document`;
        subtitle = `From ${node.data?.collection || "Unknown"} Collection`;
        break;
      case NODE_TYPES.TASK:
        title = node.name;
        subtitle = "Task";
        break;
    }

    header.innerHTML = `
            <div class="kb-details-title" style="${nodeColor}">
                <h3>${title}</h3>
                <div class="kb-details-subtitle">${subtitle}</div>
            </div>
            <div class="kb-details-actions">
                <button class="secondary-button view-node-btn">View Details</button>
            </div>
        `;

    // Create content based on node type
    const content = document.createElement("div");
    content.className = "kb-details-content";

    // First section - description or stats
    const descriptionSection = document.createElement("div");
    descriptionSection.className = "kb-details-section";

    switch (node.type) {
      case NODE_TYPES.AGENT:
        descriptionSection.innerHTML = `
                    <h4>Agent Overview</h4>
                    <p>The ${node.name} agent is responsible for managing ${
          node.name
        }-related tasks in the AssemblyJS framework. It handles knowledge management, task execution, and collaboration with other agents.</p>
                    
                    <div class="kb-stats-grid">
                        <div class="kb-stat-item">
                            <div class="kb-stat-value">${
                              Math.floor(Math.random() * 50) + 10
                            }</div>
                            <div class="kb-stat-label">Knowledge Items</div>
                        </div>
                        <div class="kb-stat-item">
                            <div class="kb-stat-value">${
                              Math.floor(Math.random() * 20) + 5
                            }</div>
                            <div class="kb-stat-label">Tasks</div>
                        </div>
                    </div>
                `;
        break;
      case NODE_TYPES.CENTRAL:
        descriptionSection.innerHTML = `
                    <h4>Knowledge Hub Overview</h4>
                    <p>The Knowledge Hub is the central repository for all AssemblyJS framework knowledge. It connects agents, domains, and documents in a structured knowledge graph.</p>
                    
                    <div class="kb-stats-grid">
                        <div class="kb-stat-item">
                            <div class="kb-stat-value">${
                              Object.keys(AGENT_COLORS).length
                            }</div>
                            <div class="kb-stat-label">Agents</div>
                        </div>
                        <div class="kb-stat-item">
                            <div class="kb-stat-value">${
                              connectedNodes.length
                            }</div>
                            <div class="kb-stat-label">Direct Connections</div>
                        </div>
                    </div>
                `;
        break;
      case NODE_TYPES.KNOWLEDGE:
        descriptionSection.innerHTML = `
                    <h4>Domain Overview</h4>
                    <p>The ${
                      node.name
                    } domain contains knowledge about ${node.name.toLowerCase()} in the AssemblyJS framework, including architecture, implementation, and usage patterns.</p>
                `;
        break;
      case NODE_TYPES.COLLECTION:
        descriptionSection.innerHTML = `
                    <h4>Collection Overview</h4>
                    <p>The ${node.name} collection contains ${
          node.data?.count || 0
        } documents related to ${node.name} in the AssemblyJS framework.</p>
                `;
        break;
      case NODE_TYPES.DOCUMENT:
        descriptionSection.innerHTML = `
                    <h4>Document Overview</h4>
                    <p>This document is part of the ${
                      node.data?.collection || "Unknown"
                    } collection. It contains structured knowledge about a specific aspect of AssemblyJS.</p>
                `;
        break;
      case NODE_TYPES.TASK:
        descriptionSection.innerHTML = `
                    <h4>Task Overview</h4>
                    <p>${node.name} is a task related to the AssemblyJS framework. It may involve code changes, documentation, or other improvements.</p>
                `;
        break;
    }
    content.appendChild(descriptionSection);

    // Second section - related nodes
    if (connectedNodes.length > 0) {
      const relatedSection = document.createElement("div");
      relatedSection.className = "kb-details-section";

      let sectionTitle = "Related Nodes";
      switch (node.type) {
        case NODE_TYPES.AGENT:
          sectionTitle = "Related Knowledge";
          break;
        case NODE_TYPES.CENTRAL:
          sectionTitle = "Connected Agents";
          break;
        case NODE_TYPES.KNOWLEDGE:
          sectionTitle = "Related Agents & Domains";
          break;
        case NODE_TYPES.COLLECTION:
          sectionTitle = "Documents";
          break;
        case NODE_TYPES.DOCUMENT:
          sectionTitle = "Related Collections";
          break;
        case NODE_TYPES.TASK:
          sectionTitle = "Related Items";
          break;
      }

      relatedSection.innerHTML = `<h4>${sectionTitle}</h4>`;

      const relatedList = document.createElement("ul");
      relatedList.className = "kb-details-list";

      // Add up to 5 connected nodes
      const nodesToShow = connectedNodes.slice(0, 5);

      nodesToShow.forEach((connectedNode) => {
        const relatedNode = this.nodes.find((n) => n.id === connectedNode);
        if (!relatedNode) return;

        const listItem = document.createElement("li");
        listItem.innerHTML = `
                    <div class="kb-details-item" data-id="${relatedNode.id}">
                        <div class="kb-details-item-title">${
                          relatedNode.name
                        }</div>
                        <div class="kb-details-item-meta">${this.getNodeTypeLabel(
                          relatedNode.type
                        )}</div>
                    </div>
                `;

        relatedList.appendChild(listItem);
      });

      relatedSection.appendChild(relatedList);
      content.appendChild(relatedSection);
    }

    // Add header and content to panel
    this.detailsPanel.innerHTML = "";
    this.detailsPanel.appendChild(header);
    this.detailsPanel.appendChild(content);

    // Add event listeners to related items
    const relatedItems = this.detailsPanel.querySelectorAll(
      ".kb-details-item[data-id]"
    );
    relatedItems.forEach((item) => {
      item.addEventListener("click", () => {
        const relatedNodeId = item.getAttribute("data-id");
        this.selectNode(relatedNodeId);
      });
    });
  }

  clearDetailsPanel() {
    this.detailsPanel.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">Select a node to view details</div>
            </div>
        `;
  }

  findConnectedNodes(nodeId) {
    const connected = [];

    // Find all edges where this node is source or target
    this.edges.forEach((edge) => {
      if (edge.source === nodeId || edge.source.id === nodeId) {
        const targetId =
          typeof edge.target === "string" ? edge.target : edge.target.id;
        if (!connected.includes(targetId)) {
          connected.push(targetId);
        }
      } else if (edge.target === nodeId || edge.target.id === nodeId) {
        const sourceId =
          typeof edge.source === "string" ? edge.source : edge.source.id;
        if (!connected.includes(sourceId)) {
          connected.push(sourceId);
        }
      }
    });

    return connected;
  }

  getNodeTypeLabel(nodeType) {
    switch (nodeType) {
      case NODE_TYPES.AGENT:
        return "Agent";
      case NODE_TYPES.CENTRAL:
        return "Knowledge Hub";
      case NODE_TYPES.KNOWLEDGE:
        return "Knowledge Domain";
      case NODE_TYPES.COLLECTION:
        return "Collection";
      case NODE_TYPES.DOCUMENT:
        return "Document";
      case NODE_TYPES.TASK:
        return "Task";
      default:
        return "Node";
    }
  }

  initializeMinimap() {
    if (!this.minimap || !this.minimapViewport) return;

    // Set minimap viewport dimensions
    this.updateMinimapViewport();
  }

  updateMinimapViewport() {
    if (!this.minimap || !this.minimapViewport) return;

    const containerRect = this.container.getBoundingClientRect();
    const minimapRect = this.minimap.getBoundingClientRect();

    const scale = minimapRect.width / containerRect.width;

    // Calculate viewport dimensions
    const vpWidth = minimapRect.width / this.transform.k;
    const vpHeight = minimapRect.height / this.transform.k;

    // Calculate viewport position
    const vpX = (-this.transform.x * scale) / this.transform.k;
    const vpY = (-this.transform.y * scale) / this.transform.k;

    // Apply to viewport
    this.minimapViewport.style.width = `${vpWidth}px`;
    this.minimapViewport.style.height = `${vpHeight}px`;
    this.minimapViewport.style.left = `${vpX}px`;
    this.minimapViewport.style.top = `${vpY}px`;
  }

  zoomIn() {
    if (typeof d3 === "undefined" || !this.zoom) return;

    d3.select(this.container)
      .transition()
      .duration(300)
      .call(this.zoom.scaleBy, 1.3);
  }

  zoomOut() {
    if (typeof d3 === "undefined" || !this.zoom) return;

    d3.select(this.container)
      .transition()
      .duration(300)
      .call(this.zoom.scaleBy, 0.7);
  }

  zoomReset() {
    if (typeof d3 === "undefined" || !this.zoom) return;

    d3.select(this.container)
      .transition()
      .duration(500)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  toggleFullscreen() {
    const container = this.container.closest(".kb-network-container");

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

  exportAsPNG() {
    // Create a temporary canvas to draw the network
    const canvas = document.createElement("canvas");
    const container = this.container.querySelector("#kb-network-graph");
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    // Fill background
    ctx.fillStyle = getComputedStyle(container).backgroundColor || "#1e1e1e";
    ctx.fillRect(0, 0, width, height);

    // Draw connections
    const connections = this.svg.querySelectorAll(".kb-connection");
    connections.forEach((conn) => {
      const x1 = parseFloat(conn.getAttribute("x1"));
      const y1 = parseFloat(conn.getAttribute("y1"));
      const x2 = parseFloat(conn.getAttribute("x2"));
      const y2 = parseFloat(conn.getAttribute("y2"));

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      // Set stroke style based on connection type
      if (conn.classList.contains(EDGE_TYPES.PRIMARY)) {
        ctx.strokeStyle = "rgba(89, 166, 255, 0.6)";
        ctx.lineWidth = 2;
      } else if (conn.classList.contains(EDGE_TYPES.SECONDARY)) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
      }

      ctx.stroke();
    });

    // Draw nodes
    const nodes = this.nodeContainer.querySelectorAll(".kb-node");
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Calculate node position relative to container
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;

      // Get node radius
      let radius = 20; // Default small size
      if (node.classList.contains("medium")) {
        radius = 30;
      } else if (node.classList.contains("large")) {
        radius = 40;
      }

      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);

      // Set fill style based on node type
      if (node.classList.contains(NODE_TYPES.CENTRAL)) {
        ctx.fillStyle =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--color-accent"
          ) || "#59a6ff";
      } else if (node.classList.contains(NODE_TYPES.AGENT)) {
        const agentColor =
          node.style.getPropertyValue("--agent-color") || "#59a6ff";
        ctx.fillStyle = "var(--color-bg-light)";
        ctx.strokeStyle = agentColor;
        ctx.lineWidth = 2;
      } else if (node.classList.contains(NODE_TYPES.KNOWLEDGE)) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2;
      } else if (node.classList.contains(NODE_TYPES.COLLECTION)) {
        ctx.fillStyle = "rgba(72, 187, 120, 0.1)";
        ctx.strokeStyle = "rgba(72, 187, 120, 0.3)";
        ctx.lineWidth = 2;
      } else {
        ctx.fillStyle = "rgba(229, 192, 123, 0.1)";
        ctx.strokeStyle = "rgba(229, 192, 123, 0.3)";
        ctx.lineWidth = 2;
      }

      ctx.fill();

      if (ctx.strokeStyle) {
        ctx.stroke();
      }

      // Draw node label
      const label = node.querySelector(".node-label");
      if (label) {
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(label.textContent, x, y + radius + 15);
      }
    });

    // Create download link
    const link = document.createElement("a");
    link.download = `knowledge-network-${new Date()
      .toISOString()
      .slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
}

// Initialize the knowledge network
function initKnowledgeNetwork() {
  const networkContainer = document.getElementById("kb-network-graph");
  if (!networkContainer) return;

  // Initialize the network
  const network = new KnowledgeNetwork(networkContainer);

  // Store network instance in global variable for access
  window.knowledgeNetwork = network;

  // Initialize the network
  network.initialize();

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.knowledgeNetwork) {
      window.knowledgeNetwork.updateConnections();
      window.knowledgeNetwork.updateMinimapViewport();
    }
  });

  return network;
}

export { initKnowledgeNetwork, KnowledgeNetwork };
