import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { StoreUserList, useStoreUser } from 'loft-react';
import { useNAuth } from 'nauth-react';
import type { UserInfo } from 'nauth-react';
import { toast } from 'sonner';
import { X, Search, Loader2 } from 'lucide-react';

export default function MembersPage() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { insert } = useStoreUser();
  const { searchUsers } = useNAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // User search
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);

  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = storeSlug!;

  const loadUsers = useCallback(async (term: string) => {
    if (!term.trim()) { setUsers([]); return; }
    setSearching(true);
    try {
      const result = await searchUsers({ searchTerm: term, page: 1, pageSize: 20 });
      setUsers(result.items);
    } catch {
      setUsers([]);
    } finally {
      setSearching(false);
    }
  }, [searchUsers]);

  // Debounce search
  useEffect(() => {
    if (!modalOpen) return;
    const timer = setTimeout(() => loadUsers(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm, loadUsers, modalOpen]);

  const handleClose = () => {
    setModalOpen(false);
    setSearchTerm('');
    setSelectedUser(null);
    setUsers([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedUser) {
      setError('Selecione um usuario');
      return;
    }

    setAdding(true);
    try {
      await insert(slug, { userId: selectedUser.userId });
      toast.success(`${selectedUser.name} adicionado`);
      handleClose();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar membro');
    } finally {
      setAdding(false);
    }
  };

  const inputClass = 'h-10 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/30 transition-all';

  return (
    <div className="max-w-2xl mx-auto">
      <StoreUserList
        key={refreshKey}
        storeSlug={slug}
        onAdd={() => setModalOpen(true)}
      />

      <Dialog.Root open={modalOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-noir-950/60 backdrop-blur-sm animate-fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-card rounded-xl border border-border shadow-xl animate-scale-in focus:outline-none">
            <div className="flex items-center justify-between px-6 pt-5 pb-0">
              <Dialog.Title className="text-base font-semibold text-foreground">
                Adicionar Membro
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">
                  Buscar usuario
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setSelectedUser(null); }}
                    placeholder="Digite o nome ou email..."
                    autoFocus
                    className={`${inputClass} pl-9`}
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                {/* Results dropdown */}
                {!selectedUser && users.length > 0 && (
                  <div className="mt-1.5 max-h-48 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                    {users.map((user) => (
                      <button
                        key={user.userId}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchTerm(user.name);
                          setUsers([]);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary transition-colors"
                      >
                        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!selectedUser && searchTerm.length > 1 && !searching && users.length === 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1.5 px-1">Nenhum usuario encontrado</p>
                )}

                {/* Selected user badge */}
                {selectedUser && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                      {selectedUser.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-foreground truncate">{selectedUser.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{selectedUser.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedUser(null); setSearchTerm(''); }}
                      className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 bg-secondary text-muted-foreground text-sm rounded-lg hover:text-foreground transition-colors">
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={adding || !selectedUser}
                  className="px-4 py-2 bg-amber-500 text-noir-950 text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {adding ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
