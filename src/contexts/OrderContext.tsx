import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useLofnClient } from './LofnContext';
import { OrderService } from '../services/orderService';
import type {
  OrderInfo,
  OrderSearchParam,
  OrderParam,
  OrderListPagedResult,
} from '../types';

interface OrderContextType {
  isLoading: boolean;
  search: (params: OrderSearchParam) => Promise<OrderListPagedResult>;
  list: (params: OrderParam) => Promise<OrderInfo[]>;
  getById: (orderId: number) => Promise<OrderInfo>;
  update: (data: OrderInfo) => Promise<OrderInfo>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useLofnClient();
  const service = useMemo(() => new OrderService(client), [client]);

  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (params: OrderSearchParam): Promise<OrderListPagedResult> => {
    return await service.search(params);
  }, [service]);

  const list = useCallback(async (params: OrderParam): Promise<OrderInfo[]> => {
    return await service.list(params);
  }, [service]);

  const getById = useCallback(async (orderId: number): Promise<OrderInfo> => {
    return await service.getById(orderId);
  }, [service]);

  const update = useCallback(async (data: OrderInfo): Promise<OrderInfo> => {
    setIsLoading(true);
    try {
      return await service.update(data);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const value: OrderContextType = {
    isLoading,
    search,
    list,
    getById,
    update,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
