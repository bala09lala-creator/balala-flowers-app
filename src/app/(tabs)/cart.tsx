import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { ProductImage } from '../../components/ProductImage';
import { QuantityStepper } from '../../components/QuantityStepper';
import { Body, Heading } from '../../components/Typography';
import { SHOP } from '../../config/shop';
import { useCart } from '../../context/CartContext';
import { colors, fonts } from '../../theme';
import { formatPrice } from '../../utils/format';

const logo = require('../../../assets/images/logo.png');

export default function CartScreen() {
  const { lines, total, add, decrement, remove } = useCart();

  if (lines.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Image source={logo} style={{ width: 96, height: 96, opacity: 0.6 }} contentFit="contain" />
        <Heading style={{ fontSize: 22 }}>Корзина пуста</Heading>
        <Body style={{ color: colors.muted }}>Выберите букет в каталоге</Body>
        <Button title="В каталог" onPress={() => router.navigate('/')} style={{ marginTop: 12, alignSelf: 'stretch' }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={lines}
        keyExtractor={(l) => l.product.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item: { product, quantity } }) => (
          <View style={styles.line}>
            <Pressable onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}>
              <ProductImage uri={product.images[0]} width={200} style={styles.thumb} />
            </Pressable>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={styles.name} numberOfLines={2}>
                {product.name.toUpperCase()}
              </Text>
              <Text style={styles.price}>{formatPrice(product.price * quantity)}</Text>
              <View style={styles.qtyRow}>
                <QuantityStepper
                  compact
                  quantity={quantity}
                  onIncrement={() => add(product)}
                  onDecrement={() => decrement(product.id)}
                />
                <Pressable onPress={() => remove(product.id)} hitSlop={8}>
                  <Text style={styles.remove}>Удалить</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.sumRow}>
          <Text style={styles.muted}>Товары</Text>
          <Text style={styles.sumValue}>{formatPrice(total)}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.muted}>Доставка по городу</Text>
          <Text style={styles.sumValue}>{formatPrice(SHOP.deliveryPrice)}</Text>
        </View>
        <Text style={styles.hint}>Самовывоз из магазина — бесплатно</Text>
        <Button title="Оформить заказ" onPress={() => router.push('/checkout')} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  line: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: colors.card,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 84, height: 104 },
  name: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 18, color: colors.text },
  price: { fontFamily: fonts.headingBold, fontSize: 16, color: colors.primary },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  remove: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textDecorationLine: 'underline' },
  footer: { padding: 16, gap: 8, backgroundColor: colors.cream, borderTopWidth: 1, borderTopColor: colors.border },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  muted: { fontFamily: fonts.body, color: colors.muted, fontSize: 14 },
  sumValue: { fontFamily: fonts.medium, color: colors.text, fontSize: 14 },
  hint: { fontFamily: fonts.body, color: colors.muted, fontSize: 12 },
});
