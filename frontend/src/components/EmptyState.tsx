import React from 'react';
import { Database } from 'lucide-react';
import { Card } from './Card';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data available",
  description = "There are no records to show at the moment.",
  icon = <Database className="w-12 h-12 text-slate-300" />,
  action
}) => {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed border-2">
      <div className="p-4 bg-slate-50 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-1">
        {title}
      </h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </Card>
  );
};
