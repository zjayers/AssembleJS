import VectorDB from "./vectordb.js";

// Pipeline steps data
let pipelineSteps = [];

// Initialize pipeline for a new task
function initializePipeline(taskId, tasks, currentTaskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  // Define a smooth rainbow color spectrum for agents (same as in initAgentsView)
  const agentColors = {
    Admin: "#F44336", // Red
    Types: "#E91E63", // Pink
    Utils: "#9C27B0", // Purple
    Validator: "#673AB7", // Deep Purple
    Developer: "#3F51B5", // Indigo
    Browser: "#2196F3", // Blue
    Version: "#03A9F4", // Light Blue
    Server: "#00BCD4", // Cyan
    Testbed: "#009688", // Teal
    Pipeline: "#4CAF50", // Green
    Generator: "#8BC34A", // Light Green
    Config: "#CDDC39", // Lime
    Docs: "#FFEB3B", // Yellow
    Git: "#FFC107", // Amber
    Analyzer: "#FF9800", // Orange
    Bundler: "#FF5722", // Deep Orange
    ARLO: "#607D8B", // Blue Grey - Meta agent for ARLO itself
  };

  pipelineSteps = [
    {
      name: "Admin Analysis",
      status: "pending",
      time: "0s",
      details: "Analyzing task requirements...",
      agent: "Admin",
      color: agentColors.Admin,
    },
    {
      name: "Planning",
      status: "waiting",
      time: "-",
      details: "Determining specialist agents needed",
      agent: "Config",
      color: agentColors.Config,
    },
    {
      name: "Execution",
      status: "waiting",
      time: "-",
      details: "Code changes by specialist agents",
      agent: "Developer",
      color: agentColors.Developer,
    },
    {
      name: "Validation",
      status: "waiting",
      time: "-",
      details: "Testing and quality assurance",
      agent: "Validator",
      color: agentColors.Validator,
    },
    {
      name: "Git Operations",
      status: "waiting",
      time: "-",
      details: "Creating PR and code review",
      agent: "Git",
      color: agentColors.Git,
    },
  ];

  // Add logs
  task.logs.push(`[${new Date().toLocaleTimeString()}] Pipeline initialized`);
  task.logs.push(
    `[${new Date().toLocaleTimeString()}] Admin agent analyzing task...`
  );

  // Start simulated pipeline progress
  updatePipeline(taskId, tasks, currentTaskId);
  renderPipeline();
}

