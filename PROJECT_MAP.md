# PROJECT_MAP.md

Purpose: quick navigation map for Claude Code and humans working on the single-file app. This file is intentionally concise so Claude can read it instead of scanning all of `index.html`.

## How to use this map

- Start here before broad exploration of `index.html`.
- Search by section name, DOM id, function name, or line range.
- Read only the smallest useful range first.
- Do not load the whole `index.html` unless a targeted search fails and the reason is stated.

## Project files

- `index.html` - main PWA: HTML, CSS, and JavaScript in one file, currently 5103 lines.
- `manifest.json` - PWA metadata.
- `sw.js` - service worker/offline caching.
- `README.md` - user-facing app overview, setup, data/export notes, limitations.
- `CLAUDE.md` - repo-specific guidance for AI coding agents.
- `scripts/Update-AppVersion.ps1` - version stamping helper used by the git hook.
- `.githooks/` - tracked git hook setup.
- `GameResults/` - exported game JSON examples/history:
  - `Oyster_Blueberries_Game_1_2026-04-18_1100.json`
  - `Oyster_Blueberries_Game_2_2026-04-25_1158.json`
  - `Oyster_Blueberries_Game_3_2026-05-02_1902.json`
- `docs/superpowers/specs/` and `docs/superpowers/plans/` - design specs and implementation plans for recent screen/layout work.
- `.superpowers/` - local generated brainstorm/session scratch files; currently untracked.

## Important correction

There is no separate `gameday-screen` element. The game-day landing/check-in UI is inside `#setup-screen`, with `#gameday-empty` and `#gameday-content`.

There is no separate `review-screen` element. Game review imports are rendered through `#summary-screen`.

## CSS map in `index.html`

| Lines | Section | What lives here |
|---:|---|---|
| 12-91 | Global/reset/theme variables | Base CSS, dark/light theme variables, body, `.screen` toggling |
| 92-429 | Setup screen | Setup/team screens, roster list, buttons, text inputs, overflow menu, responsive setup layout |
| 430-467 | Game info row | Game number/date/opponent inputs and responsive layout |
| 468-604 | Gameday player tiles | Attendance tiles, selected check mark, attendance counter/bar, theme button |
| 605-743 | Game header / score bar | Live header, half pill, clock, score labels/buttons, compact action controls |
| 744-1026 | Game panels / cards | Game body, field/bench panels, player cards, avatars, status colors, roster avatars |
| 1027-1167 | Lineup screen | Lineup layout, unassigned player list, shared field board, lineup actions |
| 1168-1209 | Modals | Overlay/modal generic styles and modal button rows |
| 1210-1570 | Summary screens | Game/season summary tables, stat cards, time bars, chips, review goalie icon |
| 1571-1606 | Goalie styles | Goalie status, GK badges/buttons |
| 1607-1659 | Goalie wheel | Wheel container, fades, track, items |
| 1660-1823 | Field diagram | Shared field diagram, position slots, pos labels/avatar/time, GK/bench slot buttons |
| 1824-1920 | Sub planning | Planned sub indicators, incoming player strip, Sub Now button |

## HTML / DOM map in `index.html`

| Lines | Section | What lives here |
|---:|---|---|
| 1921-1986 | Game day screen / setup-screen | Landing screen. Theme button, overflow menu, no-roster empty state, game info, attendance grid, half duration controls. |
| 1987-2030 | Team setup screen | Team settings, roster management, import/export inputs, clear data button. |
| 2031-2044 | Clear data confirm modal | Reset confirmation dialog. |
| 2045-2061 | About modal | Displays `APP_VERSION` and app metadata from the overflow menu. |
| 2062-2096 | Lineup screen | Starting lineup assignment field + unassigned players. |
| 2097-2170 | Game screen | Compact live header, score area, field panel, bench panel, planned subs. |
| 2171-2202 | Summary screen | Post-game/review summary and manual Export Game JSON button. |
| 2203-2253 | Season summary screen | Aggregate season record/stats table with sortable columns and top-right back button. |
| 2254-2278 | Goalie wheel modal | Spin wheel controls and goalie confirm buttons. |
| 2279-2292 | Remove from roster modal | Permanent roster removal. |
| 2293-2306 | Rename player modal | Player rename input. |
| 2307-2320 | GK picker modal | Two-step manual GK picker plus spin option. |
| 2321-2331 | Late arrival modal | Add not-present roster player to active game bench. |
| 2332-2345 | Remove player from game modal | Mark player as left/removed from active game. |
| 2346-2378 | Goal modal | Our goal/opponent goal and scorer/score adjustment UI. |
| 2379-2393 | Half time / end game modal | Half-time summary, second-half start, and end-game controls. |
| 2394-5103 | Script block | All app logic. |

## JavaScript map in `index.html`

