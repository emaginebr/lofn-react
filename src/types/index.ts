// Lofn API Types

import type { UserInfo } from 'nauth-react';
export type { UserInfo };

// ============================================================================
// Enums
// ============================================================================

export enum ProductStatusEnum {
  Active = 1,
  Inactive = 2,
  Expired = 3,
}

export enum StoreStatusEnum {
  Inactive = 0,
  Active = 1,
  Suspended = 2,
}

// ============================================================================
// External Types (NAuth) — UserInfo imported and re-exported above
// ============================================================================

// ============================================================================
// Product Types
// ============================================================================

/** Main product information */
export interface ProductInfo {
  productId: number;
  storeId: number | null;
  categoryId: number | null;
  slug: string;
  image: string;
  imageUrl: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  frequency: number;
  limit: number;
  status: ProductStatusEnum;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImageInfo[];
}

/** Data required to create a new product */
export interface ProductInsertInfo {
  categoryId: number | null;
  name: string;
  description: string;
  price: number;
  discount: number;
  frequency: number;
  limit: number;
  status: ProductStatusEnum;
  featured: boolean;
}

/** Data required to update an existing product */
export interface ProductUpdateInfo {
  productId: number;
  categoryId: number | null;
  name: string;
  description: string;
  price: number;
  discount: number;
  frequency: number;
  limit: number;
  status: ProductStatusEnum;
  featured: boolean;
}

/** Product image information */
export interface ProductImageInfo {
  imageId: number;
  productId: number;
  image: string;
  imageUrl: string;
  sortOrder: number;
}

/** Parameters for product search */
export interface ProductSearchParam {
  userSlug?: string;
  networkSlug?: string;
  storeId?: number | null;
  userId?: number | null;
  keyword?: string;
  onlyActive?: boolean;
  pageNum: number;
}

/** Paginated product search result */
export interface ProductListPagedResult {
  products: ProductInfo[];
  pageNum: number;
  pageCount: number;
}

// ============================================================================
// Category Types
// ============================================================================

/** Category information */
export interface CategoryInfo {
  categoryId: number;
  slug: string;
  name: string;
  storeId: number;
  productCount: number;
}

/** Data required to create a new category */
export interface CategoryInsertInfo {
  name: string;
}

/** Data required to update an existing category */
export interface CategoryUpdateInfo {
  categoryId: number;
  name: string;
}

// ============================================================================
// ShopCar Types
// ============================================================================

/** Shopping cart information */
export interface ShopCarInfo {
  user: UserInfo;
  items: ShopCarItemInfo[];
  createdAt: string;
}

/** Shopping cart item information */
export interface ShopCarItemInfo {
  product: ProductInfo;
  quantity: number;
}

// ============================================================================
// Store Types
// ============================================================================

/** Store information */
export interface StoreInfo {
  storeId: number;
  slug: string;
  name: string;
  ownerId: number;
  logo: string;
  logoUrl: string;
  status: StoreStatusEnum;
}

/** Data required to create a new store */
export interface StoreInsertInfo {
  name: string;
}

/** Data required to update an existing store */
export interface StoreUpdateInfo {
  storeId: number;
  name: string;
  status: StoreStatusEnum;
}

// ============================================================================
// StoreUser Types
// ============================================================================

/** Store user (member) information */
export interface StoreUserInfo {
  storeUserId: number;
  storeId: number;
  userId: number;
  user: UserInfo;
}

/** Data required to add a user to a store */
export interface StoreUserInsertInfo {
  userId: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Configuration
// ============================================================================

export interface LofnConfig {
  apiUrl: string;
  tenantId?: string;
  getToken?: () => string | null;
  timeout?: number;
  headers?: Record<string, string>;
  redirectOnUnauthorized?: string;
  onError?: (error: Error) => void;
  debug?: boolean;
}

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  // Product (mutations + search REST — queries via GraphQL)
  PRODUCT_INSERT: '/product/{storeSlug}/insert',
  PRODUCT_UPDATE: '/product/{storeSlug}/update',
  PRODUCT_SEARCH: '/product/search',

  // Category (mutations REST — queries via GraphQL)
  CATEGORY_INSERT: '/category/{storeSlug}/insert',
  CATEGORY_UPDATE: '/category/{storeSlug}/update',
  CATEGORY_DELETE: '/category/{storeSlug}/delete',

  // Image
  IMAGE_UPLOAD: '/image/upload',
  IMAGE_LIST: '/image/list',
  IMAGE_DELETE: '/image/delete',

  // ShopCar
  SHOPCAR_INSERT: '/shopcar/insert',

  // Store (mutations only — queries via GraphQL)
  STORE_INSERT: '/store/insert',
  STORE_UPDATE: '/store/update',
  STORE_UPLOAD_LOGO: '/store/uploadLogo',
  STORE_DELETE: '/store/delete',

  // GraphQL
  GRAPHQL_PUBLIC: '/graphql',
  GRAPHQL_ADMIN: '/graphql/admin',

  // StoreUser
  STORE_USER_LIST: '/storeuser/{storeSlug}/list',
  STORE_USER_INSERT: '/storeuser/{storeSlug}/insert',
  STORE_USER_DELETE: '/storeuser/{storeSlug}/delete',
} as const;

export const VERSION = '0.1.0';
