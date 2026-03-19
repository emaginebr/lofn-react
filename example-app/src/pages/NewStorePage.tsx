import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from 'loft-react';
import { ROUTES, storeRoute } from '../lib/constants';
import { toast } from 'sonner';
import { ArrowLeft, Store, Hexagon } from 'lucide-react';

export default function NewStorePage() {
  const { insertStore } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nome e obrigatorio');
      return;
    }

    setCreating(true);
    try {
      const store = await insertStore({ name: name.trim() });
      toast.success(`"${store.name}" criada com sucesso!`);
      navigate(storeRoute(store.slug, 'admin'), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar loja');
    } finally {
      setCreating(false);
    }
  };

  const inputClass = 'h-10 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/30 transition-all';

  return (
    <div className="max-w-md mx-auto pt-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Store className="w-7 h-7 text-amber-500" />
          </div>
        </div>
        <h1 className="font-display text-3xl text-foreground tracking-tight mb-2">
          Criar Nova Loja
        </h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para comecar a vender
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5 animate-slide-up">
        <div>
          <label className="block text-[13px] font-medium text-muted-foreground mb-1.5">
            Nome da Loja <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Minha Loja"
            autoFocus
            className={inputClass}
          />
          <p className="text-[11px] text-muted-foreground mt-1.5">
            O slug da loja sera gerado automaticamente a partir do nome.
          </p>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <Link
            to={ROUTES.STORES}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Link>
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 text-noir-950 text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            <Hexagon className="w-4 h-4" />
            {creating ? 'Criando...' : 'Criar Loja'}
          </button>
        </div>
      </form>
    </div>
  );
}
