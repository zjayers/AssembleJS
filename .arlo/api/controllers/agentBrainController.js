/**
 * Agent Brain Controller
 * Handles agent brain API endpoints
 */

const agentBrain = require("../models/agentBrain");
const { isValidAgentName, isValidId } = require("../../utils/validation");

/**
 * Initialize an agent's brain
 */
const initBrain = async (req, res) => {
  try {
    const { agent } = req.params;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    const result = await agentBrain.initBrain(agent);

    res.json({
      success: true,
      message: `Brain initialized for agent ${agent}`,
    });
  } catch (error) {
    console.error(
      `Error initializing brain for agent ${req.params.agent}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error initializing brain",
      error: error.message,
    });
  }
};

/**
 * Register an entity in the agent's brain
 */
const registerEntity = async (req, res) => {
  try {
    const { agent } = req.params;
    const entity = req.body;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    // Validate entity
    if (!entity || !entity.id || !entity.type) {
      return res.status(400).json({
        success: false,
        message: "Invalid entity. ID and type are required.",
      });
    }

    const result = await agentBrain.registerEntity(agent, entity);

    res.json(result);
  } catch (error) {
    console.error(
      `Error registering entity for agent ${req.params.agent}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error registering entity",
      error: error.message,
    });
  }
};

/**
 * Get an entity from the agent's brain
 */
const getEntity = async (req, res) => {
  try {
    const { agent, entityId } = req.params;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    // Validate entity ID
    if (!isValidId(entityId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid entity ID",
      });
    }

    const entity = await agentBrain.getEntity(agent, entityId);

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: `Entity ${entityId} not found for agent ${agent}`,
      });
    }

    res.json({
      success: true,
      entity,
    });
  } catch (error) {
    console.error(`Error getting entity for agent ${req.params.agent}:`, error);
    res.status(500).json({
      success: false,
      message: "Error getting entity",
      error: error.message,
    });
  }
};

/**
 * Get entities by type from the agent's brain
 */
const getEntitiesByType = async (req, res) => {
  try {
    const { agent } = req.params;
    const { type } = req.query;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    // Validate entity type
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Entity type is required",
      });
    }

    const entities = await agentBrain.getEntitiesByType(agent, type);

    res.json({
      success: true,
      entities,
    });
  } catch (error) {
    console.error(
      `Error getting entities for agent ${req.params.agent}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error getting entities",
      error: error.message,
    });
  }
};

/**
 * Add a memory to the agent's brain
 */
const addMemory = async (req, res) => {
  try {
    const { agent } = req.params;
    const memory = req.body;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    // Validate memory
    if (!memory || !memory.type || !memory.content) {
      return res.status(400).json({
        success: false,
        message: "Invalid memory. Type and content are required.",
      });
    }

    const result = await agentBrain.addMemory(agent, memory);

    res.json(result);
  } catch (error) {
    console.error(`Error adding memory for agent ${req.params.agent}:`, error);
    res.status(500).json({
      success: false,
      message: "Error adding memory",
      error: error.message,
    });
  }
};

/**
 * Record a decision made by the agent
 */
const recordDecision = async (req, res) => {
  try {
    const { agent } = req.params;
    const decision = req.body;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    // Validate decision
    if (!decision || !decision.context || !decision.choice) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision. Context and choice are required.",
      });
    }

    const result = await agentBrain.recordDecision(agent, decision);

    res.json(result);
  } catch (error) {
    console.error(
      `Error recording decision for agent ${req.params.agent}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error recording decision",
      error: error.message,
    });
  }
};

/**
 * Record an observation made by the agent
 */
const recordObservation = async (req, res) => {
  try {
    const { agent } = req.params;
    const observation = req.body;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    // Validate observation
    if (!observation || !observation.content) {
      return res.status(400).json({
        success: false,
        message: "Invalid observation. Content is required.",
      });
    }

    const result = await agentBrain.recordObservation(agent, observation);

    res.json(result);
  } catch (error) {
    console.error(
      `Error recording observation for agent ${req.params.agent}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error recording observation",
      error: error.message,
    });
  }
};

/**
 * Get memories from the agent's brain
 */
const getMemories = async (req, res) => {
  try {
    const { agent } = req.params;
    const { limit, type, tags, minImportance, entityId } = req.query;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    // Prepare query options
    const options = {
      limit: limit ? parseInt(limit) : 100,
    };

    if (type) options.type = type;
    if (tags) options.tags = tags.split(",");
    if (minImportance) options.minImportance = parseFloat(minImportance);
    if (entityId) options.entityId = entityId;

    const memories = await agentBrain.getMemories(agent, options);

    res.json({
      success: true,
      memories,
    });
  } catch (error) {
    console.error(
      `Error getting memories for agent ${req.params.agent}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error getting memories",
      error: error.message,
    });
  }
};

