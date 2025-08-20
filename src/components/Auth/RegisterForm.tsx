import React from 'react';
import { InputField } from './InputField';
// import { SocialButton } from './SocialButton';
import { useAuthForm } from '../../hooks/useAuthForm';
import { useNavigate } from 'react-router-dom';
// import { API_CLIENT_BASE_URL, API_SERVER_BASE_URL } from '../../utils/constants';
import type { ApiResponse } from '../../types/response';
import { ErrorPopup, useErrorPopup } from '../PopUp';
import { Button } from '../Button';
import { OAuthButton } from '../OAuthButton';
import { API_SERVER_BASE_URL } from '../../utils/constants';

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
    setErrors,
    clearErrors,
    validateForm
  } = useAuthForm();
  const { error, showError, hideError } = useErrorPopup();

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      
      const result: ApiResponse = await response.json();
      console.log("Response", result);

      if (!response.ok) {
        if (result.errors) {
          console.log("Backend errors:", result.errors);
          const newMessage = result.errors.join(' ');
          setLoading(false);
          showError(newMessage, 'Login Error');
          return;
        } else {
          setLoading(false);
          showError(result.message || 'An unexpected error occurred', 'Login Error');
          console.error("Error message:", result.message);
          return;
        }
      }
      // Handle successful Sign Up
      localStorage.setItem('token', result.data?.token || '');
      localStorage.setItem('userEmail', result.data?.email || '');
      showError('Sign up successful! Redirecting to dashboard...', 'Sign Up Success', 'info');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } catch (err: any) {
       if (typeof err === 'object') {
          setErrors(err);
        } else {
          showError(err.message || 'An unexpected error occurred');
        }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Account</h2>

      <InputField id="name" label="Full Name" type="text" value={formData.name} onChange={handleChange} error={errors.name} />
      <InputField id="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
      <InputField id="password" label="Password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />
      <InputField id="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />

      <div className="flex items-start mb-6">
        <input
          type="checkbox"
          id="agree"
          className="accent-indigo-500 mr-2 mt-1"
          checked={formData.agree}
          onChange={handleChange}
        />
        <label htmlFor="agree" className="text-sm text-gray-600">
          I agree to the Terms of Service and Privacy Policy
        </label>
      </div>
      {errors.agree && <p className="text-sm text-red-500 mb-2">{errors.agree}</p>}

      {/* <button
        type="submit"
        disabled={loading}
        className={`w-full ${loading ? 'bg-gray-400' : 'bg-[#0c1521] hover:bg-[#1f2630]'} text-white py-3 rounded-lg font-semibold transition`}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button> */}
      <Button type="submit" isLoading={loading} message="Creating account...">
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <span className="text-[#1f2630] hover:underline cursor-pointer" onClick={onToggle}>Sign in</span>
      </p>
    </form>
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500 dark:text-gray-400">
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
