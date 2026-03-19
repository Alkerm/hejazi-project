import { AppError } from '../../utils/app-error';
import { normalizePagination } from '../../utils/pagination';
import { redis } from '../../config/redis';
import { findProductByIdOrSlug, listCategories, listProducts } from './products.repository';

const cacheTtlSeconds = 60;

const listKey = (params: {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  sort: string;
}) => `products:list:${JSON.stringify(params)}`;

const detailKey = (idOrSlug: string) => `products:detail:${idOrSlug}`;

export const getProducts = async (params: {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  sort: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
}) => {
  const cacheKey = listKey(params);
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const { skip, take, page, pageSize } = normalizePagination(params);
  const { items, total } = await listProducts({
    skip,
    take,
    search: params.search,
    category: params.category,
    sort: params.sort,
  });

  const result = {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };

  await redis.setex(cacheKey, cacheTtlSeconds, JSON.stringify(result));
  return result;
};

export const getProductDetails = async (idOrSlug: string) => {
  const key = detailKey(idOrSlug);
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const product = await findProductByIdOrSlug(idOrSlug);
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  await redis.setex(key, cacheTtlSeconds, JSON.stringify(product));
  return product;
};

export const getCategories = async () => {
  const key = 'products:categories';
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const categories = await listCategories();
  await redis.setex(key, 120, JSON.stringify(categories));
  return categories;
};

export const invalidateProductCaches = async () => {
  let cursor = '0';
  const matchedKeys: string[] = [];

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', 'products:*', 'COUNT', 100);
    cursor = nextCursor;
    matchedKeys.push(...keys);
  } while (cursor !== '0');

  if (matchedKeys.length > 0) {
    await redis.del(...matchedKeys);
  }
};
