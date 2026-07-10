import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "px-6 py-3 font-medium text-sm rounded-button transition-all duration-200 focus:outline-none flex items-center justify-center gap-2 select-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary text-text-primary hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(245,176,0,0.2)] shadow-sm disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none",
    secondary: "bg-secondary text-text-primary hover:bg-opacity-90 hover:shadow-sm disabled:bg-slate-200 disabled:text-slate-400",
    outline: "border border-border-custom bg-transparent text-text-primary hover:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400",
    danger: "bg-status-danger text-white hover:bg-opacity-90 hover:shadow-sm disabled:bg-slate-200 disabled:text-slate-400"
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
};
