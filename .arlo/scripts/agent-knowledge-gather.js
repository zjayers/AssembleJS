/**
 * Agent Knowledge Gathering Script
 *
 * This script helps agents connect to AI to gather domain knowledge
 * about their specialized areas of the AssembleJS framework.
 */

const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

// Import file database
const fileDB = require("../api/models/fileDB");

// Agent definitions with their specialized directories
const agents = [
  {
    name: "Analyzer",
    sourceDirs: ["/src/analyzer/"],
    description: "Performance optimization specialist",
  },
  {
    name: "Browser",
    sourceDirs: ["/src/browser/"],
    description: "Frontend architecture expert",
  },
  {
    name: "Bundler",
    sourceDirs: ["/src/bundler/"],
    description: "Build system specialist",
  },
  {
    name: "Developer",
    sourceDirs: ["/src/developer/"],
    description: "Development tooling expert",
  },
  {
    name: "Generator",
    sourceDirs: ["/src/generator/"],
    description: "Code scaffolding specialist",
  },
  {
    name: "Server",
    sourceDirs: ["/src/server/"],
    description: "Backend architecture expert",
  },
  {
    name: "Types",
    sourceDirs: ["/src/types/"],
    description: "Type system design specialist",
  },
  {
    name: "Utils",
    sourceDirs: ["/src/utils/"],
    description: "Utility function expert",
  },
];

// Other agents without specific source directories
const generalAgents = [
  {
    name: "Admin",
    description: "Project coordinator and workflow orchestrator",
  },
  {
    name: "Config",
    description: "Configuration and system settings expert",
    sourceDirs: ["/*.json", "/*.js", "/*.cjs", "/src/config/"],
  },
  {
    name: "Git",
    description:
      "Repository management, PR creation, and version control expert",
  },
  {
    name: "Pipeline",
    description: "GitHub Actions workflow and CI/CD pipeline manager",
    sourceDirs: ["/.github/workflows/"],
  },
  {
    name: "Docs",
    description: "Documentation and knowledge management specialist",
    sourceDirs: ["/docs/", "/websites/www.assemblejs.com/public/custom-docs/"],
  },
  {
    name: "Testbed",
    description: "Testbed project management specialist",
    sourceDirs: ["/testbed/"],
  },
  {
    name: "Validator",
    description: "Quality assurance and testing specialist",
    sourceDirs: ["/src/__tests__/"],
  },
  {
    name: "Version",
    description: "Package versioning and dependency management expert",
  },
  {
    name: "ARLO",
    description: "Self-maintenance and ARLO system enhancement specialist",
    sourceDirs: ["/.arlo/"],
  },
];

// Combine all agents
const allAgents = [...agents, ...generalAgents];

// Base directory (2 levels up from script location)
const baseDir = path.resolve(__dirname, "../..");

// Knowledge topics by agent type
const knowledgeTopics = {
  Analyzer: [
    "Performance metrics and standards",
    "Page Speed Insights API integration",
    "Lighthouse scoring mechanisms",
    "Performance optimization techniques",
  ],
  Browser: [
    "Client-side architecture patterns",
    "Framework-agnostic component design",
    "Event management systems",
    "Browser API integration",
  ],
  Bundler: [
    "Build process optimization",
    "Asset bundling strategies",
    "Development server configuration",
    "Production build pipelines",
  ],
  Developer: [
    "Developer experience tools",
    "UI design and development panels",
    "Developer workflow optimization",
    "Template design patterns",
  ],
  Generator: [
    "Code scaffolding utilities",
    "Project template systems",
    "Component generation",
    "Plop.js integration and customization",
  ],
  Server: [
    "Server-side rendering architecture",
    "Route and controller management",
    "Fastify framework integration",
    "Hook system design and middleware",
  ],
  Types: [
    "TypeScript interface design",
    "Generic type patterns",
    "Type safety mechanisms",
    "Declaration file organization",
  ],
  Utils: [
    "Common utility function design",
    "Functional programming patterns",
    "Cross-cutting concern management",
    "High-performance utility implementation",
  ],
  Admin: [
    "Project management methodologies",
    "Task organization and delegation",
    "Workflow orchestration",
    "Multi-agent coordination",
  ],
  Config: [
    "Configuration management strategies",
    "Environment-specific settings",
    "Configuration validation techniques",
    "Secret and credential management",
  ],
  Git: [
    "Git workflow best practices",
    "Pull request management",
    "Semantic commit messages",
    "Version control strategies",
  ],
  Pipeline: [
    "CI/CD pipeline design",
    "GitHub Actions workflow configuration",
    "Automated testing integration",
    "Deployment strategies",
  ],
  Docs: [
    "Documentation frameworks",
    "API documentation standards",
    "Tutorial and example creation",
    "Knowledge organization systems",
  ],
  Testbed: [
    "Integration testing methodologies",
    "Test environment isolation",
    "Example application organization",
    "Testbed project configuration",
  ],
  Validator: [
    "Testing frameworks and methodologies",
    "Test coverage metrics",
    "Unit and integration testing",
    "Quality assurance workflows",
  ],
  Version: [
    "Semantic versioning",
    "Dependency management",
    "Package publishing",
    "Breaking change management",
  ],
  ARLO: [
    "Agent system architecture",
    "Knowledge base design",
    "Self-improvement mechanisms",
    "User interface for AI agents",
  ],
};

