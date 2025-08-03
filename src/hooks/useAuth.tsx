import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, type AuthUser, type SignUpResult } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, name?: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<SignUpResult>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  showEmailConfirmationSuccess: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailConfirmationSuccess, setShowEmailConfirmationSuccess] = useState(false);

  useEffect(() => {
    // Handle email confirmation callback
    const handleEmailConfirmation = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (accessToken && type === 'signup') {
        console.log('Handling email confirmation callback...');

        try {
          // Set the session with the tokens from the URL
          const refreshToken = hashParams.get('refresh_token');
          if (refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) {
              console.error('Error setting session:', error);
            } else {
              console.log('Email confirmation successful, session set');
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname);
              // Show success message briefly
              setShowEmailConfirmationSuccess(true);
              setTimeout(() => setShowEmailConfirmationSuccess(false), 3000);
              return true; // Indicate we handled the confirmation
            }
          }
        } catch (error) {
          console.error('Error handling email confirmation:', error);
        }
      }
      return false;
    };

    // Get initial user state
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');

        // First check if this is an email confirmation callback
        const handledConfirmation = await handleEmailConfirmation();

        if (handledConfirmation) {
          // If we handled confirmation, the auth state change will be triggered
          // by the setSession call, so we don't need to do anything else here
          return;
        }

        // Test basic Supabase connection first
        console.log('Testing Supabase connection...');
        const testResponse = await fetch('https://tcrlqwbsqvbujtmqishp.supabase.co/rest/v1/', {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcmxxd2JzcXZidWp0bXFpc2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDY2NDIsImV4cCI6MjA2ODc4MjY0Mn0.1_HT7kENo4LIiNItDFv8_pFMRp7plZNB4sqb-O30lMY'
          }
        });
        console.log('Supabase connection test:', testResponse.status, testResponse.statusText);

        const { user: currentUser, error } = await AuthService.getCurrentUser();
        console.log('Current user:', currentUser, 'Error:', error);
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization timeout - setting loading to false');
      setLoading(false);
    }, 8000); // 8 second timeout

    initializeAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((authUser: AuthUser | null) => {
      console.log('Auth state changed:', authUser);
      setUser(authUser);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { user: authUser, error } = await AuthService.signIn(email, password);

    if (error) {
      console.error('Login error:', error.message);
      return false;
    }

    if (authUser) {
      setUser(authUser);
      return true;
    }

    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<SignUpResult> => {
    const result = await AuthService.signUp(email, password, name);

    if (result.error) {
      console.error('Registration error:', result.error.message);
      return result;
    }

    if (result.user) {
      setUser(result.user);
    }

    return result;
  };

  const logout = async () => {
    const { error } = await AuthService.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    }
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
    showEmailConfirmationSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};