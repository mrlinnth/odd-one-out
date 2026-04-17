# V1 Scope

Generated: 2026-04-17
Companion to: `docs/CONSTRAINTS.md`

## Overview

Endless-scroll tap game. A 4-column grid scrolls upward. Each row has 3 tiles of one emoji category and 1 tile of a different category. Tap the odd-one-out before it leaves the screen. Miss it, or tap a wrong tile, and the game ends. Score scales with speed. Highest score is persisted locally.

## Game Mechanics

### Grid & tile layout

- 4 columns, full-screen width, portrait only.
- Tile shape: square. Width = `screenWidth / 4`. Height = same as width.
- Rows stack vertically, scroll upward as a group.
- Number of visible rows at any moment: roughly `ceil(screenHeight / tileWidth) + 1` buffer row above the screen for smooth spawn.

### Row composition (classic rules, with emoji twist)

- Each row contains exactly 4 tiles.
- 3 tiles show the "common" emoji category, 1 tile shows the "target" emoji category.
- Target tile position within the row is random (column 0, 1, 2, or 3, equal probability).
- The target tile is the one the player must tap. Wrong tiles are the 3 common-category tiles.

### Fail conditions

A game ends when either occurs:

1. Player taps a common-category (wrong) tile.
2. A target tile scrolls off the top of the screen without being tapped.

Both trigger the same game-over flow (heavy haptic + overlay).

### Tap handling

- Tap anywhere on a tile (not a specific hit zone).
- Tapped target tiles are marked "cleared" and visually dim (e.g. opacity drops to 30%, or emoji replaced with a checkmark) but stay in position until they scroll off. They do not block future gameplay.
- Taps on already-cleared tiles do nothing (no score, no penalty).
- Only one target tile per row, so per-row tap count is at most 1.

### Scroll speed

- Linear ramp with score.
- Start speed: slow enough that the first 5 rows feel trivially easy. Proposed: `baseSpeed = 180 px/s` (tune during implementation).
- Ramp: `currentSpeed = baseSpeed + (score * speedIncrement)`. Proposed: `speedIncrement = 4 px/s per point`.
- Speed cap: prevents the game from becoming physically impossible. Proposed: `maxSpeed = 900 px/s` (roughly 5x base).
- No per-row difficulty spikes beyond the linear ramp — just the category rotation described below.

### Scoring

- Each correctly tapped target tile: `+1 * speedMultiplier`.
- `speedMultiplier = floor(currentSpeed / baseSpeed)`. So at base speed, +1 per tap. At 2x speed, +2. At 5x speed (cap), +5.
- Score is displayed as an integer at the top of the screen.
- No combo system, no multiplier decay, no streak counter.

## Emoji Theme

### Categories

Curate ~6 categories at launch. Each category has ~8-12 emojis. All must be pre-2018 Unicode to ensure consistent rendering on Android 11 (min SDK):

- **Fruits**: apple, orange, banana, grapes, strawberry, watermelon, cherry, peach, pineapple, lemon.
- **Animals**: dog, cat, mouse, rabbit, bear, panda, tiger, lion, cow, pig.
- **Vehicles**: car, taxi, bus, truck, bicycle, motorcycle, train, airplane, boat.
- **Food**: pizza, burger, fries, hot dog, taco, sushi, bread, cheese, egg, cookie.
- **Sports**: soccer ball, basketball, football, baseball, tennis ball, volleyball, rugby, golf.
- **Nature**: tree, flower, leaf, sunflower, cactus, mushroom, four-leaf clover, rose, tulip.

Exact emoji list to be finalized in implementation — curate for maximum visual distinction between categories.

### Category rotation (difficulty ramp)

- Each run starts with a random common/target category pair, e.g. `common=fruits, target=animals`.
- Every **10 points**, the pair rotates to a new random combination.
- Rotation rule: the new `common` cannot equal the previous `common` (prevents feel of nothing changing). The new `target` cannot equal the previous `target` either.
- On rotation: a brief visual cue (e.g. screen flash, or a "Round 2" label fade) signals the change. No pause, no speed reset — the game keeps scrolling.

### Within-category emoji selection

- Within a single row, the 3 common-category tiles can be the same emoji or mixed (implementation choice — pick mixed for more visual interest).
- The target tile is a random emoji from the target category.
- Across rows, the target category's specific emoji can vary row-to-row.

## Screens & Flow

### 1. Splash / Start screen (`src/app/index.tsx`)

- Full screen, light background.
- Game title: "Don't Tap the Fruit" or similar (final name TBD — placeholder for now).
- Tagline: single line of emoji showing the mechanic, e.g. "🍎🍎🐶🍎".
- "Tap to Start" prompt, pulsing.
- Current high score displayed below (or "No high score yet" on first launch).
- Tapping anywhere on this screen navigates to the game screen.

### 2. Game screen (`src/app/game.tsx`)

