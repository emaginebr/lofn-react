import React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export interface LoadingOverlayProps {
  visible: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, className }) => {
  if (!visible) return null;

  return (
    <div className={cn(
      'absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] rounded-lg',
      className
    )}>
      <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
    </div>
  );
};
