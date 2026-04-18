# Project Constraints

Generated: 2026-04-17
Updated: 2026-04-18 — Stack migration: dropped NativeWind, upgraded Reanimated to v4, replaced MMKV with expo-secure-store.
Confirmed by developer: yes

## Project

Odd One Out — a React Native Android game. Infinite endless mode: 4-column grid of emoji tiles scrolls upward, player taps the odd-one-out emoji before it scrolls off screen. Missing the target or tapping a wrong tile ends the game. Single-player, offline, portrait-only. High score persisted locally.

## Stack & Versions

| Package / Framework | Version | Notes |
|---|---|---|
| Expo SDK | 54 | Released Sep 10, 2025. SDK 55 (Feb 2026) skipped per 6-month rule. |
| React Native | 0.81 | Bundled with Expo 54. |
| React | 19.1 | Bundled with Expo 54. |
| TypeScript | 5.9 | Expo 54 template default. Strict mode. |
| Expo Router | 6.x | File-based routing. Default in SDK 54 template (`src/app/`). |
| Zustand | 5.0 | For game state. |
| expo-secure-store | ~15 (bundled) | High score persistence. Replaces MMKV — see Migration Notes below. |
| react-native-reanimated | ~4.3.0 | UI-thread worklets for tile scrolling. See Migration Notes below. |
| react-native-worklets | ~0.8.1 | Required peer dependency of Reanimated v4. |
| react-native-gesture-handler | ~2.28 | Expo 54 pinned version. |
| expo-haptics | ~15 (bundled) | Tactile feedback on tap hit, miss, game over. |

## Migration Notes (2026-04-18)

Three stack changes from the original CONSTRAINTS.md. This section explains why.

### 1. NativeWind removed, StyleSheet.create adopted

NativeWind 4.1 required Reanimated v3. Reanimated v3 does not compile against React Native 0.81 (confirmed: `BorderRadiiDrawableUtils.java` and `Systrace.TRACE_TAG_REACT_JAVA_BRIDGE` reference removed RN internals). NativeWind v5 is pre-release and violates the 6-month stability rule. Dropping NativeWind entirely and using `StyleSheet.create` removes the conflict and has zero dependency risk.

Removed packages: `nativewind`, `tailwindcss`.
Removed config files: `tailwind.config.js`, any NativeWind-related Babel or Metro config.

### 2. Reanimated upgraded from v3 to v4.3.x

Reanimated v3 is no longer maintained and does not compile on RN 0.81. Reanimated 4.3.x supports RN 0.81, requires New Architecture (already enabled in Expo SDK 54), and the API is backwards-compatible with v3 code (useSharedValue, useAnimatedStyle, worklets, runOnJS all work the same).

New peer dependency: `react-native-worklets@~0.8.1`. Must be installed alongside Reanimated.

Babel plugin change: Reanimated v4 docs recommend `react-native-worklets/plugin` in `babel.config.js` instead of `react-native-reanimated/plugin`. The old plugin path still works but should be updated.

### 3. MMKV replaced with expo-secure-store

MMKV v3 does not compile on RN 0.81. MMKV v4 requires `react-native-nitro-modules`, which has had a history of Android build failures on Expo SDK 54 (issues #881, #917, #931, #958, #979, #980, #985, #1003). The build issues are mostly resolved in MMKV 4.3.1 + nitro-modules 0.35.4, but the dependency chain adds complexity for no benefit — we persist exactly one integer (high score).

`expo-secure-store` is bundled with Expo SDK 54, requires zero additional native dependencies, and has both sync and async APIs. Values are stored as strings, so the high score is stored as `String(score)` and parsed back with `parseInt`.

Removed packages: `react-native-mmkv`.
Not needed: `react-native-nitro-modules`.

## Critical Version Notes

Reanimated v4 is now the **default** for Expo SDK 54, so `npx expo install react-native-reanimated` will install the correct version. However, ensure `react-native-worklets` is also installed — it is a required peer dependency that is NOT auto-installed:

```
npx expo install react-native-reanimated react-native-worklets
```

There are no version pins that deviate from Expo SDK 54 defaults in the current stack. This is intentional — every package now aligns with what Expo expects.

## Language Standards

- **TypeScript**: strict mode ON. No `any`. Explicit return types on exported functions and hooks. Use `type` over `interface` for non-extendable shapes; `interface` for extendable component props.
- **Styling**: `StyleSheet.create` for all styles. Define a shared color constants file (`src/lib/colors.ts`) exporting the brand palette from BRAND.md. Reference colors by constant name, never by inline hex string.
- **JS**: ES2022+. No CommonJS. Named exports preferred; default export only where Expo Router requires it (route files).

## Coding Conventions

- **State management**: Single Zustand store for game state (tiles array, score, game status, speed). High score read from `expo-secure-store` on app launch and written on game over. Do NOT use Zustand persist middleware — the store is ephemeral except for the high score, which is managed directly via SecureStore.
- **Game loop**: Reanimated worklets running on the UI thread for tile position updates. No `setInterval` or `requestAnimationFrame` on the JS thread for the hot path. Score increments and game-over checks can cross to JS thread via `runOnJS`.
- **Components**: Functional with hooks. No class components. No `React.FC`. Use explicit prop types.
- **Custom hooks**: Extract game loop logic into `useGameLoop` hook. Extract tile generation into `useTileSpawner` hook. Screen components should be thin.
- **File structure**: Expo SDK 54 default — `src/app/` for routes, `src/components/` for reusable UI, `src/hooks/` for custom hooks, `src/stores/` for Zustand stores, `src/lib/` for pure utilities (tile math, score logic, colors, config), `src/types/` for shared types.
- **Abstractions**: minimal. This is a one-screen game. No service layer, no DI, no factory patterns for tiles. Inline logic unless there is clear reuse.
- **Naming**: camelCase for variables/functions, PascalCase for components and types. File names: PascalCase for components (`TileGrid.tsx`), camelCase for hooks (`useGameLoop.ts`), kebab-case for non-component files is NOT used — match file name to primary export.

## Platform Configuration

- **Target platform**: Android only. iOS is NOT a v1 goal.
- **Min Android version**: Android 11 (API 30, Sept 2020).
- **Target SDK**: Android 16 (API 36, Expo SDK 54 default).
- **Orientation**: Portrait locked via `app.json` → `"orientation": "portrait"`.
- **Architecture**: New Architecture enabled (Expo SDK 54 default). Required by Reanimated v4.
- **Build type**: Development build (not Expo Go). Reanimated requires native code. Use `npx expo prebuild` then build with Android Studio or EAS Build.

## Feedback & Assets

- **Haptics**: `expo-haptics` for tap feedback. Light impact on correct tap, notification error on wrong tap or miss, heavy impact on game over.
- **No audio**: sound effects are NOT in v1 scope.
- **No image assets in v1**: tiles are emoji rendered via Text inside Views. No sprite sheets, no external images beyond the app icon and splash screen.

## Explicit Exclusions

- No Redux / Redux Toolkit.
- No NativeWind (removed — see Migration Notes).
- No Tailwind CSS (removed — see Migration Notes).
- No MMKV (removed — see Migration Notes).
- No react-native-nitro-modules (not needed without MMKV v4).
- No AsyncStorage (expo-secure-store replaces it).
- No Reanimated v3 (broken on RN 0.81, unmaintained).
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

Pay particular attention to the **Migration Notes** section — it explains why the stack changed and what was removed.
