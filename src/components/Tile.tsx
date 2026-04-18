import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors } from '../lib/colors';

interface TileProps {
  emoji: string;
  size: number;
}

export function Tile({ emoji, size }: TileProps): React.JSX.Element {
  return (
    <View style={[styles.tile, { width: size, height: size }]}>
      <Text style={{ fontSize: size * 0.55, lineHeight: size * 0.7 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.bg.gap,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
