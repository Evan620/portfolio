import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Eye, EyeOff, Monitor, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/components/ProjectCard";

interface PublicProjectCardProps {
  project: Project;
}

export const PublicProjectCard = ({ project }: PublicProjectCardProps) => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
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
              className="h-8 w-8 p-0 hover:bg-primary/10"
            >
              {showPreview ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(project.projectUrl, "Project URL")}
            className="flex-1 bg-background/50 hover:bg-primary/10 border-border/50 hover:border-primary/30 transition-all duration-300"
          >
            <Copy className="h-3 w-3 mr-2" />
            <span className="font-mono text-xs">Copy URL</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(project.projectUrl, '_blank')}
            className="flex-1 bg-background/50 hover:bg-primary/10 border-border/50 hover:border-primary/30 transition-all duration-300"
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            <span className="font-mono text-xs">Visit</span>
          </Button>
        </div>

        {/* Project URL Display */}
        <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-3 w-3 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">Live Site</span>
          </div>
          <p className="text-xs font-mono text-foreground/80 break-all">
            {project.projectUrl}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
