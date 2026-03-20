import { describe, it, expect } from 'vitest';
import { ProductStatusEnum, StoreStatusEnum } from '@/types';

describe('ProductStatusEnum', () => {
  it('has correct values', () => {
    expect(ProductStatusEnum.Active).toBe(1);
    expect(ProductStatusEnum.Inactive).toBe(2);
    expect(ProductStatusEnum.Expired).toBe(3);
  });

  it('has exactly 3 members', () => {
    const numericValues = Object.values(ProductStatusEnum).filter(
      (v) => typeof v === 'number'
    );
    expect(numericValues).toHaveLength(3);
  });
});

describe('StoreStatusEnum', () => {
  it('has correct values', () => {
    expect(StoreStatusEnum.Inactive).toBe(0);
    expect(StoreStatusEnum.Active).toBe(1);
    expect(StoreStatusEnum.Suspended).toBe(2);
  });

  it('has exactly 3 members', () => {
    const numericValues = Object.values(StoreStatusEnum).filter(
      (v) => typeof v === 'number'
    );
    expect(numericValues).toHaveLength(3);
  });
});
