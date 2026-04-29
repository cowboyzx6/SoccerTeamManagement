# Gameday Screen Redesign

**Date:** 2026-04-29  
**Scope:** setup-screen only (the page where the opponent is entered and attendance is taken)

## Goals

- Add a date picker so game date is tracked explicitly (defaults to today)
- Show the next game number, auto-derived from history (display only)
- Replace the three occasional-use top buttons with a `⋯` overflow menu to reduce clutter
- Keep the player attendance and half-duration controls unchanged

## Screen Layout (top to bottom)

### 1. Header Row
- Left: existing theme toggle button
- Right: `⋯` button (replaces the current three-button cluster)
  - Tapping opens a small dropdown panel anchored below the button
  - Panel items: Review Game | Season | Team Settings
  - Tapping outside the panel (or any item) closes it
  - No other header changes

### 2. Team Name / Title
Unchanged — ⚽ team name heading.

### 3. Game Info / Opponent Row (new, responsive)
Uses CSS flexbox with `flex-wrap: wrap` so layout adapts to available width:

- **Narrow screens (phones, ~< 600px):** Game # + Date on one row, Opponent input full-width below.
- **Wide screens (tablets/iPad, ~≥ 600px):** All three fields in a single row — Game #, Date, Opponent — using `flex-wrap: nowrap`. Opponent input takes remaining space (`flex: 1`).

| Field | Type | Behavior |
|---|---|---|
| Game # | Read-only label/badge | `"Game " + (gameHistory.length + 1)` — computed at render time, not stored. Fixed width, no shrink. |
| Date | `<input type="date">` | Defaults to today's local date (YYYY-MM-DD). Editable for after-the-fact entry. Fixed width, no shrink. |
| Opponent | `<input type="text">` | Existing input, `flex: 1`, min-width ~120px so it never collapses to unusable size. |

The breakpoint is implemented with a CSS media query (`@media (min-width: 600px)`) — no JavaScript needed.

### 5. Who Showed Up / Player Grid
Unchanged.

### 6. Half Duration Stepper
Unchanged.

### 7. Set Starting Lineup Button
Unchanged — disabled until opponent is entered.

## Data Changes

- Add a `gameDate` global variable (string, YYYY-MM-DD) initialized to today when the gameday screen renders.
- The date picker input is bound to `gameDate`; changing it updates the variable.
- `buildGameRecord()` reads `gameDate` instead of calling `new Date()`.
- `saveActiveGame()` / `restoreActiveGame()` must include `gameDate` in the persisted state blob so a resumed mid-game session retains the correct date.
- Game number is **display-only** — it is not stored in the game record. It is always derivable as the 1-based index of the record within the history array.
- No changes to the game record schema, localStorage keys, or export format.

## Out of Scope

- Season data storage strategy — already handled by the existing `games` array in the profile JSON export
- Any other screens
- Bottom nav bar or persistent chrome
