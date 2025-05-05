/**
 * Agent Brain Model
 * Manages long-term memory, entity awareness, and decision making for agents
 */

const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fileDB = require("./fileDB");

// Base data directory
const DATA_DIR = path.join(__dirname, "../../data");
const BRAINS_DIR = path.join(DATA_DIR, "brains");

// Memory types
const MEMORY_TYPES = {
  ENTITY: "entity", // Knowledge about specific code entities (files, components, functions)
  DECISION: "decision", // Past decisions made and their outcomes
  OBSERVATION: "observation", // Observations about code patterns or behaviors
  RELATIONSHIP: "relationship", // Relationships between entities
  PREFERENCE: "preference", // Agent preferences for approaches
  META: "meta", // Meta-cognition about the agent's own performance
};

// Brain components
const BRAIN_COMPONENTS = {
  ENTITIES: "entities", // Registry of known entities
  MEMORIES: "memories", // Long-term memories (observations, decisions)
  PREFERENCES: "preferences", // Design and coding preferences of the agent
  RULES: "rules", // Rules for decision making
  METRICS: "metrics", // Performance metrics for self-evaluation
};

/**
 * Ensure brain directories exist
 */
const ensureBrainDirs = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(BRAINS_DIR, { recursive: true });
};

/**
 * Initialize an agent's brain
 * @param {string} agentId - Agent identifier
 */
const initBrain = async (agentId) => {
  await ensureBrainDirs();

  // Path to the agent's brain directory
  const agentBrainDir = path.join(BRAINS_DIR, agentId);
  await fs.mkdir(agentBrainDir, { recursive: true });

  // Check if brain components exist
  for (const component of Object.values(BRAIN_COMPONENTS)) {
    const componentPath = path.join(agentBrainDir, `${component}.json`);

    try {
      await fs.access(componentPath);
    } catch (error) {
      // Component doesn't exist, create it with default structure
      let defaultContent = {};

      switch (component) {
        case BRAIN_COMPONENTS.ENTITIES:
          defaultContent = { entities: {} };
          break;
        case BRAIN_COMPONENTS.MEMORIES:
          defaultContent = { memories: [] };
          break;
        case BRAIN_COMPONENTS.PREFERENCES:
          defaultContent = {
            coding: {},
            design: {},
            collaboration: {},
            documentation: {},
          };
          break;
        case BRAIN_COMPONENTS.RULES:
          defaultContent = { rules: [] };
          break;
        case BRAIN_COMPONENTS.METRICS:
          defaultContent = {
            taskCompletions: 0,
            successRate: 0,
            averageResponseTime: 0,
            knowledgeGrowth: 0,
            lastEvaluation: new Date().toISOString(),
          };
          break;
        default:
          defaultContent = {};
      }

      await fs.writeFile(
        componentPath,
        JSON.stringify(defaultContent, null, 2)
      );
    }
  }

  return true;
};

/**
 * Load a brain component
 * @param {string} agentId - Agent identifier
 * @param {string} component - Brain component name
 * @return {Object} Component data
 */
