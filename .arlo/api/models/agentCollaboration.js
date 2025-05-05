/**
 * Agent Collaboration Model
 * Handles collaboration between agents, message passing, and team formation
 */
const fileDB = require("./fileDB");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Collaboration types
const COLLAB_TYPES = {
  MESSAGE: "message",
  QUESTION: "question",
  TASK_REQUEST: "task_request",
  KNOWLEDGE_SHARE: "knowledge_share",
  REVIEW_REQUEST: "review_request",
  TEAM_FORMATION: "team_formation",
  TASK_HANDOFF: "task_handoff",
};

// Collaboration statuses
const COLLAB_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  COMPLETED: "completed",
  REJECTED: "rejected",
  CANCELED: "canceled",
};

// Path to the collaborations storage
const COLLABORATIONS_PATH = path.join(
  process.cwd(),
  ".arlo",
  "data",
  "collaborations"
);
const TEAMS_PATH = path.join(process.cwd(), ".arlo", "data", "teams");

// Initialize storage
fileDB.ensureDirectory(COLLABORATIONS_PATH);
fileDB.ensureDirectory(TEAMS_PATH);

/**
 * Get collaboration messages between agents
 *
 * @param {string} agentId - The agent ID to get messages for
 * @param {Object} options - Query options
 * @return {Array} Array of collaboration messages
 */
async function getCollaborations(agentId, options = {}) {
  const {
    status = null,
    type = null,
    limit = 50,
    offset = 0,
    includeCompleted = false,
    includeRejected = false,
    fromAgent = null,
    toAgent = null,
  } = options;

  // Load all collaborations
  const collaborations = [];

  try {
    // Get collaborations where agent is involved (as sender or recipient)
    const files = await fileDB.listFiles(COLLABORATIONS_PATH);

    for (const file of files) {
      const collab = await fileDB.readJSON(
        path.join(COLLABORATIONS_PATH, file)
      );

      // Check if agent is involved
      const isInvolved =
        collab.fromAgent === agentId ||
        collab.toAgent === agentId ||
        (collab.team && collab.team.includes(agentId));

      if (!isInvolved) continue;

      // Apply filters
      if (status && collab.status !== status) continue;
      if (type && collab.type !== type) continue;
      if (fromAgent && collab.fromAgent !== fromAgent) continue;
      if (toAgent && collab.toAgent !== toAgent) continue;
      if (!includeCompleted && collab.status === COLLAB_STATUS.COMPLETED)
        continue;
      if (!includeRejected && collab.status === COLLAB_STATUS.REJECTED)
        continue;

      collaborations.push(collab);
    }

    // Sort by timestamp (newest first)
    collaborations.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Apply pagination
    return collaborations.slice(offset, offset + limit);
  } catch (error) {
    console.error("Error getting collaborations:", error);
    return [];
  }
}

/**
 * Create a new collaboration between agents
 *
 * @param {Object} collabData - The collaboration data
 * @return {Object} The created collaboration
 */
async function createCollaboration(collabData) {
  try {
    const {
      fromAgent,
      toAgent,
      team = null,
      type = COLLAB_TYPES.MESSAGE,
      content,
      context = {},
      priority = 5,
      status = COLLAB_STATUS.PENDING,
      dueDate = null,
    } = collabData;

    if (!fromAgent) throw new Error("From agent is required");
    if (!content) throw new Error("Content is required");

    // Either toAgent or team must be specified
    if (!toAgent && !team)
      throw new Error("Recipient (toAgent or team) is required");

    // Validate type
    if (!Object.values(COLLAB_TYPES).includes(type)) {
      throw new Error(`Invalid collaboration type: ${type}`);
    }

    // Create the collaboration object
    const collaboration = {
      id: uuidv4(),
      fromAgent,
      toAgent: toAgent || null,
      team: team || null,
      type,
      content,
      context,
      priority,
      status,
      dueDate,
      timestamp: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          status,
          actor: fromAgent,
          note: "Collaboration initiated",
        },
      ],
      responses: [],
    };

    // Save the collaboration
    const filePath = path.join(COLLABORATIONS_PATH, `${collaboration.id}.json`);
    await fileDB.writeJSON(filePath, collaboration);

    return collaboration;
  } catch (error) {
    console.error("Error creating collaboration:", error);
    throw error;
  }
}

