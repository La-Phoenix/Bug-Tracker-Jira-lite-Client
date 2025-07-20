import React from 'react';
import { InputField } from './InputField';
import { SocialButton } from './SocialButton';
import { useAuthForm } from '../../hooks/useAuthForm';

type LoginFormProps = {
  onToggle: () => void;
};

export const LoginForm = ({ onToggle }: LoginFormProps) => {
  const { formData, errors, handleChange, clearErrors } = useAuthForm();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();
    alert('Login logic goes here');
  }

  return (
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
      <button type="submit" className="w-full bg-[#0c1521] hover:bg-[#1f2630] text-white py-3 rounded-lg font-semibold transition">Sign In</button>
      <p className="text-center text-sm text-gray-600 mt-4">
        Don't have an account?{' '}
        <span className="text-[#1f2630] hover:underline cursor-pointer" onClick={onToggle}>Sign up</span>
      </p>
    </form>
  );
};
