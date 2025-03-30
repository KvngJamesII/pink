// Main app module
const App = (function() {
  // Initialize the app
  function init() {
    console.log('Initializing QuicReF app...');
    registerRoutes();
    setupAuthListeners();
  }
  
  // Handle auth state changes
  function setupAuthListeners() {
    Auth.onAuthStateChanged(handleAuthStateChange);
  }
  
  // Handle authentication state changes
  function handleAuthStateChange(user) {
    console.log('Auth state changed:', user ? 'Logged in' : 'Logged out');
    
    // Update navigation based on auth state
    renderBottomNav(user);
    
    // Redirect to login if on protected page and not logged in
    const protectedPaths = ['/profile', '/wallet', '/create-task', '/my-tasks', '/admin'];
    const currentPath = window.location.pathname;
    
    if (!user && protectedPaths.some(path => currentPath.startsWith(path))) {
      Router.navigate('/login');
    }
    
    // Redirect to home if on login/signup and already logged in
    if (user && (currentPath === '/login' || currentPath === '/signup')) {
      Router.navigate('/');
    }
    
    // Handle admin-only routes
    if (user && !user.isAdmin && currentPath === '/admin') {
      Router.navigate('/');
    }
  }
  
  // Register all app routes
  function registerRoutes() {
    // Home/public pages
    Router.route('/', loadPage('home'))
          .route('/not-found', loadPage('not-found'))
          .route('/login', loadPage('login'))
          .route('/signup', loadPage('signup'));
    
    // Auth required pages
    Router.route('/profile', loadPage('profile'))
          .route('/wallet', loadPage('wallet'))
          .route('/create-task', loadPage('create-task'))
          .route('/my-tasks', loadPage('my-tasks'));
    
    // Dynamic routes
    Router.route('/task/:id', (params) => {
      loadPage('task-detail')(params);
    });
    
    // Admin pages
    Router.route('/admin', (params) => {
      const user = Auth.getCurrentUser();
      if (user && user.isAdmin) {
        loadPage('admin')(params);
      } else {
        Router.navigate('/');
      }
    });
    
    // Redirect to homepage if route not found
    if (window.location.pathname !== '/' && !Router.getCurrentPage()) {
      Router.navigate('/not-found');
    }
  }
  
  // Factory function to load a page
  function loadPage(pageName, params = {}) {
    return function(routeParams = {}) {
      const combinedParams = { ...params, ...routeParams };
      
      // Fetch the HTML template
      fetch(`/pages/${pageName}.html`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load page: ${pageName}`);
          }
          return response.text();
        })
        .then(html => {
          // Insert the HTML into the app container
          document.getElementById('app').innerHTML = html;
          
          // Execute page-specific initialization if available
          if (window[`init${pageName.replace(/-/g, '')}Page`]) {
            window[`init${pageName.replace(/-/g, '')}Page`](combinedParams);
          }
        })
        .catch(error => {
          console.error('Error loading page:', error);
          document.getElementById('app').innerHTML = `
            <div class="container" style="padding-top: 2rem;">
              <div class="card">
                <div class="card-header">
                  <h1 class="card-title">Error Loading Page</h1>
                </div>
                <div class="card-content">
                  <div class="alert alert-error">
                    <p>There was a problem loading the requested page.</p>
                    <p>${error.message}</p>
                  </div>
                  <button class="btn btn-primary btn-block mt-3" onclick="Router.navigate('/')">
                    Go to Homepage
                  </button>
                </div>
              </div>
            </div>
          `;
        });
    };
  }
  
  // Render bottom navigation
  function renderBottomNav(user) {
    const navElement = document.querySelector('.bottom-nav');
    
    // Create nav if it doesn't exist
    if (!navElement) {
      const nav = document.createElement('div');
      nav.className = 'bottom-nav';
      
      // Only show nav if user is logged in
      if (user) {
        nav.innerHTML = `
          <a href="/" class="nav-item">
            <i class="fas fa-home"></i>
            <span>Home</span>
          </a>
          <a href="/wallet" class="nav-item">
            <i class="fas fa-wallet"></i>
            <span>Wallet</span>
          </a>
          <a href="/create-task" class="nav-item">
            <i class="fas fa-plus-circle"></i>
            <span>Create</span>
          </a>
          <a href="/my-tasks" class="nav-item">
            <i class="fas fa-tasks"></i>
            <span>My Tasks</span>
          </a>
          <a href="/profile" class="nav-item">
            <i class="fas fa-user"></i>
            <span>Profile</span>
          </a>
          ${user.isAdmin ? `
          <a href="/admin" class="nav-item">
            <i class="fas fa-cog"></i>
            <span>Admin</span>
          </a>
          ` : ''}
        `;
        
        // Add icons from CDN if not already added
        if (!document.querySelector('link[href*="font-awesome"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
          document.head.appendChild(link);
        }
      } else {
        nav.innerHTML = `
          <a href="/" class="nav-item">
            <i class="fas fa-home"></i>
            <span>Home</span>
          </a>
          <a href="/login" class="nav-item">
            <i class="fas fa-sign-in-alt"></i>
            <span>Login</span>
          </a>
          <a href="/signup" class="nav-item">
            <i class="fas fa-user-plus"></i>
            <span>Signup</span>
          </a>
        `;
      }
      
      document.body.appendChild(nav);
      
      // Update active state based on current page
      const currentPage = Router.getCurrentPage();
      if (currentPage) {
        const activeLink = nav.querySelector(`[href="${currentPage}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    }
  }
  
  return {
    init
  };
})();

// Initialize app when document is loaded
document.addEventListener('DOMContentLoaded', App.init);