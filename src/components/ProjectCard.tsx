import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Github, Trash2, Edit } from "lucide-react";
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
    await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for UX
    onDelete(project.id);
    setIsDeleting(false);
  };

  return (
    <Card className="group hover:shadow-[var(--shadow-elegant)] transition-[var(--transition-smooth)] border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            <Badge variant="secondary" className="mt-2">
              {project.client}
            </Badge>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(project)}
              className="h-8 w-8 p-0"
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
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Project URL */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(project.projectUrl, "Project URL")}
              className="h-8 px-2 text-xs hover:bg-primary/10"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy URL
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(project.projectUrl, '_blank')}
              className="h-8 px-2 text-xs hover:bg-primary/10"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Visit
            </Button>
          </div>

          {/* GitHub URL */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(project.githubUrl, "GitHub URL")}
              className="h-8 px-2 text-xs hover:bg-secondary/80"
            >
              <Github className="h-3 w-3 mr-1" />
              Copy GitHub
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(project.githubUrl, '_blank')}
              className="h-8 px-2 text-xs hover:bg-secondary/80"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Code
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Added {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};