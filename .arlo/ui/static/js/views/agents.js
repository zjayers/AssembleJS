// Initialize the agents view with unique colors instead of avatars
function initAgentsView() {
    console.log('initAgentsView called');
    
    // Instead of forcing sidebar width with inline styles, respect the sidebar's CSS classes
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        console.log('Ensuring sidebar state is preserved in initAgentsView');
        // Remove any inline styles that might be causing problems
        sidebar.removeAttribute('style');
        
        // Make sure we respect the collapsed state
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    }
    
    // Make sure main-content layout is preserved but don't override any CSS
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        console.log('Setting main-content display to flex');
        mainContent.style.display = 'flex';
    }
    
    // Make sure the layout isn't disrupted
    const agentsView = document.getElementById('agents-view');
    if (agentsView) {
        // Don't set any width/height properties
        console.log('Ensuring agents-view doesn\'t have layout-breaking styles');
        if (agentsView.style.width === '100%') {
            agentsView.style.width = '';
        }
        if (agentsView.style.height === '100%') {
            agentsView.style.height = '';
        }
        
        // Fix the scrolling issue by setting proper height constraints
        agentsView.style.maxHeight = '100vh';
        agentsView.style.overflowY = 'auto';
    }
    
    // Apply better styling to the agents container
    const agentsContainer = document.querySelector('.agents-container');
    if (agentsContainer) {
        agentsContainer.style.display = 'flex';
        agentsContainer.style.height = 'calc(100vh - 120px)'; // Adjust height to prevent excessive scrolling
        agentsContainer.style.overflow = 'hidden'; // Prevent double scrollbars
    }
    
    // Make the agents list scrollable independently
    const agentsList = document.querySelector('#agents-view .agents-list');
    if (agentsList) {
        agentsList.style.overflowY = 'auto';
        agentsList.style.maxHeight = '100%';
        agentsList.style.paddingBottom = '20px';
    }
    
    // Make the agent details section scrollable independently
    const agentDetails = document.querySelector('.agent-details');
    if (agentDetails) {
        agentDetails.style.overflowY = 'auto';
        agentDetails.style.maxHeight = '100%';
        agentDetails.style.paddingBottom = '20px';
    }
    
    // Define a smooth rainbow color spectrum for agents (sorted from red to violet)
    const agentColors = {
        'Admin': '#F44336',       // Red
        'Types': '#E91E63',       // Pink
        'Utils': '#9C27B0',       // Purple
        'Validator': '#673AB7',   // Deep Purple
        'Developer': '#3F51B5',   // Indigo
        'Browser': '#2196F3',     // Blue
        'Version': '#03A9F4',     // Light Blue
        'Server': '#00BCD4',      // Cyan
        'Testbed': '#009688',     // Teal
        'Pipeline': '#4CAF50',    // Green
        'Generator': '#8BC34A',   // Light Green
        'Config': '#CDDC39',      // Lime
        'Docs': '#FFEB3B',        // Yellow
        'Git': '#FFC107',         // Amber
        'Analyzer': '#FF9800',    // Orange
        'Bundler': '#FF5722',     // Deep Orange
        'ARLO': '#607D8B'         // Blue Grey
    };
    
    // Complete agents data with categories
    const agentCategories = [
        {
            name: "Orchestration",
            agents: [
                { name: 'Admin', description: 'Workflow coordinator', status: 'active' }
            ]
        },
        {
            name: "Framework Core",
            agents: [
                { name: 'Browser', description: 'Frontend expert', status: 'active' },
                { name: 'Server', description: 'Backend expert', status: 'active' },
                { name: 'Types', description: 'Type system expert', status: 'active' },
                { name: 'Utils', description: 'Utility function expert', status: 'active' }
            ]
        },
        {
            name: "Development Tools",
            agents: [
                { name: 'Developer', description: 'Development tooling expert', status: 'active' },
                { name: 'Generator', description: 'Scaffolding specialist', status: 'active' },
                { name: 'Bundler', description: 'Build system specialist', status: 'active' },
                { name: 'Config', description: 'Configuration expert', status: 'active' }
            ]
        },
        {
            name: "Quality & Performance",
            agents: [
                { name: 'Validator', description: 'Quality assurance', status: 'active' },
                { name: 'Analyzer', description: 'Performance specialist', status: 'active' },
                { name: 'Testbed', description: 'Testbed project specialist', status: 'active' }
            ]
        },
        {
            name: "Integration & Delivery",
            agents: [
                { name: 'Git', description: 'Repository operations', status: 'active' },
                { name: 'Pipeline', description: 'CI/CD configuration', status: 'active' },
                { name: 'Version', description: 'Package versioning', status: 'active' }
            ]
        },
        {
            name: "Knowledge & Documentation",
            agents: [
                { name: 'Docs', description: 'Documentation specialist', status: 'active' },
                { name: 'ARLO', description: 'Self-maintenance specialist', status: 'active' }
            ]
        }
    ];
    
    // Get the agents list container
    if (!agentsList) return;
    
    // Populate agents list with categorized, colored icons
    let htmlContent = '';
    
    agentCategories.forEach(category => {
        htmlContent += `
            <div class="agent-category">
                <div class="agent-category-header">${category.name}</div>
                <div class="agent-category-items">
        `;
        
        category.agents.forEach(agent => {
            const agentColor = agentColors[agent.name] || '#4CAF50';
            htmlContent += `
                <div class="agent-list-item" data-agent="${agent.name}" data-color="${agentColor}">
                    <div class="agent-list-icon" style="background-color: ${agentColor};">
                        ${agent.name.charAt(0)}
                    </div>
                    <div class="agent-list-name">${agent.name}</div>
                </div>
            `;
        });
        
        htmlContent += `
                </div>
            </div>
        `;
    });
    
    agentsList.innerHTML = htmlContent;
    
    // Create a flat list of all agents for lookup
    const allAgents = agentCategories.flatMap(category => category.agents);
    
    // Add click event to show agent details
    const agentItems = document.querySelectorAll('.agent-list-item');
    agentItems.forEach(item => {
        item.addEventListener('click', function() {
            // Get the agent data
            const agentName = this.getAttribute('data-agent');
            const agentColor = this.getAttribute('data-color') || '#4CAF50';
            
            // Find agent in data
            const agent = allAgents.find(a => a.name === agentName);
            if (!agent) return;
            
            // Update active status
            agentItems.forEach(el => {
                el.classList.remove('active');
                el.style.borderLeft = '3px solid transparent';
            });
            this.classList.add('active');
            this.style.borderLeft = `3px solid ${agentColor}`;
            
            // Get DOM elements
            if (!agentDetails || !agentsView) return;
            
            // Ensure the agents list remains visible
            if (agentsList) {
                agentsList.style.display = 'block';
            }
            
            // Update agent details with mode-aware styling
            const isLightMode = document.documentElement.classList.contains('light-theme');
            agentDetails.setAttribute('data-agent', agentName);
            
            // Use appropriate background color based on theme
            agentDetails.style.backgroundColor = isLightMode 
                ? 'rgba(255, 255, 255, 0.9)' 
                : 'rgba(22, 27, 34, 0.8)';
                
            agentDetails.style.borderLeft = `4px solid ${agentColor}`;
            
            // Adjust shadow for light/dark mode
            agentDetails.style.boxShadow = isLightMode
                ? `0 6px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px ${agentColor}20`
                : `0 6px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px ${agentColor}30`;
            
            // Update background with a mode-aware effect, but don't change layout
            const baseColor = isLightMode ? '#ffffff' : 'var(--color-bg)';
            const opacity = isLightMode ? '15' : '25';
            
            agentsView.style.background = `
                radial-gradient(circle at top right, ${agentColor}${isLightMode ? '15' : '35'}, transparent 60%), 
                radial-gradient(circle at bottom left, ${agentColor}${isLightMode ? '15' : '35'}, transparent 60%),
                linear-gradient(135deg, ${baseColor}, ${agentColor}${opacity})
            `;
            
            // Preserve sidebar state when applying styles to agent view
            if (sidebar) {
                // Don't override sidebar CSS - respect the collapsed state
                sidebar.removeAttribute('style');
                
                // Make sure we respect the sidebar collapsed state
                const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
                if (isCollapsed) {
                    sidebar.classList.add('collapsed');
                } else {
                    sidebar.classList.remove('collapsed');
                }
            }
            
            // Update header content
            const agentHeader = agentDetails.querySelector('.agent-header');
            if (agentHeader) {
                agentHeader.innerHTML = `
                    <div class="agent-title-area">
                        <div class="agent-avatar" style="background-color: ${agentColor};">
                            ${agentName.charAt(0)}
                        </div>
                        <div>
                            <h3>${agentName} Agent</h3>
                            <div>${agent.description}</div>
                        </div>
                    </div>
                    <div class="agent-status-badge">
                        <div class="status-indicator ${agent.status}"></div>
                        ${agent.status === 'active' ? 'Online' : 'Offline'}
                    </div>
                `;
            }
        });
    });
    
    // Activate first agent by default
    if (agentItems.length > 0) {
        agentItems[0].click();
    }
}

export { initAgentsView };