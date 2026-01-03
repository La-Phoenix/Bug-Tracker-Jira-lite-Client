import React from 'react';
import { InputField } from './InputField';
import { useAuthForm } from '../../hooks/useAuthForm';
import { ErrorPopup, useErrorPopup } from '../PopUp';
import { Button } from '../Button';
import { AuthService } from '../../services/authService';

type ForgotPasswordFormProps = {
  onBackToLogin: () => void;
};

export const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const {
    formData,
    errors,
    loading,
    setLoading,
    handleChange,
    clearErrors,
  } = useAuthForm();
  
  const { error, showError, hideError } = useErrorPopup();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();

    if (!formData.email) {
      showError('Please enter your email address', 'Validation Error');
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.forgotPassword({ email: formData.email });
      
      if (result.success) {
        showError(
          'Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions.',
          'Email Sent',
          'info'
        );
      } else {
        showError(result.message || 'Failed to send password reset email', 'Error');
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      showError(err.message || 'An unexpected error occurred', 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Reset Password</h2>
        <p className="text-gray-600 mb-6">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        
        <InputField 
          id="email" 
          label="Email Address" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
          error={errors.email}
          placeholder="Enter your email address"
        />

        <Button type="submit" isLoading={loading} message="Sending reset email...">
          Send Reset Email
        </Button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Remember your password?{' '}
          <span 
            className="text-[#1f2630] hover:underline cursor-pointer" 
            onClick={onBackToLogin}
          >
            Back to login
          </span>
        </p>
      </form>

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