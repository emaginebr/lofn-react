import type { AxiosInstance } from 'axios';
import type { ProductImageInfo } from '../types';

/** Image Service — Manages all API operations for product images */
export class ImageService {
  constructor(private client: AxiosInstance) {}

  /** Upload an image for a product */
  async upload(productId: number, file: File, sortOrder: number = 0): Promise<ProductImageInfo> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ProductImageInfo>(
      `/image/upload/${productId}?sortOrder=${sortOrder}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /** List all images for a product */
  async list(productId: number): Promise<ProductImageInfo[]> {
    const response = await this.client.get<ProductImageInfo[]>(
      `/image/list/${productId}`
    );
    return response.data;
  }

  /** Delete an image */
  async delete(imageId: number): Promise<void> {
    await this.client.delete(`/image/delete/${imageId}`);
  }
}
