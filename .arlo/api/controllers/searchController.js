/**
 * Search Controller
 * Handles enhanced search API endpoints with relevance ranking and analytics
 */
const enhancedSearch = require("../models/enhancedSearch");
const {
  asyncHandler,
  requireValue,
  validators,
} = require("../utils/errorUtils");
const { createValidationError } = require("../middleware/errorHandler");

/**
 * Perform a search across all available contexts
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const search = asyncHandler(async (req, res) => {
  // Get the query parameter
  const { q, context, limit, offset, mode, includeContent } = req.query;

  // Validate query using utility - will throw an error if invalid
  if (!q || typeof q !== "string" || q.trim().length === 0) {
    throw createValidationError("A search query is required");
  }

  // Parse context (default to all)
  let contexts = context || enhancedSearch.SEARCH_CONTEXTS.ALL;

  if (context && context.includes(",")) {
    contexts = context.split(",").map((c) => c.trim());
  }

  // Set up options
  const searchOptions = {
    contexts,
    limit: limit ? parseInt(limit, 10) : 20,
    offset: offset ? parseInt(offset, 10) : 0,
    searchMode: mode || "hybrid",
    includeContent: includeContent === "true",
    highlightMatches: true,
    minScore: 0.3,
  };

  // Log search query for analytics
  console.log(`Search query: "${q}" with options:`, searchOptions);

  // Perform the search
  const results = await enhancedSearch.searchAll(q, searchOptions);

  // Return results
  res.json({
    success: true,
    query: q,
    total: results.total,
    filtered: results.filtered,
    results: results.results,
    facets: results.facets,
  });
});

/**
 * Get search suggestions based on partial input
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSuggestions = asyncHandler(async (req, res) => {
  const { q, type } = req.query;

  // Validate query using utility
  if (!q || typeof q !== "string" || q.trim().length === 0) {
    throw createValidationError("A query term is required");
  }

  // For now, use mock suggestions
  // In a real implementation, this would query from a suggestions database
  const suggestions = generateSuggestions(q, type);

  res.json({
    success: true,
    query: q,
    suggestions,
  });
});

/**
 * Generate search suggestions for a partial query
 *
 * @param {string} query - The partial query
 * @param {string} type - The suggestion type
 * @return {Array} Array of suggestion objects
 */
function generateSuggestions(query, type) {
  const lowerQuery = query.toLowerCase();

  // Sample suggestions for demo purposes
  const allSuggestions = {
    component: [
      "component lifecycle",
      "component rendering",
      "component props",
      "component state",
      "component events",
    ],
    event: [
      "event system",
      "event bus",
      "event handling",
      "event propagation",
      "event delegation",
    ],
    render: [
      "rendering engine",
      "render function",
      "render pipeline",
      "server-side rendering",
      "client-side rendering",
    ],
    blue: [
      "blueprint",
      "blueprint controller",
      "blueprint server",
      "blueprint client",
      "blueprint event",
    ],
    api: [
      "api endpoints",
      "api authentication",
      "api documentation",
      "api versioning",
      "api rate limiting",
    ],
  };

  // Find matching prefixes
  const matchingSuggestions = [];

  for (const [prefix, suggestions] of Object.entries(allSuggestions)) {
    if (prefix.startsWith(lowerQuery)) {
      // Add all suggestions for this prefix
      matchingSuggestions.push(...suggestions);
    } else {
      // Add individual suggestions that match
      suggestions.forEach((suggestion) => {
        if (suggestion.toLowerCase().includes(lowerQuery)) {
          matchingSuggestions.push(suggestion);
        }
      });
    }
  }

  // Limit to 5 suggestions with metadata
  return matchingSuggestions.slice(0, 5).map((suggestion) => ({
    text: suggestion,
    type: type || "suggestion",
    weight: calculateSuggestionWeight(suggestion, lowerQuery),
  }));
}

/**
 * Calculate a suggestion weight/relevance
 *
 * @param {string} suggestion - The suggestion text
 * @param {string} query - The query text
 * @return {number} Weight value between 0 and 1
 */
