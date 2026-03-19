import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useCategory } from '@/contexts/CategoryContext';
import type { CategoryInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';

export interface CategoryFormProps {
  storeSlug: string;
  category?: CategoryInfo | null;
  onSuccess?: (category: CategoryInfo) => void;
  onCancel?: () => void;
  className?: string;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  storeSlug,
  category,
  onSuccess,
  onCancel,
  className,
}) => {
  const { insert, update, isLoading } = useCategory();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!category;

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName('');
    }
    setError(null);
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nome e obrigatorio');
      return;
    }

    try {
      let result: CategoryInfo;
      if (isEditing && category) {
        result = await update(storeSlug, { categoryId: category.categoryId, name: name.trim() });
      } else {
        result = await insert(storeSlug, { name: name.trim() });
      }
      setName('');
      onSuccess?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar categoria');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative space-y-6', className)}>
      <LoadingOverlay visible={isLoading} />

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
        </h2>
      </div>

      <FormField
        label="Nome"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome da categoria"
        required
        error={error || undefined}
      />

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isEditing ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
};
