import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { useStore, useCategory, useProduct, useShopCar } from 'lofn-react';
import type { CategoryInfo, ProductInfo } from 'lofn-react';
import { ShoppingCart, Search, Heart, ArrowRight, Hexagon, Loader2, Settings } from 'lucide-react';
import { storeRoute, ROUTES } from '../lib/constants';
import { UserMenu } from '../components/UserMenu';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

export default function StorefrontPage() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { isAuthenticated } = useAuth();
  const { getStoreBySlug, setCurrentStore, currentStore } = useStore();
  const { listActive: listActiveCategories } = useCategory();
  const { listFeatured } = useProduct();
  const { itemCount } = useShopCar();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductInfo[]>([]);

  useEffect(() => {
    if (!storeSlug) return;
    if (currentStore?.slug === storeSlug) return;
    getStoreBySlug(storeSlug)
      .then((store) => setCurrentStore(store))
      .catch(() => navigate(ROUTES.STORES, { replace: true }));
  }, [storeSlug, currentStore, getStoreBySlug, setCurrentStore, navigate]);

  useEffect(() => {
    if (!storeSlug) return;
    listActiveCategories(storeSlug).then(setCategories);
    listFeatured(storeSlug).then(setFeaturedProducts);
  }, [storeSlug, listActiveCategories, listFeatured]);

  if (!currentStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="grain min-h-screen bg-background">
      {/* Store Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link to={storeRoute(storeSlug!)} className="flex items-center gap-2.5">
              <Hexagon className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
              <span className="text-[15px] font-semibold tracking-tight text-foreground">
                {currentStore.name}
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  className="w-56 pl-9 pr-4 py-1.5 rounded-lg border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/30 transition-all"
                />
              </div>
              <Link
                to={storeRoute(storeSlug!, ROUTES.CART)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-noir-950 text-[10px] font-bold flex items-center justify-center">
                    {itemCount > 99 ? '99' : itemCount}
                  </span>
                )}
              </Link>
              {isAuthenticated && (
                <Link
                  to={storeRoute(storeSlug!, ROUTES.ADMIN)}
                  className="p-2 text-muted-foreground hover:text-amber-500 transition-colors"
                  title="Painel Admin"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              )}
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to={ROUTES.LOGIN}
                    className="px-4 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    className="px-4 py-1.5 text-[13px] font-medium bg-amber-500 text-noir-950 rounded-lg hover:bg-amber-400 transition-colors"
                  >
                    Criar Conta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-orange-500/5" />
        <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4 animate-slide-up">
            Transforme seu negocio
          </h1>
          <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '80ms', animationFillMode: 'backwards' }}>
            Planos, consultorias e cursos para levar sua empresa ao proximo nivel.
          </p>
          <div className="flex gap-3 justify-center animate-slide-up" style={{ animationDelay: '160ms', animationFillMode: 'backwards' }}>
            <button className="group px-5 py-2.5 bg-amber-500 text-noir-950 font-medium rounded-lg hover:bg-amber-400 transition-all text-sm flex items-center gap-2">
              Ver Produtos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button className="px-5 py-2.5 bg-secondary text-foreground font-medium rounded-lg border border-border hover:bg-secondary/80 transition-all text-sm">
              Saiba Mais
            </button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
            {categories.map((cat) => (
              <Link
                key={cat.categoryId}
                to={`/${storeSlug}/${cat.slug}`}
                className="shrink-0 px-4 py-1.5 rounded-full bg-secondary border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground hover:border-amber-500/30 transition-all"
              >
                {cat.name} ({cat.productCount})
              </Link>
            ))}
          </div>
        )}

        {/* Featured Products Grid */}
        {featuredProducts.length > 0 && (
          <>
            <h2 className="font-display text-2xl text-foreground mb-6">Produtos em Destaque</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {featuredProducts.map((product) => (
                <Link
                  key={product.productId}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- category from GraphQL projection
                  to={`/${storeSlug}/${(product as any).category?.slug ?? 'produto'}/${product.slug}`}
                  className="group glow-hover bg-card rounded-xl border border-border overflow-hidden animate-slide-up"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-secondary/50 relative overflow-hidden">
                    {(product.imageUrl || product.images?.[0]?.imageUrl) ? (
                      <img
                        src={product.imageUrl || product.images[0].imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                        <ShoppingCart className="w-10 h-10" />
                      </div>
                    )}
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all border border-border"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-foreground mb-1 group-hover:text-amber-500 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-foreground tabular-nums tracking-tight">
                        {formatPrice(product.price)}
                      </span>
                      <span className="px-3 py-1.5 bg-amber-500 text-noir-950 text-xs font-medium rounded-lg group-hover:bg-amber-400 transition-colors">
                        Ver detalhes
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-[13px] text-muted-foreground">
          <p>2026 {currentStore.name} — Powered by Lofn</p>
        </div>
      </footer>
    </div>
  );
}
