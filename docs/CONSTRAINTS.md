# Project Constraints

Generated: 2026-04-17
Confirmed by developer: yes

## Project

Don't Tap the White Tile — a React Native Android game. Infinite endless mode: 4-column grid of tiles scrolls upward, player taps black tiles to score. Missing a black tile or tapping a white tile ends the game. Single-player, offline, portrait-only. High score persisted locally.

## Stack & Versions

| Package / Framework | Version | Notes |
|---|---|---|
| Expo SDK | 54 | Released Sep 10, 2025. SDK 55 (Feb 2026) skipped per 6-month rule. |
| React Native | 0.81 | Bundled with Expo 54. |
| React | 19.1 | Bundled with Expo 54. |
| TypeScript | 5.9 | Expo 54 template default. Strict mode. |
| Expo Router | 6.x | File-based routing. Default in SDK 54 template (`src/app/`). |
| NativeWind | 4.1 | v5 is pre-release — do NOT use. |
| Tailwind CSS | 3.4 | Required by NativeWind 4.1. Do NOT upgrade to Tailwind v4. |
| Zustand | 5.0 | For game state. |
| react-native-mmkv | 3.3.3 | **PIN TO v3.** v4 requires `react-native-nitro-modules` and has open Android build issues on Expo SDK 54 as of Jan 2026. Use API: `new MMKV()` (v3), NOT `createMMKV()` (v4). |
| react-native-reanimated | 3.x | **PIN TO v3.** NativeWind 4.1 does not support Reanimated v4. Expo SDK 54 defaults to v4 — must explicitly downgrade in `package.json`. |
| react-native-gesture-handler | ~2.28 | Expo 54 pinned version. |
| expo-haptics | ~15 (bundled) | Tactile feedback on tap hit, miss, game over. |

## Critical Version Pinning Rules

Two packages deviate from Expo SDK 54's defaults. These must be pinned explicitly in `package.json` BEFORE running `npx expo install --fix`, otherwise Expo's version enforcer will pull incompatible versions:

1. `react-native-reanimated`: pin to `~3.x` (not v4). Reason: NativeWind 4.1 incompatibility.
2. `react-native-mmkv`: pin to `3.3.3` (not v4). Reason: v4 NitroModules build failures on SDK 54 Android.

If Claude Code runs `npx expo install react-native-mmkv` or `npx expo install react-native-reanimated` without checking existing pins, it WILL upgrade to broken versions. Always pass explicit version: `npm install react-native-mmkv@3.3.3 react-native-reanimated@~3.17.0`.

## Language Standards

- **TypeScript**: strict mode ON. No `any`. Explicit return types on exported functions and hooks. Use `type` over `interface` for non-extendable shapes; `interface` for extendable component props.
- **CSS/Styling**: NativeWind className only. No `StyleSheet.create` except where required by Reanimated `useAnimatedStyle` (which returns style objects, not className strings).
- **JS**: ES2022+. No CommonJS. Named exports preferred; default export only where Expo Router requires it (route files).

## Coding Conventions

- **State management**: Single Zustand store for game state (tiles array, score, game status, speed). MMKV persist middleware scoped to high score only — do NOT persist in-flight game state.
- **Game loop**: Reanimated worklets running on the UI thread for tile position updates. No `setInterval` or `requestAnimationFrame` on the JS thread for the hot path. Score increments and game-over checks can cross to JS thread via `runOnJS`.
- **Components**: Functional with hooks. No class components. No `React.FC`. Use explicit prop types.
- **Custom hooks**: Extract game loop logic into `useGameLoop` hook. Extract tile generation into `useTileSpawner` hook. Screen components should be thin.
- **File structure**: Expo SDK 54 default — `src/app/` for routes, `src/components/` for reusable UI, `src/hooks/` for custom hooks, `src/stores/` for Zustand stores, `src/lib/` for pure utilities (tile math, score logic), `src/types/` for shared types.
- **Abstractions**: minimal. This is a one-screen game. No service layer, no DI, no factory patterns for tiles. Inline logic unless there is clear reuse.
- **Naming**: camelCase for variables/functions, PascalCase for components and types. File names: PascalCase for components (`TileGrid.tsx`), camelCase for hooks (`useGameLoop.ts`), kebab-case for non-component files is NOT used — match file name to primary export.

## Platform Configuration

- **Target platform**: Android only. iOS is NOT a v1 goal.
- **Min Android version**: Android 11 (API 30, Sept 2020).
- **Target SDK**: Android 16 (API 36, Expo SDK 54 default).
- **Orientation**: Portrait locked via `app.json` → `"orientation": "portrait"`.
- **Architecture**: New Architecture enabled (Expo SDK 54 default).
- **Build type**: Development build (not Expo Go). MMKV and Reanimated require native code. Use `npx expo prebuild` then build with Android Studio or EAS Build.

## Feedback & Assets

- **Haptics**: `expo-haptics` for tap feedback. Light impact on correct tap, notification error on wrong tap or miss, heavy impact on game over.
- **No audio**: sound effects are NOT in v1 scope.
- **No image assets in v1**: tiles are solid colors rendered via Views. No sprite sheets, no external images beyond the Expo default app icon and splash screen.

## Explicit Exclusions

- No Redux / Redux Toolkit.
- No AsyncStorage (MMKV replaces it).
- No Reanimated v4.
- No NativeWind v5.
- No `expo-av` (deprecated, removed in SDK 55).
- No Animated API for the tile scrolling hot path (use Reanimated worklets instead).
- No iOS-specific code paths or iOS build configuration in v1.
- No backend, no network calls, no analytics SDK, no ads SDK in v1.
- No test framework setup in v1 (can be added later).
- No speculative abstractions. If a pattern is only used once, inline it.

## Handoff Instruction for Implementation Agent

Before implementing any task, read this file first.
Apply every constraint in this file to every file you create or modify.
If a task requires deviating from any constraint, stop and ask before proceeding.
Do not assume any version, pattern, or convention not listed here.

Pay particular attention to the **Critical Version Pinning Rules** section — those are the two most likely places to get this project stuck in dependency hell.

