import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { useStore, useProduct } from 'lofn-react';
import type { ProductInfo } from 'lofn-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ShoppingCart,
  ChevronLeft,
  Hexagon,
  Loader2,
  Settings,
  Search,
  Minus,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { storeRoute, ROUTES } from '../lib/constants';
import { UserMenu } from '../components/UserMenu';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

export default function ProductPage() {
  const { storeSlug, categorySlug, productSlug } = useParams<{
    storeSlug: string;
    categorySlug: string;
    productSlug: string;
  }>();
  const { isAuthenticated } = useAuth();
  const { getStoreBySlug, setCurrentStore, currentStore } = useStore();
  const { getBySlug } = useProduct();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!storeSlug) return;
    if (currentStore?.slug === storeSlug) return;
    getStoreBySlug(storeSlug)
      .then((store) => setCurrentStore(store))
      .catch(() => navigate(ROUTES.STORES, { replace: true }));
  }, [storeSlug, currentStore, getStoreBySlug, setCurrentStore, navigate]);

  useEffect(() => {
    if (!productSlug) return;
    setIsLoading(true);
    getBySlug(productSlug, storeSlug)
      .then((p) => {
        setProduct(p);
        setSelectedImage(0);
        setQuantity(1);
      })
      .catch(() => {
        if (storeSlug && categorySlug) {
          navigate(`/${storeSlug}/${categorySlug}`, { replace: true });
        }
      })
      .finally(() => setIsLoading(false));
  }, [productSlug, storeSlug, categorySlug, getBySlug, navigate]);

  if (!currentStore || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Produto nao encontrado</p>
        </div>
      </div>
    );
  }

  console.log('[ProductPage] product:', JSON.stringify({
    imageUrl: product.imageUrl,
    images: product.images,
    keys: Object.keys(product),
  }, null, 2));

  const allImages = [
    ...(product.imageUrl ? [{ imageUrl: product.imageUrl, sortOrder: -1 }] : []),
    ...(product.images ?? []).filter((img) => img.imageUrl !== product.imageUrl),
  ];
  const hasImages = allImages.length > 0;

  console.log('[ProductPage] allImages:', allImages);

  const handlePrev = () => setSelectedImage((i) => (i > 0 ? i - 1 : allImages.length - 1));
  const handleNext = () => setSelectedImage((i) => (i < allImages.length - 1 ? i + 1 : 0));

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
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingCart className="w-5 h-5" />
              </button>
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
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link to={`/${storeSlug}`} className="hover:text-amber-500 transition-colors">
            {currentStore.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/${storeSlug}/${categorySlug}`} className="hover:text-amber-500 transition-colors">
            {categorySlug}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
          {/* Image gallery */}
          <div>
            {/* Main image */}
            <div className="aspect-square bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl overflow-hidden relative mb-3">
              {hasImages ? (
                <>
                  <img
                    src={allImages[selectedImage].imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                  <ShoppingCart className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedImage
                        ? 'border-amber-500'
                        : 'border-border hover:border-amber-500/30'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground tabular-nums tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.frequency > 0 && (
                <span className="text-sm text-muted-foreground">
                  / {product.frequency === 7 ? 'semana' : product.frequency === 30 ? 'mes' : product.frequency === 365 ? 'ano' : `${product.frequency} dias`}
                </span>
              )}
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-foreground">Quantidade</span>
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium text-foreground tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => (product.limit > 0 ? Math.min(product.limit, q + 1) : q + 1))}
                  disabled={product.limit > 0 && quantity >= product.limit}
                  className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {product.limit > 0 && (
                <span className="text-xs text-muted-foreground">Max. {product.limit}</span>
              )}
            </div>

            {/* Add to cart */}
            <button className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-amber-500 text-noir-950 font-semibold rounded-xl hover:bg-amber-400 active:scale-[0.98] transition-all text-sm">
              <ShoppingCart className="w-5 h-5" />
              Adicionar ao carrinho
            </button>

            {/* Description */}
            {product.description && (
              <div className="mt-8 pt-8 border-t border-border">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                  Descricao
                </h2>
                <div className="prose prose-sm prose-invert max-w-none text-muted-foreground
                  prose-headings:text-foreground prose-headings:font-semibold
                  prose-strong:text-foreground
                  prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline
                  prose-ul:list-disc prose-ol:list-decimal
                  prose-li:marker:text-amber-500/50
                  prose-code:text-amber-400 prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-blockquote:border-amber-500/30 prose-blockquote:text-muted-foreground
                  prose-table:border-collapse prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-th:bg-secondary prose-th:text-foreground
                  prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{product.description}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
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
