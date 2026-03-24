export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  arabicName?: string | null;
  slug: string;
  description: string;
  price: number;
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
  productStatus?: 'DRAFT' | 'COMPLIANCE_REVIEW' | 'APPROVED' | 'INACTIVE';
  imageUrl: string;
  isActive: boolean;
  category: Category;
  categoryId?: string;
}

export interface Paginated<T> {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  marketingConsent: boolean;
  role: 'USER' | 'ADMIN';
  defaultAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    country: string;
    postalCode: string;
  } | null;
}

export interface Cart {
  id: string | null;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    lineTotal: number;
    product: {
      id: string;
      name: string;
      slug: string;
      imageUrl: string;
      price: number;
      stockQuantity: number;
      isActive: boolean;
    };
  }>;
  summary: {
    subtotal: number;
    totalItems: number;
  };
}

export interface OrderItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  invoiceNumber?: string | null;
  invoiceIssuedAt?: string | null;
  refundNoteNumber?: string | null;
  refundIssuedAt?: string | null;
  subtotal: number;
  vatAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  paymentMethodLabel?: string | null;
  deliveryEstimate?: string | null;
  shippingAddressSnapshot: {
    line1: string;
    line2?: string | null;
    city: string;
    country: string;
    postalCode: string;
  };
  createdAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface AdminDashboardSummary {
  cards: {
    productsCount: number;
    lowStockCount: number;
    pendingOrdersCount: number;
    usersCount: number;
    totalRevenue: number;
    totalOrders: number;
  };
  recentOrders: Order[];
  topProducts: Array<{
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
  }>;
}

export interface AdminSalesAnalytics {
  periodDays: number;
  totalRevenue: number;
  totalOrders: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
  }>;
  salesByDay: Array<{
    day: string;
    revenue: number;
    orders: number;
  }>;
}

export interface AdminInventoryResponse extends Paginated<Product> {
  meta: Paginated<Product>['meta'] & {
    threshold: number;
    outOfStockCount: number;
  };
}

export interface AdminAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  adminUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
