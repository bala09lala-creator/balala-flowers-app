import { SHOP } from '../config/shop';
import type { DeliveryMethod } from '../data/orders';
import { findSettlement } from '../data/settlements';

// Стоимость доставки. null — населённый пункт ещё не выбран или его нет в списке.
export function deliveryCost(method: DeliveryMethod, subtotal: number, settlement = ''): number | null {
  if (method === 'pickup') return 0;
  if (method === 'outside') return findSettlement(settlement)?.price ?? null;
  return subtotal >= SHOP.freeDeliveryFrom ? 0 : SHOP.deliveryPrice;
}

export function formatDeliveryCost(cost: number | null, formatPrice: (n: number) => string): string {
  if (cost === null) return 'выберите населённый пункт';
  return cost === 0 ? 'бесплатно' : formatPrice(cost);
}
