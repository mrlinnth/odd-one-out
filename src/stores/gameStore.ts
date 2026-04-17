import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { BASE_SPEED } from '../lib/gameConfig';
import type { GameStatus, Row } from '../types';

const storage = new MMKV();

const mmkvStorage = {
  getItem: (name: string): string | null => storage.getString(name) ?? null,
  setItem: (name: string, value: string): void => { storage.set(name, value); },
  removeItem: (name: string): void => { storage.delete(name); },
};

interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  currentSpeed: number;
  commonCategory: string;
  targetCategory: string;
  rows: Row[];
  lastCategoryRotationScore: number;
}

interface GameActions {
  startGame: () => void;
  resetGame: () => void;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      status: 'idle',
      score: 0,
      highScore: 0,
      currentSpeed: BASE_SPEED,
      commonCategory: 'fruits',
      targetCategory: 'animals',
      rows: [],
      lastCategoryRotationScore: 0,

      startGame: (): void => {
        set({ status: 'playing', score: 0, rows: [], currentSpeed: BASE_SPEED, lastCategoryRotationScore: 0 });
      },

      resetGame: (): void => {
        set({ status: 'idle', score: 0, rows: [], currentSpeed: BASE_SPEED, lastCategoryRotationScore: 0 });
      },
    }),
    {
      name: 'game-high-score',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state): Pick<GameState, 'highScore'> => ({ highScore: state.highScore }),
    },
  ),
);
