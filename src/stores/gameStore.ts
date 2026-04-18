import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { BASE_SPEED } from '../lib/gameConfig';
import type { GameStatus, Row } from '../types';

const HIGH_SCORE_KEY = 'high_score';

function loadHighScore(): number {
  const val = SecureStore.getItem(HIGH_SCORE_KEY);
  return val !== null ? parseInt(val, 10) : 0;
}

export function saveHighScore(score: number): void {
  SecureStore.setItem(HIGH_SCORE_KEY, String(score));
}

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

export const useGameStore = create<GameStore>()((set) => ({
  status: 'idle',
  score: 0,
  highScore: loadHighScore(),
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
}));