| Lines | Section | What lives here |
|---:|---|---|
| 2398-2418 | POSITIONS / constants | Field coordinates, position order, app version, shared field SVG. |
| 2419-2462 | STATE | Global state for roster, active players, timer, planned subs, goalies, score, history, lineup/drag state. |
| 2463-2471 | HALF DURATION STEPPER | Minutes-per-half stepper. |
| 2472-2538 | TEAM NAME / SETTINGS | Team name, settings/history persistence, active game save/resume. |
| 2539-2634 | IMPORT / EXPORT PROFILE | Build/export profile and game record JSON. |
| 2635-2775 | LEAGUE CSV / PROFILE IMPORT | Team backup restore, league CSV file reader/parser. |
| 2776-3008 | GAME REVIEW + SEASON SUMMARY | Import past game JSON, review summary with GK marker, season sorting/summary. |
| 3009-3081 | PHOTOS | Player photo load, avatar HTML, upload, resize/crop/store. |
| 3082-3278 | ROSTER MANAGEMENT | Roster CRUD, attendance tiles, select all, start button enablement. |
| 3279-3389 | GAME START / GK PICKER ENTRY | Build lineup draft, two-step GK picker entry, navigation back to gameday. |
| 3390-3675 | LINEUP RENDERING / DRAG | Render lineup field/unassigned players, pointer drag/tap assignment, launch button for short lineups. |
| 3676-3979 | GOALIE WHEEL + GAME INIT | Season-fresh goalie candidates, manual/spin goalie workflow, wheel animation, start game setup. |
| 3980-4053 | TIMER / PHASE UI | Start/pause/resume/tick clock, render clock warning/urgent classes, sync half/action buttons. |
| 4054-4171 | GAME RENDER CORE | Played time, fair share, status colors, bench sort, render shell/hints. |
| 4172-4263 | FIELD DRAG HANDLERS | Drag preview and pointer handlers for moving/switching field players. |
| 4264-4395 | FIELD / BENCH RENDER | Render position slots, incoming sub strips, bench cards, goalie/bench controls. |
| 4396-4435 | REMOVE PLAYER FROM GAME | Mark a player as leftEarly and preserve played/position time. |
| 4436-4627 | SUBSTITUTION | Tap handling, planned subs, executeAllPlans, immediate makeSub, field-to-bench, active goalie assignment. |
| 4628-4676 | LATE ARRIVAL | Add roster players who were not in active game to bench mid-game. |
| 4677-4789 | HALF TIME / SECOND HALF | Half-time modal, first-half snapshots, GK switch for second half. |
| 4790-4866 | SCORE / GOALS | Goal modal, score updates, scorer tracking, opponent score adjustment. |
| 4867-5017 | SUMMARY / NAV / CLEAR DATA | End game, summary render, overflow/About menu, navigation, clear data. |
| 5018-5032 | UTILITIES | `showScreen`, modal helpers, `escHtml`. |
| 5033-5050 | THEME | Dark/light theme persistence. |
| 5051-5068 | INIT | Shared SVG insertion, load theme/photos/settings/history/roster, active game resume, beforeunload save. |
| 5069-5103 | DELEGATED LISTENERS / SERVICE WORKER | Delegated click/pointer handlers for field/bench buttons and service worker registration. |

## Common bug targets

