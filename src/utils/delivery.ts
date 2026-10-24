import { SHOP } from '../config/shop';
import type { DeliveryMethod } from '../data/orders';

// Стоимость доставки. null — стоимость уточнит менеджер (доставка за пределы города).
export function deliveryCost(method: DeliveryMethod, subtotal: number): number | null {
  if (method === 'pickup') return 0;
  if (method === 'outside') return SHOP.outsideDeliveryPrice;
  return subtotal >= SHOP.freeDeliveryFrom ? 0 : SHOP.deliveryPrice;
}

export function formatDeliveryCost(cost: number | null, formatPrice: (n: number) => string): string {
  if (cost === null) return 'уточнит менеджер';
  return cost === 0 ? 'бесплатно' : formatPrice(cost);
}
