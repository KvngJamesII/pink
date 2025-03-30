// Simple router for handling page navigation
const Router = (function() {
  const routes = {};
  let currentPage = '';
  
  // Register a route
  function route(path, callback) {
    routes[path] = callback;
    return this;
  }
  
  // Programmatically navigate to a path
  function navigate(path, data = {}) {
    window.history.pushState(data, null, path);
    render(path, data);
  }
  
  // Render the current route
  function render(path, data = {}) {
    // Check if path exists, or use 404
    const segments = path.split('/').filter(Boolean);
    let matchedRoute = routes[path] ? path : '/not-found';
    
    // Support for dynamic routes like /task/:id
    if (!routes[path]) {
      // Try to match dynamic routes
      for (const route in routes) {
        const routeSegments = route.split('/').filter(Boolean);
        
        if (routeSegments.length === segments.length) {
          let isMatch = true;
          const params = {};
          
          for (let i = 0; i < routeSegments.length; i++) {
            // Check if this segment is a parameter (starts with :)
            if (routeSegments[i].startsWith(':')) {
              // Extract parameter name without the colon
              const paramName = routeSegments[i].substring(1);
              params[paramName] = segments[i];
            } else if (routeSegments[i] !== segments[i]) {
              isMatch = false;
              break;
            }
          }
          
          if (isMatch) {
            matchedRoute = route;
            data.params = params;
            break;
          }
        }
      }
    }
    
    // Update currentPage for active state management
    currentPage = matchedRoute;
    
    // Call the route callback
    if (routes[matchedRoute]) {
      // Clear previous content
      document.getElementById('app').innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading...</p></div>';
      
      // After slight delay to show loading state
      setTimeout(() => {
        routes[matchedRoute](data);
      }, 100);
    } else {
      console.error('Route not found and 404 route not registered');
    }
    
    // Update active state in navigation
    updateActiveNavLinks();
  }
  
  // Initialize the router
  function init() {
    // Handle initial page load
    window.addEventListener('load', () => {
      render(window.location.pathname);
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      render(window.location.pathname, e.state || {});
    });
    
    // Intercept link clicks for SPA navigation
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('target') !== '_blank') {
        const href = e.target.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('//')) {
          e.preventDefault();
          navigate(href);
        }
      }
    });
  }
  
  // Update active state in navigation links
  function updateActiveNavLinks() {
    document.querySelectorAll('.nav-item').forEach(link => {
      const linkPath = link.getAttribute('href') || link.getAttribute('data-href');
      if (linkPath === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Get current page path
  function getCurrentPage() {
    return currentPage;
  }
  
  return {
    route,
    navigate,
    render,
    init,
    getCurrentPage
  };
})();

// Initialize router when document is loaded
document.addEventListener('DOMContentLoaded', Router.init);