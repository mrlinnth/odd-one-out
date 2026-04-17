# CLAUDE.md

Read this file before touching any file in this repo. All constraints apply to every file you create or modify. If a task requires deviating from anything here, stop and ask before proceeding.

Read docs/CONSTRAINTS.md, docs/V1-SCOPE.md, docs/IMPLEMENTATION-PLAN.md, and docs/SESSION-LOG.md (especially recent entries) before starting. Pull latest from main. Append a new entry to SESSION-LOG.md at the end of the session summarizing what you did.

Full details live in `docs/CONSTRAINTS.md` and `docs/V1-SCOPE.md`. This file is the distilled working reference.

---

## Project

"Don't Tap the Fruit" — a single-player, offline, portrait-only Android game built with Expo SDK 54. A 4-column grid of emoji tiles scrolls upward. Each row has 3 "common" emoji and 1 "target" emoji (the odd-one-out). Tap the target before it leaves the screen. Tapping a wrong tile or missing the target ends the game. Score scales with speed. High score is persisted locally via MMKV.

---

## ⚠️ Critical Version Pins — Read First

Two packages deviate from Expo SDK 54 defaults. **These must be pinned in `package.json` before running any `expo install` command**, otherwise Expo's resolver will pull incompatible versions.

### 1. `react-native-reanimated` — pin to v3 (NOT v4)

NativeWind 4.1 does not support Reanimated v4. Expo SDK 54 defaults to v4 — you must override.

```
npm install react-native-reanimated@~3.17.0
```

**Never run** `npx expo install react-native-reanimated` without an explicit version — it will upgrade to v4.

### 2. `react-native-mmkv` — pin to 3.3.3 (NOT v4)

MMKV v4 requires `react-native-nitro-modules` and has open Android build failures on Expo SDK 54 as of Jan 2026. Use the v3 API: `new MMKV()` — **not** `createMMKV()` (v4 API).

```
npm install react-native-mmkv@3.3.3
```

**Never run** `npx expo install react-native-mmkv` without the explicit version.

### Rule for `npx expo install --fix`

Do **not** run `npx expo install --fix` without first confirming that both pins above are already locked in `package.json`. If in doubt, ask before running it.

---

## Stack & Locked Versions

| Package | Version | Notes |
|---|---|---|
| Expo SDK | 54 | SDK 55 (Feb 2026) skipped — 6-month rule |
| React Native | 0.81 | Bundled with Expo 54 |
| React | 19.1 | Bundled with Expo 54 |
| TypeScript | 5.9 | Strict mode ON |
| Expo Router | 6.x | File-based routing; routes live in `src/app/` |
| NativeWind | 4.1 | v5 is pre-release — do NOT use |
| Tailwind CSS | 3.4 | Required by NativeWind 4.1 — do NOT upgrade to v4 |
| Zustand | 5.0 | Game state store |
| react-native-mmkv | **3.3.3** | **Pinned. See above.** |
| react-native-reanimated | **~3.x** | **Pinned. See above.** |
| react-native-gesture-handler | ~2.28 | Expo 54 pinned version |
| expo-haptics | ~15 | Bundled with Expo 54 |

---

## Language Standards

- **TypeScript**: strict mode ON. No `any`. Explicit return types on all exported functions and hooks.
- Use `type` for non-extendable shapes; `interface` for extendable component props.
- **Styling**: NativeWind `className` only. No `StyleSheet.create` except inside `useAnimatedStyle` (Reanimated requires style objects there, not className strings).
- **JS**: ES2022+. No CommonJS (`require`). Named exports preferred; default export only where Expo Router requires it (route files under `src/app/`).

---

## Coding Conventions

### State management

- Single Zustand store (`src/stores/gameStore.ts`) for all game state.
- MMKV persist middleware scoped to `highScore` **only**. Never persist `rows`, `status`, or any in-flight game state.
- Full store shape:

```ts
{
  status: 'idle' | 'playing' | 'gameOver';
  score: number;
  highScore: number;           // persisted via MMKV
  currentSpeed: number;        // px/s, derived from score
  commonCategory: string;
  targetCategory: string;
  rows: Row[];
  lastCategoryRotationScore: number;
}
```

### Game loop

- Tile position updates run as **Reanimated worklets on the UI thread**. No `setInterval` or `requestAnimationFrame` on the JS thread for the hot path.
- Score increments and game-over checks may cross to JS thread via `runOnJS`.

### Components

- Functional components with hooks only. No class components. No `React.FC`.
- Explicit prop types (use `interface` for component props).

### Custom hooks

- `useGameLoop` — game loop / animation logic.
- `useTileSpawner` — tile generation logic.
- Screen components (`src/app/*.tsx`) should be thin; push logic into hooks.

### Abstractions

Minimal. This is a one-screen game. No service layer, no DI, no factory patterns. Inline logic unless there is clear reuse. If a pattern is only used once, do not abstract it.

### Naming

- `camelCase` for variables and functions.
- `PascalCase` for components and types.
- File names match the primary export: `TileGrid.tsx` for a component, `useGameLoop.ts` for a hook.
- No kebab-case file names.

---

## File Structure

