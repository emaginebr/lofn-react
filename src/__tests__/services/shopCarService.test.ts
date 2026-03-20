import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShopCarService } from '@/services/shopCarService';
import type { AxiosInstance } from 'axios';
import type { ShopCarInfo } from '@/types';

function createMockClient() {
  return {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  } as unknown as AxiosInstance;
}

const mockShopCar: ShopCarInfo = {
  user: { userId: 1, name: 'Test', email: 'test@test.com' } as ShopCarInfo['user'],
  items: [
    {
      product: { productId: 10, name: 'Product A', price: 50 } as ShopCarInfo['items'][0]['product'],
      quantity: 2,
    },
  ],
  createdAt: '2026-03-19T00:00:00Z',
};

describe('ShopCarService', () => {
  let client: ReturnType<typeof createMockClient>;
  let service: ShopCarService;

  beforeEach(() => {
    client = createMockClient();
    service = new ShopCarService(client);
  });

  describe('insert', () => {
    it('sends POST to /shopcar/insert with data', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockShopCar });

      const result = await service.insert(mockShopCar);

      expect(client.post).toHaveBeenCalledWith('/shopcar/insert', mockShopCar);
      expect(result).toEqual(mockShopCar);
    });

    it('propagates errors', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      await expect(service.insert(mockShopCar)).rejects.toThrow('Network error');
    });
  });
});
