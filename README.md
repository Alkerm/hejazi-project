# Cosmetics E-Commerce Monorepo

Production-minded full-stack cosmetics store using:
- Frontend: Next.js (App Router) + React + TypeScript + Tailwind CSS
- Backend: Fastify + TypeScript + Prisma + PostgreSQL + Redis
- Auth: secure signed `httpOnly` cookie sessions stored in Redis

## Architecture Summary

- Monorepo with clean app separation (`apps/web`, `apps/api`) and shared package (`packages/types`).
- Backend layering: routes -> controllers -> services -> repositories -> Prisma.
- Stateless API nodes with Redis-backed session state for horizontal scaling.
- Product/category read endpoints cached in Redis for high read throughput.
- Strong backend validation via Zod on all write/read query boundaries.
- Checkout logic uses DB transaction with serializable isolation and stock-safe decrement checks to prevent overselling.
- API versioning: `/api/v1/*`.

## Folder Structure

```text
apps/
  api/
    prisma/
      schema.prisma
      seed.ts
      migrations/
    src/
      config/
      middleware/
      modules/
        auth/
        users/
        products/
        cart/
        orders/
      plugins/
      prisma/
      utils/
      app.ts
      server.ts
  web/
    app/
      (store)/
        products/
        cart/
        login/
        register/
        profile/
        orders/
      layout.tsx
      page.tsx
      globals.css
    components/
      ui/
      store/
    hooks/
    lib/
packages/
  types/
```

## Database Design (Prisma)

Implemented models and relations:
- `User`, `Address`, `Category`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`, `AdminAuditLog`
- Enums: `UserRole`, `OrderStatus`, `PaymentStatus`
- Indexes included for high-read access patterns, status filtering, and recent data ordering.

## Phase 1 Scope Implemented

### Backend
- Foundation:
  - Fastify server bootstrap, CORS, Helmet, cookie signing, global rate-limit, centralized error handling.
  - Env validation with Zod.
  - Prisma + Redis clients.
- Authentication:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
  - bcrypt password hashing.
  - Signed `httpOnly` cookie session id and Redis session store.
  - Role stored in session and `requireAuth`/`requireAdmin` middleware.
- Profile:
  - `GET /api/v1/users/me`
  - `PUT /api/v1/users/me`
- Storefront API:
  - `GET /api/v1/products`
  - `GET /api/v1/products/:idOrSlug`
  - `GET /api/v1/products/categories`
  - search/filter/sort/pagination + Redis caching.
- Cart:
  - `GET /api/v1/cart`
  - `POST /api/v1/cart/items`
  - `PUT /api/v1/cart/items/:id`
  - `DELETE /api/v1/cart/items/:id`
  - stock-aware validation on add/update.
- Orders (no payment provider yet):
  - `POST /api/v1/orders`
  - `GET /api/v1/orders/me`
  - `GET /api/v1/orders/me/:id`
  - backend total recalculation only from DB prices.
  - serializable transaction and conditional stock decrement to avoid overselling.
  - sets `paymentStatus=UNPAID`.

### Frontend
- Customer pages:
  - `/` Home
  - `/products` listing (search/filter/sort/pagination)
  - `/products/[slug]` details
  - `/cart`
  - `/login`
  - `/register`
  - `/profile`
  - `/orders`
  - `/orders/[id]`
- Reusable UI system (`Button`, `Input`, `Card`, `Badge`, `Pagination`, `Navbar`, `ProductCard`).
- Typed API client with credentialed cookie requests.

### Seed Data
- Admin user: `admin@cosmetics.local` / `Passw0rd!123`
- Customer user: `customer@cosmetics.local` / `Passw0rd!123`
- Sample categories + cosmetics products.

## Setup Instructions

### 1) Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis 6+

### 2) Install
```bash
npm install
```

### 3) Configure env files
Copy and edit:
- `apps/api/.env.example` -> `apps/api/.env`
- `apps/web/.env.example` -> `apps/web/.env.local`

### 4) Database
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5) Run apps
Terminal 1:
```bash
npm run dev:api
```
Terminal 2:
```bash
npm run dev:web
```

- API: `http://localhost:4000`
- Web: `http://localhost:3000`

## Phase 1 Manual Test Checklist

1. Register a new user and verify `auth/me` returns session user.
2. Login/logout and verify cookie session works across refresh.
3. Browse products with search/category/sort and pagination.
4. Open product details and add item to cart.
5. Update quantity in cart and verify stock limit validation.
6. Place order from cart and verify:
   - cart is cleared,
   - order is created,
   - stock is decremented,
   - payment status is `UNPAID`.
7. View order history and order detail pages.
8. Update profile fields and confirm persistence.

## Phase 2 Status
- Completed:
- Admin APIs under `/api/v1/admin/*` for dashboard, products CRUD, orders management, low-stock inventory, and sales analytics.
- Admin frontend pages:
  - `/admin`
  - `/admin/products`
  - `/admin/orders`
  - `/admin/orders/[id]`
  - `/admin/inventory`
  - `/admin/analytics`
- Admin action audit logging for product create/update/delete and order status updates.
- Product cache invalidation on admin product mutations.

## Phase 3 Non-Payment Status
- Completed:
- Final hardening updates:
  - configurable cookie security (`COOKIE_DOMAIN`, `COOKIE_SAME_SITE`)
  - stricter CORS origin handling (allowlist via `CORS_ORIGIN`)
  - configurable global/auth rate limits
  - request-id in error responses
  - graceful shutdown for API + Prisma + Redis
- Essential automated tests added (API):
  - `auth.service` tests
  - `cart.service` stock/ownership tests
  - `orders.service` cart-empty + stock-safety tests
- Test command:
  - `npm run test --workspace @cosmetics/api`

## Remaining Work (Deferred by decision)
- Payment integration only:
  - provider abstraction + COD + online payment method
  - payment confirmation/webhook verification
  - idempotent payment processing
  - order/payment lifecycle synchronization
