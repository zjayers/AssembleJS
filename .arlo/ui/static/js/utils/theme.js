// Theme toggle functionality
export function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  
  if (!themeToggle) return;

  // Check if user has a theme preference stored
  const savedTheme = localStorage.getItem('arlo-theme');
  if (savedTheme === 'light') {
    root.classList.add('light-theme');
    themeToggle.classList.add('light');
  }
  
  // Toggle theme when clicked
  themeToggle.addEventListener('click', () => {
    if (root.classList.contains('light-theme')) {
      // Switch to dark theme
      root.classList.remove('light-theme');
      themeToggle.classList.remove('light');
      localStorage.setItem('arlo-theme', 'dark');
    } else {
      // Switch to light theme
      root.classList.add('light-theme');
      themeToggle.classList.add('light');
      localStorage.setItem('arlo-theme', 'light');
    }
  });
}

// Sidebar toggle functionality
export function setupSidebarToggle() {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  
  if (!sidebar || !sidebarToggle) {
    console.warn('Sidebar elements not found');
    return;
  }
  
  // Clean up any inline styles that might be causing issues
  sidebar.removeAttribute('style');
  
  // Check if sidebar state is stored
  const sidebarState = localStorage.getItem('sidebarCollapsed');
  console.log('Initial sidebar state:', sidebarState);
  
  if (sidebarState === 'true') {
    sidebar.classList.add('collapsed');
  } else {
    sidebar.classList.remove('collapsed');
  }
  
  // Toggle sidebar when clicked
  sidebarToggle.addEventListener('click', (event) => {
    // Prevent event bubbling
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Sidebar toggle clicked');
    sidebar.classList.toggle('collapsed');
    
    // Store sidebar state in localStorage
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
    console.log('Sidebar state set to:', isCollapsed);
  });
  
  // Prevent nav items from toggling sidebar
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function(event) {
      // Don't propagate the click to the sidebar
      event.stopPropagation();
    });
  });
}