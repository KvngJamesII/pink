import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface User {
  id: number;
  email: string;
  walletBalance: number;
  withdrawableBalance: number;
  referralCode: string;
  isAdmin: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  referredBy?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  useEffect(() => {
    // Check for logged in user in local storage
    const userData = localStorage.getItem('quicref_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        localStorage.removeItem('quicref_user');
      }
    }
  }, []);

  const login = useCallback(async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest('POST', '/api/auth/login', data);
      const userData = await res.json();
      
      // Save user to local storage
      localStorage.setItem('quicref_user', JSON.stringify(userData));
      setUser(userData);
      
      // Redirect to home page
      navigate('/');
      return userData;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: err.message,
        });
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  const signup = useCallback(async (data: SignupData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest('POST', '/api/auth/signup', data);
      const userData = await res.json();
      
      // Save user to local storage
      localStorage.setItem('quicref_user', JSON.stringify(userData));
      setUser(userData);
      
      // Redirect to home page
      navigate('/');
      return userData;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast({
          variant: 'destructive',
          title: 'Signup failed',
          description: err.message,
        });
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  const logout = useCallback(() => {
    localStorage.removeItem('quicref_user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const updateUserData = useCallback((newData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...newData };
      localStorage.setItem('quicref_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  }, [user]);

  return {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateUserData,
    isLoggedIn: !!user
  };
}
