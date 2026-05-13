# Design: Split index.html into ES Modules

**Date:** 2026-05-12  
**Status:** Needs revision before implementation

## Goals

- Reduce Claude Code token cost per task by enabling targeted reads of small focused files instead of navigating a 5,000-line monolith.
- Improve human readability and maintainability by grouping related functions into logical modules.
- Preserve the no-build, no-npm, direct-edit workflow.
- Preserve full offline PWA support on iPad.
- Keep each migration commit functional and easy to review.

## Current Assessment

The ES module direction is sound, but the migration must not rely on broad text replacement. A trial split already showed that raw replacement of names such as `roster`, `players`, and `goals` corrupts CSS selectors, DOM ids, visible copy, localStorage/profile schemas, object literal keys, and sort keys.

The implementation should either restart from a clean `index.html` or carefully repair the partial changes before continuing.

## File Structure

```text
index.html            - HTML + CSS + <script type="module" src="js/app.js">
js/
  state.js            - mutable state singleton, runtime constants, FIELD_SVG
  utils.js            - escHtml, showScreen, openModal, closeModal, theme helpers
  persistence.js      - localStorage/profile import/export, CSV import, buildGameRecord
  roster.js           - roster CRUD, attendance tiles, photos
  summary.js          - showSummary, showSeasonSummary, showGameReviewFromRecord, renderGoalsHtml
  lineup.js           - lineup draft, GK picker, goalie wheel, launchGame
  game.js             - timer, renderGame/Field/Grid, substitutions, goals, late arrival, half-time, endGame
  app.js              - init entry point, event wiring, global inline-handler bridge if still needed, service worker registration
```

CSS remains in `index.html` for now. Extracting CSS is a lower-risk follow-on once the JS split is stable.

## Dependency Graph

```text
state.js       (no imports - base layer)
utils.js       <- state.js only if theme state lives there
persistence.js <- state.js, utils.js
roster.js      <- state.js, utils.js, persistence.js
summary.js     <- state.js, utils.js
lineup.js      <- state.js, utils.js, persistence.js, game.js where start-game handoff requires it
game.js        <- state.js, utils.js, persistence.js, summary.js
app.js         <- all modules
```

Avoid circular imports. If a function would create a cycle, move orchestration into `app.js` or pass callbacks explicitly.

Important dependency note: `importGameReview` should live in `summary.js` or be wired by `app.js`, because it must call `showGameReviewFromRecord`. Keeping it in `persistence.js` creates a hidden dependency from persistence back into summary rendering.

## State Ownership

`js/state.js` exports a single mutable object for app state that must be shared across modules.

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
  selectedLineupSlot: null,
  selectedLineupPlayer: null,
  fieldPointerDrag: null,
  lineupPointerDrag: null,
  goalie1Id: null,
  goalie2Id: null,
  activeGoalieId: null,
  totalElapsed: 0,
  halfClock: 0,
  timerBase: null,
  isRunning: false,
  currentHalf: 1,
  halfActionIsEnd: false,
  benchSort: 'name',
  nextId: 1,
  gkPickerPhase: 1,
  goaliePickerSkipped: false,
  seasonSortKey: 'seconds',
  seasonSortDir: 'desc',
  scoreUs: 0,
  scoreThem: 0,
  goals: [],
  gameDate: '',
  opponentName: '',
  teamName: 'My Team',
  halfMinutes: 25,
};

export const POSITIONS = { /* ... */ };
export const POSITION_ORDER = [ /* ... */ ];
export const FIELD_SVG = `...`;
```

Some variables may stay module-local only if they are fully owned by one module and never needed by another. Document those decisions in the module header. Timer interval handles, wheel animation handles, and drag preview DOM nodes are good candidates for module-local state.

## Replacement Rules

Do not do raw repository-wide string replacement.

Allowed:

- Replace bare JavaScript identifiers inside script code after checking local context.
- Replace assignment targets such as `players = []` with `state.players = []`.
- Replace reads such as `players.filter(...)` with `state.players.filter(...)`.

Not allowed:

- CSS selectors: `.roster-list`, `.summary-goals`, `.lineup-players-panel`.
- DOM ids: `roster-list`, `gameday-roster`, `summary-goals`, `season-sort-goals`.
- HTML classes, visible text, comments meant for users, or localStorage/profile schema keys.
- Object literal shorthand when the key must remain stable. For example, use `goals: state.goals`, not `state.goals`.
- JSON/profile property names. Keep exported data compatible unless a separate schema migration is planned.

## Inline Handler Strategy

This app currently uses many inline handlers such as `onclick="goToLineup()"` and `oninput="updateStartBtn()"`.

Module-scoped functions are not automatically available to inline HTML handlers. Before replacing the final script block with `src="js/app.js"`, choose one of these strategies:

1. Preferred: replace inline handlers with explicit `addEventListener` wiring in `app.js`.
2. Transitional: expose a small intentional global bridge from `app.js`, such as:

```js
Object.assign(window, {
  goToLineup,
  updateStartBtn,
  toggleTheme,
  // only functions still referenced by inline handlers
});
```

The transitional bridge is acceptable during migration but should be treated as temporary technical debt.

## Module Exports Pattern

Each feature module uses named exports and imports only what it needs.

```js
// js/roster.js
import { state } from './state.js';
import { escHtml, openModal } from './utils.js';
import { saveRoster } from './persistence.js';

