import { Image, ImageStyle, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Product } from '../data/products';

type Props = { product: Product; size: number; style?: ViewStyle };

export function ProductImage({ product, size, style }: Props) {
  if (product.image) {
    return <Image source={{ uri: product.image }} style={[{ height: size }, styles.box as ImageStyle, style as ImageStyle]} />;
  }
  return (
    <View style={[{ height: size, backgroundColor: product.tint }, styles.box, style]}>
      <Text style={{ fontSize: size * 0.45 }}>{product.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: '100%', alignItems: 'center', justifyContent: 'center' },
});