```
src/
  app/
    index.tsx       # Splash / Start screen (default export for Expo Router)
    game.tsx        # Game screen (default export for Expo Router)
  components/       # Reusable UI (TileGrid, Tile, ScoreDisplay, GameOverOverlay, …)
  hooks/            # useGameLoop.ts, useTileSpawner.ts, …
  stores/           # gameStore.ts (Zustand)
  lib/
    gameConfig.ts   # All tuning constants (baseSpeed, speedIncrement, maxSpeed, …)
    tileUtils.ts    # Pure tile math and score logic
  types/            # Shared TypeScript types
```

### Tuning constants (`src/lib/gameConfig.ts`)

All gameplay parameters are named exports here so tuning is a one-file change:

```ts
export const BASE_SPEED = 180;          // px/s
export const SPEED_INCREMENT = 4;       // px/s per point
export const MAX_SPEED = 900;           // px/s
export const CATEGORY_ROTATION_INTERVAL = 10; // points
export const TILE_CLEARED_OPACITY = 0.3;
export const GAME_OVER_HAPTIC_DELAY = 200;    // ms
```

---

## Platform & Build

- **Target platform**: Android only. No iOS code paths, no iOS build config in v1.
- **Min Android version**: Android 11 (API 30).
- **Target SDK**: Android 16 (API 36, Expo 54 default).
- **Orientation**: Portrait locked (`app.json` → `"orientation": "portrait"`).
- **Architecture**: New Architecture enabled (Expo 54 default).
- **Runtime**: Development build — **not Expo Go**. MMKV and Reanimated require native code.

Build commands:
```
npx expo prebuild
# then:
npx expo run:android
# or EAS Build
```

---

## Screens

| Route | File | Notes |
|---|---|---|
| Splash / Start | `src/app/index.tsx` | Title, high score, "Tap to Start" |
| Game | `src/app/game.tsx` | Scrolling grid, score, category cue |
| Game Over | Overlay on game screen | Not a separate route |

Navigation flow: `Splash → Game → GameOver overlay → Game (reset)`. No back to splash in v1.

---

## Haptic Events

| Event | Haptic |
|---|---|
| Correct tap | `ImpactFeedbackStyle.Light` |
| Wrong tap | `NotificationFeedbackType.Error` |
| Missed target (scrolled off) | `NotificationFeedbackType.Error` |
| Game over | `ImpactFeedbackStyle.Heavy` (200 ms after error haptic) |
| Category rotation | `ImpactFeedbackStyle.Medium` |
| New high score | `NotificationFeedbackType.Success` (replaces Heavy) |

Do not check for haptic availability — just fire them. Silent-mode suppression is acceptable v1 behavior.

---

## Visual Design

- Light mode only. No dark mode, no system-follow.
- Background: `#FAFAFA`.
- Tile background: `#F0F0F0`, rounded corners, 2–4 px gap between tiles.
- Cleared tile: 30% opacity on emoji; tile background unchanged.
- Emoji size: ~60% of tile width, centered.
- Score text: large, `#1A1A1A`.
- Animations allowed: scrolling motion, cleared-tile opacity fade, category rotation flash. Nothing else.

---

## Emoji Categories

All emojis must be pre-2018 Unicode (consistent rendering on Android 11+):

- **Fruits**: 🍎 🍊 🍌 🍇 🍓 🍉 🍒 🍑 🍍 🍋
- **Animals**: 🐶 🐱 🐭 🐰 🐻 🐼 🐯 🦁 🐮 🐷
- **Vehicles**: 🚗 🚕 🚌 🚚 🚲 🏍 🚆 ✈️ ⛵
- **Food**: 🍕 🍔 🍟 🌭 🌮 🍣 🍞 🧀 🥚 🍪
- **Sports**: ⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 ⛳
- **Nature**: 🌲 🌸 🍃 🌻 🌵 🍄 🍀 🌹 🌷

Category rotation every 10 points: new `common` ≠ previous `common`; new `target` ≠ previous `target`.

---

## Explicit Exclusions

Do not add any of the following — they are out of scope for v1:

- Redux / Redux Toolkit
- AsyncStorage (MMKV replaces it)
- Reanimated v4
- NativeWind v5
- Tailwind v4
- `expo-av` or any audio
- Animated API for the tile-scrolling hot path
- iOS code paths or iOS build config
- Backend, network calls, analytics SDK, ads SDK
- Settings screen, pause button, or any toggles
- Multiple game modes, power-ups, leaderboards, social sharing
- Dark mode or theme switching
- Localization
- Test framework setup
- Tablet or landscape layout
- Tutorial screen
- Particle effects or score count-up animations

---

## Definition of Done (v1)

- All three screens implemented per `docs/V1-SCOPE.md`.
- Linear speed ramp working, capping at `MAX_SPEED`.
- Category rotation every 10 points with rotation haptic.
- Both fail conditions (wrong tap, missed target) trigger game-over overlay.
- Haptics fire on all listed events.
- High score persists across restarts via MMKV.
- 60 fps on Android 11+ mid-range devices (Reanimated worklets on UI thread).
- APK builds cleanly: `npx expo prebuild && npx expo run:android`.
- Zero TypeScript errors in strict mode.
- Zero runtime warnings in dev mode.
