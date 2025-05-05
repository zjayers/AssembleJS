// Helper function to add log actions to all log viewers
export function setupLogActions() {
  const logViewers = document.querySelectorAll(".log-viewer");
  logViewers.forEach((logViewer) => {
    // Skip if actions are already added
    if (logViewer.querySelector(".log-actions")) return;

    // Create actions container
    const logActions = document.createElement("div");
    logActions.className = "log-actions";

    // Create fullscreen button
    const fullscreenButton = document.createElement("div");
    fullscreenButton.className = "log-action-button fullscreen-button";
    fullscreenButton.title = "Expand to fullscreen";
    fullscreenButton.setAttribute("data-message", "Expand to fullscreen");
    fullscreenButton.innerHTML =
      '<svg class="log-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';

    // Create copy button
    const copyButton = document.createElement("div");
    copyButton.className = "log-action-button copy-button";
    copyButton.title = "Copy log content";
    copyButton.setAttribute("data-message", "Copy log content");
    copyButton.innerHTML =
      '<svg class="log-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

    // Add buttons to actions container
    logActions.appendChild(fullscreenButton);
    logActions.appendChild(copyButton);

    // Add actions to log viewer
    logViewer.appendChild(logActions);

    // Setup fullscreen functionality
    fullscreenButton.addEventListener("click", () => {
      const fullscreenContainer = document.createElement("div");
      fullscreenContainer.className = "fullscreen-log";

      // Add title to fullscreen view
      const logTitle = document.createElement("div");
      logTitle.className = "log-title";

      // Get the title from context
      let titleText = "Log Viewer";
      // Try to find nearby header or task title for context
      const nearestHeader = logViewer.closest('div[class*="header"]');
      if (nearestHeader) {
        const headerTitle = nearestHeader.querySelector("h3");
        if (headerTitle) {
          titleText = headerTitle.textContent;
        }
      }
      // Check for task context
      const taskTitle = document.querySelector(".task-detail-title");
      if (taskTitle) {
        titleText += " - " + taskTitle.textContent;
      }

      logTitle.textContent = titleText;
      fullscreenContainer.appendChild(logTitle);

      // Clone the log viewer - need to use deep clone to get all content
      const fullscreenLogViewer = logViewer.cloneNode(true);

      // Set up a sync mechanism to keep the fullscreen log updated with the original
      const syncLogs = () => {
        // Create a new div to hold log content (without actions)
        const newLogContent = document.createElement("div");
        newLogContent.className = "log-content-container";

        // Copy all log lines from original
        Array.from(logViewer.childNodes).forEach((node) => {
          if (!node.classList || !node.classList.contains("log-actions")) {
            const clone = node.cloneNode(true);
            newLogContent.appendChild(clone);
          }
        });

        // Find existing content container or create reference point
        const existingContent = fullscreenLogViewer.querySelector(
          ".log-content-container"
        );
        const actionsElement =
          fullscreenLogViewer.querySelector(".log-actions");

        // Replace or insert content
        if (existingContent) {
          fullscreenLogViewer.replaceChild(newLogContent, existingContent);
        } else {
          // Remove all non-action nodes
          Array.from(fullscreenLogViewer.childNodes).forEach((node) => {
            if (!node.classList || !node.classList.contains("log-actions")) {
              fullscreenLogViewer.removeChild(node);
            }
          });

          // Insert new content before actions
          fullscreenLogViewer.insertBefore(newLogContent, actionsElement);
        }

        // Auto-scroll to bottom if user was already at bottom
        const isAtBottom =
          fullscreenLogViewer.scrollHeight - fullscreenLogViewer.clientHeight <=
          fullscreenLogViewer.scrollTop + 50; // 50px threshold

        if (isAtBottom) {
          fullscreenLogViewer.scrollTop = fullscreenLogViewer.scrollHeight;
        }
      };

      // Do initial sync
      syncLogs();

      // Set up periodic sync at shorter intervals for more responsive updates
      const syncInterval = setInterval(syncLogs, 1000);

      // Also set up a MutationObserver to detect changes in the original log
      const logObserver = new MutationObserver(() => {
        // Sync immediately when changes are detected
        syncLogs();
      });

      // Start observing the original log viewer
      logObserver.observe(logViewer, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      fullscreenContainer.appendChild(fullscreenLogViewer);

      // Replace fullscreen button with exit button
      const exitButton =
        fullscreenLogViewer.querySelector(".fullscreen-button");
      exitButton.title = "Exit fullscreen";
      exitButton.setAttribute("data-message", "Exit fullscreen");
      exitButton.innerHTML =
        '<svg class="log-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>';

      // Add exit functionality
      exitButton.addEventListener("click", () => {
        clearInterval(syncInterval); // Stop interval syncing
        logObserver.disconnect(); // Stop observer syncing
        document.body.removeChild(fullscreenContainer);
      });

      // Update copy button functionality for the fullscreen view
      const fullscreenCopyButton =
        fullscreenLogViewer.querySelector(".copy-button");
      fullscreenCopyButton.addEventListener("click", () => {
        const content = fullscreenLogViewer.textContent;
        navigator.clipboard.writeText(content).then(() => {
          fullscreenCopyButton.setAttribute("data-message", "Copied!");
          fullscreenCopyButton.classList.add("show-message");
          setTimeout(() => {
            fullscreenCopyButton.classList.remove("show-message");
            setTimeout(() => {
              fullscreenCopyButton.setAttribute(
                "data-message",
                "Copy log content"
              );
            }, 300);
          }, 2000);
        });
      });

      document.body.appendChild(fullscreenContainer);
    });

    // Setup copy functionality
    copyButton.addEventListener("click", () => {
      const content = logViewer.textContent;
      navigator.clipboard.writeText(content).then(() => {
        copyButton.setAttribute("data-message", "Copied!");
        copyButton.classList.add("show-message");
        setTimeout(() => {
          copyButton.classList.remove("show-message");
          setTimeout(() => {
            copyButton.setAttribute("data-message", "Copy log content");
          }, 300);
        }, 2000);
      });
    });
  });
}
