import { createContext, ReactNode, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  user: {
    id: number;
    email: string;
    walletBalance: number;
    withdrawableBalance: number;
    referralCode: string;
    isAdmin: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
  login: (data: { email: string; password: string }) => Promise<any>;
  signup: (data: { email: string; password: string; referredBy?: string }) => Promise<any>;
  logout: () => void;
  updateUserData: (data: any) => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
