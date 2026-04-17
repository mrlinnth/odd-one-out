import { useEffect } from 'react';
import {
  useSharedValue,
  useFrameCallback,
  runOnJS,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { BASE_SPEED } from '../lib/gameConfig';

interface UseGameLoopOptions {
  tileHeight: number;
  screenHeight: number;
  onRowNeeded: (birthOffset: number, currentScrollOffset: number) => void;
}

interface UseGameLoopReturn {
  scrollOffset: SharedValue<number>;
}

export function useGameLoop({
  tileHeight,
  screenHeight: _screenHeight,
  onRowNeeded,
}: UseGameLoopOptions): UseGameLoopReturn {
  const scrollOffset = useSharedValue(0);
  const nextBirthOffset = useSharedValue(tileHeight);
  const speed = useSharedValue(BASE_SPEED);

  const frameCallback = useFrameCallback((frameInfo) => {
    'worklet';
    const dt = (frameInfo.timeSincePreviousFrame ?? 16) / 1000;
    scrollOffset.value += speed.value * dt;

    if (scrollOffset.value >= nextBirthOffset.value - tileHeight) {
      const b = nextBirthOffset.value;
      nextBirthOffset.value += tileHeight;
      runOnJS(onRowNeeded)(b, scrollOffset.value);
    }
  }, false);

  useEffect(() => {
    frameCallback.setActive(true);
    return () => {
      frameCallback.setActive(false);
    };
  }, [frameCallback]);

  return { scrollOffset };
}
