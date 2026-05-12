# Design: Split index.html into ES Modules

**Date:** 2026-05-12
**Status:** Approved

## Goals

- Reduce Claude Code token cost per task by enabling targeted reads of small focused files instead of navigating a 4,500-line monolith
- Improve human readability and maintainability by grouping related functions into logical modules
- Preserve the no-build, no-npm, direct-edit workflow
- Preserve full offline PWA support on iPad

## File Structure

```
index.html            — HTML + CSS + <script type="module" src="js/app.js">
js/
  state.js            — mutable state singleton, POSITIONS, POSITION_ORDER, FIELD_SVG
  utils.js            — escHtml, showScreen, openModal, closeModal, applyTheme, toggleTheme
  persistence.js      — save*/load* localStorage, exportProfile, importProfile,
                        importLeagueCsv, importGameReview, buildGameRecord
  roster.js           — roster CRUD, attendance tiles, photos
  lineup.js           — lineup draft, GK picker, goalie wheel, launchGame
  game.js             — timer, renderGame/Field/Grid, substitutions, goals,
                        late arrival, half-time, endGame
  summary.js          — showSummary, showSeasonSummary, showGameReviewFromRecord,
                        renderGoalsHtml
  app.js              — init entry point, delegated listeners, service worker registration
```

CSS remains in `index.html` for now — extracting it is a lower-risk follow-on task once the JS split is stable.

## Dependency Graph

```
state.js  (no imports — base layer)
utils.js  ← state.js
persistence.js  ← state.js, utils.js
roster.js  ← state.js, utils.js, persistence.js
lineup.js  ← state.js, utils.js, persistence.js
game.js  ← state.js, utils.js, persistence.js, summary.js
summary.js  ← state.js, utils.js, persistence.js
app.js  ← all modules (entry point)
```

No circular dependencies.

## State Singleton

`js/state.js` exports a single mutable object. All modules import it and mutate its properties directly — no getters/setters needed.

```js
export const state = {
  roster: [],
  players: [],
  gameHistory: [],
  playerPhotos: {},
  subPlans: [],
  planningBenchId: null,
  planningPosition: null,
  selectedId: null,
  lineupDraft: [],
  goalie1Id: null,
  goalie2Id: null,
  activeGoalieId: null,
  totalElapsed: 0,
  halfClock: 0,
  timerBase: null,
  isRunning: false,
  scoreUs: 0,
  scoreThem: 0,
  goals: [],
  gameDate: '',
  opponentName: '',
  teamName: '',
  halfMinutes: 25,
};

export const POSITIONS = { ... };
export const POSITION_ORDER = [ ... ];
export const FIELD_SVG = `...`;
```

Every bare state variable reference (`roster`, `players`, etc.) becomes `state.roster`, `state.players`, etc. This is a mechanical find-replace with no logic changes. Array reassignments like `players = []` become `state.players = []` — valid since we're mutating a property of the exported object, not rebinding the export.

## Module Exports Pattern

Each feature module uses named exports:

```js
// js/roster.js
import { state } from './state.js';
import { escHtml, openModal } from './utils.js';
import { saveRoster } from './persistence.js';

export function renderTeamSetupRoster() { ... }
export function addRosterPlayer() { ... }
```

## app.js Wiring

`app.js` is the single entry point. It imports all public functions, runs init, and owns the delegated event listeners currently at the bottom of `index.html`:

```js
import { state, FIELD_SVG } from './state.js';
import { applyTheme } from './utils.js';
import { loadSettings, loadRoster, checkForActiveGame } from './persistence.js';
import { handleTap } from './game.js';
// ... etc.

// init
applyTheme();
loadSettings();
loadRoster();
checkForActiveGame();

// delegated listeners
document.getElementById('field-positions').addEventListener('click', e => handleTap(e));
// etc.
```

`index.html` script block is replaced with:
```html
<script type="module" src="js/app.js"></script>
```

## Service Worker

`sw.js` cache version bumped from `stm-v2` to `stm-v3` in the final migration phase. The existing opportunistic fetch handler (line 25) automatically caches any new JS files on first network request — no need to enumerate them in `ASSETS`. Bumping the version clears stale caches that won't know about the new files.

## Migration Phases

Each phase is committed independently and leaves the app fully functional.

| Phase | Action |
|---|---|
| 1 | Create `js/state.js`, move state variables and constants, find-replace all `roster` → `state.roster` etc. across `index.html` |
| 2 | Extract `js/utils.js` — `escHtml`, `showScreen`, `openModal`, `closeModal`, `applyTheme` |
| 3 | Extract `js/persistence.js` — all `save*`/`load*`, profile import/export, CSV import, `buildGameRecord` |
| 4 | Extract `js/roster.js` — roster CRUD, attendance tiles, photos |
| 5 | Extract `js/summary.js` — summary/season/review render functions |
| 6 | Extract `js/lineup.js` — lineup draft, GK picker, goalie wheel, `launchGame` |
| 7 | Extract `js/game.js` — timer, render, subs, goals, half-time, end game |
| 8 | Create `js/app.js`, move init + delegated listeners, replace `index.html` `<script>` block, bump `sw.js` to `stm-v3`, update `PROJECT_MAP.md` |

## Out of Scope

- CSS extraction (follow-on task)
- Any logic changes or refactoring beyond the mechanical module split
- Adding a build step, bundler, or transpiler
