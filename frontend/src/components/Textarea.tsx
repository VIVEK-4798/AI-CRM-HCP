import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', rows = 4, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-sm font-medium text-text-primary select-none">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`px-4 py-3 bg-white border border-border-custom rounded-input text-text-primary text-sm transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-secondary-light placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-400 resize-y ${
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

Textarea.displayName = 'Textarea';
