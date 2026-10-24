import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../../components/Button';
import { ProductImage } from '../../components/ProductImage';
import { QuantityStepper } from '../../components/QuantityStepper';
import { Body, Heading, Ornament, Overline } from '../../components/Typography';
import { useCart } from '../../context/CartContext';
import { useCatalog } from '../../context/CatalogContext';
import { colors, fonts } from '../../theme';
import { formatPrice } from '../../utils/format';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { byId, loading } = useCatalog();
  const { quantityOf, add, decrement } = useCart();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const product = byId.get(id);

  if (!product) {
    return (
      <View style={styles.missing}>
        <Body style={{ color: colors.muted }}>{loading ? 'Загрузка…' : 'Товар не найден'}</Body>
      </View>
    );
  }

  const quantity = quantityOf(product.id);
  const images = product.images.length ? product.images : [undefined];

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: '' }} />
      <ScrollView>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          {images.map((uri, i) => (
            <ProductImage key={uri ?? i} uri={uri} width={1000} style={{ width, height: width * 1.15 }} />
          ))}
        </ScrollView>
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
            ))}
          </View>
        )}

        <View style={styles.body}>
          {product.mark && <Overline style={{ color: colors.primary }}>{product.mark}</Overline>}
          <Heading style={styles.name}>{product.name}</Heading>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.oldPrice && <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>}
          </View>
          <Ornament />
          {!!product.summary && <Body style={styles.summary}>{product.summary}</Body>}
          {!!product.description && (
            <View style={styles.block}>
              <Overline>Описание</Overline>
              <Body>{product.description}</Body>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {quantity > 0 ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <QuantityStepper
              quantity={quantity}
              onIncrement={() => add(product)}
              onDecrement={() => decrement(product.id)}
            />
            <Button title="Корзина" onPress={() => router.navigate('/cart')} style={{ flex: 1 }} />
          </View>
        ) : (
          <Button title="В корзину" variant="accent" onPress={() => add(product)} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 18 },
  body: { padding: 20, gap: 14, alignItems: 'center' },
  name: { fontSize: 24, lineHeight: 32 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  price: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.primary },
  oldPrice: { fontFamily: fonts.body, fontSize: 16, color: colors.muted, textDecorationLine: 'line-through' },
  block: { gap: 6, alignSelf: 'stretch' },
  summary: { color: colors.muted, textAlign: 'center' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
});
