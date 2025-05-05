import VectorDB from "../modules/vectordb.js";

// Initialize the Collections view
function initCollectionsView() {
  // This function will be implemented when we add the collections view
  console.log("Collections view initialized");

  // Load collections initially
  loadCollections();
}

// Load collections from the vector database
async function loadCollections() {
  try {
    // Get collections view container
    const collectionsView = document.getElementById("collections-view");
    if (!collectionsView) return;

    // Show loading state
    collectionsView.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading collections...</p>
            </div>
        `;

    // Fetch collections from API
    const collections = await VectorDB.listCollections();

    // Check if we have collections
    if (collections.length === 0) {
      collectionsView.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <div class="empty-state-text">No collections found</div>
                    <button id="create-collection-btn" class="primary-button">Create Collection</button>
                </div>
            `;

      // Add event listener for create button
      const createBtn = collectionsView.querySelector("#create-collection-btn");
      if (createBtn) {
        createBtn.addEventListener("click", () => {
          showCreateCollectionModal();
        });
      }

      return;
    }

    // Render collections
    collectionsView.innerHTML = `
            <div class="collections-header">
                <h2>Vector Collections</h2>
                <button id="create-collection-btn" class="primary-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"></path>
                    </svg>
                    New Collection
                </button>
            </div>
            
            <div class="collections-list">
                ${collections
                  .map(
                    (collection) => `
                    <div class="collection-item">
                        <div class="collection-name">${collection.name}</div>
                        <div class="collection-stats">${
                          collection.count || 0
                        } documents</div>
                        <div class="collection-actions">
                            <button class="secondary-button view-collection-btn" data-collection="${
                              collection.name
                            }">View</button>
                            <button class="secondary-button delete-collection-btn" data-collection="${
                              collection.name
                            }">Delete</button>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `;

    // Add event listeners
    const createBtn = collectionsView.querySelector("#create-collection-btn");
    if (createBtn) {
      createBtn.addEventListener("click", () => {
        showCreateCollectionModal();
      });
    }

    // Add event listeners for view and delete buttons
    const viewButtons = collectionsView.querySelectorAll(
      ".view-collection-btn"
    );
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const collectionName = btn.getAttribute("data-collection");
        viewCollection(collectionName);
      });
    });

    const deleteButtons = collectionsView.querySelectorAll(
      ".delete-collection-btn"
    );
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const collectionName = btn.getAttribute("data-collection");
        deleteCollection(collectionName);
      });
    });
  } catch (error) {
    console.error("Error loading collections:", error);

    const collectionsView = document.getElementById("collections-view");
    if (collectionsView) {
      collectionsView.innerHTML = `
                <div class="error-state">
                    <div class="error-state-icon">❌</div>
                    <div class="error-state-text">Error loading collections: ${error.message}</div>
                    <button onclick="loadCollections()" class="secondary-button">Retry</button>
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

    if (!name) {
      nameInput.classList.add("error");
      return;
    }

    try {
      // Show loading state
      createBtn.disabled = true;
      createBtn.innerHTML = '<div class="spinner-small"></div> Creating...';

      // Create collection
      await VectorDB.createCollection(name);

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

export { initCollectionsView, loadCollections };
