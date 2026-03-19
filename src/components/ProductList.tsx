import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { Package, Plus, Pencil, Search, Image as ImageIcon } from 'lucide-react';
import { useProduct } from '@/contexts/ProductContext';
import type { ProductInfo, ProductSearchParam } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { ProductStatusBadge } from '@/components/shared/StatusBadge';

export interface ProductListProps {
  storeId?: number;
  onEdit?: (product: ProductInfo) => void;
  onCreate?: () => void;
  onSelect?: (product: ProductInfo) => void;
  className?: string;
}

export const ProductList: React.FC<ProductListProps> = ({
  storeId,
  onEdit,
  onCreate,
  onSelect,
  className,
}) => {
  const { search, isLoading } = useProduct();
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async (pageNum: number, searchKeyword?: string) => {
    setLoading(true);
    try {
      const params: ProductSearchParam = {
        storeId: storeId ?? null,
        keyword: searchKeyword || undefined,
        pageNum: pageNum,
        onlyActive: false,
      };
      const result = await search(params);
      setProducts(result.products);
      setTotalPages(result.pageCount);
      setPage(result.pageNum);
    } finally {
      setLoading(false);
    }
  }, [search, storeId]);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(1, keyword);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Produtos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie o catalogo de produtos</p>
        </div>
        {onCreate && (
          <Button size="sm" onClick={onCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Produto
          </Button>
        )}
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Buscar produtos..."
            className="pl-9"
          />
        </div>
      </form>

      <LoadingOverlay visible={loading || isLoading} />

      {products.length === 0 && !loading ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="Nenhum produto encontrado"
          description={keyword ? 'Tente outra busca.' : 'Adicione seu primeiro produto.'}
          action={!keyword && onCreate && (
            <Button size="sm" onClick={onCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              Criar Produto
            </Button>
          )}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Produto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Preco</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Limite</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product) => (
                  <tr
                    key={product.productId}
                    className={cn(
                      'hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors',
                      onSelect && 'cursor-pointer'
                    )}
                    onClick={() => onSelect?.(product)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-md bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ProductStatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      {product.limit}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => loadProducts(p, keyword)}
          />
        </>
      )}
    </div>
  );
};
