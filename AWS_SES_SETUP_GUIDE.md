# 📧 AWS SES Transactional Email Setup Guide
**Hejazi Cosmetics Commercial E-Commerce Platform**

This guide provides an end-to-end walkthrough for configuring **AWS Simple Email Service (SES)** to deliver transactional emails (order confirmations, invoices, password reset links, shipping alerts) with 99%+ deliverability, high security, and minimal cost.

---

## 📑 Table of Contents
1. [Why AWS SES for Hejazi?](#1-why-aws-ses-for-hejazi)
2. [Step 1: Choose Your AWS SES Region](#step-1-choose-your-aws-ses-region)
3. [Step 2: Verify Your Domain in AWS SES](#step-2-verify-your-domain-in-aws-ses)
4. [Step 3: Configure DNS Records (DKIM, SPF & DMARC)](#step-3-configure-dns-records-dkim-spf--dmarc)
5. [Step 4: Request Production Access (Exit Sandbox)](#step-4-request-production-access-exit-sandbox)
6. [Step 5: Create IAM Credentials for the API Backend](#step-5-create-iam-credentials-for-the-api-backend)
7. [Step 6: Configure Project Environment Variables](#step-6-configure-project-environment-variables)
8. [Step 7: Code Integration Architecture in Fastify](#step-7-code-integration-architecture-in-fastify)
9. [Deliverability & Spam Checklist](#deliverability--spam-checklist)

---

## 1. Why AWS SES for Hejazi?

| Feature | AWS SES Benefit |
| :--- | :--- |
| **Cost** | First **62,000 emails/month free** when sent from AWS (EC2/Lightsail/Lambda). Then **$0.10 per 1,000 emails** ($1 for 10,000). |
| **Deliverability** | Industry-standard DKIM/SPF integration prevents emails landing in Spam/Junk. |
| **Security** | Native IAM access controls; no third-party credential leakage. |
| **Bilingual** | Seamlessly supports full UTF-8 HTML templates (Arabic RTL & English LTR). |

---

## Step 1: Choose Your AWS SES Region

AWS SES is regional. For Saudi Arabia & Gulf deployments, recommended regions are:
- **Europe (Frankfurt) `eu-central-1`** *(Lowest latency to Riyadh, full SES feature set)*
- **Middle East (Bahrain) `me-south-1`**
- **Europe (Ireland) `eu-west-1`**

> [!TIP]
> Keep your SES region consistent across your configuration. We recommend **`eu-central-1`** (Frankfurt) or **`me-south-1`** (Bahrain).

---

## Step 2: Verify Your Domain in AWS SES

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/ses/).
2. In the top-right navbar, select your region (e.g. **Frankfurt `eu-central-1`**).
3. In the left navigation sidebar, navigate to **Configuration** ➔ **Identities**.
4. Click the orange **Create identity** button.
5. Choose **Domain** as the identity type:
   - **Domain**: Enter your root domain (e.g. `yourdomain.com`).
   - **Easy DKIM**: Select **Easy DKIM** with **RSA_2048_BIT**.
   - **Publish DNS records**: Check **Enabled** (if using Route 53, it can publish automatically).
6. Click **Create identity**.

---

## Step 3: Configure DNS Records (DKIM, SPF & DMARC) (next step to do!!!!!!!!)

SES will generate **3 CNAME records** for Easy DKIM. Add them along with standard SPF and DMARC TXT records in your DNS provider (Route 53, Cloudflare, GoDaddy, Sahaba, etc.):

### 1. DKIM CNAME Records (from AWS Console)
| Type | Name / Host | Value / Target |
| :--- | :--- | :--- |
| `CNAME` | `<token1>._domainkey.yourdomain.com` | `<token1>.dkim.amazonses.com` |
| `CNAME` | `<token2>._domainkey.yourdomain.com` | `<token2>.dkim.amazonses.com` |
| `CNAME` | `<token3>._domainkey.yourdomain.com` | `<token3>.dkim.amazonses.com` |

### 2. SPF Record (TXT)
Add or update the TXT record on your root domain (`@`):
| Type | Name / Host | Value |
| :--- | :--- | :--- |
| `TXT` | `@` | `v=spf1 include:amazonses.com ~all` |

*(If you already have Google Workspace or Microsoft 365, append `include:amazonses.com` inside the existing SPF string).*

### 3. DMARC Record (TXT)
Protects your domain from spoofing and guarantees high inbox placement:
| Type | Name / Host | Value |
| :--- | :--- | :--- |
| `TXT` | `_dmarc.yourdomain.com` | `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@yourdomain.com; pct=100; sp=none` |

> [!NOTE]
> DNS verification usually takes **5–15 minutes** (maximum 24–48 hours). Once verified, the Identity Status in SES will turn green (**Verified**).

---

## Step 4: Request Production Access (Exit Sandbox)

By default, all new SES accounts are in the **Sandbox** (meaning you can only send emails to pre-verified test email addresses).

### How to request Production Access:
1. In the SES Console sidebar, click **Account dashboard**.
2. Under **Sandbox status**, click **Request production access**.
3. Fill out the request form:
   - **Mail type**: `Transactional`
   - **Website URL**: `https://yourdomain.com`
   - **Use case description**: Copy and paste the template below.

#### 📋 Ready-to-use Justification Template:
```text
We operate an e-commerce platform called Hejazi Cosmetics (https://yourdomain.com). 

We will use Amazon SES strictly for critical transactional messages triggered directly by customer actions:
1. Order confirmation and digital VAT invoices
2. Account registration and password reset verification links
3. Order shipment and driver delivery status updates
4. Customer support ticket responses

We do not send unsolicited marketing emails or purchased lists. All recipients are registered customers of our store. We maintain strict bounce and complaint handling using CloudWatch/SNS notifications, and our domain is fully authenticated with DKIM, SPF, and DMARC.
```
4. Click **Submit request**. AWS typically approves this within **12–24 hours**.

---

## Step 5: Create IAM Credentials for the API Backend

Create dedicated programmatic credentials with minimal required permissions (`ses:SendEmail`, `ses:SendRawEmail`):

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/) ➔ **Users** ➔ **Create user**.
2. User name: `hejazi-ses-mailer`.
3. In permissions, choose **Attach policies directly** ➔ **Create policy** (JSON):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        }
    ]
}
```
4. Name policy `HejaziSESMailPolicy` and attach it to the user.
5. Open the newly created user ➔ **Security credentials** tab ➔ **Create access key**.
6. Select **Application running outside AWS** (or Application running on compute service).
7. Copy the **Access Key ID** and **Secret Access Key**.

---

## Step 6: Configure Project Environment Variables

Add the credentials to your environment files (`.env`, `.env.staging`, and `.env.production`):

```env
# ==============================================================================
# AWS SES Transactional Email Configuration
# ==============================================================================
AWS_SES_REGION="eu-central-1"
AWS_SES_ACCESS_KEY_ID="AKIAxxxxxxxxxxxxxx"
AWS_SES_SECRET_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Sender Addresses
EMAIL_FROM_NAME="Hejazi Cosmetics"
EMAIL_FROM_ADDRESS="orders@yourdomain.com"
EMAIL_SUPPORT_ADDRESS="support@yourdomain.com"
```

---

## Step 7: Code Integration Architecture in Fastify

### 1. Install AWS SES SDK in Backend
In `apps/api`:
```bash
npm install @aws-sdk/client-ses
```

### 2. Service Architecture (`apps/api/src/modules/mail`)
```
apps/api/src/modules/mail/
├── mail.service.ts       # Core sending logic using SES Client
├── mail.templates.ts     # HTML/text templates (Arabic RTL & English)
└── mail.types.ts         # TypeScript interfaces for payloads
```

### 3. Example Implementation Outline:

```typescript
// apps/api/src/modules/mail/mail.service.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || 'eu-central-1',
  credentials: process.env.AWS_SES_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
  } : undefined, // Uses EC2/Lightsail IAM instance profile automatically if omitted!
});

export const sendTransactionalEmail = async (params: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}) => {
  const from = `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`;

  const command = new SendEmailCommand({
    Source: from,
    Destination: {
      ToAddresses: [params.to],
    },
    Message: {
      Subject: { Data: params.subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: params.htmlBody, Charset: 'UTF-8' },
        ...(params.textBody ? { Text: { Data: params.textBody, Charset: 'UTF-8' } } : {}),
      },
    },
  });

  return sesClient.send(command);
};
```

---

## Deliverability & Spam Checklist

- [ ] **Custom Domain Verified**: `yourdomain.com` has a green checkmark in SES Identities.
- [ ] **DKIM Enabled**: All 3 `CNAME` records verified in DNS.
- [ ] **SPF Record active**: `v=spf1 include:amazonses.com ~all`.
- [ ] **DMARC Configured**: `_dmarc` TXT record active.
- [ ] **Production Access Approved**: Sandbox limits removed by AWS.
- [ ] **Valid From Address**: Sender address (e.g. `orders@yourdomain.com`) matches verified identity.
- [ ] **RTL / Arabic Support**: Ensure email HTML templates use `dir="rtl"` and `lang="ar"` for Arabic customers.
