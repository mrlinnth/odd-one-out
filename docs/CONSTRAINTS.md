# Project Constraints

Generated: 2026-04-17
Updated: 2026-04-18
Confirmed by developer: yes

## Project

Don't Tap the White Tile — a React Native Android game. Infinite endless mode: 4-column grid of tiles scrolls upward, player taps black tiles to score. Missing a black tile or tapping a white tile ends the game. Single-player, offline, portrait-only. High score persisted locally.

## Hard Rules
- No feature may be added that violates the constraints below without updating this document first.
- No pre-release packages. A package must have been at its current major version for at least 6 months before being pinned.
- Pins are set via `npx expo install` where possible, then locked in `package.json`.

## Stack

### Runtime
| Package | Pin | Reason |
|---|---|---|
| expo | ~54.0.0 | Current stable SDK |
| react-native | 0.81.x | Bundled with Expo SDK 54 |
| react | 19.1.x | Bundled with Expo SDK 54 |

### Animation
| Package | Pin | Reason |
|---|---|---|
| react-native-reanimated | ~4.1.0 | Expo SDK 54 requires exactly 4.1.x; do not bump minor |
| react-native-worklets | resolved by expo install | Peer dep of Reanimated; let npx expo install resolve |

Note: Reanimated 4.x requires New Architecture. New Architecture is enabled by default in Expo SDK 54. Do not disable it.

Babel config: `babel-preset-expo` automatically handles the Reanimated/Worklets plugin. Do not add `react-native-reanimated/plugin` or `react-native-worklets/plugin` to `babel.config.js` manually.

### Storage
| Package | Pin | Reason |
|---|---|---|
| react-native-mmkv | ~4.3.0 | v4 is a Nitro Module; requires New Architecture |
| react-native-nitro-modules | ~0.35.0 | Required peer dep of MMKV v4.2+ |

Fallback: if MMKV v4 fails to build on EAS Cloud Build, downgrade to react-native-mmkv ~3.3.0, which has no Nitro dependency and builds cleanly on Expo SDK 54.

### Haptics
| Package | Pin | Reason |
|---|---|---|
| expo-haptics | bundled with SDK 54 | No additional pin needed |

### Styling
Vanilla `StyleSheet.create` only. No third-party styling libraries.

Color palette is defined in `src/lib/colors.ts` as exported constants. See `BRAND.md`.

### Removed packages (formerly planned, now dropped)
| Package | Reason removed |
|---|---|
| nativewind | Requires Reanimated v3, which does not compile on RN 0.81 |
| tailwindcss | No longer needed without NativeWind |

### Navigation
| Package | Pin | Reason |
|---|---|---|
| expo-router | ~6.0.0 | Bundled with Expo SDK 54 |

### Build
- EAS Cloud Build, Android only, development profile
- Node 20.20.2 on VPS (Debian)
- `npm` overrides: `"react-dom": "19.1.0"` (resolves peer dep conflict from expo-router transitive pull)

## Platform Constraints
- Android only
- Portrait only
- Light mode only
- Offline only
- Single player

## Language Standards

- **TypeScript**: strict mode ON. No `any`. Explicit return types on exported functions and hooks. Use `type` over `interface` for non-extendable shapes; `interface` for extendable component props.
- **CSS/Styling**: `StyleSheet.create` 
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

