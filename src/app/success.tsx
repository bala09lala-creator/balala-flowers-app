import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '../components/Button';
import { Body, Heading, Ornament } from '../components/Typography';
import { SHOP } from '../config/shop';
import { colors } from '../theme';

const logo = require('../../assets/images/logo.png');

export default function SuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return (
    <View style={styles.box}>
      <Image source={logo} style={{ width: 110, height: 110 }} contentFit="contain" />
      <Heading>Спасибо за заказ!</Heading>
      <Ornament />
      <Body style={styles.text}>Номер заказа: {orderId}</Body>
      <Body style={styles.text}>
        Менеджер свяжется с вами, чтобы подтвердить детали. Телефон магазина: {SHOP.phone}
      </Body>
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
