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

// Shared Components
export { LoadingOverlay } from './components/shared/LoadingOverlay';
export { EmptyState } from './components/shared/EmptyState';
export { StatusBadge, ProductStatusBadge, OrderStatusBadge } from './components/shared/StatusBadge';
export { ConfirmDialog } from './components/shared/ConfirmDialog';
export { Pagination } from './components/shared/Pagination';
export { FormField, TextAreaField } from './components/shared/FormField';

// Admin Components — Store
export { StoreList } from './components/StoreList';
export { StoreForm } from './components/StoreForm';

// Admin Components — Product
export { ProductList } from './components/ProductList';
export { ProductForm } from './components/ProductForm';
export { ProductImageManager } from './components/ProductImageManager';

// Admin Components — Category
export { CategoryList } from './components/CategoryList';
export { CategoryForm } from './components/CategoryForm';

// Admin Components — Order
export { OrderList } from './components/OrderList';
export { OrderDetail } from './components/OrderDetail';

// Admin Components — StoreUser
export { StoreUserList } from './components/StoreUserList';

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
  ProductInfo,
  ProductInsertInfo,
  ProductUpdateInfo,
  ProductImageInfo,
  ProductSearchParam,
  ProductListPagedResult,
  CategoryInfo,
  CategoryInsertInfo,
  CategoryUpdateInfo,
  OrderInfo,
  OrderItemInfo,
  OrderSearchParam,
  OrderParam,
  OrderListPagedResult,
  StoreInfo,
  StoreInsertInfo,
  StoreUpdateInfo,
  StoreUserInfo,
  StoreUserInsertInfo,
  ApiError,
} from './types';

// Component Props Types
export type { StoreListProps } from './components/StoreList';
export type { StoreFormProps } from './components/StoreForm';
export type { ProductListProps } from './components/ProductList';
export type { ProductFormProps } from './components/ProductForm';
export type { ProductImageManagerProps } from './components/ProductImageManager';
export type { CategoryListProps } from './components/CategoryList';
export type { CategoryFormProps } from './components/CategoryForm';
export type { OrderListProps } from './components/OrderList';
export type { OrderDetailProps } from './components/OrderDetail';
export type { StoreUserListProps } from './components/StoreUserList';
export type { LoadingOverlayProps } from './components/shared/LoadingOverlay';
export type { EmptyStateProps } from './components/shared/EmptyState';
export type { StatusBadgeProps } from './components/shared/StatusBadge';
export type { ConfirmDialogProps } from './components/shared/ConfirmDialog';
export type { PaginationProps } from './components/shared/Pagination';
export type { FormFieldProps, TextAreaFieldProps } from './components/shared/FormField';

// Utilities
export { cn } from './utils/cn';

// Constants
export { API_ENDPOINTS, VERSION } from './types';
