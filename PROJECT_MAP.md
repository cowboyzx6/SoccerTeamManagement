# PROJECT_MAP.md

Purpose: quick navigation map for Claude Code and humans working on the single-file app. This file is intentionally concise so Claude can read it instead of scanning all of `index.html`.

## How to use this map

- Start here before broad exploration of `index.html`.
- Search by section name, DOM id, function name, or line range.
- Read only the smallest useful range first.
- Do not load the whole `index.html` unless a targeted search fails and the reason is stated.

## Project files

- `index.html` — main PWA: HTML, CSS, and JavaScript in one file, currently 4340 lines.
- `manifest.json` — PWA metadata.
- `sw.js` — service worker/offline caching.

## Important correction

There is no separate `gameday-screen` element. The game-day landing/check-in UI is inside `#setup-screen`, with `#gameday-empty` and `#gameday-content`.

There is no separate `review-screen` element. Game review imports are rendered through `#summary-screen`.

## CSS map in `index.html`

| Lines | Section | What lives here |
|---:|---|---|
| 12-91 | Global/reset/theme variables | Base CSS, dark/light theme variables, body, .screen toggling |
| 92-254 | Setup screen | Setup/team screens, roster list, buttons, text inputs, overflow menu |
| 255-292 | Game info row | Game number/date/opponent inputs and responsive layout |
| 293-407 | Gameday player tiles | Attendance tiles, selected check mark, attendance counter/bar, theme button |
| 408-455 | Game screen layout | Game screen container, header, half pill, game clock |
| 456-809 | Score/game panels/bench cards | Score bar, game body, field/bench panels, player cards, avatars, legends |
| 810-962 | Lineup screen | Lineup layout, unassigned player list, field board, lineup actions |
| 963-1004 | Modals | Overlay/modal generic styles and modal button rows |
| 1005-1279 | Summary screens | Game/season summary tables, stat cards, time bars, chips |
| 1280-1315 | Goalie styles | Goalie status, GK badges/buttons |
| 1316-1368 | Goalie wheel | Wheel container, fades, track, items |
| 1369-1529 | Field diagram | Field diagram, position slots, pos labels/avatar/time, GK/bench slot buttons |
| 1530-1589 | Sub planning | Planned sub indicators, incoming player strip, Sub Now button |

## HTML / DOM map in `index.html`

| Lines | Section | What lives here |
|---:|---|---|
| 1594-1657 | Game day screen / setup-screen | Landing screen. Contains theme button, overflow menu, no-roster empty state, gameday attendance content. |
| 1658-1701 | Team setup screen | Team settings, roster management, import/export inputs, clear data button. |
| 1702-1715 | Clear data confirm modal | Reset confirmation dialog. |
| 1716-1750 | Lineup screen | Starting lineup assignment field + unassigned players. |
| 1751-1824 | Game screen | Live clock, score bar, field panel, bench panel, planned subs. |
| 1825-1850 | Summary screen | Post-game summary and manual Export Game JSON button. |
| 1851-1895 | Season summary screen | Aggregate season record/stats table. |
| 1896-1920 | Goalie wheel modal | Spin wheel controls and goalie confirm buttons. |
| 1921-1934 | Remove from roster modal | Permanent roster removal. |
| 1935-1948 | Rename player modal | Player rename input. |
| 1949-1962 | GK picker modal | Manual GK picker plus spin option. |
| 1963-1973 | Late arrival modal | Add not-present roster player to active game bench. |
| 1974-1987 | Remove player from game modal | Mark player as left/removed from active game. |
| 1988-2020 | Goal modal | Our goal/opponent goal and scorer/score adjustment UI. |
| 2021-2035 | Half time / end game modal | Half-time summary and end-game confirmation. |
| 2036-4340 | Script block | All app logic. |

## JavaScript map in `index.html`

