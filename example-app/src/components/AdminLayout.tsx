import { Outlet, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { useStore } from 'lofn-react';
import { ROUTES, APP_NAME, storeRoute } from '../lib/constants';
import { UserMenu } from './UserMenu';
import {
  LayoutDashboard,
  Package,
  Tag,

  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  Hexagon,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useState, useEffect } from 'react';

function useAdminNav(storeSlug: string) {
  const base = ROUTES.ADMIN;
  return [
    { to: storeRoute(storeSlug, base), icon: LayoutDashboard, label: 'Dashboard' },
    { to: storeRoute(storeSlug, ROUTES.ADMIN_PRODUCTS), icon: Package, label: 'Produtos' },
    { to: storeRoute(storeSlug, ROUTES.ADMIN_CATEGORIES), icon: Tag, label: 'Categorias' },

    { to: storeRoute(storeSlug, ROUTES.ADMIN_MEMBERS), icon: Users, label: 'Membros' },
    { to: storeRoute(storeSlug, ROUTES.ADMIN_REPORTS), icon: BarChart3, label: 'Relatorios' },
    { to: storeRoute(storeSlug, ROUTES.ADMIN_SETTINGS), icon: Settings, label: 'Configuracoes' },
  ];
}

function SidebarContent({ storeSlug, currentPath, onNavClick }: { storeSlug: string; currentPath: string; onNavClick?: () => void }) {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const navItems = useAdminNav(storeSlug);

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Hexagon className="w-4.5 h-4.5 text-amber-500" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          {APP_NAME}
        </span>
      </div>

      {/* Store indicator + links */}
      <div className="mx-3 mb-1 space-y-1">
        <Link
          to={ROUTES.STORES}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-[12px] text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="truncate font-medium">{currentStore?.name || storeSlug}</span>
        </Link>
        <Link
          to={storeRoute(storeSlug)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-amber-500 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Ver loja
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-border" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                isActive ? 'text-amber-500' : 'text-muted-foreground group-hover:text-foreground'
              }`} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export function AdminLayout() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loadStores, stores, setCurrentStore, currentStore } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadStores().then(() => setReady(true));
  }, [loadStores]);

  useEffect(() => {
    if (!ready || !storeSlug) return;
    const store = stores.find((s) => s.slug === storeSlug);
    if (store) {
      if (currentStore?.slug !== store.slug) setCurrentStore(store);
    } else if (stores.length > 0) {
      navigate(ROUTES.STORES, { replace: true });
    }
  }, [ready, storeSlug, stores, currentStore, setCurrentStore, navigate]);

  if (!ready || !currentStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  const slug = storeSlug!;

  return (
    <div className="grain min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 border-r border-border bg-card">
        <SidebarContent storeSlug={slug} currentPath={location.pathname} />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-noir-950/60 backdrop-blur-sm animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-60 bg-card border-r border-border z-50 animate-slide-in-bottom">
            <div className="absolute top-4 right-3">
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent storeSlug={slug} currentPath={location.pathname} onNavClick={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60">
        <header className="sticky top-0 z-30 h-14 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-6">
          <button className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />
          <UserMenu />
        </header>
        <main className="p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
