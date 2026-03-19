import type { AxiosInstance } from 'axios';
import { GraphQLClient } from './graphqlClient';
import type {
  StoreInfo,
  StoreInsertInfo,
  StoreUpdateInfo,
} from '../types';

const STORE_FIELDS = `
  storeId
  slug
  name
  logo
  logoUrl
  status
`;

const STORE_FIELDS_ADMIN = `
  storeId
  slug
  name
  ownerId
  logo
  logoUrl
  status
`;

/** Store Service — Queries via GraphQL, mutations via REST */
export class StoreService {
  private gql: GraphQLClient;

  constructor(private client: AxiosInstance) {
    this.gql = new GraphQLClient(client);
  }

  /** List active stores (public, GraphQL) */
  async listActive(): Promise<StoreInfo[]> {
    const data = await this.gql.query<{ stores: StoreInfo[] }>(`{
      stores { ${STORE_FIELDS} }
    }`);
    return data.stores;
  }

  /** Get store by slug (public, GraphQL) */
  async getBySlug(slug: string): Promise<StoreInfo> {
    const data = await this.gql.query<{ storeBySlug: StoreInfo[] }>(`
      query ($slug: String!) {
        storeBySlug(slug: $slug) { ${STORE_FIELDS} }
      }
    `, { slug });
    if (!data.storeBySlug?.length) {
      throw new Error('Loja não encontrada');
    }
    return data.storeBySlug[0];
  }

  /** List all stores for the authenticated user (admin, GraphQL) */
  async list(): Promise<StoreInfo[]> {
    const data = await this.gql.adminQuery<{ myStores: StoreInfo[] }>(`{
      myStores { ${STORE_FIELDS_ADMIN} }
    }`);
    return data.myStores;
  }

  /** Get store by ID (admin, GraphQL) */
  async getById(storeId: number): Promise<StoreInfo> {
    const data = await this.gql.adminQuery<{ myStores: StoreInfo[] }>(`
      query ($storeId: Int!) {
        myStores(where: { storeId: { eq: $storeId } }) { ${STORE_FIELDS_ADMIN} }
      }
    `, { storeId });
    if (!data.myStores?.length) {
      throw new Error('Loja não encontrada');
    }
    return data.myStores[0];
  }

  /** Create a new store (REST) */
  async insert(data: StoreInsertInfo): Promise<StoreInfo> {
    const response = await this.client.post<StoreInfo>('/store/insert', data);
    return response.data;
  }

  /** Update an existing store (REST) */
  async update(data: StoreUpdateInfo): Promise<StoreInfo> {
    const response = await this.client.post<StoreInfo>('/store/update', data);
    return response.data;
  }

  /** Upload store logo (REST) */
  async uploadLogo(storeId: number, file: File): Promise<StoreInfo> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post<StoreInfo>(
      `/store/uploadLogo/${storeId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  /** Delete a store (REST) */
  async delete(storeId: number): Promise<void> {
    await this.client.delete(`/store/delete/${storeId}`);
  }
}
