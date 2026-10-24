import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SHOP } from '../../config/shop';
import { colors, radius } from '../../theme';
import { formatPrice } from '../../utils/format';

function Row({ icon, title, value, onPress }: { icon: string; title: string; value: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.row}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, onPress && { color: colors.primary }]}>{value}</Text>
      </View>
    </Pressable>
  );
}

export default function ContactsScreen() {
  const phoneDigits = SHOP.phone.replace(/[^\d+]/g, '');
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={styles.card}>
        <Text style={styles.shop}>{SHOP.name}</Text>
        <Text style={styles.value}>{SHOP.slogan}</Text>
      </View>
      <View style={styles.card}>
        <Row icon="📞" title="Телефон" value={SHOP.phone} onPress={() => Linking.openURL(`tel:${phoneDigits}`)} />
        <Row
          icon="💬"
          title="WhatsApp"
          value="Написать нам"
          onPress={() => Linking.openURL(`https://wa.me/${SHOP.whatsapp}`)}
        />
        <Row icon="📍" title="Адрес" value={SHOP.address} />
        <Row icon="🕘" title="Часы работы" value={SHOP.hours} />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Доставка</Text>
        <Text style={styles.value}>
          {formatPrice(SHOP.deliveryPrice)} по городу, бесплатно при заказе от {formatPrice(SHOP.freeDeliveryFrom)}.
          Доставим в удобный интервал, к букету бесплатно приложим открытку.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shop: { fontSize: 22, fontWeight: '700', color: colors.primaryDark },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  icon: { fontSize: 22 },
  title: { fontSize: 13, color: colors.muted },
  value: { fontSize: 15, color: colors.text, lineHeight: 21 },
});
