export type PaymentMethod = 'online' | 'card' | 'cash';

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  online: 'Онлайн (ЮKassa)',
  card: 'Картой курьеру',
  cash: 'Наличными',
};

// Что приложение отправляет на сервер. Цены сервер берёт из каталога сам.
export type OrderRequest = {
  items: { productId: string; quantity: number }[];
  customer: { name: string; phone: string };
  recipient: { name: string; phone: string } | null;
  address: string;
  date: string;
  timeSlot: string;
  cardText: string;
  comment: string;
  payment: PaymentMethod;
  // Куда вернуть покупателя после оплаты (диплинк приложения).
  returnUrl?: string;
};

export type OrderResponse = {
  orderId: string;
  total: number;
  // Для онлайн-оплаты: страница ЮKassa и id платежа для проверки статуса.
  confirmationUrl?: string;
  paymentId?: string;
};

export type PaymentStatus = {
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  orderId?: string;
};
