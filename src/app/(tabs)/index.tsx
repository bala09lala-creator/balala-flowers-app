import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ProductCard } from '../../components/ProductCard';
import { SHOP } from '../../config/shop';
import { CATEGORIES, Category, PRODUCTS } from '../../data/products';
import { colors, radius } from '../../theme';

export default function CatalogScreen() {
  const [category, setCategory] = useState<Category>('all');
  const [query, setQuery] = useState('');

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.composition.toLowerCase().includes(q)),
    );
  }, [category, query]);

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ gap: 14 }}>
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>{SHOP.slogan}</Text>
            <Text style={styles.bannerText}>
              Бесплатная доставка от {SHOP.freeDeliveryFrom.toLocaleString('ru-RU')} ₽
            </Text>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Поиск: розы, тюльпаны…"
            placeholderTextColor={colors.muted}
            style={styles.search}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CATEGORIES.map((c) => {
              const active = c.id === category;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategory(c.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && { color: '#fff' }]}>{c.title}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Ничего не нашлось 🌱</Text>}
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  banner: { backgroundColor: colors.primary, borderRadius: radius, padding: 18, gap: 4 },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  bannerText: { color: '#FFE3EC', fontSize: 14 },
  search: {
    backgroundColor: colors.card,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '500' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40, fontSize: 16 },
});
