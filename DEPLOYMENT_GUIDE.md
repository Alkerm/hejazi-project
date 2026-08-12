# 🚀 Production Deployment & Hosting Guide
**Hejazi Cosmetics Commercial E-Commerce Platform**

This document provides a clean, zero-headache deployment blueprint designed specifically for **Hejazi Cosmetics**. It outlines recommended fully-managed hosting providers, total monthly cost breakdowns, live onboarding steps, and **Saudi Arabian legal & regulatory compliance requirements**.

---

## 1. Cost & Hosting Strategy Overview

### Core Objective
Select a **100% fully-managed hosting architecture** where the provider handles server operating system security, database backups, uptime monitoring, and SSL certificates, allowing you to focus 100% on growing your cosmetics business.

### Recommended Architecture Components
- **Frontend App (`apps/web`)**: Next.js 15 App Router.
- **Backend API (`apps/api`)**: Fastify 5 Node.js API server (Port 4000).
- **Database**: PostgreSQL with Prisma ORM.
- **Cache & Sessions**: Redis.

---

## 2. Recommended Managed Hosting Options & Monthly Cost Comparison

### Option 1: Managed Container PaaS (Render.com - Recommended) ⭐
- **Architecture**: Fully-managed container services connected directly to your GitHub repository. Every time you push code changes to GitHub, Render automatically builds and deploys your application.
- **Why this option?**:
  - **Zero Server Management**: No Linux terminal commands, OS security patches, or server maintenance required.
  - **100% Predictable Fixed Price**: Dedicated hardware resources allocated for a flat rate.
- **Monthly Cost Breakdown**:
  - Web Service (`apps/web` Next.js): **$7.00/mo**
  - Web Service (`apps/api` Fastify API): **$7.00/mo**
  - Managed PostgreSQL Database: **$7.00/mo**
  - Managed Redis Instance: **$5.00/mo**
- **Total Monthly Cost**: **$26.00 / month (Fixed)**

---

### Option 2: Serverless Cloud Stack (Vercel + Neon + Upstash)
- **Architecture**:
  - Frontend hosted on **Vercel** (Serverless Edge Functions).
  - API hosted on **Render** or **AWS Lambda**.
  - Database on **Neon.tech** or **Supabase Serverless Postgres**.
  - Redis on **Upstash Serverless Redis**.
- **Cost Breakdown**:
  - Vercel Frontend: **$0.00** (Free Tier) to **$20.00/mo** (Pro Tier).
  - Fastify API Server (Render Web Service): **$7.00/mo**.
  - Serverless Postgres (Neon / Supabase): **$0.00** (Free Tier) to **$19.00/mo**.
  - Serverless Redis (Upstash): **$0.00** (Free Tier up to 10k requests/day) to **$10.00/mo**.
- **Cost Predictability**: Variable (Pay-as-you-go based on bandwidth and database reads/writes).
- **Total Monthly Cost**:
  - **Starter / Low Traffic**: **$0.00 – $7.00 / month**
  - **Growth / High Traffic**: **$39.00 – $70.00+ / month (Variable)**

---

### 📊 Hosting Options Summary Table

| Option | Provider | Maintenance Required | Cost Predictability | Monthly Total Cost | Best For |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Option 1 (Render PaaS)** ⭐ | **Render.com** | **Zero** (100% Provider Managed) | **100% Fixed** | **$26.00 / mo** | Best overall: Zero headaches & fixed budget |
| **Option 2 (Serverless)** | Vercel + Neon | **Zero** (100% Provider Managed) | **Variable** (Pay-as-you-go) | **$0 – $70+ / mo** | Low initial cost, scales with traffic |

---

## 3. Production Environment Variables Checklist

Set these production keys in your Render / Vercel dashboard (`.env`):

### Backend API (`apps/api/.env`)
```env
NODE_ENV=production
PORT=4000
HOST=0.0.0.0
TRUST_PROXY=true

# Database & Redis (Provided automatically by Render)
DATABASE_URL="postgresql://user:password@render-db-host:5432/hejazidb?sslmode=require"
REDIS_URL="rediss://default:password@render-redis-host:6379"

# Security Secrets
COOKIE_SECRET="generate-a-strong-random-64-character-secret-key"
SESSION_TTL=604800

# Domain & CORS Settings
CORS_ORIGIN="https://hejazicosmetics.com"
FRONTEND_URL="https://hejazicosmetics.com"

# Payment Gateway (Moyasar / Tap Keys)
PAYMENT_GATEWAY_PROVIDER="moyasar"
MOYASAR_SECRET_KEY="sk_live_your_actual_moyasar_secret_key"
MOYASAR_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Transactional Email (Resend / SMTP)
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_123456789_your_key"
FROM_EMAIL="orders@hejazicosmetics.com"
```

