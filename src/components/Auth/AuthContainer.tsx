import React from 'react';
import { SidePanel } from './SidePanel';
import { FormPanel } from './FormPanel';

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0c1521] to-[#0c1521] flex items-center justify-center px-4 overflow-hidden">
         
      {/* Animated radial background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-[spin_20s_linear_infinite] z-0" />

      {/* Foreground blurred panel */}
      <div className="relative w-full max-w-5xl min-h-[600px] flex flex-col md:flex-row bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden z-10">
        <SidePanel />
        <FormPanel>{children}</FormPanel>
      </div>
    </div>
  );
};

