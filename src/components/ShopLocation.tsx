import { Image } from 'expo-image';
import { Linking, StyleSheet, View } from 'react-native';

import { SHOP } from '../config/shop';
import { colors } from '../theme';
import { Button } from './Button';
import { Body, Overline } from './Typography';

const shopPhoto = require('../../assets/images/shop.jpg');

// Фото магазина, адрес и кнопка маршрута — для самовывоза и контактов.
export function ShopLocation() {
  return (
    <View style={styles.box}>
      <View style={styles.frame}>
        <Image source={shopPhoto} style={styles.photo} contentFit="cover" contentPosition="top" />
      </View>
      <View style={{ gap: 4 }}>
        <Overline>Адрес магазина</Overline>
        <Body>{SHOP.address}</Body>
        <Body style={styles.hint}>{SHOP.addressHint}</Body>
      </View>
      <Button
        title="Balala на Яндекс Картах"
        variant="outline"
        size="small"
        onPress={() => Linking.openURL(SHOP.mapsUrl)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 12, alignSelf: 'stretch' },
  frame: { borderWidth: 1, borderColor: colors.peach, padding: 4 },
  photo: { width: '100%', aspectRatio: 4 / 5 },
  hint: { fontSize: 13, lineHeight: 19, color: colors.muted },
});
