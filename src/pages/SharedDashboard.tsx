import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PublicProjectCard } from "@/components/PublicProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Terminal, Code2, Globe, Sparkles, User, ExternalLink } from "lucide-react";
import { PublicProjectService, PublicProfile } from "@/services/publicProjectService";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/components/ProjectCard";

const SharedDashboard = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects on mount
  useEffect(() => {
    const loadSharedDashboard = async () => {
      if (!token) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      setLoading(true);
      const { projects: loadedProjects, profile: userProfile, error } = await PublicProjectService.getProjectsByShareToken(token);

      if (error) {
        setError(error.message);
        toast({
          title: "Error loading shared dashboard",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProjects(loadedProjects);
        setProfile(userProfile);
      }

      setLoading(false);
    };

    loadSharedDashboard();
  }, [token, toast]);

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const liveProjectsCount = projects.filter(p => p.projectUrl).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-mono">Loading shared dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Terminal className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            This shared dashboard link may be invalid, expired, or has been deactivated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground font-mono">Project Folio</span>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-mono text-xs">
                Shared Dashboard
              </Badge>
            </div>
            
            {profile && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{profile.displayName}</p>
                  <p className="text-xs text-muted-foreground font-mono">Portfolio Owner</p>
                </div>
                <Avatar className="h-8 w-8 border border-border/50">
                  <AvatarFallback className="bg-primary/10 text-primary font-mono text-sm">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-mono border border-primary/20">
            <Sparkles className="h-4 w-4" />
            Shared Portfolio
          </div>
          <h1 className="text-4xl font-bold text-foreground font-artistic tracking-wide">
            {profile?.displayName}'s Projects
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-elegant leading-relaxed">
            Explore this curated collection of projects. Each project showcases live implementations and professional work.
          </p>
        </div>

        {/* Search and Stats */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 font-mono"
              />
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center hover:shadow-glow transition-all duration-300 animate-scale-in">
              <Code2 className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-mono">Total Projects</p>
              <p className="text-2xl font-bold text-foreground font-mono">{projects.length}</p>
            </div>
            <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center hover:shadow-cyan-glow transition-all duration-300 animate-scale-in">
              <Globe className="h-5 w-5 text-cyan mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-mono">Live Sites</p>
              <p className="text-2xl font-bold text-cyan font-mono">{liveProjectsCount}</p>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm ? (
              <div className="space-y-4">
                <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold text-foreground">No projects found</h3>
                <p className="text-muted-foreground">
                  No projects match your search for "{searchTerm}"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Code2 className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold text-foreground">No projects yet</h3>
                <p className="text-muted-foreground">
                  This portfolio doesn't have any projects to display.
                </p>
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
                <PublicProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-mono">
              Powered by <span className="text-primary font-semibold">Project Folio</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SharedDashboard;
