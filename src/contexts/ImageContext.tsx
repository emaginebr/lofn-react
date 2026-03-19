import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useLofnClient } from './LofnContext';
import { ImageService } from '../services/imageService';
import type { ProductImageInfo } from '../types';

interface ImageContextType {
  isLoading: boolean;
  upload: (productId: number, file: File, sortOrder?: number) => Promise<ProductImageInfo>;
  list: (productId: number) => Promise<ProductImageInfo[]>;
  remove: (imageId: number) => Promise<void>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useLofnClient();
  const service = useMemo(() => new ImageService(client), [client]);

  const [isLoading, setIsLoading] = useState(false);

  const upload = useCallback(async (
    productId: number, file: File, sortOrder?: number
  ): Promise<ProductImageInfo> => {
    setIsLoading(true);
    try {
      return await service.upload(productId, file, sortOrder);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const list = useCallback(async (productId: number): Promise<ProductImageInfo[]> => {
    return await service.list(productId);
  }, [service]);

  const remove = useCallback(async (imageId: number): Promise<void> => {
    setIsLoading(true);
    try {
      await service.delete(imageId);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const value: ImageContextType = {
    isLoading,
    upload,
    list,
    remove,
  };

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useImage = (): ImageContextType => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImage must be used within an ImageProvider');
  }
  return context;
};
