import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Users, UserPlus, Trash2, Mail } from 'lucide-react';
import { useStoreUser } from '@/contexts/StoreUserContext';
import type { StoreUserInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export interface StoreUserListProps {
  storeSlug: string;
  onAdd?: () => void;
  className?: string;
}

export const StoreUserList: React.FC<StoreUserListProps> = ({
  storeSlug,
  onAdd,
  className,
}) => {
  const { list, insert, remove, isLoading } = useStoreUser();
  const [users, setUsers] = useState<StoreUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<StoreUserInfo | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Inline add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await list(storeSlug);
      setUsers(result);
    } finally {
      setLoading(false);
    }
  }, [list, storeSlug]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(storeSlug, deleteTarget.storeUserId);
      setUsers((prev) => prev.filter((u) => u.storeUserId !== deleteTarget.storeUserId));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const userId = parseInt(newUserId);
    if (!userId || isNaN(userId)) {
      setAddError('ID do usuario invalido');
      return;
    }

    setAdding(true);
    try {
      const newUser = await insert(storeSlug, { userId });
      setUsers((prev) => [...prev, newUser]);
      setNewUserId('');
      setShowAddForm(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Erro ao adicionar usuario');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Membros</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Usuarios com acesso a esta loja</p>
        </div>
        <Button
          size="sm"
          onClick={() => { if (onAdd) onAdd(); else setShowAddForm(true); }}
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          Adicionar
        </Button>
      </div>

      {/* Inline add form */}
      {showAddForm && !onAdd && (
        <form onSubmit={handleAdd} className="mb-4 p-4 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                ID do Usuario
              </label>
              <Input
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="Ex: 42"
                type="number"
              />
            </div>
            <Button type="submit" size="sm" disabled={adding}>
              {adding ? 'Adicionando...' : 'Adicionar'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => { setShowAddForm(false); setAddError(null); }}>
              Cancelar
            </Button>
          </div>
          {addError && <p className="text-xs text-red-500 mt-2">{addError}</p>}
        </form>
      )}

      <LoadingOverlay visible={loading || isLoading} />

      {users.length === 0 && !loading ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Nenhum membro"
          description="Adicione usuarios para dar acesso a esta loja."
        />
      ) : (
        <div className="space-y-2">
          {users.map((storeUser) => (
            <div
              key={storeUser.storeUserId}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {storeUser.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {storeUser.user?.name || `Usuario #${storeUser.userId}`}
                  </p>
                  {storeUser.user?.email && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{storeUser.user.email}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                onClick={() => setDeleteTarget(storeUser)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remover membro"
        description={`Remover "${deleteTarget?.user?.name || 'este usuario'}" da loja?`}
        confirmLabel="Remover"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
