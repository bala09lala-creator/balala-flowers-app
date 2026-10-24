import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { CartProvider } from '../context/CartContext';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <CartProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
          headerBackTitle: 'Назад',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: '' }} />
        <Stack.Screen name="checkout" options={{ title: 'Оформление заказа' }} />
        <Stack.Screen name="success" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="payment-result" options={{ headerShown: false }} />
      </Stack>
    </CartProvider>
  );
}
