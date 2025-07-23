import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Eye, EyeOff, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SharingService } from "@/services/sharingService";

interface ShareDashboardModalProps {
  children: React.ReactNode;
}

export const ShareDashboardModal = ({ children }: ShareDashboardModalProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing share token when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCurrentShareToken();
    }
  }, [isOpen]);

  const loadCurrentShareToken = async () => {
    setIsLoading(true);
    const { shareToken: currentToken, error } = await SharingService.getCurrentShareToken();
    
    if (error) {
      toast({
        title: "Error loading share status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setShareToken(currentToken);
    }
    
    setIsLoading(false);
  };

  const generateShareLink = async () => {
    setIsGenerating(true);
    const { shareToken: newToken, error } = await SharingService.createShareToken();
    
    if (error) {
      toast({
        title: "Error generating share link",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setShareToken(newToken);
      toast({
        title: "Share link generated!",
        description: "Your dashboard is now shareable",
      });
    }
    
    setIsGenerating(false);
  };

  const deactivateShareLink = async () => {
    setIsGenerating(true);
    const { error } = await SharingService.deactivateShareToken();
    
    if (error) {
      toast({
        title: "Error deactivating share link",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setShareToken(null);
      toast({
        title: "Share link deactivated",
        description: "Your dashboard is no longer publicly accessible",
      });
    }
    
    setIsGenerating(false);
  };

  const copyShareLink = async () => {
    if (!shareToken) return;
    
    const shareUrl = `${window.location.origin}/shared/${shareToken}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const openShareLink = () => {
    if (!shareToken) return;
    
    const shareUrl = `${window.location.origin}/shared/${shareToken}`;
    window.open(shareUrl, '_blank');
  };

  const shareUrl = shareToken ? `${window.location.origin}/shared/${shareToken}` : '';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading share status...</p>
            </div>
          ) : (
            <>
              {/* Share Status */}
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/30">
                <div className="flex items-center gap-3">
                  {shareToken ? (
                    <Eye className="h-5 w-5 text-green" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {shareToken ? "Dashboard is public" : "Dashboard is private"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shareToken 
                        ? "Anyone with the link can view your projects" 
                        : "Only you can view your dashboard"
                      }
                    </p>
                  </div>
                </div>
                <Badge variant={shareToken ? "default" : "secondary"} className="font-mono text-xs">
                  {shareToken ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Share Link Section */}
              {shareToken ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="share-url" className="text-sm font-medium">
                      Share URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="share-url"
                        value={shareUrl}
                        readOnly
                        className="font-mono text-xs bg-background/50"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyShareLink}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={openShareLink}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      onClick={generateShareLink}
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Regenerate
                    </Button>
                  </div>

                  <Button
                    variant="destructive"
                    onClick={deactivateShareLink}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Deactivate Share Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">Share Your Dashboard</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a public link to share your project portfolio with others. 
                      GitHub links will be hidden for privacy.
                    </p>
                  </div>

                  <Button
                    onClick={generateShareLink}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4 mr-2" />
                    )}
                    Generate Share Link
                  </Button>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="p-3 bg-blue/10 border border-blue/20 rounded-lg">
                <p className="text-xs text-blue font-medium mb-1">Privacy Notice</p>
                <p className="text-xs text-blue/80">
                  Shared dashboards only show project names, descriptions, and live site URLs. 
                  GitHub repository links are automatically hidden for security.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
