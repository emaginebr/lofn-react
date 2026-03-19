import React from 'react';
import { cn } from '@/utils/cn';
import { ProductStatusEnum, OrderStatusEnum } from '@/types';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
  neutral: 'bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20',
};

export interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, children, className }) => {
  return (
    <span className={cn(
      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
};

// Helpers

const productStatusMap: Record<ProductStatusEnum, { label: string; variant: BadgeVariant }> = {
  [ProductStatusEnum.Active]: { label: 'Ativo', variant: 'success' },
  [ProductStatusEnum.Inactive]: { label: 'Inativo', variant: 'neutral' },
  [ProductStatusEnum.Expired]: { label: 'Expirado', variant: 'danger' },
};

const orderStatusMap: Record<OrderStatusEnum, { label: string; variant: BadgeVariant }> = {
  [OrderStatusEnum.Incoming]: { label: 'Recebido', variant: 'info' },
  [OrderStatusEnum.Active]: { label: 'Ativo', variant: 'success' },
  [OrderStatusEnum.Suspended]: { label: 'Suspenso', variant: 'warning' },
  [OrderStatusEnum.Finished]: { label: 'Finalizado', variant: 'neutral' },
  [OrderStatusEnum.Expired]: { label: 'Expirado', variant: 'danger' },
};

export const ProductStatusBadge: React.FC<{ status: ProductStatusEnum; className?: string }> = ({ status, className }) => {
  const config = productStatusMap[status] || { label: 'Desconhecido', variant: 'neutral' as BadgeVariant };
  return <StatusBadge variant={config.variant} className={className}>{config.label}</StatusBadge>;
};

export const OrderStatusBadge: React.FC<{ status: OrderStatusEnum; className?: string }> = ({ status, className }) => {
  const config = orderStatusMap[status] || { label: 'Desconhecido', variant: 'neutral' as BadgeVariant };
  return <StatusBadge variant={config.variant} className={className}>{config.label}</StatusBadge>;
};
