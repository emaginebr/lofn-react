import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { ShopCarProvider, useShopCar } from '@/contexts/ShopCarContext';
import { ProductStatusEnum } from '@/types';
import type { ProductInfo } from '@/types';

// Mock LofnContext
vi.mock('@/contexts/LofnContext', () => ({
  useLofnClient: () => ({
    post: vi.fn().mockResolvedValue({ data: {} }),
    get: vi.fn(),
    delete: vi.fn(),
  }),
}));

function makeProduct(id: number, overrides?: Partial<ProductInfo>): ProductInfo {
  return {
    productId: id,
    storeId: 1,
    categoryId: 1,
    slug: `product-${id}`,
    image: 'img.png',
    imageUrl: 'https://cdn.example.com/img.png',
    name: `Product ${id}`,
    description: 'Test',
    price: 50,
    discount: 0,
    frequency: 30,
    limit: 10,
    status: ProductStatusEnum.Active,
    featured: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    images: [],
    ...overrides,
  };
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <ShopCarProvider>{children}</ShopCarProvider>;
}

describe('ShopCarContext', () => {
  beforeEach(() => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(localStorage.setItem).mockClear();
  });

  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useShopCar());
    }).toThrow('useShopCar must be used within a ShopCarProvider');
  });

  it('starts with empty cart', () => {
    const { result } = renderHook(() => useShopCar(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  describe('addItem', () => {
    it('adds a new product to cart', () => {
      const { result } = renderHook(() => useShopCar(), { wrapper });
      const product = makeProduct(1);

      act(() => {
        result.current.addItem(product, 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product.productId).toBe(1);
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.itemCount).toBe(2);
    });

    it('increments quantity when adding existing product', () => {
      const { result } = renderHook(() => useShopCar(), { wrapper });
      const product = makeProduct(1);

      act(() => {
        result.current.addItem(product, 2);
      });
      act(() => {
        result.current.addItem(product, 3);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.itemCount).toBe(5);
    });

    it('defaults to quantity 1', () => {
      const { result } = renderHook(() => useShopCar(), { wrapper });

      act(() => {
        result.current.addItem(makeProduct(1));
      });

      expect(result.current.items[0].quantity).toBe(1);
    });

    it('handles multiple different products', () => {
      const { result } = renderHook(() => useShopCar(), { wrapper });

      act(() => {
        result.current.addItem(makeProduct(1), 2);
        result.current.addItem(makeProduct(2), 3);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.itemCount).toBe(5);
    });
  });

  describe('removeItem', () => {
    it('removes a product from cart', () => {
      const { result } = renderHook(() => useShopCar(), { wrapper });

      act(() => {
        result.current.addItem(makeProduct(1), 2);
        result.current.addItem(makeProduct(2), 3);
      });
      act(() => {
        result.current.removeItem(1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product.productId).toBe(2);
      expect(result.current.itemCount).toBe(3);
    });

    it('does nothing when product not in cart', () => {
      const { result } = renderHook(() => useShopCar(), { wrapper });

      act(() => {
        result.current.addItem(makeProduct(1));
      });
      act(() => {
        result.current.removeItem(999);
      });

      expect(result.current.items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('updates quantity of existing item', () => {
      const { result } = renderHook(() => useShopCar(), { wrapper });

      act(() => {
        result.current.addItem(makeProduct(1), 2);
      });
      act(() => {
        result.current.updateQuantity(1, 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.itemCount).toBe(5);
    });

    it('removes item when quantity is 0', () => {
      const { result } = renderHook(() => useShopCar(), { wrapper });

      act(() => {
        result.current.addItem(makeProduct(1), 2);
      });
      act(() => {
        result.current.updateQuantity(1, 0);
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.itemCount).toBe(0);
    });

    it('removes item when quantity is negative', () => {
      const { result } = renderHook(() => useShopCar(), { wrapper });

      act(() => {
        result.current.addItem(makeProduct(1), 2);
      });
      act(() => {
        result.current.updateQuantity(1, -1);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('removes all items', () => {
      const { result } = renderHook(() => useShopCar(), { wrapper });

      act(() => {
        result.current.addItem(makeProduct(1), 2);
        result.current.addItem(makeProduct(2), 3);
      });
      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.itemCount).toBe(0);
    });
  });

  describe('localStorage persistence', () => {
    it('saves cart to localStorage on change', () => {
      const { result } = renderHook(() => useShopCar(), { wrapper });

      act(() => {
        result.current.addItem(makeProduct(1), 2);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'lofn_shopcar',
        expect.any(String)
      );
    });

    it('loads cart from localStorage on init', () => {
      const savedItems = [
        { product: makeProduct(5), quantity: 3 },
      ];
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(savedItems));

      const { result } = renderHook(() => useShopCar(), { wrapper });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product.productId).toBe(5);
      expect(result.current.items[0].quantity).toBe(3);
    });

    it('handles corrupted localStorage gracefully', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid-json{{{');

      const { result } = renderHook(() => useShopCar(), { wrapper });

      expect(result.current.items).toEqual([]);
    });
  });
});
