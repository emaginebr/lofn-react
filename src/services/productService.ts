import type { AxiosInstance } from 'axios';
import { GraphQLClient } from './graphqlClient';
import type {
  ProductInfo,
  ProductInsertInfo,
  ProductUpdateInfo,
  ProductSearchParam,
  ProductListPagedResult,
} from '../types';

const PRODUCT_FIELDS = `
  productId
  slug
  name
  description
  price
  status
  featured
  image
  imageUrl
  productImages { imageId image imageUrl sortOrder }
`;

const PRODUCT_FIELDS_WITH_CATEGORY = `
  ${PRODUCT_FIELDS}
  category { slug name }
`;

/** Maps GraphQL productImages field to ProductInfo.images */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- GraphQL responses are untyped at this layer
function mapProduct(p: any): ProductInfo {
  if (p.productImages && !p.images) {
    p.images = p.productImages;
    delete p.productImages;
  }
  return p as ProductInfo;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProducts(products: any[]): ProductInfo[] {
  return products.map(mapProduct);
}

/** Product Service — Queries via GraphQL, mutations via REST */
export class ProductService {
  private gql: GraphQLClient;

  constructor(private client: AxiosInstance) {
    this.gql = new GraphQLClient(client);
  }

  /** Search products (public, REST) */
  async search(params: ProductSearchParam): Promise<ProductListPagedResult> {
    const response = await this.client.post<ProductListPagedResult>(
      '/product/search',
      params
    );
    return response.data;
  }

  /** Get product by slug (public, GraphQL) */
  async getBySlug(productSlug: string, storeSlug?: string): Promise<ProductInfo> {
    if (storeSlug) {
      const data = await this.gql.query<{ storeBySlug: Array<{ products: ProductInfo[] }> }>(`
        query ($storeSlug: String!) {
          storeBySlug(slug: $storeSlug) {
            products { ${PRODUCT_FIELDS} }
          }
        }
      `, { storeSlug });
      const products = mapProducts(data.storeBySlug?.[0]?.products ?? []);
      const product = products.find((p) => p.slug === productSlug);
      if (!product) {
        throw new Error('Produto não encontrado');
      }
      return product;
    }
    const data = await this.gql.query<{ products: ProductInfo[] }>(`
      query ($slug: String!) {
        products(where: { slug: { eq: $slug } }) { ${PRODUCT_FIELDS} }
      }
    `, { slug: productSlug });
    if (!data.products?.length) {
      throw new Error('Produto não encontrado');
    }
    return mapProduct(data.products[0]);
  }

  /** Get product by ID (admin, GraphQL) */
  async getById(_storeSlug: string, productId: number): Promise<ProductInfo> {
    const data = await this.gql.adminQuery<{ myProducts: ProductInfo[] }>(`
      query ($productId: Int!) {
        myProducts(where: { productId: { eq: $productId } }) { ${PRODUCT_FIELDS} }
      }
    `, { productId });
    if (!data.myProducts?.length) {
      throw new Error('Produto não encontrado');
    }
    return mapProduct(data.myProducts[0]);
  }

  /** List featured products (public, GraphQL) */
  async listFeatured(storeSlug: string, limit: number = 6): Promise<ProductInfo[]> {
    const data = await this.gql.query<{ featuredProducts: ProductInfo[] }>(`
      query ($storeSlug: String!) {
        featuredProducts(storeSlug: $storeSlug) { ${PRODUCT_FIELDS_WITH_CATEGORY} }
      }
    `, { storeSlug });
    const products = mapProducts(data.featuredProducts ?? []);
    return products.slice(0, limit);
  }

  /** List active products (public, GraphQL) */
  async listActive(storeSlug: string, categorySlug?: string): Promise<ProductInfo[]> {
    const data = await this.gql.query<{ storeBySlug: Array<{ products: ProductInfo[] }> }>(`
      query ($storeSlug: String!) {
        storeBySlug(slug: $storeSlug) {
          products { ${PRODUCT_FIELDS_WITH_CATEGORY} }
        }
      }
    `, { storeSlug });
    let products = mapProducts(data.storeBySlug?.[0]?.products ?? []);
    if (categorySlug) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- category comes from GraphQL projection
      products = products.filter((p) => (p as any).category?.slug === categorySlug);
    }
    return products.sort((a, b) => a.name.localeCompare(b.name));
  }

  /** List all products for admin (GraphQL) */
  async list(storeSlug: string): Promise<ProductInfo[]> {
    const data = await this.gql.adminQuery<{ myProducts: ProductInfo[] }>(`
      query ($storeSlug: String!) {
        myProducts(where: { store: { slug: { eq: $storeSlug } } }, order: { name: ASC }) { ${PRODUCT_FIELDS} }
      }
    `, { storeSlug });
    return mapProducts(data.myProducts ?? []);
  }

  /** Create a new product (REST) */
  async insert(storeSlug: string, data: ProductInsertInfo): Promise<ProductInfo> {
    const response = await this.client.post<ProductInfo>(
      `/product/${storeSlug}/insert`,
      data
    );
    return response.data;
  }

  /** Update an existing product (REST) */
  async update(storeSlug: string, data: ProductUpdateInfo): Promise<ProductInfo> {
    const response = await this.client.post<ProductInfo>(
      `/product/${storeSlug}/update`,
      data
    );
    return response.data;
  }
}
