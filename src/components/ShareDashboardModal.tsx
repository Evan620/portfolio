import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Eye, EyeOff, ExternalLink, RefreshCw, Trash2, BarChart3, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SharingService, ViewStats } from "@/services/sharingService";

interface ShareDashboardModalProps {
  children: React.ReactNode;
  onShareStatusChange?: () => void;
}

export const ShareDashboardModal = ({ children, onShareStatusChange }: ShareDashboardModalProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [viewStats, setViewStats] = useState<ViewStats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Load existing share token when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCurrentShareToken();
    }
  }, [isOpen]);

  const loadCurrentShareToken = async () => {
    setIsLoading(true);
    console.log('Loading current share token...');

    const { shareToken: currentToken, viewCount: currentViewCount, error } = await SharingService.getCurrentShareTokenWithStats();

    console.log('Share token result:', { currentToken, currentViewCount, error });

    if (error) {
      console.error('Share token error:', error);
      toast({
        title: "Error loading share status",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setShareToken(currentToken);
      setViewCount(currentViewCount);
      console.log('Set view count to:', currentViewCount);

      // Load detailed stats if we have a token
      if (currentToken) {
        loadViewStats(currentToken);
      }
    }

    setIsLoading(false);
  };

  const loadViewStats = async (token: string) => {
    const { stats, error } = await SharingService.getViewStats(token);
    if (!error && stats) {
      setViewStats(stats);
    }
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
      setViewCount(0); // Reset view count for new token
      setViewStats(null); // Reset stats for new token
      toast({
        title: "Share link generated!",
        description: "Your dashboard is now shareable",
      });

      // Notify parent component of share status change
      onShareStatusChange?.();
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
      setViewCount(0);
      setViewStats(null);
      toast({
        title: "Share link deactivated",
        description: "Your dashboard is no longer publicly accessible",
      });

      // Notify parent component of share status change
      onShareStatusChange?.();
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

              {/* View Statistics */}
              {shareToken && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      View Statistics
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowStats(!showStats)}
                      className="text-xs"
                    >
                      {showStats ? "Hide" : "Show"} Details
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{viewCount}</p>
                      <p className="text-xs text-muted-foreground">Total Views</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue">{viewStats?.uniqueIps || 0}</p>
                      <p className="text-xs text-muted-foreground">Unique Visitors</p>
                    </div>
                  </div>

                  {showStats && viewStats && (
                    <div className="space-y-3 p-3 bg-background/30 rounded-lg border border-border/30">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-lg font-semibold text-green">{viewStats.viewsToday}</p>
                          <p className="text-xs text-muted-foreground">Today</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-amber">{viewStats.viewsThisWeek}</p>
                          <p className="text-xs text-muted-foreground">This Week</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-cyan">{viewStats.viewsThisMonth}</p>
                          <p className="text-xs text-muted-foreground">This Month</p>
                        </div>
                      </div>

                      {viewStats.recentViews.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Recent Views
                          </p>
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {viewStats.recentViews.slice(0, 5).map((viewTime, index) => (
                              <p key={index} className="text-xs text-muted-foreground font-mono">
                                {new Date(viewTime).toLocaleString()}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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
