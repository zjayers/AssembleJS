/**
 * Analytics Model
 * Collects and analyzes system usage data for reporting
 */
const fileDB = require("./fileDB");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Path to analytics data
const ANALYTICS_PATH = path.join(process.cwd(), ".arlo", "data", "analytics");
const SEARCH_ANALYTICS_PATH = path.join(ANALYTICS_PATH, "search");
const TASK_ANALYTICS_PATH = path.join(ANALYTICS_PATH, "tasks");
const AGENT_ANALYTICS_PATH = path.join(ANALYTICS_PATH, "agents");
const USAGE_ANALYTICS_PATH = path.join(ANALYTICS_PATH, "usage");

// Event types
const EVENT_TYPES = {
  SEARCH: "search",
  TASK_CREATED: "task_created",
  TASK_COMPLETED: "task_completed",
  AGENT_ACTIVATED: "agent_activated",
  COLLABORATION_CREATED: "collaboration_created",
  KNOWLEDGE_VIEWED: "knowledge_viewed",
  CODE_SUGGESTION: "code_suggestion",
  SYSTEM_ERROR: "system_error",
};

/**
 * Initialize analytics directories
 */
async function initialize() {
  try {
    // Ensure all required directories exist
    await fileDB.ensureDirectory(ANALYTICS_PATH);
    await fileDB.ensureDirectory(SEARCH_ANALYTICS_PATH);
    await fileDB.ensureDirectory(TASK_ANALYTICS_PATH);
    await fileDB.ensureDirectory(AGENT_ANALYTICS_PATH);
    await fileDB.ensureDirectory(USAGE_ANALYTICS_PATH);

    console.log("Analytics system initialized");

    return true;
  } catch (error) {
    console.error("Error initializing analytics:", error);
    return false;
  }
}

/**
 * Track an analytics event
 *
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Event data
 * @return {Promise<Object>} The recorded event
 */
async function trackEvent(eventType, eventData = {}) {
  try {
    if (!Object.values(EVENT_TYPES).includes(eventType)) {
      throw new Error(`Invalid event type: ${eventType}`);
    }

    // Create event object
    const event = {
      id: uuidv4(),
      type: eventType,
      timestamp: new Date().toISOString(),
      data: eventData,
    };

    // Determine where to store the event
    let storagePath;

    switch (eventType) {
      case EVENT_TYPES.SEARCH:
        storagePath = path.join(SEARCH_ANALYTICS_PATH, `${event.id}.json`);
        break;

      case EVENT_TYPES.TASK_CREATED:
      case EVENT_TYPES.TASK_COMPLETED:
        storagePath = path.join(TASK_ANALYTICS_PATH, `${event.id}.json`);
        break;

      case EVENT_TYPES.AGENT_ACTIVATED:
      case EVENT_TYPES.COLLABORATION_CREATED:
        storagePath = path.join(AGENT_ANALYTICS_PATH, `${event.id}.json`);
        break;

      default:
        storagePath = path.join(USAGE_ANALYTICS_PATH, `${event.id}.json`);
    }

    // Save the event
    await fileDB.writeJSON(storagePath, event);

    // Return the event
    return event;
  } catch (error) {
    console.error("Error tracking event:", error);
    return null;
  }
}

/**
 * Track a search query
 *
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @param {number} resultCount - Number of results found
 * @return {Promise<Object>} The recorded event
 */
async function trackSearch(query, options = {}, resultCount = 0) {
  return trackEvent(EVENT_TYPES.SEARCH, {
    query,
    options,
    resultCount,
    emptyResults: resultCount === 0,
  });
}

/**
 * Get search analytics summary
 *
 * @param {Object} options - Query options
 * @return {Promise<Object>} Analytics summary
 */
