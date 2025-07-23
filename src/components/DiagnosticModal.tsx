import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle, Database, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DiagnosticModalProps {
  children: React.ReactNode;
}

export const DiagnosticModal = ({ children }: DiagnosticModalProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsChecking(true);
    const diagnostics = {
      userAuth: false,
      sharedDashboardsTable: false,
      dashboardViewsTable: false,
      viewCountColumn: false,
      trackViewFunction: false,
      getStatsFunction: false,
      currentShareToken: null,
      error: null
    };

    try {
      // Check user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (user && !authError) {
        diagnostics.userAuth = true;
      }

      // Check if shared_dashboards table exists
      try {
        const { error: tableError } = await supabase
          .from('shared_dashboards')
          .select('id')
          .limit(1);
        
        if (!tableError) {
          diagnostics.sharedDashboardsTable = true;
        }
      } catch (e) {
        console.log('shared_dashboards table check failed:', e);
      }

      // Check if dashboard_views table exists
      try {
        const { error: viewsTableError } = await supabase
          .from('dashboard_views')
          .select('id')
          .limit(1);
        
        if (!viewsTableError) {
          diagnostics.dashboardViewsTable = true;
        }
      } catch (e) {
        console.log('dashboard_views table check failed:', e);
      }

      // Check if view_count column exists in shared_dashboards
      try {
        const { data, error: columnError } = await supabase
          .from('shared_dashboards')
          .select('view_count')
          .limit(1);
        
        if (!columnError) {
          diagnostics.viewCountColumn = true;
        }
      } catch (e) {
        console.log('view_count column check failed:', e);
      }

      // Check if track_dashboard_view function exists
      try {
        const { error: trackError } = await supabase
          .rpc('track_dashboard_view', { p_share_token: 'test-token' });
        
        // Function exists if we get a specific error (not "function does not exist")
        if (trackError && !trackError.message.includes('function') && !trackError.message.includes('does not exist')) {
          diagnostics.trackViewFunction = true;
        }
      } catch (e) {
        console.log('track_dashboard_view function check failed:', e);
      }

      // Check if get_dashboard_view_stats function exists
      try {
        const { error: statsError } = await supabase
          .rpc('get_dashboard_view_stats', { p_share_token: 'test-token' });
        
        // Function exists if we get a specific error (not "function does not exist")
        if (statsError && !statsError.message.includes('function') && !statsError.message.includes('does not exist')) {
          diagnostics.getStatsFunction = true;
        }
      } catch (e) {
        console.log('get_dashboard_view_stats function check failed:', e);
      }

      // Check current share token
      if (user) {
        try {
          const { data: shareData, error: shareError } = await supabase
            .from('shared_dashboards')
            .select('share_token, view_count, is_active')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (!shareError && shareData) {
            diagnostics.currentShareToken = shareData;
          }
        } catch (e) {
          console.log('Current share token check failed:', e);
        }
      }

    } catch (error: any) {
      diagnostics.error = error.message;
    }

    setResults(diagnostics);
    setIsChecking(false);
  };

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Sharing Diagnostics
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? "Running Diagnostics..." : "Run Diagnostics"}
          </Button>

          {results && (
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Database Status</h4>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>User Authentication</span>
                    <StatusIcon status={results.userAuth} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>shared_dashboards table</span>
                    <StatusIcon status={results.sharedDashboardsTable} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>dashboard_views table</span>
                    <StatusIcon status={results.dashboardViewsTable} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>view_count column</span>
                    <StatusIcon status={results.viewCountColumn} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>track_dashboard_view function</span>
                    <StatusIcon status={results.trackViewFunction} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>get_dashboard_view_stats function</span>
                    <StatusIcon status={results.getStatsFunction} />
                  </div>
                </div>
              </div>

              {results.currentShareToken && (
                <div className="p-3 bg-muted/20 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Current Share Status</h4>
                  <div className="space-y-1 text-xs">
                    <p><strong>Token:</strong> {results.currentShareToken.share_token.substring(0, 20)}...</p>
                    <p><strong>View Count:</strong> {results.currentShareToken.view_count}</p>
                    <p><strong>Active:</strong> {results.currentShareToken.is_active ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              )}

              {results.error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{results.error}</p>
                </div>
              )}

              <div className="p-3 bg-blue/10 border border-blue/20 rounded-lg">
                <h4 className="font-medium text-sm text-blue mb-1">Next Steps</h4>
                <div className="text-xs text-blue/80 space-y-1">
                  {!results.sharedDashboardsTable && <p>• Apply the first migration (shared_dashboards table)</p>}
                  {!results.dashboardViewsTable && <p>• Apply the second migration (dashboard_views table)</p>}
                  {!results.viewCountColumn && <p>• Apply the view tracking migration</p>}
                  {!results.trackViewFunction && <p>• Apply the RPC functions migration</p>}
                  {results.sharedDashboardsTable && results.dashboardViewsTable && results.viewCountColumn && results.trackViewFunction && !results.currentShareToken && <p>• Generate a share link to see view counter</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