export function renderTeamSetupRoster() { /* ... */ }
export function addRosterPlayer() { /* ... */ }
```

## app.js Wiring

`app.js` is the entry point. It imports public functions, runs init, wires DOM events, registers service worker, and optionally exposes the transitional inline-handler bridge.

```js
import { FIELD_SVG, state } from './state.js';
import { applyTheme } from './utils.js';
import { loadSettings, loadGameHistory, checkForActiveGame } from './persistence.js';
import { loadRoster, renderRoster } from './roster.js';
import { handleTap } from './game.js';

applyTheme(localStorage.getItem('theme') || 'dark');
loadSettings();
loadGameHistory();
loadRoster();
renderRoster();
checkForActiveGame();

document.getElementById('bench-grid').addEventListener('click', event => {
  const card = event.target.closest('.player-card');
  if (card) handleTap(Number(card.dataset.id), 'bench');
});
```

`index.html` final script should become:

```html
<script type="module" src="js/app.js"></script>
```

## Service Worker

Current `sw.js` does not automatically add newly fetched JS modules to the cache. It checks the cache and falls back to network, but it does not `cache.put()` successful module responses.

For reliable offline support, final migration must do one of these:

- Add every module file to `ASSETS` and bump cache version from `stm-v2` to `stm-v3`.
- Or update the fetch handler to opportunistically cache successful same-origin JS responses, then bump the cache version.

The simple and explicit option is preferred:

```js
const CACHE = 'stm-v3';
const ASSETS = [
  './',
  './index.html',
  './js/app.js',
  './js/state.js',
  './js/utils.js',
  './js/persistence.js',
  './js/roster.js',
  './js/summary.js',
  './js/lineup.js',
  './js/game.js',
];
```

## Migration Phases

Each phase should be committed independently and leave the app functional. Run a browser smoke test after each phase.

| Phase | Action |
|---|---|
| 0 | Restore or repair any accidental raw-replace damage. Confirm `index.html` works exactly as before the split. |
| 1 | Add `js/state.js` with constants and shared state. Keep existing inline script working. Carefully update only JavaScript identifier references in `index.html`; do not touch CSS, ids, copy, or schema keys. |
| 2 | Move pure utilities into `js/utils.js`: `escHtml`, `showScreen`, modal helpers, theme helpers. Import them from the inline module script. |
| 3 | Move persistence/profile functions into `js/persistence.js`: settings, roster/history saves, active game save/resume, profile export/import, CSV parsing, `buildGameRecord`. Keep review rendering out of this module. |
| 4 | Move summary/review functions into `js/summary.js`, including `importGameReview`, `showGameReviewFromRecord`, `showSummary`, `showSeasonSummary`, and `renderGoalsHtml`. |
| 5 | Move roster/photos/attendance into `js/roster.js`. |
| 6 | Move lineup/GK picker/wheel into `js/lineup.js`. |
| 7 | Move timer/render/substitution/goals/late-arrival/half/end-game logic into `js/game.js`. |
| 8 | Create `js/app.js`, move init and delegated listeners, replace inline script with `src="js/app.js"`, add or remove the inline-handler bridge according to the chosen strategy. |
| 9 | Update `sw.js` offline cache, bump cache version, update `PROJECT_MAP.md`, and commit final migration docs. |

## Smoke Test Checklist

After every phase:

- App loads with no console syntax/runtime errors.
- Existing roster renders.
- Team Settings opens, add/rename/remove still works.
- Game day attendance tiles render and Start enables with an opponent.
- Lineup screen opens and assigns players.
- Live game screen renders field/bench and Start/Pause works.
- Goal modal opens and records both team and opponent goals.
- Half-time and End Game flow still render the summary.
- Review Game and Review Season still open.
- Refresh/reopen can resume an active game.
- Served locally, the app and module files are available offline after first load.

## Out of Scope

- CSS extraction.
- UI redesign.
- Data schema migration beyond preserving existing export/import keys.
- Adding a build step, bundler, package manager, or transpiler.
