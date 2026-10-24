import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { findSettlement, searchSettlements } from '../data/settlements';
import { colors, fonts } from '../theme';
import { formatPrice } from '../utils/format';
import { Overline } from './Typography';

type Props = { value: string; onChange: (name: string) => void };

const priceLabel = (price: number | null) => (price === null ? 'уточнит менеджер' : formatPrice(price));

// Поиск населённого пункта из списка с ценами доставки.
export function SettlementPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('');

  if (value) {
    const known = findSettlement(value);
    return (
      <View style={{ gap: 6 }}>
        <Overline>Населённый пункт</Overline>
        <View style={styles.selected}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{value}</Text>
            <Text style={styles.price}>Доставка: {priceLabel(known?.price ?? null)}</Text>
          </View>
          <Pressable
            onPress={() => {
              setQuery('');
              onChange('');
            }}
            hitSlop={8}
          >
            <Text style={styles.change}>Изменить</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const results = searchSettlements(query);
  const exact = query.trim() && findSettlement(query);

  return (
    <View style={{ gap: 6 }}>
      <Overline>Населённый пункт</Overline>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Начните вводить: Хабез, Карачаевск…"
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCorrect={false}
      />
      {results.length > 0 && (
        <View style={styles.list}>
          {results.map((s) => (
            <Pressable key={s.name} onPress={() => onChange(s.name)} style={styles.row}>
              <Text style={styles.rowName}>{s.name}</Text>
              <Text style={styles.rowPrice}>{priceLabel(s.price)}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {query.trim().length > 1 && !exact && (
        <Pressable onPress={() => onChange(query.trim())} style={styles.other}>
          <Text style={styles.otherText}>
            Нет в списке — указать «{query.trim()}», стоимость уточнит менеджер
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  list: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.cream,
  },
  rowName: { fontFamily: fonts.body, fontSize: 15, color: colors.text, flex: 1 },
  rowPrice: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary },
  other: { paddingVertical: 6 },
  otherText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textDecorationLine: 'underline' },
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 12,
    backgroundColor: colors.background,
  },
  name: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  price: { fontFamily: fonts.body, fontSize: 13, color: colors.primary, marginTop: 2 },
  change: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textDecorationLine: 'underline' },
});
