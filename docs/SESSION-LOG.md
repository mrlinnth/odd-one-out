# Session Log

A running log of what happened in each Claude Code session and in between them. The goal is to keep Claude Code (and future-you) oriented without forcing a full re-read of the repo every time.

## How to Use This File

**At the start of every Claude Code session**, include this in the handoff prompt:

> Before starting, read `docs/SESSION-LOG.md` (especially the most recent entries) so you know what has changed since your last session. Pull the latest from `main` before making changes.

**At the end of every Claude Code session**, have Claude Code append a new entry summarizing:
- What slice or task was worked on
- What was actually implemented (not just intended)
- Anything unexpected that came up
- What's left undone or unclear

**Between sessions** (for manual ops — npm installs, git operations, EAS builds, device testing, tuning changes), add your own short entry. Even one line is fine. The point is that Claude Code can read it and know what happened.

## Format

Each entry is a short markdown block with a date heading. Keep entries brief — bullet points or 2-3 sentences. Chronological order, newest at the bottom (so reading top-to-bottom tells the story of the project).

```
## YYYY-MM-DD — short title

- Bullet 1
- Bullet 2
- Notes or gotchas
```

Do not delete old entries. This file is append-only.

---

## Entries

## 2026-04-17 — Project planning

- Ran project-kickoff and produced `CONSTRAINTS.md`.
- Ran scope and produced `V1-SCOPE.md`.
- Ran implementation planning and produced `IMPLEMENTATION-PLAN.md` (4 slices).
- Theme decision: emoji categories (fruits/animals/etc), not black/white tiles. System emojis, no bundled font.
- Deferrable scope (can cut if needed): category rotation, variable speed multiplier, "New High Score!" label.
- Name: TBD — leaning "Odd One Out" but not locked.

## 2026-04-17 — Slice 1 implementation (Claude Code on mobile)

- Implemented project skeleton per IMPLEMENTATION-PLAN Slice 1.
- Expo SDK 54 + TypeScript strict + NativeWind 4.1 + Zustand 5 + MMKV 3.3.3 + Reanimated 3.17.5 + Expo Haptics.
- Scrolling emoji grid (TileGrid + Tile components) implemented.
- MMKV persist middleware wired on `highScore` only.
- Folder structure per scope doc: `src/app/`, `src/components/`, `src/hooks/`, `src/stores/`, `src/lib/`, `src/types/`.
- `app.json` configured: portrait, minSdkVersion 30.

## 2026-04-17 — Slice 1 build and deploy

- Pulled code to VPS (Node 20.20.2, matches Expo SDK 54 requirements).
- Ran `npm install` — `package-lock.json` generated/updated.
- Verified pins held: `react-native-reanimated@3.17.5` (deduped), `react-native-mmkv@3.3.3`. No duplicate reanimated in tree.
- First `eas build --platform android --profile development` prompted to install `expo-dev-client`.
- Accepting the install triggered peer dependency conflict: npm found `react-dom@19.2.5` transitively requiring `react@^19.2.5`, but Expo SDK 54 pins `react@19.1.0`.
- Resolution: `rm -rf node_modules package-lock.json && npm install`. Clean reinstall resolved the conflict without needing to modify `package.json` — `react-dom` was never a direct dependency.
- Added `expo-dev-client` via the fresh install flow.
- Committed `package.json` and `package-lock.json`, pushed to `main`.
- EAS build queued successfully.

## 2026-04-17 — Slice 1 playtest (pending)

- Awaiting EAS build completion (~15 min).
- Playtest gate criteria: smooth scrolling (60fps), emojis render correctly (no tofu squares), MMKV `highScore` persists across app restart.
- Do NOT start Slice 2 until these three criteria pass.

## 2026-04-17 — react-dom override fix

- EAS Cloud Build failed on `npm ci` due to `react-dom@19.2.5` peer dep vs `react@19.1.0`.
- Root cause: `expo-router` and `@expo/metro-runtime` declare `react-dom` as `peerOptional` with no version constraint. npm resolved to latest (19.2.5), incompatible with React 19.1.
- Fix: added `"overrides": { "react-dom": "19.1.0" }` to `package.json`. Lockfile regenerated clean.
- Pins verified after reinstall: reanimated 3.17.5, mmkv 3.3.3.
- Ready to retry EAS build.

## 2026-04-18 — Stack migration planning (claude.ai)

- Diagnosed the root cause of the Slice 1 build failure: three-way deadlock between NativeWind 4.1 (needs Reanimated v3), RN 0.81 (needs Reanimated v4), and Reanimated v3 (doesn't compile on RN 0.81).
- Decision: drop NativeWind entirely, use StyleSheet.create. No NativeWind v5 (pre-release, violates 6-month rule).
- Researched current stable versions:
  - react-native-reanimated 4.3.0 (supports RN 0.81, latest stable)
  - react-native-worklets 0.8.1 (required peer dep for Reanimated v4)
  - react-native-mmkv 4.3.1 + react-native-nitro-modules 0.35.4 (the Jan 2026 build issues are resolved but the dep chain is complex)
- Decision: drop MMKV entirely. We persist one integer (high score). Using expo-secure-store instead — zero extra native deps, bundled with Expo SDK 54.
- Updated `docs/CONSTRAINTS.md` with new stack, migration notes, and rationale.
- Updated `docs/BRAND.md` to replace Tailwind config with `src/lib/colors.ts` pattern.
- Wrote Slice 1.5 tasks and Claude Code handoff prompt for the migration session.
- Next step: run Slice 1.5 in Claude Code to perform the actual migration, then EAS build to verify.


