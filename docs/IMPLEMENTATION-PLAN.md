# Implementation Plan — Vertical Slices

Generated: 2026-04-17
Companion to: `docs/CONSTRAINTS.md`, `docs/V1-SCOPE.md`

## How to Use This Plan

Four slices, each a separate Claude Code session. Commit at the end of every slice. Playtest on device between slices using EAS Build. Each slice ends in something **actually playable** — no slice produces dead code that only pays off later.

Every Claude Code session starts with the same handoff:

> Read `docs/CONSTRAINTS.md` and `docs/V1-SCOPE.md` before starting. Then read `docs/IMPLEMENTATION-PLAN.md` and work only on the slice specified. Do not run `npx expo install --fix` without asking. Version pins for `react-native-reanimated` (v3) and `react-native-mmkv` (3.3.3) are intentional.

Features explicitly deferrable if any slice runs long:
- **Category rotation** (ship with a single fixed category pair per run)
- **Variable speed multiplier for scoring** (ship with flat +1 per tap)
- **"New High Score!" label** (just show the number)

Do not cut anything else without re-discussing scope.

---

## Slice 1 — Project Skeleton + Scrolling Grid (No Game Logic Yet)

**Goal**: Prove the hard technical bets work. Scrolling tile grid at 60fps on device using Reanimated worklets. Zustand store wired up. MMKV persistence working. No game logic, no taps, no scoring — just a grid that scrolls.

**What "done" looks like**: You tap the app icon, an endless grid of random emoji tiles scrolls up the screen smoothly. Nothing else happens. It does not crash.

### Tasks

