/**
 * Collaboration Controller
 * Handles API endpoints for agent collaboration, messaging, and team management
 */
const agentCollaboration = require("../models/agentCollaboration");
const agentController = require("./agentController");

/**
 * Get collaboration messages for an agent
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getCollaborations(req, res) {
  try {
    const { agentId } = req.params;

    // Validate agent existence (via agentController)
    const agent = await agentController.getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: `Agent not found: ${agentId}`,
      });
    }

    // Parse query parameters
    const options = {
      status: req.query.status || null,
      type: req.query.type || null,
      limit: parseInt(req.query.limit || "50", 10),
      offset: parseInt(req.query.offset || "0", 10),
      includeCompleted: req.query.includeCompleted === "true",
      includeRejected: req.query.includeRejected === "true",
      fromAgent: req.query.fromAgent || null,
      toAgent: req.query.toAgent || null,
    };

    const collaborations = await agentCollaboration.getCollaborations(
      agentId,
      options
    );

    res.json({
      success: true,
      data: collaborations,
      meta: {
        limit: options.limit,
        offset: options.offset,
        count: collaborations.length,
      },
    });
  } catch (error) {
    console.error("Error getting collaborations:", error);
    res.status(500).json({
      success: false,
      message: "Error getting collaborations",
      error: error.message,
    });
  }
}

/**
 * Create a new collaboration or message
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createCollaboration(req, res) {
  try {
    const collabData = req.body;

    // Validate required fields
    if (!collabData.fromAgent) {
      return res.status(400).json({
        success: false,
        message: "From agent is required",
      });
    }

    if (!collabData.content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    if (
      !collabData.toAgent &&
      (!collabData.team || !Array.isArray(collabData.team))
    ) {
      return res.status(400).json({
        success: false,
        message: "Recipient (toAgent or team) is required",
      });
    }

    // Verify agents exist
    const fromAgent = await agentController.getAgentById(collabData.fromAgent);
    if (!fromAgent) {
      return res.status(404).json({
        success: false,
        message: `From agent not found: ${collabData.fromAgent}`,
      });
    }

    if (collabData.toAgent) {
      const toAgent = await agentController.getAgentById(collabData.toAgent);
      if (!toAgent) {
        return res.status(404).json({
          success: false,
          message: `To agent not found: ${collabData.toAgent}`,
        });
      }
    }

    // Create the collaboration
    const collaboration = await agentCollaboration.createCollaboration(
      collabData
    );

    res.status(201).json({
      success: true,
      data: collaboration,
    });
  } catch (error) {
    console.error("Error creating collaboration:", error);
    res.status(500).json({
      success: false,
      message: "Error creating collaboration",
      error: error.message,
    });
  }
}

/**
 * Get a specific collaboration by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getCollaboration(req, res) {
  try {
    const { id } = req.params;

    const collaboration = await agentCollaboration.getCollaboration(id);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: `Collaboration not found: ${id}`,
      });
    }

    res.json({
      success: true,
      data: collaboration,
    });
  } catch (error) {
    console.error("Error getting collaboration:", error);
    res.status(500).json({
      success: false,
      message: "Error getting collaboration",
      error: error.message,
    });
  }
}

/**
 * Update a collaboration with a response or status change
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateCollaboration(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate required fields
    if (!updateData.agentId) {
      return res.status(400).json({
        success: false,
        message: "Agent ID is required for updates",
      });
    }

    // Verify collaboration exists
    const existingCollab = await agentCollaboration.getCollaboration(id);
    if (!existingCollab) {
      return res.status(404).json({
        success: false,
        message: `Collaboration not found: ${id}`,
      });
    }

    // Verify agent exists
    const agent = await agentController.getAgentById(updateData.agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: `Agent not found: ${updateData.agentId}`,
      });
    }

    // Verify agent is involved in the collaboration
    const isInvolved =
      existingCollab.fromAgent === updateData.agentId ||
      existingCollab.toAgent === updateData.agentId ||
      (existingCollab.team && existingCollab.team.includes(updateData.agentId));

    if (!isInvolved) {
      return res.status(403).json({
        success: false,
        message: `Agent ${updateData.agentId} is not involved in this collaboration`,
      });
    }

    // Update the collaboration
    const collaboration = await agentCollaboration.updateCollaboration(
      id,
      updateData
    );

    res.json({
      success: true,
      data: collaboration,
    });
  } catch (error) {
    console.error("Error updating collaboration:", error);
    res.status(500).json({
      success: false,
      message: "Error updating collaboration",
      error: error.message,
    });
  }
}

/**
 * Delete a collaboration
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteCollaboration(req, res) {
  try {
    const { id } = req.params;

    // Verify collaboration exists
    const collaboration = await agentCollaboration.getCollaboration(id);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: `Collaboration not found: ${id}`,
      });
    }

    // Delete the collaboration
    const success = await agentCollaboration.deleteCollaboration(id);

    if (success) {
      res.json({
        success: true,
        message: "Collaboration deleted successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete collaboration",
      });
    }
  } catch (error) {
    console.error("Error deleting collaboration:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting collaboration",
      error: error.message,
    });
  }
}

/**
 * Create a new team
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createTeam(req, res) {
  try {
    const teamData = req.body;

    // Validate required fields
    if (!teamData.name) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    if (
      !teamData.members ||
      !Array.isArray(teamData.members) ||
      teamData.members.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Team members are required",
      });
    }

    // Verify all members exist
    for (const memberId of teamData.members) {
      const member = await agentController.getAgentById(memberId);
      if (!member) {
        return res.status(404).json({
          success: false,
          message: `Agent not found: ${memberId}`,
        });
      }
    }

    // Verify leader exists if specified
    if (teamData.leader) {
      const leader = await agentController.getAgentById(teamData.leader);
      if (!leader) {
        return res.status(404).json({
          success: false,
          message: `Leader agent not found: ${teamData.leader}`,
        });
      }

      // Ensure leader is part of the team
      if (!teamData.members.includes(teamData.leader)) {
        return res.status(400).json({
          success: false,
          message: "Leader must be a member of the team",
        });
      }
    }

    // Create the team
    const team = await agentCollaboration.createTeam(teamData);

    res.status(201).json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({
      success: false,
      message: "Error creating team",
      error: error.message,
    });
  }
}

/**
 * Get teams for an agent
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAgentTeams(req, res) {
  try {
    const { agentId } = req.params;

    // Validate agent existence
    const agent = await agentController.getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: `Agent not found: ${agentId}`,
      });
    }

    const teams = await agentCollaboration.getAgentTeams(agentId);

    res.json({
      success: true,
      data: teams,
    });
  } catch (error) {
    console.error("Error getting agent teams:", error);
    res.status(500).json({
      success: false,
      message: "Error getting agent teams",
      error: error.message,
    });
  }
}

/**
 * Suggest a team for a task
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function suggestTeam(req, res) {
  try {
    const taskData = req.body;

    // Validate required fields
    if (!taskData.taskType) {
      return res.status(400).json({
        success: false,
        message: "Task type is required",
      });
    }

    if (!taskData.requiredSkills || !Array.isArray(taskData.requiredSkills)) {
      return res.status(400).json({
        success: false,
        message: "Required skills array is required",
      });
    }

    // Get team suggestion
    const suggestion = await agentCollaboration.suggestTeam(taskData);

    res.json({
      success: true,
      data: suggestion,
    });
  } catch (error) {
    console.error("Error suggesting team:", error);
    res.status(500).json({
      success: false,
      message: "Error suggesting team",
      error: error.message,
    });
  }
}

module.exports = {
  getCollaborations,
  createCollaboration,
  getCollaboration,
  updateCollaboration,
  deleteCollaboration,
  createTeam,
  getAgentTeams,
  suggestTeam,
};
