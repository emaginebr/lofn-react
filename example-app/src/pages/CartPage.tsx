import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'nauth-react';
import { useStore, useShopCar } from 'lofn-react';
import type { ShopCarInfo } from 'lofn-react';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Hexagon,
  Loader2,
  Settings,
  Search,
  Minus,
  Plus,
  Trash2,
  User,
  MapPin,
  ChevronLeft,
  Package,
  CheckCircle,
} from 'lucide-react';
import { storeRoute, ROUTES } from '../lib/constants';
import { UserMenu } from '../components/UserMenu';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

const ADDRESSES_KEY = 'lofn_addresses';

function loadAddresses(): Address[] {
  try {
    const raw = localStorage.getItem(ADDRESSES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveAddresses(addresses: Address[]) {
  try {
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
  } catch { /* ignore */ }
}

export default function CartPage() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { isAuthenticated, user } = useAuth();
  const { currentStore } = useStore();
  const { items, itemCount, updateQuantity, removeItem, clearCart, insert, isLoading } = useShopCar();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>(loadAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    () => addresses[0]?.id ?? null
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });

  if (!currentStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalDiscount = items.reduce(
    (sum, item) => sum + (item.product.discount || 0) * item.quantity,
    0
  );
  const total = subtotal - totalDiscount;

  const handleAddAddress = () => {
    if (!addressForm.street.trim() || !addressForm.number.trim() || !addressForm.city.trim()) {
      toast.error('Preencha os campos obrigatorios');
      return;
    }
    const newAddr: Address = {
      id: crypto.randomUUID(),
      ...addressForm,
    };
    const updated = [...addresses, newAddr];
    setAddresses(updated);
    saveAddresses(updated);
    setSelectedAddressId(newAddr.id);
    setShowAddressForm(false);
    setAddressForm({ label: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '' });
    toast.success('Endereco adicionado');
  };

  const handleRemoveAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    saveAddresses(updated);
    if (selectedAddressId === id) {
      setSelectedAddressId(updated[0]?.id ?? null);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Faca login para finalizar');
      navigate(ROUTES.LOGIN);
      return;
    }
    if (items.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }
    if (!selectedAddressId) {
      toast.error('Selecione um endereco de entrega');
      return;
    }

    const shopCarData: ShopCarInfo = {
      user,
      items,
      createdAt: new Date().toISOString(),
    };

    try {
      await insert(shopCarData);
      toast.success('Pedido enviado com sucesso!');
      navigate(storeRoute(storeSlug!));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar pedido');
    }
  };

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
                className="relative p-2 text-amber-500 transition-colors"
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
            Continuar comprando
          </Link>
        </div>

        <h1 className="font-display text-3xl text-foreground mb-8">Carrinho de Compras</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-9 h-9 text-amber-500/60" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Seu carrinho esta vazio</p>
            <p className="text-sm text-muted-foreground mb-6">
              Adicione produtos para comecar suas compras.
            </p>
            <Link
              to={`/${storeSlug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-noir-950 font-medium rounded-lg hover:bg-amber-400 transition-all text-sm"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Items list */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-500" />
                    Produtos ({itemCount})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    Limpar carrinho
                  </button>
                </div>

                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <div
                      key={item.product.productId}
                      className="flex items-center gap-4 p-5 group"
                    >
                      {/* Product image */}
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-secondary to-secondary/50 overflow-hidden shrink-0">
                        {(item.product.imageUrl || item.product.images?.[0]?.imageUrl) ? (
                          <img
                            src={item.product.imageUrl || item.product.images[0].imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatPrice(item.product.price)} un.
                        </p>
                        {item.product.discount > 0 && (
                          <p className="text-xs text-emerald-500 mt-0.5">
                            -{formatPrice(item.product.discount)} desconto
                          </p>
                        )}
                      </div>

                      {/* Quantity control */}
                      <div className="flex items-center border border-border rounded-lg shrink-0">
                        <button
                          onClick={() => updateQuantity(item.product.productId, item.quantity - 1)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm font-medium text-foreground tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.productId,
                              item.product.limit > 0
                                ? Math.min(item.product.limit, item.quantity + 1)
                                : item.quantity + 1
                            )
                          }
                          disabled={item.product.limit > 0 && item.quantity >= item.product.limit}
                          className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right shrink-0 w-24">
                        <p className="text-sm font-semibold text-foreground tabular-nums">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.product.productId)}
                        className="p-1.5 text-muted-foreground/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-amber-500" />
                    Dados do comprador
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    Endereco de entrega
                  </h2>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    {showAddressForm ? 'Cancelar' : '+ Novo endereco'}
                  </button>
                </div>

                {/* Address form */}
                {showAddressForm && (
                  <div className="mb-5 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-3 animate-slide-down">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Apelido (ex: Casa, Trabalho)"
                        value={addressForm.label}
                        onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      />
                      <input
                        type="text"
                        placeholder="CEP"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm((f) => ({ ...f, zipCode: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Rua *"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm((f) => ({ ...f, street: e.target.value }))}
                        className="col-span-2 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      />
                      <input
                        type="text"
                        placeholder="Numero *"
                        value={addressForm.number}
                        onChange={(e) => setAddressForm((f) => ({ ...f, number: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Complemento"
                        value={addressForm.complement}
                        onChange={(e) => setAddressForm((f) => ({ ...f, complement: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      />
                      <input
                        type="text"
                        placeholder="Bairro"
                        value={addressForm.neighborhood}
                        onChange={(e) => setAddressForm((f) => ({ ...f, neighborhood: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Cidade *"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                        />
                        <input
                          type="text"
                          placeholder="UF"
                          maxLength={2}
                          value={addressForm.state}
                          onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value.toUpperCase() }))}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddAddress}
                        className="px-4 py-2 bg-amber-500 text-noir-950 text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors"
                      >
                        Salvar endereco
                      </button>
                    </div>
                  </div>
                )}

                {/* Address list */}
                {addresses.length === 0 && !showAddressForm ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum endereco cadastrado. Adicione um endereco de entrega.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-amber-500 bg-amber-500/5'
                            : 'border-border hover:border-amber-500/30 hover:bg-secondary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                                selectedAddressId === addr.id
                                  ? 'border-amber-500'
                                  : 'border-muted-foreground/30'
                              }`}
                            >
                              {selectedAddressId === addr.id && (
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              {addr.label && (
                                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-0.5">
                                  {addr.label}
                                </p>
                              )}
                              <p className="text-sm text-foreground">
                                {addr.street}, {addr.number}
                                {addr.complement ? ` - ${addr.complement}` : ''}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {[addr.neighborhood, addr.city, addr.state]
                                  .filter(Boolean)
                                  .join(' - ')}
                                {addr.zipCode ? ` | CEP: ${addr.zipCode}` : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAddress(addr.id);
                            }}
                            className="p-1 text-muted-foreground/40 hover:text-red-400 transition-colors shrink-0"
                            title="Remover endereco"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Summary - Right Column */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-5 sticky top-20">
                <h2 className="text-sm font-semibold text-foreground mb-5">Resumo do pedido</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
                    <span className="tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Descontos</span>
                      <span className="tabular-nums">-{formatPrice(totalDiscount)}</span>
                    </div>
                  )}
                  <div className="h-px bg-border" />
                  <div className="flex justify-between font-semibold text-foreground text-base">
                    <span>Total</span>
                    <span className="tabular-nums">{formatPrice(total)}</span>
                  </div>
                </div>

                {selectedAddressId && (
                  <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Entregar em:
                      <span className="font-medium text-foreground">
                        {addresses.find((a) => a.id === selectedAddressId)?.label || 'Endereco selecionado'}
                      </span>
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isLoading || items.length === 0 || !selectedAddressId}
                  className="w-full mt-5 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-amber-500 text-noir-950 font-semibold rounded-xl hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  {isLoading ? 'Enviando...' : 'Finalizar pedido'}
                </button>

                {!isAuthenticated && (
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    <Link to={ROUTES.LOGIN} className="text-amber-500 hover:text-amber-400">
                      Faca login
                    </Link>
                    {' '}para finalizar o pedido
                  </p>
                )}
              </div>
            </div>
          </div>
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
