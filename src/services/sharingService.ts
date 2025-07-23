import { supabase } from "@/integrations/supabase/client";

export interface SharedDashboard {
  id: string;
  userId: string;
  shareToken: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface SharingError {
  message: string;
  code?: string;
}

export class SharingService {
  /**
   * Generate a secure random token
   */
  private static generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generate a new share token for the current user's dashboard
   */
  static async createShareToken(expiresAt?: string): Promise<{ shareToken: string | null; error: SharingError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { shareToken: null, error: { message: 'User not authenticated' } };
      }

      // First, deactivate any existing share tokens for this user
      await supabase
        .from('shared_dashboards')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Generate a new token
      const newToken = this.generateSecureToken();

      // Create new shared dashboard record
      const { data, error } = await supabase
        .from('shared_dashboards')
        .insert({
          user_id: user.id,
          share_token: newToken,
          is_active: true,
          expires_at: expiresAt || null
        })
        .select('share_token')
        .single();

      if (error) {
        return { shareToken: null, error: { message: error.message, code: error.code } };
      }

      return { shareToken: data.share_token, error: null };
    } catch (err) {
      return { shareToken: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Get the current active share token for the user
   */
  static async getCurrentShareToken(): Promise<{ shareToken: string | null; error: SharingError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { shareToken: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('shared_dashboards')
        .select('share_token')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - no active share token
          return { shareToken: null, error: null };
        }
        return { shareToken: null, error: { message: error.message, code: error.code } };
      }

      return { shareToken: data.share_token, error: null };
    } catch (err) {
      return { shareToken: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Deactivate the current share token
   */
  static async deactivateShareToken(): Promise<{ error: SharingError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { error } = await supabase
        .from('shared_dashboards')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        return { error: { message: error.message, code: error.code } };
      }

      return { error: null };
    } catch (err) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Validate a share token and get the associated user ID (public access)
   */
  static async validateShareToken(token: string): Promise<{ userId: string | null; error: SharingError | null }> {
    try {
      const { data, error } = await supabase
        .from('shared_dashboards')
        .select('user_id')
        .eq('share_token', token)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - invalid or expired token
          return { userId: null, error: { message: 'Invalid or expired share token' } };
        }
        return { userId: null, error: { message: error.message, code: error.code } };
      }

      return { userId: data.user_id, error: null };
    } catch (err) {
      return { userId: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Get all shared dashboards for the current user
   */
  static async getSharedDashboards(): Promise<{ dashboards: SharedDashboard[]; error: SharingError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { dashboards: [], error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('shared_dashboards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { dashboards: [], error: { message: error.message, code: error.code } };
      }

      const dashboards = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        shareToken: item.share_token,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        expiresAt: item.expires_at
      }));

      return { dashboards, error: null };
    } catch (err) {
      return { dashboards: [], error: { message: 'An unexpected error occurred' } };
    }
  }
}
