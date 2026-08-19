export interface Category {
  id: string;
  name: string;
  arabicName?: string | null;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  arabicName?: string | null;
  slug: string;
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

export interface DriverAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: 'DRIVER';
  createdAt: string;
  _count?: {
    driverOrders: number;
  };
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  nationalId?: string | null;
  marketingConsent: boolean;
  role: 'USER' | 'ADMIN' | 'DRIVER';
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
  driverId?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  assignedAt?: string | null;
  deliveredAt?: string | null;
  customerNameSnapshot?: string | null;
  customerPhoneSnapshot?: string | null;
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
    phone?: string | null;
  };
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  } | null;
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
  periodType: 'MONTH' | 'YEAR' | 'ALL_TIME' | 'CUSTOM' | 'DAYS';
  periodLabel: {
    en: string;
    ar: string;
  };
  selectedYear?: number;
  selectedMonth?: number;
  startDate?: string | null;
  endDate?: string | null;
  totalRevenue: number;
  totalOrders: number;
  totalUnitsSold: number;
  averageOrderValue: number;
  previousPeriodRevenue?: number | null;
  growthRate?: number | null;
  topProducts: Array<{
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    userId: string;
    customerName: string;
    email: string | null;
    ordersCount: number;
    totalSpent: number;
  }>;
  paymentMethods: Array<{
    method: string;
    label: string;
    revenue: number;
    ordersCount: number;
    percentage: number;
  }>;
  timeline: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
  periodDays?: number;
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

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  createdAt: string;
  product: Product;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string | null;
  isApproved: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
  };
}

export interface ProductReviewsSummaryResponse {
  reviews: Review[];
  hasPurchased?: boolean;
  userReview?: Review | null;
  summary: {
    totalReviews: number;
    averageRating: number;
    breakdown: Record<number, number>;
  };
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface AppliedCouponResponse {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  discountAmount: number;
  newSubtotal: number;
}

export interface SupportTicket {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminNote?: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface CustomerDirectoryItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: 'USER' | 'ADMIN' | 'DRIVER';
  marketingConsent: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  city?: string | null;
  country?: string | null;
  addressSummary?: string | null;
}

export interface TopCustomerItem {
  userId: string;
  customerName: string;
  email: string;
  phone?: string | null;
  totalSpent: number;
  ordersCount: number;
  city?: string | null;
}

export interface AdminCustomersOverviewResponse {
  metrics: {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    marketingConsentedCount: number;
    activeBuyersCount: number;
  };
  topBySpending: TopCustomerItem[];
  topByOrders: TopCustomerItem[];
  directory: {
    items: CustomerDirectoryItem[];
    meta: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AdminBroadcastEmailPayload {
  audience: 'ALL' | 'MARKETING_ONLY' | 'VIP_ONLY';
  subject: string;
  title: string;
  message: string;
  callToActionUrl?: string;
  callToActionLabel?: string;
}

export interface AdminBroadcastEmailResponse {
  success: boolean;
  recipientCount: number;
  audience: 'ALL' | 'MARKETING_ONLY' | 'VIP_ONLY';
  subject: string;
  title: string;
  sentAt: string;
  sampleRecipients: string[];
}

export interface ProductFinancialItem {
  id: string;
  name: string;
  arabicName?: string | null;
  slug: string;
  sku?: string | null;
  imageUrl: string;
  isActive: boolean;
  category: Category;
  price: number;
  costPrice: number;
  unitProfit: number;
  marginPercentage: number;
  stockQuantity: number;
  stockCostValue: number;
  stockRetailValue: number;
  stockPotentialProfit: number;
  unitsSold: number;
  realizedRevenue: number;
  realizedProfit: number;
}

export interface AdminFinancialOverviewResponse {
  metrics: {
    totalRevenue: number;
    totalCostOfGoodsSold: number;
    netRealizedProfit: number;
    overallMarginPercentage: number;
    inventoryTotalCostValue: number;
    inventoryTotalRetailValue: number;
    expectedInventoryProfit: number;
    totalOrdersCount: number;
    totalUnitsSoldAll: number;
    totalInStockUnits: number;
    activeProductsCount: number;
  };
  products: ProductFinancialItem[];
}

export interface UpdateProductFinancialsPayload {
  costPrice?: number;
  price?: number;
}

export interface StorePolicy {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  summaryEn?: string | null;
  summaryAr?: string | null;
  contentEn: string;
  contentAr: string;
  updatedAt: string;
  createdAt: string;
}

export interface UpdateStorePolicyPayload {
  titleEn: string;
  titleAr: string;
  summaryEn?: string | null;
  summaryAr?: string | null;
  contentEn: string;
  contentAr: string;
}




