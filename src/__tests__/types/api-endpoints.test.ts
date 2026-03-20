import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS, VERSION } from '@/types';

describe('API_ENDPOINTS', () => {
  it('has product endpoints', () => {
    expect(API_ENDPOINTS.PRODUCT_INSERT).toBe('/product/{storeSlug}/insert');
    expect(API_ENDPOINTS.PRODUCT_UPDATE).toBe('/product/{storeSlug}/update');
    expect(API_ENDPOINTS.PRODUCT_SEARCH).toBe('/product/search');
  });

  it('has category endpoints', () => {
    expect(API_ENDPOINTS.CATEGORY_INSERT).toBe('/category/{storeSlug}/insert');
    expect(API_ENDPOINTS.CATEGORY_UPDATE).toBe('/category/{storeSlug}/update');
    expect(API_ENDPOINTS.CATEGORY_DELETE).toBe('/category/{storeSlug}/delete');
  });

  it('has image endpoints', () => {
    expect(API_ENDPOINTS.IMAGE_UPLOAD).toBe('/image/upload');
    expect(API_ENDPOINTS.IMAGE_LIST).toBe('/image/list');
    expect(API_ENDPOINTS.IMAGE_DELETE).toBe('/image/delete');
  });

  it('has shopcar endpoint', () => {
    expect(API_ENDPOINTS.SHOPCAR_INSERT).toBe('/shopcar/insert');
  });

  it('has store endpoints', () => {
    expect(API_ENDPOINTS.STORE_INSERT).toBe('/store/insert');
    expect(API_ENDPOINTS.STORE_UPDATE).toBe('/store/update');
    expect(API_ENDPOINTS.STORE_UPLOAD_LOGO).toBe('/store/uploadLogo');
    expect(API_ENDPOINTS.STORE_DELETE).toBe('/store/delete');
  });

  it('has graphql endpoints', () => {
    expect(API_ENDPOINTS.GRAPHQL_PUBLIC).toBe('/graphql');
    expect(API_ENDPOINTS.GRAPHQL_ADMIN).toBe('/graphql/admin');
  });

  it('has storeuser endpoints', () => {
    expect(API_ENDPOINTS.STORE_USER_LIST).toBe('/storeuser/{storeSlug}/list');
    expect(API_ENDPOINTS.STORE_USER_INSERT).toBe('/storeuser/{storeSlug}/insert');
    expect(API_ENDPOINTS.STORE_USER_DELETE).toBe('/storeuser/{storeSlug}/delete');
  });
});

describe('VERSION', () => {
  it('is a valid semver string', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
