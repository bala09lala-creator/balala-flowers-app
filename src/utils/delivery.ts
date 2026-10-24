import { SHOP } from '../config/shop';

export function deliveryCost(subtotal: number): number {
  return subtotal >= SHOP.freeDeliveryFrom ? 0 : SHOP.deliveryPrice;
}
