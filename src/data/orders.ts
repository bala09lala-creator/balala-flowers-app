export type PaymentMethod = 'online' | 'cash';
export type DeliveryMethod = 'delivery' | 'pickup';
export type PhotoChannel = 'whatsapp' | 'telegram' | 'none';

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  online: 'Картой онлайн',
  cash: 'При получении',
};

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  delivery: 'Доставка по городу',
  pickup: 'Самовывоз',
};

export const PHOTO_LABELS: Record<PhotoChannel, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  none: 'Не отправлять',
};

export type Address = { street: string; house: string; entrance: string; floor: string; apartment: string };

// Что приложение отправляет на сервер. Цены сервер берёт из каталога Tilda сам.
export type OrderRequest = {
  items: { productId: string; quantity: number }[];
  customer: { name: string; phone: string };
  recipient: { name: string; phone: string } | null;
  deliveryMethod: DeliveryMethod;
  address: Address | null;
  date: string;
  timeSlot: string;
  cardText: string;
  photo: PhotoChannel;
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
