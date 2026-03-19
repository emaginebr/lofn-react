export const APP_NAME = 'Lofn Store';
export const APP_DESCRIPTION = 'Plataforma de gestao de lojas virtuais';

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/change-password',

  // Stores
  STORES: '/stores',
  NEW_STORE: '/new-store',

  // Store public (storefront)
  STORE_HOME: '/:storeSlug',

  // Store admin (relative — prefixed with /:storeSlug/admin)
  ADMIN: 'admin',
  ADMIN_PRODUCTS: 'admin/products',
  ADMIN_CATEGORIES: 'admin/categories',
  ADMIN_ORDERS: 'admin/orders',
  ADMIN_MEMBERS: 'admin/members',
  ADMIN_REPORTS: 'admin/reports',
  ADMIN_SETTINGS: 'admin/settings',
} as const;

/** Build an absolute store route */
export function storeRoute(storeSlug: string, sub: string = '') {
  return `/${storeSlug}${sub ? `/${sub}` : ''}`;
}

export const EXTERNAL_LINKS = {
  TERMS: '/terms',
  PRIVACY: '/privacy',
  DOCS: 'https://github.com/emaginebr/lofn-react',
} as const;