// Analyze source code for an agent
async function analyzeAgentSourceCode(agent) {
  console.log(`Analyzing source code for ${agent.name} agent...`);

  const sourceInfo = [];

  // Skip if no source directories defined
  if (!agent.sourceDirs || agent.sourceDirs.length === 0) {
    return {
      agent: agent.name,
      directoryStructure: "No specific source directories",
      fileCount: 0,
      keyFiles: [],
      codeExamples: [],
    };
  }

  try {
    // Process each source directory
    for (const dir of agent.sourceDirs) {
      const fullPath = path.join(baseDir, dir);

      // Check if directory exists
      try {
        await fs.access(fullPath);
      } catch (e) {
        console.log(`Directory ${fullPath} does not exist, skipping...`);
        continue;
      }

      // Get directory structure
      const dirStructure = await execPromise(
        `find ${fullPath} -type f -name "*.ts" -o -name "*.js" | sort`
      );
      const files = dirStructure.stdout.split("\n").filter(Boolean);

      // Extract key files (main classes, interfaces, etc.)
      const keyFiles = files.filter((file) => {
        const basename = path.basename(file);
        return (
          basename.includes(".controller.") ||
          basename.includes(".client.") ||
          basename.includes(".factory.") ||
          basename.includes(".service.") ||
          basename.includes(".model.") ||
          basename.includes(".utils.") ||
          file.includes("/index.ts") ||
          file.includes("/index.js")
        );
      });

      // Sample a few key files to get code examples
      const codeExamples = [];
      for (const file of keyFiles.slice(0, 3)) {
        try {
          const content = await fs.readFile(file, "utf8");
          // Extract a representative snippet (first 20 lines)
          const snippet = content.split("\n").slice(0, 20).join("\n");
          codeExamples.push({
            file: path.relative(baseDir, file),
            snippet,
          });
        } catch (err) {
          console.error(`Error reading file ${file}:`, err);
        }
      }

      sourceInfo.push({
        directory: dir,
        fileCount: files.length,
        keyFiles: keyFiles.map((f) => path.relative(baseDir, f)),
        codeExamples,
      });
    }

    return {
      agent: agent.name,
      sourceInfo,
    };
  } catch (error) {
    console.error(`Error analyzing source code for ${agent.name}:`, error);
    return {
      agent: agent.name,
      error: error.message,
    };
  }
}

