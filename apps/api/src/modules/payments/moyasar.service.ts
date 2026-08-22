import { env } from '../../config/env';

export interface MoyasarPaymentResponse {
  id: string;
  status: 'initiated' | 'paid' | 'failed' | 'authorized' | 'captured' | 'refunded' | 'voided';
  amount: number; // in halalas (e.g. 1000 = 10.00 SAR)
  fee: number;
  currency: string;
  description: string;
  amount_format: string;
  created_at: string;
  source?: {
    type: string;
    company?: string;
    name?: string;
    number?: string;
    message?: string;
    transaction_url?: string;
  };
}

export class MoyasarClient {
  private static getAuthHeader(): string | null {
    const key = env.MOYASAR_SECRET_KEY || env.MOYASAR_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY;
    if (!key) return null;
    return `Basic ${Buffer.from(`${key}:`).toString('base64')}`;
  }

  /**
   * Fetch payment details from Moyasar API
   */
  static async getPayment(paymentId: string): Promise<MoyasarPaymentResponse | null> {
    const authHeader = this.getAuthHeader();
    if (!authHeader) {
      return null;
    }

    try {
      const response = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as MoyasarPaymentResponse;
    } catch {
      return null;
    }
  }

  /**
   * Refund payment on Moyasar (requires Secret Key)
   */
  static async refundPayment(paymentId: string, amountHalalas?: number): Promise<{ success: boolean; data?: any; error?: string }> {
    const secretKey = env.MOYASAR_SECRET_KEY;
    if (!secretKey) {
      return { success: false, error: 'MOYASAR_SECRET_KEY is not configured' };
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
      const payload: Record<string, any> = {};
      if (amountHalalas) {
        payload.amount = amountHalalas;
      }

      const response = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || 'Refund failed on Moyasar' };
      }

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Moyasar connection failed' };
    }
  }
}
