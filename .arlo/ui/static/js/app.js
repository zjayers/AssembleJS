// Import core modules
import VectorDB from './modules/vectordb.js';
import { submitTask, updateTaskHistory, showTaskDetails, tasks, currentTaskId, taskIdCounter } from './modules/tasks.js';
import { initializePipeline, updatePipeline, renderPipeline, pipelineSteps, calculatePipelineProgress } from './modules/pipeline.js';

// Import view modules
import { initAgentsView } from './views/agents.js';
import { initKnowledgeBaseView, performKnowledgeSearch, loadCollections } from './views/knowledgeBase.js';
import { initCollectionsView } from './views/collections.js';
import { initConnectionsView } from './views/connections.js';
import { setupTaskControls } from './views/task.js';
import { setupKnowledgeBaseSearch } from './views/search.js';
// Removed agentManagement import

// Import utility modules
import { setupLogActions } from './utils/logViewer.js';
import { setupThemeToggle, setupSidebarToggle } from './utils/theme.js';
import { 
  setupAdvancedOptionsToggle,
  setupOutputTabs,
  setupTaskHistorySelection,
  setupTaskHistoryFilter
} from './utils/ui.js';

// Make functions available globally
window.submitTask = submitTask;
window.updateTaskHistory = updateTaskHistory;
window.showTaskDetails = showTaskDetails;
window.initAgentsView = initAgentsView;
window.initKnowledgeBaseView = initKnowledgeBaseView;
window.initCollectionsView = initCollectionsView;
window.initConnectionsView = initConnectionsView;
window.performKnowledgeSearch = performKnowledgeSearch;
window.loadCollections = loadCollections;
window.calculatePipelineProgress = calculatePipelineProgress;

// Setup navigation with view initialization
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const viewContainers = document.querySelectorAll('.view-container');
    
    // Handle navigation clicks
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            console.log('Navigation clicked:', item.getAttribute('data-view'));
            
            // Update active navigation
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding view
            const viewName = item.getAttribute('data-view');
            if (viewName) {
                console.log('View name:', viewName);
                
                // Hide all views first
                viewContainers.forEach(view => {
                    view.classList.remove('active-view');
                    view.style.display = 'none';
                });
                
                // Show the selected view
                const activeView = document.getElementById(`${viewName}-view`);
                if (activeView) {
                    console.log('Active view found:', viewName);
                    activeView.classList.add('active-view');
                    activeView.style.display = 'block';
                    
                    // Ensure we preserve the main layout
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        console.log('Setting main-content display to flex');
                        mainContent.style.display = 'flex';
                    }
                    
                    // Make sure sidebar keeps correct state
                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar) {
                        console.log('Ensuring sidebar has correct state');
                        // Remove any inline styles that might override our CSS classes
                        sidebar.removeAttribute('style');
                        
                        // Check if we're collapsed or expanded
                        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
                        if (isCollapsed) {
                            sidebar.classList.add('collapsed');
                        } else {
                            sidebar.classList.remove('collapsed');
                        }
                    }
                    
                    // Initialize specific views
                    if (viewName === 'agents') {
                        console.log('Initializing agents view');
                        // Only use colored avatars version
                        initAgentsView();
                    } else if (viewName === 'knowledge-base') {
                        initKnowledgeBaseView();
                    } else if (viewName === 'collections') {
                        initCollectionsView();
                    } else if (viewName === 'connections') {
                        initConnectionsView();
                    }
                }
            }
        });
    });
}

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize utilities
    setupLogActions();
    setupThemeToggle();
    
    // Initialize sidebar properly before setting up toggle
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        // Remove any explicit styles that might be causing issues
        sidebar.removeAttribute('style');
        
        // Get saved state from localStorage, default to expanded
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    }
    
    // Now set up the toggle functionality
    setupSidebarToggle();
    setupAdvancedOptionsToggle();
    setupOutputTabs();
    setupTaskHistorySelection();
    setupTaskHistoryFilter();
    
    // Initialize navigation
    setupNavigation();
    
    // Initialize task-specific functionality
    setupTaskControls();
    
    // Initialize search functionality
    setupKnowledgeBaseSearch();
    
    // Removed setupAgentManagement call
    
    // Set up MutationObserver to watch for new log viewers
    const observer = new MutationObserver(() => {
        setupLogActions();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Task form submission
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', submitTask);
    }

    // Initialize empty state if no tasks
    updateTaskHistory();
    
    // Activate default view if none is active
    const activeView = document.querySelector('.view-container.active-view');
    if (!activeView) {
        console.log('No active view, setting workflow as default');
        const defaultView = document.getElementById('workflow-view') || 
                           document.getElementById('dashboard-view') ||
                           document.querySelector('.view-container');
        
        if (defaultView) {
            // Show the default view
            defaultView.classList.add('active-view');
            defaultView.style.display = 'block';
            
            // Also highlight the corresponding nav item
            const viewId = defaultView.id;
            const viewName = viewId.replace('-view', '');
            const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
            if (navItem) {
                navItem.classList.add('active');
            }
            
            console.log(`Default view set to: ${viewId}`);
        }
    }
});