import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '../theme';

type Props = { quantity: number; onIncrement: () => void; onDecrement: () => void; compact?: boolean };

export function QuantityStepper({ quantity, onIncrement, onDecrement, compact }: Props) {
  return (
    <View style={[styles.row, compact && styles.compact]}>
      <Pressable onPress={onDecrement} style={styles.btn} hitSlop={6}>
        <Text style={styles.btnText}>−</Text>
      </Pressable>
      <Text style={styles.qty}>{quantity}</Text>
      <Pressable onPress={onIncrement} style={styles.btn} hitSlop={6}>
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius,
    height: 48,
  },
  compact: { height: 38 },
  btn: { width: 44, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 20, color: colors.accent, fontFamily: fonts.medium },
  qty: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
});
