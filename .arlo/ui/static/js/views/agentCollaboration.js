/**
 * Agent Collaboration View
 * Handles the UI for agent messaging, collaboration, and team management
 */
import { makeRequest } from "../utils/api.js";
import { formatDate } from "../utils/formatters.js";
import EventEmitter from "../utils/eventEmitter.js";

class AgentCollaborationView {
  constructor() {
    this.eventEmitter = new EventEmitter();
    this.currentAgent = null;
    this.selectedRecipient = null;
    this.selectedTeam = null;
    this.selectedCollaboration = null;
    this.recentAgents = [];
    this.teams = [];
    this.allAgents = [];
    this.collaborations = [];
    this.collaborationFilter = "all";
    this.suggestedTeam = null;
    this.skillsList = [];

    this.init();
  }

  /**
   * Initialize the collaboration view
   */
  init() {
    // When an agent is selected in the sidebar
    document.addEventListener("agent:selected", async (e) => {
      this.currentAgent = e.detail.agentId;
      this.loadCollaborations();
      this.loadTeams();
      this.fetchAllAgents();
    });

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Set up event handlers for UI interaction
   */
  setupEventHandlers() {
    // Refresh collaborations button
    const refreshBtn = document.getElementById("collaboration-refresh");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.loadCollaborations());
    }

    // Filter collaborations
    const filterSelect = document.getElementById("collaboration-filter");
    if (filterSelect) {
      filterSelect.addEventListener("change", () => {
        this.collaborationFilter = filterSelect.value;
        this.renderCollaborations();
      });
    }

    // Send message button
    const sendBtn = document.getElementById("send-message");
    if (sendBtn) {
      sendBtn.addEventListener("click", () => this.sendMessage());
    }

    // Message content input
    const messageContent = document.getElementById("message-content");
    if (messageContent) {
      messageContent.addEventListener("input", () => {
        // Enable send button only if we have a recipient and content
        const sendBtn = document.getElementById("send-message");
        if (sendBtn) {
          sendBtn.disabled =
            !this.selectedRecipient || !messageContent.value.trim();
        }
      });
    }

    // New team button
    const newTeamBtn = document.getElementById("new-team-btn");
    if (newTeamBtn) {
      newTeamBtn.addEventListener("click", () => this.showNewTeamModal());
    }

