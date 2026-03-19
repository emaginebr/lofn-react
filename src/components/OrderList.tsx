import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { ShoppingCart, Eye, Search } from 'lucide-react';
import { useOrder } from '@/contexts/OrderContext';
import type { OrderInfo, OrderSearchParam } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { OrderStatusBadge } from '@/components/shared/StatusBadge';

export interface OrderListProps {
  storeId: number;
  onSelect?: (order: OrderInfo) => void;
  className?: string;
}

export const OrderList: React.FC<OrderListProps> = ({
  storeId,
  onSelect,
  className,
}) => {
  const { search, isLoading } = useOrder();
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userIdFilter, setUserIdFilter] = useState('');

  const loadOrders = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const params: OrderSearchParam = {
        storeId,
        pageNum: pageNum,
        userId: userIdFilter ? parseInt(userIdFilter) : undefined,
      };
      const result = await search(params);
      setOrders(result.orders);
      setTotalPages(result.pageCount);
      setPage(result.pageNum);
    } finally {
      setLoading(false);
    }
  }, [search, storeId, userIdFilter]);

  useEffect(() => {
    loadOrders(1);
  }, [loadOrders]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pedidos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhe e gerencie pedidos</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            placeholder="Filtrar por ID do usuario"
            className="pl-9"
          />
        </div>
      </div>

      <LoadingOverlay visible={loading || isLoading} />

      {orders.length === 0 && !loading ? (
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="Nenhum pedido encontrado"
          description="Os pedidos aparecerão aqui quando forem criados."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Comprador</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Itens</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Data</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className={cn(
                      'hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors',
                      onSelect && 'cursor-pointer'
                    )}
                    onClick={() => onSelect?.(order)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-gray-500 dark:text-gray-400">
                        #{order.orderId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{order.user?.name || '-'}</p>
                      <p className="text-xs text-gray-400">{order.user?.email || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {onSelect && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => { e.stopPropagation(); onSelect(order); }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => loadOrders(p)}
          />
        </>
      )}
    </div>
  );
};
