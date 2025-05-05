/**
 * AI Service
 * Service for interacting with AI models via multiple providers (Ollama, OpenAI, Claude, etc.)
 */

const axios = require("axios");
const { createError } = require("../utils/errorUtils");

// Provider configuration
const PROVIDER_CONFIG = {
  ollama: {
    endpoint: process.env.OLLAMA_ENDPOINT || "http://localhost:11434",
    defaultModel: process.env.OLLAMA_DEFAULT_MODEL || "codellama:7b-code",
    apiKey: null, // Ollama doesn't need API key
  },
  openai: {
    endpoint:
      process.env.OPENAI_ENDPOINT ||
      "https://api.openai.com/v1/chat/completions",
    defaultModel: process.env.OPENAI_DEFAULT_MODEL || "gpt-4",
    apiKey: process.env.OPENAI_API_KEY,
  },
  anthropic: {
    endpoint:
      process.env.ANTHROPIC_ENDPOINT || "https://api.anthropic.com/v1/messages",
    defaultModel:
      process.env.ANTHROPIC_DEFAULT_MODEL || "claude-3-sonnet-20240229",
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  // Add other providers as needed
};

// Default provider from environment or fallback to Ollama
const DEFAULT_PROVIDER = process.env.DEFAULT_AI_PROVIDER || "ollama";

// API timeout from environment or fallback to 2 minutes
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT, 10) || 120000;

/**
 * AI Service for interacting with multiple AI model providers
 */
