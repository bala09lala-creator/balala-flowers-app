import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCart } from '../context/CartContext';
import { Product } from '../data/products';
import { colors, radius } from '../theme';
import { formatPrice } from '../utils/format';
import { ProductImage } from './ProductImage';

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <Link href={{ pathname: '/product/[id]', params: { id: product.id } }} asChild>
      <Pressable style={styles.card}>
        <ProductImage product={product} size={130} />
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.row}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Pressable onPress={() => add(product.id)} style={styles.add} hitSlop={8}>
              <Text style={styles.addText}>+</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: { padding: 12, gap: 8 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text, minHeight: 38 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
  add: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: '#fff', fontSize: 20, fontWeight: '600', lineHeight: 22 },
});
