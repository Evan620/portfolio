import { useState, useEffect } from "react";
import { ProjectCard, Project } from "@/components/ProjectCard";
import { AddProjectModal } from "@/components/AddProjectModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FolderOpen, Plus, Github, ExternalLink } from "lucide-react";
import { saveProjects, loadProjects, generateId } from "@/utils/projectStorage";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Load projects on mount
  useEffect(() => {
    const loadedProjects = loadProjects();
    setProjects(loadedProjects);
  }, []);

  // Save projects whenever they change
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const addProject = (projectData: Omit<Project, "id" | "createdAt">) => {
    const newProject: Project = {
      ...projectData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const updateProject = (projectData: Omit<Project, "id" | "createdAt">) => {
    if (!editingProject) return;
    
    setProjects(prev => 
      prev.map(project => 
        project.id === editingProject.id
          ? { ...project, ...projectData }
          : project
      )
    );
    setEditingProject(null);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    toast({
      title: "Project deleted",
      description: "The project has been removed from your list",
    });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyAllUrls = async () => {
    if (projects.length === 0) return;
    
    const urlList = projects.map(p => 
      `${p.name} (${p.client}): ${p.projectUrl}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(urlList);
      toast({
        title: "All URLs copied!",
        description: "All project URLs have been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Project Dashboard</h1>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {projects.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAllUrls}
                  className="hidden sm:flex"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy All URLs
                </Button>
              )}
              <AddProjectModal onAddProject={addProject} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            {projects.length === 0 ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Plus className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">No projects yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start by adding your first project. You'll be able to easily manage and share your live projects with clients.
                </p>
                <AddProjectModal onAddProject={addProject} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-muted rounded-full">
                    <Search className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">No projects found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or add a new project.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={deleteProject}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit Project Modal */}
      {editingProject && (
        <AddProjectModal
          onAddProject={updateProject}
          editingProject={editingProject}
          onEditComplete={() => setEditingProject(null)}
        />
      )}
    </div>
  );
};

export default Index;
