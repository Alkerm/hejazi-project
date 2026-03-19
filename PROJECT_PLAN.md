# Project Plan: Hejazi Cosmetics Commerce

## Delivery Model
- Maximum phases: 3
- Current date checkpoint: 2026-03-19
- Current phase status:
  - Phase 1: Completed
  - Phase 2: Completed
  - Phase 3: In progress (non-payment completed, payment deferred)

---

## Phase 1: Foundation + Customer Storefront + Authentication
Status: Completed

### Goals
- Establish monorepo architecture and production-minded backend/frontend foundations.
- Deliver full customer flow except real payment gateway.

### Deliverables
- Project setup:
  - Monorepo with `apps/api`, `apps/web`, `packages/types`
  - TypeScript configs, env examples, workspace scripts
- Backend foundation:
  - Fastify bootstrap, plugin security stack, centralized error handling
  - Prisma/PostgreSQL setup, Redis integration
  - Env validation (Zod), logging defaults
- Authentication:
  - Register/login/logout/me
  - `httpOnly` signed cookie session backed by Redis
  - bcrypt hashing
  - role-aware auth middleware
- Customer storefront APIs:
  - products listing/details/categories with search/filter/sort/pagination
  - cart CRUD with stock validation
  - user profile get/update
  - user orders list/details
- Checkout/order foundation (without payment provider):
  - create order from cart
  - backend recalculates totals from DB prices
  - stock decrement with transaction-safe logic
  - paymentStatus initialized as `UNPAID`
- Seed data:
  - admin + customer users
  - sample categories and cosmetic products

### Acceptance Criteria (met)
- Customer can register/login, browse products, manage cart, place order, and view order history.
- Backend never trusts frontend-submitted totals.
- Stock protection logic prevents oversell under concurrent order attempts.

---

## Phase 2: Admin Dashboard + Inventory + Orders + Analytics
Status: Completed

### Goals
- Deliver full admin management surface and operational visibility.

### Deliverables
- Admin APIs under `/api/v1/admin/*`:
  - dashboard summary
  - product CRUD
  - orders list/detail/status update
  - low-stock inventory
  - sales analytics
- Admin frontend pages:
  - `/admin`
  - `/admin/products`
  - `/admin/orders`
  - `/admin/orders/[id]`
  - `/admin/inventory`
  - `/admin/analytics`
- Audit logging:
  - logs for product create/update/delete
  - logs for order status updates
- Performance updates:
  - product cache invalidation after admin product mutations
  - pagination for admin product/order/inventory listings

### Acceptance Criteria (met)
- Admin can fully manage catalog and order status from UI.
- Dashboard and analytics show aggregated operational data.
- Low-stock and out-of-stock visibility is available.
- Key admin mutations are audit-logged.

---

## Phase 3: Payment Integration + Final Hardening + Testing
Status: In progress (payment intentionally deferred)

### Goals
- Integrate payments safely and complete production hardening and essential tests.

### Deliverables Status
- Payment architecture:
  - provider abstraction layer
  - methods: `cash_on_delivery` + one online gateway
  - status: deferred
- Payment flow:
  - create payment intent/session (backend)
  - secure payment confirmation via backend/webhook verification
  - update `paymentStatus` based only on trusted backend verification
  - status: deferred
- Order lifecycle hardening:
  - status/payment consistency rules
  - idempotency protections for payment confirmation paths
  - duplicate-processing prevention
  - status: deferred (payment-dependent)
- Security hardening:
  - production cookie/CORS tightening
  - rate-limit review and endpoint tuning
  - error response hardening and safe logging
  - status: completed (non-payment hardening implemented)
- Testing support:
  - essential automated tests for auth, cart/order, stock safety, payment confirmation
  - manual QA checklist
  - status: partial complete (auth/cart/order/stock tests complete; payment tests deferred)

### Exit Criteria (to satisfy)
- Payment status can only transition to paid from verified backend/provider signals.
- Duplicate callback/retry does not produce duplicate financial side effects.
- Core tests pass and manual checklist is documented.

---

## Current High-Priority Backlog (Payment-Only Deferred Scope)
1. Add payment models/enums needed for provider and transaction tracking.
2. Implement payment provider interface and initial adapters (COD + online).
3. Build payment endpoints and webhook verification route.
4. Add idempotency key handling for payment confirmation logic.
5. Implement order/payment state machine guardrails.
6. Add payment confirmation and idempotency tests.

---

## Validation & QA Checklist

### Functional
- User auth/profile/cart/order flows operational.
- Admin product/order/inventory/analytics flows operational.

### Correctness
- Totals computed server-side only.
- Stock checks enforced at write-time in transaction flow.

### Performance/Scalability Baseline
- Pagination on list endpoints.
- Redis cache for product reads.
- Index-backed filtering/sorting on core tables.

### Security Baseline
- bcrypt password hashing
- signed `httpOnly` auth cookies
- role-protected admin routes
- Zod input validation + centralized safe error responses

---

## Progress Log
- 2026-03-19: Phase 1 completed.
- 2026-03-19: Phase 2 completed.
- 2026-03-19: Dedicated project plan file created.
- 2026-03-19: Phase 3 non-payment hardening completed (CORS/cookies/rate-limit/error/request-id/shutdown).
- 2026-03-19: Added automated tests for auth/cart/order stock-safety paths.
