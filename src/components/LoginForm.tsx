import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Terminal } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast.success('Welcome back!');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card border-border shadow-elevated">
      <CardHeader className="space-y-4">
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
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-foreground text-center font-artistic tracking-wide">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Enter your email and password to access your projects
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            Don't have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign up
            </button>
          </p>
          <p className="text-xs text-muted-foreground">
            Having trouble signing in? Make sure you've confirmed your email address.
          </p>
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