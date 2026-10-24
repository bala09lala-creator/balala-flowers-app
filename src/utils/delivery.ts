import { SHOP } from '../config/shop';
import type { DeliveryMethod } from '../data/orders';

export function deliveryCost(method: DeliveryMethod): number {
  return method === 'pickup' ? 0 : SHOP.deliveryPrice;
}
