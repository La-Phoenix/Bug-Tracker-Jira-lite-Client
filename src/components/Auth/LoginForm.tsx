import React from 'react';
import { InputField } from './InputField';
import { SocialButton } from './SocialButton';
import { useAuthForm } from '../../hooks/useAuthForm';
import { API_SERVER_BASE_URL } from '../../utils/constants';
import type { ApiResponse } from '../../types/response';
import { useNavigate } from 'react-router-dom';
import { ErrorPopup, useErrorPopup } from '../PopUp';
import { Button } from '../Button';
import { useAuth } from '../../contexts/AuthContext';

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
    setErrors
  } = useAuthForm();

  const { error, showError, hideError } = useErrorPopup();
  const { setIsAuthenticated } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    console.log("Form submitted with data:", formData);

    // if (!validateForm()) {
    //   console.log("Validation failed with errors:", errors);
    //   return;
    // }

    setLoading(true);

    try {
      const response = await fetch(`${API_SERVER_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
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
      // Handle successful login
      localStorage.setItem('token', result.data?.token || '');
      localStorage.setItem('userEmail', result.data?.email || '');
      showError('Login successful! Redirecting to dashboard...', 'Login Success', 'info');
      setTimeout(() => {
        setIsAuthenticated(true);
        navigate('/dashboard', { replace: true });
      }, 3000);
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
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Welcome Back</h2>
      <div className="space-y-3 mb-6">
        <SocialButton provider="google" onClick={() => alert('Google login')} />
        <SocialButton provider="github" onClick={() => alert('GitHub login')} />
      </div>
      <div className="flex items-center justify-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-sm text-gray-500">or sign in with email</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <InputField id="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
      <InputField id="password" label="Password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <input type="checkbox" id="remember" className="accent-indigo-500 mr-2" />
          <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
        </div>
        <span className="text-sm text-[#1f2630] hover:underline cursor-pointer">Forgot password?</span>
      </div>
      {/* <button type="submit" className="w-full bg-[#0c1521] hover:bg-[#1f2630] cursor-pointer text-white py-3 rounded-lg font-semibold transition">Sign In</button> */}
      <Button type="submit" isLoading={loading} message="Signing In...">
        Sign In
      </Button>
      <p className="text-center text-sm text-gray-600 mt-4">
        Don't have an account?{' '}
        <span className="text-[#1f2630] hover:underline cursor-pointer" onClick={onToggle}>Sign up</span>
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
