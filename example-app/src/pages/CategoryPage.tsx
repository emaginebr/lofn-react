import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { useStore, useCategory, useProduct, useShopCar } from 'lofn-react';
import type { CategoryInfo, ProductInfo } from 'lofn-react';
import { ShoppingCart, Heart, ChevronLeft, Hexagon, Loader2, Settings, Search } from 'lucide-react';
import { storeRoute, ROUTES } from '../lib/constants';
import { UserMenu } from '../components/UserMenu';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

const PAGE_SIZE = 12;

export default function CategoryPage() {
  const { storeSlug, categorySlug } = useParams<{ storeSlug: string; categorySlug: string }>();
  const { isAuthenticated } = useAuth();
  const { getStoreBySlug, setCurrentStore, currentStore } = useStore();
  const { getBySlug: getCategoryBySlug } = useCategory();
  const { listActive } = useProduct();
  const { itemCount } = useShopCar();
  const navigate = useNavigate();

  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginatedProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (!storeSlug) return;
    if (currentStore?.slug === storeSlug) return;
    getStoreBySlug(storeSlug)
      .then((store) => setCurrentStore(store))
      .catch(() => navigate(ROUTES.STORES, { replace: true }));
  }, [storeSlug, currentStore, getStoreBySlug, setCurrentStore, navigate]);

  useEffect(() => {
    if (!storeSlug || !categorySlug) return;
    setIsLoading(true);
    const loadCategory = getCategoryBySlug(storeSlug, categorySlug)
      .then(setCategory)
      .catch(() => setCategory(null));
    const loadProducts = listActive(storeSlug, categorySlug)
      .then((prods) => { setProducts(prods); setPage(1); })
      .catch(() => setProducts([]));
    Promise.all([loadCategory, loadProducts])
      .finally(() => setIsLoading(false));
  }, [storeSlug, categorySlug, getCategoryBySlug, listActive, navigate]);

  if (!currentStore || isLoading) {
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

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to={`/${storeSlug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para a loja
          </Link>
        </div>

        {/* Category header */}
        {category && (
          <div className="mb-8">
            <h1 className="font-display text-3xl text-foreground mb-1">{category.name}</h1>
            <p className="text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? 'produto' : 'produtos'}
            </p>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">Nenhum produto encontrado</p>
            <p className="text-xs text-muted-foreground">Esta categoria ainda não possui produtos.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
              {paginatedProducts.map((product) => (
                <Link
                  key={product.productId}
                  to={`/${storeSlug}/${categorySlug}/${product.slug}`}
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
                    <h3 className="text-sm font-medium text-foreground mb-1 group-hover:text-amber-500 transition-colors truncate">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                      p === page
                        ? 'bg-amber-500 text-noir-950'
                        : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Proximo
                </button>
              </div>
            )}
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
