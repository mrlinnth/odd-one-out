import React, { useCallback, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { Tile } from './Tile';
import { useGameLoop } from '../hooks/useGameLoop';
import { EMOJI_CATEGORIES, CATEGORY_NAMES } from '../lib/emojis';

interface RowData {
  id: string;
  birthOffset: number;
  emojis: [string, string, string, string];
}

function generateRowEmojis(): [string, string, string, string] {
  const name = CATEGORY_NAMES[Math.floor(Math.random() * CATEGORY_NAMES.length)];
  const pool = EMOJI_CATEGORIES[name];
  return [0, 1, 2, 3].map(
    () => pool[Math.floor(Math.random() * pool.length)],
  ) as [string, string, string, string];
}

interface TileRowProps {
  emojis: [string, string, string, string];
  birthOffset: number;
  scrollOffset: SharedValue<number>;
  tileSize: number;
  screenHeight: number;
}

function TileRow({
  emojis,
  birthOffset,
  scrollOffset,
  tileSize,
  screenHeight,
}: TileRowProps): React.JSX.Element {
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateY: screenHeight - (scrollOffset.value - birthOffset) }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: tileSize,
          flexDirection: 'row',
        },
        animatedStyle,
      ]}
    >
      {emojis.map((emoji, idx) => (
        <Tile key={idx} emoji={emoji} size={tileSize} />
      ))}
    </Animated.View>
  );
}

function buildInitialRows(tileSize: number, screenHeight: number): RowData[] {
  const n = Math.ceil(screenHeight / tileSize) + 2;
  return Array.from({ length: n }, (_, i) => ({
    id: String((i - (n - 1)) * tileSize),
    birthOffset: (i - (n - 1)) * tileSize,
    emojis: generateRowEmojis(),
  }));
}

export function TileGrid(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const tileSize = Math.floor(width / 4);

  const [rows, setRows] = useState<RowData[]>(() =>
    buildInitialRows(tileSize, height),
  );

  const onRowNeeded = useCallback(
    (birthOffset: number, currentScrollOffset: number) => {
      const cutoff = currentScrollOffset - height - 2 * tileSize;
      setRows((prev) => {
        const pruned = prev.filter((r) => r.birthOffset >= cutoff);
        const newRow: RowData = {
          id: String(birthOffset),
          birthOffset,
          emojis: generateRowEmojis(),
        };
        return [...pruned, newRow];
      });
    },
    [],
  );

  const { scrollOffset } = useGameLoop({
    tileHeight: tileSize,
    screenHeight: height,
    onRowNeeded,
  });

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      {rows.map((row) => (
        <TileRow
          key={row.id}
          emojis={row.emojis}
          birthOffset={row.birthOffset}
          scrollOffset={scrollOffset}
          tileSize={tileSize}
          screenHeight={height}
        />
      ))}
    </View>
  );
}
