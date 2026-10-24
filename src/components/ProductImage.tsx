import { Image } from 'expo-image';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { thumbnail } from '../data/catalog';
import { colors } from '../theme';

const logo = require('../../assets/images/logo.png');

type Props = { uri?: string; width?: number; style?: ViewStyle };

export function ProductImage({ uri, width = 400, style }: Props) {
  return (
    <View style={[styles.box, style]}>
      {uri ? (
        <Image
          source={{ uri: thumbnail(uri, width) }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          recyclingKey={uri}
        />
      ) : (
        <Image source={logo} style={styles.logo} contentFit="contain" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logo: { width: '40%', height: '40%', opacity: 0.4 },
});
