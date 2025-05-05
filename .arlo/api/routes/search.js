/**
 * Search Routes
 * API routes for enhanced search functionality
 */
const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

// Get search results - route is /api/search/ instead of /api/search/search
router.get("/", searchController.search);

// Get search suggestions for autocomplete
router.get("/suggestions", searchController.getSuggestions);

// Get popular searches
router.get("/popular", searchController.getPopularSearches);

// Get search analytics
router.get("/analytics", searchController.getSearchAnalytics);

// Get code suggestions
router.post("/code-suggestions", searchController.getCodeSuggestions);

module.exports = router;
