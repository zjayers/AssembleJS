/**
 * Analytics Controller
 * Handles analytics API endpoints for system usage reporting
 */
const analytics = require("../models/analytics");

/**
 * Get search analytics summary
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getSearchAnalytics(req, res) {
  try {
    const { days, limit } = req.query;

    const options = {
      days: days ? parseInt(days, 10) : 30,
      limit: limit ? parseInt(limit, 10) : 10,
    };

    const summary = await analytics.getSearchAnalyticsSummary(options);

    if (!summary) {
      return res.status(500).json({
        success: false,
        message: "Failed to get search analytics",
      });
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error getting search analytics:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while getting search analytics",
      error: error.message,
    });
  }
}

/**
 * Get task analytics summary
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTaskAnalytics(req, res) {
  try {
    const { days } = req.query;

    const options = {
      days: days ? parseInt(days, 10) : 30,
    };

    const summary = await analytics.getTaskAnalyticsSummary(options);

    if (!summary) {
      return res.status(500).json({
        success: false,
        message: "Failed to get task analytics",
      });
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error getting task analytics:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while getting task analytics",
      error: error.message,
    });
  }
}

/**
 * Get agent analytics summary
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAgentAnalytics(req, res) {
  try {
    const { days } = req.query;

    const options = {
      days: days ? parseInt(days, 10) : 30,
    };

    const summary = await analytics.getAgentAnalyticsSummary(options);

    if (!summary) {
      return res.status(500).json({
        success: false,
        message: "Failed to get agent analytics",
      });
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error getting agent analytics:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while getting agent analytics",
      error: error.message,
    });
  }
}

/**
 * Get system usage analytics summary
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getUsageAnalytics(req, res) {
  try {
    const { days } = req.query;

    const options = {
      days: days ? parseInt(days, 10) : 30,
    };

    const summary = await analytics.getUsageAnalyticsSummary(options);

    if (!summary) {
      return res.status(500).json({
        success: false,
        message: "Failed to get usage analytics",
      });
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error getting usage analytics:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while getting usage analytics",
      error: error.message,
    });
  }
}

/**
 * Get overall system analytics dashboard data
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getDashboardAnalytics(req, res) {
  try {
    const { days } = req.query;
    const period = days ? parseInt(days, 10) : 30;

    // Get all analytics summaries in parallel
    const [search, tasks, agents, usage] = await Promise.all([
      analytics.getSearchAnalyticsSummary({ days: period }),
      analytics.getTaskAnalyticsSummary({ days: period }),
      analytics.getAgentAnalyticsSummary({ days: period }),
      analytics.getUsageAnalyticsSummary({ days: period }),
    ]);

    // Combine into a dashboard object
    const dashboard = {
      period,
      overview: {
        totalSearches: search?.totalSearches || 0,
        tasksCreated: tasks?.tasksCreated || 0,
        tasksCompleted: tasks?.tasksCompleted || 0,
        knowledgeViews: usage?.knowledgeViews || 0,
        collaborations: agents?.collaborations?.total || 0,
        systemErrors: usage?.errors || 0,
      },
      search,
      tasks,
      agents,
      usage,
    };

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Error getting dashboard analytics:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while getting dashboard analytics",
      error: error.message,
    });
  }
}

/**
 * Track a search query
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function trackSearch(req, res) {
  try {
    const { query, options, resultCount } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const event = await analytics.trackSearch(query, options, resultCount);

    if (!event) {
      return res.status(500).json({
        success: false,
        message: "Failed to track search",
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Error tracking search:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while tracking search",
      error: error.message,
    });
  }
}

/**
 * Track a general analytics event
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function trackEvent(req, res) {
  try {
    const { eventType, eventData } = req.body;

    if (
      !eventType ||
      !Object.values(analytics.EVENT_TYPES).includes(eventType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid event type is required",
      });
    }

    const event = await analytics.trackEvent(eventType, eventData);

    if (!event) {
      return res.status(500).json({
        success: false,
        message: "Failed to track event",
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Error tracking event:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while tracking event",
      error: error.message,
    });
  }
}

module.exports = {
  getSearchAnalytics,
  getTaskAnalytics,
  getAgentAnalytics,
  getUsageAnalytics,
  getDashboardAnalytics,
  trackSearch,
  trackEvent,
};
