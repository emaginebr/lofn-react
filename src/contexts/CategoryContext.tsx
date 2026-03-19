import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useLofnClient } from './LofnContext';
import { CategoryService } from '../services/categoryService';
import type {
  CategoryInfo,
  CategoryInsertInfo,
  CategoryUpdateInfo,
} from '../types';

interface CategoryContextType {
  isLoading: boolean;
  list: (storeSlug: string) => Promise<CategoryInfo[]>;
  listActive: (storeSlug: string) => Promise<CategoryInfo[]>;
  getById: (storeSlug: string, categoryId: number) => Promise<CategoryInfo>;
  getBySlug: (storeSlug: string, categorySlug: string) => Promise<CategoryInfo>;
  insert: (storeSlug: string, data: CategoryInsertInfo) => Promise<CategoryInfo>;
  update: (storeSlug: string, data: CategoryUpdateInfo) => Promise<CategoryInfo>;
  remove: (storeSlug: string, categoryId: number) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useLofnClient();
  const service = useMemo(() => new CategoryService(client), [client]);

  const [isLoading, setIsLoading] = useState(false);

  const list = useCallback(async (storeSlug: string): Promise<CategoryInfo[]> => {
    return await service.list(storeSlug);
  }, [service]);

  const listActive = useCallback(async (storeSlug: string): Promise<CategoryInfo[]> => {
    return await service.listActive(storeSlug);
  }, [service]);

  const getById = useCallback(async (storeSlug: string, categoryId: number): Promise<CategoryInfo> => {
    return await service.getById(storeSlug, categoryId);
  }, [service]);

  const getBySlug = useCallback(async (storeSlug: string, categorySlug: string): Promise<CategoryInfo> => {
    return await service.getBySlug(storeSlug, categorySlug);
  }, [service]);

  const insert = useCallback(async (storeSlug: string, data: CategoryInsertInfo): Promise<CategoryInfo> => {
    setIsLoading(true);
    try {
      return await service.insert(storeSlug, data);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const update = useCallback(async (storeSlug: string, data: CategoryUpdateInfo): Promise<CategoryInfo> => {
    setIsLoading(true);
    try {
      return await service.update(storeSlug, data);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const remove = useCallback(async (storeSlug: string, categoryId: number): Promise<void> => {
    setIsLoading(true);
    try {
      await service.delete(storeSlug, categoryId);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const value: CategoryContextType = {
    isLoading,
    list,
    listActive,
    getById,
    getBySlug,
    insert,
    update,
    remove,
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};
