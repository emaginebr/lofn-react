import type { AxiosInstance } from 'axios';
import type {
  OrderInfo,
  OrderSearchParam,
  OrderParam,
  OrderListPagedResult,
} from '../types';

/** Order Service — Manages all API operations for orders */
export class OrderService {
  constructor(private client: AxiosInstance) {}

  /** Update an order */
  async update(data: OrderInfo): Promise<OrderInfo> {
    const response = await this.client.post<OrderInfo>('/order/update', data);
    return response.data;
  }

  /** Search orders (paginated) */
  async search(params: OrderSearchParam): Promise<OrderListPagedResult> {
    const response = await this.client.post<OrderListPagedResult>(
      '/order/search',
      params
    );
    return response.data;
  }

  /** List orders with filters */
  async list(params: OrderParam): Promise<OrderInfo[]> {
    const response = await this.client.post<OrderInfo[]>('/order/list', params);
    return response.data;
  }

  /** Get order by ID */
  async getById(orderId: number): Promise<OrderInfo> {
    const response = await this.client.get<OrderInfo>(
      `/order/getById/${orderId}`
    );
    return response.data;
  }
}
