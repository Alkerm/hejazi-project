# Software Requirements Specification (SRS)
## Hejazi Cosmetics E-Commerce Platform

---

### Document Overview
- **Project Name:** Hejazi Cosmetics E-Commerce Platform
- **Document Version:** 1.0.0
- **Status:** Baseline Specification & Implementation Audit
- **Target Audience:** Product Owners, Developers, QA Engineers, System Architects

---

## 1. System Vision & Scope

### 1.1 Executive Summary
Hejazi Cosmetics is a specialized commercial e-commerce web platform designed for selling cosmetic and personal care products (such as hair oils, skincare creams, body lotions, serums, and beauty accessories). The platform caters to two primary user roles:
1. **Customer (User) Front-End:** A fast, responsive, and visually appealing storefront allowing users to discover products, check ingredients/usage/warnings, manage cart/wishlist, place secure orders, and track order histories.
2. **Admin Back-End:** A management dashboard enabling administrators to oversee inventory, catalog items, order fulfillment, compliance tracking, financial analytics, system audit logs, and customer support.

### 1.2 Key Objectives
- **Commercial Excellence:** Maximize conversions with frictionless search, filtering, cart management, and seamless checkout.
- **Cosmetics-Specific Compliance:** Provide explicit product metadata tailored to cosmetics regulatory bodies (e.g., SFDA - Saudi Food & Drug Authority), including Arabic product naming, full ingredient declarations, warning labels, batch tracking, and expiry requirements.
- **Operational Efficiency:** Enable real-time inventory tracking, low-stock warnings, order lifecycle transitions, and administrative audit logging.
- **Robust Security & Scalability:** Enforce strict server-side validation, role-based access control (RBAC), secure cookie authentication, Redis-backed sessions/caching, and transaction-safe order placement.

---

## 2. User Roles & Access Hierarchy

| Role | Description | Access Rights | Status |
| :--- | :--- | :--- | :--- |
| **Guest / Anonymous User** | Unauthenticated site visitor | Browse catalog, view product details, search/filter, view policies. | `[x] Implemented` |
| **Registered Customer** | Authenticated shopper | Profile management, addresses, persistent cart, wishlist, order placement, order history, invoice download, reviews. | `[x] Implemented` (Cart, Profile, Orders) <br> `[ ] Pending` (Wishlist, Reviews) |
| **Store Admin / Manager** | Administrative staff | Full CRUD on products & categories, inventory adjustments, order status updates, view audit logs & financial analytics. | `[x] Implemented` |
| **Super Admin / System Lead** | Platform owner | All Admin rights plus staff RBAC management, systemic feature flags, payment & notification configurations. | `[~] Partial` (Admin role present; granular RBAC pending) |

---

## 3. Functional Requirements

### Legend
- `[x] Implemented` - Fully built in backend and frontend.
- `[~] Partially Implemented` - Foundation built or partially completed.
- `[ ] Pending / Planned` - Scheduled for upcoming implementation phases.

---

### 3.1 Customer Storefront (User Side)

#### 3.1.1 Authentication & User Account
- **FR-C01 Registration & Login:** Users can sign up with email, name, phone, and password, and log in securely. `[x] Implemented`
- **FR-C02 Session Management:** Authenticated sessions use signed `httpOnly` cookies backed by Redis for multi-device support and instant invalidation. `[x] Implemented`
- **FR-C03 Profile Management:** Users can view and update personal profile details (Name, Phone number, Marketing consent). `[x] Implemented`
- **FR-C04 Address Book:** Users can maintain multiple shipping addresses (Line 1, Line 2, City, Country, Postal Code) and select a default address. `[x] Implemented`
- **FR-C05 Password Reset & Account Recovery:** Forgot password flow via email verification token. `[x] Implemented`

#### 3.1.2 Product Catalog & Discovery
- **FR-C06 Product Listing:** Display products with pagination, responsive grid view, prices (SAR), badges, and high-resolution images. `[x] Implemented`
- **FR-C07 Category Browsing:** Filter products by categories (Hair Care, Skin Care, Lotions, Oils, etc.). `[x] Implemented`
- **FR-C08 Search & Filtering:** Instant search by product name/brand, with sorting (price low-to-high, high-to-low, newest). `[x] Implemented`
- **FR-C09 Cosmetics Metadata Display:** Product detail page shows full details:
  - English & Arabic names
  - Full Ingredients list
  - Usage instructions & Safety warnings
  - Country of origin & Manufacturer details
  - SFDA reference number `[x] Implemented`
- **FR-C10 Product Ratings & Customer Reviews:** Verified buyers can leave star ratings (1-5) and written feedback on products. `[x] Implemented`
- **FR-C11 Wishlist & Favorites:** Customers can bookmark products to a personal wishlist for later purchase. `[x] Implemented`