| Symptom / task | Start by searching for |
|---|---|
| Attendance / who showed up / start button | `renderGameDayCheckboxes`, `togglePlayerTile`, `checkedPlayers`, `updateStartBtn`, `#gameday-roster`, `#start-btn` |
| Team setup / roster add/remove/rename | `renderTeamSetupRoster`, `addRosterPlayer`, `openRenameModal`, `removeRosterPlayer`, `#roster-list` |
| Lineup assignment / short-handed starts | `renderLineup`, `renderLineupField`, `handleLineupPointerDown`, `moveLineupPlayerToPosition`, `lineupSlotTap`, `lineupPlayerTap`, `updateLineupLaunchBtn`, `lineupDraft` |
| Goalkeeper picker/wheel | `showGkPicker`, `openGkSpin`, `openGoaliePicker`, `seasonFreshGoalieCandidates`, `spinWheel`, `stopWheel`, `confirmGkFromSpin`, `confirmGoalies` |
| Timer / clock / pause | `togglePause`, `pauseGame`, `resumeGame`, `tick`, `renderClock`, `syncGamePhaseUi`, `halfClock`, `totalElapsed`, `timerBase` |
| Bench sorting / card colors | `computeFairShare`, `getStatus`, `setBenchSort`, `renderGame`, `renderGrid`, `benchSort` |
| Field diagram / position slots | `POSITIONS`, `FIELD_SVG`, `renderField`, `.pos-slot`, `#field-positions`, `handleFieldSlotPointerDown`, `moveFieldPlayerToPosition`, `moveFieldPlayerToBench` |
| Planned substitutions | `handleTap`, `createPlan`, `cancelPlanForPos`, `executeAllPlans`, `subPlans`, `planningBenchId`, `planningPosition` |
| Immediate substitution | `handleTap`, `makeSub`, `selectedId`, `activeGoalieId` |
| Late arrivals | `openLateModal`, `confirmLateArrival`, `#late-player-list` |
| Remove player from active game | `promptRemovePlayer`, `confirmRemovePlayer`, `leftEarly`, delegated bench listener |
| Goals / score | `openGoalModal`, `recordGoal`, `confirmGoal`, `confirmTheirScore`, `renderScore`, `goals`, `scoreUs`, `scoreThem` |
| Half time / second half | `handleHalfEnd`, `startSecondHalf`, `h1Snapshot`, `goalie2Id`, `activeGoalieId` |
| End game / summary | `endGame`, `buildGameRecord`, `showSummary`, `renderGoalsHtml`, `saveGameHistory` |
| Season summary | `showSeasonSummary`, `setSeasonSort`, `compareSeasonPlayers`, `gameHistory`, `season-body` |
| Backup/restore/import | UI labels: `Backup Team`, `Restore Backup`, `Import League CSV`. Code targets: `buildProfile`, `exportProfile`, `importProfile`, `importLeagueCsv`, `parseCsvRoster` |
| Game review import | `importGameReview`, `showGameReviewFromRecord`, `review-file-input` |
| Photos / avatars | `loadPhotos`, `avatarHtml`, `avatarParts`, `triggerPhotoUpload`, `resizeAndStorePhoto`, `playerPhotos` |
| Theme | `applyTheme`, `toggleTheme`, `[data-theme="light"]`, `theme-btn` |
| About/version | `APP_VERSION`, `openAboutModal`, `about-modal`, `about-version`, `scripts/Update-AppVersion.ps1` |
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
- `check-all-btn`
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

### Summary / season

- `summary-team-name`
- `summary-vs-line`
- `summary-meta`
- `summary-export-btn`
- `summary-goals-title`
- `summary-goals`
- `summary-body`
- `season-team-name`
- `season-wins`
- `season-losses`
- `season-draws`
- `season-gf`
- `season-ga`
- `season-meta`
- `season-sort-player`
- `season-sort-gp`
- `season-sort-goals`
- `season-sort-time`
- `season-body`

### Modals

- `clear-data-modal`
- `about-modal`
- `about-version`
- `goalie-modal`
- `goalie-wheel-title`
- `goalie-wheel-subtitle`
- `wheel-track`
- `gk-picker-modal`
- `gk-picker-title`
- `gk-picker-subtitle`
- `gk-picker-list`
- `remove-roster-modal`
- `rename-modal`
- `late-modal`
- `late-player-list`
- `remove-player-modal`
- `goal-modal`
- `goal-scorer-section`
- `goal-scorer-list`
- `goal-them-section`
- `goal-them-preview`
- `half-modal`
- `half-modal-title`
- `half-modal-body`
- `half-confirm-btn`
- `half-end-early-btn`

## State variables to understand before editing logic

- `roster` - permanent team roster, persisted in `soccerRoster`.
- `players` - active game players and runtime stats.
- `gameHistory` - completed game records, persisted in `soccerGameHistory`.
- `playerPhotos` - id-to-base64 photo map, persisted in `playerPhotos`.
- `subPlans` - queued planned substitutions: `{ inId, pos }`.
- `planningBenchId` - bench player selected while planning a sub.
- `planningPosition` - empty/field slot selected while planning a sub.
- `selectedId` - field player selected for immediate substitution.
- `lineupDraft` - temporary pre-game lineup assignment.
- `selectedLineupPlayer`, `lineupPointerDrag` - lineup tap/drag assignment state.
- `fieldPointerDrag` - live-game field drag/reposition state.
- `goalie1Id`, `goalie2Id`, `activeGoalieId` - goalie assignment state.
- `totalElapsed`, `halfClock`, `timerBase`, `isRunning` - timer state.
- `scoreUs`, `scoreThem`, `goals` - scoring state.
- `gameDate`, `opponentName`, `teamName`, `halfMinutes` - game/team metadata.
- `seasonSortKey`, `seasonSortAsc` - season summary sorting state.
- `APP_VERSION` - exported app version shown in About and included in JSON exports.

## Targeted PowerShell snippets for Claude Code

Find likely code without dumping the whole file:

```powershell
Select-String -Path .\index.html -Pattern "renderGameDayCheckboxes|togglePlayerTile|updateStartBtn" -Context 5,20
```

Read a tight range:

```powershell
$lines = Get-Content .\index.html
$lines[3390..3675]
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
