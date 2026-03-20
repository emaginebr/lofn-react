import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useCategory, useImage, ProductStatusEnum } from 'lofn-react';
import type { ProductInfo, CategoryInfo, ProductImageInfo } from 'lofn-react';
import { storeRoute } from '../../lib/constants';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Upload, Trash2, GripVertical, ImagePlus,
  Loader2,
} from 'lucide-react';
import { useRef } from 'react';

export default function ProductEditPage() {
  const { storeSlug, productSlug } = useParams<{ storeSlug: string; productSlug: string }>();
  const navigate = useNavigate();
  const { getBySlug, update, isLoading: productLoading } = useProduct();
  const { list: listCategories } = useCategory();
  const { upload: uploadImage, list: listImages, remove: removeImage } = useImage();

  const slug = storeSlug!;

  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [images, setImages] = useState<ProductImageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState('30');
  const [limit, setLimit] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState(String(ProductStatusEnum.Active));

  const loadProduct = useCallback(async () => {
    if (!productSlug) return;
    setLoading(true);
    try {
      const p = await getBySlug(productSlug);
      setProduct(p);
      setName(p.name);
      setDescription(p.description);
      setPrice(String(p.price));
      setFrequency(String(p.frequency));
      setLimit(String(p.limit));
      setCategoryId(p.categoryId ? String(p.categoryId) : '');
      setStatus(String(p.status));

      const imgs = await listImages(p.productId);
      setImages(imgs.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch {
      toast.error('Produto nao encontrado');
      navigate(storeRoute(slug, 'admin/products'));
    } finally {
      setLoading(false);
    }
  }, [productSlug, getBySlug, listImages, slug, navigate]);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await listCategories(slug);
      setCategories(cats);
    } catch { /* */ }
  }, [listCategories, slug]);

  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [loadProduct, loadCategories]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    try {
      const updated = await update(slug, {
        productId: product.productId,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        frequency: parseInt(frequency) || 30,
        limit: parseInt(limit) || 1,
        categoryId: categoryId ? parseInt(categoryId) : null,
        status: parseInt(status) as ProductStatusEnum,
      });
      setProduct(updated);
      toast.success('Produto salvo');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !product) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const img = await uploadImage(product.productId, files[i], images.length + i);
        setImages((prev) => [...prev, img]);
      }
      toast.success('Imagem(ns) enviada(s)');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro no upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (img: ProductImageInfo) => {
    try {
      await removeImage(img.imageId);
      setImages((prev) => prev.filter((i) => i.imageId !== img.imageId));
      toast.success('Imagem removida');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover');
    }
  };

  const inputClass = 'h-10 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/30 transition-all';
  const selectClass = inputClass;
  const textareaClass = 'w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/30 transition-all';
  const labelClass = 'block text-[13px] font-medium text-muted-foreground mb-1.5';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(storeRoute(slug, 'admin/products'))}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl text-foreground tracking-tight">{product.name}</h1>
            <p className="text-xs text-muted-foreground">/{product.slug}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || productLoading}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-noir-950 text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-5">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-[13px] font-semibold text-foreground tracking-wide uppercase">Dados do Produto</h2>

            <div>
              <label className={labelClass}>Nome <span className="text-red-400">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Descricao</label>
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={textareaClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Preco (R$) <span className="text-red-400">*</span></label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Categoria</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectClass}>
                  <option value="">Sem categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Frequencia</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={selectClass}>
                  <option value="7">Semanal</option>
                  <option value="30">Mensal</option>
                  <option value="365">Anual</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Limite</label>
                <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                  <option value={ProductStatusEnum.Active}>Ativo</option>
                  <option value={ProductStatusEnum.Inactive}>Inativo</option>
                  <option value={ProductStatusEnum.Expired}>Expirado</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Images */}
        <div className="space-y-5">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-foreground tracking-wide uppercase">
                Imagens
              </h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Enviando...' : 'Upload'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {images.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center py-10 rounded-lg border-2 border-dashed border-border hover:border-amber-500/30 cursor-pointer transition-colors"
              >
                <ImagePlus className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Clique para adicionar imagens</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img, index) => (
                  <div
                    key={img.imageId}
                    className="group relative aspect-square rounded-lg border border-border overflow-hidden bg-secondary"
                  >
                    <img src={img.imageUrl} alt={`Imagem ${index + 1}`} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-noir-950/0 group-hover:bg-noir-950/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleDeleteImage(img)}
                        className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-1.5 left-1.5">
                        <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-noir-950">
                          Principal
                        </span>
                      </div>
                    )}
                    {index > 0 && (
                      <div className="absolute top-1.5 left-1.5">
                        <span className="inline-flex items-center gap-0.5 rounded bg-noir-950/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          <GripVertical className="w-3 h-3" />
                          {img.sortOrder}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-muted-foreground mt-3">
              {images.length} imagem(ns). A primeira e usada como foto principal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
