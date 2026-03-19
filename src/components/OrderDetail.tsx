import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { ArrowLeft, Package, User, Clock } from 'lucide-react';
import { useOrder } from '@/contexts/OrderContext';
import { OrderStatusEnum } from '@/types';
import type { OrderInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { OrderStatusBadge } from '@/components/shared/StatusBadge';

export interface OrderDetailProps {
  order: OrderInfo;
  onBack?: () => void;
  onUpdated?: (order: OrderInfo) => void;
  className?: string;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  onBack,
  onUpdated,
  className,
}) => {
  const { update, isLoading } = useOrder();
  const [currentOrder, setCurrentOrder] = useState<OrderInfo>(order);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: OrderStatusEnum) => {
    setError(null);
    try {
      const updated = await update({ ...currentOrder, status: newStatus });
      setCurrentOrder(updated);
      onUpdated?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar pedido');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const statusOptions = [
    { value: OrderStatusEnum.Incoming, label: 'Recebido' },
    { value: OrderStatusEnum.Active, label: 'Ativo' },
    { value: OrderStatusEnum.Suspended, label: 'Suspenso' },
    { value: OrderStatusEnum.Finished, label: 'Finalizado' },
    { value: OrderStatusEnum.Expired, label: 'Expirado' },
  ];

  return (
    <div className={cn('relative space-y-6', className)}>
      <LoadingOverlay visible={isLoading} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Pedido #{currentOrder.orderId}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              {formatDate(currentOrder.createdAt)}
            </div>
          </div>
        </div>
        <OrderStatusBadge status={currentOrder.status} />
      </div>

      {/* Status Actions */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Alterar Status</h3>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={currentOrder.status === opt.value ? 'default' : 'outline'}
              disabled={currentOrder.status === opt.value || isLoading}
              onClick={() => handleStatusChange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Buyer / Seller */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comprador</h3>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentOrder.user?.name || '-'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{currentOrder.user?.email || ''}</p>
        </div>
        {currentOrder.seller && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Vendedor</h3>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentOrder.seller.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{currentOrder.seller.email}</p>
          </div>
        )}
      </div>

      {/* Items */}
      {currentOrder.items && currentOrder.items.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            Itens ({currentOrder.items.length})
          </h3>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Produto</th>
                  <th className="text-center px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Qtd</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Preco Unit.</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentOrder.items.map((item) => (
                  <tr key={item.itemId}>
                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">
                      {item.product?.name || `Produto #${item.productId}`}
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-500 dark:text-gray-400">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-500 dark:text-gray-400">
                      {item.product ? formatPrice(item.product.price) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-gray-100">
                      {item.product ? formatPrice(item.product.price * item.quantity) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
