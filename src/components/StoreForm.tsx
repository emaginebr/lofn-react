import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useStore } from '@/contexts/StoreContext';
import type { StoreInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';

export interface StoreFormProps {
  store?: StoreInfo | null;
  onSuccess?: (store: StoreInfo) => void;
  onCancel?: () => void;
  className?: string;
}

export const StoreForm: React.FC<StoreFormProps> = ({
  store,
  onSuccess,
  onCancel,
  className,
}) => {
  const { insertStore, updateStore, isLoading } = useStore();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!store;

  useEffect(() => {
    if (store) {
      setName(store.name);
    } else {
      setName('');
    }
    setError(null);
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nome e obrigatorio');
      return;
    }

    try {
      let result: StoreInfo;
      if (isEditing && store) {
        result = await updateStore({ storeId: store.storeId, name: name.trim() });
      } else {
        result = await insertStore({ name: name.trim() });
      }
      setName('');
      onSuccess?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar loja');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative space-y-6', className)}>
      <LoadingOverlay visible={isLoading} />

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isEditing ? 'Editar Loja' : 'Nova Loja'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isEditing ? 'Atualize os dados da loja' : 'Preencha os dados para criar uma nova loja'}
        </p>
      </div>

      <FormField
        label="Nome"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome da loja"
        required
        error={error || undefined}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isEditing ? 'Salvar' : 'Criar Loja'}
        </Button>
      </div>
    </form>
  );
};
