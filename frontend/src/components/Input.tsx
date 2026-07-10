import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', type = 'text', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-sm font-medium text-text-primary select-none">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`px-4 py-3 bg-white border border-border-custom rounded-input text-text-primary text-sm transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-secondary-light placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-400 ${
            error ? 'border-status-danger focus:border-status-danger focus:ring-red-100' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-status-danger font-medium -mt-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
