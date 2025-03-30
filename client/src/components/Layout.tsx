import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Wallet, Plus, User, LogOut } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { isAuthenticated, logout, isLoading } = useAuthContext();
  
  // Don't show navigation on login and signup pages
  const hideNav = location === '/login' || location === '/signup';

  // Show a simple loading state if auth is still being determined
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {isAuthenticated && !hideNav && (
        <header className="bg-card py-3 px-4 flex items-center justify-between shadow-md">
          <Link href="/profile" className="w-8 h-8 flex items-center justify-center">
            <User className="h-5 w-5 text-foreground" />
          </Link>
          
          <h1 className="text-xl font-bold gradient-text">QuicReF</h1>
          
          <button 
            onClick={logout}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>
      )}

      <main className={`flex-1 ${!hideNav && isAuthenticated ? 'pb-16' : ''}`}>
        {children}
      </main>
      
      {!hideNav && isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card shadow-lg h-16">
          <div className="flex items-center justify-around h-full px-4">
            <Link href="/">
              <button className="nav-circle">
                <Home className="h-5 w-5 text-foreground" />
              </button>
            </Link>
            
            <Link href="/wallet">
              <button className="nav-circle">
                <Wallet className="h-5 w-5 text-foreground" />
              </button>
            </Link>
            
            <Link href="/create-task">
              <button className="nav-circle large">
                <Plus className="h-6 w-6 text-white" />
              </button>
            </Link>
            
            <Link href="/profile">
              <button className="nav-circle">
                <User className="h-5 w-5 text-foreground" />
              </button>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;