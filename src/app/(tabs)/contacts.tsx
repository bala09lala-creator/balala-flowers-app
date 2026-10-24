import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { ComponentProps } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Body, Heading, Ornament, Overline } from '../../components/Typography';
import { SHOP } from '../../config/shop';
import { colors, fonts } from '../../theme';
import { formatPrice } from '../../utils/format';

const logo = require('../../../assets/images/logo.png');

type IconName = ComponentProps<typeof Ionicons>['name'];

function Row({ icon, title, value, url }: { icon: IconName; title: string; value: string; url?: string }) {
  return (
    <Pressable onPress={url ? () => Linking.openURL(url) : undefined} disabled={!url} style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Overline>{title}</Overline>
        <Text style={[styles.value, !!url && { color: colors.primary }]}>{value}</Text>
      </View>
    </Pressable>
  );
}

export default function ContactsScreen() {
  const phoneDigits = SHOP.phone.replace(/[^\d+]/g, '');
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20, alignItems: 'center' }}>
      <Image source={logo} style={{ width: 88, height: 88 }} contentFit="contain" />
      <Heading>{SHOP.name}</Heading>
      <Body style={{ color: colors.muted, textAlign: 'center' }}>
        Мы всегда готовы помочь с подбором и подскажем лучший вариант
      </Body>
      <Ornament />

      <View style={styles.card}>
        <Row icon="call-outline" title="Телефон" value={SHOP.phone} url={`tel:${phoneDigits}`} />
        <Row icon="logo-whatsapp" title="WhatsApp" value="Написать нам" url={`https://wa.me/${SHOP.whatsapp}`} />
        <Row icon="paper-plane-outline" title="Telegram" value={`@${SHOP.telegram}`} url={`https://t.me/${SHOP.telegram}`} />
        <Row
          icon="logo-instagram"
          title="Instagram"
          value={`@${SHOP.instagram}`}
          url={`https://instagram.com/${SHOP.instagram}`}
        />
        <Row icon="logo-vk" title="ВКонтакте" value={SHOP.vk} url={`https://vk.com/${SHOP.vk}`} />
      </View>

      <View style={styles.card}>
        <Row icon="location-outline" title="Адрес" value={SHOP.address} />
        <Row icon="time-outline" title="Время работы" value={`${SHOP.hours}\n${SHOP.holidayHours}`} />
      </View>

      <View style={styles.card}>
        <Overline>Доставка и оплата</Overline>
        <Body>
          Доставка по городу — {formatPrice(SHOP.deliveryPrice)}. Самовывоз из магазина — бесплатно. После оформления
          заказа с вами свяжется менеджер для подтверждения. Оплата картой онлайн или при получении.
        </Body>
      </View>

      <Text style={styles.legal}>{SHOP.legal}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.card,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  icon: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontFamily: fonts.body, fontSize: 15, color: colors.text, lineHeight: 21 },
  legal: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, textAlign: 'center' },
});
