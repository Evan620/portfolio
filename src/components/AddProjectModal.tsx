import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Sparkles, Globe, Github, User, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Project } from "./ProjectCard";

interface AddProjectModalProps {
  onAddProject: (project: Omit<Project, "id" | "createdAt">) => void;
  editingProject?: Project | null;
  onEditComplete?: () => void;
}

export const AddProjectModal = ({ onAddProject, editingProject, onEditComplete }: AddProjectModalProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: editingProject?.name || "",
    client: editingProject?.client || "",
    projectUrl: editingProject?.projectUrl || "",
    githubUrl: editingProject?.githubUrl || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.client.trim() || !formData.projectUrl.trim() || !formData.githubUrl.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "All fields are required to add a project",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.projectUrl);
      new URL(formData.githubUrl);
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter valid URLs for both project and GitHub links",
        variant: "destructive",
      });
      return;
    }

    onAddProject(formData);
    
    toast({
      title: editingProject ? "Project updated" : "Project added",
      description: editingProject 
        ? `${formData.name} has been updated successfully`
        : `${formData.name} has been added to your projects`,
    });

    setFormData({
      name: "",
      client: "",
      projectUrl: "",
      githubUrl: "",
    });
    
    setOpen(false);
    if (editingProject && onEditComplete) {
      onEditComplete();
    }
  };

  // Reset form when editing project changes
  useEffect(() => {
    if (editingProject) {
      setFormData({
        name: editingProject.name,
        client: editingProject.client,
        projectUrl: editingProject.projectUrl,
        githubUrl: editingProject.githubUrl,
      });
      setOpen(true);
    }
  }, [editingProject]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="h-4 w-4 mr-2 relative z-10" />
          <span className="relative z-10">Add Project</span>
          <Sparkles className="h-3 w-3 ml-2 relative z-10 animate-pulse" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-card/90 backdrop-blur-md border-border/50 animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold font-inter bg-gradient-primary bg-clip-text text-transparent">
            {editingProject ? "Edit Project" : "Add New Project"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-mono">
            {editingProject ? "Update your project details" : "Enter your project information to get started"}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              Project Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
              className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-cyan" />
              Client Name
            </Label>
            <Input
              id="client"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              placeholder="Enter client name"
              className="bg-background/50 border-border/50 focus:border-cyan/50 focus:ring-cyan/20 transition-all duration-300 font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="projectUrl" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-green" />
              Project URL
            </Label>
            <Input
              id="projectUrl"
              type="url"
              value={formData.projectUrl}
              onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
              placeholder="https://your-project.com"
              className="bg-background/50 border-border/50 focus:border-green/50 focus:ring-green/20 transition-all duration-300 font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="githubUrl" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Github className="h-4 w-4 text-muted-foreground" />
              GitHub URL
            </Label>
            <Input
              id="githubUrl"
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/username/repo"
              className="bg-background/50 border-border/50 focus:border-muted-foreground/50 focus:ring-muted-foreground/20 transition-all duration-300 font-mono"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-border/50 hover:border-border hover:bg-card/50 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">
                {editingProject ? "Update Project" : "Add Project"}
              </span>
              <Sparkles className="h-3 w-3 ml-2 relative z-10 animate-pulse" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};