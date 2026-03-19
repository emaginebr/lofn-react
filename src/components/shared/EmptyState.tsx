import React from 'react';
import { cn } from '@/utils/cn';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      className
    )}>
      <div className="mb-4 text-gray-300 dark:text-gray-600">
        {icon || <Inbox className="h-12 w-12" />}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
