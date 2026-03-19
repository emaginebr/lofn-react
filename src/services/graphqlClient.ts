import type { AxiosInstance } from 'axios';

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

/** GraphQL client that reuses the existing Axios instance */
export class GraphQLClient {
  constructor(private client: AxiosInstance) {}

  /** Execute a public GraphQL query (no auth required) */
  async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await this.client.post<GraphQLResponse<T>>(
      '/graphql',
      { query, variables }
    );
    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data;
  }

  /** Execute an authenticated GraphQL query */
  async adminQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await this.client.post<GraphQLResponse<T>>(
      '/graphql/admin',
      { query, variables }
    );
    if (response.data.errors?.length) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data;
  }
}
