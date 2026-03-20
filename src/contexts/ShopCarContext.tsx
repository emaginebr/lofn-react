import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useLofnClient } from './LofnContext';
import { ShopCarService } from '../services/shopCarService';
import type { ShopCarInfo, ShopCarItemInfo, ProductInfo } from '../types';

const STORAGE_KEY = 'lofn_shopcar';

interface ShopCarContextType {
  isLoading: boolean;
  items: ShopCarItemInfo[];
  itemCount: number;
  addItem: (product: ProductInfo, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  insert: (data: ShopCarInfo) => Promise<ShopCarInfo>;
}

const ShopCarContext = createContext<ShopCarContextType | undefined>(undefined);

function loadCartFromStorage(): ShopCarItemInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveCartToStorage(items: ShopCarItemInfo[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* ignore */ }
}

export const ShopCarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useLofnClient();
  const service = useMemo(() => new ShopCarService(client), [client]);

  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ShopCarItemInfo[]>(loadCartFromStorage);

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const addItem = useCallback((product: ProductInfo, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.productId === product.productId);
      if (existing) {
        return prev.map((i) =>
          i.product.productId === product.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.productId === productId ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const insert = useCallback(async (data: ShopCarInfo): Promise<ShopCarInfo> => {
    setIsLoading(true);
    try {
      const result = await service.insert(data);
      setItems([]);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const value: ShopCarContextType = {
    isLoading,
    items,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    insert,
  };

  return <ShopCarContext.Provider value={value}>{children}</ShopCarContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useShopCar = (): ShopCarContextType => {
  const context = useContext(ShopCarContext);
  if (context === undefined) {
    throw new Error('useShopCar must be used within a ShopCarProvider');
  }
  return context;
};
