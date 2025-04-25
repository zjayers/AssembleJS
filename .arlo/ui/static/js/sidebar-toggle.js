// Sidebar toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  
  if (sidebarToggle && sidebar) {
    // Toggle sidebar on button click
    sidebarToggle.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      sidebar.classList.toggle('collapsed');
      // Store sidebar state in localStorage
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('sidebarCollapsed', isCollapsed);
    });
    
    // Check local storage for sidebar state on page load
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
    }
    
    // Prevent nav items from toggling sidebar
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function(event) {
        // Don't propagate the click to the sidebar
        event.stopPropagation();
      });
    });
  }
});