async function getSearchAnalyticsSummary(options = {}) {
  try {
    const { days = 30, limit = 10 } = options;

    // Get all search events from the specified period
    const events = await getEventsFromPeriod(SEARCH_ANALYTICS_PATH, days);

    // Filter for search events
    const searchEvents = events.filter(
      (event) => event.type === EVENT_TYPES.SEARCH
    );

    // Calculate analytics
    const queryCounts = {};
    let totalEmptyResults = 0;
    let totalResults = 0;

    searchEvents.forEach((event) => {
      const query = event.data.query.toLowerCase();
      queryCounts[query] = (queryCounts[query] || 0) + 1;

      if (event.data.emptyResults) {
        totalEmptyResults++;
      }

      totalResults += event.data.resultCount || 0;
    });

    // Get top queries
    const topQueries = Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));

    // Get query distribution by context
    const queryDistribution = {};

    searchEvents.forEach((event) => {
      if (event.data.options && event.data.options.contexts) {
        const contexts = Array.isArray(event.data.options.contexts)
          ? event.data.options.contexts
          : [event.data.options.contexts];

        contexts.forEach((context) => {
          queryDistribution[context] = (queryDistribution[context] || 0) + 1;
        });
      }
    });

    // Generate time series
    const timeSeries = generateTimeSeries(searchEvents, days);

    return {
      totalSearches: searchEvents.length,
      uniqueQueries: Object.keys(queryCounts).length,
      topQueries,
      queryDistribution,
      timeSeries,
      emptyResults: totalEmptyResults,
      averageResultsPerQuery:
        searchEvents.length > 0 ? totalResults / searchEvents.length : 0,
    };
  } catch (error) {
    console.error("Error getting search analytics:", error);
    return null;
  }
}

/**
 * Get task analytics summary
 *
 * @param {Object} options - Query options
 * @return {Promise<Object>} Analytics summary
 */
async function getTaskAnalyticsSummary(options = {}) {
  try {
    const { days = 30 } = options;

    // Get all task events from the specified period
    const events = await getEventsFromPeriod(TASK_ANALYTICS_PATH, days);

    // Calculate analytics
    const taskCreatedEvents = events.filter(
      (event) => event.type === EVENT_TYPES.TASK_CREATED
    );
    const taskCompletedEvents = events.filter(
      (event) => event.type === EVENT_TYPES.TASK_COMPLETED
    );

    // Get agent distribution
    const agentDistribution = {};

    taskCreatedEvents.forEach((event) => {
      if (event.data.agentAssignments) {
        Object.keys(event.data.agentAssignments).forEach((agentId) => {
          agentDistribution[agentId] = (agentDistribution[agentId] || 0) + 1;
        });
      }
    });

    // Calculate completion rates
    let completionTimeTotal = 0;
    let completionCount = 0;

    taskCompletedEvents.forEach((event) => {
      if (event.data.taskId && event.data.startTime) {
        const startTime = new Date(event.data.startTime).getTime();
        const endTime = new Date(event.timestamp).getTime();

        if (startTime && endTime && startTime < endTime) {
          const completionTime = (endTime - startTime) / 1000; // in seconds
          completionTimeTotal += completionTime;
          completionCount++;
        }
      }
    });

    // Generate time series
    const timeSeries = generateTimeSeries(
      [...taskCreatedEvents, ...taskCompletedEvents],
      days
    );

    return {
      tasksCreated: taskCreatedEvents.length,
      tasksCompleted: taskCompletedEvents.length,
      completionRate:
        taskCreatedEvents.length > 0
          ? (taskCompletedEvents.length / taskCreatedEvents.length) * 100
          : 0,
      averageCompletionTime:
        completionCount > 0 ? completionTimeTotal / completionCount : 0,
      agentDistribution,
      timeSeries,
    };
  } catch (error) {
    console.error("Error getting task analytics:", error);
    return null;
  }
}

/**
 * Get agent analytics summary
 *
 * @param {Object} options - Query options
 * @return {Promise<Object>} Analytics summary
 */
async function getAgentAnalyticsSummary(options = {}) {
  try {
    const { days = 30 } = options;

    // Get all agent events from the specified period
    const events = await getEventsFromPeriod(AGENT_ANALYTICS_PATH, days);

    // Calculate analytics
    const agentActivatedEvents = events.filter(
      (event) => event.type === EVENT_TYPES.AGENT_ACTIVATED
    );
    const collaborationEvents = events.filter(
      (event) => event.type === EVENT_TYPES.COLLABORATION_CREATED
    );

    // Get agent activation counts
    const agentActivations = {};

    agentActivatedEvents.forEach((event) => {
      if (event.data.agentId) {
        agentActivations[event.data.agentId] =
          (agentActivations[event.data.agentId] || 0) + 1;
      }
    });

    // Get collaboration counts
    const collaborationCounts = {
      total: collaborationEvents.length,
      byType: {},
    };

    collaborationEvents.forEach((event) => {
      if (event.data.type) {
        collaborationCounts.byType[event.data.type] =
          (collaborationCounts.byType[event.data.type] || 0) + 1;
      }
    });

    // Get agent interaction network
    const interactionNetwork = {};

    collaborationEvents.forEach((event) => {
      if (event.data.fromAgent && event.data.toAgent) {
        const key = `${event.data.fromAgent}-${event.data.toAgent}`;
        interactionNetwork[key] = (interactionNetwork[key] || 0) + 1;
      }
    });

    // Format interaction network for visualization
    const networkEdges = Object.entries(interactionNetwork).map(
      ([key, value]) => {
        const [source, target] = key.split("-");
        return { source, target, value };
      }
    );

    return {
      agentActivations,
      mostActiveAgent:
        Object.entries(agentActivations).sort((a, b) => b[1] - a[1])[0] || null,
      collaborations: collaborationCounts,
      interactionNetwork: networkEdges,
    };
  } catch (error) {
    console.error("Error getting agent analytics:", error);
    return null;
  }
}

