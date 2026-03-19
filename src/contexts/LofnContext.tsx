import React, { createContext, useContext, useMemo } from 'react';
import type { AxiosInstance } from 'axios';
import { useAuth } from 'nauth-react';
import { createApiClient } from '../services/apiClient';
import type { LofnConfig } from '../types';

const LofnClientContext = createContext<AxiosInstance | undefined>(undefined);

export interface LofnProviderProps {
  config: LofnConfig;
  children: React.ReactNode;
}

/** Base provider — creates the shared Axios instance using NAuth token for all domain contexts.
 *  Must be nested inside NAuthProvider. */
export const LofnProvider: React.FC<LofnProviderProps> = ({ config, children }) => {
  const { token } = useAuth();

  const client = useMemo(() => createApiClient({
    ...config,
    getToken: () => token,
  }), [config, token]);

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
