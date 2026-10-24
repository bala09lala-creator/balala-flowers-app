import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { SHOP } from '../config/shop';
import { findSettlement, searchSettlements } from '../data/settlements';
import { colors, fonts } from '../theme';
import { formatPrice } from '../utils/format';
import { Overline } from './Typography';

type Props = {
  value: string;
  onChange: (name: string) => void;
  // Текст, введённый, но не выбранный из списка, — тоже уходит в заказ.
  onDraftChange?: (text: string) => void;
};

// Поиск населённого пункта из списка с ценами доставки.
export function SettlementPicker({ value, onChange, onDraftChange }: Props) {
  const [query, setQueryState] = useState('');
  const setQuery = (text: string) => {
    setQueryState(text);
    onDraftChange?.(text);
  };

  if (value) {
    const known = findSettlement(value);
    return (
      <View style={{ gap: 6 }}>
        <Overline>Населённый пункт</Overline>
        <View style={styles.selected}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{value}</Text>
            <Text style={styles.price}>
              Доставка: {known ? formatPrice(known.price) : 'стоимость уточнит менеджер'}
            </Text>
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
              <Text style={styles.rowPrice}>{formatPrice(s.price)}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {query.trim().length > 1 && !findSettlement(query) && (
        <Pressable onPress={() => onChange(query.trim())} style={styles.custom}>
          <Text style={styles.customText}>Указать «{query.trim()}» — стоимость уточнит менеджер</Text>
        </Pressable>
      )}
      <View style={styles.managerBox}>
        <Text style={styles.managerTitle}>Нет вашего населённого пункта в списке?</Text>
        <Text style={styles.managerText}>
          Впишите его или просто оформите заказ — менеджер свяжется с вами, уточнит стоимость доставки и
          пришлёт реквизиты для доплаты. Можно и сразу спросить:
        </Text>
        <View style={styles.managerButtons}>
          <Pressable
            style={styles.managerBtn}
            onPress={() => Linking.openURL(`tel:${SHOP.phone.replace(/[^\d+]/g, '')}`)}
          >
            <Ionicons name="call-outline" size={16} color={colors.primary} />
            <Text style={styles.managerBtnText}>Позвонить</Text>
          </Pressable>
          <Pressable style={styles.managerBtn} onPress={() => Linking.openURL(`https://wa.me/${SHOP.whatsapp}`)}>
            <Ionicons name="logo-whatsapp" size={16} color={colors.primary} />
            <Text style={styles.managerBtnText}>WhatsApp</Text>
          </Pressable>
        </View>
      </View>
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
  custom: { borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', padding: 12 },
  customText: { fontFamily: fonts.medium, fontSize: 14, color: colors.primary },
  managerBox: {
    marginTop: 6,
    padding: 12,
    gap: 6,
    backgroundColor: colors.cream,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  managerTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primary },
  managerText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.text },
  managerButtons: { flexDirection: 'row', gap: 8, marginTop: 4 },
  managerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  managerBtnText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
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
