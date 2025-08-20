import React, { useEffect } from 'react';
import { InputField } from './InputField';
import { useAuthForm } from '../../hooks/useAuthForm';
import { useNavigate } from 'react-router-dom';
import { ErrorPopup, useErrorPopup } from '../PopUp';
import { Button } from '../Button';
import { OAuthButton } from '../OAuthButton';
import { useAuth } from '../../contexts/AuthContext';

type RegisterFormProps = {
  onToggle: () => void;
};

export const RegisterForm = ({ onToggle }: RegisterFormProps) => {
  const {
    formData,
    errors,
    loading,
    setLoading,
    handleChange,
    clearErrors,
    validateForm
  } = useAuthForm();
  
  const { error, showError, hideError } = useErrorPopup();
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Check if user is already authenticated (from OAuth or regular login)
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Use the AuthContext register method instead of direct API call
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        showError('Sign up successful! Redirecting to dashboard...', 'Sign Up Success', 'info');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } else {
        showError(result.message || 'Registration failed', 'Registration Error');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      showError(err.message || 'An unexpected error occurred', 'Registration Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Create Account</h2>

        <InputField 
          id="name" 
          label="Full Name" 
          type="text" 
          value={formData.name} 
          onChange={handleChange} 
          error={errors.name} 
        />
        
        <InputField 
          id="email" 
          label="Email Address" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
          error={errors.email} 
        />
        
        <InputField 
          id="password" 
          label="Password" 
          type="password" 
          value={formData.password} 
          onChange={handleChange} 
          error={errors.password} 
        />
        
        <InputField 
          id="confirmPassword" 
          label="Confirm Password" 
          type="password" 
          value={formData.confirmPassword} 
          onChange={handleChange} 
          error={errors.confirmPassword} 
        />

        <div className="flex items-start mb-6">
          <input
            type="checkbox"
            id="agree"
            className="accent-indigo-500 mr-2 mt-1"
            checked={formData.agree}
            onChange={handleChange}
          />
          <label htmlFor="agree" className="text-sm text-gray-600 dark:text-gray-400">
            I agree to the Terms of Service and Privacy Policy
          </label>
        </div>
        {errors.agree && <p className="text-sm text-red-500 mb-2">{errors.agree}</p>}

        <Button type="submit" isLoading={loading} message="Creating account...">
          Create Account
        </Button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Already have an account?{' '}
          <span 
            className="text-[#1f2630] dark:text-blue-400 hover:underline cursor-pointer" 
            onClick={onToggle}
          >
            Sign in
          </span>
        </p>
      </form>

      {/* OAuth Options */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Or sign up with
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