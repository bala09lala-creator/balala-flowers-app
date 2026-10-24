import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { PlayfairDisplay_400Regular, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { CartProvider } from '../context/CartContext';
import { CatalogProvider } from '../context/CatalogContext';
import { colors, fonts } from '../theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  if (!fontsLoaded) return null;

  return (
    <CatalogProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontFamily: fonts.heading },
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
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
    </CatalogProvider>
  );
}