    // Modal close buttons
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Find the closest modal parent
        const modal = e.target.closest(".modal");
        if (modal) {
          modal.style.display = "none";
        }
      });
    });

    // New team form submission
    const newTeamForm = document.getElementById("new-team-form");
    if (newTeamForm) {
      newTeamForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.createNewTeam();
      });
    }

    // Team suggestion controls
    const complexitySlider = document.getElementById("task-complexity");
    if (complexitySlider) {
      complexitySlider.addEventListener("input", () => {
        document.getElementById("complexity-value").textContent =
          complexitySlider.value;
      });
    }

    const urgencySlider = document.getElementById("task-urgency");
    if (urgencySlider) {
      urgencySlider.addEventListener("input", () => {
        document.getElementById("urgency-value").textContent =
          urgencySlider.value;
      });
    }

    // Skills input
    const skillsInput = document.getElementById("skills-input");
    if (skillsInput) {
      skillsInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault();

          const skill = skillsInput.value.trim();
          if (skill && !this.skillsList.includes(skill)) {
            this.skillsList.push(skill);
            this.renderSkills();
            skillsInput.value = "";
          }
        }
      });
    }

    // Get suggestion button
    const getSuggestionBtn = document.getElementById("get-suggestion");
    if (getSuggestionBtn) {
      getSuggestionBtn.addEventListener("click", () =>
        this.getTeamSuggestion()
      );
    }

    // Create suggested team button
    const createSuggestedBtn = document.getElementById("create-suggested-team");
    if (createSuggestedBtn) {
      createSuggestedBtn.addEventListener("click", () =>
        this.createSuggestedTeam()
      );
    }

    // Window click to close modals when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });
  }

  /**
   * Load collaborations for the current agent
   */
  async loadCollaborations() {
    if (!this.currentAgent) return;

    try {
      const response = await makeRequest(
        `/agent/${this.currentAgent}/collaborations`
      );

      if (response && response.success) {
        this.collaborations = response.data;
        this.renderCollaborations();
        this.updateRecentAgents();
      }
    } catch (error) {
      console.error("Error loading collaborations:", error);
      this.showError("Failed to load collaborations");
    }
  }

  /**
   * Load teams for the current agent
   */
  async loadTeams() {
    if (!this.currentAgent) return;

    try {
      const response = await makeRequest(`/agent/${this.currentAgent}/teams`);

      if (response && response.success) {
        this.teams = response.data;
        this.renderTeams();
      }
    } catch (error) {
      console.error("Error loading teams:", error);
      this.showError("Failed to load teams");
    }
  }

  /**
   * Fetch all available agents for collaboration
   */
  async fetchAllAgents() {
    try {
      const response = await makeRequest("/agent");

      if (response) {
        this.allAgents = response.filter(
          (agent) => agent.id !== this.currentAgent
        );
        // No need to render anything yet, this data will be used in modals
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  }

  /**
   * Update the list of recent collaborators based on message history
   */
  updateRecentAgents() {
    const agentIds = new Set();
    const recentAgents = [];

    // Extract unique agents from collaborations
    this.collaborations.forEach((collab) => {
      if (
        collab.fromAgent !== this.currentAgent &&
        !agentIds.has(collab.fromAgent)
      ) {
        agentIds.add(collab.fromAgent);
        recentAgents.push({
          id: collab.fromAgent,
          name: this.getAgentNameById(collab.fromAgent),
          role: this.getAgentRoleById(collab.fromAgent),
        });
      }

      if (
        collab.toAgent !== this.currentAgent &&
        collab.toAgent &&
        !agentIds.has(collab.toAgent)
      ) {
        agentIds.add(collab.toAgent);
        recentAgents.push({
          id: collab.toAgent,
          name: this.getAgentNameById(collab.toAgent),
          role: this.getAgentRoleById(collab.toAgent),
        });
      }
    });

    // Limit to most recent 5 agents
    this.recentAgents = recentAgents.slice(0, 5);
    this.renderRecentAgents();
  }

  /**
   * Render the list of recent collaborators
   */
  renderRecentAgents() {
    const container = document.getElementById("recent-collaborators");
    if (!container) return;

    if (this.recentAgents.length === 0) {
      container.innerHTML =
        '<div class="empty-message">No recent collaborators</div>';
      return;
    }

    const html = this.recentAgents
      .map(
        (agent) => `
      <div class="agent-item" data-agent-id="${agent.id}">
        <div class="agent-avatar" style="background-color: ${this.getAgentColor(
          agent.id
        )}">
          ${agent.name.charAt(0)}
        </div>
        <div class="agent-info">
          <div class="agent-name">${agent.name}</div>
          <div class="agent-role">${agent.role || "Agent"}</div>
        </div>
        <div class="agent-status active"></div>
      </div>
    `
      )
      .join("");

    container.innerHTML = html;

    // Add click handlers for agent selection
    container.querySelectorAll(".agent-item").forEach((item) => {
      item.addEventListener("click", () => {
        const agentId = item.dataset.agentId;
        this.selectRecipient(agentId);
      });
    });
  }

  /**
   * Render the list of teams
   */
  renderTeams() {
    const container = document.getElementById("agent-teams");
    if (!container) return;

    if (this.teams.length === 0) {
      container.innerHTML = '<div class="empty-message">No teams</div>';
      return;
    }

    const html = this.teams
      .map(
        (team) => `
      <div class="team-item" data-team-id="${team.id}">
        <div class="team-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="team-info">
          <div class="team-name">${team.name}</div>
          <div class="team-members">${team.members.length} members</div>
        </div>
      </div>
    `
      )
      .join("");

    container.innerHTML = html;

    // Add click handlers for team selection
    container.querySelectorAll(".team-item").forEach((item) => {
      item.addEventListener("click", () => {
        const teamId = item.dataset.teamId;
        this.selectTeam(teamId);
      });
    });
  }

  /**
   * Render collaborations based on current filter
   */
  renderCollaborations() {
    const container = document.getElementById("collaboration-messages");
    if (!container) return;

    // Apply filter
    let filteredCollabs = [...this.collaborations];

    if (this.collaborationFilter !== "all") {
      if (this.collaborationFilter === "pending") {
        filteredCollabs = filteredCollabs.filter(
          (collab) => collab.status === "pending"
        );
      } else {
        filteredCollabs = filteredCollabs.filter(
          (collab) => collab.type === this.collaborationFilter
        );
      }
    }

    if (filteredCollabs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" y1="10" x2="15" y2="10"></line></svg>
          </div>
          <h3>No collaborations found</h3>
          <p>${
            this.collaborationFilter === "all"
              ? "Start a conversation with another agent"
              : "No collaborations match the selected filter"
          }</p>
        </div>
      `;
      return;
    }

    // Sort by timestamp (newest first)
    filteredCollabs.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    const html = filteredCollabs
      .map((collab) => {
        const isFromCurrentAgent = collab.fromAgent === this.currentAgent;
        const otherAgent = isFromCurrentAgent
          ? collab.toAgent
          : collab.fromAgent;
        const isTeamCollab = !!collab.team;

        let recipient;
        if (isFromCurrentAgent) {
          recipient = isTeamCollab ? "Team" : this.getAgentNameById(otherAgent);
        } else {
          recipient = this.getAgentNameById(collab.fromAgent);
        }

        // Create priority dots based on priority level (1-10)
        const priorityDots = [];
        for (let i = 1; i <= 5; i++) {
          const isActive = i <= Math.ceil(collab.priority / 2);
          priorityDots.push(
            `<div class="priority-dot${isActive ? " active" : ""}"></div>`
          );
        }

        return `
        <div class="message-item" data-collab-id="${collab.id}">
          <div class="message-header">
            <div class="message-avatar" style="background-color: ${this.getAgentColor(
              isFromCurrentAgent ? this.currentAgent : otherAgent
            )}">
              ${
                isFromCurrentAgent
                  ? this.getAgentNameById(this.currentAgent).charAt(0)
                  : this.getAgentNameById(otherAgent).charAt(0)
              }
            </div>
            <div class="message-metadata">
              <div class="message-sender">
                ${
                  isFromCurrentAgent
                    ? "You → " + recipient
                    : recipient + " → You"
                }
                <span class="message-badge ${
                  collab.type
                }">${collab.type.replace("_", " ")}</span>
              </div>
              <div class="message-time">${this.formatDate(
                collab.timestamp
              )}</div>
            </div>
            <div class="message-priority">
              <div class="priority-indicator">
                ${priorityDots.join("")}
              </div>
            </div>
          </div>
          <div class="message-body">
            <div class="message-content">${collab.content}</div>
          </div>
          <div class="message-actions">
            ${
              !isFromCurrentAgent && collab.status === "pending"
                ? `
              <button class="btn btn-sm btn-primary message-reply-btn" data-collab-id="${collab.id}">Reply</button>
              <button class="btn btn-sm btn-success message-accept-btn" data-collab-id="${collab.id}">Accept</button>
              <button class="btn btn-sm btn-danger message-reject-btn" data-collab-id="${collab.id}">Reject</button>
            `
                : ""
            }
            ${
              isFromCurrentAgent && collab.status === "pending"
                ? `
              <button class="btn btn-sm btn-secondary message-cancel-btn" data-collab-id="${collab.id}">Cancel</button>
            `
                : ""
            }
            ${
              collab.status === "accepted"
                ? `
              <span class="status-badge accepted">Accepted</span>
            `
                : ""
            }
            ${
              collab.status === "completed"
                ? `
              <span class="status-badge completed">Completed</span>
            `
                : ""
            }
            ${
              collab.status === "rejected"
                ? `
              <span class="status-badge rejected">Rejected</span>
            `
                : ""
            }
          </div>
        </div>
      `;
      })
      .join("");

    container.innerHTML = html;

    // Add click handlers for message actions
    container.querySelectorAll(".message-item").forEach((item) => {
      // Message selection
      item.addEventListener("click", () => {
        const collabId = item.dataset.collabId;
        this.selectCollaboration(collabId);
      });

      // Reply button
      const replyBtn = item.querySelector(".message-reply-btn");
      if (replyBtn) {
        replyBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent item selection
          const collabId = replyBtn.dataset.collabId;
          this.showReplyForm(collabId);
        });
      }

      // Accept button
      const acceptBtn = item.querySelector(".message-accept-btn");
      if (acceptBtn) {
        acceptBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent item selection
          const collabId = acceptBtn.dataset.collabId;
          this.updateCollaborationStatus(collabId, "accepted");
        });
      }

      // Reject button
      const rejectBtn = item.querySelector(".message-reject-btn");
      if (rejectBtn) {
        rejectBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent item selection
          const collabId = rejectBtn.dataset.collabId;
          this.updateCollaborationStatus(collabId, "rejected");
        });
      }

      // Cancel button
      const cancelBtn = item.querySelector(".message-cancel-btn");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent item selection
          const collabId = cancelBtn.dataset.collabId;
          this.updateCollaborationStatus(collabId, "canceled");
        });
      }
    });
  }

  /**
   * Select a recipient for messaging
   * @param {string} agentId - The agent ID to message
   */
  selectRecipient(agentId) {
    this.selectedRecipient = agentId;
    this.selectedTeam = null;

    // Update recipient display
    const recipientElement = document.getElementById("message-recipient");
    if (recipientElement) {
      recipientElement.innerHTML = `
        <span class="recipient-label">To:</span>
        <span class="recipient-name">${this.getAgentNameById(agentId)}</span>
      `;
    }

    // Highlight selected agent in sidebar
    document.querySelectorAll(".agent-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.agentId === agentId);
    });

    document.querySelectorAll(".team-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Check if send button should be enabled
    const messageContent = document.getElementById("message-content");
    const sendBtn = document.getElementById("send-message");
    if (sendBtn && messageContent) {
      sendBtn.disabled = !messageContent.value.trim();
    }
  }

  /**
   * Select a team for messaging
   * @param {string} teamId - The team ID to message
   */
  selectTeam(teamId) {
    const team = this.teams.find((t) => t.id === teamId);
    if (!team) return;

    this.selectedTeam = teamId;
    this.selectedRecipient = null;

    // Update recipient display
    const recipientElement = document.getElementById("message-recipient");
    if (recipientElement) {
      recipientElement.innerHTML = `
        <span class="recipient-label">To Team:</span>
        <span class="recipient-name">${team.name}</span>
      `;
    }

    // Highlight selected team in sidebar
    document.querySelectorAll(".team-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.teamId === teamId);
    });

    document.querySelectorAll(".agent-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Check if send button should be enabled
    const messageContent = document.getElementById("message-content");
    const sendBtn = document.getElementById("send-message");
    if (sendBtn && messageContent) {
      sendBtn.disabled = !messageContent.value.trim();
    }
  }

  /**
   * Select a collaboration to view details
   * @param {string} collabId - The collaboration ID
   */
  async selectCollaboration(collabId) {
    try {
      const response = await makeRequest(`/collaborations/${collabId}`);

      if (response && response.success) {
        this.selectedCollaboration = response.data;
        this.renderCollaborationDetails();
      }
    } catch (error) {
      console.error("Error loading collaboration details:", error);
    }
  }

  /**
   * Render details for the selected collaboration
   */
  renderCollaborationDetails() {
    const container = document.getElementById("collaboration-details");
    if (!container || !this.selectedCollaboration) return;

    const collab = this.selectedCollaboration;
    const isFromCurrentAgent = collab.fromAgent === this.currentAgent;
    const otherAgent = isFromCurrentAgent ? collab.toAgent : collab.fromAgent;

    let html = `
      <div class="detail-section">
        <h4>Collaboration Details</h4>
        <div class="detail-item">
          <div class="detail-label">Status</div>
          <div class="detail-value">
            <span class="status-badge ${collab.status}">${collab.status}</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Type</div>
          <div class="detail-value">${collab.type.replace("_", " ")}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">From</div>
          <div class="detail-value">${this.getAgentNameById(
            collab.fromAgent
          )}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">To</div>
          <div class="detail-value">${
            collab.toAgent ? this.getAgentNameById(collab.toAgent) : "Team"
          }</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Date</div>
          <div class="detail-value">${this.formatDate(collab.timestamp)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Priority</div>
          <div class="detail-value">${collab.priority}/10</div>
        </div>
      </div>
    `;

    // Show context if available
    if (collab.context && Object.keys(collab.context).length > 0) {
      html += `
        <div class="detail-section">
          <h4>Context</h4>
          ${Object.entries(collab.context)
            .map(
              ([key, value]) => `
            <div class="detail-item">
              <div class="detail-label">${key}</div>
              <div class="detail-value">${value}</div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    // Show history
    if (collab.history && collab.history.length > 0) {
      html += `
        <div class="detail-section">
          <h4>History</h4>
          ${collab.history
            .map(
              (entry) => `
            <div class="detail-item">
              <div class="detail-label">${this.formatDate(
                entry.timestamp
              )}</div>
              <div class="detail-value">
                <div>${this.getAgentNameById(entry.actor)}: ${
                entry.status
              }</div>
                ${
                  entry.note
                    ? `<div class="history-note">${entry.note}</div>`
                    : ""
                }
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    // Show responses
    if (collab.responses && collab.responses.length > 0) {
      html += `
        <div class="detail-section">
          <h4>Responses</h4>
          <div class="response-list">
            ${collab.responses
              .map(
                (response) => `
              <div class="response-item">
                <div class="response-header">
                  <div class="response-agent">${this.getAgentNameById(
                    response.agentId
                  )}</div>
                  <div class="response-time">${this.formatDate(
                    response.timestamp
                  )}</div>
                </div>
                <div class="response-content">${response.content}</div>
                ${
                  response.note
                    ? `<div class="response-note">${response.note}</div>`
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  /**
   * Send a new message or collaboration request
   */
  async sendMessage() {
    if (!this.currentAgent || (!this.selectedRecipient && !this.selectedTeam))
      return;

    const messageContent = document.getElementById("message-content");
    const messageType = document.getElementById("message-type");
    const messagePriority = document.getElementById("message-priority");

    if (!messageContent || !messageContent.value.trim()) {
      this.showError("Message content is required");
      return;
    }

    // Prepare collaboration data
    const collabData = {
      fromAgent: this.currentAgent,
      content: messageContent.value.trim(),
      type: messageType ? messageType.value : "message",
      priority: messagePriority ? parseInt(messagePriority.value, 10) : 5,
    };

    // Set recipient (either agent or team)
    if (this.selectedRecipient) {
      collabData.toAgent = this.selectedRecipient;
    } else if (this.selectedTeam) {
      // Get team members from selected team
      const team = this.teams.find((t) => t.id === this.selectedTeam);
      if (team) {
        collabData.team = team.members;
      }
    }

    try {
      const response = await makeRequest("/collaborations", "POST", collabData);

      if (response && response.success) {
        // Clear message input
        messageContent.value = "";

        // Disable send button
        const sendBtn = document.getElementById("send-message");
        if (sendBtn) {
          sendBtn.disabled = true;
        }

        // Reload collaborations
        this.loadCollaborations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      this.showError("Failed to send message");
    }
  }

  /**
   * Update a collaboration status
   * @param {string} collabId - Collaboration ID
   * @param {string} status - New status
   */
  async updateCollaborationStatus(collabId, status) {
    if (!this.currentAgent) return;

    try {
      const updateData = {
        agentId: this.currentAgent,
        status,
      };

      const response = await makeRequest(
        `/collaborations/${collabId}`,
        "PUT",
        updateData
      );

      if (response && response.success) {
        // Reload collaborations
        this.loadCollaborations();

        // If this was the selected collaboration, update details
        if (
          this.selectedCollaboration &&
          this.selectedCollaboration.id === collabId
        ) {
          this.selectedCollaboration = response.data;
          this.renderCollaborationDetails();
        }
      }
    } catch (error) {
      console.error("Error updating collaboration status:", error);
      this.showError(`Failed to update status to ${status}`);
    }
  }

  /**
   * Show the reply form for a collaboration
   * @param {string} collabId - Collaboration ID
   */
  async showReplyForm(collabId) {
    if (!this.currentAgent) return;

    try {
      const collab = await makeRequest(`/collaborations/${collabId}`, "GET");

      if (collab && collab.success) {
        // Focus the message input
        const messageContent = document.getElementById("message-content");
        if (messageContent) {
          messageContent.value = `In response to your ${collab.data.type.replace(
            "_",
            " "
          )}:\n\n`;
          messageContent.focus();

          // Move cursor to end
          messageContent.selectionStart = messageContent.value.length;
          messageContent.selectionEnd = messageContent.value.length;
        }

        // Select the sender as recipient
        this.selectRecipient(collab.data.fromAgent);
      }
    } catch (error) {
      console.error("Error preparing reply:", error);
      this.showError("Failed to prepare reply");
    }
  }

  /**
   * Show the new team modal
   */
  showNewTeamModal() {
    const modal = document.getElementById("new-team-modal");
    if (!modal) return;

    // Reset form
    const teamNameInput = document.getElementById("team-name");
    const teamDescInput = document.getElementById("team-description");
    if (teamNameInput && teamDescInput) {
      teamNameInput.value = "";
      teamDescInput.value = "";
    }

    // Populate agent list for team member selection
    this.renderTeamMemberSelection();

    // Show the modal
    modal.style.display = "block";
  }

  /**
   * Render team member selection in the new team form
   */
  renderTeamMemberSelection() {
    const container = document.getElementById("team-members-selection");
    if (!container || !this.allAgents.length) return;

    const html = this.allAgents
      .map(
        (agent) => `
      <div class="team-member-item">
        <div class="team-member-checkbox">
          <input type="checkbox" id="member-${
            agent.id
          }" name="team-members" value="${agent.id}">
        </div>
        <label for="member-${agent.id}" class="team-member-label">
          ${agent.name} (${agent.role || "Agent"})
        </label>
      </div>
    `
      )
      .join("");

    container.innerHTML = html;

    // Always include current agent and check it
    container.innerHTML += `
      <div class="team-member-item">
        <div class="team-member-checkbox">
          <input type="checkbox" id="member-${
            this.currentAgent
          }" name="team-members" value="${this.currentAgent}" checked disabled>
        </div>
        <label for="member-${this.currentAgent}" class="team-member-label">
          ${this.getAgentNameById(this.currentAgent)} (You)
        </label>
      </div>
    `;

    // Add change handler for member checkboxes
    const checkboxes = container.querySelectorAll('input[name="team-members"]');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => this.updateTeamLeaderOptions());
    });

    // Initialize leader options
    this.updateTeamLeaderOptions();
  }

  /**
   * Update the team leader dropdown based on selected members
   */
  updateTeamLeaderOptions() {
    const leaderSelect = document.getElementById("team-leader");
    if (!leaderSelect) return;

    // Get checked members
    const checkedMembers = [];
    const checkboxes = document.querySelectorAll(
      'input[name="team-members"]:checked'
    );
    checkboxes.forEach((checkbox) => {
      checkedMembers.push(checkbox.value);
    });

    // Reset leader options
    leaderSelect.innerHTML = "";

    if (checkedMembers.length === 0) {
      leaderSelect.innerHTML =
        '<option value="">Select a member first</option>';
      leaderSelect.disabled = true;
      return;
    }

    // Add options for each member
    checkedMembers.forEach((memberId) => {
      const isCurrentAgent = memberId === this.currentAgent;
      leaderSelect.innerHTML += `
        <option value="${memberId}">${this.getAgentNameById(memberId)}${
        isCurrentAgent ? " (You)" : ""
      }</option>
      `;
    });

    // Default to current agent
    if (checkedMembers.includes(this.currentAgent)) {
      leaderSelect.value = this.currentAgent;
    }

    leaderSelect.disabled = false;
  }

  /**
   * Create a new team from form data
   */
  async createNewTeam() {
    const teamName = document.getElementById("team-name").value.trim();
    const teamDescription = document
      .getElementById("team-description")
      .value.trim();
    const teamLeader = document.getElementById("team-leader").value;

    // Get checked members
    const members = [];
    const checkboxes = document.querySelectorAll(
      'input[name="team-members"]:checked'
    );
    checkboxes.forEach((checkbox) => {
      members.push(checkbox.value);
    });

    // Validate required fields
    if (!teamName) {
      this.showError("Team name is required");
      return;
    }

    if (members.length === 0) {
      this.showError("At least one team member is required");
      return;
    }

    // Ensure current agent is included
    if (!members.includes(this.currentAgent)) {
      members.push(this.currentAgent);
    }

    // Prepare team data
    const teamData = {
      name: teamName,
      description: teamDescription,
      members,
      leader: teamLeader || this.currentAgent,
    };

    try {
      const response = await makeRequest("/teams", "POST", teamData);

      if (response && response.success) {
        // Close the modal
        const modal = document.getElementById("new-team-modal");
        if (modal) {
          modal.style.display = "none";
        }

        // Reload teams
        this.loadTeams();
      }
    } catch (error) {
      console.error("Error creating team:", error);
      this.showError("Failed to create team");
    }
  }

  /**
   * Render the skills list in the team suggestion form
   */
  renderSkills() {
    const container = document.getElementById("required-skills");
    if (!container) return;

    if (this.skillsList.length === 0) {
      container.innerHTML = "";
      return;
    }

    const html = this.skillsList
      .map(
        (skill, index) => `
      <div class="skill-tag">
        ${skill}
        <span class="skill-tag-remove" data-index="${index}">×</span>
      </div>
    `
      )
      .join("");

    container.innerHTML = html;

    // Add remove handlers
    container.querySelectorAll(".skill-tag-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        this.skillsList.splice(index, 1);
        this.renderSkills();
      });
    });
  }

  /**
   * Get team suggestion based on form data
   */
  async getTeamSuggestion() {
    const taskType = document.getElementById("task-type").value.trim();
    const taskDomain = document.getElementById("task-domain").value.trim();
    const taskComplexity = parseInt(
      document.getElementById("task-complexity").value,
      10
    );
    const taskUrgency = parseInt(
      document.getElementById("task-urgency").value,
      10
    );

    // Validate required fields
    if (!taskType) {
      this.showError("Task type is required");
      return;
    }

    if (this.skillsList.length === 0) {
      this.showError("At least one required skill is needed");
      return;
    }

    // Prepare task data
    const taskData = {
      taskType,
      requiredSkills: this.skillsList,
      domain: taskDomain || null,
      complexity: taskComplexity,
      urgency: taskUrgency,
    };

    try {
      const response = await makeRequest("/teams/suggest", "POST", taskData);

      if (response && response.success) {
        this.suggestedTeam = response.data;
        this.renderSuggestedTeam();
      }
    } catch (error) {
      console.error("Error getting team suggestion:", error);
      this.showError("Failed to get team suggestion");
    }
  }

  /**
   * Render the suggested team
   */
  renderSuggestedTeam() {
    const container = document.getElementById("suggested-team-members");
    if (!container || !this.suggestedTeam) return;

    const { suggestedTeam, scores } = this.suggestedTeam;

    const html = suggestedTeam.members
      .map((memberId) => {
        const isLeader = memberId === suggestedTeam.leader;
        const score = scores.find((s) => s.agentId === memberId);
        const scoreValue = score ? Math.round(score.score * 100) : 0;

        return `
        <div class="suggested-member${isLeader ? " leader" : ""}">
          <div class="agent-avatar" style="background-color: ${this.getAgentColor(
            memberId
          )}">
            ${this.getAgentNameById(memberId).charAt(0)}
          </div>
          <div class="agent-info">
            <div class="agent-name">${this.getAgentNameById(memberId)}${
          isLeader ? " (Leader)" : ""
        }</div>
            <div class="agent-role">${
              this.getAgentRoleById(memberId) || "Agent"
            }</div>
          </div>
          <div class="member-score">${scoreValue}% match</div>
        </div>
      `;
      })
      .join("");

    container.innerHTML = html;

    // Show the suggestion result
    const resultSection = document.getElementById("suggestion-result");
    if (resultSection) {
      resultSection.style.display = "block";
    }
  }

  /**
   * Create a team based on the suggestion
   */
  async createSuggestedTeam() {
    if (!this.suggestedTeam) return;

    const { suggestedTeam } = this.suggestedTeam;
    const taskType = document.getElementById("task-type").value.trim();

    // Prepare team data
    const teamData = {
      name: `Team for ${taskType}`,
      description: `Team created for ${taskType} task with skills: ${this.skillsList.join(
        ", "
      )}`,
      members: suggestedTeam.members,
      leader: suggestedTeam.leader,
      formation: suggestedTeam.formation,
    };

    try {
      const response = await makeRequest("/teams", "POST", teamData);

      if (response && response.success) {
        // Close the modal
        const modal = document.getElementById("team-suggestion-modal");
        if (modal) {
          modal.style.display = "none";
        }

        // Reset skills list
        this.skillsList = [];

        // Reload teams
        this.loadTeams();
      }
    } catch (error) {
      console.error("Error creating team:", error);
      this.showError("Failed to create team");
    }
  }

  /**
   * Get agent name by ID
   * @param {string} agentId - Agent ID
   * @return {string} Agent name
   */
  getAgentNameById(agentId) {
    // First check in allAgents
    const agent = this.allAgents.find((a) => a.id === agentId);
    if (agent) return agent.name;

    // Fallback to common agent names
    const agentNames = {
      admin: "Admin",
      analyzer: "Analyzer",
      arlo: "ARLO",
      browser: "Browser",
      bundler: "Bundler",
      config: "Config",
      developer: "Developer",
      docs: "Docs",
      generator: "Generator",
      git: "Git",
      pipeline: "Pipeline",
      server: "Server",
      testbed: "Testbed",
      types: "Types",
      utils: "Utils",
      validator: "Validator",
      version: "Version",
    };

    return agentNames[agentId] || `Agent ${agentId}`;
  }

  /**
   * Get agent role by ID
   * @param {string} agentId - Agent ID
   * @return {string} Agent role
   */
  getAgentRoleById(agentId) {
    // First check in allAgents
    const agent = this.allAgents.find((a) => a.id === agentId);
    if (agent && agent.role) return agent.role;

    // Fallback to common agent roles
    const agentRoles = {
      admin: "Workflow coordinator",
      analyzer: "Performance specialist",
      arlo: "Self-maintenance specialist",
      browser: "Frontend expert",
      bundler: "Build system specialist",
      config: "Configuration expert",
      developer: "Development tooling expert",
      docs: "Documentation specialist",
      generator: "Scaffolding specialist",
      git: "Repository operations",
      pipeline: "CI/CD configuration",
      server: "Backend expert",
      testbed: "Testbed project specialist",
      types: "Type system expert",
      utils: "Utility function expert",
      validator: "Quality assurance",
      version: "Package versioning",
    };

    return agentRoles[agentId] || "Agent";
  }

  /**
   * Get agent color by ID
   * @param {string} agentId - Agent ID
   * @return {string} Agent color
   */
  getAgentColor(agentId) {
    // Agent colors (sorted from red to violet)
    const agentColors = {
      admin: "#F44336", // Red
      types: "#E91E63", // Pink
      utils: "#9C27B0", // Purple
      validator: "#673AB7", // Deep Purple
      developer: "#3F51B5", // Indigo
      browser: "#2196F3", // Blue
      version: "#03A9F4", // Light Blue
      server: "#00BCD4", // Cyan
      testbed: "#009688", // Teal
      pipeline: "#4CAF50", // Green
      generator: "#8BC34A", // Light Green
      config: "#CDDC39", // Lime
      docs: "#FFEB3B", // Yellow
      git: "#FFC107", // Amber
      analyzer: "#FF9800", // Orange
      bundler: "#FF5722", // Deep Orange
      arlo: "#607D8B", // Blue Grey
    };

    return agentColors[agentId] || "#4CAF50"; // Default to green
  }

  /**
   * Format a date relative to now
   * @param {string} dateString - ISO date string
   * @return {string} Formatted date
   */
  formatDate(dateString) {
    if (!dateString) return "Unknown";

    // Use formatDate util if available
    if (formatDate && typeof formatDate === "function") {
      return formatDate(dateString);
    }

    // Simple fallback
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} days ago`;

      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Show an error message to the user
   * @param {string} message - Error message
   */
  showError(message) {
    console.error(message);

    // Use notification system if available
    if (
      window.showNotification &&
      typeof window.showNotification === "function"
    ) {
      window.showNotification(message, "error");
    } else {
      // Simple alert fallback
      alert(message);
    }
  }
}

// Initialize the module
const agentCollaborationView = new AgentCollaborationView();
