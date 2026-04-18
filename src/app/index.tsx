import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TileGrid } from '../components/TileGrid';
import { colors } from '../lib/colors';

export default function HomeScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <TileGrid />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.screen },
});