function calculateSuggestionWeight(suggestion, query) {
  const lowerSuggestion = suggestion.toLowerCase();

  // Exact starts with match gets highest weight
  if (lowerSuggestion.startsWith(query)) {
    return 1.0;
  }

  // Word starts with match gets high weight
  const words = lowerSuggestion.split(" ");
  for (const word of words) {
    if (word.startsWith(query)) {
      return 0.9;
    }
  }

  // Contains match gets medium weight
  if (lowerSuggestion.includes(query)) {
    return 0.7;
  }

  // Lowest weight for other matches
  return 0.5;
}

/**
 * Get recent popular searches
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPopularSearches = asyncHandler(async (req, res) => {
  // In a real implementation, this would query from an analytics database
  // For demo, use mock popular searches
  const popularSearches = [
    { query: "component lifecycle", count: 42 },
    { query: "event system", count: 38 },
    { query: "blueprint server", count: 31 },
    { query: "server side rendering", count: 27 },
    { query: "routing", count: 25 },
  ];

  res.json({
    success: true,
    searches: popularSearches,
  });
});

/**
 * Get basic search analytics
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSearchAnalytics = asyncHandler(async (req, res) => {
  // In a real implementation, this would query from an analytics database
  // For demo, use mock analytics data
  const analytics = {
    totalSearches: 427,
    uniqueQueries: 183,
    topQueries: [
      { query: "component lifecycle", count: 42 },
      { query: "event system", count: 38 },
      { query: "blueprint server", count: 31 },
      { query: "server side rendering", count: 27 },
      { query: "routing", count: 25 },
    ],
    queryDistribution: {
      code: 142,
      knowledge: 156,
      documentation: 98,
      tasks: 31,
    },
    timeSeries: generateMockTimeSeries(),
    emptyResults: 17,
    averageResultsPerQuery: 12.4,
  };

  res.json({
    success: true,
    analytics,
  });
});

/**
 * Generate mock time series data
 *
 * @return {Array} Time series data points
 */
function generateMockTimeSeries() {
  const data = [];
  const now = new Date();

  // Generate data for the last 14 days
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split("T")[0],
      searches: Math.floor(Math.random() * 40) + 20,
    });
  }

  return data;
}

/**
 * Get code suggestions based on user input
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCodeSuggestions = asyncHandler(async (req, res) => {
  const { context, input } = req.body;

  // Validate inputs using utilities
  if (!context || !input) {
    throw createValidationError("Context and input are required", {
      context: !context ? "Context is required" : undefined,
      input: !input ? "Input is required" : undefined,
    });
  }

  // In a real implementation, this would use a code suggestion model
  // For demo, use mock code suggestions
  const suggestions = generateCodeSuggestions(context, input);

  res.json({
    success: true,
    suggestions,
  });
});

/**
 * Generate code suggestions based on context and input
 *
 * @param {string} context - The code context
 * @param {string} input - The user input
 * @return {Array} Suggestions
 */
function generateCodeSuggestions(context, input) {
  // Simple pattern matching for demonstration
  if (context.includes("EventBus") && input.toLowerCase().includes("sub")) {
    return [
      {
        text: "subscribe(address, callback)",
        description: "Subscribe to events at the given address",
        kind: "method",
      },
      {
        text: "subscribers.get(key)",
        description: "Get subscribers for a key",
        kind: "property",
      },
    ];
  }

  if (context.includes("Component") && input.toLowerCase().includes("on")) {
    return [
      {
        text: "onMount(() => { })",
        description: "Called after component is mounted to the DOM",
        kind: "method",
      },
      {
        text: "onUpdate(() => { })",
        description: "Called after component is updated",
        kind: "method",
      },
      {
        text: "onUnmount(() => { })",
        description: "Called before component is removed from the DOM",
        kind: "method",
      },
    ];
  }

  // Default suggestions
  return [
    {
      text: "function () { }",
      description: "Anonymous function",
      kind: "snippet",
    },
    {
      text: "console.log()",
      description: "Log to console",
      kind: "method",
    },
  ];
}

module.exports = {
  search,
  getSuggestions,
  getPopularSearches,
  getSearchAnalytics,
  getCodeSuggestions,
};