/**
 * Set agent preference
 */
const setPreference = async (req, res) => {
  try {
    const { agent, category, key } = req.params;
    const { value } = req.body;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    // Validate preference data
    if (!category || !key) {
      return res.status(400).json({
        success: false,
        message: "Invalid preference. Category and key are required.",
      });
    }

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Preference value is required",
      });
    }

    const result = await agentBrain.setPreference(agent, category, key, value);

    res.json(result);
  } catch (error) {
    console.error(
      `Error setting preference for agent ${req.params.agent}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error setting preference",
      error: error.message,
    });
  }
};

/**
 * Get agent preferences
 */
const getPreferences = async (req, res) => {
  try {
    const { agent } = req.params;
    const { category } = req.query;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    const preferences = await agentBrain.getPreferences(agent, category);

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: `Preferences not found for agent ${agent}`,
      });
    }

    res.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error(
      `Error getting preferences for agent ${req.params.agent}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error getting preferences",
      error: error.message,
    });
  }
};

/**
 * Add a rule to the agent's decision making system
 */
const addRule = async (req, res) => {
  try {
    const { agent } = req.params;
    const rule = req.body;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    // Validate rule
    if (!rule || !rule.condition || !rule.action) {
      return res.status(400).json({
        success: false,
        message: "Invalid rule. Condition and action are required.",
      });
    }

    const result = await agentBrain.addRule(agent, rule);

    res.json(result);
  } catch (error) {
    console.error(`Error adding rule for agent ${req.params.agent}:`, error);
    res.status(500).json({
      success: false,
      message: "Error adding rule",
      error: error.message,
    });
  }
};

/**
 * Get agent rules
 */
const getRules = async (req, res) => {
  try {
    const { agent } = req.params;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    const rules = await agentBrain.getRules(agent);

    res.json({
      success: true,
      rules,
    });
  } catch (error) {
    console.error(`Error getting rules for agent ${req.params.agent}:`, error);
    res.status(500).json({
      success: false,
      message: "Error getting rules",
      error: error.message,
    });
  }
};

/**
 * Record task completion and update metrics
 */
const recordTaskCompletion = async (req, res) => {
  try {
    const { agent } = req.params;
    const taskResult = req.body;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    // Validate task result
    if (!taskResult || taskResult.success === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid task result. Success status is required.",
      });
    }

    const result = await agentBrain.recordTaskCompletion(agent, taskResult);

    res.json(result);
  } catch (error) {
    console.error(
      `Error recording task completion for agent ${req.params.agent}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error recording task completion",
      error: error.message,
    });
  }
};

/**
 * Get agent metrics
 */
const getMetrics = async (req, res) => {
  try {
    const { agent } = req.params;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    const metrics = await agentBrain.getMetrics(agent);

    if (!metrics) {
      return res.status(404).json({
        success: false,
        message: `Metrics not found for agent ${agent}`,
      });
    }

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error(
      `Error getting metrics for agent ${req.params.agent}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error getting metrics",
      error: error.message,
    });
  }
};

/**
 * Retrieve knowledge for a task
 */
const retrieveKnowledgeForTask = async (req, res) => {
  try {
    const { agent } = req.params;
    const taskContext = req.body;

    // Validate agent name
    if (!isValidAgentName(agent)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent name",
      });
    }

    // Validate task context
    if (!taskContext || !taskContext.description) {
      return res.status(400).json({
        success: false,
        message: "Invalid task context. Description is required.",
      });
    }

    const result = await agentBrain.retrieveKnowledgeForTask(
      agent,
      taskContext
    );

    res.json(result);
  } catch (error) {
    console.error(
      `Error retrieving knowledge for task for agent ${req.params.agent}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Error retrieving knowledge for task",
      error: error.message,
    });
  }
};

module.exports = {
  initBrain,
  registerEntity,
  getEntity,
  getEntitiesByType,
  addMemory,
  getMemories,
  recordDecision,
  recordObservation,
  setPreference,
  getPreferences,
  addRule,
  getRules,
  recordTaskCompletion,
  getMetrics,
  retrieveKnowledgeForTask,
};
