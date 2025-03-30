import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuthContext } from '@/context/AuthContext';
import NavigationBar from './NavigationBar';

interface LayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
}

export default function Layout({ children, hideNavigation }: LayoutProps) {
  const [location] = useLocation();
  const { isLoggedIn } = useAuthContext();
  
  const authPages = ['/login', '/signup'];
  const isAuthPage = authPages.includes(location);
  
  // If not logged in and not on an auth page, redirect to login
  if (!isLoggedIn && !isAuthPage) {
    window.location.href = '/login';
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      
      {isLoggedIn && !hideNavigation && !isAuthPage && <NavigationBar />}
    </div>
  );
}
