/**
 * Enhanced Search Model
 * Provides advanced search capabilities across agent knowledge, code, and documentation
 */
const fileDB = require("./fileDB");
const path = require("path");
const fs = require("fs").promises;

// Search contexts
const SEARCH_CONTEXTS = {
  KNOWLEDGE: "knowledge",
  CODE: "code",
  DOCUMENTATION: "documentation",
  TASKS: "tasks",
  CONVERSATIONS: "conversations",
  ALL: "all",
};

// Default search options
const DEFAULT_OPTIONS = {
  limit: 20,
  offset: 0,
  sortBy: "relevance",
  minScore: 0.3,
  includeContent: true,
  highlightMatches: true,
  searchMode: "semantic", // 'semantic', 'keyword', or 'hybrid'
};

/**
 * Performs an enhanced search across multiple data sources with relevance ranking
 *
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @return {Promise<Object>} Search results with relevance scores
 */
async function searchAll(query, options = {}) {
  // Merge default options with provided options
  const searchOptions = { ...DEFAULT_OPTIONS, ...options };

  // Parse contexts
  const contexts = parseSearchContexts(
    searchOptions.contexts || SEARCH_CONTEXTS.ALL
  );

  // Results collection
  const allResults = [];

  // Perform searches in each context in parallel
  await Promise.all([
    // Knowledge collections
    contexts.includes(SEARCH_CONTEXTS.KNOWLEDGE)
      ? searchKnowledgeCollections(query, searchOptions).then((results) =>
          allResults.push(...results)
        )
      : Promise.resolve(),

    // Code repositories
    contexts.includes(SEARCH_CONTEXTS.CODE)
      ? searchCodeRepositories(query, searchOptions).then((results) =>
          allResults.push(...results)
        )
      : Promise.resolve(),

    // Documentation
    contexts.includes(SEARCH_CONTEXTS.DOCUMENTATION)
      ? searchDocumentation(query, searchOptions).then((results) =>
          allResults.push(...results)
        )
      : Promise.resolve(),

    // Tasks
    contexts.includes(SEARCH_CONTEXTS.TASKS)
      ? searchTasks(query, searchOptions).then((results) =>
          allResults.push(...results)
        )
      : Promise.resolve(),

    // Conversations
    contexts.includes(SEARCH_CONTEXTS.CONVERSATIONS)
      ? searchCollaborations(query, searchOptions).then((results) =>
          allResults.push(...results)
        )
      : Promise.resolve(),
  ]);

  // Sort results by relevance score
  allResults.sort((a, b) => b.score - a.score);

  // Apply limit and offset
  const paginatedResults = allResults
    .filter((result) => result.score >= searchOptions.minScore)
    .slice(searchOptions.offset, searchOptions.offset + searchOptions.limit);

  // Generate facets for filtering
  const facets = generateFacets(allResults);

  return {
    query,
    total: allResults.length,
    filtered: allResults.filter(
      (result) => result.score >= searchOptions.minScore
    ).length,
    results: paginatedResults,
    facets,
  };
}

/**
 * Parse search contexts from string or array
 *
 * @param {string|Array} contexts - Search contexts to include
 * @return {Array} Array of context values
 */
function parseSearchContexts(contexts) {
  if (contexts === SEARCH_CONTEXTS.ALL) {
    return Object.values(SEARCH_CONTEXTS).filter(
      (ctx) => ctx !== SEARCH_CONTEXTS.ALL
    );
  }

  if (Array.isArray(contexts)) {
    return contexts.filter((ctx) =>
      Object.values(SEARCH_CONTEXTS).includes(ctx)
    );
  }

  if (
    typeof contexts === "string" &&
    Object.values(SEARCH_CONTEXTS).includes(contexts)
  ) {
    return [contexts];
  }

  // Default to all contexts
  return Object.values(SEARCH_CONTEXTS).filter(
    (ctx) => ctx !== SEARCH_CONTEXTS.ALL
  );
}

/**
 * Generate facets for search result filtering
 *
 * @param {Array} results - All search results
 * @return {Object} Facet counts and metadata
 */