| Lines | Section | What lives here |
|---:|---|---|
| 2039-2081 | POSITIONS | Field coordinates, position order, formation SVG, field SVG. |
| 2082-2121 | STATE | Global state for roster, active players, timer, planned subs, goalies, score, history, lineup draft. |
| 2122-2130 | HALF DURATION STEPPER | Minutes-per-half stepper. |
| 2131-2225 | TEAM NAME / SETTINGS | Team name, settings/history persistence, active game save/resume. |
| 2226-2294 | IMPORT / EXPORT PROFILE | Build/export profile and game record JSON. |
| 2295-2428 | LEAGUE CSV IMPORT | League CSV file reader and parser. |
| 2429-2610 | GAME REVIEW (import a past game JSON for read-only display) | Import past exported game JSON and render it read-only through summary-screen. |
| 2611-2685 | PHOTOS | Player photo load, avatar HTML, upload, resize/crop/store. |
| 2686-2879 | ROSTER MANAGEMENT (Setup Screen) | Roster CRUD, attendance tiles, select all, start button enablement. |
| 2880-2955 | GAME START / LINEUP | Build lineup draft from attending players, GK picker entry, navigation back to gameday. |
| 2956-3114 | LINEUP RENDERING | Render lineup field/unassigned players, slot/player tap assignment, launch button. |
| 3115-3367 | GOALIE WHEEL | Manual/spin goalie workflow, wheel animation, winner assignment, start game setup. |
| 3368-3427 | TIMER | Start/pause/resume/tick clock, render clock warning/urgent classes. |
| 3428-3669 | GAME RENDER | Compute fair share, status colors, render field/bench, sort bench, hints, goal button. |
| 3670-3711 | REMOVE PLAYER FROM GAME | Mark a player as leftEarly and preserve played/position time. |
| 3712-3871 | SUBSTITUTION | Tap handling, planned subs, executeAllPlans, immediate makeSub, move field player to bench, active goalie assignment. |
| 3872-3920 | LATE ARRIVAL | Add roster players who were not in active game to bench mid-game. |
| 3921-4040 | HALF TIME / END GAME | Half-time modal, first-half snapshots, GK switch for second half, endGame persistence. |
| 4041-4141 | SCORE / GOALS | Goal modal, score updates, scorer tracking, opponent score adjustment. |
| 4142-4261 | SUMMARY | Game summary render, season summary, navigation, overflow menu, clear data. |
| 4262-4276 | UTILITIES | showScreen, open/close modal, escHtml. |
| 4277-4296 | THEME | Dark/light theme persistence. |
| 4297-4312 | INIT | Insert SVGs, load theme/photos/settings/history/roster, active game resume, beforeunload save. |
| 4313-4340 | DELEGATED LISTENERS (attached once; survive re-renders) | Delegated click handlers for field/bench buttons and service worker registration. |

## Common bug targets

| Symptom / task | Start by searching for |
|---|---|
| Attendance / who showed up / start button | `renderGameDayCheckboxes`, `togglePlayerTile`, `checkedPlayers`, `updateStartBtn`, `#gameday-roster`, `#start-btn` |
| Team setup / roster add/remove/rename | `renderTeamSetupRoster`, `addRosterPlayer`, `openRenameModal`, `removeRosterPlayer`, `#roster-list` |
| Lineup assignment | `renderLineup`, `renderLineupField`, `lineupSlotTap`, `lineupPlayerTap`, `updateLineupLaunchBtn`, `lineupDraft` |
| Goalkeeper picker/wheel | `showGkPicker`, `openGkSpin`, `openGoaliePicker`, `spinWheel`, `stopWheel`, `confirmGkFromSpin`, `confirmGoalies` |
| Timer / clock / pause | `togglePause`, `pauseGame`, `resumeGame`, `tick`, `renderClock`, `halfClock`, `totalElapsed`, `timerBase` |
| Bench sorting / card colors | `computeFairShare`, `getStatus`, `setBenchSort`, `renderGame`, `renderGrid`, `benchSort` |
| Field diagram / position slots | `POSITIONS`, `renderField`, `.pos-slot`, `#field-positions`, `moveFieldPlayerToBench`, delegated field listener |
| Planned substitutions | `handleTap`, `createPlan`, `cancelPlanForPos`, `executeAllPlans`, `subPlans`, `planningBenchId`, `planningPosition` |
| Immediate substitution | `handleTap`, `makeSub`, `selectedId`, `activeGoalieId` |
| Late arrivals | `openLateModal`, `confirmLateArrival`, `#late-player-list` |
| Remove player from active game | `promptRemovePlayer`, `confirmRemovePlayer`, `leftEarly`, delegated bench listener |
| Goals / score | `openGoalModal`, `recordGoal`, `confirmGoal`, `confirmTheirScore`, `renderScore`, `goals`, `scoreUs`, `scoreThem` |
| Half time / second half | `handleHalfEnd`, `startSecondHalf`, `h1Snapshot`, `goalie2Id`, `activeGoalieId` |
| End game / summary | `endGame`, `buildGameRecord`, `showSummary`, `renderGoalsHtml`, `saveGameHistory` |
| Season summary | `showSeasonSummary`, `gameHistory`, `season-body` |
| Import/export profile | `buildProfile`, `exportProfile`, `importProfile`, `importLeagueCsv`, `parseCsvRoster` |
| Game review import | `importGameReview`, `showGameReviewFromRecord`, `review-file-input` |
| Photos / avatars | `loadPhotos`, `avatarHtml`, `avatarParts`, `triggerPhotoUpload`, `resizeAndStorePhoto`, `playerPhotos` |
| Theme | `applyTheme`, `toggleTheme`, `[data-theme="light"]`, `theme-btn` |
| Resume interrupted game | `saveActiveGame`, `checkForActiveGame`, `soccerActiveGame` |
| Service worker / PWA | `navigator.serviceWorker.register`, `manifest.json`, `sw.js` |

