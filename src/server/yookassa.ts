import { requireEnv } from './env';

// Документация API: https://yookassa.ru/developers/api
export type YooPayment = {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: { value: string; currency: string };
  confirmation?: { type: string; confirmation_url?: string };
  metadata?: Record<string, string>;
};

type ReceiptItem = { description: string; quantity: number; price: number; subject: 'commodity' | 'service' };

function apiBase() {
  return process.env.YOOKASSA_API_URL ?? 'https://api.yookassa.ru/v3';
}

function authHeader() {
  const shopId = requireEnv('YOOKASSA_SHOP_ID', process.env.YOOKASSA_SHOP_ID);
  const secret = requireEnv('YOOKASSA_SECRET_KEY', process.env.YOOKASSA_SECRET_KEY);
  return `Basic ${btoa(`${shopId}:${secret}`)}`;
}

function money(value: number) {
  return { value: value.toFixed(2), currency: 'RUB' };
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) {
    throw new Error(`YooKassa error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export function createPayment(params: {
  orderId: string;
  amount: number;
  returnUrl: string;
  description: string;
  customerPhone: string;
  items: ReceiptItem[];
}): Promise<YooPayment> {
  const body: Record<string, unknown> = {
    amount: money(params.amount),
    capture: true,
    confirmation: { type: 'redirect', return_url: params.returnUrl },
    description: params.description.slice(0, 128),
    metadata: { orderId: params.orderId },
  };

  // Чек по 54-ФЗ — включите, если в ЮKassa подключены «Чеки от ЮKassa» или онлайн-касса.
  if (process.env.YOOKASSA_SEND_RECEIPT === 'true') {
    const vatCode = Number(process.env.YOOKASSA_VAT_CODE ?? 1);
    body.receipt = {
      customer: { phone: params.customerPhone.replace(/\D/g, '') },
      items: params.items.map((item) => ({
        description: item.description.slice(0, 128),
        quantity: item.quantity.toFixed(2),
        amount: money(item.price),
        vat_code: vatCode,
        payment_subject: item.subject,
        payment_mode: 'full_payment',
      })),
    };
  }

  return request<YooPayment>('/payments', {
    method: 'POST',
    headers: { 'Idempotence-Key': `order-${params.orderId}` },
    body: JSON.stringify(body),
  });
}

export function getPayment(paymentId: string): Promise<YooPayment> {
  return request<YooPayment>(`/payments/${encodeURIComponent(paymentId)}`, { method: 'GET' });
}
