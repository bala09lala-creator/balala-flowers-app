import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { OrderRequest, OrderResponse, PaymentStatus } from '../data/orders';

// Адрес сервера с API-маршрутами (src/app/api). В продакшене задайте EXPO_PUBLIC_API_URL,
// например https://balala-flowers.expo.app. При разработке используется dev-сервер Expo.
function apiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  if (Platform.OS === 'web') return '';
  const host = Constants.expoConfig?.hostUri;
  return host ? `http://${host}` : '';
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiUrl()}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'Сервер недоступен');
  return data as T;
}

export function createOrder(order: OrderRequest): Promise<OrderResponse> {
  return call('/api/orders', { method: 'POST', body: JSON.stringify(order) });
}

export function getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  return call(`/api/payments/${encodeURIComponent(paymentId)}`);
}
