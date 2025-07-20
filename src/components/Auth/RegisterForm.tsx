import React from 'react';
import { InputField } from './InputField';
import { SocialButton } from './SocialButton';
import { useAuthForm } from '../../hooks/useAuthForm';

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearErrors();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('https://your-api-url.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          const backendErrors: Record<string, string> = {};
          for (const key in result.errors) {
            backendErrors[key] = result.errors[key][0];
          }
          throw backendErrors;
        }

        throw { general: result.message || 'Registration failed' };
      }

      alert('Registration successful!');
      onToggle(); // Switch to login
    } catch (err: any) {
      if (typeof err === 'object') {
        setErrors(err);
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Account</h2>

      <div className="space-y-3 mb-6">
        <SocialButton provider="google" onClick={() => alert('Google register')} />
        <SocialButton provider="github" onClick={() => alert('GitHub register')} />
      </div>

      <div className="flex items-center justify-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-sm text-gray-500">or create with email</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

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

      <button
        type="submit"
        disabled={loading}
        className={`w-full ${loading ? 'bg-gray-400' : 'bg-[#0c1521] hover:bg-[#1f2630]'} text-white py-3 rounded-lg font-semibold transition`}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <span className="text-[#1f2630] hover:underline cursor-pointer" onClick={onToggle}>Sign in</span>
      </p>
    </form>
  );
};
