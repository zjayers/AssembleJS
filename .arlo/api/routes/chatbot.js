/**
 * Chatbot API Routes
 * These routes are designed for public access with API key protection
 */

const express = require("express");
const router = express.Router();
const fileDB = require("../models/fileDB");
const { asyncHandler } = require("../utils/errorUtils");
const { createValidationError } = require("../middleware/errorHandler");

// API key middleware for protecting public endpoints
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || req.query.api_key;

  // Check if API key is provided and valid
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "API key is required",
    });
  }

  // Validate API key against environment variable or other secure storage
  // For production, use a better mechanism than a single env var (rotating keys, etc.)
  const validApiKey = process.env.CHATBOT_API_KEY;

  if (!validApiKey || apiKey !== validApiKey) {
    return res.status(403).json({
      success: false,
      error: "Invalid API key",
    });
  }

  next();
};

// Apply API key auth to all routes in this router
router.use(apiKeyAuth);

// Rate limiting configuration
const rateLimit = require("express-rate-limit");

const chatbotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
});

// Apply rate limiting to all routes
router.use(chatbotLimiter);

// GET route for health check and API verification
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "AssembleJS Chatbot API is running",
    version: "1.0.0",
  });
});

// Query all agent knowledge to answer a question
router.post(
  "/query",
  asyncHandler(async (req, res) => {
    const { query, limit = 10 } = req.body;

    if (!query || typeof query !== "string" || query.trim().length < 3) {
      throw createValidationError(
        "Query must be a string with at least 3 characters"
      );
    }

    // Get agent list for cross-agent search
    const agents = fileDB.agents || [];

    // Collect results from all agents
    const results = [];
    const alreadyIncludedIds = new Set();

    // Search all agent knowledge, using Promise.all for parallel requests
    await Promise.all(
      agents.map(async (agentName) => {
        try {
          const agentResults = await fileDB.queryAgentKnowledge(
            agentName,
            query,
            limit
          );

          // Add non-duplicate results with agent attribution
          agentResults.forEach((result) => {
            // Skip duplicate results by document ID
            if (alreadyIncludedIds.has(result.id)) {
              return;
            }

            // Add agent source to result
            result.agent = agentName;
            results.push(result);
            alreadyIncludedIds.add(result.id);
          });
        } catch (error) {
          console.error(`Error querying agent ${agentName}:`, error);
          // Continue with other agents even if one fails
        }
      })
    );

    // Sort results by relevance score
    results.sort((a, b) => b.score - a.score);

    // Only return the top results based on limit
    const limitedResults = results.slice(0, limit);

    res.json({
      success: true,
      query,
      count: limitedResults.length,
      results: limitedResults,
    });
  })
);

// Get specific documentation by ID
router.get(
  "/document/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      throw createValidationError("Document ID is required");
    }

    // Get agent list for searching
    const agents = fileDB.agents || [];
    let document = null;

    // Search for document across all agents
    for (const agentName of agents) {
      try {
        const agentKnowledge = await fileDB.getAgentKnowledge(
          agentName,
          100,
          1,
          "timestamp",
          "desc"
        );

        if (agentKnowledge && agentKnowledge.documents) {
          document = agentKnowledge.documents.find((doc) => doc.id === id);

          if (document) {
            // Add agent attribution
            document.agent = agentName;
            break;
          }
        }
      } catch (error) {
        console.error(
          `Error searching ${agentName} for document ${id}:`,
          error
        );
        // Continue with other agents
      }
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        error: `Document with ID ${id} not found`,
      });
    }

    res.json({
      success: true,
      document,
    });
  })
);

// Get a list of topics (knowledge categories)
router.get(
  "/topics",
  asyncHandler(async (req, res) => {
    // Get agent list
    const agents = fileDB.agents || [];

    // Collect all topics and counts
    const topicMap = new Map();

    // Process each agent's knowledge base
    await Promise.all(
      agents.map(async (agentName) => {
        try {
          const agentKnowledge = await fileDB.getAgentKnowledge(
            agentName,
            100,
            1,
            "timestamp",
            "desc"
          );

          if (agentKnowledge && agentKnowledge.documents) {
            agentKnowledge.documents.forEach((doc) => {
              if (doc.metadata && doc.metadata.tags) {
                doc.metadata.tags.forEach((tag) => {
                  const currentCount = topicMap.get(tag) || 0;
                  topicMap.set(tag, currentCount + 1);
                });
              }
            });
          }
        } catch (error) {
          console.error(`Error collecting topics from ${agentName}:`, error);
          // Continue with other agents
        }
      })
    );

    // Convert map to array of objects
    const topics = Array.from(topicMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    // Sort by count in descending order
    topics.sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      count: topics.length,
      topics,
    });
  })
);

module.exports = router;
