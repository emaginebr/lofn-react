import type { AxiosInstance } from 'axios';
import type {
  StoreInfo,
  StoreInsertInfo,
  StoreUpdateInfo,
} from '../types';

/** Store Service — Manages all API operations for stores */
export class StoreService {
  constructor(private client: AxiosInstance) {}

  /** List all stores for the authenticated user */
  async list(): Promise<StoreInfo[]> {
    const response = await this.client.get<StoreInfo[]>('/store/list');
    return response.data;
  }

  /** Get store by ID */
  async getById(storeId: number): Promise<StoreInfo> {
    const response = await this.client.get<StoreInfo>(
      `/store/getById/${storeId}`
    );
    return response.data;
  }

  /** Create a new store */
  async insert(data: StoreInsertInfo): Promise<StoreInfo> {
    const response = await this.client.post<StoreInfo>('/store/insert', data);
    return response.data;
  }

  /** Update an existing store */
  async update(data: StoreUpdateInfo): Promise<StoreInfo> {
    const response = await this.client.post<StoreInfo>('/store/update', data);
    return response.data;
  }

  /** Delete a store */
  async delete(storeId: number): Promise<void> {
    await this.client.delete(`/store/delete/${storeId}`);
  }
}
