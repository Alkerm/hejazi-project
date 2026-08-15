# 🇸🇦 AWS Lightsail (Riyadh) Staging & Production Deployment Guide
**Hejazi Cosmetics Commercial E-Commerce Platform**

This document provides a complete guide for deploying both **Staging (Testing)** and **Production (Live)** environments for **Hejazi Cosmetics** on **AWS Lightsail** in **Riyadh, Saudi Arabia** (`me-central-1`).

---

## 1. Multi-Environment Architecture Strategy

| Feature | 🧪 Phase 1: Staging (Testing Environment) | 🚀 Phase 2: Production (Live Store) |
| :--- | :--- | :--- |
| **Frontend Web URL** | `https://staging.yourdomain.com` | `https://yourdomain.com` |
| **Backend API URL** | `https://staging-api.yourdomain.com` | `https://api.yourdomain.com` |
| **Database** | `hejazidb_staging` | `hejazidb` |
| **Internal Docker Ports** | Web: `3001` \| API: `4001` | Web: `3000` \| API: `4000` |
| **Payment Gateway** | Moyasar **Test Sandbox** (`sk_test_...`) | Moyasar **Live Merchant** (`sk_live_...`) |
| **Access Control** | 🔒 **Password Protected** (Nginx HTTP Basic Auth) | 🌐 Publicly Accessible |
| **SEO Indexing** | 🚫 Blocked (`X-Robots-Tag: noindex, nofollow`) | ✅ Allowed & SEO Optimized |

---

## 2. Server Provisioning & DNS Setup

### A. AWS Lightsail Instance (Riyadh)
- **Region**: Middle East (Saudi Arabia) - Riyadh (`me-central-1`)
- **OS**: Ubuntu 24.04 LTS
- **Plan**: $10/mo (2 vCPU / 2 GB RAM / 60 GB SSD)
- **Static Public IP**: Attach a Static IP in the Lightsail **Networking** tab.
- **Firewall Ports**: Ensure SSH (22), HTTP (80), and HTTPS (443) are open.

### B. Domain DNS Configuration
Add these A Records in your domain manager (e.g. GoDaddy, Namecheap, Cloudflare, Sahaba):

| Record Type | Host / Name | Target / Value | Purpose |
| :--- | :--- | :--- | :--- |
| **A Record** | `staging` | `YOUR_STATIC_PUBLIC_IP` | Staging Web (`staging.yourdomain.com`) |
| **A Record** | `staging-api` | `YOUR_STATIC_PUBLIC_IP` | Staging API (`staging-api.yourdomain.com`) |
| **A Record** | `@` *(Phase 2)* | `YOUR_STATIC_PUBLIC_IP` | Production Web (`yourdomain.com`) |
| **A Record** | `www` *(Phase 2)* | `YOUR_STATIC_PUBLIC_IP` | Production Web Subdomain (`www.yourdomain.com`) |
| **A Record** | `api` *(Phase 2)* | `YOUR_STATIC_PUBLIC_IP` | Production API (`api.yourdomain.com`) |

---

## 3. 🧪 Phase 1: Deploying the Staging (Testing) Environment

### Step 1: Server Dependencies & Project Setup
SSH into your server:
```bash
ssh ubuntu@YOUR_STATIC_PUBLIC_IP
```

Install Docker, Nginx, and Apache Utilities (for password generation):
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git nginx certbot python3-certbot-nginx apache2-utils
sudo systemctl enable --now docker nginx
```

Clone the repository:
```bash
sudo mkdir -p /var/www/hejazi
sudo chown -R ubuntu:ubuntu /var/www/hejazi
git clone <YOUR_GIT_REPOSITORY_URL> /var/www/hejazi
cd /var/www/hejazi
```

### Step 2: Create Staging Credentials & Password Protection
Generate a username & password to restrict access to `staging.yourdomain.com`:
```bash
# Enter desired password when prompted
sudo htpasswd -c /etc/nginx/.htpasswd admin
```

Create Staging environment file (`.env.staging`):
```bash
nano .env.staging
```
Paste staging variables:
```env
POSTGRES_USER=hejazi_staging_user
POSTGRES_PASSWORD=your_staging_password
POSTGRES_DB=hejazidb_staging

DATABASE_URL="postgresql://hejazi_staging_user:your_staging_password@staging-postgres:5432/hejazidb_staging?sslmode=disable"
REDIS_URL="redis://staging-redis:6379"

COOKIE_SECRET="staging_secret_key_random_64_chars"
CORS_ORIGIN="https://staging.yourdomain.com"
FRONTEND_URL="https://staging.yourdomain.com"
NEXT_PUBLIC_API_BASE_URL="https://staging-api.yourdomain.com/api/v1"

# Moyasar TEST Keys
MOYASAR_SECRET_KEY="sk_test_your_test_key"
MOYASAR_WEBHOOK_SECRET="whsec_your_test_webhook_secret"
```

### Step 3: Launch Staging Docker Containers & Database Migration
```bash
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d --build
```
Run database migrations and seed reference products:
```bash
docker exec -it hejazi-staging-api npx prisma migrate deploy
docker exec -it hejazi-staging-api npx prisma db seed
```

### Step 4: Configure Staging Nginx & SSL Certificate
```bash
sudo cp /var/www/hejazi/nginx/staging.conf /etc/nginx/sites-available/staging
sudo sed -i 's/YOUR_DOMAIN.com/yourdomain.com/g' /etc/nginx/sites-available/staging
sudo ln -s /etc/nginx/sites-available/staging /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
Obtain free SSL certificate:
```bash
sudo certbot --nginx -d staging.yourdomain.com -d staging-api.yourdomain.com
```

Now visiting `https://staging.yourdomain.com` will prompt for username/password (`admin`)!

---

## 4. 🚀 Phase 2: Deploying Production (When Ready for Launch)

When testing is complete and you are ready to open your store to real customers:

1. Create production `.env`:
   ```bash
   nano .env
   ```
   *(Fill in live Moyasar merchant keys and `yourdomain.com` URLs).*

2. Launch production stack:
   ```bash
   docker-compose up -d --build
   docker exec -it hejazi-api npx prisma migrate deploy
   docker exec -it hejazi-api npx prisma db seed
   ```

3. Enable production Nginx configuration:
   ```bash
   sudo cp /var/www/hejazi/nginx/hejazi.conf /etc/nginx/sites-available/hejazi
   sudo sed -i 's/YOUR_DOMAIN.com/yourdomain.com/g' /etc/nginx/sites-available/hejazi
   sudo ln -s /etc/nginx/sites-available/hejazi /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
   ```

---

## 📂 Summary of Infrastructure Files

- **Staging Docker Stack**: [`docker-compose.staging.yml`](file:///c:/Users/abdul/OneDrive/سطح%20المكتب/hejazi/docker-compose.staging.yml)
- **Staging Nginx & Password Config**: [`nginx/staging.conf`](file:///c:/Users/abdul/OneDrive/سطح%20المكتب/hejazi/nginx/staging.conf)
- **Production Docker Stack**: [`docker-compose.yml`](file:///c:/Users/abdul/OneDrive/سطح%20المكتب/hejazi/docker-compose.yml)
- **Production Nginx Config**: [`nginx/hejazi.conf`](file:///c:/Users/abdul/OneDrive/سطح%20المكتب/hejazi/nginx/hejazi.conf)
