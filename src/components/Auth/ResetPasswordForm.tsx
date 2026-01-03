import React, { useEffect, useState } from 'react';
import { InputField } from './InputField';
import { useAuthForm } from '../../hooks/useAuthForm';
import { ErrorPopup, useErrorPopup } from '../PopUp';
import { Button } from '../Button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../../services/authService';

export const ResetPasswordForm = () => {
  const {
    formData,
    errors,
    loading,
    setLoading,
    handleChange,
    clearErrors,
    setErrors
  } = useAuthForm();
  
  const { error, showError, hideError } = useErrorPopup();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    if (!tokenChecked && !token) {
      setTokenChecked(true);
      showError('Invalid or missing reset token', 'Invalid Token');
    }
  }, [token, navigate, showError, tokenChecked]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();

    // Validate passwords
    if (!formData.password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    if (!formData.confirmPassword) {
      setErrors({ confirmPassword: 'Please confirm your password' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrors({ 
        password: 'Password must be at least 8 characters long and contain at least one special character, one uppercase letter, one lowercase letter, and one number.' 
      });
      return;
    }

    if (!token) {
      showError('Invalid reset token', 'Error');
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.resetPassword({
        token,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      if (result.success) {
        showError(
          'Your password has been reset successfully. You can now login with your new password.',
          'Password Reset Successful',
          'info'
        );
        setTimeout(() => navigate('/auth'), 3000);
      } else {
        showError(result.message || 'Failed to reset password', 'Error');
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      showError(err.message || 'An unexpected error occurred', 'Error');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="animate-fade-in text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Invalid Reset Link</h2>
        <p className="text-gray-600 mb-6">
          The password reset link is invalid or has expired. Please request a new one.
        </p>
        <Button 
          isLoading={false}
          message=""
          onClick={async () => navigate('/auth')}
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Reset Your Password</h2>
        <p className="text-gray-600 mb-6">
          Enter your new password below.
        </p>
        
        <InputField 
          id="password" 
          label="New Password" 
          type="password" 
          value={formData.password} 
          onChange={handleChange} 
          error={errors.password}
          placeholder="Enter your new password"
        />

        <InputField 
          id="confirmPassword" 
          label="Confirm New Password" 
          type="password" 
          value={formData.confirmPassword} 
          onChange={handleChange} 
          error={errors.confirmPassword}
          placeholder="Confirm your new password"
        />

        <Button type="submit" isLoading={loading} message="Resetting password...">
          Reset Password
        </Button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Remember your password?{' '}
          <span 
            className="text-[#1f2630] hover:underline cursor-pointer" 
            onClick={() => navigate('/auth')}
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