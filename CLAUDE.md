# CLAUDE.md

This file gives Claude Code project-specific guidance for this repository.

## App summary

A no-build, single-file PWA for managing youth soccer player rotations during live games. It tracks playing time, position time, substitutions, goalies, goals, game summaries, season stats, roster data, and photos.

## Development workflow

- Main app file: `index.html`
- Supporting files: `manifest.json`, `sw.js`
- No npm, bundler, framework, transpiler, or build step
- Edit files directly
- Test by opening `index.html` in a browser, or run:

```bash
python3 -m http.server
```

Then open `http://localhost:8000`.

## Token / context discipline

`index.html` is large. Use targeted navigation.

- Do not read all of `index.html` by default.
- Read `PROJECT_MAP.md` first when locating a feature area.
- Search by DOM id, function name, state variable, visible text, or section header.
- Read the smallest useful line range.
- Avoid full file dumps and full `git diff` output.
- For recent regressions, start with `git diff --stat` and `git diff --unified=5 -- index.html`.
- Before broad exploration, state why targeted search was insufficient.
- Prefer minimal surgical edits over broad rewrites.
- After changing state logic, verify the relevant render/save function is called.
- Show concise summaries and focused diffs, not full rewritten files.

`PROJECT_MAP.md` is intentionally not imported with `@PROJECT_MAP.md`; read it on demand so it does not consume context in every session.

## User-facing import/backup labels

The Team Settings buttons use coach-friendly labels:

- `Import League CSV` calls `importLeagueCsv()` and imports roster names from a league CSV.
- `Restore Backup` calls `importProfile()` and imports a previously downloaded team JSON backup.
- `Backup Team` calls `exportProfile()` and downloads the full team JSON backup.

Avoid using the older labels `League CSV`, `Load Profile`, or `Save Profile` in user-facing docs or UI unless referring to historical versions.

## Architecture

`index.html` contains:

- CSS in a `<style>` block
- All screens and modals in HTML
- All app logic in a `<script>` block
- Global state variables
- Direct DOM updates through `render*()` functions

There is no virtual DOM or automatic reactivity. After mutating state, call the appropriate render/save function.

## Actual screens

All screens exist in the DOM. `showScreen(id)` switches screens by toggling `.active`.

- `setup-screen` — landing/game-day check-in UI
- `team-setup-screen` — team name, roster, import/export, reset
- `lineup-screen` — starting lineup assignment
- `game-screen` — live clock, score, field, bench, substitutions
- `summary-screen` — post-game summary and imported game review display
- `season-summary-screen` — aggregate season stats

Important corrections:

- There is no `gameday-screen` id. Game-day content lives inside `setup-screen` as `gameday-empty` / `gameday-content`.
- There is no separate `review-screen` id. Imported game review data is rendered through `summary-screen`.

## Major flow

1. Load persisted data.
2. Configure roster/team if needed.
3. Select attending players on the game-day landing UI.
4. Assign starting lineup.
5. Pick goalie manually or by wheel.
6. Run game clock.
7. Plan or execute substitutions.
8. Record goals.
9. Handle halftime / second half.
10. End game and save history.
11. View game summary or season summary.

## Key state

```js
let roster = [];          // permanent roster, persisted
let players = [];         // active-game player state
let gameHistory = [];     // completed games
let playerPhotos = {};    // id -> base64 data URL

let subPlans = [];        // planned substitutions: [{ inId, pos }]
let planningBenchId = null;
let planningPosition = null;
let selectedId = null;

let lineupDraft = [];
let goalie1Id = null;
let goalie2Id = null;
let activeGoalieId = null;

let totalElapsed = 0;
let halfClock = 0;
let timerBase = null;
let isRunning = false;
```

State changes do not update the UI automatically.

## Persistence

Data is stored in `localStorage`:

- `soccerRoster`
- `soccerSettings`
- `soccerGameHistory`
- `soccerActiveGame`
- `playerPhotos`
- `theme`

When changing data that should survive refresh, update the relevant `save*()` function or call it after mutation.

## Implementation rules

- Use `escHtml()` for untrusted/user-visible strings inserted into HTML templates.
- When moving a player off the field, commit position time before clearing `position`.
- When putting a player on the field, set `subInAt`, `position`, and start position timing.
- When changing goalie assignment, keep `activeGoalieId`, `goalie1Id`, and `goalie2Id` consistent with the current half.
- After substitution changes, clear stale planning state where appropriate: `selectedId`, `planningBenchId`, `planningPosition`, related `subPlans`.
- After game-state changes during a live game, call `saveActiveGame()` when persistence matters.
- After changing score/goals, call `renderScore()` and save active game.
- After changing roster/photos/settings/history, call the matching save/render function.

## Naming conventions

- `render*()` — redraws UI from state
- `show*()` / `open*()` / `close*()` — navigation or modal visibility
- `save*()` / `load*()` — localStorage persistence
- `build*()` — creates export/history data structures
- `confirm*()` — modal confirmation handlers
- `goTo*()` / `goBack*()` — screen navigation

## Important function clusters

Use `PROJECT_MAP.md` for line ranges.

- Attendance/check-in: `renderGameDayCheckboxes`, `togglePlayerTile`, `checkedPlayers`, `updateStartBtn`
- Team setup: `renderTeamSetupRoster`, `addRosterPlayer`, `openRenameModal`, `removeRosterPlayer`
- Lineup: `goToLineup`, `renderLineup`, `lineupSlotTap`, `lineupPlayerTap`, `launchGame`
- Goalies: `showGkPicker`, `openGkSpin`, `openGoaliePicker`, `spinWheel`, `stopWheel`, `confirmGkFromSpin`
- Game render: `renderGame`, `renderField`, `renderGrid`, `computeFairShare`, `getStatus`
- Substitutions: `handleTap`, `createPlan`, `executeAllPlans`, `makeSub`, `moveFieldPlayerToBench`
- Timer: `pauseGame`, `resumeGame`, `tick`, `renderClock`
- Goals/score: `openGoalModal`, `recordGoal`, `confirmGoal`, `confirmTheirScore`, `renderScore`
- Half/end/summary: `handleHalfEnd`, `startSecondHalf`, `endGame`, `buildGameRecord`, `showSummary`, `showSeasonSummary`
- Import/export/photos: `exportProfile`, `importProfile`, `importLeagueCsv`, `importGameReview`, `resizeAndStorePhoto`

## Field positions

Fixed formation: 3-3-2 + GK.

```js
LF, CF, RF, LM, CM, RM, LD, RD, GK
```

Coordinates live in `POSITIONS`. Rendering order lives in `POSITION_ORDER`.

## Debugging workflow

1. Identify the feature area using `PROJECT_MAP.md`.
2. Search `index.html` for the relevant function/id/state variable.
3. Read a tight range around the match.
4. Check both the state mutation and the corresponding render/save call.
5. Check delegated listeners at the bottom if clicks on re-rendered elements are involved.
6. Use `git diff --stat` and targeted diffs for recent regressions.

Useful PowerShell patterns:

```powershell
Select-String -Path .\index.html -Pattern "functionName|dom-id|stateVariable" -Context 5,20
```

```powershell
$lines = Get-Content .\index.html
$lines[1200..1320]
```

```powershell
git diff --stat
git diff --unified=5 -- index.html
```

Avoid:

```powershell
Get-Content .\index.html
cat .\index.html
git diff
```
