import React from 'react';

interface SocialButtonProps {
  provider: 'google' | 'github';
  onClick: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ provider, onClick }) => {
  const icon = provider === 'google' ? '🔍' : '🐙';
  const label = provider.charAt(0).toUpperCase() + provider.slice(1);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg bg-white hover:border-indigo-500 hover:shadow-md transition-colors w-full text-sm font-medium"
    >
      <span>{icon}</span>
      Continue with {label}
    </button>
  );
};