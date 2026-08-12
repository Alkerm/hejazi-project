# 🇸🇦 Saudi E-Commerce Legal Compliance & Server Hosting Cost Guide

This document outlines all legal requirements for operating a commercial e-commerce store in Saudi Arabia, data residency regulations (SDAIA / PDPL), and server hosting cost comparisons.

---

## 💰 1. Server Hosting Cost Comparison

| Hosting Type | Provider & Region | Server Power | Monthly Cost (USD) | Monthly Cost (SAR) | Latency to KSA |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Option A: International Fixed VPS** *(Recommended to Start)* | **Hetzner Cloud** (Frankfurt) | 2 vCPU, 4 GB RAM, 40 GB NVMe | **~$6.00 / mo** | **~22.50 SAR** | ~80 ms |
| **Option A2: International Fixed VPS** | **DigitalOcean / Linode** (EU) | 2 vCPU, 4 GB RAM, 80 GB SSD | **~$12.00 / mo** | **~45.00 SAR** | ~85 ms |
| **Option B: Local Saudi Cloud** *(100% In-Kingdom)* | **AWS Riyadh** (`me-central-1`) | 2 vCPU, 4 GB RAM instance | **~$30.00 / mo** | **~112.50 SAR** | ~10-15 ms |
| **Option B2: Local Saudi Cloud** | **Google Cloud Dammam** (`me-central2`) | e2-standard (2 vCPU, 4 GB) | **~$32.00 / mo** | **~120.00 SAR** | ~10-15 ms |

---

## ⚖️ 2. What IS Legally Required for Saudi E-Commerce?

To operate a legal, compliant commercial e-commerce store selling products (such as cosmetics) in the Kingdom of Saudi Arabia, your business must fulfill the following mandatory regulatory requirements:

### A. Commercial Registration & E-Commerce Licensing (Ministry of Commerce)
1. **Commercial Registration (CR - سجل تجاري)**:
   * Your CR activity must explicitly include online retail e-commerce (e.g. `تجارة التجزئة عن طريق الإنترنت` or `تجارة التجزئة لمستحضرات التجميل`).
2. **Saudi Business Center (المركز السعودي للأعمال - SBC)**:
   * Mandatory registration on the SBC platform to link your CR with your website domain name and receive the official **Verified Merchant QR Badge**.
3. **Mandatory Storefront Footer Displays**:
   Your website footer (or homepage) MUST display:
   * **Commercial Registration (CR) Number** (رقم السجل التجاري).
   * **VAT Tax Identification Number** (الرقم الضريبي).
   * **SBC Verified Merchant Badge / QR Code**.
   * **Customer Return & Exchange Policy** (سياسة الاسترجاع والاستبدال).
   * **Official Business Contact Details** (Email, phone number, and physical business address).

---

### B. Personal Data Protection Law (PDPL - نظام حماية البيانات الشخصية)
Regulated by the **Saudi Data & AI Authority (SDAIA)**:
1. **Data Sovereignty & Cross-Border Hosting**:
   * E-Commerce customer data (Level 1/2 commercial data) **CAN legally be hosted on international servers** (e.g. Hetzner, AWS, DigitalOcean) provided all data in transit is encrypted using **HTTPS / SSL (TLS 1.3)**.
2. **Customer Consent**:
   * Registration and checkout forms must include explicit user consent for terms of service, privacy policy, and optional marketing communications.
3. **Data Deletion & Rights**:
   * Customers must have the right to request access to, correction of, or deletion of their personal accounts.

---

### C. Tax & ZATCA Compliance (هيئة الزكاة والضريبة والجمارك)
1. **15% Value Added Tax (VAT)**:
   * If your annual sales exceed the VAT threshold (375,000 SAR), you must register with ZATCA for VAT.
   * Product prices and cart subtotals must clearly display the 15% VAT amount.
2. **Simplified Tax Invoice (الفاتورة الضريبية المبسطة)**:
   Order confirmation screens and customer email invoices must generate a simplified tax invoice containing:
   * Invoice sequential number & issue timestamp.
   * Merchant store name & VAT Registration Number.
   * Line items breakdown, shipping fees, subtotal, and 15% VAT breakdown.

---

### D. Payment Gateway & Financial Authorization
1. **Mada, Apple Pay & Credit Cards**:
   * You must register with an authorized Saudi payment gateway aggregator (such as **Moyasar**, **Tap Payments**, **PayTabs**, or **HyperPay**).
   * Aggregators link directly to your commercial bank account in Saudi Arabia.
2. **Webhooks Security**:
   * Payment confirmation webhooks must be secured with signature verification keys.

---

### E. SFDA Compliance (For Cosmetics & Health Products)
* If selling cosmetic products, items should be notified in the **Saudi Food & Drug Authority (SFDA e-Cosma)** system.
* Product pages must list full ingredients, directions for use, warnings/precautions, and country of manufacture.

---

## 💡 Summary Recommendation

1. **Hosting**: Start with **Option A (Hetzner VPS at ~$6/mo or DigitalOcean at ~$12/mo)**. It fulfills all Saudi PDPL data encryption laws at 10% of the cost of local enterprise cloud. If you grow large and require ultra-low 10ms latency, migrate to **AWS Riyadh** or **GCP Dammam** (~$30/mo).
2. **Compliance Check**: Register on the **Saudi Business Center (SBC)**, display your **CR + VAT number** on the website footer, and integrate a Saudi payment gateway like **Moyasar**.
