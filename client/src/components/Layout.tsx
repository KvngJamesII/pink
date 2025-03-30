import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Wallet, Plus, User } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { isAuthenticated } = useAuthContext();
  
  // Don't show navigation on login and signup pages
  const hideNav = location === '/login' || location === '/signup';

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16">
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