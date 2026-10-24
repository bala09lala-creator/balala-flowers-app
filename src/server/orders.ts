import type { Product } from '../data/catalog';
import {
  Address,
  DELIVERY_LABELS,
  DeliveryMethod,
  OrderRequest,
  PAYMENT_LABELS,
  PaymentMethod,
  PHOTO_LABELS,
  PhotoChannel,
} from '../data/orders';
import { SHOP } from '../config/shop';
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

const oneOf = <T extends string>(labels: Record<T, string>, value: unknown): value is T =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(labels, value);

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
export function validateOrder(
  input: any,
  catalog: Map<string, Product>,
): { order: ValidOrder } | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'Пустой заказ' };

  const lines: ValidOrder['lines'] = [];
  for (const item of Array.isArray(input.items) ? input.items : []) {
    const product = catalog.get(str(item?.productId));
    const quantity = Number(item?.quantity);
    if (!product) return { error: 'Некоторых товаров уже нет в наличии. Обновите корзину.' };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return { error: 'Некорректное количество' };
    lines.push({ product, quantity });
  }
  if (lines.length === 0) return { error: 'Корзина пуста' };

  const customer = { name: str(input.customer?.name, 100), phone: str(input.customer?.phone, 30) };
  const recipient = input.recipient
    ? { name: str(input.recipient.name, 100), phone: str(input.recipient.phone, 30) }
    : null;
  const deliveryMethod: DeliveryMethod = oneOf(DELIVERY_LABELS, input.deliveryMethod) ? input.deliveryMethod : 'delivery';
  const address: Address | null =
    deliveryMethod === 'delivery'
      ? {
          street: str(input.address?.street, 150),
          house: str(input.address?.house, 20),
          entrance: str(input.address?.entrance, 10),
          floor: str(input.address?.floor, 10),
          apartment: str(input.address?.apartment, 20),
        }
      : null;

  if (!customer.name) return { error: 'Укажите имя' };
  if (customer.phone.replace(/\D/g, '').length < 10) return { error: 'Укажите телефон' };
  if (address && (!address.street || !address.house)) return { error: 'Укажите улицу и дом' };
  if (recipient && !recipient.name) return { error: 'Укажите имя получателя' };
  if (!oneOf(PAYMENT_LABELS, input.payment)) return { error: 'Выберите способ оплаты' };

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const delivery = deliveryCost(deliveryMethod);

  return {
    order: {
      id: newOrderId(),
      lines,
      subtotal,
      delivery,
      total: subtotal + delivery,
      customer,
      recipient,
      deliveryMethod,
      address,
      date: str(input.date, 20),
      timeSlot: str(input.timeSlot, 30),
      cardText: str(input.cardText),
      photo: oneOf(PHOTO_LABELS, input.photo) ? (input.photo as PhotoChannel) : 'none',
      comment: str(input.comment),
      payment: input.payment as PaymentMethod,
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

export function formatAddress(a: Address): string {
  return [
    `г. ${SHOP.city}, ${a.street}, д. ${a.house}`,
    a.entrance && `подъезд ${a.entrance}`,
    a.floor && `этаж ${a.floor}`,
    a.apartment && `кв./офис ${a.apartment}`,
  ]
    .filter(Boolean)
    .join(', ');
}

export function orderMessage(order: ValidOrder): string {
  const e = escapeHtml;
  const status =
    order.payment === 'online' ? '⏳ ожидает онлайн-оплаты' : '💵 оплата при получении';
  const rows = [
    `🌸 <b>Новый заказ №${order.id}</b> (приложение)`,
    status,
    '',
    ...order.lines.map(
      (l) =>
        `• ${l.product.url ? `<a href="${e(l.product.url)}">${e(l.product.name)}</a>` : e(l.product.name)} × ${l.quantity} — ${formatPrice(l.product.price * l.quantity)}`,
    ),
    `${DELIVERY_LABELS[order.deliveryMethod]}: ${order.delivery === 0 ? 'бесплатно' : formatPrice(order.delivery)}`,
    `<b>Итого: ${formatPrice(order.total)}</b>`,
    '',
    `👤 Заказчик: ${e(order.customer.name)}, ${e(order.customer.phone)}`,
  ];
  if (order.recipient) {
    rows.push(`🎁 Получатель: ${e(order.recipient.name)}${order.recipient.phone ? `, ${e(order.recipient.phone)}` : ''}`);
  }
  rows.push(order.address ? `📍 ${e(formatAddress(order.address))}` : `🏪 Самовывоз: ${SHOP.address}`);
  rows.push(`🗓 ${formatDate(order.date)}, ${e(order.timeSlot)}`);
  if (order.cardText) rows.push(`💌 Записка: «${e(order.cardText)}»`);
  if (order.photo !== 'none') rows.push(`📸 Фото букета перед отправкой: ${PHOTO_LABELS[order.photo]}`);
  if (order.comment) rows.push(`📝 ${e(order.comment)}`);
  return rows.join('\n');
}
