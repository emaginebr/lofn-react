import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '@/services/productService';
import type { AxiosInstance } from 'axios';
import { ProductStatusEnum } from '@/types';
import type { ProductInfo, ProductInsertInfo, ProductUpdateInfo } from '@/types';

function createMockClient() {
  return {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  } as unknown as AxiosInstance;
}

const mockProduct: ProductInfo = {
  productId: 1,
  storeId: 1,
  categoryId: 1,
  slug: 'test-product',
  image: 'img.png',
  imageUrl: 'https://cdn.example.com/img.png',
  name: 'Test Product',
  description: 'A test product',
  price: 99.90,
  discount: 0,
  frequency: 30,
  limit: 5,
  status: ProductStatusEnum.Active,
  featured: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  images: [],
};

describe('ProductService', () => {
  let client: ReturnType<typeof createMockClient>;
  let service: ProductService;

  beforeEach(() => {
    client = createMockClient();
    service = new ProductService(client);
  });

  describe('search (REST)', () => {
    it('sends POST to /product/search', async () => {
      const pagedResult = { products: [mockProduct], pageNum: 1, pageCount: 1 };
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: pagedResult });

      const result = await service.search({ pageNum: 1, onlyActive: true });

      expect(client.post).toHaveBeenCalledWith('/product/search', {
        pageNum: 1,
        onlyActive: true,
      });
      expect(result).toEqual(pagedResult);
    });
  });

  describe('getBySlug (GraphQL)', () => {
    it('finds product by slug within store', async () => {
      const productWithImages = {
        ...mockProduct,
        images: undefined,
        productImages: [{ imageId: 1, image: 'a.png', imageUrl: 'url', sortOrder: 0 }],
      };
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: {
          data: { storeBySlug: [{ products: [productWithImages] }] },
        },
      });

      const result = await service.getBySlug('test-product', 'my-store');

      expect(client.post).toHaveBeenCalledWith('/graphql', expect.any(Object));
      expect(result.slug).toBe('test-product');
      expect(result.images).toHaveLength(1);
    });

    it('throws when product not found within store', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { storeBySlug: [{ products: [] }] } },
      });

      await expect(service.getBySlug('nonexistent', 'my-store')).rejects.toThrow(
        'Produto não encontrado'
      );
    });

    it('queries globally when no storeSlug', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { products: [mockProduct] } },
      });

      const result = await service.getBySlug('test-product');
      expect(result.slug).toBe('test-product');
    });

    it('throws when product not found globally', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { products: [] } },
      });

      await expect(service.getBySlug('nonexistent')).rejects.toThrow(
        'Produto não encontrado'
      );
    });
  });

  describe('getById (admin GraphQL)', () => {
    it('returns product by ID', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { myProducts: [mockProduct] } },
      });

      const result = await service.getById('my-store', 1);
      expect(result.productId).toBe(1);
    });

    it('throws when not found', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { myProducts: [] } },
      });

      await expect(service.getById('my-store', 999)).rejects.toThrow(
        'Produto não encontrado'
      );
    });
  });

  describe('listFeatured (GraphQL)', () => {
    it('returns featured products with default limit', async () => {
      const products = Array.from({ length: 10 }, (_, i) => ({
        ...mockProduct,
        productId: i + 1,
      }));
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { featuredProducts: products } },
      });

      const result = await service.listFeatured('my-store');
      expect(result).toHaveLength(6);
    });

    it('respects custom limit', async () => {
      const products = Array.from({ length: 10 }, (_, i) => ({
        ...mockProduct,
        productId: i + 1,
      }));
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { featuredProducts: products } },
      });

      const result = await service.listFeatured('my-store', 3);
      expect(result).toHaveLength(3);
    });
  });

  describe('listActive (GraphQL)', () => {
    it('returns products sorted by name', async () => {
      const products = [
        { ...mockProduct, productId: 1, name: 'Zebra' },
        { ...mockProduct, productId: 2, name: 'Apple' },
      ];
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { storeBySlug: [{ products }] } },
      });

      const result = await service.listActive('my-store');
      expect(result[0].name).toBe('Apple');
      expect(result[1].name).toBe('Zebra');
    });

    it('filters by categorySlug when provided', async () => {
      const products = [
        { ...mockProduct, productId: 1, name: 'A', category: { slug: 'cat1', name: 'Cat1' } },
        { ...mockProduct, productId: 2, name: 'B', category: { slug: 'cat2', name: 'Cat2' } },
      ];
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { storeBySlug: [{ products }] } },
      });

      const result = await service.listActive('my-store', 'cat1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('A');
    });
  });

  describe('list (admin GraphQL)', () => {
    it('queries admin endpoint', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { myProducts: [mockProduct] } },
      });

      const result = await service.list('my-store');

      expect(client.post).toHaveBeenCalledWith('/graphql/admin', expect.any(Object));
      expect(result).toHaveLength(1);
    });

    it('returns empty array when no products', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { myProducts: null } },
      });

      const result = await service.list('my-store');
      expect(result).toEqual([]);
    });
  });

  describe('insert (REST)', () => {
    it('sends POST to /product/:storeSlug/insert', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockProduct });

      const insertData: ProductInsertInfo = {
        categoryId: 1,
        name: 'New Product',
        description: 'Desc',
        price: 50,
        discount: 0,
        frequency: 30,
        limit: 10,
        status: ProductStatusEnum.Active,
        featured: false,
      };
      const result = await service.insert('my-store', insertData);

      expect(client.post).toHaveBeenCalledWith('/product/my-store/insert', insertData);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update (REST)', () => {
    it('sends POST to /product/:storeSlug/update', async () => {
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockProduct });

      const updateData: ProductUpdateInfo = {
        productId: 1,
        categoryId: 1,
        name: 'Updated',
        description: 'Updated desc',
        price: 75,
        discount: 5,
        frequency: 30,
        limit: 10,
        status: ProductStatusEnum.Active,
        featured: true,
      };
      const result = await service.update('my-store', updateData);

      expect(client.post).toHaveBeenCalledWith('/product/my-store/update', updateData);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('productImages mapping', () => {
    it('maps productImages to images field', async () => {
      const rawProduct = {
        ...mockProduct,
        images: undefined,
        productImages: [
          { imageId: 1, image: 'a.png', imageUrl: 'url-a', sortOrder: 0 },
          { imageId: 2, image: 'b.png', imageUrl: 'url-b', sortOrder: 1 },
        ],
      };
      (client.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { data: { products: [rawProduct] } },
      });

      const result = await service.getBySlug('test-product');
      expect(result.images).toHaveLength(2);
      expect(result.images[0].imageId).toBe(1);
    });
  });
});
