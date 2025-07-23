import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Mail, ArrowLeft, RefreshCw, Terminal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailConfirmationProps {
  email: string;
  onBackToLogin: () => void;
}

export const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ email, onBackToLogin }) => {
  const [isResending, setIsResending] = useState(false);

  const handleResendConfirmation = async () => {
    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast.error('Failed to resend confirmation email');
      } else {
        toast.success('Confirmation email sent! Please check your inbox.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card border-border shadow-elevated">
      <CardHeader className="text-center space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Terminal className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Project Folio
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Professional Project Management
          </p>
        </div>
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-semibold text-foreground">
          Check your email
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          We've sent a confirmation link to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>Click the link in the email to confirm your account and complete your registration.</p>
          <p className="mt-2">Don't see the email? Check your spam folder.</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleResendConfirmation}
            disabled={isResending}
            variant="outline"
            className="w-full border-border hover:bg-accent"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Resend confirmation email
              </>
            )}
          </Button>

          <Button
            onClick={onBackToLogin}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Already confirmed your email?{' '}
            <button
              onClick={onBackToLogin}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Try signing in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
