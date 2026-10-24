import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'orders:v1';

export type Order = {
  id: string;
  createdAt: string;
  items: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  delivery: number;
  customer: { name: string; phone: string };
  recipient: { name: string; phone: string; address: string };
  date: string;
  timeSlot: string;
  cardText: string;
  payment: 'cash' | 'card';
  comment: string;
};

// Сейчас заказ сохраняется только на телефоне. Чтобы заказы приходили вам,
// здесь нужно отправлять их на сервер / в Telegram-бот / CRM.
export async function submitOrder(order: Order): Promise<void> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const orders: Order[] = raw ? JSON.parse(raw) : [];
  orders.unshift(order);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}
