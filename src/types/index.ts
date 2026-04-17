export type GameStatus = 'idle' | 'playing' | 'gameOver';

export interface Tile {
  id: string;
  emoji: string;
  isTarget: boolean;
  isCleared: boolean;
}

export interface Row {
  id: string;
  tiles: Tile[];
}