#### 3.1.3 Cart & Checkout Flow
- **FR-C12 Cart Operations:** Add/remove items, update quantities, clear cart. Server-side stock checking prevents adding items beyond available stock. `[x] Implemented`
- **FR-C13 Persistent Cart:** Cart items persist across user sessions for authenticated accounts. `[x] Implemented`
- **FR-C14 Checkout & Order Creation:** Convert cart into an active order. Server calculates subtotal, 15% VAT, and shipping cost. Server re-verifies stock inside an atomic database transaction. `[x] Implemented`
- **FR-C15 Promotional Coupon Code:** Input promo codes at checkout to apply percentage or fixed discounts. `[x] Implemented`
- **FR-C16 Payment Selection:** Support payment options:
  - Cash on Delivery (COD) `[~] Deferred foundation`
  - Online Payment Gateway (Mada, Credit Card, Apple Pay via Moyasar/Tap/Stripe) `[ ] Pending`

#### 3.1.4 Order History & Customer Tracking
- **FR-C17 Order History:** Customer can view past orders with order date, total price, payment status, and order status. `[x] Implemented`
- **FR-C18 Order Detail & Tax Invoice:** Detailed breakdown of items ordered, shipping address snapshot, unit prices, VAT, and printable tax invoice view. `[x] Implemented`
- **FR-C19 Order Cancellation:** Customer can cancel pending orders prior to shipping confirmation with automatic stock restoration. `[x] Implemented`

---

### 3.2 Administrative Management (Admin Side)

#### 3.2.1 Admin Dashboard & Analytics
- **FR-A01 Metric Summaries:** Overview card statistics displaying Total Revenue, Total Orders, Active Product Count, Total Customers, and Low-Stock Alert Counts. `[x] Implemented`
- **FR-A02 Sales Analytics:** Interactive charts/tables summarizing revenue trends over time, daily order volume, and top-selling cosmetic products. `[x] Implemented`

#### 3.2.2 Product & Catalog Management
- **FR-A03 Product CRUD:** Admins can create, view, edit, and deactivate/delete products. `[x] Implemented`
- **FR-A04 SFDA Compliance Data Entry:** Fields for Arabic product name, brand, ingredients, warnings, usage guidelines, origin, manufacturer, importer, and SFDA registration code. `[x] Implemented`
- **FR-A05 Product Status Lifecycle:** Products transition across states (`DRAFT` -> `COMPLIANCE_REVIEW` -> `APPROVED` -> `INACTIVE`). `[x] Implemented`
- **FR-A06 Image Management:** Local & cloud drag-and-drop image upload integration for product photos. `[x] Implemented`
- **FR-A07 Bulk Stock & Category Management:** Manage categories and perform bulk stock adjustments. `[x] Implemented`

#### 3.2.3 Order Fulfillment & Payment Management
- **FR-A08 Order List & Filter:** Admin can list, search, and filter orders by status (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) and payment status (`UNPAID`, `PAID`, `REFUNDED`). `[x] Implemented`
- **FR-A09 Order Status Transition Guardrails:** Order status transitions enforced with business validation rules (e.g., cannot ship a cancelled order). `[x] Implemented`
- **FR-A10 Payment Status & Manual Reconciliation:** Ability for admin to mark Cash on Delivery (COD) as paid upon delivery receipt or trigger payment gateway refunds. `[x] Implemented`
- **FR-A11 In-House Driver Logistics & Mobile Web Dispatch:** Drivers access `/driver` web page on phone to claim orders, navigate via 1-click Google Maps, contact customers via 1-click WhatsApp/Call, and mark deliveries completed with automatic COD payment collection. `[x] Implemented`

#### 3.2.4 Customer Support & Inquiries
- **FR-A12 Support Ticket Management:** Manage customer inquiries, product allergic reaction reports, and refund requests from an admin support queue. `[x] Implemented`
- **FR-A13 Contact Form Messages:** Receive and process inquiries submitted through the contact page. `[x] Implemented`

#### 3.2.5 Audit Logging & Security Administration
- **FR-A14 Admin Audit Trail:** Every critical administrative mutation (product creation/editing, price change, order status update, stock override) is recorded in `AdminAuditLog` with admin ID, timestamp, entity type, and metadata. `[x] Implemented`
- **FR-A15 Role-Based Access Control (RBAC):** Manage staff permissions (e.g., Inventory Manager vs Support Agent vs Super Admin). `[ ] Pending`

#### 3.2.6 Notifications & Marketing System
- **FR-A16 Transactional Emails:** Automated emails for Order Placement, Payment Receipt, Shipping Dispatch, and Order Cancellation. `[ ] Pending`
- **FR-A17 Automated Admin Alerts:** Low-stock threshold email/SMS alerts sent to inventory manager when stock drops below minimum threshold. `[ ] Pending`
- **FR-A18 Marketing Campaigns:** Broadcast email/SMS promotional messages to opted-in users (`marketingConsent = true`). `[ ] Pending`

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Scalability
- **NFR-01 Response Latency:** Public product catalog read APIs must respond within `< 100ms` for cached queries. `[x] Implemented` (Redis caching active)
- **NFR-02 Database Optimization:** Database queries utilize compound indexes on `(categoryId)`, `(isActive)`, `(status)`, `(userId)`, and `(createdAt)`. `[x] Implemented`
- **NFR-03 Stock Concurrency Safety:** Stock subtraction must occur inside serializable/atomic database transactions with check-and-decrement logic to guarantee zero overselling during flash sales. `[x] Implemented`

