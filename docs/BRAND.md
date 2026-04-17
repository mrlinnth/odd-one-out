# Brand Guide

Generated: 2026-04-17
Project: Odd One Out
Scope: Minimum viable brand rules for v1. One page, actionable, referenced by Tailwind config and implementation.

## Icon

The app icon is the visual anchor for the brand. All UI color decisions flow from the colors extracted from it.

- 2x2 grid of white tiles inside a rounded blue border
- Three red apple emojis and one brown dog emoji
- Flat cartoon style, no text
- Designed to be recognizable at 48dp

## Color Palette

Colors extracted directly from the app icon.

### Primary

| Name | Hex | Usage |
|---|---|---|
| Brand Blue | `#4889EE` | Primary UI accent, buttons, splash screen border, category rotation flash, active states |
| Brand Red | `#E4312D` | Score highlights, game over overlay accent, "danger" cues (wrong tap flash, if added) |
| Brand Brown | `#C57C45` | Secondary accent, used sparingly. Reserved for future features (achievements, etc.) |

### Neutrals

| Name | Hex | Usage |
|---|---|---|
| Background | `#FAFAFA` | Screen background — off-white, not pure white (eye strain) |
| Tile Background | `#FFFFFF` | Pure white for tile fills (matches icon tiles) |
| Tile Gap | `#F0F0F0` | Subtle gap between tiles if gaps are used |
| Text Dark | `#1A1A1A` | Primary text (score, headings) |
| Text Medium | `#666666` | Secondary text (category cues, labels) |
| Text Light | `#999999` | Tertiary text (hints, placeholders) |
| Overlay | `rgba(0,0,0,0.6)` | Game over overlay darkness |

### Semantic (derived, NOT from icon)

These aren't visible in the icon but are needed for UI states:

| Name | Hex | Usage |
|---|---|---|
| Success | `#22C55E` | "New High Score" label (if re-added post-v1) |
| Tile Cleared Opacity | `0.3` | Applied to emoji, not color |

## Typography

- **Font family**: System default (San Francisco on iOS, Roboto on Android). No custom fonts in v1.
- **Weights used**: 400 (regular), 600 (semibold), 700 (bold)
- **Sizes**: Use Tailwind's default scale. Specifically:
  - Score display: `text-5xl` or larger, `font-bold`, `text-brand-dark`
  - Game title (splash): `text-4xl font-bold`
  - Body / labels: `text-base font-medium text-text-medium`
  - Small hints: `text-sm text-text-light`

## Tailwind Config

Add this to `tailwind.config.js` to make the palette available as classnames throughout the app:

```js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#4889EE',
          red: '#E4312D',
          brown: '#C57C45',
        },
        bg: {
          screen: '#FAFAFA',
          tile: '#FFFFFF',
          gap: '#F0F0F0',
        },
        text: {
          dark: '#1A1A1A',
          medium: '#666666',
          light: '#999999',
        },
      },
    },
  },
  plugins: [],
};
```

Usage examples:
- `className="bg-bg-screen"` for screen background
- `className="border-2 border-brand-blue rounded-xl"` for the tile grid border
- `className="text-text-dark font-bold"` for score
- `className="bg-black/60"` for the game over overlay (Tailwind built-in opacity)

## Usage Rules

- **Do** use `brand-blue` as the primary accent. It's the icon's dominant color and ties the app back to the launcher icon.
- **Do** keep the background off-white (`bg-screen`). Pure white under bright tiles causes eye strain during long runs.
- **Do** use `text-dark` for anything the player reads during gameplay (score especially). Contrast matters at speed.
- **Don't** introduce new accent colors without updating this doc. Every ad-hoc color is a future inconsistency.
- **Don't** use gradients, shadows, or glows in v1. Flat and simple matches the icon style.
- **Don't** modify the app icon colors. The icon is the source of truth for the palette — change the icon and this doc must be updated in lockstep.

## Emoji Style

- **System emojis only.** No custom SVG icons, no Noto font bundle in v1.
- **Pre-2018 Unicode emojis only** to ensure consistent rendering on Android 11 minimum target. See `V1-SCOPE.md` category lists — all listed emojis pre-date 2018.
- Do not rely on emoji color as a design element in UI chrome. Emojis render differently across Android versions; treat them as "roughly correct" not pixel-perfect.

## What This Guide Does NOT Cover

Intentionally out of scope:
- Logo variants (dark mode, mono, small-size)
- Marketing materials (Play Store feature graphic, social media)
- Voice and tone guidelines
- Animation timing and easing curves
- Icon spacing rules and clear zones

These are post-v1 concerns. Add sections only when actually needed.

## Handoff Instruction

When implementing any screen or component:
1. Use named color classes from this palette via Tailwind (e.g. `bg-brand-blue`), not hex codes inline.
2. If a needed color isn't in this palette, stop and add it here first with a rationale, don't invent one locally.
3. Cross-check component colors against the app icon — they should feel like they belong in the same family.
