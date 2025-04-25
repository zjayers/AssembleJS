import VectorDB from './vectordb.js';
import { initializePipeline, updatePipeline, calculatePipelineProgress } from './pipeline.js';

// Task history data
let tasks = [];
let currentTaskId = null;
let taskIdCounter = 1;

// Submit a new task
async function submitTask(e) {
    e.preventDefault();
    
    const taskDescription = document.getElementById('task-description').value.trim();
    if (!taskDescription) return;
    
    // Disable submit button and show loading state
    const submitButton = document.querySelector('#task-form button[type="submit"]');
    const originalButtonText = submitButton.innerText;
    submitButton.disabled = true;
    submitButton.innerHTML = '<div class="spinner"></div> Processing...';
    
    try {
        const response = await fetch('/api/admin/task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task_description: taskDescription }),
        });
        
        const result = await response.json();
        
        // Create a new task in history
        const newTask = {
            id: taskIdCounter++,
            title: taskDescription.length > 60 ? taskDescription.substring(0, 60) + '...' : taskDescription,
            description: taskDescription,
            status: 'pending',
            timestamp: new Date().toISOString(),
            response: result.response,
            logs: [`[${new Date().toLocaleTimeString()}] Task submitted: ${taskDescription}`]
        };
        
        tasks.unshift(newTask);
        currentTaskId = newTask.id;
        
        // Store task in Admin agent's knowledge base
        try {
            await VectorDB.addAgentKnowledge("Admin", {
                document: taskDescription,
                metadata: {
                    type: "task",
                    task_id: newTask.id.toString(),
                    timestamp: newTask.timestamp,
                    status: newTask.status
                }
            });
            newTask.logs.push(`[${new Date().toLocaleTimeString()}] Task stored in Admin agent knowledge base`);
        } catch (knowledgeError) {
            console.error('Error storing task in knowledge base:', knowledgeError);
            newTask.logs.push(`[${new Date().toLocaleTimeString()}] Error storing task in knowledge base: ${knowledgeError.message}`);
        }
        
        // Clear form
        document.getElementById('task-description').value = '';
        
        // Update UI
        updateTaskHistory();
        showTaskDetails(newTask.id);
        initializePipeline(newTask.id, tasks, currentTaskId);
        
    } catch (error) {
        console.error('Error submitting task:', error);
        // Show error in details section
        const taskDetails = document.getElementById('task-details-body');
        if (taskDetails) {
            taskDetails.innerHTML = `
                <div class="error-message">
                    <p>There was a problem processing your request: ${error.message}</p>
                </div>
            `;
        }
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.innerText = originalButtonText;
    }
}

// Update the task history list
function updateTaskHistory() {
    const taskHistoryBody = document.getElementById('task-history-body');
    
    if (tasks.length === 0) {
        taskHistoryBody.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">No tasks yet. Submit a task to see it here.</div>
            </div>
        `;
        return;
    }
    
    taskHistoryBody.innerHTML = tasks.map(task => `
        <div class="task-item" data-task-id="${task.id}">
            <div class="task-status">
                <div class="task-status-icon task-status-${task.status}"></div>
            </div>
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    ${new Date(task.timestamp).toLocaleString()} • ${task.status}
                </div>
            </div>
            <div class="task-actions">
                <button onclick="showTaskDetails(${task.id})">View Details</button>
            </div>
        </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', () => {
            const taskId = parseInt(item.dataset.taskId);
            showTaskDetails(taskId);
        });
    });
}

// Show task details
function showTaskDetails(taskId) {
    currentTaskId = taskId;
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    // Set agent-specific background tints for the agent details area
    const agentDetailsElements = document.querySelectorAll('.agent-details');
    agentDetailsElements.forEach(element => {
        const agentType = element.getAttribute('data-agent');
        if (agentType) {
            element.style.transition = "background-color 0.3s ease";
        }
    });
    
    const taskDetails = document.getElementById('task-details');
    
    if (taskDetails) {
        taskDetails.innerHTML = `
            <div class="task-details-header">
                Task Details
            </div>
            <div class="task-details-body" id="task-details-body">
                <div class="task-info-details">
                    <h3>${task.title}</h3>
                    <div class="task-meta">
                        Submitted: ${new Date(task.timestamp).toLocaleString()} • Status: ${task.status}
                    </div>
                    <p class="task-description-full">
                        ${task.description}
                    </p>
                </div>
                
                <div class="pipeline-view" id="pipeline-view">
                    <h4>Pipeline Status</h4>
                    <div class="pipeline-progress">
                        <div class="pipeline-progress-bar" style="width: ${calculatePipelineProgress(task)}%"></div>
                    </div>
                    <div class="pipeline-steps" id="pipeline-steps">
                        <!-- Pipeline steps will be populated here -->
                    </div>
                </div>
                
                <h4>Response</h4>
                <div>
                    <p>${task.response || 'Processing...'}</p>
                </div>
                
                <h4>Logs</h4>
                <div class="log-viewer">
                    ${task.logs.map(log => {
                        const [time, ...content] = log.split('] ');
                        return `<div class="log-line">
                            <span class="log-time">${time}]</span>
                            <span class="log-content">${content.join('] ')}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // If task is pending, fetch updates
    if (task.status === 'pending') {
        updatePipeline(taskId, tasks, currentTaskId);
    }
}

export { submitTask, updateTaskHistory, showTaskDetails, tasks, currentTaskId, taskIdCounter };