// Generate knowledge for an agent
async function generateAgentKnowledge(agent, analysisResults) {
  console.log(`Generating knowledge for ${agent.name} agent...`);

  // Get topics for this agent
  const topics = knowledgeTopics[agent.name] || [
    "Framework architecture",
    "Component design",
    "Best practices",
    "Common patterns",
  ];

  // Generate synthetic knowledge documents
  const documents = [];

  // Add agent overview document
  documents.push({
    content: `# ${agent.name} Agent Overview
    
${agent.description} for the AssembleJS framework.

## Primary Responsibilities

* ${topics.join("\n* ")}

## Expertise Areas

The ${
      agent.name
    } agent specializes in providing expert knowledge and assistance with the AssembleJS framework's ${agent.name.toLowerCase()} subsystems and related functionality.

${
  analysisResults.sourceInfo
    ? `
## Source Code Structure

The ${agent.name} agent is responsible for the following directories:

${analysisResults.sourceInfo
  .map((info) => `- \`${info.directory}\` (${info.fileCount} files)`)
  .join("\n")}
`
    : ""
}

## Key Files

${
  analysisResults.sourceInfo &&
  analysisResults.sourceInfo.length > 0 &&
  analysisResults.sourceInfo[0].keyFiles.length > 0
    ? analysisResults.sourceInfo[0].keyFiles
        .slice(0, 5)
        .map((file) => `- \`${file}\``)
        .join("\n")
    : "No key files identified."
}
`,
    metadata: {
      title: `${agent.name} Agent Overview`,
      type: "documentation",
      tags: ["overview", agent.name.toLowerCase(), "agent"],
      timestamp: new Date().toISOString(),
    },
  });

  // Add topic-specific documents
  for (const topic of topics) {
    documents.push({
      content: `# ${topic}
      
## Overview

This document covers ${topic.toLowerCase()} within the AssembleJS framework, with a focus on the areas managed by the ${
        agent.name
      } Agent.

## Key Concepts

* ${topic} provides essential functionality for the framework
* Best practices for implementing ${topic.toLowerCase()}
* Integration points with other parts of the framework

## Implementation Details

${
  analysisResults.sourceInfo &&
  analysisResults.sourceInfo.length > 0 &&
  analysisResults.sourceInfo[0].codeExamples.length > 0
    ? `### Code Example

\`\`\`typescript
${analysisResults.sourceInfo[0].codeExamples[0].snippet}
\`\`\`

This example from \`${analysisResults.sourceInfo[0].codeExamples[0].file}\` demonstrates a typical implementation pattern.`
    : "Implementation details will be added as the agent learns more about this topic."
}

## Best Practices

* Follow established patterns for consistency
* Ensure proper error handling
* Document public APIs thoroughly
* Write comprehensive tests
`,
      metadata: {
        title: topic,
        type: "documentation",
        tags: [
          topic.toLowerCase().replace(/\s+/g, "-"),
          agent.name.toLowerCase(),
          "best-practices",
        ],
        timestamp: new Date().toISOString(),
      },
    });
  }

  return documents;
}

// Store agent knowledge in the database
async function storeAgentKnowledge(agentName, documents) {
  console.log(
    `Storing ${documents.length} knowledge documents for ${agentName} agent...`
  );

  try {
    // Initialize database if needed
    await fileDB.initDatabase();

    // Add each document to the agent's collection
    const results = [];
    for (const doc of documents) {
      const result = await fileDB.addAgentKnowledge(agentName, doc);
      results.push(result);

      // Log result
      if (result.success) {
        console.log(
          `✅ Added document "${doc.metadata.title}" to ${agentName}'s knowledge base`
        );
      } else {
        console.error(
          `❌ Failed to add document "${doc.metadata.title}": ${result.message}`
        );
      }
    }

    return results;
  } catch (error) {
    console.error(`Error storing knowledge for ${agentName}:`, error);
    throw error;
  }
}

// Main function to gather knowledge for all agents
async function gatherAllAgentKnowledge() {
  console.log("Starting agent knowledge gathering process...");

  // Process each agent
  for (const agent of allAgents) {
    try {
      console.log(`\n=== Processing ${agent.name} Agent ===\n`);

      // Analyze source code
      const analysisResults = await analyzeAgentSourceCode(agent);

      // Generate knowledge documents
      const documents = await generateAgentKnowledge(agent, analysisResults);

      // Store knowledge in database
      await storeAgentKnowledge(agent.name, documents);

      console.log(
        `\n✅ Completed knowledge gathering for ${agent.name} Agent\n`
      );
    } catch (error) {
      console.error(`\n❌ Error processing ${agent.name} Agent:`, error);
    }
  }

  console.log("\nAgent knowledge gathering process completed.");
}

// Run the main function if script is executed directly
if (require.main === module) {
  gatherAllAgentKnowledge()
    .then(() => {
      console.log("Agent knowledge gathering completed successfully.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error in agent knowledge gathering:", error);
      process.exit(1);
    });
} else {
  // Export functions for use in other modules
  module.exports = {
    analyzeAgentSourceCode,
    generateAgentKnowledge,
    storeAgentKnowledge,
    gatherAllAgentKnowledge,
  };
}
