import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useLofnClient } from './LofnContext';
import { StoreService } from '../services/storeService';
import type {
  StoreInfo,
  StoreInsertInfo,
  StoreUpdateInfo,
} from '../types';

interface StoreContextType {
  stores: StoreInfo[];
  currentStore: StoreInfo | null;
  isLoading: boolean;
  listStores: () => Promise<StoreInfo[]>;
  listActiveStores: () => Promise<StoreInfo[]>;
  getStoreById: (storeId: number) => Promise<StoreInfo>;
  getStoreBySlug: (storeSlug: string) => Promise<StoreInfo>;
  insertStore: (data: StoreInsertInfo) => Promise<StoreInfo>;
  updateStore: (data: StoreUpdateInfo) => Promise<StoreInfo>;
  uploadStoreLogo: (storeId: number, file: File) => Promise<StoreInfo>;
  deleteStore: (storeId: number) => Promise<void>;
  setCurrentStore: (store: StoreInfo | null) => void;
  loadStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useLofnClient();
  const service = useMemo(() => new StoreService(client), [client]);

  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [currentStore, setCurrentStore] = useState<StoreInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const listStores = useCallback(async (): Promise<StoreInfo[]> => {
    return await service.list();
  }, [service]);

  const listActiveStores = useCallback(async (): Promise<StoreInfo[]> => {
    return await service.listActive();
  }, [service]);

  const getStoreById = useCallback(async (storeId: number): Promise<StoreInfo> => {
    return await service.getById(storeId);
  }, [service]);

  const getStoreBySlug = useCallback(async (storeSlug: string): Promise<StoreInfo> => {
    return await service.getBySlug(storeSlug);
  }, [service]);

  const insertStore = useCallback(async (data: StoreInsertInfo): Promise<StoreInfo> => {
    setIsLoading(true);
    try {
      const store = await service.insert(data);
      setStores((prev) => [...prev, store]);
      return store;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const updateStore = useCallback(async (data: StoreUpdateInfo): Promise<StoreInfo> => {
    setIsLoading(true);
    try {
      const store = await service.update(data);
      setStores((prev) => prev.map((s) => (s.storeId === data.storeId ? store : s)));
      if (currentStore?.storeId === data.storeId) {
        setCurrentStore(store);
      }
      return store;
    } finally {
      setIsLoading(false);
    }
  }, [service, currentStore]);

  const uploadStoreLogo = useCallback(async (storeId: number, file: File): Promise<StoreInfo> => {
    setIsLoading(true);
    try {
      const store = await service.uploadLogo(storeId, file);
      setStores((prev) => prev.map((s) => (s.storeId === storeId ? store : s)));
      if (currentStore?.storeId === storeId) {
        setCurrentStore(store);
      }
      return store;
    } finally {
      setIsLoading(false);
    }
  }, [service, currentStore]);

  const deleteStore = useCallback(async (storeId: number): Promise<void> => {
    setIsLoading(true);
    try {
      await service.delete(storeId);
      setStores((prev) => prev.filter((s) => s.storeId !== storeId));
      if (currentStore?.storeId === storeId) {
        setCurrentStore(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [service, currentStore]);

  const loadStores = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await service.list();
      setStores(result);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const value: StoreContextType = {
    stores,
    currentStore,
    isLoading,
    listStores,
    listActiveStores,
    getStoreById,
    getStoreBySlug,
    insertStore,
    updateStore,
    uploadStoreLogo,
    deleteStore,
    setCurrentStore,
    loadStores,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
