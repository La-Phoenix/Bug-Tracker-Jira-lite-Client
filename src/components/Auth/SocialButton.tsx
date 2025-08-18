import React, { useState } from 'react';

interface SocialButtonProps {
  provider: 'google' | 'github';
  onClick: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ provider, onClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const icon = provider === 'google' ? '🔍' : '🐙';
  const label = provider.charAt(0).toUpperCase() + provider.slice(1);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      onClick();
    } finally {
      // In case the onClick callback doesn't navigate away
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg bg-white hover:border-indigo-500 hover:shadow-md transition-colors w-full text-sm font-medium ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Please wait...
        </>
      ) : (
        <>
          <span>{icon}</span>
          Continue with {label}
        </>
      )}
    </button>
  );
};