const loadBrainComponent = async (agentId, component) => {
  await ensureBrainDirs();

  // Ensure the agent has a brain
  await initBrain(agentId);

  // Load the component
  const componentPath = path.join(BRAINS_DIR, agentId, `${component}.json`);

  try {
    const data = await fs.readFile(componentPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(
      `Error loading brain component ${component} for agent ${agentId}:`,
      error
    );
    return null;
  }
};

/**
 * Save a brain component
 * @param {string} agentId - Agent identifier
 * @param {string} component - Brain component name
 * @param {Object} data - Component data to save
 * @return {boolean} Success status
 */
const saveBrainComponent = async (agentId, component, data) => {
  await ensureBrainDirs();

  // Ensure the agent has a brain
  await initBrain(agentId);

  // Save the component
  const componentPath = path.join(BRAINS_DIR, agentId, `${component}.json`);

  try {
    await fs.writeFile(componentPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(
      `Error saving brain component ${component} for agent ${agentId}:`,
      error
    );
    return false;
  }
};

/**
 * Register or update an entity in the agent's brain
 * @param {string} agentId - Agent identifier
 * @param {Object} entity - Entity data
 * @return {Object} Operation result
 */
const registerEntity = async (agentId, entity) => {
  if (!entity || !entity.id || !entity.type) {
    return {
      success: false,
      message: "Invalid entity data. ID and type are required.",
    };
  }

  try {
    // Load entities component
    const entitiesData = await loadBrainComponent(
      agentId,
      BRAIN_COMPONENTS.ENTITIES
    );
    if (!entitiesData) {
      return {
        success: false,
        message: "Failed to load entities component",
      };
    }

    // Add or update entity
    entitiesData.entities[entity.id] = {
      ...entity,
      lastUpdated: new Date().toISOString(),
    };

    // Save updated entities
    const saveResult = await saveBrainComponent(
      agentId,
      BRAIN_COMPONENTS.ENTITIES,
      entitiesData
    );

    if (saveResult) {
      return {
        success: true,
        message: `Entity ${entity.id} registered successfully`,
        entity: entitiesData.entities[entity.id],
      };
    } else {
      return {
        success: false,
        message: "Failed to save entity data",
      };
    }
  } catch (error) {
    console.error(`Error registering entity for agent ${agentId}:`, error);
    return {
      success: false,
      message: `Error registering entity: ${error.message}`,
    };
  }
};

/**
 * Get an entity from the agent's brain
 * @param {string} agentId - Agent identifier
 * @param {string} entityId - Entity identifier
 * @return {Object} The entity or null if not found
 */
const getEntity = async (agentId, entityId) => {
  try {
    // Load entities component
    const entitiesData = await loadBrainComponent(
      agentId,
      BRAIN_COMPONENTS.ENTITIES
    );
    if (!entitiesData) {
      return null;
    }

    // Return the entity if it exists
    return entitiesData.entities[entityId] || null;
  } catch (error) {
    console.error(
      `Error getting entity ${entityId} for agent ${agentId}:`,
      error
    );
    return null;
  }
};

/**
 * Get all entities of a specific type
 * @param {string} agentId - Agent identifier
 * @param {string} entityType - Type of entities to retrieve
 * @return {Array} Array of entities
 */
const getEntitiesByType = async (agentId, entityType) => {
  try {
    // Load entities component
    const entitiesData = await loadBrainComponent(
      agentId,
      BRAIN_COMPONENTS.ENTITIES
    );
    if (!entitiesData) {
      return [];
    }

    // Filter entities by type
    return Object.values(entitiesData.entities).filter(
      (entity) => entity.type === entityType
    );
  } catch (error) {
    console.error(
      `Error getting entities of type ${entityType} for agent ${agentId}:`,
      error
    );
    return [];
  }
};

/**
 * Add a memory to the agent's brain
 * @param {string} agentId - Agent identifier
 * @param {Object} memory - Memory data
 * @return {Object} Operation result
 */
const addMemory = async (agentId, memory) => {
  if (!memory || !memory.type || !memory.content) {
    return {
      success: false,
      message: "Invalid memory data. Type and content are required.",
    };
  }

  try {
    // Load memories component
    const memoriesData = await loadBrainComponent(
      agentId,
      BRAIN_COMPONENTS.MEMORIES
    );
    if (!memoriesData) {
      return {
        success: false,
        message: "Failed to load memories component",
      };
    }

    // Generate memory ID if not provided
    if (!memory.id) {
      memory.id = uuidv4();
    }

    // Add timestamp if not provided
    if (!memory.timestamp) {
      memory.timestamp = new Date().toISOString();
    }

    // Add importance if not provided
    if (memory.importance === undefined) {
      memory.importance = 0.5; // Default medium importance
    }

    // Add memory to the beginning of the array (most recent first)
    memoriesData.memories.unshift(memory);

    // Save updated memories
    const saveResult = await saveBrainComponent(
      agentId,
      BRAIN_COMPONENTS.MEMORIES,
      memoriesData
    );

    // Also add to agent knowledge collection if specified
    if (memory.addToKnowledge) {
      await fileDB.addAgentKnowledge(agentId, {
        document:
          typeof memory.content === "string"
            ? memory.content
            : JSON.stringify(memory.content),
        metadata: {
          title: memory.title || `Memory: ${memory.type}`,
          type: "agent-reflection",
          timestamp: memory.timestamp,
          tags: memory.tags || [memory.type],
          source: "brain",
          memoryId: memory.id,
        },
      });
    }

    if (saveResult) {
      return {
        success: true,
        message: "Memory added successfully",
        memoryId: memory.id,
      };
    } else {
      return {
        success: false,
        message: "Failed to save memory data",
      };
    }
  } catch (error) {
    console.error(`Error adding memory for agent ${agentId}:`, error);
    return {
      success: false,
      message: `Error adding memory: ${error.message}`,
    };
  }
};

/**
 * Get recent memories from the agent's brain
 * @param {string} agentId - Agent identifier
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of memories to retrieve
 * @param {string} options.type - Filter by memory type
 * @param {string[]} options.tags - Filter by tags
 * @param {number} options.minImportance - Minimum importance threshold
 * @param {string} options.entityId - Filter by related entity
 * @return {Array} Array of memories
 */
const getMemories = async (agentId, options = {}) => {
  const { limit = 100, type, tags, minImportance = 0, entityId } = options;

  try {
    // Load memories component
    const memoriesData = await loadBrainComponent(
      agentId,
      BRAIN_COMPONENTS.MEMORIES
    );
    if (!memoriesData) {
      return [];
    }

    // Filter memories based on options
    let filteredMemories = memoriesData.memories;

    // Filter by type
    if (type) {
      filteredMemories = filteredMemories.filter(
        (memory) => memory.type === type
      );
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      filteredMemories = filteredMemories.filter((memory) => {
        const memoryTags = memory.tags || [];
        return tags.some((tag) => memoryTags.includes(tag));
      });
    }

    // Filter by importance
    if (minImportance > 0) {
      filteredMemories = filteredMemories.filter(
        (memory) => (memory.importance || 0) >= minImportance
      );
    }

    // Filter by entity
    if (entityId) {
      filteredMemories = filteredMemories.filter(
        (memory) =>
          memory.entityId === entityId ||
          (memory.relatedEntities && memory.relatedEntities.includes(entityId))
      );
    }

    // Limit results
    return filteredMemories.slice(0, limit);
  } catch (error) {
    console.error(`Error getting memories for agent ${agentId}:`, error);
    return [];
  }
};

/**
 * Record a decision made by the agent
 * @param {string} agentId - Agent identifier
 * @param {Object} decision - Decision data
 * @return {Object} Operation result
 */
const recordDecision = async (agentId, decision) => {
  if (!decision || !decision.context || !decision.choice) {
    return {
      success: false,
      message: "Invalid decision data. Context and choice are required.",
    };
  }

  // Create a decision memory
  const decisionMemory = {
    type: MEMORY_TYPES.DECISION,
    title: decision.title || "Decision",
    content: {
      context: decision.context,
      options: decision.options || [],
      choice: decision.choice,
      rationale: decision.rationale || "",
      outcome: decision.outcome || null,
    },
    importance: decision.importance || 0.7, // Decisions are usually important
    tags: [...(decision.tags || []), "decision"],
    timestamp: new Date().toISOString(),
    addToKnowledge: decision.addToKnowledge !== false, // Default to true
  };

  // Add related entities if provided
  if (decision.entityId) {
    decisionMemory.entityId = decision.entityId;
  }

  if (decision.relatedEntities) {
    decisionMemory.relatedEntities = decision.relatedEntities;
  }

  // Add the decision as a memory
  return addMemory(agentId, decisionMemory);
};

/**
 * Record an observation made by the agent
 * @param {string} agentId - Agent identifier
 * @param {Object} observation - Observation data
 * @return {Object} Operation result
 */
const recordObservation = async (agentId, observation) => {
  if (!observation || !observation.content) {
    return {
      success: false,
      message: "Invalid observation data. Content is required.",
    };
  }

  // Create an observation memory
  const observationMemory = {
    type: MEMORY_TYPES.OBSERVATION,
    title: observation.title || "Observation",
    content:
      typeof observation.content === "string"
        ? observation.content
        : JSON.stringify(observation.content),
    importance: observation.importance || 0.5,
    tags: [...(observation.tags || []), "observation"],
    timestamp: new Date().toISOString(),
    addToKnowledge: observation.addToKnowledge !== false, // Default to true
  };

  // Add related entities if provided
  if (observation.entityId) {
    observationMemory.entityId = observation.entityId;
  }

  if (observation.relatedEntities) {
    observationMemory.relatedEntities = observation.relatedEntities;
  }

  // Add the observation as a memory
  return addMemory(agentId, observationMemory);
};

/**
 * Set agent preference
 * @param {string} agentId - Agent identifier
 * @param {string} category - Preference category
 * @param {string} key - Preference key
 * @param {any} value - Preference value
 * @return {Object} Operation result
 */
const setPreference = async (agentId, category, key, value) => {
  if (!category || !key) {
    return {
      success: false,
      message: "Invalid preference data. Category and key are required.",
    };
  }

  try {
    // Load preferences component
    const preferencesData = await loadBrainComponent(
      agentId,
      BRAIN_COMPONENTS.PREFERENCES
    );
    if (!preferencesData) {
      return {
        success: false,
        message: "Failed to load preferences component",
      };
    }

    // Create category if it doesn't exist
    if (!preferencesData[category]) {
      preferencesData[category] = {};
    }

    // Set preference
    preferencesData[category][key] = value;

    // Save updated preferences
    const saveResult = await saveBrainComponent(
      agentId,
      BRAIN_COMPONENTS.PREFERENCES,
      preferencesData
    );

    if (saveResult) {
      return {
        success: true,
        message: `Preference ${category}.${key} set successfully`,
      };
    } else {
      return {
        success: false,
        message: "Failed to save preference data",
      };
    }
  } catch (error) {
    console.error(`Error setting preference for agent ${agentId}:`, error);
    return {
      success: false,
      message: `Error setting preference: ${error.message}`,
    };
  }
};

/**
 * Get agent preferences
 * @param {string} agentId - Agent identifier
 * @param {string} category - Preference category (optional)
 * @return {Object} Preferences data
 */
const getPreferences = async (agentId, category) => {
  try {
    // Load preferences component
    const preferencesData = await loadBrainComponent(
      agentId,
      BRAIN_COMPONENTS.PREFERENCES
    );
    if (!preferencesData) {
      return null;
    }

    // Return specific category or all preferences
    if (category) {
      return preferencesData[category] || {};
    } else {
      return preferencesData;
    }
  } catch (error) {
    console.error(`Error getting preferences for agent ${agentId}:`, error);
    return null;
  }
};

/**
 * Add a rule to the agent's decision making system
 * @param {string} agentId - Agent identifier
 * @param {Object} rule - Rule data
 * @return {Object} Operation result
 */
const addRule = async (agentId, rule) => {
  if (!rule || !rule.condition || !rule.action) {
    return {
      success: false,
      message: "Invalid rule data. Condition and action are required.",
    };
  }

  try {
    // Load rules component
    const rulesData = await loadBrainComponent(agentId, BRAIN_COMPONENTS.RULES);
    if (!rulesData) {
      return {
        success: false,
        message: "Failed to load rules component",
      };
    }

    // Generate rule ID if not provided
    if (!rule.id) {
      rule.id = uuidv4();
    }

    // Add priority if not provided
    if (rule.priority === undefined) {
      rule.priority = 5; // Default medium priority
    }

    // Add created timestamp
    rule.created = new Date().toISOString();

    // Add rule
    rulesData.rules.push(rule);

    // Sort rules by priority (higher first)
    rulesData.rules.sort((a, b) => b.priority - a.priority);

    // Save updated rules
    const saveResult = await saveBrainComponent(
      agentId,
      BRAIN_COMPONENTS.RULES,
      rulesData
    );

    if (saveResult) {
      return {
        success: true,
        message: "Rule added successfully",
        ruleId: rule.id,
      };
    } else {
      return {
        success: false,
        message: "Failed to save rule data",
      };
    }
  } catch (error) {
    console.error(`Error adding rule for agent ${agentId}:`, error);
    return {
      success: false,
      message: `Error adding rule: ${error.message}`,
    };
  }
};

/**
 * Get all rules for the agent
 * @param {string} agentId - Agent identifier
 * @return {Array} Array of rules
 */
const getRules = async (agentId) => {
  try {
    // Load rules component
    const rulesData = await loadBrainComponent(agentId, BRAIN_COMPONENTS.RULES);
    if (!rulesData) {
      return [];
    }

    return rulesData.rules || [];
  } catch (error) {
    console.error(`Error getting rules for agent ${agentId}:`, error);
    return [];
  }
};

/**
 * Update agent metrics
 * @param {string} agentId - Agent identifier
 * @param {Object} metrics - Metrics to update
 * @return {Object} Operation result
 */
const updateMetrics = async (agentId, metrics) => {
  try {
    // Load metrics component
    const metricsData = await loadBrainComponent(
      agentId,
      BRAIN_COMPONENTS.METRICS
    );
    if (!metricsData) {
      return {
        success: false,
        message: "Failed to load metrics component",
      };
    }

    // Update metrics
    Object.assign(metricsData, metrics, {
      lastUpdated: new Date().toISOString(),
    });

    // Save updated metrics
    const saveResult = await saveBrainComponent(
      agentId,
      BRAIN_COMPONENTS.METRICS,
      metricsData
    );

    if (saveResult) {
      return {
        success: true,
        message: "Metrics updated successfully",
      };
    } else {
      return {
        success: false,
        message: "Failed to save metrics data",
      };
    }
  } catch (error) {
    console.error(`Error updating metrics for agent ${agentId}:`, error);
    return {
      success: false,
      message: `Error updating metrics: ${error.message}`,
    };
  }
};

/**
 * Get agent metrics
 * @param {string} agentId - Agent identifier
 * @return {Object} Metrics data
 */
const getMetrics = async (agentId) => {
  try {
    // Load metrics component
    const metricsData = await loadBrainComponent(
      agentId,
      BRAIN_COMPONENTS.METRICS
    );
    if (!metricsData) {
      return null;
    }

    return metricsData;
  } catch (error) {
    console.error(`Error getting metrics for agent ${agentId}:`, error);
    return null;
  }
};

/**
 * Record a task completion and update metrics
 * @param {string} agentId - Agent identifier
 * @param {Object} taskResult - Task result data
 * @return {Object} Operation result
 */
const recordTaskCompletion = async (agentId, taskResult) => {
  try {
    // Load metrics component
    const metrics = await getMetrics(agentId);
    if (!metrics) {
      return {
        success: false,
        message: "Failed to load metrics",
      };
    }

    // Update metrics
    metrics.taskCompletions = (metrics.taskCompletions || 0) + 1;

    // Update success rate
    const isSuccess = taskResult.success === true;
    const previousSuccesses =
      metrics.successRate * (metrics.taskCompletions - 1);
    metrics.successRate =
      (previousSuccesses + (isSuccess ? 1 : 0)) / metrics.taskCompletions;

    // Update response time if provided
    if (taskResult.responseTime) {
      const previousAverage = metrics.averageResponseTime || 0;
      metrics.averageResponseTime =
        (previousAverage * (metrics.taskCompletions - 1) +
          taskResult.responseTime) /
        metrics.taskCompletions;
    }

    // Record task completion metrics
    await updateMetrics(agentId, metrics);

    // Record task result as a memory
    const taskMemory = {
      type: MEMORY_TYPES.META,
      title: `Task Completion: ${taskResult.taskId || "Unknown Task"}`,
      content: {
        taskId: taskResult.taskId,
        description: taskResult.description,
        result: taskResult.result,
        success: isSuccess,
        timestamp: new Date().toISOString(),
      },
      importance: isSuccess ? 0.6 : 0.8, // Failed tasks are more important to remember
      tags: ["task", "completion", isSuccess ? "success" : "failure"],
      addToKnowledge: false, // Don't add task completions to knowledge
    };

    await addMemory(agentId, taskMemory);

    return {
      success: true,
      message: "Task completion recorded",
    };
  } catch (error) {
    console.error(
      `Error recording task completion for agent ${agentId}:`,
      error
    );
    return {
      success: false,
      message: `Error recording task completion: ${error.message}`,
    };
  }
};

/**
 * Query relevant information from the agent's brain for a task
 * @param {string} agentId - Agent identifier
 * @param {Object} taskContext - Task context
 * @return {Object} Retrieved knowledge for the task
 */
const retrieveKnowledgeForTask = async (agentId, taskContext) => {
  try {
    // Extract keywords and entities from the task description
    const taskDescription = taskContext.description || "";
    const taskId = taskContext.taskId;

    // Prepare result
    const result = {
      entities: [],
      memories: [],
      preferences: {},
      rules: [],
    };

    // 1. Find relevant entities based on mentions in the task
    const knownEntities = await getEntitiesByType(
      agentId,
      taskContext.entityType || "file"
    );

    // Filter entities based on simple text matching
    // This could be improved with more sophisticated matching or embeddings
    result.entities = knownEntities.filter((entity) => {
      if (entity.id && taskDescription.includes(entity.id)) return true;
      if (entity.name && taskDescription.includes(entity.name)) return true;
      if (
        entity.aliases &&
        entity.aliases.some((alias) => taskDescription.includes(alias))
      )
        return true;
      return false;
    });

    // 2. Find relevant memories
    // Get recent high-importance memories
    const highImportanceMemories = await getMemories(agentId, {
      limit: 10,
      minImportance: 0.7,
    });

    // Get entity-related memories
    const entityIds = result.entities.map((e) => e.id);
    let entityMemories = [];

    if (entityIds.length > 0) {
      entityMemories = await Promise.all(
        entityIds.map((entityId) =>
          getMemories(agentId, { entityId, limit: 5 })
        )
      );
      // Flatten array of arrays
      entityMemories = entityMemories.flat();
    }

    // Combine memories and remove duplicates
    const memoryIds = new Set();
    const addMemoryIfNew = (memory) => {
      if (!memoryIds.has(memory.id)) {
        memoryIds.add(memory.id);
        result.memories.push(memory);
      }
    };

    // Add memories in order of relevance
    highImportanceMemories.forEach(addMemoryIfNew);
    entityMemories.forEach(addMemoryIfNew);

    // 3. Get relevant preferences
    result.preferences = await getPreferences(agentId);

    // 4. Get relevant rules
    result.rules = await getRules(agentId);

    return {
      success: true,
      brainDump: result,
    };
  } catch (error) {
    console.error(
      `Error retrieving knowledge for task from agent ${agentId}:`,
      error
    );
    return {
      success: false,
      message: `Error retrieving knowledge: ${error.message}`,
      brainDump: {
        entities: [],
        memories: [],
        preferences: {},
        rules: [],
      },
    };
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
  updateMetrics,
  getMetrics,
  recordTaskCompletion,
  retrieveKnowledgeForTask,
  MEMORY_TYPES,
  BRAIN_COMPONENTS,
};
