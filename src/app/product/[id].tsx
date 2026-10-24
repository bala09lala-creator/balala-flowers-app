import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { ProductImage } from '../../components/ProductImage';
import { useCart } from '../../context/CartContext';
import { getProduct } from '../../data/products';
import { colors } from '../../theme';
import { formatPrice } from '../../utils/format';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id);
  const { lines, add } = useCart();

  if (!product) {
    return (
      <View style={styles.missing}>
        <Text style={styles.text}>Товар не найден</Text>
      </View>
    );
  }

  const inCart = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView>
        <ProductImage product={product} size={320} />
        <View style={styles.body}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <Text style={styles.text}>{product.description}</Text>
          <Text style={styles.label}>Состав</Text>
          <Text style={styles.text}>{product.composition}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title={inCart > 0 ? `Добавить ещё (в корзине: ${inCart})` : 'В корзину'}
          onPress={() => add(product.id)}
        />
        {inCart > 0 && (
          <Button title="Перейти в корзину" variant="outline" onPress={() => router.navigate('/cart')} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 8 },
  name: { fontSize: 24, fontWeight: '700', color: colors.text },
  price: { fontSize: 22, fontWeight: '700', color: colors.primaryDark, marginBottom: 8 },
  label: { fontSize: 13, color: colors.muted, marginTop: 12, textTransform: 'uppercase' },
  text: { fontSize: 16, color: colors.text, lineHeight: 23 },
  footer: { padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
});
