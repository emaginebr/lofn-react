import type { AxiosInstance } from 'axios';
import type {
  ProductInfo,
  ProductInsertInfo,
  ProductUpdateInfo,
  ProductSearchParam,
  ProductListPagedResult,
} from '../types';

/** Product Service — Manages all API operations for products */
export class ProductService {
  constructor(private client: AxiosInstance) {}

  /** Create a new product */
  async insert(storeSlug: string, data: ProductInsertInfo): Promise<ProductInfo> {
    const response = await this.client.post<ProductInfo>(
      `/product/${storeSlug}/insert`,
      data
    );
    return response.data;
  }

  /** Update an existing product */
  async update(storeSlug: string, data: ProductUpdateInfo): Promise<ProductInfo> {
    const response = await this.client.post<ProductInfo>(
      `/product/${storeSlug}/update`,
      data
    );
    return response.data;
  }

  /** Search products (public, paginated) */
  async search(params: ProductSearchParam): Promise<ProductListPagedResult> {
    const response = await this.client.post<ProductListPagedResult>(
      '/product/search',
      params
    );
    return response.data;
  }

  /** Get product by ID */
  async getById(storeSlug: string, productId: number): Promise<ProductInfo> {
    const response = await this.client.get<ProductInfo>(
      `/product/${storeSlug}/getById/${productId}`
    );
    return response.data;
  }

  /** Get product by slug (public) */
  async getBySlug(productSlug: string): Promise<ProductInfo> {
    const response = await this.client.get<ProductInfo>(
      `/product/getBySlug/${productSlug}`
    );
    return response.data;
  }
}
