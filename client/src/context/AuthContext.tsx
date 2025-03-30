import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// Define the User type based on your schema
type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  walletBalance: number;
  withdrawableBalance: number;
  referralCode: string;
  isEmailVerified: boolean;
  isBanned: boolean;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (userData: any) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, navigate] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      // Only redirect to login if not already on login or signup pages
      const isAuthPage = location === '/login' || location === '/signup';
      if (!isAuthPage) {
        navigate('/login');
      }
    }
  }, [isLoading, user, location, navigate]);

  // For Netlify deployment - set initial auth state
  useEffect(() => {
    // Check if we're in the Netlify environment
    const isNetlify = window.location.hostname.includes('netlify.app');
    
    if (isNetlify) {
      // For demo purposes on Netlify, don't set a default user
      // This will make the app show the login screen first
      setIsLoading(false);
    } else {
      // In development, try to fetch the user
      const checkAuth = async () => {
        try {
          const response = await fetch('/api/auth/me', {
            credentials: 'include'
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (error) {
          console.error('Auth check failed', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      checkAuth();
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      // For Netlify demo, simulate a successful login
      if (window.location.hostname.includes('netlify.app')) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Create a demo user
        const demoUser = {
          id: 1,
          email: email,
          name: email.split('@')[0],
          role: 'user',
          walletBalance: 5000,
          withdrawableBalance: 2500,
          referralCode: 'QR123456',
          isEmailVerified: true,
          isBanned: false
        };
        
        setUser(demoUser);
        return demoUser;
      } else {
        // Real API call for development
        const res = await apiRequest('POST', '/api/auth/login', { email, password });
        const userData = await res.json();
        setUser(userData);
        return userData;
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any): Promise<User> => {
    setIsLoading(true);
    try {
      // For Netlify demo, simulate a successful signup
      if (window.location.hostname.includes('netlify.app')) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a demo user
        const demoUser = {
          id: 1,
          email: userData.email,
          name: userData.name,
          role: 'user',
          walletBalance: 5000,
          withdrawableBalance: 2500,
          referralCode: 'QR123456',
          isEmailVerified: true,
          isBanned: false
        };
        
        setUser(demoUser);
        return demoUser;
      } else {
        // Real API call for development
        const res = await apiRequest('POST', '/api/auth/signup', userData);
        const newUser = await res.json();
        setUser(newUser);
        return newUser;
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    navigate('/login');
    // In a real implementation, you would also call an API to invalidate the session
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};