- Scrolling tile grid as the main content area.
- Score displayed top-center, large.
- Current category cue top-left or top-right: small emoji hint, e.g. "Tap: 🐶" to remind the player what the target category is. Optional — decide during implementation if it reduces the challenge too much. If kept, fades out after 2 seconds on each category change.
- No pause button, no settings icon, no navigation back.

### 3. Game over overlay (rendered on top of game screen, not a separate route)

- Semi-transparent dark overlay (e.g. `bg-black/60`) above the frozen game screen.
- Content center-aligned:
  - "Game Over" heading.
  - Final score, large.
  - High score below (with "New High Score!" label if applicable).
  - "Tap to Retry" button or tap-anywhere-to-retry.
- Tapping retry resets game state and returns to the game screen (no splash re-entry).

### Navigation flow

```
Splash  →  Game  →  Game Over (overlay)  →  Game (reset)
   ↑                                              |
   └──────── (no path back to splash in v1) ──────┘
```

No back button, no settings screen, no pause. Zero-config means zero-screens beyond these three.

## Haptic Feedback

Using `expo-haptics`. All haptics are synchronous, fire-and-forget.

| Event | Haptic |
|---|---|
| Correct tap (target tile) | `ImpactFeedbackStyle.Light` |
| Wrong tap (common tile) | `NotificationFeedbackType.Error` |
| Missed target (scrolled off screen) | `NotificationFeedbackType.Error` |
| Game over (after the error haptic) | `ImpactFeedbackStyle.Heavy` (200ms delay so it feels like a separate "thud") |
| Category rotation (every 10 points) | `ImpactFeedbackStyle.Medium` |
| New high score (on game over) | `NotificationFeedbackType.Success` (replaces the Heavy impact) |

Haptics can be disabled by the OS (silent mode, accessibility settings). Do not check for haptic availability — just fire them. If the device/setting ignores them, that is acceptable v1 behavior.

## Visual Design

- **Theme**: light mode only. No dark mode, no system-follow.
- **Background**: near-white (`#FAFAFA` or similar soft off-white — pure white causes eye strain during long runs).
- **Tile background**: light grey (`#F0F0F0`) with a subtle rounded corner and 2-4px inner padding between tiles. Tiles are not edge-to-edge — give them visual separation.
- **Tile border**: 1px hairline border in slightly darker grey, or no border with just the gap.
- **Cleared tile**: 30% opacity on the emoji, tile background unchanged.
- **Emoji size**: ~60% of tile width. Centered horizontally and vertically.
- **Score text**: large sans-serif (system default font), dark grey (`#1A1A1A`).
- **Category cue text**: smaller, medium grey.
- **No animations beyond**: the scrolling motion, the cleared-tile opacity fade, and the category rotation flash. No tile entrance animations, no score count-up animation, no particle effects.

## State Model

Single Zustand store. Full state shape:

```
{
  status: 'idle' | 'playing' | 'gameOver',
  score: number,
  highScore: number,              // persisted via MMKV
  currentSpeed: number,           // px/s, derived from score
  commonCategory: string,         // current category key
  targetCategory: string,         // current category key
  rows: Array<Row>,               // visible rows with positions
  lastCategoryRotationScore: number, // to detect 10-point boundaries
}
```

Persist middleware scoped to `highScore` only. Never persist `rows`, `status`, or in-flight game state.

## Out of Scope for V1

Explicitly NOT in v1. Do not implement:

- Sound effects of any kind.
- Settings screen or any toggles.
- Multiple game modes (classic, time attack, etc.).
- Power-ups, bonuses, special tiles.
- Leaderboards, social sharing, accounts.
- Animations beyond those listed.
- Dark mode, theme switching.
- Localization — English only.
- Analytics, crash reporting, ads.
- Haptic on/off toggle.
- Pausing.
- Tutorial screen (splash + category cue on game screen is enough).
- iOS support.
- Tablet/landscape layout.

## Open Tuning Parameters

These values are proposed defaults. Expect to tune them during implementation playtesting:

- `baseSpeed`: 180 px/s
- `speedIncrement`: 4 px/s per point
- `maxSpeed`: 900 px/s
- `categoryRotationInterval`: 10 points
- `tileClearedOpacity`: 0.3
- `gameOverHapticDelay`: 200ms

Bundle these in `src/lib/gameConfig.ts` as named exports so tuning is a single-file change.

## Definition of Done for V1

- All three screens implemented per spec.
- Linear speed ramp working, capping at maxSpeed.
- Category rotation every 10 points working, with rotation haptic.
- Both fail conditions implemented and triggering game-over overlay.
- Haptics firing on all listed events.
- High score persists across app restarts via MMKV.
- Game runs at 60fps on Android 11+ mid-range devices (tile scrolling uses Reanimated worklets on UI thread).
- APK builds cleanly via `npx expo prebuild && npx expo run:android`.
- No TypeScript errors in strict mode.
- No runtime warnings in dev mode.
