import { useState, useEffect } from "react";
import { ProjectCard, Project } from "@/components/ProjectCard";
import { AddProjectModal } from "@/components/AddProjectModal";
import { ShareDashboardModal } from "@/components/ShareDashboardModal";
import { DiagnosticModal } from "@/components/DiagnosticModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Terminal, Plus, Github, ExternalLink, Activity, Zap, Code2, Globe, Sparkles, User, LogOut, Share2, Settings, Eye } from "lucide-react";
import { ProjectService } from "@/services/projectService";
import { SharingService } from "@/services/sharingService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [isShared, setIsShared] = useState(false);

  // Load sharing statistics
  const loadSharingStats = async () => {
    try {
      const { shareToken, viewCount, error } = await SharingService.getCurrentShareTokenWithStats();
      if (!error && shareToken) {
        setTotalViews(viewCount);
        setIsShared(true);
      } else {
        setTotalViews(0);
        setIsShared(false);
      }
    } catch (err) {
      console.error('Error loading sharing stats:', err);
      setTotalViews(0);
      setIsShared(false);
    }
  };

  // Load projects and sharing stats on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Load projects
      const { projects: loadedProjects, error } = await ProjectService.getProjects();

      if (error) {
        toast({
          title: "Error loading projects",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProjects(loadedProjects);
      }

      // Load sharing stats
      await loadSharingStats();

      setLoading(false);
    };

    loadData();
  }, [toast]);

  const addProject = async (projectData: Omit<Project, "id" | "createdAt">) => {
    const { project: newProject, error } = await ProjectService.createProject(projectData);

    if (error) {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (newProject) {
      setProjects(prev => [newProject, ...prev]);
      toast({
        title: "Project created",
        description: `${newProject.name} has been added to your projects`,
      });
    }
  };

  const updateProject = async (projectData: Omit<Project, "id" | "createdAt">) => {
    if (!editingProject) return;

    const { project: updatedProject, error } = await ProjectService.updateProject(editingProject.id, projectData);

    if (error) {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (updatedProject) {
      setProjects(prev =>
        prev.map(project =>
          project.id === editingProject.id ? updatedProject : project
        )
      );
      setEditingProject(null);
      toast({
        title: "Project updated",
        description: `${updatedProject.name} has been updated successfully`,
      });
    }
  };

  const deleteProject = async (id: string) => {
    const { error } = await ProjectService.deleteProject(id);

    if (error) {
      toast({
        title: "Error deleting project",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

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
    <div className="min-h-screen bg-background font-inter">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-30 animate-pulse"></div>
      
      {/* Header */}
      <header className="relative bg-card/30 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Terminal className="h-7 w-7 text-primary animate-float" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground bg-gradient-primary bg-clip-text text-transparent font-serif tracking-wide">
                    Project Folio
                  </h1>
                  <p className="text-xs text-muted-foreground font-elegant italic tracking-wider hidden sm:block">
                    Professional Project Management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-mono animate-glow">
                  <Activity className="h-3 w-3 mr-1" />
                  {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
                </Badge>
                <Badge variant="secondary" className="bg-green/10 text-green border-green/20 font-mono hidden sm:inline-flex">
                  <Zap className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {projects.length > 0 && (
                <>
                  <ShareDashboardModal onShareStatusChange={loadSharingStats}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex border-border hover:bg-accent transition-all duration-200"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </ShareDashboardModal>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllUrls}
                    className="hidden md:flex border-border hover:bg-accent transition-all duration-200"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Copy All URLs
                  </Button>
                </>
              )}
              <AddProjectModal onAddProject={addProject} />
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {user?.name.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="flex flex-col items-start p-3">
                    <div className="text-sm font-medium text-foreground">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </DropdownMenuItem>
                  <DiagnosticModal>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Sharing Diagnostics</span>
                    </DropdownMenuItem>
                  </DiagnosticModal>
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects, clients, or technologies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 bg-card/30 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 font-mono"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <kbd className="px-2 py-1 text-xs bg-muted/50 border border-border/50 rounded font-mono">
                ⌘K
              </kbd>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className={`grid grid-cols-1 gap-4 max-w-2xl mx-auto ${isShared ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center hover:shadow-glow transition-all duration-300 animate-scale-in">
              <Code2 className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-mono">Total Projects</p>
              <p className="text-2xl font-bold text-foreground font-mono">{projects.length}</p>
            </div>
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center hover:shadow-cyan-glow transition-all duration-300 animate-scale-in">
              <Globe className="h-5 w-5 text-cyan mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-mono">Live Sites</p>
              <p className="text-2xl font-bold text-foreground font-mono">{projects.filter(p => p.projectUrl).length}</p>
            </div>
            {isShared && (
              <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center hover:shadow-green-glow transition-all duration-300 animate-scale-in">
                <Eye className="h-5 w-5 text-green mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-mono">Dashboard Views</p>
                <p className="text-2xl font-bold text-green font-mono">{totalViews}</p>
              </div>
            )}
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center hover:shadow-elevated transition-all duration-300 animate-scale-in">
              <Github className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-mono">Repositories</p>
              <p className="text-2xl font-bold text-foreground font-mono">{projects.filter(p => p.githubUrl).length}</p>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            </div>
            <p className="text-muted-foreground font-mono">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            {projects.length === 0 ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="p-6 bg-gradient-primary rounded-full animate-float">
                      <Plus className="h-16 w-16 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green rounded-full animate-pulse flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-background" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground font-artistic tracking-wide">
                    Welcome to Project Folio
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto font-elegant text-sm leading-relaxed">
                    Start by adding your first project. Monitor, manage, and share your live projects with clients in one centralized, professional dashboard.
                  </p>
                </div>
                <div className="flex justify-center">
                  <AddProjectModal onAddProject={addProject} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-6 bg-muted/20 rounded-full animate-float">
                    <Search className="h-16 w-16 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground font-inter">
                    No Projects Found
                  </h3>
                  <p className="text-muted-foreground font-mono text-sm">
                    Try adjusting your search terms or add a new project to get started.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  >
                    Clear Search
                  </Button>
                  <AddProjectModal onAddProject={addProject} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProjectCard
                  project={project}
                  onDelete={deleteProject}
                  onEdit={handleEdit}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Developer Credits Footer */}
      <footer className="mt-16 py-8 border-t border-border/30">
        <div className="text-center">
          <p className="text-xs text-muted-foreground/60 font-elegant tracking-wide">
            Crafted with passion by{' '}
            <a
              href="https://www.instagram.com/life_as_fredy?utm_source=ig_web_button_share_sheet&igsh=MXU4YXZoYTB3eTVpNA=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/70 hover:text-primary font-medium transition-all duration-300 underline decoration-dotted underline-offset-2 hover:decoration-solid"
            >
              Fred
            </a>
            {' & '}
            <a
              href="https://www.instagram.com/iame.v.a.n/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/70 hover:text-primary font-medium transition-all duration-300 underline decoration-dotted underline-offset-2 hover:decoration-solid"
            >
              Evan
            </a>
          </p>
          <p className="text-xs text-muted-foreground/40 font-mono mt-1 tracking-wider">
            © 2024 Project Folio
          </p>
        </div>
      </footer>

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
