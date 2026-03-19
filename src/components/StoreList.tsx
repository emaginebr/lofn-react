import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { Store, Plus, Pencil, Trash2, Link2 } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import type { StoreInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export interface StoreListProps {
  onEdit?: (store: StoreInfo) => void;
  onCreate?: () => void;
  onSelect?: (store: StoreInfo) => void;
  className?: string;
}

export const StoreList: React.FC<StoreListProps> = ({
  onEdit,
  onCreate,
  onSelect,
  className,
}) => {
  const { stores, currentStore, isLoading, loadStores, deleteStore, setCurrentStore } = useStore();
  const [deleteTarget, setDeleteTarget] = useState<StoreInfo | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStore(deleteTarget.storeId);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleSelect = (store: StoreInfo) => {
    setCurrentStore(store);
    onSelect?.(store);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Lojas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie suas lojas</p>
        </div>
        {onCreate && (
          <Button size="sm" onClick={onCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nova Loja
          </Button>
        )}
      </div>

      <LoadingOverlay visible={isLoading} />

      {stores.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Store className="h-12 w-12" />}
          title="Nenhuma loja encontrada"
          description="Crie sua primeira loja para comecar."
          action={onCreate && (
            <Button size="sm" onClick={onCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              Criar Loja
            </Button>
          )}
        />
      ) : (
        <div className="grid gap-3">
          {stores.map((store) => (
            <div
              key={store.storeId}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer',
                currentStore?.storeId === store.storeId
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5 dark:border-blue-500/50'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              )}
              onClick={() => handleSelect(store)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                  currentStore?.storeId === store.storeId
                    ? 'bg-blue-100 dark:bg-blue-500/20'
                    : 'bg-gray-100 dark:bg-gray-700'
                )}>
                  <Store className={cn(
                    'h-4 w-4',
                    currentStore?.storeId === store.storeId
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  )} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {store.name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <Link2 className="h-3 w-3" />
                    <span className="truncate">{store.slug}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); onEdit(store); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(store); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir loja"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
