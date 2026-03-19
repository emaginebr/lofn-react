import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useLofnClient } from './LofnContext';
import { ProductService } from '../services/productService';
import type {
  ProductInfo,
  ProductInsertInfo,
  ProductUpdateInfo,
  ProductSearchParam,
  ProductListPagedResult,
} from '../types';

interface ProductContextType {
  isLoading: boolean;
  search: (params: ProductSearchParam) => Promise<ProductListPagedResult>;
  getBySlug: (productSlug: string) => Promise<ProductInfo>;
  getById: (storeSlug: string, productId: number) => Promise<ProductInfo>;
  insert: (storeSlug: string, data: ProductInsertInfo) => Promise<ProductInfo>;
  update: (storeSlug: string, data: ProductUpdateInfo) => Promise<ProductInfo>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useLofnClient();
  const service = useMemo(() => new ProductService(client), [client]);

  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (params: ProductSearchParam): Promise<ProductListPagedResult> => {
    return await service.search(params);
  }, [service]);

  const getBySlug = useCallback(async (productSlug: string): Promise<ProductInfo> => {
    return await service.getBySlug(productSlug);
  }, [service]);

  const getById = useCallback(async (storeSlug: string, productId: number): Promise<ProductInfo> => {
    return await service.getById(storeSlug, productId);
  }, [service]);

  const insert = useCallback(async (storeSlug: string, data: ProductInsertInfo): Promise<ProductInfo> => {
    setIsLoading(true);
    try {
      return await service.insert(storeSlug, data);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const update = useCallback(async (storeSlug: string, data: ProductUpdateInfo): Promise<ProductInfo> => {
    setIsLoading(true);
    try {
      return await service.update(storeSlug, data);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const value: ProductContextType = {
    isLoading,
    search,
    getBySlug,
    getById,
    insert,
    update,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProduct = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
