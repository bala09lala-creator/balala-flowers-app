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
import { findSettlement } from '../data/settlements';
import { deliveryCost, formatDeliveryCost } from '../utils/delivery';
import { formatPrice } from '../utils/format';
import { escapeHtml } from './telegram';

export type ValidOrder = Omit<OrderRequest, 'items'> & {
  id: string;
  lines: { product: Product; quantity: number }[];
  // Товары, которых уже нет в каталоге Tilda: цену уточнит менеджер.
  missing: { name: string; quantity: number }[];
  subtotal: number;
  // null — стоимость доставки неизвестна: менеджер уточнит и пришлёт реквизиты для доплаты.
  delivery: number | null;
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
  const missing: ValidOrder['missing'] = [];
  for (const item of Array.isArray(input.items) ? input.items : []) {
    const quantity = Math.min(Math.max(Math.round(Number(item?.quantity)) || 1, 1), 99);
    const product = catalog.get(str(item?.productId));
    if (product) lines.push({ product, quantity });
    else missing.push({ name: str(item?.name, 150) || `товар ${str(item?.productId, 30)}`, quantity });
  }
  if (lines.length === 0 && missing.length === 0) return { error: 'Корзина пуста' };

  const customer = { name: str(input.customer?.name, 100), phone: str(input.customer?.phone, 30) };
  const recipientName = str(input.recipient?.name, 100);
  const recipientPhone = str(input.recipient?.phone, 30);
  const recipient = recipientName || recipientPhone ? { name: recipientName, phone: recipientPhone } : null;
  const deliveryMethod: DeliveryMethod = oneOf(DELIVERY_LABELS, input.deliveryMethod) ? input.deliveryMethod : 'delivery';
  const address: Address | null =
    deliveryMethod !== 'pickup'
      ? {
          // Название из списка, если нашлось, иначе — как ввёл покупатель (может быть пустым).
          settlement:
            deliveryMethod === 'outside'
              ? (findSettlement(str(input.address?.settlement, 100))?.name ?? str(input.address?.settlement, 100))
              : undefined,
          street: str(input.address?.street, 150),
          house: str(input.address?.house, 20),
          entrance: str(input.address?.entrance, 10),
          floor: str(input.address?.floor, 10),
          apartment: str(input.address?.apartment, 20),
        }
      : null;

  // Обязательны только имя и телефон: остальное менеджер уточнит при звонке,
  // главное — не потерять заказ.
  if (!customer.name) return { error: 'Укажите имя' };
  if (customer.phone.replace(/\D/g, '').length < 10) return { error: 'Укажите телефон' };

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const delivery = deliveryCost(deliveryMethod, subtotal, address?.settlement);

  return {
    order: {
      id: newOrderId(),
      lines,
      missing,
      subtotal,
      delivery,
      total: subtotal + (delivery ?? 0),
      customer,
      recipient,
      deliveryMethod,
      address,
      date: str(input.date, 20),
      timeSlot: str(input.timeSlot, 30),
      cardText: str(input.cardText),
      photo: oneOf(PHOTO_LABELS, input.photo) ? (input.photo as PhotoChannel) : 'none',
      comment: str(input.comment),
      payment: oneOf(PAYMENT_LABELS, input.payment) ? (input.payment as PaymentMethod) : 'cash',
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

export function formatAddress(a: Address, outside: boolean): string {
  return [
    outside ? a.settlement || 'населённый пункт не указан' : `г. ${SHOP.city}`,
    a.street,
    a.house && `д. ${a.house}`,
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
    ...order.missing.map((m) => `• ${e(m.name)} × ${m.quantity} — ⚠️ нет в каталоге, цену уточнить`),
    `🚚 ${DELIVERY_LABELS[order.deliveryMethod]}: ${formatDeliveryCost(order.delivery, formatPrice)}`,
    `<b>Итого: ${formatPrice(order.total)}</b>${order.delivery === null ? ' + доставка' : ''}`,
    '',
    `👤 Заказчик: ${e(order.customer.name)}, ${e(order.customer.phone)}`,
  ];
  if (order.recipient) {
    rows.push(`🎁 Получатель: ${e(order.recipient.name)}${order.recipient.phone ? `, ${e(order.recipient.phone)}` : ''}`);
  }
  rows.push(
    order.address
      ? `📍 ${e(formatAddress(order.address, order.deliveryMethod === 'outside'))}`
      : `🏪 Самовывоз: ${SHOP.address}`,
  );
  rows.push(`🗓 ${formatDate(order.date)}, ${e(order.timeSlot)}`);
  if (order.cardText) rows.push(`💌 Записка: «${e(order.cardText)}»`);
  if (order.photo !== 'none') rows.push(`📸 Фото букета перед отправкой: ${PHOTO_LABELS[order.photo]}`);
  if (order.comment) rows.push(`📝 ${e(order.comment)}`);

  const todo = [
    order.delivery === null &&
      `уточнить населённый пункт и стоимость доставки${order.payment === 'online' ? ', отправить реквизиты для доплаты' : ''}`,
    order.address && (!order.address.street || !order.address.house) && 'уточнить адрес доставки',
    order.missing.length > 0 &&
      `уточнить товары, которых нет в каталоге, и их стоимость${order.payment === 'online' ? ', отправить реквизиты для доплаты' : ''}`,
  ].filter(Boolean);
  if (todo.length) rows.push('', `⚠️ <b>Связаться с заказчиком:</b> ${todo.join('; ')}`);
  return rows.join('\n');
}
