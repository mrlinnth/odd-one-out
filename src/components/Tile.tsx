import React from 'react';
import { Text, View } from 'react-native';

interface TileProps {
  emoji: string;
  size: number;
}

export function Tile({ emoji, size }: TileProps): React.JSX.Element {
  return (
    <View
      style={{ width: size, height: size }}
      className="bg-[#F0F0F0] items-center justify-center"
    >
      <Text style={{ fontSize: size * 0.55, lineHeight: size * 0.7 }}>{emoji}</Text>
    </View>
  );
}
