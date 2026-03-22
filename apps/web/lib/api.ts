import type {
  AdminDashboardSummary,
  AdminInventoryResponse,
  AdminSalesAnalytics,
  ApiEnvelope,
  Cart,
  Category,
  Order,
  Paginated,
  Product,
  UserProfile,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });
  } catch {
    throw new HttpError(
      `Unable to reach API at ${API_BASE}. Start the API server and verify CORS_ORIGIN includes your web origin.`,
      0,
    );
  }

  const json = (await response.json()) as ApiEnvelope<T> & {
    error?: { message?: string };
  };

  if (!response.ok || !json.success) {
    throw new HttpError(json.error?.message ?? 'Request failed', response.status);
  }

  return json.data;
};

export const api = {
  products: (query: string) => request<Paginated<Product>>(`/products${query}`),
  productDetails: (idOrSlug: string) => request<Product>(`/products/${idOrSlug}`),
  categories: () => request<Category[]>('/products/categories'),

  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) =>
    request<UserProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<UserProfile>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request<{ loggedOut: boolean }>('/auth/logout', {
      method: 'POST',
    }),

  me: () => request<UserProfile>('/auth/me'),

  profile: () => request<UserProfile>('/users/me'),

  updateProfile: (payload: {
    firstName: string;
    lastName: string;
    phone?: string | null;
    address?: {
      line1: string;
      line2?: string | null;
      city: string;
      country: string;
      postalCode: string;
    } | null;
  }) =>
    request<UserProfile>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  cart: () => request<Cart>('/cart'),

  addCartItem: (payload: { productId: string; quantity: number }) =>
    request<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateCartItem: (id: string, quantity: number) =>
    request<Cart>(`/cart/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  deleteCartItem: (id: string) =>
    request<Cart>(`/cart/items/${id}`, {
      method: 'DELETE',
    }),

  createOrder: (payload: {
    shippingAddress: {
      line1: string;
      line2?: string | null;
      city: string;
      country: string;
      postalCode: string;
    };
    currency?: string;
  }) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  myOrders: (query = '') => request<Paginated<Order>>(`/orders/me${query}`),
  myOrderDetails: (id: string) => request<Order>(`/orders/me/${id}`),

  adminSummary: () => request<AdminDashboardSummary>('/admin/dashboard/summary'),
  adminCategories: () => request<Category[]>('/admin/categories'),
  adminProducts: (query = '') => request<Paginated<Product>>(`/admin/products${query}`),
  adminCreateProduct: (payload: {
    name: string;
    slug?: string;
    description: string;
    price: number;
    stockQuantity: number;
    imageUrl: string;
    isActive: boolean;
    categoryId: string;
  }) =>
    request<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminUpdateProduct: (
    id: string,
    payload: {
      name: string;
      slug?: string;
      description: string;
      price: number;
      stockQuantity: number;
      imageUrl: string;
      isActive: boolean;
      categoryId: string;
    },
  ) =>
    request<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  adminDeleteProduct: (id: string) =>
    request<{ deleted: boolean }>(`/admin/products/${id}`, {
      method: 'DELETE',
    }),

  adminOrders: (query = '') => request<Paginated<Order>>(`/admin/orders${query}`),
  adminOrderDetails: (id: string) => request<Order>(`/admin/orders/${id}`),
  adminUpdateOrderStatus: (id: string, status: string) =>
    request<Order>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  adminInventoryLowStock: (query = '') =>
    request<AdminInventoryResponse>(`/admin/inventory/low-stock${query}`),
  adminSalesAnalytics: (query = '') => request<AdminSalesAnalytics>(`/admin/analytics/sales${query}`),
};

export { HttpError };