// Update pipeline status
function updatePipeline(taskId, tasks, currentTaskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task || task.status !== "pending") return;

  // Simulate pipeline progress
  const currentStep = pipelineSteps.findIndex(
    (step) => step.status === "pending"
  );

  if (currentStep >= 0) {
    // Simulate step completion after a delay
    setTimeout(async () => {
      pipelineSteps[currentStep].status = "success";
      pipelineSteps[currentStep].time = `${
        Math.floor(Math.random() * 60) + 10
      }s`;
      task.logs.push(
        `[${new Date().toLocaleTimeString()}] Completed step: ${
          pipelineSteps[currentStep].name
        }`
      );

      // Simulate the agent adding knowledge to its collection
      const currentAgent = pipelineSteps[currentStep].agent;
      if (currentAgent) {
        try {
          // Generate some synthetic knowledge based on the step
          let agentKnowledge = "";

          switch (currentStep) {
            case 0: // Admin Analysis
              agentKnowledge = `Task Analysis: ${task.description}\n\nThis task requires the following agents:\n- Config agent for environment setup\n- Developer agent for code implementation\n- Validator agent for testing\n- Git agent for PR creation`;
              break;
            case 1: // Planning
              agentKnowledge = `Task Plan for task ${task.id}:\n\n1. Analyze the requirements\n2. Prepare development environment\n3. Implement requested functionality\n4. Test the changes\n5. Create pull request`;
              break;
            case 2: // Execution
              agentKnowledge = `Code implementation notes for task ${task.id}:\n\nImplemented the following changes:\n- Updated UI components\n- Added vector database integration\n- Fixed styling issues\n- Added file upload capabilities`;
              break;
            case 3: // Validation
              agentKnowledge = `Test results for task ${task.id}:\n\nAll tests passing:\n- Unit tests: 32 passed\n- Integration tests: 8 passed\n- E2E tests: 3 passed\n\nCode coverage: 94%`;
              break;
            case 4: // Git Operations
              agentKnowledge = `Pull request created for task ${task.id}:\n\nPR #123 - Knowledge Base UI and Vector DB Integration\n\nChanges:\n- Added Knowledge Base UI\n- Integrated ChromaDB\n- Added agent-specific collections\n- Improved styling`;
              break;
          }

          // Add knowledge to the agent's collection
          await VectorDB.addAgentKnowledge(currentAgent, {
            document: agentKnowledge,
            metadata: {
              type: "task_knowledge",
              task_id: task.id.toString(),
              step: pipelineSteps[currentStep].name,
              timestamp: new Date().toISOString(),
            },
          });

          task.logs.push(
            `[${new Date().toLocaleTimeString()}] ${currentAgent} agent added knowledge to its collection`
          );
        } catch (knowledgeError) {
          console.error(
            `Error adding ${currentAgent} agent knowledge:`,
            knowledgeError
          );
          task.logs.push(
            `[${new Date().toLocaleTimeString()}] Error adding ${currentAgent} agent knowledge: ${
              knowledgeError.message
            }`
          );
        }
      }

      // Start next step if available
      if (currentStep < pipelineSteps.length - 1) {
        pipelineSteps[currentStep + 1].status = "pending";
        task.logs.push(
          `[${new Date().toLocaleTimeString()}] Starting step: ${
            pipelineSteps[currentStep + 1].name
          }`
        );
        renderPipeline();

        // Continue pipeline
        updatePipeline(taskId, tasks, currentTaskId);
      } else {
        // Pipeline complete
        task.status = "success";
        task.response =
          "Task completed successfully! PR created: https://github.com/example/repo/pull/123";
        task.logs.push(
          `[${new Date().toLocaleTimeString()}] Pipeline completed successfully`
        );

        // Add final knowledge to Git agent about task completion
        try {
          await VectorDB.addAgentKnowledge("Git", {
            document: `Task ${task.id} completed successfully. PR #123 created for "${task.description}". Ready for review.`,
            metadata: {
              type: "task_completion",
              task_id: task.id.toString(),
              timestamp: new Date().toISOString(),
              pr_number: "123",
            },
          });
          task.logs.push(
            `[${new Date().toLocaleTimeString()}] Git agent recorded task completion`
          );
        } catch (error) {
          console.error("Error recording task completion:", error);
        }

        window.updateTaskHistory();
        renderPipeline();
      }

      // If current task is shown, update the details
      if (currentTaskId === taskId) {
        window.showTaskDetails(taskId);
      }
    }, 3000); // Simulated delay
  }

  renderPipeline();
}

// Render pipeline steps
function renderPipeline() {
  const pipelineContainer = document.getElementById("pipeline-steps");
  if (!pipelineContainer) return;

  pipelineContainer.innerHTML = pipelineSteps
    .map(
      (step) => `
        <div class="pipeline-step">
            <div class="pipeline-step-header">
                <div class="pipeline-step-icon task-status-${
                  step.status
                }"></div>
                ${step.name}
            </div>
            <div class="pipeline-step-body">
                <div class="pipeline-step-avatar" style="background-color: ${
                  step.color
                };">
                    ${step.agent.charAt(0)}
                </div>
                <div class="pipeline-step-content">
                    ${step.details}
                </div>
                <div class="pipeline-step-time">
                    ${
                      step.status === "pending"
                        ? '<div class="spinner"></div> Running...'
                        : step.time
                    }
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Calculate pipeline progress percentage for a task
function calculatePipelineProgress(task) {
  if (!pipelineSteps || !pipelineSteps.length) return 0;

  const completedSteps = pipelineSteps.filter(
    (step) => step.status === "success"
  ).length;
  const pendingSteps = pipelineSteps.filter(
    (step) => step.status === "pending"
  ).length;

  return ((completedSteps + pendingSteps * 0.5) / pipelineSteps.length) * 100;
}

export {
  initializePipeline,
  updatePipeline,
  renderPipeline,
  pipelineSteps,
  calculatePipelineProgress,
};
