/**
 * AssembleJS Development Panel Script
 * This script controls the behavior of the development panel
 */
(function () {
  /**
   * Sets up additional developer tools in the panel
   * This function is now empty as we've simplified the panel to only have
   * "Open Designer" and "Clear Cache" buttons
   * @private
   */
  function setupDevToolButtons() {
    // No additional buttons needed - all buttons are defined in the HTML
  }

  /**
   * Initialize panel
   * @private
   */
  function initPanel() {
    const panel = document.getElementById("__assemblejs_dev_panel__");
    const header = document.getElementById("__assemblejs_dev_panel_header__");
    const closeButton = document.getElementById(
      "__assemblejs_dev_panel_close__"
    );
    const themeToggle = document.getElementById("theme-toggle");

    // Restore panel state from localStorage
    restorePanelState();

    // Toggle panel with close button
    closeButton.addEventListener("click", () => {
      togglePanel();
    });

    // Toggle panel when clicking on header
    header.addEventListener("click", (e) => {
      // Don't close when clicking theme toggle or other controls in header
      if (
        e.target === header ||
        e.target.closest("#__assemblejs_dev_panel_title__")
      ) {
        togglePanel();
      }
    });

    // Initialize theme based on browser preference or stored preference
    initTheme();

    // Handle keyboard shortcut (Alt+D)
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.key.toLowerCase() === "d") {
        togglePanel();
        e.preventDefault(); // Prevent default browser behavior
      }
    });

    // Get component information
    const blueprintId = document.getElementById(
      "__assemblejs_dev_panel_blueprint_id__"
    ).textContent;
    const componentName = document.getElementById(
      "__assemblejs_dev_panel_component_name__"
    ).textContent;
    const viewName = document.getElementById(
      "__assemblejs_dev_panel_view_name__"
    ).textContent;

    // Handle designer button click
    document
      .getElementById("__assemblejs_dev_panel_open_designer__")
      .addEventListener("click", () => {
        // Get component information for focused view in designer
        const componentName = document.getElementById(
          "__assemblejs_dev_panel_component_name__"
        ).textContent;
        const viewName = document.getElementById(
          "__assemblejs_dev_panel_view_name__"
        ).textContent;

        // Build the URL with query parameters to focus on current component
        const url = `/__asmbl__/designer?component=${encodeURIComponent(
          componentName
        )}&view=${encodeURIComponent(viewName)}`;

        // Open designer in new tab
        window.open(url, "_blank");
      });

    // Reload button has been removed

    // Handle clear cache button
    document
      .getElementById("__assemblejs_dev_panel_clear_cache__")
      .addEventListener("click", () => {
        // Keep panel state and position before clearing
        const panelState = localStorage.getItem("__assemblejs_dev_panel_open");
        const buttonPosition = localStorage.getItem(
          "__assemblejs_dev_panel_button_position"
        );
        const themePreference = localStorage.getItem(
          "__assemblejs_dev_panel_theme"
        );

        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach(function (c) {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/"
            );
        });

        // Restore panel settings
        localStorage.setItem("__assemblejs_dev_panel_open", panelState);
        localStorage.setItem(
          "__assemblejs_dev_panel_button_position",
          buttonPosition
        );
        localStorage.setItem("__assemblejs_dev_panel_theme", themePreference);

        // Reload the page
        window.location.reload();
      });

    // Handle theme toggle
    themeToggle.addEventListener("change", () => {
      toggleTheme();
    });

    // Setup browser dev tool buttons
    setupDevToolButtons();
  }

  /**
   * Open the panel to show content
   * @private
   */
  function openPanel() {
    const panel = document.getElementById("__assemblejs_dev_panel__");
    const closeButton = document.getElementById("__assemblejs_dev_panel_close__");
    
    panel.classList.add("open");
    // Update arrow direction to point down
    closeButton.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;
    localStorage.setItem("__assemblejs_dev_panel_open", "true");
  }

  /**
   * Close the panel to show only header
   * @private
   */
  function closePanel() {
    const panel = document.getElementById("__assemblejs_dev_panel__");
    const closeButton = document.getElementById("__assemblejs_dev_panel_close__");
    
    panel.classList.remove("open");
    // Update arrow direction to point up
    closeButton.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    `;
    localStorage.setItem("__assemblejs_dev_panel_open", "false");
  }

  /**
   * Toggle panel open/closed state
   * @private
   */
  function togglePanel() {
    const isOpen = document
      .getElementById("__assemblejs_dev_panel__")
      .classList.contains("open");

    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  /**
   * Initialize theme based on browser preference or stored preference
   * @private
   */
  function initTheme() {
    const themeToggle = document.getElementById("theme-toggle");

    // Check for saved preference
    const savedTheme = localStorage.getItem("__assemblejs_dev_panel_theme");

    if (savedTheme) {
      // Apply saved preference
      if (savedTheme === "light") {
        document.documentElement.classList.add("light-theme");
        themeToggle.checked = true;
      } else {
        document.documentElement.classList.remove("light-theme");
        themeToggle.checked = false;
      }
    } else {
      // Check for system preference
      const prefersDarkScheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      if (prefersDarkScheme.matches) {
        // System prefers dark mode
        document.documentElement.classList.remove("light-theme");
        themeToggle.checked = false;
        localStorage.setItem("__assemblejs_dev_panel_theme", "dark");
      } else {
        // System prefers light mode
        document.documentElement.classList.add("light-theme");
        themeToggle.checked = true;
        localStorage.setItem("__assemblejs_dev_panel_theme", "light");
      }
    }

    // Watch for system theme changes
    try {
      const darkModeMediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );
      // Use the appropriate event listener method based on browser support
      if (darkModeMediaQuery.addEventListener) {
        darkModeMediaQuery.addEventListener("change", (event) => {
          if (!localStorage.getItem("__assemblejs_dev_panel_theme")) {
            // Only auto-switch if the user hasn't set a preference
            const newTheme = event.matches ? "dark" : "light";
            if (newTheme === "dark") {
              document.documentElement.classList.remove("light-theme");
              themeToggle.checked = false;
            } else {
              document.documentElement.classList.add("light-theme");
              themeToggle.checked = true;
            }
          }
        });
      } else if (darkModeMediaQuery.addListener) {
        // Fallback for older browsers
        darkModeMediaQuery.addListener((event) => {
          if (!localStorage.getItem("__assemblejs_dev_panel_theme")) {
            // Only auto-switch if the user hasn't set a preference
            const newTheme = event.matches ? "dark" : "light";
            if (newTheme === "dark") {
              document.documentElement.classList.remove("light-theme");
              themeToggle.checked = false;
            } else {
              document.documentElement.classList.add("light-theme");
              themeToggle.checked = true;
            }
          }
        });
      }
    } catch (err) {
      console.warn("Error setting up theme change listener:", err);
    }
  }

  /**
   * Toggle between light and dark themes
   * @private
   */
  function toggleTheme() {
    const themeToggle = document.getElementById("theme-toggle");

    if (themeToggle.checked) {
      // Switch to light theme
      document.documentElement.classList.add("light-theme");
      localStorage.setItem("__assemblejs_dev_panel_theme", "light");
    } else {
      // Switch to dark theme
      document.documentElement.classList.remove("light-theme");
      localStorage.setItem("__assemblejs_dev_panel_theme", "dark");
    }
  }

  /**
   * Makes an element draggable within the viewport
   * Handles mouse events and touch events for mobile support
   * @param {HTMLElement} element - The element to make draggable
   * @private
   */
  function makeDraggable(element) {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    // Support both mouse and touch events for better mobile experience
    element.addEventListener("mousedown", dragMouseDown);
    element.addEventListener("touchstart", dragTouchStart, { passive: false });

    function dragMouseDown(e) {
      e.preventDefault();
      // Get the mouse cursor position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;

      element.classList.add("dragging");

      // Call functions on mouse move and mouse up
      document.addEventListener("mousemove", elementDrag);
      document.addEventListener("mouseup", closeDragElement);
    }

    function dragTouchStart(e) {
      e.preventDefault();
      // Get the touch position at startup
      if (e.touches && e.touches.length === 1) {
        pos3 = e.touches[0].clientX;
        pos4 = e.touches[0].clientY;

        element.classList.add("dragging");

        // Call functions on touch move and touch end
        document.addEventListener("touchmove", elementTouchDrag, {
          passive: false,
        });
        document.addEventListener("touchend", closeTouchDragElement);
      }
    }

    function updateElementPosition(clientX, clientY) {
      // Calculate the new cursor position
      pos1 = pos3 - clientX;
      pos2 = pos4 - clientY;
      pos3 = clientX;
      pos4 = clientY;

      // Set the element's new position, keeping it within viewport bounds
      const rect = element.getBoundingClientRect();
      const newTop = Math.max(
        0,
        Math.min(window.innerHeight - rect.height, element.offsetTop - pos2)
      );
      const newLeft = Math.max(
        0,
        Math.min(window.innerWidth - rect.width, element.offsetLeft - pos1)
      );

      element.style.top = newTop + "px";
      element.style.left = newLeft + "px";
      element.style.bottom = "auto";
      element.style.right = "auto";

      // Save position to localStorage
      const position = {
        top: newTop,
        left: newLeft,
      };

      try {
        localStorage.setItem(
          "__assemblejs_dev_panel_button_position",
          JSON.stringify(position)
        );
      } catch (err) {
        console.warn("Failed to save button position to localStorage:", err);
      }
    }

    function elementDrag(e) {
      e.preventDefault();
      updateElementPosition(e.clientX, e.clientY);
    }

    function elementTouchDrag(e) {
      e.preventDefault();
      if (e.touches && e.touches.length === 1) {
        updateElementPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    }

    function closeDragElement() {
      // Stop moving when mouse button is released
      element.classList.remove("dragging");
      document.removeEventListener("mousemove", elementDrag);
      document.removeEventListener("mouseup", closeDragElement);
    }

    function closeTouchDragElement() {
      // Stop moving when touch ends
      element.classList.remove("dragging");
      document.removeEventListener("touchmove", elementTouchDrag);
      document.removeEventListener("touchend", closeTouchDragElement);
    }
  }

  /**
   * Restore floating button position from localStorage
   * @private
   */
  function restoreButtonPosition() {
    const floatButton = document.getElementById(
      "__assemblejs_dev_panel_float_button__"
    );

    try {
      const positionString = localStorage.getItem(
        "__assemblejs_dev_panel_button_position"
      );

      if (positionString) {
        const position = JSON.parse(positionString);

        // Apply saved position with bounds checking
        if (position.top !== undefined && position.left !== undefined) {
          // Check that the position is still within viewport
          const rect = floatButton.getBoundingClientRect();
          const newTop = Math.max(
            0,
            Math.min(window.innerHeight - rect.height, position.top)
          );
          const newLeft = Math.max(
            0,
            Math.min(window.innerWidth - rect.width, position.left)
          );

          floatButton.style.top = newTop + "px";
          floatButton.style.left = newLeft + "px";
          floatButton.style.bottom = "auto";
          floatButton.style.right = "auto";
        }
      }
    } catch (e) {
      console.error("Error restoring button position:", e);
    }
  }

  /**
   * Restore panel state from localStorage
   * @private
   */
  function restorePanelState() {
    try {
      const panelState = localStorage.getItem("__assemblejs_dev_panel_open");

      if (panelState === "true") {
        openPanel();
      } else {
        closePanel();
      }
    } catch (err) {
      console.warn("Error restoring panel state:", err);
      closePanel(); // Default to closed
    }
  }

  /**
   * Safely initialize the panel when the DOM is ready
   * Uses a try-catch block to prevent any issues from breaking the page
   * @private
   */
  function safeInit() {
    try {
      initPanel();
    } catch (err) {
      console.error("Error initializing AssembleJS dev panel:", err);
      // Show error in console but don't attempt to show floating button
    }
  }

  // Initialize when DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeInit);
  } else {
    safeInit();
  }
})();
