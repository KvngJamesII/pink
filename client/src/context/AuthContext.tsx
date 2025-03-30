import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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

  // For Netlify deployment - set a dummy user to prevent loading state
  useEffect(() => {
    // Check if we're in the Netlify environment
    const isNetlify = window.location.hostname.includes('netlify.app');
    
    if (isNetlify) {
      // Set a dummy user for demo purposes on Netlify
      setUser({
        id: 1,
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'user',
        walletBalance: 5000,
        withdrawableBalance: 2500,
        referralCode: 'QR123456',
        isEmailVerified: true,
        isBanned: false
      });
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
      const res = await apiRequest('POST', '/api/auth/login', { email, password });
      const userData = await res.json();
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await apiRequest('POST', '/api/auth/signup', userData);
      const newUser = await res.json();
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
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