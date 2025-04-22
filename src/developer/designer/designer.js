/**
 * AssembleJS Designer JavaScript
 * Implements WinForms-style drag-and-drop UI builder functionality
 */
document.addEventListener("DOMContentLoaded", () => {
  // Store references to DOM elements
  const designer = {
    projectTree: document.getElementById("project-tree"),
    canvas: document.getElementById("designer-canvas"),
    contextMenu: document.getElementById("context-menu"),
    tabs: document.querySelectorAll(".tab"),
    viewModeButtons: document.querySelectorAll(".view-mode-button"),
    toolboxItems: document.querySelectorAll(".toolbox-item"),
    toolboxPanel: document.querySelector(".panel.toolbox"),
    propertiesPanel: document.querySelector(".panel.properties"),
    resizeHandle: document.querySelector(".panel-resize-handle"),
  };

  // Application structure data
  let appStructure = null;

  // Initialize the designer UI
  initializeDesigner();

  /**
   * Initialize the designer UI and event handlers
   */
  function initializeDesigner() {
    // Retrieve URL parameters
    const params = new URLSearchParams(window.location.search);
    const blueprintId = params.get("blueprint") || "";
    const componentName = params.get("component") || "";
    const viewName = params.get("view") || "";

    // Set default document title
    document.title = `AssembleJS Designer`;

    // Initialize tab switching
    initTabs();

    // Initialize view mode switching
    initViewModes();

    // Initialize context menu
    initContextMenu();

    // Initialize drag and drop functionality
    initDragAndDrop();

    // Initialize panel resize functionality
    initPanelResize();

    // Load application structure
    loadApplicationStructure().then(() => {
      // If URL has specific component/view parameters, focus on them
      if (componentName && viewName) {
        document.title = `${componentName}/${viewName} - AssembleJS Designer`;
        document.querySelector(".status-item:nth-child(3)").textContent =
          componentName.startsWith("blueprint-")
            ? `Blueprint: ${componentName.replace("blueprint-", "")}`
            : `Component: ${componentName}`;

        // Load specific component or blueprint
        if (componentName.startsWith("blueprint-")) {
          loadBlueprint(componentName.replace("blueprint-", ""), viewName);
        } else {
          loadComponent(componentName, viewName);
        }
      }
    });
  }

  /**
   * Initialize panel resize functionality
   */
  function initPanelResize() {
    const rightPanels = document.querySelector(".right-panels");

    if (!designer.resizeHandle) return;

    let startY = 0;
    let startToolboxHeight = 0;
    let startPropertiesHeight = 0;

    // Mouse down event for starting resize
    designer.resizeHandle.addEventListener("mousedown", function (e) {
      // Only handle if both panels are visible
      if (
        designer.toolboxPanel.classList.contains("hidden") ||
        designer.propertiesPanel.classList.contains("hidden")
      ) {
        return;
      }

      e.preventDefault();

      // Get starting positions
      startY = e.clientY;
      startToolboxHeight = designer.toolboxPanel.offsetHeight;
      startPropertiesHeight = designer.propertiesPanel.offsetHeight;

      // Add temporary mousemove and mouseup event listeners
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      // Add a class to indicate we're resizing
      rightPanels.classList.add("resizing");
    });

    // Handle mouse movement during resize
    function handleMouseMove(e) {
      const deltaY = e.clientY - startY;
      const totalHeight =
        rightPanels.offsetHeight - designer.resizeHandle.offsetHeight;

      // Calculate new heights ensuring they stay within reasonable bounds
      let newToolboxHeight = Math.max(
        100,
        Math.min(totalHeight - 100, startToolboxHeight + deltaY)
      );
      let newPropertiesHeight = totalHeight - newToolboxHeight;

      // Calculate flex values based on the total height
      const toolboxFlex = newToolboxHeight / totalHeight;
      const propertiesFlex = newPropertiesHeight / totalHeight;

      // Apply the new flex values
      designer.toolboxPanel.style.flex = toolboxFlex;
      designer.propertiesPanel.style.flex = propertiesFlex;
    }

    // Handle mouse up to stop resizing
    function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Remove resizing class
      rightPanels.classList.remove("resizing");

      // Save panel state including sizes
      saveLayoutState();
    }
  }

  /**
   * Load application structure from the API
   */
  async function loadApplicationStructure() {
    try {
      // Show loading state
      designer.projectTree.innerHTML =
        '<div class="loading">Loading application structure...</div>';

      // Fetch application structure
      const response = await fetch("/__asmbl__/designer/api/structure");
      if (!response.ok) {
        throw new Error(
          `Failed to load application structure: ${response.statusText}`
        );
      }

      appStructure = await response.json();

      // Build tree view
      buildProjectTree(appStructure);

      console.log("Application structure loaded successfully", appStructure);

      // Initialize tree view toggle functionality
      initTreeView();

      return appStructure;
    } catch (error) {
      console.error("Error loading application structure:", error);
      designer.projectTree.innerHTML = `
        <div class="error-message">
          Failed to load application structure: ${error.message}
          <button id="retry-load-btn">Retry</button>
        </div>
      `;

      // Add retry button handler
      document
        .getElementById("retry-load-btn")
        .addEventListener("click", loadApplicationStructure);
    }
  }

  /**
   * Initialize tree view toggle functionality
   */
  function initTreeView() {
    // Find all tree toggle elements
    const toggles = document.querySelectorAll(".tree-toggle:not(.invisible)");

    // Add click event listener to each toggle
    toggles.forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        // Find the parent tree item
        const treeItem = e.target.closest(".tree-item");

        // Toggle expanded class
        treeItem.classList.toggle("expanded");

        // Update toggle arrow
        e.target.textContent = treeItem.classList.contains("expanded")
          ? "▼"
          : "▶";

        // Stop propagation to prevent selecting the tree item
        e.stopPropagation();
      });
    });

    // Make tree items selectable
    const treeItems = document.querySelectorAll(".tree-item-header");
    treeItems.forEach((item) => {
      item.addEventListener("click", () => {
        // Remove active class from all items
        document.querySelectorAll(".tree-item.active").forEach((activeItem) => {
          activeItem.classList.remove("active");
        });

        // Add active class to the clicked item
        item.closest(".tree-item").classList.add("active");
      });
    });
  }

  /**
   * Initialize tab switching
   */
  function initTabs() {
    designer.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Remove active class from all tabs
        designer.tabs.forEach((t) => t.classList.remove("active"));

        // Add active class to clicked tab
        tab.classList.add("active");
      });
    });
  }

  /**
   * Initialize view mode switching (Design/Code/Split)
   */
  function initViewModes() {
    designer.viewModeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons
        designer.viewModeButtons.forEach((b) => b.classList.remove("active"));

        // Add active class to clicked button
        button.classList.add("active");

        // Handle view mode change
        const mode = button.textContent.trim().toLowerCase();
        console.log(`View mode changed to: ${mode}`);

        // TODO: Implement actual view mode switching logic
      });
    });
  }

  /**
   * Initialize context menu functionality
   */
  function initContextMenu() {
    // Show context menu on right-click
    designer.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      // Position the context menu at the cursor
      designer.contextMenu.style.left = `${e.clientX}px`;
      designer.contextMenu.style.top = `${e.clientY}px`;

      // Show the context menu
      designer.contextMenu.classList.add("visible");
    });

    // Hide context menu when clicking elsewhere
    document.addEventListener("click", () => {
      designer.contextMenu.classList.remove("visible");
    });

    // Add functionality to context menu items
    const contextMenuItems = document.querySelectorAll(".context-menu-item");
    contextMenuItems.forEach((item) => {
      item.addEventListener("click", () => {
        const action = item.textContent.trim().toLowerCase();
        console.log(`Context menu action: ${action}`);

        // TODO: Implement actual context menu actions
      });
    });
  }

  /**
   * Initialize drag and drop functionality
   */
  function initDragAndDrop() {
    // Make toolbox items draggable
    designer.toolboxItems.forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        const componentType = item.querySelector(".tool-label").textContent;
        e.dataTransfer.setData("text/plain", componentType);
        console.log(`Started dragging: ${componentType}`);
      });
    });

    // Make canvas and component outlines drop targets
    designer.canvas.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    // Add drop handler to the canvas
    designer.canvas.addEventListener("drop", (e) => {
      e.preventDefault();
      const componentType = e.dataTransfer.getData("text/plain");

      // Calculate drop position relative to the canvas
      const canvasRect = designer.canvas.getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;

      console.log(`Dropped ${componentType} at position (${x}, ${y})`);

      // Find the target component (the one under the cursor)
      const targetComponent = findDropTarget(e.target);

      if (targetComponent) {
        // Add new component to the target component
        addComponentToTarget(componentType, targetComponent);
      } else {
        // Add to canvas root if no component is targeted
        addComponentToCanvas(componentType, x, y);
      }
    });

    // Make component outlines draggable
    const componentOutlines = document.querySelectorAll(".component-outline");
    componentOutlines.forEach((outline) => {
      const header = outline.querySelector(".component-header");

      header.addEventListener("mousedown", (e) => {
        // Only handle left mouse button
        if (e.button !== 0) return;

        // Mark as dragging
        outline.classList.add("dragging");

        // Store initial mouse position and component position
        const initialX = e.clientX;
        const initialY = e.clientY;
        const initialLeft = outline.offsetLeft;
        const initialTop = outline.offsetTop;

        // Move function
        const moveComponent = (moveEvent) => {
          const dx = moveEvent.clientX - initialX;
          const dy = moveEvent.clientY - initialY;

          // Update position
          outline.style.position = "absolute";
          outline.style.left = `${initialLeft + dx}px`;
          outline.style.top = `${initialTop + dy}px`;
        };

        // Stop dragging function
        const stopDragging = () => {
          outline.classList.remove("dragging");
          document.removeEventListener("mousemove", moveComponent);
          document.removeEventListener("mouseup", stopDragging);
        };

        // Add temporary event listeners
        document.addEventListener("mousemove", moveComponent);
        document.addEventListener("mouseup", stopDragging);

        e.preventDefault();
      });
    });
  }

  /**
   * Build the project tree view from the application structure
   * @param {Object} structure - The application structure
   */
  function buildProjectTree(structure) {
    // Clear existing content
    designer.projectTree.innerHTML = "";

    // Create the root src node
    const srcNode = document.createElement("div");
    srcNode.className = "tree-item expanded";
    srcNode.innerHTML = `
      <div class="tree-item-header">
        <span class="tree-toggle">▼</span>
        <span class="tree-icon folder"></span>
        <span class="tree-label">src</span>
      </div>
      <div class="tree-children"></div>
    `;

    const srcChildren = srcNode.querySelector(".tree-children");

    // Add blueprints section
    if (structure.blueprints.length > 0) {
      const blueprintsNode = document.createElement("div");
      blueprintsNode.className = "tree-item expanded";
      blueprintsNode.innerHTML = `
        <div class="tree-item-header">
          <span class="tree-toggle">▼</span>
          <span class="tree-icon folder"></span>
          <span class="tree-label">blueprints</span>
        </div>
        <div class="tree-children"></div>
      `;

      const blueprintChildren = blueprintsNode.querySelector(".tree-children");

      // Add each blueprint
      structure.blueprints.forEach((blueprint) => {
        const blueprintNode = document.createElement("div");
        blueprintNode.className = "tree-item expanded";
        blueprintNode.innerHTML = `
          <div class="tree-item-header">
            <span class="tree-toggle">▼</span>
            <span class="tree-icon blueprint"></span>
            <span class="tree-label">${blueprint.name}</span>
          </div>
          <div class="tree-children"></div>
        `;

        const viewsContainer = blueprintNode.querySelector(".tree-children");

        // Add blueprint views
        blueprint.views.forEach((view) => {
          const viewNode = document.createElement("div");
          viewNode.className = "tree-item";
          viewNode.dataset.type = "blueprint";
          viewNode.dataset.blueprint = blueprint.name;
          viewNode.dataset.view = view.name;
          viewNode.innerHTML = `
            <div class="tree-item-header">
              <span class="tree-toggle invisible">▶</span>
              <span class="tree-icon blueprint"></span>
              <span class="tree-label">${view.name}</span>
            </div>
          `;

          // Add click handler
          viewNode
            .querySelector(".tree-item-header")
            .addEventListener("click", () => {
              loadBlueprint(blueprint.name, view.name);
            });

          viewsContainer.appendChild(viewNode);
        });

        blueprintChildren.appendChild(blueprintNode);
      });

      srcChildren.appendChild(blueprintsNode);
    }

    // Add components section
    if (structure.components.length > 0) {
      const componentsNode = document.createElement("div");
      componentsNode.className = "tree-item expanded";
      componentsNode.innerHTML = `
        <div class="tree-item-header">
          <span class="tree-toggle">▼</span>
          <span class="tree-icon folder"></span>
          <span class="tree-label">components</span>
        </div>
        <div class="tree-children"></div>
      `;

      const componentChildren = componentsNode.querySelector(".tree-children");

      // Add each component
      structure.components.forEach((component) => {
        const componentNode = document.createElement("div");
        componentNode.className = "tree-item expanded";
        componentNode.innerHTML = `
          <div class="tree-item-header">
            <span class="tree-toggle">▼</span>
            <span class="tree-icon folder"></span>
            <span class="tree-label">${component.name}</span>
          </div>
          <div class="tree-children"></div>
        `;

        const viewsContainer = componentNode.querySelector(".tree-children");

        // Add component views
        component.views.forEach((view) => {
          const viewNode = document.createElement("div");
          viewNode.className = "tree-item";
          viewNode.dataset.type = "component";
          viewNode.dataset.component = component.name;
          viewNode.dataset.view = view.name;
          viewNode.innerHTML = `
            <div class="tree-item-header">
              <span class="tree-toggle invisible">▶</span>
              <span class="tree-icon component"></span>
              <span class="tree-label">${view.name}</span>
            </div>
          `;

          // Add click handler
          viewNode
            .querySelector(".tree-item-header")
            .addEventListener("click", () => {
              loadComponent(component.name, view.name);
            });

          viewsContainer.appendChild(viewNode);
        });

        componentChildren.appendChild(componentNode);
      });

      srcChildren.appendChild(componentsNode);
    }

    // Add controllers section if present
    if (structure.controllers.length > 0) {
      const controllersNode = document.createElement("div");
      controllersNode.className = "tree-item";
      controllersNode.innerHTML = `
        <div class="tree-item-header">
          <span class="tree-toggle">▶</span>
          <span class="tree-icon folder"></span>
          <span class="tree-label">controllers</span>
        </div>
        <div class="tree-children"></div>
      `;

      const controllersContainer =
        controllersNode.querySelector(".tree-children");

      // Add controllers
      structure.controllers.forEach((controller) => {
        const controllerNode = document.createElement("div");
        controllerNode.className = "tree-item";
        controllerNode.dataset.type = "controller";
        controllerNode.dataset.path = controller.path;
        controllerNode.innerHTML = `
          <div class="tree-item-header">
            <span class="tree-toggle invisible">▶</span>
            <span class="tree-icon component"></span>
            <span class="tree-label">${controller.name}.controller</span>
          </div>
        `;

        controllersContainer.appendChild(controllerNode);
      });

      srcChildren.appendChild(controllersNode);
    }

    // Add factories section if present
    if (structure.factories.length > 0) {
      const factoriesNode = document.createElement("div");
      factoriesNode.className = "tree-item";
      factoriesNode.innerHTML = `
        <div class="tree-item-header">
          <span class="tree-toggle">▶</span>
          <span class="tree-icon folder"></span>
          <span class="tree-label">factories</span>
        </div>
        <div class="tree-children"></div>
      `;

      const factoriesContainer = factoriesNode.querySelector(".tree-children");

      // Add factories
      structure.factories.forEach((factory) => {
        const factoryNode = document.createElement("div");
        factoryNode.className = "tree-item";
        factoryNode.dataset.type = "factory";
        factoryNode.dataset.path = factory.path;
        factoryNode.innerHTML = `
          <div class="tree-item-header">
            <span class="tree-toggle invisible">▶</span>
            <span class="tree-icon component"></span>
            <span class="tree-label">${factory.name}.factory</span>
          </div>
        `;

        factoriesContainer.appendChild(factoryNode);
      });

      srcChildren.appendChild(factoriesNode);
    }

    // Add to project tree
    designer.projectTree.appendChild(srcNode);
  }

  /**
   * Load a component into the designer
   * @param {string} componentName - The component name
   * @param {string} viewName - The view name
   */
  async function loadComponent(componentName, viewName) {
    try {
      // Show loading state
      designer.canvas.innerHTML =
        '<div class="loading">Loading component...</div>';

      // Update URL and status
      updateUrl("component", componentName, viewName);
      document.querySelector(
        ".status-item:nth-child(3)"
      ).textContent = `Component: ${componentName}/${viewName}`;

      // Fetch component details
      const response = await fetch(
        `/__asmbl__/designer/api/component/${componentName}/${viewName}`
      );
      if (!response.ok) {
        throw new Error(`Failed to load component: ${response.statusText}`);
      }

      const componentData = await response.json();

      // Create tabs based on available files
      updateTabs(componentData.files);

      // Display component in canvas
      displayComponent(componentName, viewName, componentData);

      console.log(
        `Component ${componentName}/${viewName} loaded successfully`,
        componentData
      );
    } catch (error) {
      console.error(
        `Error loading component ${componentName}/${viewName}:`,
        error
      );
      designer.canvas.innerHTML = `
        <div class="error-message">
          Failed to load component: ${error.message}
          <button id="retry-component-btn">Retry</button>
        </div>
      `;

      // Add retry button handler
      document
        .getElementById("retry-component-btn")
        .addEventListener("click", () => {
          loadComponent(componentName, viewName);
        });
    }
  }

  /**
   * Load a blueprint into the designer
   * @param {string} blueprintName - The blueprint name
   * @param {string} viewName - The view name
   */
  async function loadBlueprint(blueprintName, viewName) {
    try {
      // Show loading state
      designer.canvas.innerHTML =
        '<div class="loading">Loading blueprint...</div>';

      // Update URL and status
      updateUrl("blueprint", blueprintName, viewName);
      document.querySelector(
        ".status-item:nth-child(3)"
      ).textContent = `Blueprint: ${blueprintName}/${viewName}`;

      // Fetch blueprint details
      const response = await fetch(
        `/__asmbl__/designer/api/blueprint/${blueprintName}/${viewName}`
      );
      if (!response.ok) {
        throw new Error(`Failed to load blueprint: ${response.statusText}`);
      }

      const blueprintData = await response.json();

      // Create tabs based on available files
      updateTabs(blueprintData.files);

      // Display blueprint in canvas
      displayBlueprint(blueprintName, viewName, blueprintData);

      console.log(
        `Blueprint ${blueprintName}/${viewName} loaded successfully`,
        blueprintData
      );
    } catch (error) {
      console.error(
        `Error loading blueprint ${blueprintName}/${viewName}:`,
        error
      );
      designer.canvas.innerHTML = `
        <div class="error-message">
          Failed to load blueprint: ${error.message}
          <button id="retry-blueprint-btn">Retry</button>
        </div>
      `;

      // Add retry button handler
      document
        .getElementById("retry-blueprint-btn")
        .addEventListener("click", () => {
          loadBlueprint(blueprintName, viewName);
        });
    }
  }

  /**
   * Update the browser URL without refreshing
   * @param {string} type - The item type (component or blueprint)
   * @param {string} name - The item name
   * @param {string} view - The view name
   */
  function updateUrl(type, name, view) {
    const params = new URLSearchParams();
    if (type === "blueprint") {
      params.set("blueprint", `blueprint-${name}`);
    } else {
      params.set("component", name);
    }
    params.set("view", view);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  }

  /**
   * Update tabs based on available files
   * @param {Object} files - The files object with filenames as keys
   */
  function updateTabs(files) {
    const tabBar = document.querySelector(".tab-bar");
    tabBar.innerHTML = "";

    // Create a tab for each file
    Object.keys(files).forEach((filename, index) => {
      const tab = document.createElement("div");
      tab.className = "tab";
      if (index === 0) tab.classList.add("active");
      tab.textContent = filename;
      tab.dataset.filename = filename;

      // Add click handler
      tab.addEventListener("click", () => {
        // Remove active class from all tabs
        document
          .querySelectorAll(".tab")
          .forEach((t) => t.classList.remove("active"));

        // Add active class to clicked tab
        tab.classList.add("active");

        // TODO: Switch content based on active tab
      });

      tabBar.appendChild(tab);
    });
  }

  /**
   * Display component in the canvas
   * @param {string} componentName - The component name
   * @param {string} viewName - The view name
   * @param {Object} componentData - The component data
   */
  function displayComponent(componentName, viewName, componentData) {
    // Clear canvas
    designer.canvas.innerHTML = "";

    // Create component visualization
    const componentOutline = document.createElement("div");
    componentOutline.className = "component-outline root-component";
    componentOutline.innerHTML = `
      <div class="component-header">
        <span class="component-type">Component: ${componentName}/${viewName}</span>
      </div>
      <div class="component-content">
        <div class="component-preview">
          <!-- Component visualization will go here -->
        </div>
      </div>
    `;

    designer.canvas.appendChild(componentOutline);

    // Set active tab to the first tab
    const firstTab = document.querySelector(".tab");
    if (firstTab) {
      firstTab.click();
    }
  }

  /**
   * Display blueprint in the canvas
   * @param {string} blueprintName - The blueprint name
   * @param {string} viewName - The view name
   * @param {Object} blueprintData - The blueprint data
   */
  function displayBlueprint(blueprintName, viewName, blueprintData) {
    // Clear canvas
    designer.canvas.innerHTML = "";

    // Create blueprint visualization
    const blueprintOutline = document.createElement("div");
    blueprintOutline.className = "component-outline root-component";
    blueprintOutline.innerHTML = `
      <div class="component-header">
        <span class="component-type">Blueprint: ${blueprintName}/${viewName}</span>
      </div>
      <div class="component-content">
        <div class="component-preview">
          <!-- Blueprint visualization will go here -->
        </div>
      </div>
    `;

    designer.canvas.appendChild(blueprintOutline);

    // Set active tab to the first tab
    const firstTab = document.querySelector(".tab");
    if (firstTab) {
      firstTab.click();
    }
  }

  /**
   * Find the component that is the drop target
   * @param {HTMLElement} element - The element under the cursor
   * @returns {HTMLElement|null} - The component outline element or null
   */
  function findDropTarget(element) {
    // Traverse up to find component outline
    while (element && !element.classList.contains("component-outline")) {
      element = element.parentElement;

      // Stop if we reach the canvas
      if (element === designer.canvas) return null;
    }

    return element;
  }

  /**
   * Add a new component to a target component
   * @param {string} componentType - The type of component to add
   * @param {HTMLElement} targetComponent - The target component outline element
   */
  function addComponentToTarget(componentType, targetComponent) {
    // Find the content area of the target component
    const targetContent = targetComponent.querySelector(".component-content");

    if (targetContent) {
      // Create new component outline
      const newComponent = createComponentOutline(componentType);

      // Add to target content
      targetContent.appendChild(newComponent);

      console.log(
        `Added ${componentType} to ${
          targetComponent.querySelector(".component-type").textContent
        }`
      );
    }
  }

  /**
   * Add a new component directly to the canvas
   * @param {string} componentType - The type of component to add
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   */
  function addComponentToCanvas(componentType, x, y) {
    // Create new component outline
    const newComponent = createComponentOutline(componentType);

    // Position at drop location
    newComponent.style.position = "absolute";
    newComponent.style.left = `${x}px`;
    newComponent.style.top = `${y}px`;

    // Add to canvas
    designer.canvas.appendChild(newComponent);

    console.log(`Added ${componentType} directly to canvas`);
  }

  /**
   * Create a new component outline element
   * @param {string} componentType - The type of component to create
   * @returns {HTMLElement} - The new component outline element
   */
  function createComponentOutline(componentType) {
    const outline = document.createElement("div");
    outline.className = "component-outline";

    // Create component header
    const header = document.createElement("div");
    header.className = "component-header";

    const typeSpan = document.createElement("span");
    typeSpan.className = "component-type";
    typeSpan.textContent = componentType;

    header.appendChild(typeSpan);
    outline.appendChild(header);

    // Create component content
    const content = document.createElement("div");
    content.className = "component-content";
    outline.appendChild(content);

    return outline;
  }
});
