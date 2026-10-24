import { StyleSheet, Text, TextProps, View } from 'react-native';

import { colors, fonts } from '../theme';

export function Heading({ style, children, ...rest }: TextProps) {
  return (
    <Text style={[styles.heading, style]} {...rest}>
      {typeof children === 'string' ? children.toUpperCase() : children}
    </Text>
  );
}

export function Overline({ style, children, ...rest }: TextProps) {
  return (
    <Text style={[styles.overline, style]} {...rest}>
      {typeof children === 'string' ? children.toUpperCase() : children}
    </Text>
  );
}

export function Body({ style, ...rest }: TextProps) {
  return <Text style={[styles.body, style]} {...rest} />;
}

// Ромбик-разделитель, как на сайте.
export function Ornament() {
  return (
    <View style={styles.ornament}>
      <View style={styles.line} />
      <View style={styles.diamond} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: fonts.heading, fontSize: 26, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  overline: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2.5, color: colors.muted },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.text },
  ornament: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  line: { width: 48, height: 1, backgroundColor: colors.peach },
  diamond: { width: 8, height: 8, borderWidth: 1, borderColor: colors.peach, transform: [{ rotate: '45deg' }] },
});
