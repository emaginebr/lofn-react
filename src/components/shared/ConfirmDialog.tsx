import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/utils/cn';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  onConfirm,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
          'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl',
          'animate-slide-in-bottom focus:outline-none'
        )}>
          <div className="flex items-start gap-4">
            {variant === 'danger' && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            )}
            <div className="flex-1">
              <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button className="rounded-md p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="secondary" size="sm" disabled={loading}>
                {cancelLabel}
              </Button>
            </Dialog.Close>
            <Button
              variant={variant === 'danger' ? 'destructive' : 'default'}
              size="sm"
              disabled={loading}
              onClick={onConfirm}
            >
              {loading ? 'Aguarde...' : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