### 4.2 Security & Data Protection
- **NFR-04 Password Hashing:** User passwords hashed using `bcrypt` with appropriate cost factor. `[x] Implemented`
- **NFR-05 Session Security:** Auth tokens stored strictly in `httpOnly`, `sameSite=lax` signed cookies to prevent XSS session hijacking. `[x] Implemented`
- **NFR-06 Input Validation:** All API endpoints validate request bodies, query params, and route params using strict `Zod` schemas before hitting business logic. `[x] Implemented`
- **NFR-07 Rate Limiting:** API routes protected against brute-force and DDoS attacks via Fastify rate-limiting middleware. `[x] Implemented`
- **NFR-08 OWASP Hardening:** CORS restrictions, Security Headers (Helmet), and central error handler (preventing internal stack trace leakage in production). `[x] Implemented`

### 4.3 Regulatory & Cosmetics Compliance
- **NFR-09 SFDA Compliance:** Data model stores mandatory cosmetic compliance fields (Ingredients, Warnings, Usage, Country of Origin, SFDA ref). `[x] Implemented`
- **NFR-10 Tax Compliance:** Prices display in SAR (Saudi Riyal) and breakdown 15% VAT explicitly on invoices and checkout totals. `[x] Implemented`

### 4.4 Usability & Accessibility
- **NFR-11 Bilingual Support:** Support Arabic and English UI rendering, currency formatting (SAR / ر.س), and Arabic product title display (`arabicName`). `[x] Implemented`
- **NFR-12 Mobile Responsiveness:** UI built using modern responsive layouts tailored for mobile browsers and tablets. `[x] Implemented`

---

## 5. Third-Party Integrations Requirements

| Integration Type | Target Service / Provider | Purpose | Status |
| :--- | :--- | :--- | :--- |
| **Payment Gateway** | Moyasar / Tap Payments / Stripe / Mada | Online credit card, Mada, Apple Pay processing with webhook verification. | `[ ] Pending` |
| **Email Service** | Nodemailer / Resend / AWS SES / SendGrid | Transactional emails (Order confirmation, invoices, password reset). | `[ ] Pending` |
| **SMS / WhatsApp Gateway** | Twilio / Unifonic | Order OTP verification and instant shipping notifications. | `[ ] Pending` |
| **Cloud Media Storage** | AWS S3 / Cloudinary | Uploading high-res cosmetic product images & banners securely. | `[ ] Pending` |
| **Shipping Provider API** | Aramex / SMSA Express / SPL API | Automated shipping label generation & live shipment tracking. | `[ ] Pending` |

---

## 6. Implementation Status Matrix Summary

| Domain | Total Features | Implemented `[x]` | Partially Implemented `[~]` | Pending `[ ]` |
| :--- | :---: | :---: | :---: | :---: |
| **Customer Auth & Account** | 5 | 4 | 0 | 1 |
| **Catalog & Product Discovery** | 6 | 4 | 0 | 2 |
| **Cart & Checkout Flow** | 5 | 3 | 1 | 1 |
| **Customer Orders & Invoices** | 3 | 2 | 0 | 1 |
| **Admin Dashboard & Analytics** | 2 | 2 | 0 | 0 |
| **Admin Product Management** | 5 | 4 | 0 | 1 |
| **Admin Order & Fulfillment** | 4 | 2 | 1 | 1 |
| **Customer Support System** | 2 | 0 | 1 | 1 |
| **Audit Logging & Security** | 2 | 1 | 1 | 0 |
| **Notifications & Marketing** | 3 | 0 | 0 | 3 |
| **Third-Party Integrations** | 5 | 0 | 0 | 5 |
| **TOTALS** | **42** | **22** | **4** | **16** |

---

## 7. Next Steps & Implementation Strategy
To bring Hejazi Cosmetics from the current solid foundation to a 100% feature-complete commercial platform, the remaining items are structured into targeted work packages:
1. **Package 1: Payment Gateway Integration & Webhooks** (Moyasar/Stripe/Tap + COD reconciliation)
2. **Package 2: Notification & Communication System** (Email with Nodemailer/Resend, SMS/WhatsApp order alerts)
3. **Package 3: Reviews, Ratings & Wishlist** (Customer engagement & product social proof)
4. **Package 4: Cloud Media Storage & Image Upload** (AWS S3 / Cloudinary for product image upload)
5. **Package 5: Promotional Coupons & Discounts** (Checkout coupon codes & campaign engine)
6. **Package 6: Customer Support Ticket System & Password Reset** (Contact tickets & account recovery)
