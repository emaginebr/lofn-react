import { useState } from 'react';
import { useStore, OrderList, OrderDetail } from 'lofn-react';
import type { OrderInfo } from 'lofn-react';
import { toast } from 'sonner';

export default function OrdersPage() {
  const { currentStore } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<OrderInfo | null>(null);

  if (selectedOrder) {
    return (
      <div className="max-w-3xl mx-auto">
        <OrderDetail
          order={selectedOrder}
          onBack={() => setSelectedOrder(null)}
          onUpdated={(order) => {
            setSelectedOrder(order);
            toast.success('Status do pedido atualizado');
          }}
          className="bg-card rounded-xl border border-border p-6"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <OrderList
        storeId={currentStore!.storeId}
        onSelect={setSelectedOrder}
      />
    </div>
  );
}
