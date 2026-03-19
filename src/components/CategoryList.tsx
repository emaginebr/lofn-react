import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Tag, Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useCategory } from '@/contexts/CategoryContext';
import type { CategoryInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export interface CategoryListProps {
  storeSlug: string;
  onEdit?: (category: CategoryInfo) => void;
  onCreate?: () => void;
  className?: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  storeSlug,
  onEdit,
  onCreate,
  className,
}) => {
  const { list, remove, isLoading } = useCategory();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CategoryInfo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await list(storeSlug);
      setCategories(result);
    } finally {
      setLoading(false);
    }
  }, [list, storeSlug]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(storeSlug, deleteTarget.categoryId);
      setCategories((prev) => prev.filter((c) => c.categoryId !== deleteTarget.categoryId));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Categorias</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Organize seus produtos por categoria</p>
        </div>
        {onCreate && (
          <Button size="sm" onClick={onCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nova Categoria
          </Button>
        )}
      </div>

      <LoadingOverlay visible={loading || isLoading} />

      {categories.length === 0 && !loading ? (
        <EmptyState
          icon={<Tag className="h-12 w-12" />}
          title="Nenhuma categoria"
          description="Crie categorias para organizar seus produtos."
          action={onCreate && (
            <Button size="sm" onClick={onCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              Criar Categoria
            </Button>
          )}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Slug</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Produtos</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map((cat) => (
                <tr key={cat.categoryId} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Tag className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{cat.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Package className="h-3.5 w-3.5" />
                      {cat.productCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {onEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(cat)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                        onClick={() => setDeleteTarget(cat)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir categoria"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"?`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