/**
 * Update a collaboration status or add a response
 *
 * @param {string} collabId - The collaboration ID
 * @param {Object} updateData - Data to update
 * @return {Object} The updated collaboration
 */
async function updateCollaboration(collabId, updateData) {
  try {
    const filePath = path.join(COLLABORATIONS_PATH, `${collabId}.json`);

    // Check if collaboration exists
    if (!(await fileDB.fileExists(filePath))) {
      throw new Error(`Collaboration not found: ${collabId}`);
    }

    // Load the collaboration
    const collaboration = await fileDB.readJSON(filePath);

    const { status, agentId, response = null, note = "" } = updateData;

    // Update the status if provided
    if (status) {
      // Validate status
      if (!Object.values(COLLAB_STATUS).includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      collaboration.status = status;

      // Add to history
      collaboration.history.push({
        timestamp: new Date().toISOString(),
        status,
        actor: agentId,
        note: note || `Status updated to ${status}`,
      });
    }

    // Add response if provided
    if (response) {
      collaboration.responses.push({
        timestamp: new Date().toISOString(),
        agentId,
        content: response,
        note,
      });
    }

    // Save the updated collaboration
    await fileDB.writeJSON(filePath, collaboration);

    return collaboration;
  } catch (error) {
    console.error("Error updating collaboration:", error);
    throw error;
  }
}

/**
 * Get a specific collaboration by ID
 *
 * @param {string} collabId - The collaboration ID
 * @return {Object} The collaboration
 */
async function getCollaboration(collabId) {
  try {
    const filePath = path.join(COLLABORATIONS_PATH, `${collabId}.json`);

    // Check if collaboration exists
    if (!(await fileDB.fileExists(filePath))) {
      return null;
    }

    // Load the collaboration
    return await fileDB.readJSON(filePath);
  } catch (error) {
    console.error("Error getting collaboration:", error);
    return null;
  }
}

/**
 * Delete a collaboration by ID
 *
 * @param {string} collabId - The collaboration ID
 * @return {boolean} Success indicator
 */
async function deleteCollaboration(collabId) {
  try {
    const filePath = path.join(COLLABORATIONS_PATH, `${collabId}.json`);

    // Check if collaboration exists
    if (!(await fileDB.fileExists(filePath))) {
      return false;
    }

    // Delete the file
    await fileDB.deleteFile(filePath);
    return true;
  } catch (error) {
    console.error("Error deleting collaboration:", error);
    return false;
  }
}

/**
 * Create a new team for collaboration
 *
 * @param {Object} teamData - The team data
 * @return {Object} The created team
 */
async function createTeam(teamData) {
  try {
    const {
      name,
      description,
      members,
      leader,
      taskId = null,
      formation = { strategy: "manual" },
    } = teamData;

    if (!name) throw new Error("Team name is required");
    if (!members || !Array.isArray(members) || members.length === 0) {
      throw new Error("Team members are required");
    }

    // Create the team object
    const team = {
      id: uuidv4(),
      name,
      description,
      members,
      leader: leader || members[0],
      taskId,
      formation,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      status: "active",
    };

    // Save the team
    const filePath = path.join(TEAMS_PATH, `${team.id}.json`);
    await fileDB.writeJSON(filePath, team);

    return team;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
}

/**
 * Get a list of teams that an agent is part of
 *
 * @param {string} agentId - Agent ID
 * @return {Array} List of teams
 */
async function getAgentTeams(agentId) {
  try {
    const teams = [];

    // List all team files
    const files = await fileDB.listFiles(TEAMS_PATH);

    for (const file of files) {
      const team = await fileDB.readJSON(path.join(TEAMS_PATH, file));

      // Check if agent is a member
      if (team.members.includes(agentId)) {
        teams.push(team);
      }
    }

    return teams;
  } catch (error) {
    console.error("Error getting agent teams:", error);
    return [];
  }
}

/**
 * Suggest team formation for a specific task
 *
 * @param {Object} taskData - The task data
 * @return {Object} Suggested team and formation strategy
 */
async function suggestTeam(taskData) {
  try {
    const {
      taskType,
      requiredSkills = [],
      domain = null,
      complexity = 5,
      urgency = 3,
    } = taskData;

    // In a real implementation, this would have complex logic to match
    // agents with the required skills. For now, we'll use a simplified approach.

    // Define agent specialties (this would come from the agent database in production)
    const agentSpecialties = {
      admin: ["coordination", "planning", "delegation"],
      server: ["backend", "api", "controllers", "routing"],
      browser: ["frontend", "client", "ui", "events"],
      types: ["typescript", "interfaces", "type-safety"],
      utils: ["utilities", "helpers", "common-functions"],
      docs: ["documentation", "examples", "guides"],
      git: ["version-control", "pull-requests", "merging"],
      // Add more agents with their specialties
    };

    // Define domain knowledge (this would come from real agent profiles)
    const domainKnowledge = {
      server: ["express", "fastify", "node"],
      browser: ["dom", "events", "frameworks"],
      generator: ["templates", "scaffolding", "code-generation"],
      // Add more domain knowledge
    };

    // Matching algorithm:
    const suggestedMembers = [];
    let leaderScore = 0;
    let leader = null;

    // First, try to match required skills
    for (const [agentId, skills] of Object.entries(agentSpecialties)) {
      // Calculate match score
      const matchedSkills = requiredSkills.filter(
        (skill) =>
          skills.includes(skill) ||
          skills.some((s) => s.includes(skill)) ||
          requiredSkills.some((s) => s.includes(skill))
      );

      const skillScore = matchedSkills.length / requiredSkills.length;

      // Calculate domain match
      let domainScore = 0;
      if (domain && domainKnowledge[agentId]) {
        domainScore = domainKnowledge[agentId].includes(domain) ? 0.5 : 0;
      }

      // Total score
      const totalScore = skillScore + domainScore;

      // If score is good enough, add to suggested members
      if (totalScore > 0.2) {
        suggestedMembers.push({
          agentId,
          score: totalScore,
        });

        // Check if this could be a leader
        if (totalScore > leaderScore) {
          leaderScore = totalScore;
          leader = agentId;
        }
      }
    }

    // Sort by score
    suggestedMembers.sort((a, b) => b.score - a.score);

    // Always include Admin agent for coordination
    if (!suggestedMembers.some((m) => m.agentId === "admin")) {
      suggestedMembers.push({
        agentId: "admin",
        score: 1.0,
        reason: "coordination",
      });
    }

    // Limit team size based on complexity
    const teamSize = Math.min(
      Math.max(2, Math.ceil(complexity / 3) + 1),
      suggestedMembers.length
    );

    // Create team suggestion
    return {
      suggestedTeam: {
        members: suggestedMembers.slice(0, teamSize).map((m) => m.agentId),
        leader: leader || "admin",
        formation: {
          strategy: "skill-based",
          criteria: {
            requiredSkills,
            domain,
            complexity,
            urgency,
          },
        },
      },
      scores: suggestedMembers.slice(0, teamSize),
    };
  } catch (error) {
    console.error("Error suggesting team:", error);
    return {
      suggestedTeam: {
        members: ["admin"],
        leader: "admin",
        formation: {
          strategy: "fallback",
          criteria: {},
        },
      },
      scores: [{ agentId: "admin", score: 1.0 }],
    };
  }
}

module.exports = {
  COLLAB_TYPES,
  COLLAB_STATUS,
  getCollaborations,
  createCollaboration,
  updateCollaboration,
  getCollaboration,
  deleteCollaboration,
  createTeam,
  getAgentTeams,
  suggestTeam,
};