### Frontend Web (`apps/web/.env`)
```env
NEXT_PUBLIC_API_BASE_URL="https://api.hejazicosmetics.com/api/v1"
```

---

## 4. Live Third-Party Onboarding Steps

1. **Saudi Payment Gateway Activation (Moyasar / Tap)**:
   - Register a commercial merchant account at [Moyasar.com](https://moyasar.com) using your Commercial Registration (CR).
   - Obtain your `sk_live_...` secret key for Mada, Apple Pay, and Credit Cards.
   - Configure webhook URL: `https://api.hejazicosmetics.com/api/v1/payments/webhook`.

2. **Domain Name & Free SSL**:
   - Register your domain (`hejazicosmetics.com` or `hejazi.sa`).
   - Add your domain to Render.com. Free SSL certificates are issued automatically.

3. **Transactional Email Service**:
   - Sign up at [Resend.com](https://resend.com) or use an SMTP provider.
   - Add domain DNS records (SPF, DKIM, DMARC) for `hejazicosmetics.com`.

---

## 5. Legal, Regulatory & Saudi Compliance Requirements ⚖️🇸🇦

To operate a legal, compliant commercial e-commerce cosmetics business in Saudi Arabia:

### A. Commercial Registration & E-Commerce Licensing (Ministry of Commerce)
- **Commercial Registration (CR - سجل تجاري)**: Must list e-commerce retail of cosmetics (`تجارة التجزئة لمستحضرات التجميل`).
- **Saudi Business Center (المركز السعودي للأعمال)**: Mandatory registration on the SBC platform to obtain the verified merchant QR badge.
- **Storefront Display Requirements**: Your website footer must display:
  - Commercial Registration (CR) Number.
  - Tax Registration Number (VAT / الرقم الضريبي).
  - Official business contact email & phone number.
  - Customer Return & Refund Policy (سياسة الاسترجاع والاستبدال).

---

### B. Personal Data Protection Law (PDPL - نظام حماية البيانات الشخصية)
- **Data Sovereignty & Privacy**: The Saudi Data & AI Authority (SDAIA) regulates personal data storage for Saudi citizens:
  - **Consent**: Explicit user consent during registration (marketing consent checkbox implemented in `FR-C01`).
  - **Right to Rectification & Deletion**: Customers can view, update, or request deletion of profile data (implemented in `FR-C03`).
  - **Data Retention**: Customer order and invoice data stored securely with encrypted database connections (SSL/TLS).

---

### C. SFDA Cosmetics Compliance (الهيئة العامة للغذاء والدواء)
The Saudi Food & Drug Authority enforces strict cosmetic product safety regulations:
- **e-Cosma System Registration**: All cosmetic products (hair oils, creams, lotions, serums) must be notified in the SFDA e-Cosma portal.
- **Storefront Product Data Display**: The product detail view (`/products/[slug]`) must display:
  - Full Ingredients List (المكونات).
  - Warnings & Precautions (التحذيرات والاحتياطات).
  - Directions for Use (طريقة الاستخدام).
  - Country of Origin & Manufacturer (بلد الصنع والشركة المصنعة).
  - SFDA Notification Reference Number.
- **Batch Tracking**: Production batches and expiry dates trackable for safety recalls.

---

### D. Tax & ZATCA Compliance (هيئة الزكاة والضريبة والجمارك)
- **15% Value Added Tax (VAT)**: All order subtotals calculate and display 15% VAT explicitly (implemented in checkout & order services).
- **Simplified Tax Invoice (الفاتورة الضريبية المبسطة)**: Customer order confirmation views (`/orders/[id]`) generate a tax invoice showing:
  - Invoice Number & Date.
  - Store Name & VAT Number.
  - Line items breakdown with VAT amount and shipping fee.

---

### E. Consumer Rights & Delivery SLA Regulations
- **Order Cancellation Right**: Customers are legally entitled to cancel their order if delivery is delayed beyond 15 days, or prior to dispatch (implemented in `FR-C19`).
- **Clear Contact Channels**: Direct channel for customer complaints and allergic reaction reports (implemented in `/complaints-contact` & Admin Support queue).
