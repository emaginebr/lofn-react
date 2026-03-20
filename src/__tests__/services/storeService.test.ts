import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreService } from '@/services/storeService';
import type { AxiosInstance } from 'axios';
import { StoreStatusEnum } from '@/types';
import type { StoreInfo } from '@/types';

function createMockClient() {
  return {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  } as unknown as AxiosInstance;
}

const mockStore: StoreInfo = {
  storeId: 1,
  slug: 'test-store',
  name: 'Test Store',
  ownerId: 100,
  logo: 'logo.png',
  logoUrl: 'https://cdn.example.com/logo.png',
  status: StoreStatusEnum.Active,
};

describe('StoreService', () => {
  let client: ReturnType<typeof createMockClient>;
  let service: StoreService;

  beforeEach(() => {
    client = createMockClient();
    service = new StoreService(client);
  });

  describe('listActive (GraphQL)', () => {
    it('queries public GraphQL and returns stores', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { stores: [mockStore] } },
      });

      const result = await service.listActive();

      expect(client.post).toHaveBeenCalledWith('/graphql', expect.any(Object));
      expect(result).toEqual([mockStore]);
    });
  });

  describe('getBySlug (GraphQL)', () => {
    it('returns store when found', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { storeBySlug: [mockStore] } },
      });

      const result = await service.getBySlug('test-store');
      expect(result).toEqual(mockStore);
    });

    it('throws when store not found', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { storeBySlug: [] } },
      });

      await expect(service.getBySlug('nonexistent')).rejects.toThrow(
        'Loja não encontrada'
      );
    });
  });

  describe('list (admin GraphQL)', () => {
    it('queries admin GraphQL and returns user stores', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { myStores: [mockStore] } },
      });

      const result = await service.list();

      expect(client.post).toHaveBeenCalledWith('/graphql/admin', expect.any(Object));
      expect(result).toEqual([mockStore]);
    });
  });

  describe('getById (admin GraphQL)', () => {
    it('returns store by ID', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { myStores: [mockStore] } },
      });

      const result = await service.getById(1);
      expect(result).toEqual(mockStore);
    });

    it('throws when store not found', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { myStores: [] } },
      });

      await expect(service.getById(999)).rejects.toThrow('Loja não encontrada');
    });
  });

  describe('insert (REST)', () => {
    it('sends POST to /store/insert', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockStore });

      const result = await service.insert({ name: 'Test Store' });

      expect(client.post).toHaveBeenCalledWith('/store/insert', { name: 'Test Store' });
      expect(result).toEqual(mockStore);
    });
  });

  describe('update (REST)', () => {
    it('sends POST to /store/update', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockStore });

      const updateData = { storeId: 1, name: 'Updated', status: StoreStatusEnum.Active };
      const result = await service.update(updateData);

      expect(client.post).toHaveBeenCalledWith('/store/update', updateData);
      expect(result).toEqual(mockStore);
    });
  });

  describe('uploadLogo (REST)', () => {
    it('sends multipart POST to /store/uploadLogo/:id', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockStore });

      const file = new File(['logo'], 'logo.png', { type: 'image/png' });
      const result = await service.uploadLogo(1, file);

      expect(client.post).toHaveBeenCalledWith(
        '/store/uploadLogo/1',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual(mockStore);
    });
  });

  describe('delete (REST)', () => {
    it('sends DELETE to /store/delete/:id', async () => {
      (client.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});

      await service.delete(1);

      expect(client.delete).toHaveBeenCalledWith('/store/delete/1');
    });
  });
});
