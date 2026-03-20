import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageService } from '@/services/imageService';
import type { AxiosInstance } from 'axios';
import type { ProductImageInfo } from '@/types';

function createMockClient() {
  return {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  } as unknown as AxiosInstance;
}

const mockImage: ProductImageInfo = {
  imageId: 1,
  productId: 10,
  image: 'photo.jpg',
  imageUrl: 'https://cdn.example.com/photo.jpg',
  sortOrder: 0,
};

describe('ImageService', () => {
  let client: ReturnType<typeof createMockClient>;
  let service: ImageService;

  beforeEach(() => {
    client = createMockClient();
    service = new ImageService(client);
  });

  describe('upload', () => {
    it('sends multipart POST with default sortOrder 0', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockImage });

      const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
      const result = await service.upload(10, file);

      expect(client.post).toHaveBeenCalledWith(
        '/image/upload/10?sortOrder=0',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual(mockImage);
    });

    it('sends custom sortOrder', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockImage });

      const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
      await service.upload(10, file, 3);

      expect(client.post).toHaveBeenCalledWith(
        '/image/upload/10?sortOrder=3',
        expect.any(FormData),
        expect.any(Object)
      );
    });
  });

  describe('list', () => {
    it('sends GET to /image/list/:productId', async () => {
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [mockImage],
      });

      const result = await service.list(10);

      expect(client.get).toHaveBeenCalledWith('/image/list/10');
      expect(result).toEqual([mockImage]);
    });
  });

  describe('delete', () => {
    it('sends DELETE to /image/delete/:imageId', async () => {
      (client.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});

      await service.delete(1);

      expect(client.delete).toHaveBeenCalledWith('/image/delete/1');
    });
  });
});
