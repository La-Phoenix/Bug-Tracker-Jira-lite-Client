import { useState } from "react";
import { AuthContainer } from "../../components/Auth/AuthContainer";
import { RegisterForm } from "../../components/Auth/RegisterForm";
import { LoginForm } from "../../components/Auth/LoginForm";
import { ForgotPasswordForm } from "../../components/Auth/ForgotPasswordForm";

const AuthPage = () => {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot-password'>('login');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'register':
        return <RegisterForm onToggle={() => setCurrentView('login')} />;
      case 'forgot-password':
        return <ForgotPasswordForm onBackToLogin={() => setCurrentView('login')} />;
      case 'login':
      default:
        return (
          <LoginForm 
            onToggle={() => setCurrentView('register')}
            onForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
    }
  };

  return (
    <AuthContainer>
      {renderCurrentView()}
    </AuthContainer>
  );
};

export default AuthPage;