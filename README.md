# Odd One Out

A single-player, offline Android game. A 4-column grid of emoji tiles scrolls upward — each row has 3 matching emoji and 1 odd one out. Tap the odd tile before it scrolls off screen. Miss it or tap wrong, and it's game over.

- Portrait-only, Android 11+ (API 30)
- Speed ramps with score; emoji category rotates every 10 points
- High score persisted locally via MMKV

## Prerequisites

- Node.js 18+
- Android Studio with Android SDK installed
- Android device or emulator running Android 11+

## Quick Start

```bash
npm install
npx expo prebuild
npx expo run:android
```

> **Note:** Expo Go is not supported. MMKV and Reanimated require a native development build.

## Version Pins

`react-native-mmkv` is pinned to **3.3.3** and `react-native-reanimated` to **~3.x**. Do not run `npx expo install --fix` without verifying these pins in `package.json` first.
