import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphQLClient } from '@/services/graphqlClient';
import type { AxiosInstance } from 'axios';

function createMockClient() {
  return {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  } as unknown as AxiosInstance;
}

describe('GraphQLClient', () => {
  let client: ReturnType<typeof createMockClient>;
  let gql: GraphQLClient;

  beforeEach(() => {
    client = createMockClient();
    gql = new GraphQLClient(client);
  });

  describe('query', () => {
    it('sends POST to /graphql with query and variables', async () => {
      const mockData = { stores: [{ storeId: 1, name: 'Test' }] };
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: mockData },
      });

      const result = await gql.query('{ stores { storeId name } }');

      expect(client.post).toHaveBeenCalledWith('/graphql', {
        query: '{ stores { storeId name } }',
        variables: undefined,
      });
      expect(result).toEqual(mockData);
    });

    it('passes variables to the query', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { storeBySlug: [] } },
      });

      await gql.query('query ($slug: String!) { storeBySlug(slug: $slug) { storeId } }', {
        slug: 'my-store',
      });

      expect(client.post).toHaveBeenCalledWith('/graphql', {
        query: expect.any(String),
        variables: { slug: 'my-store' },
      });
    });

    it('throws on GraphQL errors', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: {
          data: null,
          errors: [{ message: 'Field not found' }],
        },
      });

      await expect(gql.query('{ invalid }')).rejects.toThrow('Field not found');
    });
  });

  describe('adminQuery', () => {
    it('sends POST to /graphql/admin', async () => {
      const mockData = { myStores: [{ storeId: 1 }] };
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: mockData },
      });

      const result = await gql.adminQuery('{ myStores { storeId } }');

      expect(client.post).toHaveBeenCalledWith('/graphql/admin', {
        query: '{ myStores { storeId } }',
        variables: undefined,
      });
      expect(result).toEqual(mockData);
    });

    it('throws on GraphQL errors', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: {
          data: null,
          errors: [{ message: 'Unauthorized' }],
        },
      });

      await expect(gql.adminQuery('{ myStores { storeId } }')).rejects.toThrow(
        'Unauthorized'
      );
    });
  });
});
