import type {
  AdminDashboardSummary,
  AdminAuditLog,
  AdminInventoryResponse,
  AdminSalesAnalytics,
  ApiEnvelope,
  Cart,
  Category,
  DriverAccount,
  Order,
  Paginated,
  Product,
  UserProfile,
  Wishlist,
  Review,
  ProductReviewsSummaryResponse,
  Coupon,
  AppliedCouponResponse,
  SupportTicket,
  AdminCustomersOverviewResponse,
  AdminBroadcastEmailPayload,
  AdminBroadcastEmailResponse,
  AdminFinancialOverviewResponse,
  ProductFinancialItem,
  UpdateProductFinancialsPayload,
  StorePolicy,
  UpdateStorePolicyPayload,
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
  const headers = new Headers(init?.headers ?? undefined);

  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('halflink_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers,
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

  register: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    marketingConsent: boolean;
  }) => {
    const res = await request<UserProfile & { token?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('halflink_token', res.token);
    }
    return res;
  },

  login: async (payload: { email: string; password: string }) => {
    const res = await request<UserProfile & { token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('halflink_token', res.token);
    }
    return res;
  },

  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('halflink_token');
    }
    return request<{ loggedOut: boolean }>('/auth/logout', {
      method: 'POST',
    });
  },

  me: () => request<UserProfile>('/auth/me'),

  profile: () => request<UserProfile>('/users/me'),

  deleteAccount: () =>
    request<{ success: boolean; message: string }>('/users/me', {
      method: 'DELETE',
    }),

  updateProfile: (payload: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string | null;
    nationalId?: string | null;
    marketingConsent?: boolean;
    currentPassword?: string;
    newPassword?: string;
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
    customerName?: string;
    customerPhone?: string;
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
  adminCreateCategory: (payload: { name: string; arabicName?: string | null; slug?: string }) =>
    request<Category>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminProducts: (query = '') => request<Paginated<Product>>(`/admin/products${query}`),
  adminProductDetails: (id: string) => request<Product>(`/admin/products/${id}`),
  adminCreateProduct: (payload: {
    name: string;
    arabicName?: string | null;
    slug?: string;
    description: string;
    arabicDescription?: string | null;
    price: number;
    costPrice?: number;
    stockQuantity: number;
    sku?: string | null;
    brand?: string | null;
    ingredients?: string | null;
    warnings?: string | null;
    usageInstructions?: string | null;
    countryOfOrigin?: string | null;
    manufacturer?: string | null;
    importerResponsible?: string | null;
    sfdaReference?: string | null;
    batchNumberRequired?: boolean;
    expiryDateRequired?: boolean;
    productStatus: 'DRAFT' | 'COMPLIANCE_REVIEW' | 'APPROVED' | 'INACTIVE';
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
      arabicName?: string | null;
      slug?: string;
      description: string;
      arabicDescription?: string | null;
      price: number;
      costPrice?: number;
      stockQuantity: number;
      sku?: string | null;
      brand?: string | null;
      ingredients?: string | null;
      warnings?: string | null;
      usageInstructions?: string | null;
      countryOfOrigin?: string | null;
      manufacturer?: string | null;
      importerResponsible?: string | null;
      sfdaReference?: string | null;
      batchNumberRequired?: boolean;
      expiryDateRequired?: boolean;
      productStatus: 'DRAFT' | 'COMPLIANCE_REVIEW' | 'APPROVED' | 'INACTIVE';
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
  adminAdjustProductStock: (
    productId: string,
    payload: { quantityToAdd: number; costPrice?: number; note?: string },
  ) =>
    request<{
      product: Product;
      previousStock: number;
      quantityAdded: number;
      newStock: number;
    }>(`/admin/inventory/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  adminUploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to upload image');
    }
    const json = await res.json();
    return json.data as { filename: string; mimetype: string; url: string };
  },
  adminSalesAnalytics: (query = '') => request<AdminSalesAnalytics>(`/admin/analytics/sales${query}`),
  adminAuditLogs: (query = '') => request<Paginated<AdminAuditLog>>(`/admin/audit-logs${query}`),

  wishlist: () => request<Wishlist>('/wishlist'),
  toggleWishlist: (productId: string) =>
    request<{ isWishlisted: boolean; wishlist: Wishlist }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  productReviews: (productId: string) =>
    request<ProductReviewsSummaryResponse>(`/reviews/products/${productId}`),
  submitReview: (payload: { productId: string; rating: number; comment?: string }) =>
    request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminReviews: () => request<Review[]>('/reviews/admin'),
  adminModerateReview: (id: string, isApproved: boolean) =>
    request<Review>(`/reviews/admin/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ isApproved }),
    }),

  applyCoupon: (code: string, subtotal: number) =>
    request<AppliedCouponResponse>('/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
  adminCoupons: () => request<Coupon[]>('/coupons/admin'),
  adminCreateCoupon: (payload: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    expiresAt?: string;
    usageLimit?: number;
  }) =>
    request<Coupon>('/coupons/admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminToggleCoupon: (id: string, isActive: boolean) =>
    request<Coupon>(`/coupons/admin/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  submitContactTicket: (payload: { name: string; email: string; subject: string; message: string }) =>
    request<SupportTicket>('/support/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminTickets: () => request<SupportTicket[]>('/support/admin'),
  adminUpdateTicketStatus: (id: string, status: string, adminNote?: string) =>
    request<SupportTicket>(`/support/admin/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNote }),
    }),

  forgotPassword: (email: string) =>
    request<{ success: boolean; message: string; token?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (payload: { token: string; newPassword: string }) =>
    request<{ success: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cancelOrder: (id: string) =>
    request<Order>(`/orders/me/${id}/cancel`, {
      method: 'POST',
    }),
  adminUpdatePaymentStatus: (id: string, paymentStatus: string) =>
    request<Order>(`/admin/orders/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentStatus }),
    }),

  adminGetRegisteredDrivers: () => request<DriverAccount[]>('/driver/admin/list'),
  adminCreateDriver: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) =>
    request<DriverAccount>('/driver/admin/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminAssignRegisteredDriver: (id: string, driverId: string) =>
    request<Order>(`/driver/admin/assign/${id}`, {
      method: 'POST',
      body: JSON.stringify({ driverId }),
    }),
  adminGetDeliveryOverview: () => request<Order[]>('/driver/admin/overview'),

  getAvailableDeliveries: () => request<Order[]>('/driver/available'),
  getMyAssignedDeliveries: (driverIdentifier?: string) =>
    request<Order[]>(
      `/driver/my-deliveries?driverId=${encodeURIComponent(
        driverIdentifier || 'Driver'
      )}&driverName=${encodeURIComponent(driverIdentifier || 'Driver')}`
    ),
  assignDriver: (id: string, driverName: string, driverPhone?: string) =>
    request<Order>(`/driver/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ driverName, driverPhone }),
    }),
  completeDelivery: (id: string, driverName?: string) =>
    request<Order>(`/driver/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ driverName }),
    }),

  createPaymentIntent: (payload: { orderId: string; paymentMethod: string }) =>
    request<{
      paymentStatus: string;
      paymentMethod: string;
      transactionId?: string;
      gatewayReference?: string;
      clientSecret?: string;
      redirectUrl?: string | null;
    }>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyPayment: (payload: {
    orderId: string;
    paymentMethod: string;
    transactionId?: string;
    gateway?: string;
    status: 'PAID' | 'FAILED';
    rawResponse?: Record<string, unknown>;
  }) =>
    request<{
      success: boolean;
      transaction: any;
      order: Order;
    }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminCustomersOverview: (query?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: 'spending' | 'orders' | 'newest' | 'name';
    role?: 'USER' | 'ADMIN' | 'DRIVER';
    marketingOnly?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.pageSize) params.set('pageSize', String(query.pageSize));
    if (query?.search) params.set('search', query.search);
    if (query?.sortBy) params.set('sortBy', query.sortBy);
    if (query?.role) params.set('role', query.role);
    if (query?.marketingOnly !== undefined) params.set('marketingOnly', String(query.marketingOnly));

    const qs = params.toString();
    return request<AdminCustomersOverviewResponse>(`/admin/customers${qs ? `?${qs}` : ''}`);
  },

  adminSendBroadcastEmail: (payload: AdminBroadcastEmailPayload) =>
    request<AdminBroadcastEmailResponse>('/admin/customers/broadcast-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminGetFinancials: (query?: {
    search?: string;
    categoryId?: string;
    sortBy?: 'profit' | 'margin' | 'revenue' | 'stock' | 'cost' | 'price' | 'name';
  }) => {
    const params = new URLSearchParams();
    if (query?.search) params.set('search', query.search);
    if (query?.categoryId) params.set('categoryId', query.categoryId);
    if (query?.sortBy) params.set('sortBy', query.sortBy);
    const qs = params.toString();
    return request<AdminFinancialOverviewResponse>(`/admin/financials${qs ? `?${qs}` : ''}`);
  },

  adminUpdateProductFinancials: (
    id: string,
    payload: UpdateProductFinancialsPayload
  ) =>
    request<ProductFinancialItem>(`/admin/financials/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getPolicies: () => request<StorePolicy[]>('/policies'),
  getPolicyBySlug: (slug: string) => request<StorePolicy>(`/policies/${slug}`),
  adminUpdatePolicy: (slug: string, payload: UpdateStorePolicyPayload) =>
    request<StorePolicy>(`/admin/policies/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  adminResetPolicy: (slug: string) =>
    request<StorePolicy>(`/admin/policies/${slug}/reset`, {
      method: 'POST',
    }),
};

export { HttpError };
