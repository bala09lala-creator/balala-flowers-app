import { FLOWER_CATEGORIES, type Product } from '../data/catalog';

// Скидка за онлайн-оплату — только на букеты (цветочные разделы):
// до 5 000 ₽ включительно — 3%, дороже — 5%. Открытки, игрушки, сладости и доставка — без скидки.
export const ONLINE_DISCOUNT = { threshold: 5000, lowRate: 0.03, highRate: 0.05 };

export function discountRate(product: Pick<Product, 'price' | 'categories'>): number {
  if (!product.categories.some((c) => FLOWER_CATEGORIES.includes(c))) return 0;
  return product.price <= ONLINE_DISCOUNT.threshold ? ONLINE_DISCOUNT.lowRate : ONLINE_DISCOUNT.highRate;
}

// Скидка на одну штуку в целых рублях.
export function unitDiscount(product: Pick<Product, 'price' | 'categories'>): number {
  return Math.round(product.price * discountRate(product));
}

export function onlineDiscount(lines: { product: Pick<Product, 'price' | 'categories'>; quantity: number }[]): number {
  return lines.reduce((sum, l) => sum + unitDiscount(l.product) * l.quantity, 0);
}
