import { SHOP } from '../config/shop';
import type { DeliveryMethod } from '../data/orders';
import { findSettlement } from '../data/settlements';

// Стоимость доставки. null — стоимость уточнит менеджер
// (населённого пункта нет в списке или для него не указана цена).
export function deliveryCost(method: DeliveryMethod, subtotal: number, settlement = ''): number | null {
  if (method === 'pickup') return 0;
  if (method === 'outside') return findSettlement(settlement)?.price ?? null;
  return subtotal >= SHOP.freeDeliveryFrom ? 0 : SHOP.deliveryPrice;
}

export function formatDeliveryCost(cost: number | null, formatPrice: (n: number) => string): string {
  if (cost === null) return 'уточнит менеджер';
  return cost === 0 ? 'бесплатно' : formatPrice(cost);
}
