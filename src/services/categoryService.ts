import type { AxiosInstance } from 'axios';
import { GraphQLClient } from './graphqlClient';
import type {
  CategoryInfo,
  CategoryInsertInfo,
  CategoryUpdateInfo,
} from '../types';

const CATEGORY_FIELDS = `
  categoryId
  slug
  name
  productCount
`;

/** Category Service — Queries via GraphQL, mutations via REST */
export class CategoryService {
  private gql: GraphQLClient;

  constructor(private client: AxiosInstance) {
    this.gql = new GraphQLClient(client);
  }

  /** List categories with active products (public, GraphQL) */
  async listActive(storeSlug: string): Promise<CategoryInfo[]> {
    const data = await this.gql.query<{ storeBySlug: Array<{ categories: CategoryInfo[] }> }>(`
      query ($storeSlug: String!) {
        storeBySlug(slug: $storeSlug) {
          categories { ${CATEGORY_FIELDS} }
        }
      }
    `, { storeSlug });
    return data.storeBySlug?.[0]?.categories ?? [];
  }

  /** Get category by slug (public, GraphQL) */
  async getBySlug(storeSlug: string, categorySlug: string): Promise<CategoryInfo> {
    const data = await this.gql.query<{ storeBySlug: Array<{ categories: CategoryInfo[] }> }>(`
      query ($storeSlug: String!) {
        storeBySlug(slug: $storeSlug) {
          categories { ${CATEGORY_FIELDS} }
        }
      }
    `, { storeSlug });
    const category = data.storeBySlug?.[0]?.categories?.find((c) => c.slug === categorySlug);
    if (!category) {
      throw new Error('Categoria não encontrada');
    }
    return category;
  }

  /** List all categories for a store (admin, GraphQL) */
  async list(storeSlug: string): Promise<CategoryInfo[]> {
    const data = await this.gql.adminQuery<{ myStores: Array<{ categories: CategoryInfo[] }> }>(`
      query ($storeSlug: String!) {
        myStores(where: { slug: { eq: $storeSlug } }) {
          categories { ${CATEGORY_FIELDS} }
        }
      }
    `, { storeSlug });
    return data.myStores?.[0]?.categories ?? [];
  }

  /** Get category by ID (admin, GraphQL) */
  async getById(_storeSlug: string, categoryId: number): Promise<CategoryInfo> {
    const data = await this.gql.adminQuery<{ myCategories: CategoryInfo[] }>(`
      query ($categoryId: Int!) {
        myCategories(where: { categoryId: { eq: $categoryId } }) { ${CATEGORY_FIELDS} }
      }
    `, { categoryId });
    if (!data.myCategories?.length) {
      throw new Error('Categoria não encontrada');
    }
    return data.myCategories[0];
  }

  /** Create a new category (REST) */
  async insert(storeSlug: string, data: CategoryInsertInfo): Promise<CategoryInfo> {
    const response = await this.client.post<CategoryInfo>(
      `/category/${storeSlug}/insert`,
      data
    );
    return response.data;
  }

  /** Update an existing category (REST) */
  async update(storeSlug: string, data: CategoryUpdateInfo): Promise<CategoryInfo> {
    const response = await this.client.post<CategoryInfo>(
      `/category/${storeSlug}/update`,
      data
    );
    return response.data;
  }

  /** Delete a category (REST) */
  async delete(storeSlug: string, categoryId: number): Promise<void> {
    await this.client.delete(`/category/${storeSlug}/delete/${categoryId}`);
  }
}
