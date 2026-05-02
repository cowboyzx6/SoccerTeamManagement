# PROJECT_MAP.md

Purpose: quick navigation map for Claude Code and humans working on the single-file app. This file is intentionally concise so Claude can read it instead of scanning all of `index.html`.

## How to use this map

- Start here before broad exploration of `index.html`.
- Search by section name, DOM id, function name, or line range.
- Read only the smallest useful range first.
- Do not load the whole `index.html` unless a targeted search fails and the reason is stated.

## Project files

- `index.html` — main PWA: HTML, CSS, and JavaScript in one file, currently 4593 lines.
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
| 437-573 | Game screen layout | Game screen container, compact header, half pill, game clock, score labels/buttons |
| 574-842 | Game panels/bench cards | Game body, field/bench panels, player cards, avatars, legends |
| 843-971 | Lineup screen | Lineup layout, unassigned player list, shared field board, lineup actions |
| 972-1013 | Modals | Overlay/modal generic styles and modal button rows |
| 1014-1374 | Summary screens | Game/season summary tables, stat cards, time bars, chips, review goalie icon |
| 1375-1410 | Goalie styles | Goalie status, GK badges/buttons |
| 1411-1463 | Goalie wheel | Wheel container, fades, track, items |
| 1464-1624 | Field diagram | Shared field diagram, position slots, pos labels/avatar/time, GK/bench slot buttons |
| 1625-1687 | Sub planning | Planned sub indicators, incoming player strip, Sub Now button |

## HTML / DOM map in `index.html`

| Lines | Section | What lives here |
|---:|---|---|
| 1688-1752 | Game day screen / setup-screen | Landing screen. Contains theme button, overflow menu, no-roster empty state, gameday attendance content. |
| 1753-1796 | Team setup screen | Team settings, roster management, import/export inputs, clear data button. |
| 1797-1810 | Clear data confirm modal | Reset confirmation dialog. |
| 1811-1845 | Lineup screen | Starting lineup assignment field + unassigned players. |
| 1846-1919 | Game screen | Compact live header, score area, field panel, bench panel, planned subs. |
| 1920-1951 | Summary screen | Post-game summary and manual Export Game JSON button. |
| 1952-2002 | Season summary screen | Aggregate season record/stats table with top-right back button. |
| 2003-2027 | Goalie wheel modal | Spin wheel controls and goalie confirm buttons. |
| 2028-2041 | Remove from roster modal | Permanent roster removal. |
| 2042-2055 | Rename player modal | Player rename input. |
| 2056-2069 | GK picker modal | Two-step manual GK picker plus spin option. |
| 2070-2080 | Late arrival modal | Add not-present roster player to active game bench. |
| 2081-2094 | Remove player from game modal | Mark player as left/removed from active game. |
| 2095-2127 | Goal modal | Our goal/opponent goal and scorer/score adjustment UI. |
| 2128-2142 | Half time / end game modal | Half-time summary and end-game confirmation. |
| 2143-4593 | Script block | All app logic. |

## JavaScript map in `index.html`

