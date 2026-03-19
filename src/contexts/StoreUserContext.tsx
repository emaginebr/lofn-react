import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useLofnClient } from './LofnContext';
import { StoreUserService } from '../services/storeUserService';
import type {
  StoreUserInfo,
  StoreUserInsertInfo,
} from '../types';

interface StoreUserContextType {
  isLoading: boolean;
  list: (storeSlug: string) => Promise<StoreUserInfo[]>;
  insert: (storeSlug: string, data: StoreUserInsertInfo) => Promise<StoreUserInfo>;
  remove: (storeSlug: string, storeUserId: number) => Promise<void>;
}

const StoreUserContext = createContext<StoreUserContextType | undefined>(undefined);

export const StoreUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useLofnClient();
  const service = useMemo(() => new StoreUserService(client), [client]);

  const [isLoading, setIsLoading] = useState(false);

  const list = useCallback(async (storeSlug: string): Promise<StoreUserInfo[]> => {
    return await service.list(storeSlug);
  }, [service]);

  const insert = useCallback(async (storeSlug: string, data: StoreUserInsertInfo): Promise<StoreUserInfo> => {
    setIsLoading(true);
    try {
      return await service.insert(storeSlug, data);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const remove = useCallback(async (storeSlug: string, storeUserId: number): Promise<void> => {
    setIsLoading(true);
    try {
      await service.delete(storeSlug, storeUserId);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const value: StoreUserContextType = {
    isLoading,
    list,
    insert,
    remove,
  };

  return <StoreUserContext.Provider value={value}>{children}</StoreUserContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStoreUser = (): StoreUserContextType => {
  const context = useContext(StoreUserContext);
  if (context === undefined) {
    throw new Error('useStoreUser must be used within a StoreUserProvider');
  }
  return context;
};