function generateFacets(results) {
  const facets = {
    types: {},
    collections: {},
    agents: {},
  };

  results.forEach((result) => {
    // Count by type
    const type = result.type || "unknown";
    facets.types[type] = (facets.types[type] || 0) + 1;

    // Count by collection
    if (result.collection) {
      facets.collections[result.collection] =
        (facets.collections[result.collection] || 0) + 1;
    }

    // Count by agent
    if (result.agent) {
      facets.agents[result.agent] = (facets.agents[result.agent] || 0) + 1;
    }
  });

  return facets;
}

/**
 * Search knowledge collections for matches
 *
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @return {Promise<Array>} Knowledge search results
 */
async function searchKnowledgeCollections(query, options) {
  const results = [];

  try {
    // Get all collection directories
    const collectionsPath = path.join(
      process.cwd(),
      ".arlo",
      "data",
      "collections"
    );
    const collections = await fileDB.listDirectories(collectionsPath);

    // Search each collection
    for (const collection of collections) {
      const collectionPath = path.join(collectionsPath, collection);
      const documents = await fileDB.listFiles(collectionPath);

      for (const doc of documents) {
        try {
          const docPath = path.join(collectionPath, doc);
          const document = await fileDB.readJSON(docPath);

          // Simple relevance calculation (would be more sophisticated in production)
          let score = 0;
          let matchDetail = "";

          // Search in content
          if (document.content && typeof document.content === "string") {
            const contentScore = calculateRelevance(
              document.content,
              query,
              options
            );
            if (contentScore > 0) {
              score = Math.max(score, contentScore);
              matchDetail = highlightMatches(document.content, query, options);
            }
          }

          // Search in metadata
          if (document.metadata) {
            // Title match (higher weight)
            if (document.metadata.title) {
              const titleScore =
                calculateRelevance(document.metadata.title, query, options) *
                1.5;
              if (titleScore > score) {
                score = titleScore;
                matchDetail = document.metadata.title;
              }
            }

            // Tags match
            if (
              document.metadata.tags &&
              Array.isArray(document.metadata.tags)
            ) {
              const tagsString = document.metadata.tags.join(" ");
              const tagScore =
                calculateRelevance(tagsString, query, options) * 1.2;
              if (tagScore > score) {
                score = tagScore;
                matchDetail = `Tags: ${document.metadata.tags.join(", ")}`;
              }
            }
          }

          // If there's a match, add to results
          if (score > 0) {
            const result = {
              id: doc.replace(".json", ""),
              type: "knowledge",
              collection,
              title: document.metadata?.title || "Untitled",
              preview: matchDetail,
              score,
              path: docPath,
              url: `/api/collections/${collection}/documents/${doc.replace(
                ".json",
                ""
              )}`,
              timestamp: document.metadata?.timestamp || null,
              metadata: document.metadata || {},
            };

            // Include content if requested
            if (options.includeContent && document.content) {
              result.content = truncateContent(document.content, 500);
            }

            results.push(result);
          }
        } catch (error) {
          console.error(
            `Error processing document ${doc} in collection ${collection}:`,
            error
          );
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error searching knowledge collections:", error);
    return [];
  }
}

/**
 * Search code repositories for matches
 *
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @return {Promise<Array>} Code search results
 */
async function searchCodeRepositories(query, options) {
  const results = [];

  try {
    // Mock code search results (would use real code search in production)
    // In a real implementation, this would scan actual code files

    // Define some example code files and their content
    const codeFiles = [
      {
        path: "/src/server/abstract/blueprint.controller.ts",
        content: `/**
 * Abstract Blueprint Controller
 * Base class for all blueprint controllers
 */
import { Loggable } from './loggable';
import { Component } from '../../types/component';

export abstract class BlueprintController extends Loggable {
  /**
   * Initialize the controller
   */
  abstract initialize(): Promise<void>;
  
  /**
   * Load components for this blueprint
   */
  abstract loadComponents(): Promise<Component[]>;
  
  /**
   * Register routes for this blueprint
   */
  abstract registerRoutes(): void;
}`,
        type: "code",
        language: "typescript",
        agent: "server",
      },
      {
        path: "/src/browser/eventing/event.bus.ts",
        content: `/**
 * Event Bus
 * Central event handling system for the framework
 */
import { EventAddress } from './event.address';
import { BlueprintEvent } from '../../types/blueprint.event';

export class EventBus {
  private subscribers: Map<string, Function[]> = new Map();
  
  /**
   * Subscribe to an event
   */
  subscribe(address: EventAddress, callback: Function): () => void {
    const key = address.toString();
    
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    
    this.subscribers.get(key).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(key) || [];
      const index = callbacks.indexOf(callback);
      if (index >= 0) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Publish an event
   */
  publish(address: EventAddress, event: BlueprintEvent): void {
    const key = address.toString();
    const callbacks = this.subscribers.get(key) || [];
    
    callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    });
  }
}`,
        type: "code",
        language: "typescript",
        agent: "browser",
      },
    ];

    // Search for matches in each code file
    for (const file of codeFiles) {
      const score = calculateRelevance(file.content, query, options);

      if (score > 0) {
        const result = {
          id: file.path,
          type: "code",
          title: path.basename(file.path),
          preview: highlightMatches(file.content, query, options),
          score,
          path: file.path,
          url: `/api/code/${encodeURIComponent(file.path)}`,
          language: file.language,
          agent: file.agent,
        };

        // Include content if requested
        if (options.includeContent) {
          result.content = truncateContent(file.content, 500);
        }

        results.push(result);
      }
    }

    return results;
  } catch (error) {
    console.error("Error searching code repositories:", error);
    return [];
  }
}

/**
 * Search documentation for matches
 *
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @return {Promise<Array>} Documentation search results
 */
async function searchDocumentation(query, options) {
  const results = [];

  try {
    // Mock documentation (would use real docs in production)
    const docs = [
      {
        id: "component-lifecycle",
        title: "Component Lifecycle",
        content: `# Component Lifecycle

Components in the framework go through several lifecycle phases:

1. **Initialization** - The component is created and its initial props are set
2. **Mounting** - The component is added to the DOM
3. **Updating** - The component's state or props change
4. **Unmounting** - The component is removed from the DOM

## Lifecycle Hooks

You can use the following lifecycle hooks:

- \`onMount(callback)\` - Called after the component has been mounted
- \`onUpdate(callback)\` - Called after the component has been updated
- \`onUnmount(callback)\` - Called before the component is removed

## Example Usage

\`\`\`js
import { onMount, onUpdate, onUnmount } from '@minimesh/core';

export function MyComponent() {
  onMount(() => {
    console.log('Component mounted');
  });
  
  onUpdate(() => {
    console.log('Component updated');
  });
  
  onUnmount(() => {
    console.log('Component unmounting');
  });
  
  return {
    view: '<div>My Component</div>'
  };
}
\`\`\``,
        type: "documentation",
        category: "components",
        tags: ["lifecycle", "components", "hooks"],
      },
      {
        id: "event-system",
        title: "Event System",
        content: `# Event System

The event system allows components to communicate with each other through a centralized event bus.

## Event Bus

The \`EventBus\` class provides a publish-subscribe pattern for event handling. It has the following methods:

- \`subscribe(address, callback)\` - Subscribe to events at the given address
- \`publish(address, event)\` - Publish an event to the given address
- \`unsubscribe(address, callback)\` - Unsubscribe from events at the given address

## Event Address

Event addresses are hierarchical and follow a pattern of \`domain:category:action\`. For example:

- \`user:auth:login\`
- \`app:navigation:change\`
- \`data:products:update\`

## Example Usage

\`\`\`js
import { EventBus, EventAddress } from '@minimesh/core';

// Create an event bus
const bus = new EventBus();

// Subscribe to events
const unsubscribe = bus.subscribe(
  new EventAddress('user:auth:login'),
  (event) => {
    console.log('User logged in:', event.data.username);
  }
);

// Publish an event
bus.publish(
  new EventAddress('user:auth:login'),
  {
    type: 'USER_LOGIN',
    data: {
      username: 'johndoe',
      timestamp: Date.now()
    }
  }
);

// Unsubscribe when no longer needed
unsubscribe();
\`\`\``,
        type: "documentation",
        category: "architecture",
        tags: ["events", "communication", "architecture"],
      },
    ];

    // Search for matches in each doc
    for (const doc of docs) {
      const score = calculateRelevance(doc.content, query, options);

      if (score > 0) {
        const result = {
          id: doc.id,
          type: "documentation",
          title: doc.title,
          preview: highlightMatches(doc.content, query, options),
          score,
          url: `/api/documentation/${doc.id}`,
          category: doc.category,
          tags: doc.tags,
        };

        // Include content if requested
        if (options.includeContent) {
          result.content = truncateContent(doc.content, 500);
        }

        results.push(result);
      }
    }

    return results;
  } catch (error) {
    console.error("Error searching documentation:", error);
    return [];
  }
}

/**
 * Search tasks for matches
 *
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @return {Promise<Array>} Task search results
 */
async function searchTasks(query, options) {
  const results = [];

  try {
    // Get all task files
    const tasksPath = path.join(process.cwd(), ".arlo", "data", "tasks");
    const taskFiles = await fileDB.listFiles(tasksPath);

    for (const taskFile of taskFiles) {
      try {
        const taskPath = path.join(tasksPath, taskFile);
        const task = await fileDB.readJSON(taskPath);

        // Calculate score from different task fields
        let score = 0;
        let matchDetail = "";

        // Check title
        if (task.title) {
          const titleScore =
            calculateRelevance(task.title, query, options) * 1.5;
          if (titleScore > score) {
            score = titleScore;
            matchDetail = task.title;
          }
        }

        // Check description
        if (task.description) {
          const descScore = calculateRelevance(
            task.description,
            query,
            options
          );
          if (descScore > score) {
            score = descScore;
            matchDetail = highlightMatches(task.description, query, options);
          }
        }

        // Check prompt
        if (task.prompt) {
          const promptScore =
            calculateRelevance(task.prompt, query, options) * 1.2;
          if (promptScore > score) {
            score = promptScore;
            matchDetail = highlightMatches(task.prompt, query, options);
          }
        }

        // Check output content
        if (task.stages && Array.isArray(task.stages)) {
          for (const stage of task.stages) {
            if (stage.output && typeof stage.output === "string") {
              const outputScore =
                calculateRelevance(stage.output, query, options) * 0.7;
              if (outputScore > score) {
                score = outputScore;
                matchDetail = highlightMatches(stage.output, query, options);
              }
            }
          }
        }

        // If there's a match, add to results
        if (score > 0) {
          const result = {
            id: task.id || taskFile.replace(".json", ""),
            type: "task",
            title: task.title || `Task ${task.id || "Unknown"}`,
            preview: matchDetail,
            score,
            status: task.status || "unknown",
            url: `/api/tasks/${task.id || taskFile.replace(".json", "")}`,
            timestamp: task.timestamp || task.createdAt || null,
            agentAssignments: task.agentAssignments || [],
          };

          results.push(result);
        }
      } catch (error) {
        console.error(`Error processing task ${taskFile}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error("Error searching tasks:", error);
    return [];
  }
}

/**
 * Search agent collaborations/conversations for matches
 *
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @return {Promise<Array>} Conversation search results
 */
async function searchCollaborations(query, options) {
  const results = [];

  try {
    // Get all collaboration files
    const collabsPath = path.join(
      process.cwd(),
      ".arlo",
      "data",
      "collaborations"
    );
    const collabFiles = await fileDB.listFiles(collabsPath);

    for (const collabFile of collabFiles) {
      try {
        const collabPath = path.join(collabsPath, collabFile);
        const collab = await fileDB.readJSON(collabPath);

        // Calculate score from content and responses
        let score = 0;
        let matchDetail = "";

        // Check main content
        if (collab.content) {
          const contentScore =
            calculateRelevance(collab.content, query, options) * 1.2;
          if (contentScore > score) {
            score = contentScore;
            matchDetail = highlightMatches(collab.content, query, options);
          }
        }

        // Check responses
        if (collab.responses && Array.isArray(collab.responses)) {
          for (const response of collab.responses) {
            if (response.content) {
              const responseScore = calculateRelevance(
                response.content,
                query,
                options
              );
              if (responseScore > score) {
                score = responseScore;
                matchDetail = highlightMatches(
                  response.content,
                  query,
                  options
                );
              }
            }
          }
        }

        // If there's a match, add to results
        if (score > 0) {
          const result = {
            id: collab.id || collabFile.replace(".json", ""),
            type: "collaboration",
            title: `Collaboration between ${collab.fromAgent} and ${
              collab.toAgent || "team"
            }`,
            preview: matchDetail,
            score,
            collaborationType: collab.type || "message",
            status: collab.status || "pending",
            url: `/api/collaborations/${
              collab.id || collabFile.replace(".json", "")
            }`,
            timestamp: collab.timestamp || null,
            fromAgent: collab.fromAgent,
            toAgent: collab.toAgent,
            team: collab.team,
          };

          results.push(result);
        }
      } catch (error) {
        console.error(`Error processing collaboration ${collabFile}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error("Error searching collaborations:", error);
    return [];
  }
}

/**
 * Calculate relevance score for a text match
 * Based on keyword frequency, proximity, and optionally semantic similarity
 *
 * @param {string} text - The text to search in
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @return {number} Relevance score between 0 and 1
 */
function calculateRelevance(text, query, options) {
  // Simple case - empty query or text
  if (!query || !text) return 0;

  // Normalize text and query
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  // Different scoring based on search mode
  switch (options.searchMode) {
    case "keyword":
      return calculateKeywordScore(normalizedText, normalizedQuery);

    case "semantic":
      // In a real implementation, this would use a vector embedding similarity
      // For now, we'll use a simplified approach
      return calculateSemanticScore(normalizedText, normalizedQuery);

    case "hybrid":
    default:
      // Combine keyword and semantic scores
      const keywordScore = calculateKeywordScore(
        normalizedText,
        normalizedQuery
      );
      const semanticScore = calculateSemanticScore(
        normalizedText,
        normalizedQuery
      );
      return keywordScore * 0.6 + semanticScore * 0.4;
  }
}

/**
 * Calculate keyword-based match score
 *
 * @param {string} text - Normalized text
 * @param {string} query - Normalized query
 * @return {number} Score between 0 and 1
 */
function calculateKeywordScore(text, query) {
  // Split query into keywords
  const keywords = query.split(/\s+/).filter((k) => k.length > 1);
  if (keywords.length === 0) return 0;

  // Calculate keyword frequencies
  let matchCount = 0;
  let exactMatchBonus = 0;

  for (const keyword of keywords) {
    // Check for exact matches (with word boundaries)
    const exactRegex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "gi");
    const exactMatches = (text.match(exactRegex) || []).length;

    // Check for partial matches
    const partialRegex = new RegExp(escapeRegExp(keyword), "gi");
    const partialMatches = (text.match(partialRegex) || []).length;

    matchCount += partialMatches;
    exactMatchBonus += exactMatches;
  }

  // Calculate proximity bonus (if query appears as a phrase)
  const phraseRegex = new RegExp(escapeRegExp(query), "gi");
  const phraseMatches = (text.match(phraseRegex) || []).length;
  const proximityBonus = phraseMatches * 0.2;

  // Calculate final score normalized by text length and keywords
  const frequencyScore = matchCount / (text.length / 20);
  const exactMatchScore = exactMatchBonus / keywords.length;

  return Math.min(
    1,
    frequencyScore * 0.3 + exactMatchScore * 0.5 + proximityBonus
  );
}

/**
 * Simplified semantic score calculation
 * In a real implementation, this would use vector embeddings for semantic search
 *
 * @param {string} text - Normalized text
 * @param {string} query - Normalized query
 * @return {number} Score between 0 and 1
 */
function calculateSemanticScore(text, query) {
  // Split query and text into tokens
  const queryTokens = query.split(/\s+/).filter((t) => t.length > 1);
  const textTokens = text.split(/\s+/).filter((t) => t.length > 1);

  if (queryTokens.length === 0 || textTokens.length === 0) return 0;

  // Calculate Jaccard similarity
  const querySet = new Set(queryTokens);
  const textSet = new Set(textTokens);

  const intersection = new Set([...querySet].filter((x) => textSet.has(x)));
  const union = new Set([...querySet, ...textSet]);

  return intersection.size / union.size;
}

/**
 * Highlight matches in the search result preview
 *
 * @param {string} text - The original text
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @return {string} Text with matches highlighted or a relevant snippet
 */
function highlightMatches(text, query, options) {
  if (!options.highlightMatches) {
    return truncateContent(text, 200);
  }

  // Find best matching section
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);
  if (queryWords.length === 0) {
    return truncateContent(text, 200);
  }

  // Split text into sentences
  const sentences = text.split(/[.!?][\s\n]+/);

  // Score each sentence for relevance to query
  const scoredSentences = sentences.map((sentence, index) => {
    const sentenceLower = sentence.toLowerCase();

    // Count matches for each query word
    let matchCount = 0;
    for (const word of queryWords) {
      if (sentenceLower.includes(word)) {
        matchCount++;
      }
    }

    // Calculate score based on matches and position
    const positionScore = Math.max(0, 1 - index / sentences.length);
    const matchScore = matchCount / queryWords.length;

    return {
      sentence,
      score: matchScore * 0.7 + positionScore * 0.3,
    };
  });

  // Sort sentences by score and take top ones
  scoredSentences.sort((a, b) => b.score - a.score);
  const bestSentences = scoredSentences.slice(0, 2);

  // Ensure we have enough content
  if (bestSentences.length === 0) {
    return truncateContent(text, 200);
  }

  // Create preview with highlight markers
  let preview = bestSentences.map(({ sentence }) => sentence).join(". ");

  // Add ellipsis if we're not showing the beginning
  if (sentences[0] !== bestSentences[0].sentence) {
    preview = "... " + preview;
  }

  // Add ending period if needed
  if (!preview.match(/[.!?]$/)) {
    preview += ".";
  }

  // Add ending ellipsis if we're not showing the end
  if (
    sentences[sentences.length - 1] !==
    bestSentences[bestSentences.length - 1].sentence
  ) {
    preview += " ...";
  }

  // Highlight all query words
  for (const word of queryWords) {
    if (word.length < 3) continue; // Skip very short words

    const regex = new RegExp(`(${escapeRegExp(word)})`, "gi");
    preview = preview.replace(regex, "**$1**");
  }

  return preview;
}

/**
 * Truncate content to a specified length
 *
 * @param {string} content - The content to truncate
 * @param {number} maxLength - Maximum length
 * @return {string} Truncated content with ellipsis
 */
function truncateContent(content, maxLength) {
  if (!content || content.length <= maxLength) {
    return content;
  }

  // Try to find a sentence break
  const truncated = content.substring(0, maxLength);
  const lastSentenceBreak = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?")
  );

  if (lastSentenceBreak > maxLength * 0.7) {
    // Use sentence break if it's far enough into the text
    return content.substring(0, lastSentenceBreak + 1) + " ...";
  }

  // Otherwise find a word break
  const lastWordBreak = truncated.lastIndexOf(" ");
  return content.substring(0, lastWordBreak) + " ...";
}

/**
 * Escape special characters in a string for use in a regular expression
 *
 * @param {string} string - String to escape
 * @return {string} Escaped string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  SEARCH_CONTEXTS,
  searchAll,
  searchKnowledgeCollections,
  searchCodeRepositories,
  searchDocumentation,
  searchTasks,
  searchCollaborations,
};
