import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryService } from '@/services/categoryService';
import type { AxiosInstance } from 'axios';
import type { CategoryInfo } from '@/types';

function createMockClient() {
  return {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  } as unknown as AxiosInstance;
}

const mockCategory: CategoryInfo = {
  categoryId: 1,
  slug: 'electronics',
  name: 'Electronics',
  storeId: 1,
  productCount: 5,
};

describe('CategoryService', () => {
  let client: ReturnType<typeof createMockClient>;
  let service: CategoryService;

  beforeEach(() => {
    client = createMockClient();
    service = new CategoryService(client);
  });

  describe('listActive (GraphQL)', () => {
    it('returns categories for a store', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { storeBySlug: [{ categories: [mockCategory] }] } },
      });

      const result = await service.listActive('my-store');
      expect(result).toEqual([mockCategory]);
    });

    it('returns empty array when store not found', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { storeBySlug: [] } },
      });

      const result = await service.listActive('nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('getBySlug (GraphQL)', () => {
    it('returns category by slug', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { storeBySlug: [{ categories: [mockCategory] }] } },
      });

      const result = await service.getBySlug('my-store', 'electronics');
      expect(result).toEqual(mockCategory);
    });

    it('throws when category not found', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { storeBySlug: [{ categories: [] }] } },
      });

      await expect(service.getBySlug('my-store', 'nonexistent')).rejects.toThrow(
        'Categoria não encontrada'
      );
    });
  });

  describe('list (admin GraphQL)', () => {
    it('queries admin endpoint', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { myStores: [{ categories: [mockCategory] }] } },
      });

      const result = await service.list('my-store');
      expect(client.post).toHaveBeenCalledWith('/graphql/admin', expect.any(Object));
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('getById (admin GraphQL)', () => {
    it('returns category by ID', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { myCategories: [mockCategory] } },
      });

      const result = await service.getById('my-store', 1);
      expect(result).toEqual(mockCategory);
    });

    it('throws when not found', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { myCategories: [] } },
      });

      await expect(service.getById('my-store', 999)).rejects.toThrow(
        'Categoria não encontrada'
      );
    });
  });

  describe('insert (REST)', () => {
    it('sends POST to /category/:storeSlug/insert', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockCategory });

      const result = await service.insert('my-store', { name: 'Electronics' });

      expect(client.post).toHaveBeenCalledWith('/category/my-store/insert', {
        name: 'Electronics',
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update (REST)', () => {
    it('sends POST to /category/:storeSlug/update', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockCategory });

      const result = await service.update('my-store', { categoryId: 1, name: 'Updated' });

      expect(client.post).toHaveBeenCalledWith('/category/my-store/update', {
        categoryId: 1,
        name: 'Updated',
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('delete (REST)', () => {
    it('sends DELETE to /category/:storeSlug/delete/:id', async () => {
      (client.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});

      await service.delete('my-store', 1);

      expect(client.delete).toHaveBeenCalledWith('/category/my-store/delete/1');
    });
  });
});
