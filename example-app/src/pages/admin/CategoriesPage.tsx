import { useState } from 'react';
import { useParams } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { CategoryList, CategoryForm } from 'lofn-react';
import type { CategoryInfo } from 'lofn-react';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function CategoriesPage() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const slug = storeSlug!;

  const handleCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category: CategoryInfo) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    toast.success(editingCategory ? 'Categoria atualizada' : 'Categoria criada');
    setModalOpen(false);
    setEditingCategory(null);
    setRefreshKey((k) => k + 1);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <CategoryList
        key={refreshKey}
        storeSlug={slug}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />

      <Dialog.Root open={modalOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-noir-950/60 backdrop-blur-sm animate-fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-card rounded-xl border border-border shadow-xl animate-scale-in focus:outline-none">
            <div className="flex items-center justify-between px-6 pt-5 pb-0">
              <Dialog.Title className="text-base font-semibold text-foreground">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
            <div className="p-6">
              <CategoryForm
                storeSlug={slug}
                category={editingCategory}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
