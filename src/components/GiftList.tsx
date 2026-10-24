import { StyleSheet, Text, View } from 'react-native';

import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { giftsFor } from '../data/catalog';
import { colors, fonts } from '../theme';
import { ProductImage } from './ProductImage';

// Подарки, которые магазин кладёт к букетам из корзины.
export function GiftList() {
  const { lines } = useCart();
  const { gifts } = useCatalog();
  const items = giftsFor(lines.map((l) => l.product));
  if (items.length === 0) return null;

  return (
    <View style={styles.box}>
      <Text style={styles.title}>🎁 В подарок к вашему заказу</Text>
      {items.map((g) => (
        <View key={g.productId} style={styles.row}>
          <ProductImage uri={gifts.find((p) => p.id === g.productId)?.images[0]} width={120} style={styles.thumb} />
          <Text style={styles.name}>{g.name}</Text>
          <Text style={styles.free}>0 ₽</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 10, padding: 12, borderWidth: 1, borderColor: colors.peach, backgroundColor: colors.cream },
  title: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumb: { width: 40, height: 40 },
  name: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text },
  free: { fontFamily: fonts.semibold, fontSize: 14, color: colors.accent },
});
