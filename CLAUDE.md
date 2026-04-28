# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Is

A PWA for managing youth soccer team rotations during live games. Tracks playing time per player and per position, supports substitutions, records goals, and generates game summaries. Named "Oyster Blueberries Player Tracker" in the manifest.

## Development Workflow

**No build step.** The entire app is a single file: `index.html` (~4000 lines of HTML + CSS + JS).

- Edit `index.html` directly
- Open in browser to test (or run `python3 -m http.server` and visit `http://localhost:8000`)
- No npm, no bundler, no dependencies

Supporting files: `sw.js` (service worker for offline caching), `manifest.json` (PWA manifest). These rarely need modification.

## Architecture

### Single-file, no framework

Pure vanilla JavaScript with global state variables. DOM is updated by calling `render*()` functions — there is no reactive/virtual DOM layer.

### Screen system

All screens exist in the DOM simultaneously; `showScreen(screenId)` toggles visibility. Screens in order of the game flow:

1. **setup-screen** — Roster management, team settings
2. **gameday-screen** — Check which players showed up for this game
3. **lineup-screen** — Assign starting positions on a visual field
4. **goalie-modal / gk-picker-modal** — Spin wheel or manual pick for goalkeeper per half
5. **game-screen** — Live game: clock, field, bench, substitutions, goals
6. **summary-screen** — Post-game per-player stats
7. **season-summary-screen** — Aggregate season stats
8. **review-screen** — View a past game from exported JSON

### State management

Global `let` variables at the top of the script. Key ones:

```js
let roster = [];          // [{id, name}] — permanent team roster
let players = [];         // [{id, name, onField, totalPlayed, position, positionTime, ...}] — active game state
let gameHistory = [];     // all past game records (also in localStorage)
let playerPhotos = {};    // {id: base64String}
let goalie1Id, goalie2Id, activeGoalieId;
let subPlans = [];        // staged substitutions not yet executed
```

State changes are **not** automatically reflected in the UI — you must call the appropriate `render*()` function after mutating state.

### Persistence

All data lives in `localStorage`:
- `soccerRoster` — roster array
- `soccerSettings` — team name, half duration
- `playerPhotos` — base64 photos
- `soccerGameHistory` — array of game records

### Code organization (comment headers in index.html)

The JS is organized into sections marked by `// === SECTION NAME ===` comments:
- POSITIONS — field layout constants (`FIELD_POSITIONS`, position order)
- STATE — all global variables
- SETTINGS / TEAM NAME — localStorage save/load for settings
- IMPORT/EXPORT — CSV import, JSON profile export/import
- PHOTOS — canvas-based resize and crop, avatar generation
- ROSTER MANAGEMENT — CRUD for the permanent roster
- GAME START / LINEUP — pre-game screen logic
- TIMER — countdown clock, half transitions
- GOALIE WHEEL — requestAnimationFrame spinner animation
- FIELD DIAGRAM — live game rendering, bench cards, substitution flow
- SUMMARY — post-game and season stats

### Naming conventions

- `render*()` — redraws a screen or component from current state
- `show*()` / `open*()` / `close*()` — screen/modal visibility
- `save*()` / `load*()` — localStorage access
- `build*()` — constructs complex data structures (e.g., `buildGameRecord()`)

### Field positions

Fixed set: `LF`, `CF`, `RF`, `LM`, `CM`, `RM`, `LD`, `RD`, `GK`. Formation is always 3-3-2 + GK. Bench players have `position: null`.

### Bench card color logic

Cards on the bench are colored by playing-time balance relative to the per-game average (excluding `leftEarly` players):
- Red: < 75% of average — under-played
- Green: 75%–125% — balanced
- Yellow: > 125% — over-played

### Player object during a game

```js
{
  id: number,
  name: string,
  onField: boolean,
  totalPlayed: number,        // seconds on field this game
  subInAt: number,            // elapsed seconds when last subbed in (0 if started)
  h1Snapshot: number,         // totalPlayed at end of first half
  position: string | null,    // current field position or null (bench)
  positionTime: { LF: s, CF: s, ... },  // seconds at each position
  positionStart: number,      // elapsed when moved to current position
  leftEarly?: boolean         // true if player left mid-game
}
```

### Game record (export/history format)

```js
{
  date: ISO string,
  opponent: string,
  ourScore: number,
  theirScore: number,
  goals: [{ scorer: string|null, half: 1|2, team: 'us'|'them' }],
  playerStats: [{ id, name, minutesPlayed, secondsPlayed, positionSeconds, positionMinutes }]
}
```

## Key Implementation Details

- **Goalie wheel**: `requestAnimationFrame` animation loop; player list repeated 50× for smooth infinite scroll effect. Snaps to nearest item on stop.
- **Substitutions**: Multi-stage — select bench player → pick field slot → `executeAllSubs()` applies all planned subs at once.
- **CSV import**: Expects `player_first_name` / `player_last_name` columns; handles quoted fields with embedded commas; deduplicates against existing roster.
- **Photos**: Canvas-resized to 120×120px (center crop), stored as JPEG base64 at 0.75 quality.
- **Auto-export**: Game JSON automatically downloads after each half ends.
- **Late arrivals**: Players can be added to bench mid-game via the game screen.
