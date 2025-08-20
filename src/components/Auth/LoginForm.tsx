import React, { useEffect } from 'react';
import { InputField } from './InputField';
// import { SocialButton } from './SocialButton';
import { useAuthForm } from '../../hooks/useAuthForm';
// import { API_CLIENT_BASE_URL, API_SERVER_BASE_URL } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';
import { ErrorPopup, useErrorPopup } from '../PopUp';
import { Button } from '../Button';
import { useAuth } from '../../contexts/AuthContext';
import { OAuthButton } from '../OAuthButton';

type LoginFormProps = {
  onToggle: () => void;
};

export const LoginForm = ({ onToggle }: LoginFormProps) => {
  const { 
    formData, 
    errors, 
    handleChange, 
    clearErrors,
    loading,
    setLoading,
    // setErrors
  } = useAuthForm();

  const { error, showError, hideError } = useErrorPopup();
  const { login, isAuthenticated } = useAuth(); // Use the login from AuthContext
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        showError('Login successful! Redirecting to dashboard...', 'Login Success', 'info');
        // Navigation will be handled by the useEffect above
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } else {
        showError(result.error|| result.message || 'Login failed', 'Login Error');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showError(err.message || 'An unexpected error occurred', 'Login Error');
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit} className="animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Welcome Back</h2>
        <InputField id="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
        <InputField id="password" label="Password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input type="checkbox" id="remember" className="accent-indigo-500 mr-2" />
            <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
          </div>
          <span className="text-sm text-[#1f2630] hover:underline cursor-pointer">Forgot password?</span>
        </div>
        <Button type="submit" isLoading={loading} message="Signing In...">
          Sign In
        </Button>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <span className="text-[#1f2630] hover:underline cursor-pointer" onClick={onToggle}>Sign up</span>
        </p>
      </form>
      <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <OAuthButton provider="Google" />
              <OAuthButton provider="GitHub" />
            </div>
          </div>
      <ErrorPopup
        isOpen={error.isOpen}
        onClose={hideError}
        title={error.title}
        message={error.message}
        type={error.type}
        autoClose={false}
      />
    </>
  );
};