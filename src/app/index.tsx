import React from 'react';
import { View } from 'react-native';
import { TileGrid } from '../components/TileGrid';

export default function HomeScreen(): React.JSX.Element {
  return (
    <View className="flex-1 bg-[#FAFAFA]">
      <TileGrid />
    </View>
  );
}
