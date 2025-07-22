import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { EmailConfirmation } from './EmailConfirmation';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowEmailConfirmation(false);
  };

  const handleEmailConfirmationNeeded = (email: string) => {
    setConfirmationEmail(email);
    setShowEmailConfirmation(true);
  };

  const handleBackToLogin = () => {
    setShowEmailConfirmation(false);
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {showEmailConfirmation ? (
          <EmailConfirmation
            email={confirmationEmail}
            onBackToLogin={handleBackToLogin}
          />
        ) : isLogin ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <RegisterForm
            onToggleMode={toggleMode}
            onEmailConfirmationNeeded={handleEmailConfirmationNeeded}
          />
        )}
      </div>
    </div>
  );
};