import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, ImageBackground } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { ProductCard } from '../../components/ProductCard';
import { Heading, Ornament, Overline } from '../../components/Typography';
import { SHOP } from '../../config/shop';
import { useCatalog } from '../../context/CatalogContext';
import { CATEGORIES, PRICE_RANGES } from '../../data/catalog';
import { colors, fonts } from '../../theme';

const logo = require('../../../assets/images/logo.png');
const carpet = require('../../../assets/images/carpet.jpg');

function Chips({
  items,
  value,
  onChange,
}: {
  items: { id: string; title: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
    >
      {items.map((c) => {
        const active = c.id === value;
        return (
          <Pressable key={c.id} onPress={() => onChange(c.id)} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && { color: colors.cream }]}>{c.title.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const { products, loading, error, refresh } = useCatalog();
  const [category, setCategory] = useState('all');
  const [price, setPrice] = useState('all');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => [{ id: 'all', title: 'Все' }, ...CATEGORIES], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const range = PRICE_RANGES.find((r) => r.id === price) ?? PRICE_RANGES[0];
    return products.filter(
      (p) =>
        (category === 'all' || p.categories.includes(category)) &&
        p.price >= range.min &&
        p.price < range.max &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
  }, [products, category, price, query]);

  const header = (
    <View>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Image source={logo} style={styles.topLogo} contentFit="contain" />
        <Pressable onPress={() => Linking.openURL(`tel:${SHOP.phone.replace(/[^\d+]/g, '')}`)}>
          <Text style={styles.phone}>{SHOP.phone}</Text>
        </Pressable>
      </View>

      <ImageBackground source={carpet} style={styles.hero} contentFit="cover">
        <View style={styles.heroOverlay}>
          <View style={styles.heroLine} />
          <Text style={styles.heroTitle}>BALALA</Text>
          <Text style={styles.heroSubtitle}>ЦВЕТОЧНЫЙ МАГАЗИН</Text>
          <View style={{ gap: 8, marginTop: 18 }}>
            {['Свежие цветы каждый день', 'Доставка по Черкесску', 'Букет за 2 часа'].map((t) => (
              <View key={t} style={styles.bullet}>
                <View style={styles.bulletDiamond} />
                <Text style={styles.bulletText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>

      <View style={styles.section}>
        <Ornament />
        <Heading>Наш каталог</Heading>
        <Text style={styles.sectionText}>Выбирайте букеты и подарки с доставкой</Text>
        <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Найти цветы…"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>
      </View>
      <View style={{ gap: 10, marginBottom: 18 }}>
        <Chips items={categories} value={category} onChange={setCategory} />
        <Chips items={PRICE_RANGES} value={price} onChange={setPrice} />
        {products.length > 0 && <Overline style={styles.count}>{filtered.length} товаров</Overline>}
      </View>
    </View>
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(p) => p.id}
      numColumns={2}
      columnWrapperStyle={styles.column}
      contentContainerStyle={{ paddingBottom: 24 }}
      ItemSeparatorComponent={() => <View style={{ height: 22 }} />}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={6}
      windowSize={7}
      refreshControl={
        <RefreshControl refreshing={loading && products.length > 0} onRefresh={refresh} tintColor={colors.primary} />
      }
      ListHeaderComponent={header}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : error ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{error}</Text>
            <Button title="Повторить" variant="outline" onPress={refresh} />
          </View>
        ) : (
          <Text style={[styles.emptyText, { marginTop: 32 }]}>Ничего не нашлось</Text>
        )
      }
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  topLogo: { width: 34, height: 34 },
  phone: { fontFamily: fonts.medium, fontSize: 13, letterSpacing: 1, color: colors.text },
  hero: { height: 420 },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(42, 37, 34, 0.62)',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  heroLine: { width: 56, height: 1, backgroundColor: colors.peach, marginBottom: 20 },
  heroTitle: { fontFamily: fonts.headingBold, fontSize: 56, color: colors.cream, letterSpacing: 2 },
  heroSubtitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.peach, letterSpacing: 5 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bulletDiamond: { width: 7, height: 7, backgroundColor: colors.peach, transform: [{ rotate: '45deg' }] },
  bulletText: { fontFamily: fonts.body, fontSize: 16, color: colors.cream },
  section: { alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 36, paddingBottom: 18 },
  sectionText: { fontFamily: fonts.body, fontSize: 15, color: colors.muted, textAlign: 'center' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 15, fontFamily: fonts.body, color: colors.text },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 1.2, color: colors.text },
  count: { textAlign: 'center', marginTop: 4 },
  column: { gap: 14, paddingHorizontal: 16 },
  empty: { alignItems: 'center', gap: 14, marginTop: 32, paddingHorizontal: 24 },
  emptyText: { fontFamily: fonts.body, fontSize: 15, color: colors.muted, textAlign: 'center' },
});
