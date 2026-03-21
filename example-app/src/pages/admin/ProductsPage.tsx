import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useProduct, useCategory, useStore } from 'lofn-react';
import { ProductStatusEnum } from 'lofn-react';
import type { ProductInfo, CategoryInfo, ProductSearchParam } from 'lofn-react';
import { storeRoute } from '../../lib/constants';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, Search, X, Image as ImageIcon,
  Package, ChevronLeft, ChevronRight, Loader2, Calendar,
} from 'lucide-react';

const frequencyLabel = (days: number) => {
  if (days === 7) return 'Semanal';
  if (days === 30) return 'Mensal';
  if (days === 365) return 'Anual';
  return `${days}d`;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

export default function ProductsPage() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { currentStore } = useStore();
  const { search, insert } = useProduct();
  const { list: listCategories } = useCategory();

  const slug = storeSlug!;

  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formFrequency, setFormFrequency] = useState('30');
  const [formPrice, setFormPrice] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<ProductInfo | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.categoryId, c.name]));

  const loadCategories = useCallback(async () => {
    try {
      const cats = await listCategories(slug);
      setCategories(cats);
    } catch { /* */ }
  }, [listCategories, slug]);

  const loadProducts = useCallback(async (pageNum: number, kw?: string) => {
    setLoading(true);
    try {
      const params: ProductSearchParam = {
        storeId: currentStore?.storeId ?? null,
        keyword: kw || undefined,
        pageNum: pageNum,
        onlyActive: false,
      };
      const result = await search(params);
      setProducts(result.products);
      setTotalPages(result.pageCount);
      setPage(result.pageNum);
    } finally {
      setLoading(false);
    }
  }, [search, currentStore]);

  useEffect(() => {
    loadCategories();
    loadProducts(1);
  }, [loadCategories, loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(1, keyword);
  };

  const handleEdit = (product: ProductInfo) => {
    navigate(storeRoute(slug, `admin/products/${product.slug}`));
  };

  const handleDelete = (product: ProductInfo) => {
    setDeleteTarget(product);
  };

  const confirmDelete = () => {
    toast.info(`Exclusao de "${deleteTarget?.name}" sera implementada na API em breve.`);
    setDeleteTarget(null);
  };

  const resetForm = () => {
    setFormName('');
    setFormCategoryId('');
    setFormFrequency('30');
    setFormPrice('');
    setFormError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) { setFormError('Nome e obrigatorio'); return; }
    if (!formPrice) { setFormError('Preco e obrigatorio'); return; }

    setCreating(true);
    try {
      const product = await insert(slug, {
        name: formName.trim(),
        description: '',
        price: parseFloat(formPrice) || 0,
        discount: 0,
        frequency: parseInt(formFrequency) || 30,
        limit: 1,
        categoryId: formCategoryId ? parseInt(formCategoryId) : null,
        status: ProductStatusEnum.Active,
        featured: false,
      });
      toast.success(`"${product.name}" criado`);
      setModalOpen(false);
      resetForm();
      navigate(storeRoute(slug, `admin/products/${product.slug}`));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao criar produto');
    } finally {
      setCreating(false);
    }
  };

  const selectClass = 'h-10 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/30 transition-all';
  const inputClass = selectClass;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-foreground tracking-tight">Produtos</h2>
          <p className="text-sm text-muted-foreground">Gerencie o catalogo de produtos</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-noir-950 text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Buscar produtos..."
            className={`${inputClass} pl-9`}
          />
        </div>
      </form>

      {/* Table */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-xl">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          </div>
        )}

        {products.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">Nenhum produto encontrado</p>
            <p className="text-xs text-muted-foreground">
              {keyword ? 'Tente outra busca.' : 'Crie seu primeiro produto.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-muted-foreground border-b border-border uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Preco</th>
                  <th className="px-4 py-3 font-medium text-center">Frequencia</th>
                  <th className="px-4 py-3 font-medium text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr
                    key={product.productId}
                    className="hover:bg-secondary/40 transition-colors cursor-pointer"
                    onClick={() => handleEdit(product)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-secondary overflow-hidden flex items-center justify-center border border-border">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-muted-foreground/40" />
                          )}
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {product.categoryId ? categoryMap.get(product.categoryId) || '—' : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground tabular-nums">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {frequencyLabel(product.frequency)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-muted-foreground">Pagina {page} de {totalPages}</p>
          <div className="flex gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => loadProducts(page - 1, keyword)}
              className="flex items-center gap-1 px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => loadProducts(page + 1, keyword)}
              className="flex items-center gap-1 px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              Proximo <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Dialog.Root open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); resetForm(); } }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-noir-950/60 backdrop-blur-sm animate-fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-card rounded-xl border border-border shadow-xl animate-scale-in focus:outline-none">
            <div className="flex items-center justify-between px-6 pt-5">
              <Dialog.Title className="text-base font-semibold text-foreground">
                Novo Produto
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">
                  Nome <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nome do produto"
                  autoFocus
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">
                  Categoria
                </label>
                <select value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)} className={selectClass}>
                  <option value="">Sem categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">
                    Preco (R$) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">
                    Frequencia
                  </label>
                  <select value={formFrequency} onChange={(e) => setFormFrequency(e.target.value)} className={selectClass}>
                    <option value="7">Semanal (7 dias)</option>
                    <option value="30">Mensal (30 dias)</option>
                    <option value="365">Anual (365 dias)</option>
                  </select>
                </div>
              </div>

              {formError && <p className="text-xs text-red-400">{formError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 bg-secondary text-muted-foreground text-sm rounded-lg hover:text-foreground transition-colors">
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-amber-500 text-noir-950 text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Criando...' : 'Criar e Editar'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete confirm */}
      <Dialog.Root open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-noir-950/60 backdrop-blur-sm animate-fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-card rounded-xl border border-border shadow-xl animate-scale-in focus:outline-none p-6">
            <Dialog.Title className="text-base font-semibold text-foreground mb-2">
              Excluir produto
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja excluir "{deleteTarget?.name}"?
            </Dialog.Description>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 bg-secondary text-muted-foreground text-sm rounded-lg hover:text-foreground transition-colors">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-500 transition-colors"
              >
                Excluir
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
