import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ id, label, type, value, onChange, error }) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder=" "
          required
          className={`peer w-full px-4 pt-5 pb-2 border rounded-lg bg-gray-100 text-gray-800 placeholder-transparent focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <label
          htmlFor={id}
          className="absolute left-4 top-2.5 text-sm text-gray-500 transition-all 
            peer-placeholder-shown:top-3.5 
            peer-placeholder-shown:text-base 
            peer-placeholder-shown:text-gray-400 
            peer-focus:top-1 
            peer-focus:text-sm 
            peer-focus:text-indigo-500 
            bg-gray-100 px-1"
        >
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
