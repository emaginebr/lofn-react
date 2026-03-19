import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NAuthProvider } from 'nauth-react';
import {
  LofnProvider,
  StoreProvider,
  ProductProvider,
  CategoryProvider,
  ImageProvider,
  OrderProvider,
  StoreUserProvider,
} from 'lofn-react';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import StoresListPage from './pages/StoresListPage';
import NewStorePage from './pages/NewStorePage';
import StorefrontPage from './pages/StorefrontPage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import OrdersPage from './pages/admin/OrdersPage';
import MembersPage from './pages/admin/MembersPage';
import SettingsPage from './pages/admin/SettingsPage';
import ReportsPage from './pages/admin/ReportsPage';
import { ROUTES } from './lib/constants';

function App() {
  return (
    <BrowserRouter basename="/lofn">
      <NAuthProvider
        config={{
          apiUrl: import.meta.env.VITE_API_URL,
          tenantId: import.meta.env.VITE_TENANT_ID,
          headers: { 'X-Tenant-Id': import.meta.env.VITE_TENANT_ID },
          enableFingerprinting: true,
          debug: true,
          redirectOnUnauthorized: ROUTES.LOGIN,
          onAuthChange: (user) => {
            console.log('Auth state changed:', user);
          },
        }}
      >
        <LofnProvider config={{ apiUrl: import.meta.env.VITE_LOFN_API_URL, tenantId: import.meta.env.VITE_TENANT_ID, debug: true }}>
          <StoreProvider>
            <ProductProvider>
              <CategoryProvider>
                <ImageProvider>
                  <OrderProvider>
                    <StoreUserProvider>
                      <Toaster position="bottom-right" richColors />
                      <Routes>
                        {/* Auth routes (public) */}
                        <Route element={<Layout />}>
                          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                          <Route path={`${ROUTES.RESET_PASSWORD}/:hash`} element={<ResetPasswordPage />} />
                          <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                          <Route path={ROUTES.CHANGE_PASSWORD} element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
                        </Route>

                        {/* / → /stores */}
                        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.STORES} replace />} />

                        {/* /stores — lista de lojas (público) */}
                        <Route element={<Layout />}>
                          <Route path={ROUTES.STORES} element={<StoresListPage />} />
                          <Route path={ROUTES.NEW_STORE} element={<ProtectedRoute><NewStorePage /></ProtectedRoute>} />
                        </Route>

                        {/* /:storeSlug — home publica da loja (storefront) */}
                        <Route path="/:storeSlug" element={<StorefrontPage />} />

                        {/* /:storeSlug/:categorySlug — produtos da categoria */}
                        <Route path="/:storeSlug/:categorySlug" element={<CategoryPage />} />

                        {/* /:storeSlug/:categorySlug/:productSlug — detalhe do produto */}
                        <Route path="/:storeSlug/:categorySlug/:productSlug" element={<ProductPage />} />

                        {/* /:storeSlug/admin — area administrativa da loja */}
                        <Route path="/:storeSlug/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                          <Route index element={<DashboardPage />} />
                          <Route path="products" element={<ProductsPage />} />
                          <Route path="products/:productSlug" element={<ProductEditPage />} />
                          <Route path="categories" element={<CategoriesPage />} />
                          <Route path="orders" element={<OrdersPage />} />
                          <Route path="members" element={<MembersPage />} />
                          <Route path="reports" element={<ReportsPage />} />
                          <Route path="settings" element={<SettingsPage />} />
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to={ROUTES.STORES} replace />} />
                      </Routes>
                    </StoreUserProvider>
                  </OrderProvider>
                </ImageProvider>
              </CategoryProvider>
            </ProductProvider>
          </StoreProvider>
        </LofnProvider>
      </NAuthProvider>
    </BrowserRouter>
  );
}

export default App;
