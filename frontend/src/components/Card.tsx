import React from 'react';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverLift = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-card border border-border-custom shadow-premium-soft transition-all duration-300 p-6 ${
        hoverLift ? 'hover:-translate-y-1 hover:shadow-premium-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
