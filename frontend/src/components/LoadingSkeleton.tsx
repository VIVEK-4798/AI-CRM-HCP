import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-4 animate-pulse w-full ${className}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex flex-col gap-2 p-4 bg-white border border-border-custom rounded-card">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-5/6" />
        </div>
      ))}
    </div>
  );
};
