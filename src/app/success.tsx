import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '../components/Button';
import { Body, Heading, Ornament } from '../components/Typography';
import { SHOP } from '../config/shop';
import { colors } from '../theme';

const logo = require('../../assets/images/logo.png');

type Params = { orderId: string; payment?: 'paid' | 'unpaid' | 'none'; deliveryUnknown?: string };

export default function SuccessScreen() {
  const { orderId, payment, deliveryUnknown } = useLocalSearchParams<Params>();

  const notes = [
    payment === 'paid' && 'Оплата прошла успешно.',
    payment === 'unpaid' && 'Оплата не завершена — ничего страшного: менеджер пришлёт реквизиты для оплаты.',
    deliveryUnknown && 'Стоимость доставки менеджер уточнит и пришлёт реквизиты для доплаты.',
    'Менеджер свяжется с вами, чтобы подтвердить детали заказа.',
  ].filter(Boolean) as string[];

  return (
    <View style={styles.box}>
      <Image source={logo} style={{ width: 110, height: 110 }} contentFit="contain" />
      <Heading>Спасибо за заказ!</Heading>
      <Ornament />
      <Body style={styles.text}>Номер заказа: {orderId}</Body>
      {notes.map((n) => (
        <Body key={n} style={styles.text}>
          {n}
        </Body>
      ))}
      <Body style={styles.text}>Телефон магазина: {SHOP.phone}</Body>
      <Button
        title="Вернуться в каталог"
        onPress={() => router.dismissTo('/')}
        style={{ marginTop: 16, alignSelf: 'stretch' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12, backgroundColor: colors.background },
  text: { color: colors.muted, textAlign: 'center' },
});
