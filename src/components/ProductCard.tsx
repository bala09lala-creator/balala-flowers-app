import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCart } from '../context/CartContext';
import type { Product } from '../data/catalog';
import { colors, fonts } from '../theme';
import { formatPrice } from '../utils/format';
import { Button } from './Button';
import { ProductImage } from './ProductImage';
import { QuantityStepper } from './QuantityStepper';

function ProductCardInner({ product }: { product: Product }) {
  const { quantityOf, add, decrement } = useCart();
  const quantity = quantityOf(product.id);

  return (
    <View style={styles.card}>
      <Link href={{ pathname: '/product/[id]', params: { id: product.id } }} asChild>
        <Pressable style={{ gap: 10 }}>
          <View style={styles.frame}>
            <ProductImage uri={product.images[0]} style={styles.image} />
            {product.mark && (
              <View style={styles.mark}>
                <Text style={styles.markText}>{product.mark.toUpperCase()}</Text>
              </View>
            )}
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {product.name.toUpperCase()}
          </Text>
          <View style={styles.priceRow}>
            <View style={styles.dash} />
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.oldPrice && <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>}
            <View style={styles.dash} />
          </View>
        </Pressable>
      </Link>
      {quantity > 0 ? (
        <QuantityStepper
          compact
          quantity={quantity}
          onIncrement={() => add(product)}
          onDecrement={() => decrement(product.id)}
        />
      ) : (
        <Button title="В корзину" variant="accent" size="small" onPress={() => add(product)} />
      )}
    </View>
  );
}

export const ProductCard = memo(ProductCardInner);

const styles = StyleSheet.create({
  card: { flex: 1, gap: 10, maxWidth: '50%' },
  frame: { borderWidth: 1, borderColor: colors.peach, padding: 4, backgroundColor: colors.card },
  image: { aspectRatio: 4 / 5, width: '100%' },
  mark: { position: 'absolute', top: 12, right: 12, backgroundColor: colors.dark, paddingHorizontal: 8, paddingVertical: 4 },
  markText: { color: colors.cream, fontSize: 10, letterSpacing: 1, fontFamily: fonts.medium },
  name: {
    fontFamily: fonts.heading,
    fontSize: 13,
    lineHeight: 17,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.5,
    minHeight: 34,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dash: { width: 12, height: 1, backgroundColor: colors.peach },
  price: { fontFamily: fonts.headingBold, fontSize: 15, color: colors.primary },
  oldPrice: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textDecorationLine: 'line-through' },
});
