import type { AxiosInstance } from 'axios';
import type { ShopCarInfo } from '../types';

/** ShopCar Service — Manages API operations for shopping cart */
export class ShopCarService {
  constructor(private client: AxiosInstance) {}

  /** Create a shopping cart */
  async insert(data: ShopCarInfo): Promise<ShopCarInfo> {
    const response = await this.client.post<ShopCarInfo>('/shopcar/insert', data);
    return response.data;
  }
}
