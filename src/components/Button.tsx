import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, fonts, radius } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'outline';
  size?: 'normal' | 'small';
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', size = 'normal', disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        size === 'small' && styles.small,
        styles[variant],
        (pressed || disabled) && { opacity: 0.7 },
        style,
      ]}
    >
      <Text
        style={[styles.text, size === 'small' && styles.smallText, variant === 'outline' && { color: colors.primary }]}
      >
        {title.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: radius, alignItems: 'center' },
  small: { paddingVertical: 10, paddingHorizontal: 8 },
  primary: { backgroundColor: colors.primary },
  accent: { backgroundColor: colors.accent },
  outline: { borderWidth: 1, borderColor: colors.primary, backgroundColor: 'transparent' },
  text: { color: '#fff', fontSize: 13, fontFamily: fonts.semibold, letterSpacing: 1.5 },
  smallText: { fontSize: 11, letterSpacing: 1 },
});
