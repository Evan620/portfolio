import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Terminal } from 'lucide-react';
import { toast } from 'sonner';

export const EmailConfirmationSuccess: React.FC = () => {
  useEffect(() => {
    // Show success toast
    toast.success('Email confirmed successfully! Welcome to Project Folio.');
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto bg-card border-border shadow-elevated">
      <CardHeader className="text-center space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Terminal className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent font-serif tracking-wide">
              Project Folio
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-elegant italic tracking-wider">
            Professional Project Management
          </p>
        </div>
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-500/10 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <CardTitle className="text-2xl font-semibold text-foreground font-artistic tracking-wide">
          Email Confirmed!
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Your account has been successfully verified. You can now access your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>Redirecting you to your dashboard...</p>
        </div>

        <div className="text-center space-y-3">
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground/70 font-light tracking-wide">
              Developed by{' '}
              <a
                href="https://www.instagram.com/life_as_fredy?utm_source=ig_web_button_share_sheet&igsh=MXU4YXZoYTB3eTVpNA=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/80 hover:text-primary font-medium transition-colors duration-200 underline decoration-dotted underline-offset-2"
              >
                Fred
              </a>
              {' & '}
              <a
                href="https://www.instagram.com/iame.v.a.n/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/80 hover:text-primary font-medium transition-colors duration-200 underline decoration-dotted underline-offset-2"
              >
                Evan
              </a>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