| Lines | Section | What lives here |
|---:|---|---|
| 2148-2168 | POSITIONS | Field coordinates, position order, shared field SVG. |
| 2169-2211 | STATE | Global state for roster, active players, timer, planned subs, goalies, score, history, lineup draft. |
| 2212-2220 | HALF DURATION STEPPER | Minutes-per-half stepper. |
| 2221-2316 | TEAM NAME / SETTINGS | Team name, settings/history persistence, active game save/resume. |
| 2317-2387 | IMPORT / EXPORT PROFILE | Build/export profile and game record JSON. |
| 2388-2521 | LEAGUE CSV IMPORT | League CSV file reader and parser. |
| 2522-2752 | GAME REVIEW + SEASON SUMMARY | Import past game JSON, render review summary with GK marker, season sorting/summary. |
| 2753-2827 | PHOTOS | Player photo load, avatar HTML, upload, resize/crop/store. |
| 2828-3021 | ROSTER MANAGEMENT (Setup Screen) | Roster CRUD, attendance tiles, select all, start button enablement. |
| 3022-3133 | GAME START / LINEUP | Build lineup draft, two-step GK picker entry, navigation back to gameday. |
| 3134-3306 | LINEUP RENDERING | Render lineup field/unassigned players, slot/player tap assignment, launch button for short lineups. |
| 3307-3609 | GOALIE WHEEL + GAME INIT | Season-fresh goalie candidates, manual/spin goalie workflow, wheel animation, start game setup. |
| 3610-3680 | TIMER | Start/pause/resume/tick clock, render clock warning/urgent classes. |
| 3681-3929 | GAME RENDER | Compute fair share, status colors, render field/bench, sort bench, hints, goal button. |
| 3930-3971 | REMOVE PLAYER FROM GAME | Mark a player as leftEarly and preserve played/position time. |
| 3972-4131 | SUBSTITUTION | Tap handling, planned subs, executeAllPlans, immediate makeSub, move field player to bench, active goalie assignment. |
| 4132-4180 | LATE ARRIVAL | Add roster players who were not in active game to bench mid-game. |
| 4181-4293 | HALF TIME / END GAME | Half-time modal, first-half snapshots, GK switch for second half, endGame persistence. |
| 4294-4372 | SCORE / GOALS | Goal modal, score updates, scorer tracking, opponent score adjustment. |
| 4373-4515 | SUMMARY / NAV / CLEAR DATA | End game, summary render, navigation, overflow menu, clear data. |
| 4516-4530 | UTILITIES | showScreen, open/close modal, escHtml. |
| 4531-4550 | THEME | Dark/light theme persistence. |
| 4551-4566 | INIT | Insert shared SVGs, load theme/photos/settings/history/roster, active game resume, beforeunload save. |
| 4567-4593 | DELEGATED LISTENERS (attached once; survive re-renders) | Delegated click handlers for field/bench buttons and service worker registration. |

## Common bug targets

| Symptom / task | Start by searching for |
|---|---|
| Attendance / who showed up / start button | `renderGameDayCheckboxes`, `togglePlayerTile`, `checkedPlayers`, `updateStartBtn`, `#gameday-roster`, `#start-btn` |
| Team setup / roster add/remove/rename | `renderTeamSetupRoster`, `addRosterPlayer`, `openRenameModal`, `removeRosterPlayer`, `#roster-list` |
| Lineup assignment / short-handed starts | `renderLineup`, `renderLineupField`, `lineupSlotTap`, `lineupPlayerTap`, `updateLineupLaunchBtn`, `lineupDraft` |
| Goalkeeper picker/wheel | `showGkPicker`, `openGkSpin`, `openGoaliePicker`, `seasonFreshGoalieCandidates`, `spinWheel`, `stopWheel`, `confirmGkFromSpin`, `confirmGoalies` |
| Timer / clock / pause | `togglePause`, `pauseGame`, `resumeGame`, `tick`, `renderClock`, `halfClock`, `totalElapsed`, `timerBase` |
| Bench sorting / card colors | `computeFairShare`, `getStatus`, `setBenchSort`, `renderGame`, `renderGrid`, `benchSort` |
| Field diagram / position slots | `POSITIONS`, `FIELD_SVG`, `renderField`, `.pos-slot`, `#field-positions`, `moveFieldPlayerToBench`, delegated field listener |
| Planned substitutions | `handleTap`, `createPlan`, `cancelPlanForPos`, `executeAllPlans`, `subPlans`, `planningBenchId`, `planningPosition` |
| Immediate substitution | `handleTap`, `makeSub`, `selectedId`, `activeGoalieId` |
| Late arrivals | `openLateModal`, `confirmLateArrival`, `#late-player-list` |
| Remove player from active game | `promptRemovePlayer`, `confirmRemovePlayer`, `leftEarly`, delegated bench listener |
| Goals / score | `openGoalModal`, `recordGoal`, `confirmGoal`, `confirmTheirScore`, `renderScore`, `goals`, `scoreUs`, `scoreThem` |
| Half time / second half | `handleHalfEnd`, `startSecondHalf`, `h1Snapshot`, `goalie2Id`, `activeGoalieId` |
| End game / summary | `endGame`, `buildGameRecord`, `showSummary`, `renderGoalsHtml`, `saveGameHistory` |
| Season summary | `showSeasonSummary`, `gameHistory`, `season-body` |
| Backup/restore/import | UI labels: `Backup Team`, `Restore Backup`, `Import League CSV`. Code targets: `buildProfile`, `exportProfile`, `importProfile`, `importLeagueCsv`, `parseCsvRoster` |
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