class AIService {
  constructor() {
    this.axios = axios.create({
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Cache for responses to avoid redundant queries
    this.responseCache = new Map();
    this.cacheMaxSize = parseInt(process.env.CACHE_MAX_SIZE, 10) || 1000;
    this.cacheExpiryMs =
      parseInt(process.env.CACHE_EXPIRY_MS, 10) || 60 * 60 * 1000; // 1 hour default

    console.log(`AI Service initialized with provider: ${DEFAULT_PROVIDER}`);
    console.log(
      `Cache config: max size=${this.cacheMaxSize}, expiry=${this.cacheExpiryMs}ms`
    );
  }

  /**
   * Generate a completion from an AI model
   * @param {Object} options - Completion options
   * @param {string} options.prompt - The prompt to send to the model
   * @param {string} options.model - The model name to use
   * @param {string} options.provider - The provider to use (ollama, openai, anthropic)
   * @param {number} options.temperature - Temperature (0-1)
   * @param {number} options.maxTokens - Maximum tokens to generate
   * @param {boolean} options.useCache - Whether to use cached responses
   * @return {Promise<string>} The generated completion text
   */
  async generateCompletion(options) {
    const {
      prompt,
      model,
      provider = DEFAULT_PROVIDER,
      temperature = 0.2,
      maxTokens = 2000,
      useCache = true,
    } = options;

    // Get provider config
    const providerConfig =
      PROVIDER_CONFIG[provider] || PROVIDER_CONFIG[DEFAULT_PROVIDER];
    const modelToUse = model || providerConfig.defaultModel;

    try {
      // Check cache first if enabled
      if (useCache) {
        const cacheKey = this.generateCacheKey(
          prompt,
          modelToUse,
          provider,
          temperature,
          maxTokens
        );
        const cachedResponse = this.getFromCache(cacheKey);

        if (cachedResponse) {
          return cachedResponse;
        }
      }

      // Generate based on provider
      let result;

      switch (provider) {
        case "ollama":
          result = await this.generateOllamaCompletion(
            prompt,
            modelToUse,
            temperature,
            maxTokens
          );
          break;
        case "openai":
          result = await this.generateOpenAICompletion(
            prompt,
            modelToUse,
            temperature,
            maxTokens
          );
          break;
        case "anthropic":
          result = await this.generateAnthropicCompletion(
            prompt,
            modelToUse,
            temperature,
            maxTokens
          );
          break;
        default:
          result = await this.generateOllamaCompletion(
            prompt,
            modelToUse,
            temperature,
            maxTokens
          );
      }

      // Cache the response if enabled
      if (useCache) {
        const cacheKey = this.generateCacheKey(
          prompt,
          modelToUse,
          provider,
          temperature,
          maxTokens
        );
        this.addToCache(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error(`AI model error (${provider}/${modelToUse}):`, error);
      throw createError(`AI model error: ${error.message}`, "AI_ERROR");
    }
  }

  /**
   * Generate completion using Ollama
   * @param {string} prompt - The prompt text
   * @param {string} model - The model name
   * @param {number} temperature - Temperature value
   * @param {number} maxTokens - Maximum tokens
   * @return {Promise<string>} Generation result
   */
  async generateOllamaCompletion(prompt, model, temperature, maxTokens) {
    const config = PROVIDER_CONFIG.ollama;

    const response = await this.axios.post(`${config.endpoint}/api/generate`, {
      model,
      prompt,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    });

    if (!response.data || !response.data.response) {
      throw createError("Failed to get response from Ollama", "AI_ERROR");
    }

    return response.data.response;
  }

  /**
   * Generate completion using OpenAI
   * @param {string} prompt - The prompt text
   * @param {string} model - The model name
   * @param {number} temperature - Temperature value
   * @param {number} maxTokens - Maximum tokens
   * @return {Promise<string>} Generation result
   */
  async generateOpenAICompletion(prompt, model, temperature, maxTokens) {
    const config = PROVIDER_CONFIG.openai;

    if (!config.apiKey) {
      throw createError("OpenAI API key not configured", "CONFIG_ERROR");
    }

    const response = await this.axios.post(
      config.endpoint,
      {
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant specialized in software development.",
          },
          { role: "user", content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      }
    );

    if (
      !response.data ||
      !response.data.choices ||
      !response.data.choices[0].message
    ) {
      throw createError("Failed to get response from OpenAI", "AI_ERROR");
    }

    return response.data.choices[0].message.content;
  }

  /**
   * Generate completion using Anthropic's Claude
   * @param {string} prompt - The prompt text
   * @param {string} model - The model name
   * @param {number} temperature - Temperature value
   * @param {number} maxTokens - Maximum tokens
   * @return {Promise<string>} Generation result
   */
  async generateAnthropicCompletion(prompt, model, temperature, maxTokens) {
    const config = PROVIDER_CONFIG.anthropic;

    if (!config.apiKey) {
      throw createError("Anthropic API key not configured", "CONFIG_ERROR");
    }

    const response = await this.axios.post(
      config.endpoint,
      {
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature,
      },
      {
        headers: {
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
        },
      }
    );

    if (
      !response.data ||
      !response.data.content ||
      !response.data.content[0].text
    ) {
      throw createError("Failed to get response from Anthropic", "AI_ERROR");
    }

    return response.data.content[0].text;
  }

  /**
   * Generate a code analysis
   * @param {string} code - The code to analyze
   * @param {string} language - The language of the code
   * @param {string} question - The specific question to answer about the code
   * @return {Promise<string>} The analysis result
   */
  async analyzeCode(code, language, question) {
    const prompt = `
You are a code analysis expert for ${language} code. 
Analyze the following code and ${question}

\`\`\`${language}
${code}
\`\`\`

Your analysis:
`;

    return this.generateCompletion({
      prompt,
      temperature: 0.1, // Lower temperature for factual analysis
      useCache: true, // Cache code analysis results
    });
  }

  /**
   * Generate a plan for implementing a task
   * @param {Object} task - The task object
   * @param {string} codebaseContext - Context about the codebase
   * @return {Promise<Object>} The generated plan
   */
  async generateTaskPlan(task, codebaseContext) {
    const prompt = `
You are a software engineering planning expert. Given this task and codebase context, 
create a detailed implementation plan. Break down the task into concrete steps.

# Task
${task.title}

${task.description}

# Codebase Context
${codebaseContext}

# Implementation Plan Format
1. Provide an overview of the approach.
2. List each step with file paths that need modification.
3. For each file change, describe what needs to be added, modified, or deleted.
4. Include any tests that need to be created or updated.
5. Note any potential risks or edge cases to handle.

Your detailed implementation plan:
`;

    const planText = await this.generateCompletion({
      prompt,
      temperature: 0.2,
      maxTokens: 4000, // Longer context for detailed plans
      useCache: false, // Don't cache plans as they should be fresh
    });

    // Parse the plan text into structured format
    return this.parseImplementationPlan(planText);
  }

  /**
   * Parse a text implementation plan into structured format
   * @param {string} planText - The raw plan text
   * @return {Object} Structured plan object
   */
  parseImplementationPlan(planText) {
    // Basic parsing - in production would use more robust parsing
    const sections = planText.split(/\n#+\s+/);

    const planObj = {
      overview: "",
      steps: [],
      risks: [],
      tests: [],
    };

    // Extract sections
    sections.forEach((section) => {
      const lines = section.trim().split("\n");
      const sectionTitle = lines[0].toLowerCase();

      if (
        sectionTitle.includes("overview") ||
        sectionTitle.includes("approach")
      ) {
        planObj.overview = lines.slice(1).join("\n").trim();
      } else if (
        sectionTitle.includes("step") ||
        sectionTitle.includes("implementation")
      ) {
        // Parse steps - this is a simplistic approach
        const stepLines = lines.slice(1);
        let currentStep = null;

        stepLines.forEach((line) => {
          // Check if line starts a new step (number followed by period)
          if (/^\d+\./.test(line)) {
            if (currentStep) {
              planObj.steps.push(currentStep);
            }
            currentStep = {
              description: line.replace(/^\d+\.\s*/, ""),
              files: [],
              details: "",
            };
          } else if (
            line.includes(".js") ||
            line.includes(".ts") ||
            line.includes(".jsx") ||
            line.includes(".tsx")
          ) {
            // Line contains a file reference
            const file = line.match(/[a-zA-Z0-9\/_.-]+\.(js|ts|jsx|tsx)/)[0];
            if (currentStep && !currentStep.files.includes(file)) {
              currentStep.files.push(file);
            }
          } else if (currentStep) {
            // Add to current step details
            currentStep.details += line + "\n";
          }
        });

        // Add the last step
        if (currentStep) {
          planObj.steps.push(currentStep);
        }
      } else if (
        sectionTitle.includes("risk") ||
        sectionTitle.includes("edge")
      ) {
        planObj.risks = lines
          .slice(1)
          .filter((line) => line.trim().length > 0)
          .map((line) => line.replace(/^-\s*/, ""));
      } else if (sectionTitle.includes("test")) {
        planObj.tests = lines
          .slice(1)
          .filter((line) => line.trim().length > 0)
          .map((line) => line.replace(/^-\s*/, ""));
      }
    });

    return planObj;
  }

  /**
   * Generate code implementation for a task step
   * @param {Object} step - The task step to implement
   * @param {string} fileContext - Context about the file to modify
   * @return {Promise<string>} The generated code implementation
   */
  async generateCodeImplementation(step, fileContext) {
    const prompt = `
You are an expert software engineer implementing a task in a codebase.
Generate code for the following step, considering the current file content.

# Step Description
${step.description}

# File Context (Current Content)
\`\`\`
${fileContext}
\`\`\`

# Implementation Details
${step.details}

Generate the code implementation for this step. Provide ONLY the code to add or modify,
using proper syntax, indentation, and following the style of the existing code.
Do not include explanations or extra formatting.
`;

    return this.generateCompletion({
      prompt,
      temperature: 0.1, // Low temperature for precise code
      maxTokens: 3000, // Longer for code generation
      useCache: false, // Don't cache implementations
    });
  }

  /**
   * Validate a code change
   * @param {string} oldCode - The original code
   * @param {string} newCode - The new code
   * @param {Object} step - The step being implemented
   * @return {Promise<Object>} Validation result
   */
  async validateCodeChange(oldCode, newCode, step) {
    const prompt = `
You are a code reviewer validating a code change. 
Review the changes and identify any issues, bugs, or improvements.

# Implementation Step
${step.description}

# Original Code
\`\`\`
${oldCode}
\`\`\`

# New Code
\`\`\`
${newCode}
\`\`\`

Provide a validation report with the following sections:
1. Valid (Yes/No)
2. Issues Found (list any bugs, errors, or problems)
3. Suggestions (list any improvements)
4. Security Concerns (list any security issues)
`;

    const validationText = await this.generateCompletion({
      prompt,
      temperature: 0.1,
      useCache: false,
    });

    // Parse the validation text
    const valid = validationText.toLowerCase().includes("valid: yes");
    const issues = this.extractSection(validationText, "Issues Found");
    const suggestions = this.extractSection(validationText, "Suggestions");
    const securityConcerns = this.extractSection(
      validationText,
      "Security Concerns"
    );

    return {
      valid,
      issues,
      suggestions,
      securityConcerns,
      hasIssues: issues.length > 0 || securityConcerns.length > 0,
    };
  }

  /**
   * Extract a section from validation text
   * @param {string} text - The validation text
   * @param {string} sectionName - The name of the section to extract
   * @return {Array<string>} Array of items in the section
   */
  extractSection(text, sectionName) {
    const sectionRegex = new RegExp(
      `${sectionName}[:\\s]*(.*?)(?:^\\d+\\.|$)`,
      "is"
    );
    const match = text.match(sectionRegex);

    if (!match || !match[1]) {
      return [];
    }

    return match[1]
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.length > 0 &&
          !line.startsWith("#") &&
          !line.startsWith(sectionName)
      )
      .map((line) => line.replace(/^-\s*/, ""));
  }

  /**
   * Generate a cache key for a query
   * @param {string} prompt - The prompt
   * @param {string} model - The model name
   * @param {string} provider - The AI provider
   * @param {number} temperature - The temperature
   * @param {number} maxTokens - The maximum tokens
   * @return {string} The cache key
   */
  generateCacheKey(prompt, model, provider, temperature, maxTokens) {
    // Create a hash of the key components
    // In production, use a proper hashing function
    return `${provider}_${model}_${temperature}_${Math.floor(
      maxTokens / 100
    )}_${prompt.substring(0, 100)}`;
  }

  /**
   * Get a value from the cache
   * @param {string} key - The cache key
   * @return {string|null} The cached value or null
   */
  getFromCache(key) {
    const cachedItem = this.responseCache.get(key);

    if (!cachedItem) {
      return null;
    }

    // Check if expired
    if (Date.now() - cachedItem.timestamp > this.cacheExpiryMs) {
      this.responseCache.delete(key);
      return null;
    }

    return cachedItem.value;
  }

  /**
   * Add a value to the cache
   * @param {string} key - The cache key
   * @param {string} value - The value to cache
   */
  addToCache(key, value) {
    // If cache is full, remove oldest item
    if (this.responseCache.size >= this.cacheMaxSize) {
      const oldestKey = Array.from(this.responseCache.keys())[0];
      this.responseCache.delete(oldestKey);
    }

    this.responseCache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }
}

module.exports = new AIService();
