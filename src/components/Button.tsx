import type { ButtonHTMLAttributes } from "react";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading: boolean;
    onClick?: (e: React.FormEvent) => Promise<void>;
    message: string;
    type?: "button" | "submit" | "reset";
    children?: React.ReactNode;
}

export const Button: React.FC<LoadingButtonProps> = ({ isLoading, onClick, message, type, children, ...props }) => {
  return (
    <button 
      type={type || "button"}
      disabled={isLoading}
      onClick={onClick}
      className="w-full bg-[#0c1521] hover:bg-[#1f2630] disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
      {...props}
    >
      {isLoading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
            {message}
        </>
      ) : (
        children || 'Sign In'
      )}
    </button>
  );
};