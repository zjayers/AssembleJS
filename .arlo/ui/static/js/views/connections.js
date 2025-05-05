// Initialize the Connections view
function initConnectionsView() {
  console.log("Connections view initialized");

  const connectionsView = document.getElementById("connections-view");
  if (!connectionsView) return;

  // Render initial connections view
  connectionsView.innerHTML = `
        <div class="connections-header">
            <h2>System Connections</h2>
            <button id="add-connection-btn" class="primary-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"></path>
                </svg>
                New Connection
            </button>
        </div>
        
        <div class="connections-cards">
            <!-- GitHub Connection -->
            <div class="connection-card">
                <div class="connection-card-header">
                    <div class="connection-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.455-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.022A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.291 2.747-1.022 2.747-1.022.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="connection-name">GitHub</div>
                    <div class="connection-status connected">Connected</div>
                </div>
                <div class="connection-card-body">
                    <div class="connection-details">
                        <div class="connection-detail-item">
                            <div class="connection-detail-label">Repository</div>
                            <div class="connection-detail-value">assemblejs/assemblejs</div>
                        </div>
                        <div class="connection-detail-item">
                            <div class="connection-detail-label">Branch</div>
                            <div class="connection-detail-value">main</div>
                        </div>
                        <div class="connection-detail-item">
                            <div class="connection-detail-label">Last Sync</div>
                            <div class="connection-detail-value">10 minutes ago</div>
                        </div>
                    </div>
                </div>
                <div class="connection-card-footer">
                    <button class="secondary-button">Edit</button>
                    <button class="secondary-button">Refresh</button>
                    <button class="secondary-button">Disconnect</button>
                </div>
            </div>
            
            <!-- Vector Database Connection -->
            <div class="connection-card">
                <div class="connection-card-header">
                    <div class="connection-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M4 5v14h16V5H4zm14 2v10H6V7h12zM7 9h10v1H7V9zm0 2h10v1H7v-1zm0 2h10v1H7v-1z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="connection-name">Vector Database</div>
                    <div class="connection-status connected">Connected</div>
                </div>
                <div class="connection-card-body">
                    <div class="connection-details">
                        <div class="connection-detail-item">
                            <div class="connection-detail-label">Provider</div>
                            <div class="connection-detail-value">ChromaDB</div>
                        </div>
                        <div class="connection-detail-item">
                            <div class="connection-detail-label">Collections</div>
                            <div class="connection-detail-value">16</div>
                        </div>
                        <div class="connection-detail-item">
                            <div class="connection-detail-label">Status</div>
                            <div class="connection-detail-value">Healthy</div>
                        </div>
                    </div>
                </div>
                <div class="connection-card-footer">
                    <button class="secondary-button">Edit</button>
                    <button class="secondary-button">Check Status</button>
                    <button class="secondary-button">Disconnect</button>
                </div>
            </div>
            
            <!-- Add New Connection Card -->
            <div class="connection-card add-connection">
                <div class="add-connection-content">
                    <div class="add-connection-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                    </div>
                    <div class="add-connection-text">Add Connection</div>
                </div>
            </div>
        </div>
        
        <div class="connections-grid">
            <h3>Connection History</h3>
            <table class="connections-table">
                <thead>
                    <tr>
                        <th>Connection</th>
                        <th>Action</th>
                        <th>Status</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>GitHub</td>
                        <td>Repository sync</td>
                        <td>Success</td>
                        <td>10 minutes ago</td>
                    </tr>
                    <tr>
                        <td>Vector Database</td>
                        <td>Collection update</td>
                        <td>Success</td>
                        <td>25 minutes ago</td>
                    </tr>
                    <tr>
                        <td>GitHub</td>
                        <td>PR creation</td>
                        <td>Success</td>
                        <td>1 hour ago</td>
                    </tr>
                    <tr>
                        <td>Vector Database</td>
                        <td>Knowledge ingestion</td>
                        <td>Success</td>
                        <td>2 hours ago</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

  // Add event listener for add connection button
  const addConnectionBtn = connectionsView.querySelector("#add-connection-btn");
  const addConnectionCard = connectionsView.querySelector(".add-connection");

  if (addConnectionBtn) {
    addConnectionBtn.addEventListener("click", showAddConnectionModal);
  }

  if (addConnectionCard) {
    addConnectionCard.addEventListener("click", showAddConnectionModal);
  }
}

// Show modal to add a new connection
function showAddConnectionModal() {
  // Create modal element
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Connection</h3>
                <button class="modal-close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="connection-types">
                    <div class="connection-type-item selected" data-type="github">
                        <div class="connection-type-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.455-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.022A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.291 2.747-1.022 2.747-1.022.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="connection-type-name">GitHub</div>
                    </div>
                    <div class="connection-type-item" data-type="vector-db">
                        <div class="connection-type-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path d="M4 5v14h16V5H4zm14 2v10H6V7h12zM7 9h10v1H7V9zm0 2h10v1H7v-1zm0 2h10v1H7v-1z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="connection-type-name">Vector Database</div>
                    </div>
                    <div class="connection-type-item" data-type="api">
                        <div class="connection-type-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 3v3h3v2h-3v3h-2v-3H8v-2h3V7h2z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="connection-type-name">API</div>
                    </div>
                </div>
                
                <div class="connection-config" id="github-config">
                    <div class="form-group">
                        <label for="github-repo">Repository URL</label>
                        <input type="text" id="github-repo" placeholder="https://github.com/username/repo">
                    </div>
                    <div class="form-group">
                        <label for="github-branch">Branch</label>
                        <input type="text" id="github-branch" placeholder="main">
                    </div>
                    <div class="form-group">
                        <label for="github-token">Access Token</label>
                        <input type="password" id="github-token" placeholder="GitHub access token">
                    </div>
                </div>
                
                <div class="connection-config" id="vector-db-config" style="display: none;">
                    <div class="form-group">
                        <label for="vector-db-type">Database Type</label>
                        <select id="vector-db-type">
                            <option value="chroma">ChromaDB</option>
                            <option value="pinecone">Pinecone</option>
                            <option value="qdrant">Qdrant</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="vector-db-url">Connection URL</label>
                        <input type="text" id="vector-db-url" placeholder="http://localhost:8000">
                    </div>
                    <div class="form-group">
                        <label for="vector-db-key">API Key</label>
                        <input type="password" id="vector-db-key" placeholder="API key (if required)">
                    </div>
                </div>
                
                <div class="connection-config" id="api-config" style="display: none;">
                    <div class="form-group">
                        <label for="api-name">API Name</label>
                        <input type="text" id="api-name" placeholder="My API">
                    </div>
                    <div class="form-group">
                        <label for="api-url">Base URL</label>
                        <input type="text" id="api-url" placeholder="https://api.example.com">
                    </div>
                    <div class="form-group">
                        <label for="api-auth-type">Authentication Type</label>
                        <select id="api-auth-type">
                            <option value="none">None</option>
                            <option value="api-key">API Key</option>
                            <option value="oauth">OAuth</option>
                            <option value="basic">Basic Auth</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="api-key">API Key</label>
                        <input type="password" id="api-key" placeholder="API key (if required)">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="secondary-button modal-cancel-btn">Cancel</button>
                <button class="primary-button" id="add-connection-confirm-btn">Add Connection</button>
            </div>
        </div>
    `;

  // Add the modal to the document
  document.body.appendChild(modal);

  // Handle connection type selection
  const connectionTypes = modal.querySelectorAll(".connection-type-item");
  const configDivs = modal.querySelectorAll(".connection-config");

  connectionTypes.forEach((item) => {
    item.addEventListener("click", () => {
      // Update selection
      connectionTypes.forEach((t) => t.classList.remove("selected"));
      item.classList.add("selected");

      // Show corresponding config
      const type = item.getAttribute("data-type");
      configDivs.forEach((div) => {
        div.style.display = "none";
      });

      const configDiv = modal.querySelector(`#${type}-config`);
      if (configDiv) {
        configDiv.style.display = "block";
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

  // Handle add connection
  const addBtn = modal.querySelector("#add-connection-confirm-btn");
  addBtn.addEventListener("click", () => {
    const selectedType = modal.querySelector(".connection-type-item.selected");
    if (!selectedType) return;

    const type = selectedType.getAttribute("data-type");

    // In a real application, we would validate and save the connection
    // For this demo, we'll just close the modal and show a notification

    // Create notification
    const notification = document.createElement("div");
    notification.className = "notification success";
    notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">Connection Added</div>
                <div class="notification-message">Successfully added new ${type} connection</div>
            </div>
            <button class="notification-close">&times;</button>
        `;

    // Add to document
    document.body.appendChild(notification);

    // Remove after delay
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);

    // Add close button functionality
    const notifCloseBtn = notification.querySelector(".notification-close");
    if (notifCloseBtn) {
      notifCloseBtn.addEventListener("click", () => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      });
    }

    // Close modal
    closeModal();
  });
}

export { initConnectionsView };