## Key DOM ids

### Screens

- `setup-screen`
- `team-setup-screen`
- `lineup-screen`
- `game-screen`
- `summary-screen`
- `season-summary-screen`

### Setup / game-day

- `theme-btn`
- `overflow-menu-btn`
- `overflow-menu`
- `app-title-name`
- `gameday-empty`
- `gameday-content`
- `game-number-label`
- `game-date-input`
- `opponent-input`
- `gameday-roster`
- `selected-count`
- `total-count`
- `attendance-bar-fill`
- `half-minutes-display`
- `start-btn`

### Team setup

- `team-name-input`
- `roster-list`
- `new-player-input`
- `add-player-btn`
- `photo-file-input`
- `import-file-input`
- `csv-file-input`
- `review-file-input`

### Lineup

- `lineup-header-title`
- `lineup-field-diagram`
- `lineup-field-positions`
- `lineup-hint`
- `lineup-unassigned-list`
- `launch-btn`

### Live game

- `half-pill`
- `clock`
- `pause-btn`
- `action-btn`
- `score-us-label`
- `score-them-label`
- `score-us`
- `score-them`
- `goal-btn`
- `field-count`
- `sub-status`
- `game-field-diagram`
- `field-positions`
- `bench-count`
- `sort-name-btn`
- `sort-time-btn`
- `sort-priority-btn`
- `sub-hint`
- `sub-now-wrap`
- `sub-now-btn`
- `bench-grid`

### Modals

- `clear-data-modal`
- `goalie-modal`
- `remove-roster-modal`
- `rename-modal`
- `gk-picker-modal`
- `late-modal`
- `remove-player-modal`
- `goal-modal`
- `half-modal`

## State variables to understand before editing logic

- `roster` — permanent team roster, persisted in `soccerRoster`.
- `players` — active game players and runtime stats.
- `gameHistory` — completed game records, persisted in `soccerGameHistory`.
- `playerPhotos` — id-to-base64 photo map, persisted in `playerPhotos`.
- `subPlans` — queued planned substitutions: `{ inId, pos }`.
- `planningBenchId` — bench player selected while planning a sub.
- `planningPosition` — empty/field slot selected while planning a sub.
- `selectedId` — field player selected for immediate substitution.
- `lineupDraft` — temporary pre-game lineup assignment.
- `goalie1Id`, `goalie2Id`, `activeGoalieId` — goalie assignment state.
- `totalElapsed`, `halfClock`, `timerBase`, `isRunning` — timer state.
- `scoreUs`, `scoreThem`, `goals` — scoring state.
- `gameDate`, `opponentName`, `teamName`, `halfMinutes` — game/team metadata.

## Targeted PowerShell snippets for Claude Code

Find likely code without dumping the whole file:

```powershell
Select-String -Path .\index.html -Pattern "renderGameDayCheckboxes|togglePlayerTile|updateStartBtn" -Context 5,20
```

Read a tight range:

```powershell
$lines = Get-Content .\index.html
$lines[3427..3668]
```

Recent regression first:

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
