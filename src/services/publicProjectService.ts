import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/components/ProjectCard";

export interface PublicProfile {
  id: string;
  displayName: string;
  email: string;
}

export interface PublicProjectError {
  message: string;
  code?: string;
}

export class PublicProjectService {
  /**
   * Get projects for a shared dashboard by token (public access)
   */
  static async getProjectsByShareToken(token: string): Promise<{ 
    projects: Project[]; 
    profile: PublicProfile | null; 
    error: PublicProjectError | null 
  }> {
    try {
      // First validate the token and get user ID
      const { data: shareData, error: shareError } = await supabase
        .from('shared_dashboards')
        .select('user_id')
        .eq('share_token', token)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .single();

      if (shareError) {
        if (shareError.code === 'PGRST116') {
          return { 
            projects: [], 
            profile: null, 
            error: { message: 'Invalid or expired share token' } 
          };
        }
        return { 
          projects: [], 
          profile: null, 
          error: { message: shareError.message, code: shareError.code } 
        };
      }

      const userId = shareData.user_id;

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        return { 
          projects: [], 
          profile: null, 
          error: { message: 'Profile not found', code: profileError.code } 
        };
      }

      // Get projects for this user
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (projectsError) {
        return { 
          projects: [], 
          profile: null, 
          error: { message: projectsError.message, code: projectsError.code } 
        };
      }

      // Map database projects to frontend format
      const projects = projectsData.map(this.mapDatabaseProject);
      
      const profile: PublicProfile = {
        id: profileData.id,
        displayName: profileData.display_name || profileData.email || 'Anonymous',
        email: profileData.email || ''
      };

      return { projects, profile, error: null };
    } catch (err) {
      return { 
        projects: [], 
        profile: null, 
        error: { message: 'An unexpected error occurred' } 
      };
    }
  }

  /**
   * Map database project to frontend Project interface
   */
  private static mapDatabaseProject(dbProject: any): Project {
    return {
      id: dbProject.id,
      name: dbProject.name,
      client: dbProject.client,
      projectUrl: dbProject.project_url,
      githubUrl: dbProject.github_url,
      createdAt: dbProject.created_at,
    };
  }

  /**
   * Check if a share token is valid (public access)
   */
  static async isValidShareToken(token: string): Promise<{ isValid: boolean; error: PublicProjectError | null }> {
    try {
      const { data, error } = await supabase
        .from('shared_dashboards')
        .select('id')
        .eq('share_token', token)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { isValid: false, error: null };
        }
        return { isValid: false, error: { message: error.message, code: error.code } };
      }

      return { isValid: true, error: null };
    } catch (err) {
      return { isValid: false, error: { message: 'An unexpected error occurred' } };
    }
  }
}
