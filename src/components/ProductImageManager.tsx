import React, { useEffect, useState, useCallback, useRef } from 'react';
import { cn } from '@/utils/cn';
import { Upload, Trash2, GripVertical, ImagePlus } from 'lucide-react';
import { useImage } from '@/contexts/ImageContext';
import type { ProductImageInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export interface ProductImageManagerProps {
  productId: number;
  className?: string;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  productId,
  className,
}) => {
  const { upload, list, remove, isLoading } = useImage();
  const [images, setImages] = useState<ProductImageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductImageInfo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await list(productId);
      setImages(result.sort((a, b) => a.sortOrder - b.sortOrder));
    } finally {
      setLoading(false);
    }
  }, [list, productId]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const newImage = await upload(productId, files[i], images.length + i);
        setImages((prev) => [...prev, newImage]);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.imageId);
      setImages((prev) => prev.filter((img) => img.imageId !== deleteTarget.imageId));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Imagens</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{images.length} imagem(ns)</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-1.5" />
          {uploading ? 'Enviando...' : 'Upload'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <LoadingOverlay visible={loading || isLoading} />

      {images.length === 0 && !loading ? (
        <EmptyState
          icon={<ImagePlus className="h-10 w-10" />}
          title="Sem imagens"
          description="Faca upload da primeira imagem."
          className="py-10"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={img.imageId}
              className="group relative aspect-square rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800"
            >
              <img
                src={img.imageUrl}
                alt={`Imagem ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDeleteTarget(img)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute top-1.5 left-1.5">
                <span className="inline-flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  <GripVertical className="h-3 w-3" />
                  {img.sortOrder}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir imagem"
        description="Tem certeza que deseja excluir esta imagem?"
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};
