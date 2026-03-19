// Lofn API Types

// ============================================================================
// Enums
// ============================================================================

export enum ProductStatusEnum {
  Active = 1,
  Inactive = 2,
  Expired = 3,
}

export enum OrderStatusEnum {
  Incoming = 1,
  Active = 2,
  Suspended = 3,
  Finished = 4,
  Expired = 5,
}

export enum OrderFrequencyEnum {
  Weekly = 7,
  Monthly = 30,
  Annual = 365,
}

// ============================================================================
// External Types (NAuth)
// ============================================================================

/** User info from NAuth. Represents the authenticated user data. */
export interface UserInfo {
  userId: number;
  slug: string;
  imageUrl: string;
  name: string;
  email: string;
}

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
  frequency: number;
  limit: number;
  status: ProductStatusEnum;
  images: ProductImageInfo[];
}

/** Data required to create a new product */
export interface ProductInsertInfo {
  categoryId: number | null;
  name: string;
  description: string;
  price: number;
  frequency: number;
  limit: number;
  status: ProductStatusEnum;
}

/** Data required to update an existing product */
export interface ProductUpdateInfo {
  productId: number;
  categoryId: number | null;
  name: string;
  description: string;
  price: number;
  frequency: number;
  limit: number;
  status: ProductStatusEnum;
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
// Order Types
// ============================================================================

/** Main order information */
export interface OrderInfo {
  orderId: number;
  storeId: number | null;
  userId: number;
  sellerId: number | null;
  status: OrderStatusEnum;
  createdAt: string;
  updatedAt: string;
  user: UserInfo;
  seller: UserInfo;
  items: OrderItemInfo[];
}

/** Order item information */
export interface OrderItemInfo {
  itemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  product: ProductInfo;
}

/** Parameters for order search (paginated) */
export interface OrderSearchParam {
  storeId: number;
  userId?: number | null;
  sellerId?: number | null;
  pageNum: number;
}

/** Parameters for order list with filters */
export interface OrderParam {
  storeId: number;
  userId: number;
  status?: OrderStatusEnum | null;
}

/** Paginated order search result */
export interface OrderListPagedResult {
  orders: OrderInfo[];
  pageNum: number;
  pageCount: number;
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
}

/** Data required to create a new store */
export interface StoreInsertInfo {
  name: string;
}

/** Data required to update an existing store */
export interface StoreUpdateInfo {
  storeId: number;
  name: string;
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
  // Product
  PRODUCT_INSERT: '/product/{storeSlug}/insert',
  PRODUCT_UPDATE: '/product/{storeSlug}/update',
  PRODUCT_SEARCH: '/product/search',
  PRODUCT_GET_BY_ID: '/product/{storeSlug}/getById',
  PRODUCT_GET_BY_SLUG: '/product/getBySlug',

  // Category
  CATEGORY_LIST: '/category/{storeSlug}/list',
  CATEGORY_GET_BY_ID: '/category/{storeSlug}/getById',
  CATEGORY_INSERT: '/category/{storeSlug}/insert',
  CATEGORY_UPDATE: '/category/{storeSlug}/update',
  CATEGORY_DELETE: '/category/{storeSlug}/delete',

  // Image
  IMAGE_UPLOAD: '/image/upload',
  IMAGE_LIST: '/image/list',
  IMAGE_DELETE: '/image/delete',

  // Order
  ORDER_UPDATE: '/order/update',
  ORDER_SEARCH: '/order/search',
  ORDER_LIST: '/order/list',
  ORDER_GET_BY_ID: '/order/getById',

  // Store
  STORE_LIST: '/store/list',
  STORE_GET_BY_ID: '/store/getById',
  STORE_INSERT: '/store/insert',
  STORE_UPDATE: '/store/update',
  STORE_DELETE: '/store/delete',

  // StoreUser
  STORE_USER_LIST: '/storeuser/{storeSlug}/list',
  STORE_USER_INSERT: '/storeuser/{storeSlug}/insert',
  STORE_USER_DELETE: '/storeuser/{storeSlug}/delete',
} as const;

export const VERSION = '0.1.0';
