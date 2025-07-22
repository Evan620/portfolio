import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface SignUpResult {
  user: AuthUser | null;
  error: AuthError | null;
  needsEmailConfirmation: boolean;
}

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signUp(email: string, password: string, name: string): Promise<SignUpResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
          },
        },
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.message }, needsEmailConfirmation: false };
      }

      // Check if user needs email confirmation
      const needsEmailConfirmation = !data.user?.email_confirmed_at;

      if (data.user && data.user.email_confirmed_at) {
        // User is already confirmed (shouldn't happen in normal flow)
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: name,
        };
        return { user: authUser, error: null, needsEmailConfirmation: false };
      }

      // User created but needs email confirmation
      return {
        user: null,
        error: null,
        needsEmailConfirmation: true
      };
    } catch (err) {
      return { user: null, error: { message: 'An unexpected error occurred' }, needsEmailConfirmation: false };
    }
  }

  /**
   * Sign in an existing user with email and password
   */
  static async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      console.log('Attempting to sign in user:', email);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Sign in request timeout')), 10000);
      });

      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = await Promise.race([signInPromise, timeoutPromise]);

      console.log('Sign in response:', { user: data?.user?.id, error });

      if (error) {
        console.error('Sign in error:', error);
        return { user: null, error: { message: error.message, code: error.message } };
      }

      if (data.user) {
        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          console.log('User email not confirmed');
          return { user: null, error: { message: 'Please confirm your email address before signing in. Check your inbox for a confirmation link.' } };
        }

        console.log('User confirmed, getting profile...');
        // Get user profile to get display name with timeout protection
        try {
          const profilePromise = supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', data.user.id)
            .single();

          const profileTimeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Profile request timeout')), 3000);
          });

          const { data: profile } = await Promise.race([profilePromise, profileTimeoutPromise]);

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: profile?.display_name || data.user.user_metadata?.display_name || email,
          };
          console.log('Sign in successful:', authUser);
          return { user: authUser, error: null };
        } catch (profileError) {
          console.warn('Profile fetch failed during sign in, using fallback:', profileError);
          // Fallback to user metadata if profile fetch fails
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.display_name || email,
          };
          return { user: authUser, error: null };
        }
      }

      return { user: null, error: { message: 'Failed to sign in' } };
    } catch (err) {
      console.error('Sign in error:', err);
      return { user: null, error: { message: err instanceof Error ? err.message : 'An unexpected error occurred' } };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: { message: error.message, code: error.message } };
      }
      return { error: null };
    } catch (err) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Get the current authenticated user
   */
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      console.log('Getting current user from Supabase...');

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Auth request timeout')), 5000);
      });

      const authPromise = supabase.auth.getUser();

      const { data: { user }, error } = await Promise.race([authPromise, timeoutPromise]);

      console.log('Supabase auth response:', { user: user?.id, email: user?.email, confirmed: user?.email_confirmed_at, error });

      if (error) {
        console.error('Supabase auth error:', error);
        return { user: null, error: { message: error.message, code: error.message } };
      }

      if (user && user.email_confirmed_at) {
        console.log('User is confirmed, getting profile...');
        // Only return user if email is confirmed
        // Get user profile to get display name with timeout
        try {
          const profilePromise = supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', user.id)
            .single();

          const profileTimeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Profile request timeout')), 3000);
          });

          const { data: profile } = await Promise.race([profilePromise, profileTimeoutPromise]);

          const authUser: AuthUser = {
            id: user.id,
            email: user.email || '',
            name: profile?.display_name || user.user_metadata?.display_name || user.email || '',
          };
          console.log('Returning authenticated user:', authUser);
          return { user: authUser, error: null };
        } catch (profileError) {
          console.warn('Profile fetch failed, using user metadata:', profileError);
          // Fallback to user metadata if profile fetch fails
          const authUser: AuthUser = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.display_name || user.email || '',
          };
          return { user: authUser, error: null };
        }
      }

      console.log('No confirmed user found');
      return { user: null, error: null };
    } catch (err) {
      console.error('getCurrentUser error:', err);
      return { user: null, error: { message: err instanceof Error ? err.message : 'An unexpected error occurred' } };
    }
  }

  /**
   * Listen to authentication state changes
   */
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event, 'Session user:', session?.user?.id);

      if (session?.user && session.user.email_confirmed_at) {
        // Only set user if email is confirmed
        try {
          // Get user profile to get display name with timeout
          const profilePromise = supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', session.user.id)
            .single();

          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Profile timeout')), 3000);
          });

          const { data: profile } = await Promise.race([profilePromise, timeoutPromise]);

          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.display_name || session.user.user_metadata?.display_name || session.user.email || '',
          };
          console.log('Auth state change - setting user:', authUser);
          callback(authUser);
        } catch (error) {
          console.warn('Profile fetch failed in auth state change, using fallback:', error);
          // Fallback to user metadata
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.display_name || session.user.email || '',
          };
          callback(authUser);
        }
      } else {
        console.log('Auth state change - no confirmed user, setting null');
        callback(null);
      }
    });
  }
}
