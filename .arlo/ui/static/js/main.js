/**
 * Main ARLO Application
 */
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

// Initialize the application
function initApp() {
  // Setup UI components
  initSidebar();
  initThemeToggle();
  initNavigation();
  
  // Load last active view if available
  const lastView = ARLO.utils.storage.get('arlo_last_view');
  if (lastView) {
    navigateTo(lastView);
  }
  
  // Welcome message in console
  console.log(
    '%cARLO - AssembleJS Repository Logic Orchestrator',
    'font-size: 14px; font-weight: bold; color: #2196F3;'
  );
}

// Initialize sidebar
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const navItems = document.querySelectorAll('.nav-item');
  
  // Restore sidebar state from localStorage
  const sidebarCollapsed = ARLO.utils.storage.get('arlo_sidebar_collapsed', false);
  if (sidebarCollapsed) {
    sidebar.classList.add('collapsed');
    document.body.classList.add('sidebar-collapsed');
  }
  
  // Toggle sidebar
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
      document.body.classList.toggle('sidebar-collapsed');
      
      // Save state to localStorage
      ARLO.utils.storage.set('arlo_sidebar_collapsed', sidebar.classList.contains('collapsed'));
    });
  }
  
  // Handle navigation item clicks
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all nav items
      navItems.forEach(i => i.classList.remove('active'));
      
      // Add active class to clicked item
      this.classList.add('active');
      
      // Get the target view
      const target = this.getAttribute('data-target');
      if (target) {
        navigateTo(target);
      }
    });
  });
}

// Initialize theme toggle
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Set initial theme based on localStorage or system preference
  const savedTheme = ARLO.utils.storage.get('arlo_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  
  // Theme toggle button click handler
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      ARLO.utils.storage.set('arlo_theme', newTheme);
      
      // Update toggle icon
      updateThemeToggleIcon(newTheme);
    });
    
    // Set initial icon state
    updateThemeToggleIcon(document.documentElement.getAttribute('data-theme'));
  }
}

// Update theme toggle icon
function updateThemeToggleIcon(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  if (theme === 'dark') {
    themeToggle.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 12a4 4 0 100-8 4 4 0 000 8z" fill="currentColor"></path>
        <path d="M8 0a1 1 0 011 1v1a1 1 0 01-2 0V1a1 1 0 011-1zM8 13a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zM16 8a1 1 0 01-1 1h-1a1 1 0 010-2h1a1 1 0 011 1zM3 8a1 1 0 01-1 1H1a1 1 0 010-2h1a1 1 0 011 1zM13.657 2.343a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM4.464 11.536a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM13.657 13.657a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM4.464 4.464a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414z" fill="currentColor"></path>
      </svg>
    `;
    themeToggle.setAttribute('title', 'Switch to Light Mode');
  } else {
    themeToggle.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8.88.88a7.78 7.78 0 00-1.22-.11C3.73.77.77 3.73.77 7.44a7.67 7.67 0 0011.93 6.4 6.71 6.71 0 01-1.72-1.15 5.62 5.62 0 01-2.08-4.35c0-3.39 2.11-6.21 5.09-7.4A7.61 7.61 0 008.88.88z" fill="currentColor"></path>
      </svg>
    `;
    themeToggle.setAttribute('title', 'Switch to Dark Mode');
  }
}

// Initialize navigation
function initNavigation() {
  // Event bus subscription for navigation
  ARLO.utils.eventBus.on('navigate', navigateTo);
}

// Navigate to the specified view
function navigateTo(target) {
  if (!target) return;
  
  // Hide all views
  const views = document.querySelectorAll('.view');
  views.forEach(view => view.classList.add('hidden'));
  
  // Show target view
  const targetView = document.getElementById(`${target}-view`);
  if (targetView) {
    targetView.classList.remove('hidden');
    
    // Set active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-target') === target) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Save last view to localStorage
    ARLO.utils.storage.set('arlo_last_view', target);
    
    // Dispatch view change event
    ARLO.utils.eventBus.emit('view-changed', { view: target });
  }
}