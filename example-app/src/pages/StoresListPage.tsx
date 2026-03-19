import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from 'lofn-react';
import type { StoreInfo } from 'lofn-react';
import { Store, Plus, Hexagon, Loader2 } from 'lucide-react';
import { APP_NAME, ROUTES, storeRoute } from '../lib/constants';

export default function StoresListPage() {
  const { listActiveStores, isLoading } = useStore();
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    listActiveStores().then((result) => {
      setStores(result);
      setLoaded(true);
    });
  }, [listActiveStores]);

  // Auto-redirect if only one store
  useEffect(() => {
    if (loaded && stores.length === 1) {
      navigate(storeRoute(stores[0].slug), { replace: true });
    }
  }, [loaded, stores, navigate]);

  const handleSelect = (store: StoreInfo) => {
    navigate(storeRoute(store.slug));
  };

  if (!loaded || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (stores.length === 1) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Hexagon className="w-7 h-7 text-amber-500" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="font-display text-4xl text-foreground tracking-tight mb-2">
          {APP_NAME}
        </h1>
        <p className="text-sm text-muted-foreground">
          Descubra as melhores lojas e encontre o que voce precisa
        </p>
      </div>

      {/* Stores list */}
      {stores.length === 0 ? (
        <div className="text-center py-16">
          <Store className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground mb-1">Nenhuma loja encontrada</p>
          <p className="text-xs text-muted-foreground mb-6">Crie sua primeira loja para comecar.</p>
          <Link
            to={ROUTES.NEW_STORE}
            className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 text-noir-950 text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar Loja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {stores.map((store) => (
            <button
              key={store.storeId}
              onClick={() => handleSelect(store)}
              className="glow-hover flex flex-col items-center gap-3 p-6 bg-card rounded-xl border border-border text-center group animate-slide-up transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/15 transition-colors">
                <Store className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-sm font-medium text-foreground truncate w-full">{store.name}</p>
            </button>
          ))}
        </div>
      )}

      {/* Create store link */}
      <div className="mt-6 text-center">
        <Link
          to={ROUTES.NEW_STORE}
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-amber-500 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Abra sua loja e comece a vender hoje
        </Link>
      </div>
    </div>
  );
}
