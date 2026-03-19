import type { AxiosInstance } from 'axios';
import type {
  CategoryInfo,
  CategoryInsertInfo,
  CategoryUpdateInfo,
} from '../types';

/** Category Service — Manages all API operations for categories */
export class CategoryService {
  constructor(private client: AxiosInstance) {}

  /** List all categories for a store */
  async list(storeSlug: string): Promise<CategoryInfo[]> {
    const response = await this.client.get<CategoryInfo[]>(
      `/category/${storeSlug}/list`
    );
    return response.data;
  }

  /** Get category by ID */
  async getById(storeSlug: string, categoryId: number): Promise<CategoryInfo> {
    const response = await this.client.get<CategoryInfo>(
      `/category/${storeSlug}/getById/${categoryId}`
    );
    return response.data;
  }

  /** Create a new category */
  async insert(storeSlug: string, data: CategoryInsertInfo): Promise<CategoryInfo> {
    const response = await this.client.post<CategoryInfo>(
      `/category/${storeSlug}/insert`,
      data
    );
    return response.data;
  }

  /** Update an existing category */
  async update(storeSlug: string, data: CategoryUpdateInfo): Promise<CategoryInfo> {
    const response = await this.client.post<CategoryInfo>(
      `/category/${storeSlug}/update`,
      data
    );
    return response.data;
  }

  /** Delete a category */
  async delete(storeSlug: string, categoryId: number): Promise<void> {
    await this.client.delete(`/category/${storeSlug}/delete/${categoryId}`);
  }
}
