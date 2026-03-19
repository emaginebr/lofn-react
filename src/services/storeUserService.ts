import type { AxiosInstance } from 'axios';
import type {
  StoreUserInfo,
  StoreUserInsertInfo,
} from '../types';

/** StoreUser Service — Manages all API operations for store members */
export class StoreUserService {
  constructor(private client: AxiosInstance) {}

  /** List all users of a store */
  async list(storeSlug: string): Promise<StoreUserInfo[]> {
    const response = await this.client.get<StoreUserInfo[]>(
      `/storeuser/${storeSlug}/list`
    );
    return response.data;
  }

  /** Add a user to a store */
  async insert(storeSlug: string, data: StoreUserInsertInfo): Promise<StoreUserInfo> {
    const response = await this.client.post<StoreUserInfo>(
      `/storeuser/${storeSlug}/insert`,
      data
    );
    return response.data;
  }

  /** Remove a user from a store */
  async delete(storeSlug: string, storeUserId: number): Promise<void> {
    await this.client.delete(`/storeuser/${storeSlug}/delete/${storeUserId}`);
  }
}
