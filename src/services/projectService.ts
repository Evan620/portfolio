import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type DatabaseProject = Tables<'projects'>;
export type ProjectInsert = TablesInsert<'projects'>;
export type ProjectUpdate = TablesUpdate<'projects'>;

export interface Project {
  id: string;
  name: string;
  client: string;
  projectUrl: string;
  githubUrl: string;
  createdAt: string;
}

export interface ProjectError {
  message: string;
  code?: string;
}

export class ProjectService {
  /**
   * Convert database project to frontend project format
   */
  private static mapDatabaseProject(dbProject: DatabaseProject): Project {
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
   * Convert frontend project to database format for insert
   */
  private static mapProjectForInsert(project: Omit<Project, 'id' | 'createdAt'>, userId: string): Omit<ProjectInsert, 'id' | 'created_at' | 'updated_at'> {
    return {
      user_id: userId,
      name: project.name,
      client: project.client,
      project_url: project.projectUrl,
      github_url: project.githubUrl,
    };
  }

  /**
   * Convert frontend project to database format for update
   */
  private static mapProjectForUpdate(project: Omit<Project, 'id' | 'createdAt'>): Omit<ProjectUpdate, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
    return {
      name: project.name,
      client: project.client,
      project_url: project.projectUrl,
      github_url: project.githubUrl,
    };
  }

  /**
   * Get all projects for the current user
   */
  static async getProjects(): Promise<{ projects: Project[]; error: ProjectError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { projects: [], error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { projects: [], error: { message: error.message, code: error.code } };
      }

      const projects = data.map(this.mapDatabaseProject);
      return { projects, error: null };
    } catch (err) {
      return { projects: [], error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Create a new project
   */
  static async createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<{ project: Project | null; error: ProjectError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { project: null, error: { message: 'User not authenticated' } };
      }

      const projectData = this.mapProjectForInsert(project, user.id);
      
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        return { project: null, error: { message: error.message, code: error.code } };
      }

      const newProject = this.mapDatabaseProject(data);
      return { project: newProject, error: null };
    } catch (err) {
      return { project: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, project: Omit<Project, 'id' | 'createdAt'>): Promise<{ project: Project | null; error: ProjectError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { project: null, error: { message: 'User not authenticated' } };
      }

      const projectData = this.mapProjectForUpdate(project);
      
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { project: null, error: { message: error.message, code: error.code } };
      }

      const updatedProject = this.mapDatabaseProject(data);
      return { project: updatedProject, error: null };
    } catch (err) {
      return { project: null, error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: string): Promise<{ error: ProjectError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { error: { message: error.message, code: error.code } };
      }

      return { error: null };
    } catch (err) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Get a single project by ID
   */
  static async getProject(id: string): Promise<{ project: Project | null; error: ProjectError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { project: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return { project: null, error: { message: error.message, code: error.code } };
      }

      const project = this.mapDatabaseProject(data);
      return { project, error: null };
    } catch (err) {
      return { project: null, error: { message: 'An unexpected error occurred' } };
    }
  }
}
