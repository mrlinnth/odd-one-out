import React from 'react';
import { Text, View } from 'react-native';
import { useGameStore } from '../stores/gameStore';

export default function SplashScreen(): React.JSX.Element {
  const highScore = useGameStore((state) => state.highScore);

  return (
    <View className="flex-1 items-center justify-center bg-[#FAFAFA]">
      <Text className="text-4xl font-bold text-[#1A1A1A] mb-2">Don't Tap the Fruit</Text>
      <Text className="text-3xl mb-8">🍎</Text>
      {highScore > 0 && (
        <Text className="text-lg text-[#1A1A1A] mb-8">High Score: {highScore}</Text>
      )}
      <Text className="text-xl text-[#1A1A1A]">Tap to Start</Text>
    </View>
  );
}
