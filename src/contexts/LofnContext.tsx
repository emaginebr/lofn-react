import React, { createContext, useContext, useMemo } from 'react';
import type { AxiosInstance } from 'axios';
import { createApiClient } from '../services/apiClient';
import type { LofnConfig } from '../types';

const LofnClientContext = createContext<AxiosInstance | undefined>(undefined);

export interface LofnProviderProps {
  config: LofnConfig;
  children: React.ReactNode;
}

/** Base provider — creates the shared Axios instance for all domain contexts */
export const LofnProvider: React.FC<LofnProviderProps> = ({ config, children }) => {
  const client = useMemo(() => createApiClient(config), [config]);

  return (
    <LofnClientContext.Provider value={client}>{children}</LofnClientContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLofnClient = (): AxiosInstance => {
  const client = useContext(LofnClientContext);

  if (client === undefined) {
    throw new Error('useLofnClient must be used within a LofnProvider');
  }

  return client;
};
