import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { useProduct } from '@/contexts/ProductContext';
import { useCategory } from '@/contexts/CategoryContext';
import { ProductStatusEnum } from '@/types';
import type { ProductInfo, CategoryInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { FormField, TextAreaField } from '@/components/shared/FormField';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';

export interface ProductFormProps {
  storeSlug: string;
  product?: ProductInfo | null;
  onSuccess?: (product: ProductInfo) => void;
  onCancel?: () => void;
  className?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  frequency: string;
  limit: string;
  categoryId: string;
  status: string;
  featured: boolean;
}

const initialData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  frequency: '30',
  limit: '1',
  categoryId: '',
  status: String(ProductStatusEnum.Active),
  featured: false,
};

export const ProductForm: React.FC<ProductFormProps> = ({
  storeSlug,
  product,
  onSuccess,
  onCancel,
  className,
}) => {
  const { insert, update, isLoading } = useProduct();
  const { list: listCategories } = useCategory();
  const [form, setForm] = useState<ProductFormData>(initialData);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!product;

  const loadCategories = useCallback(async () => {
    try {
      const cats = await listCategories(storeSlug);
      setCategories(cats);
    } catch {
      // silently fail
    }
  }, [listCategories, storeSlug]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        frequency: String(product.frequency),
        limit: String(product.limit),
        categoryId: product.categoryId ? String(product.categoryId) : '',
        status: String(product.status),
        featured: product.featured,
      });
    } else {
      setForm(initialData);
    }
    setError(null);
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Nome e obrigatorio');
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price) || 0,
        discount: 0,
        frequency: parseInt(form.frequency) || 30,
        limit: parseInt(form.limit) || 1,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        status: parseInt(form.status) as ProductStatusEnum,
        featured: form.featured,
      };

      let result: ProductInfo;
      if (isEditing && product) {
        result = await update(storeSlug, { ...payload, productId: product.productId });
      } else {
        result = await insert(storeSlug, payload);
      }
      onSuccess?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative space-y-6', className)}>
      <LoadingOverlay visible={isLoading} />

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isEditing ? 'Editar Produto' : 'Novo Produto'}
        </h2>
      </div>

      <div className="space-y-4">
        <FormField
          label="Nome"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nome do produto"
          required
        />

        <TextAreaField
          label="Descricao"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descricao do produto"
          rows={4}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Preco (R$)"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="0.00"
            required
          />

          <FormField label="Categoria" name="categoryId" value={form.categoryId} onChange={handleChange}>
            <select
              id="categoryId"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <option value="">Sem categoria</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label="Frequencia (dias)"
            name="frequency"
            type="number"
            value={form.frequency}
            onChange={handleChange}
          />

          <FormField
            label="Limite"
            name="limit"
            type="number"
            value={form.limit}
            onChange={handleChange}
          />

          <FormField label="Status" name="status" value={form.status} onChange={handleChange}>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <option value={ProductStatusEnum.Active}>Ativo</option>
              <option value={ProductStatusEnum.Inactive}>Inativo</option>
              <option value={ProductStatusEnum.Expired}>Expirado</option>
            </select>
          </FormField>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isEditing ? 'Salvar' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  );
};
