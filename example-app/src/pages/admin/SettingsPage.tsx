import { useState, useEffect } from 'react';
import { useStore } from 'lofn-react';
import { useAuth } from 'nauth-react';
import { toast } from 'sonner';
import { Settings, User, Lock, Save } from 'lucide-react';

export default function SettingsPage() {
  const { currentStore, updateStore, isLoading } = useStore();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwner = currentStore && user && currentStore.ownerId === user.userId;

  useEffect(() => {
    if (currentStore) {
      setName(currentStore.name);
    }
  }, [currentStore]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore || !isOwner) return;

    if (!name.trim()) {
      toast.error('Nome e obrigatorio');
      return;
    }

    setSaving(true);
    try {
      await updateStore({ storeId: currentStore.storeId, name: name.trim() });
      toast.success('Loja atualizada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (!currentStore) return null;

  const inputClass = 'h-10 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/30 transition-all';
  const labelClass = 'block text-[13px] font-medium text-muted-foreground mb-1.5';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-display text-3xl text-foreground tracking-tight">Configuracoes</h1>
        <p className="text-sm text-muted-foreground mt-1">Edite as informacoes da sua loja</p>
      </div>

      <form onSubmit={handleSave} className="bg-card rounded-xl border border-border p-6 space-y-5 animate-slide-up">
        <h2 className="text-[13px] font-semibold text-foreground tracking-wide uppercase flex items-center gap-2">
          <Settings className="w-4 h-4 text-amber-500/60" />
          Dados da Loja
        </h2>

        <div>
          <label className={labelClass}>Nome da Loja</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isOwner}
            className={`${inputClass} ${!isOwner ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>

        <div>
          <label className={labelClass}>Slug</label>
          <div className="flex items-center h-10 px-3 rounded-lg border border-border bg-secondary/50 text-sm text-muted-foreground">
            /{currentStore.slug}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Proprietario
            </span>
          </label>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-secondary/50">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{user?.name || '—'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {!isOwner && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-[12px] text-amber-600 dark:text-amber-400">
              Apenas o proprietario pode editar as configuracoes da loja.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || isLoading || !isOwner}
            className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 text-noir-950 text-[13px] font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
