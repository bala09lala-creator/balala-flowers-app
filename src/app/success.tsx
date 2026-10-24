import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { SHOP } from '../config/shop';
import { colors } from '../theme';

export default function SuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return (
    <View style={styles.box}>
      <Text style={{ fontSize: 72 }}>🌷</Text>
      <Text style={styles.title}>Спасибо за заказ!</Text>
      <Text style={styles.text}>Номер заказа: {orderId}</Text>
      <Text style={styles.text}>
        Мы перезвоним в ближайшее время, чтобы подтвердить детали. Телефон магазина: {SHOP.phone}
      </Text>
      <Button title="Вернуться в каталог" onPress={() => router.dismissTo('/')} style={{ marginTop: 16, alignSelf: 'stretch' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  text: { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 22 },
});