/**
 * Get system usage analytics summary
 *
 * @param {Object} options - Query options
 * @return {Promise<Object>} Analytics summary
 */
async function getUsageAnalyticsSummary(options = {}) {
  try {
    const { days = 30 } = options;

    // Get all usage events from the specified period
    const events = await getEventsFromPeriod(USAGE_ANALYTICS_PATH, days);

    // Calculate analytics
    const knowledgeViewedEvents = events.filter(
      (event) => event.type === EVENT_TYPES.KNOWLEDGE_VIEWED
    );
    const codeSuggestionEvents = events.filter(
      (event) => event.type === EVENT_TYPES.CODE_SUGGESTION
    );
    const errorEvents = events.filter(
      (event) => event.type === EVENT_TYPES.SYSTEM_ERROR
    );

    // Get knowledge view counts
    const knowledgeViews = {};

    knowledgeViewedEvents.forEach((event) => {
      if (event.data.documentId) {
        knowledgeViews[event.data.documentId] =
          (knowledgeViews[event.data.documentId] || 0) + 1;
      }
    });

    // Get top viewed documents
    const topDocuments = Object.entries(knowledgeViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([documentId, count]) => ({ documentId, count }));

    // Get error distribution
    const errorTypes = {};

    errorEvents.forEach((event) => {
      if (event.data.errorType) {
        errorTypes[event.data.errorType] =
          (errorTypes[event.data.errorType] || 0) + 1;
      }
    });

    return {
      knowledgeViews: knowledgeViewedEvents.length,
      codeSuggestions: codeSuggestionEvents.length,
      errors: errorEvents.length,
      topDocuments,
      errorTypes,
    };
  } catch (error) {
    console.error("Error getting usage analytics:", error);
    return null;
  }
}

/**
 * Get analytics events from a specified time period
 *
 * @param {string} directory - Directory to search
 * @param {number} days - Number of days to look back
 * @return {Promise<Array>} Events from the period
 */
async function getEventsFromPeriod(directory, days) {
  try {
    // Calculate the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffTime = cutoffDate.getTime();

    // Get all event files
    const files = await fileDB.listFiles(directory);
    const events = [];

    for (const file of files) {
      try {
        const event = await fileDB.readJSON(path.join(directory, file));

        // Check if the event is within the time period
        const eventTime = new Date(event.timestamp).getTime();
        if (eventTime >= cutoffTime) {
          events.push(event);
        }
      } catch (error) {
        console.error(`Error reading event file ${file}:`, error);
      }
    }

    return events;
  } catch (error) {
    console.error("Error getting events from period:", error);
    return [];
  }
}

/**
 * Generate time series data from events
 *
 * @param {Array} events - Events to analyze
 * @param {number} days - Number of days to include
 * @return {Array} Time series data points
 */
function generateTimeSeries(events, days) {
  const timeSeries = [];
  const today = new Date();

  // Create a map of dates to event counts
  const dateCountMap = {};

  // Initialize all dates in the period with zero counts
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    dateCountMap[dateString] = 0;
  }

  // Count events by date
  events.forEach((event) => {
    const dateString = event.timestamp.split("T")[0];
    if (dateCountMap[dateString] !== undefined) {
      dateCountMap[dateString]++;
    }
  });

  // Convert to array format
  Object.entries(dateCountMap).forEach(([date, count]) => {
    timeSeries.push({ date, count });
  });

  // Sort by date ascending
  timeSeries.sort((a, b) => new Date(a.date) - new Date(b.date));

  return timeSeries;
}

module.exports = {
  EVENT_TYPES,
  initialize,
  trackEvent,
  trackSearch,
  getSearchAnalyticsSummary,
  getTaskAnalyticsSummary,
  getAgentAnalyticsSummary,
  getUsageAnalyticsSummary,
};
