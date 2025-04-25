// Utility functions

// Create a notification
export function createNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        });
    }
    
    return notification;
}

// Format date
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Truncate text
export function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Generate a unique ID
export function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Get agent color by name
export function getAgentColor(agentName) {
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
        'Bundler': '#FF5722'      // Deep Orange
    };
    
    return agentColors[agentName] || '#4CAF50'; // Default to green
}

// Check if browser is in dark mode
export function isDarkMode() {
    return document.documentElement.classList.contains('dark-theme') || 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Setup drag and drop for file upload
export function setupFileDragAndDrop(container, onFilesDropped) {
    if (!container) return;
    
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.innerHTML = `
        <div class="drop-zone-content">
            <div class="drop-zone-icon">📁</div>
            <div class="drop-zone-text">Drop files here to upload</div>
        </div>
    `;
    
    // Initially hidden
    dropZone.style.display = 'none';
    container.appendChild(dropZone);
    
    // Handle drag events
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.display = 'flex';
    });
    
    container.addEventListener('dragleave', (e) => {
        if (!container.contains(e.relatedTarget)) {
            dropZone.style.display = 'none';
        }
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        if (!dropZone.contains(e.relatedTarget)) {
            dropZone.style.display = 'none';
        }
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.display = 'none';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && typeof onFilesDropped === 'function') {
            onFilesDropped(files);
        }
    });
}