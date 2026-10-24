import { getProduct, Product } from '../data/products';
import { OrderRequest, PAYMENT_LABELS, PaymentMethod } from '../data/orders';
import { deliveryCost } from '../utils/delivery';
import { formatPrice } from '../utils/format';
import { escapeHtml } from './telegram';

export type ValidOrder = Omit<OrderRequest, 'items'> & {
  id: string;
  lines: { product: Product; quantity: number }[];
  subtotal: number;
  delivery: number;
  total: number;
};

const PAYMENTS = Object.keys(PAYMENT_LABELS) as PaymentMethod[];

function str(value: unknown, max = 500): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function newOrderId(now = new Date()): string {
  const mmdd = `${now.getMonth() + 1}`.padStart(2, '0') + `${now.getDate()}`.padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${mmdd}-${rand}`;
}

// Проверяет данные из приложения и пересчитывает суммы по каталогу:
// цене, пришедшей от клиента, доверять нельзя.
export function validateOrder(input: any): { order: ValidOrder } | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'Пустой заказ' };

  const lines: ValidOrder['lines'] = [];
  for (const item of Array.isArray(input.items) ? input.items : []) {
    const product = getProduct(str(item?.productId));
    const quantity = Number(item?.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return { error: 'Некорректный товар в корзине' };
    }
    lines.push({ product, quantity });
  }
  if (lines.length === 0) return { error: 'Корзина пуста' };

  const customer = { name: str(input.customer?.name, 100), phone: str(input.customer?.phone, 30) };
  const recipient = input.recipient
    ? { name: str(input.recipient.name, 100), phone: str(input.recipient.phone, 30) }
    : null;
  const address = str(input.address);
  const payment = input.payment as PaymentMethod;

  if (!customer.name) return { error: 'Укажите имя' };
  if (customer.phone.replace(/\D/g, '').length < 10) return { error: 'Укажите телефон' };
  if (!address) return { error: 'Укажите адрес' };
  if (recipient && !recipient.name) return { error: 'Укажите имя получателя' };
  if (!PAYMENTS.includes(payment)) return { error: 'Выберите способ оплаты' };

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const delivery = deliveryCost(subtotal);

  return {
    order: {
      id: newOrderId(),
      lines,
      subtotal,
      delivery,
      total: subtotal + delivery,
      customer,
      recipient,
      address,
      date: str(input.date, 20),
      timeSlot: str(input.timeSlot, 30),
      cardText: str(input.cardText),
      comment: str(input.comment),
      payment,
      returnUrl: str(input.returnUrl, 300) || undefined,
    },
  };
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });
}

export function orderMessage(order: ValidOrder): string {
  const e = escapeHtml;
  const status =
    order.payment === 'online' ? '⏳ ожидает онлайн-оплаты' : `💵 оплата при получении: ${PAYMENT_LABELS[order.payment]}`;
  const rows = [
    `🌸 <b>Новый заказ №${order.id}</b>`,
    status,
    '',
    ...order.lines.map((l) => `• ${e(l.product.name)} × ${l.quantity} — ${formatPrice(l.product.price * l.quantity)}`),
    `Доставка: ${order.delivery === 0 ? 'бесплатно' : formatPrice(order.delivery)}`,
    `<b>Итого: ${formatPrice(order.total)}</b>`,
    '',
    `👤 Заказчик: ${e(order.customer.name)}, ${e(order.customer.phone)}`,
  ];
  if (order.recipient) {
    rows.push(`🎁 Получатель: ${e(order.recipient.name)}${order.recipient.phone ? `, ${e(order.recipient.phone)}` : ''}`);
  }
  rows.push(`📍 ${e(order.address)}`, `🗓 ${formatDate(order.date)}, ${e(order.timeSlot)}`);
  if (order.cardText) rows.push(`💌 Открытка: «${e(order.cardText)}»`);
  if (order.comment) rows.push(`📝 ${e(order.comment)}`);
  return rows.join('\n');
}
