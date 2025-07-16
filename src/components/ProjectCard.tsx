import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Github, Trash2, Edit, Eye, EyeOff, Monitor, Code2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Project {
  id: string;
  name: string;
  client: string;
  projectUrl: string;
  githubUrl: string;
  createdAt: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onEdit: (project: Project) => void;
}

export const ProjectCard = ({ project, onDelete, onEdit }: ProjectCardProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${type} copied successfully`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onDelete(project.id);
    setIsDeleting(false);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      setPreviewLoaded(false);
    }
  };

  return (
    <Card className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-glow animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors font-inter">
              {project.name}
            </CardTitle>
            <Badge 
              variant="secondary" 
              className="mt-2 bg-primary/10 text-primary border-primary/20 font-mono text-xs"
            >
              {project.client}
            </Badge>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePreview}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(project)}
              className="h-8 w-8 p-0 hover:bg-cyan/10 hover:text-cyan"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Preview Section */}
        {showPreview && (
          <div className="relative bg-background/20 rounded-lg overflow-hidden border border-border/30 animate-scale-in">
            <div className="flex items-center justify-between p-2 bg-muted/30 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Monitor className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">Preview</span>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                <div className="w-2 h-2 bg-amber rounded-full"></div>
                <div className="w-2 h-2 bg-green rounded-full"></div>
              </div>
            </div>
            <div className="relative h-48 overflow-hidden">
              {!previewLoaded && (
                <div className="absolute inset-0 bg-gradient-mesh flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-muted-foreground font-mono">Loading preview...</p>
                  </div>
                </div>
              )}
              <iframe
                src={project.projectUrl}
                className="w-full h-full scale-75 origin-top-left"
                style={{ width: '133.33%', height: '133.33%' }}
                onLoad={() => setPreviewLoaded(true)}
                title={`Preview of ${project.name}`}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Project URL Actions */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(project.projectUrl, "Project URL")}
              className="w-full justify-start h-8 px-2 text-xs bg-primary/5 hover:bg-primary/10 hover:text-primary border border-primary/20 hover:border-primary/30 transition-all duration-300"
            >
              <Copy className="h-3 w-3 mr-1.5" />
              Copy URL
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(project.projectUrl, '_blank')}
              className="w-full justify-start h-8 px-2 text-xs bg-primary/5 hover:bg-primary/10 hover:text-primary border border-primary/20 hover:border-primary/30 transition-all duration-300"
            >
              <Globe className="h-3 w-3 mr-1.5" />
              Visit Live
            </Button>
          </div>

          {/* GitHub Actions */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(project.githubUrl, "GitHub URL")}
              className="w-full justify-start h-8 px-2 text-xs bg-secondary/30 hover:bg-secondary/50 hover:text-foreground border border-secondary/30 hover:border-secondary/50 transition-all duration-300"
            >
              <Github className="h-3 w-3 mr-1.5" />
              Copy Git
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(project.githubUrl, '_blank')}
              className="w-full justify-start h-8 px-2 text-xs bg-secondary/30 hover:bg-secondary/50 hover:text-foreground border border-secondary/30 hover:border-secondary/50 transition-all duration-300"
            >
              <Code2 className="h-3 w-3 mr-1.5" />
              View Code
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground font-mono">
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-green rounded-full animate-pulse"></div>
            <span className="text-xs text-green font-mono">Live</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};