1. Initialize Expo SDK 54 project with `create-expo-app` using the default template with TypeScript strict.
2. Install and configure NativeWind 4.1 per official Expo SDK 54 setup guide. Verify a test `className` renders.
3. Install pinned dependencies with exact versions:
   - `react-native-mmkv@3.3.3`
   - `react-native-reanimated@~3.17.0` (override Expo's default v4 — add to `package.json` resolutions/overrides if `expo install` fights it)
   - `zustand@^5`
   - `expo-haptics` (via `npx expo install`)
4. Verify `package.json` shows Reanimated v3 and MMKV v3.3.3 after install. Run `npx expo prebuild --clean`.
5. Create folder structure: `src/app/`, `src/components/`, `src/hooks/`, `src/stores/`, `src/lib/`, `src/types/`.
6. Create `src/lib/gameConfig.ts` with tuning constants from V1-SCOPE.md (baseSpeed, speedIncrement, maxSpeed, tile dimensions).
7. Create `src/lib/emojis.ts` with the 6 categories from V1-SCOPE.md. Just the lists — no selection logic yet.
8. Create `src/stores/gameStore.ts` — minimal Zustand store with `highScore: number` and MMKV persist middleware. Verify persist by setting a test value and restarting the app.
9. Create `src/components/Tile.tsx` — a single square tile showing an emoji, NativeWind styled per V1-SCOPE.md visual design.
10. Create `src/components/TileGrid.tsx` — renders rows of 4 tiles, with rows positioned absolutely using Reanimated `useSharedValue` and `useAnimatedStyle`. Rows scroll upward in a worklet-driven loop. Rows that leave the top of the screen are recycled to the bottom with new random emojis (simple object pool).
11. Create `src/app/_layout.tsx` (Expo Router root) and `src/app/index.tsx` that renders the `<TileGrid />` full-screen.
12. Configure `app.json`: portrait orientation, `minSdkVersion: 30`, app name placeholder, package name placeholder.

### Deploy

```
npx expo prebuild --clean
eas build --platform android --profile development
```

Install the resulting APK on the Pixel 6. If you don't have EAS development build profile yet, create one first: `eas build:configure`.

### Playtest gate

Watch the grid scroll for ~60 seconds. Check:
- Scrolling is smooth (no dropped frames, no hitching).
- CPU usage reasonable (check via Android Studio profiler or just vibes on device).
- No crashes, no red-screen errors, no yellow-box warnings in dev mode.
- Emojis render identically to your expectation on Android 11+.
- App relaunches without losing the `highScore` test value.

**Stop and fix before Slice 2 if**: scrolling stutters, emojis render as tofu (`□`), or MMKV fails to persist. These are foundation problems and will compound.

### Commit

`feat: project skeleton with scrolling emoji grid`

---

## Slice 2 — Playable Core Loop

**Goal**: The game is actually playable. You can tap target tiles, wrong taps end the game, missed targets end the game, score counts up. No screens other than the game screen itself. No high score display yet. No haptics yet.

**What "done" looks like**: App opens directly into the game. You tap tiles, you score or you die. On death, the grid freezes and shows final score overlaid. Tapping anywhere restarts.

### Tasks

1. Expand `gameStore.ts` with full state per V1-SCOPE.md State Model: `status`, `score`, `currentSpeed`, `commonCategory`, `targetCategory`, `lastCategoryRotationScore`. Persist ONLY `highScore`.
2. Create `src/lib/rowGenerator.ts` — pure function that takes `(commonCategory, targetCategory)` and returns a row with 3 common emojis + 1 target emoji in a random column.
3. Update `TileGrid.tsx`: instead of random emojis per tile, generate rows via `rowGenerator`. On init, pick one random common/target category pair (no rotation yet — defer until Slice 3).
4. Add tap handling to `Tile.tsx`: `onPress` fires a callback with `(rowId, columnIndex, isTarget)`.
5. In the game screen, handle tap:
   - If `isTarget` and not already cleared: mark tile as cleared (opacity 0.3 via a row-level state or a cleared-tiles Set), increment score by 1 (flat — variable multiplier deferred).
   - If not `isTarget`: set `status = 'gameOver'`.
6. Implement miss detection: when a row scrolls past the top with an uncleared target, set `status = 'gameOver'`. Use Reanimated worklet threshold check + `runOnJS` callback. Ensure the callback fires exactly once per row (use a ref or Set of rows already reported).
7. When `status === 'gameOver'`: freeze the scroll (stop the shared value animation), render a `<GameOverOverlay />` component with final score and "Tap to Retry" text.
8. Retry: reset `status` to `'playing'`, reset `score` to 0, clear cleared-tiles set, reset rows, restart scroll.
9. Update `highScore` when `status` transitions to `'gameOver'` if `score > highScore`.
10. Display current score at the top of the game screen.

### Deploy

```
eas build --platform android --profile development
```

Install on device.

### Playtest gate

Play for at least 15 minutes. Check:
- Tapping feels responsive (no perceptible delay between tap and visual feedback).
- Wrong tap ends the game immediately.
- Missed target ends the game immediately.
- Miss detection fires exactly once — no duplicate game-over triggers.
- Restart works without requiring app restart.
- Scrolling stays at 60fps even after scoring 50+ points.
- Speed ramp feels reasonable at `baseSpeed=180, speedIncrement=4`. Tune these values in `gameConfig.ts` if the game is too easy or immediately too hard.

**Tuning note**: this is the right time to dial in `baseSpeed`, `speedIncrement`, and `maxSpeed`. You'll play many more test runs in Slices 3-4, but getting a rough feel now saves rework later.

**Stop and fix before Slice 3 if**: miss detection is inconsistent, restart leaves stale state, or taps feel laggy.

### Commit

`feat: playable core loop with score and game over`

---

## Slice 3 — Splash Screen, Haptics, High Score Display

**Goal**: App feels like a finished product in terms of flow. Splash → game → game over → retry loop is complete. Haptics fire. High score is visible everywhere it should be.

**What "done" looks like**: App opens to a splash screen with title + high score. Tap to start. Play. Die. Overlay shows final score AND high score. Tap to retry goes back to game (not splash — per V1-SCOPE.md flow). Every feedback event has a matching haptic.

### Tasks

1. Create `src/app/index.tsx` as the splash screen (move the game screen to `src/app/game.tsx`). Splash shows:
   - Game title (placeholder — final name TBD).
   - Tagline line of emojis (e.g. "🍎🍎🐶🍎").
   - High score (or "No high score yet").
   - Pulsing "Tap to Start" text — use Reanimated `withRepeat` for a simple opacity pulse.
2. Tap on splash navigates to `/game` via `router.push('/game')`.
3. Update `GameOverOverlay` to show high score below current score. ("New High Score!" label is DEFERRED per scope.)
4. Install haptic triggers per V1-SCOPE.md table:
   - Correct tap: `ImpactFeedbackStyle.Light`
   - Wrong tap: `NotificationFeedbackType.Error`
   - Missed target: `NotificationFeedbackType.Error`
   - Game over (after error haptic, 200ms delay): `ImpactFeedbackStyle.Heavy`
   - Category rotation haptic is DEFERRED with the category rotation feature itself.
5. Wrap haptics in a thin helper `src/lib/haptics.ts` so firing them is one-liner calls from anywhere. Do not check availability — just fire.
6. Verify splash screen's "Tap to Start" area doesn't accidentally trigger a game tap on the first row (use a small delay or require the user to release the tap on splash before game tiles become tappable).

### Deploy

```
eas build --platform android --profile development
```

### Playtest gate

Play 15+ minutes with physical interaction focus:
- Does every haptic feel right, or are any overwhelming/underwhelming?
- Is the game-over haptic sequence (error → heavy thud) satisfying or confusing?
- Does the splash → game transition feel instant enough? If there's a perceptible load delay, investigate.
- Does the retry loop feel smooth? After 5 deaths in a row, does anything feel janky?
- High score updates correctly across app restarts?

**Stop and fix before Slice 4 if**: haptics fire on wrong events, splash doesn't show high score after a game, or retry leaks state from the previous run.

### Commit

`feat: splash screen, haptics, high score display`

---

## Slice 4 — Polish, Category Rotation, and Production Build

**Goal**: Ship-ready. Category rotation adds variety. Variable speed multiplier scoring rewards risk. Final visual polish. Production EAS build ready for Play Console internal testing.

**What "done" looks like**: The game has full V1-SCOPE.md feature set (minus the "New High Score!" label which stays deferred). A signed production-ish AAB is built and installable.

### Tasks

1. Implement category rotation in `gameStore.ts`:
   - Track `lastCategoryRotationScore`. When `score - lastCategoryRotationScore >= 10`, rotate.
   - Pick a new random `(commonCategory, targetCategory)` pair where neither matches the previous ones.
   - Trigger `ImpactFeedbackStyle.Medium` haptic on rotation.
   - Add a brief screen flash (200ms white overlay fading out) on rotation — pure NativeWind + Reanimated, no new deps.
2. Implement variable speed multiplier scoring:
   - `speedMultiplier = Math.floor(currentSpeed / baseSpeed)`
   - `scoreGained = 1 * speedMultiplier` per correct tap
   - Minimum multiplier is 1 even if formula returns 0.
3. Visual polish pass — work through this checklist with Claude Code:
   - Tile spacing feels right (~2-4px gaps between tiles)?
   - Cleared tile opacity looks right at 0.3, or should it be 0.4?
   - Score text size and position — does it occlude the top row of tiles?
   - Background color is off-white (`#FAFAFA`), not pure white?
   - Game over overlay darkness feels right (`bg-black/60`)?
   - Splash screen emoji tagline feels inviting?
4. Decide on the category cue on the game screen (the "Tap: 🐶" hint): implement it, playtest with and without, keep whichever feels better. If keeping: fade out after 2s per V1-SCOPE.md.
5. Finalize app metadata in `app.json`: real app name, real package name (e.g. `xyz.hiyan.donttapthefruit`), version `1.0.0`, version code `1`, icon, splash image (can be placeholder for now).
6. Create production EAS build profile in `eas.json` if not already present. Build:
   ```
   eas build --platform android --profile production
   ```
   This produces an AAB suitable for Play Console.
7. Run `npx expo-doctor` and fix any issues (expected: zero issues, unless the Reanimated v3 pin triggers a warning — that warning is acceptable and intentional).
8. Create a `README.md` in the project root with: project description, required Node version, how to run locally, how to build, known version pins, link to the docs/ folder.

### Deploy

Install the production AAB on the Pixel 6 via:
```
eas build --platform android --profile development   # for final dev test
```

Then separately:
```
eas build --platform android --profile production
```

The production AAB is what you'd upload to Play Console internal testing track when you're ready.

### Playtest gate

Final end-to-end test:
- Play 30+ minutes across multiple sessions.
- Intentionally try to break it: rapid taps, background the app mid-game, rotate screen (should be locked), low-memory conditions if possible.
- Have someone else play it cold with no explanation — do they figure out the rules? This is your real usability test.
- Category rotation: does it feel like a nice variety injection, or disorienting? If disorienting, consider raising the rotation interval from 10 to 15 points.

**Done criteria (all must pass)**:
- Runs 60fps for 10+ minutes straight on Pixel 6.
- No crashes, no ANRs.
- TypeScript strict mode compiles with zero errors.
- Production AAB builds successfully via EAS.
- A naive first-time player reaches their first game over without confusion.

### Commit

`feat: category rotation, speed multiplier scoring, polish pass`
`chore: production build config and README`

---

## After Slice 4

You have a shippable v1. Next possible steps, NOT in this plan but worth considering:

- Upload AAB to Play Console internal testing track. Get 3-5 friends to install and submit feedback.
- Re-evaluate deferred items: "New High Score!" label is a tiny add; category cue decision might want revisiting.
- Consider whether the name is still TBD — if you picked one earlier, lock it in; if not, decide before Play Store listing.
- Light analytics (PostHog or similar) could be worth adding in v1.1 to understand session length and death causes without an account system.
- iOS build if/when you want — most of the code works already, but you'll need TestFlight + Apple Developer Program.

These are post-v1 considerations and should not bleed into the slices above.
