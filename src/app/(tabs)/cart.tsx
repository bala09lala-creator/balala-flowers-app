import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { ProductImage } from '../../components/ProductImage';
import { useCart } from '../../context/CartContext';
import { colors, radius } from '../../theme';
import { deliveryCost } from '../../utils/delivery';
import { formatPrice } from '../../utils/format';

export default function CartScreen() {
  const { lines, total, add, decrement, remove } = useCart();

  if (lines.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={{ fontSize: 64 }}>🛒</Text>
        <Text style={styles.emptyTitle}>Корзина пуста</Text>
        <Text style={styles.muted}>Выберите букет в каталоге</Text>
        <Button title="В каталог" onPress={() => router.navigate('/')} style={{ marginTop: 12 }} />
      </View>
    );
  }

  const delivery = deliveryCost(total);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={lines}
        keyExtractor={(l) => l.product.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item: { product, quantity } }) => (
          <View style={styles.line}>
            <ProductImage product={product} size={72} style={styles.thumb} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.price}>{formatPrice(product.price * quantity)}</Text>
              <View style={styles.qtyRow}>
                <Pressable onPress={() => decrement(product.id)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={styles.qty}>{quantity}</Text>
                <Pressable onPress={() => add(product.id)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
                <Pressable onPress={() => remove(product.id)} style={{ marginLeft: 'auto' }}>
                  <Text style={styles.muted}>Удалить</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.sumRow}>
          <Text style={styles.muted}>Букеты</Text>
          <Text style={styles.sumValue}>{formatPrice(total)}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.muted}>Доставка</Text>
          <Text style={styles.sumValue}>{delivery === 0 ? 'бесплатно' : formatPrice(delivery)}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.total}>Итого</Text>
          <Text style={styles.total}>{formatPrice(total + delivery)}</Text>
        </View>
        <Button title="Оформить заказ" onPress={() => router.push('/checkout')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 14 },
  line: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 72, borderRadius: 12 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  price: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 18, color: colors.text },
  qty: { fontSize: 16, fontWeight: '600', minWidth: 18, textAlign: 'center' },
  footer: {
    padding: 16,
    gap: 8,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sumValue: { color: colors.text, fontSize: 14 },
  total: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
});
