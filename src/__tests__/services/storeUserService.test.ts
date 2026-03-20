import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreUserService } from '@/services/storeUserService';
import type { AxiosInstance } from 'axios';
import type { StoreUserInfo } from '@/types';

function createMockClient() {
  return {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  } as unknown as AxiosInstance;
}

const mockStoreUser: StoreUserInfo = {
  storeUserId: 1,
  storeId: 1,
  userId: 100,
  user: { userId: 100, name: 'John', email: 'john@example.com' } as StoreUserInfo['user'],
};

describe('StoreUserService', () => {
  let client: ReturnType<typeof createMockClient>;
  let service: StoreUserService;

  beforeEach(() => {
    client = createMockClient();
    service = new StoreUserService(client);
  });

  describe('list', () => {
    it('sends GET to /storeuser/:storeSlug/list', async () => {
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [mockStoreUser],
      });

      const result = await service.list('my-store');

      expect(client.get).toHaveBeenCalledWith('/storeuser/my-store/list');
      expect(result).toEqual([mockStoreUser]);
    });
  });

  describe('insert', () => {
    it('sends POST to /storeuser/:storeSlug/insert', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockStoreUser });

      const result = await service.insert('my-store', { userId: 100 });

      expect(client.post).toHaveBeenCalledWith('/storeuser/my-store/insert', {
        userId: 100,
      });
      expect(result).toEqual(mockStoreUser);
    });
  });

  describe('delete', () => {
    it('sends DELETE to /storeuser/:storeSlug/delete/:id', async () => {
      (client.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});

      await service.delete('my-store', 1);

      expect(client.delete).toHaveBeenCalledWith('/storeuser/my-store/delete/1');
    });
  });
});
