// Main entry point for @lofn/loft-react package

// Styles
import './styles/index.css';

// Base Provider
export { LofnProvider, useLofnClient } from './contexts/LofnContext';
export type { LofnProviderProps } from './contexts/LofnContext';

// Domain Providers & Hooks
export { StoreProvider, useStore } from './contexts/StoreContext';
export { ProductProvider, useProduct } from './contexts/ProductContext';
export { CategoryProvider, useCategory } from './contexts/CategoryContext';
export { ImageProvider, useImage } from './contexts/ImageContext';
export { OrderProvider, useOrder } from './contexts/OrderContext';
export { StoreUserProvider, useStoreUser } from './contexts/StoreUserContext';

// Services
export { createApiClient } from './services/apiClient';
export { ProductService } from './services/productService';
export { CategoryService } from './services/categoryService';
export { ImageService } from './services/imageService';
export { OrderService } from './services/orderService';
export { StoreService } from './services/storeService';
export { StoreUserService } from './services/storeUserService';

// UI Components
export { Button } from './components/ui/button';
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';

// Enums
export {
  ProductStatusEnum,
  OrderStatusEnum,
  OrderFrequencyEnum,
} from './types';

// TypeScript Types
export type {
  LofnConfig,
  UserInfo,
  // Product
  ProductInfo,
  ProductInsertInfo,
  ProductUpdateInfo,
  ProductImageInfo,
  ProductSearchParam,
  ProductListPagedResult,
  // Category
  CategoryInfo,
  CategoryInsertInfo,
  CategoryUpdateInfo,
  // Order
  OrderInfo,
  OrderItemInfo,
  OrderSearchParam,
  OrderParam,
  OrderListPagedResult,
  // Store
  StoreInfo,
  StoreInsertInfo,
  StoreUpdateInfo,
  // StoreUser
  StoreUserInfo,
  StoreUserInsertInfo,
  // API
  ApiError,
} from './types';

// Utilities
export { cn } from './utils/cn';

// Constants
export { API_ENDPOINTS, VERSION } from './types';
