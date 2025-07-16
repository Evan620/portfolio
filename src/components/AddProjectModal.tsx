import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
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
        <Button variant="gradient">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingProject ? "Edit Project" : "Add New Project"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
              className="transition-[var(--transition-smooth)] focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client">Client Name</Label>
            <Input
              id="client"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              placeholder="Enter client name"
              className="transition-[var(--transition-smooth)] focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="projectUrl">Project URL</Label>
            <Input
              id="projectUrl"
              type="url"
              value={formData.projectUrl}
              onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
              placeholder="https://example.com"
              className="transition-[var(--transition-smooth)] focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/username/repo"
              className="transition-[var(--transition-smooth)] focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
            >
              {editingProject ? "Update Project" : "Add Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};