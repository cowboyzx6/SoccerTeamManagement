# JS Module Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the JS logic in `index.html` into 8 focused ES module files to reduce Claude Code token cost per task and improve maintainability.

**Architecture:** Enable `type="module"` on `index.html`'s script tag, then incrementally extract code into `js/` files. Each extraction adds imports to `index.html`'s script block and removes the moved functions. The final task moves init + delegated listeners to `js/app.js` and replaces the script block entirely.

**Tech Stack:** Vanilla JS ES modules (no bundler, no npm). Browser-native `import`/`export`. Tested by opening `index.html` via `python3 -m http.server` and visiting `http://localhost:8000` — ES modules require HTTP (not `file://`).

---

## File Map

| File | Responsibility | Source lines (approx) |
|---|---|---|
| `js/state.js` | Mutable state singleton + POSITIONS + FIELD_SVG | 2148–2211 |
| `js/utils.js` | escHtml, showScreen, openModal, closeModal, applyTheme, toggleTheme | 4516–4550 |
| `js/persistence.js` | save*/load* localStorage, exportProfile, importProfile, importLeagueCsv, importGameReview, buildProfile, buildGameRecord | 2221–2521, 4373–4420 |
| `js/roster.js` | Roster CRUD, attendance tiles, photos, half-duration stepper | 2753–3021, 2212–2220 |
| `js/summary.js` | showSummary, showSeasonSummary, showGameReviewFromRecord, renderGoalsHtml, navigation, confirmClearData | 2522–2752, 4420–4515 |
| `js/lineup.js` | Lineup draft, GK picker, goalie wheel, launchGame | 3022–3609 |
| `js/game.js` | Timer, renderGame/Field/Grid, substitutions, goals, late arrival, half-time, endGame | 3610–4372 |
| `js/app.js` | Init, delegated listeners, service worker registration | 4551–4593 |

> **Note:** Line numbers are from PROJECT_MAP.md and may have shifted slightly. Use `Select-String` to locate functions precisely before moving them.

---

### Task 1: Enable ES module mode

**Files:**
- Modify: `index.html` (the `<script>` tag near line 2143)

- [x] **Step 1: Find the opening script tag**

```powershell
Select-String -Path .\index.html -Pattern "^<script>" -n
```

Expected: one match near line 2143.

- [x] **Step 2: Change `<script>` to `<script type="module">`**

Edit `index.html`: change the opening script tag from:
```html
<script>
```
to:
```html
<script type="module">
```

- [x] **Step 3: Start local server and verify app works**

```powershell
python3 -m http.server 8000
```

Open `http://localhost:8000` in browser. Check:
- Attendance screen loads with roster tiles
- No console errors (F12 → Console)
- Navigate to Team Setup, verify roster renders

ES modules require HTTP — `file://` will fail with CORS errors.

- [x] **Step 4: Commit**

```powershell
git add index.html
git commit -m "Enable ES module mode on index.html script block"
```

---

### Task 2: Extract js/state.js

**Files:**
- Create: `js/state.js`
- Modify: `index.html`

- [x] **Step 1: Create `js/` directory**

```powershell
mkdir js
```

- [x] **Step 2: Find the exact state variable declarations**

```powershell
Select-String -Path .\index.html -Pattern "^let roster|^let players|^let gameHistory|^let playerPhotos|^let subPlans|^let planningBenchId|^let planningPosition|^let selectedId|^let lineupDraft|^let goalie|^let totalElapsed|^let halfClock|^let timerBase|^let isRunning|^let scoreUs|^let scoreThem|^let goals|^let gameDate|^let opponentName|^let teamName|^let halfMinutes" -n
```

Note all line numbers and their initial values.

- [x] **Step 3: Find the POSITIONS and FIELD_SVG declarations**

```powershell
Select-String -Path .\index.html -Pattern "^const POSITIONS|^const POSITION_ORDER|^const FIELD_SVG" -n
```

Note their line numbers.

- [x] **Step 4: Create `js/state.js`**

Create `js/state.js`. The state object properties and their initial values must match exactly what you found in Step 2. The constant values (POSITIONS, POSITION_ORDER, FIELD_SVG) are copied verbatim from index.html.

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

// Copy the full POSITIONS object from index.html verbatim:
export const POSITIONS = { /* ... paste from index.html ... */ };

// Copy POSITION_ORDER array from index.html verbatim:
export const POSITION_ORDER = [ /* ... paste from index.html ... */ ];

// Copy FIELD_SVG template literal from index.html verbatim:
export const FIELD_SVG = `/* ... paste from index.html ... */`;
```

- [x] **Step 5: Add import at the top of index.html's script block**

Immediately after `<script type="module">`, add:

```js
import { state, POSITIONS, POSITION_ORDER, FIELD_SVG } from './js/state.js';
```

- [x] **Step 6: Remove the moved declarations from index.html**

Delete the `let roster = []`, `let players = []`, etc. declarations and the `const POSITIONS`, `const POSITION_ORDER`, `const FIELD_SVG` blocks from index.html's script block.

- [x] **Step 7: Find-replace bare state variable names with `state.` prefix**

Run each replacement in order. Use a text editor's find-replace with whole-word matching where possible. Variables to prefix:

```
roster         → state.roster
players        → state.players
gameHistory    → state.gameHistory
playerPhotos   → state.playerPhotos
subPlans       → state.subPlans
planningBenchId → state.planningBenchId
planningPosition → state.planningPosition
selectedId     → state.selectedId
lineupDraft    → state.lineupDraft
goalie1Id      → state.goalie1Id
goalie2Id      → state.goalie2Id
activeGoalieId → state.activeGoalieId
totalElapsed   → state.totalElapsed
halfClock      → state.halfClock
timerBase      → state.timerBase
isRunning      → state.isRunning
scoreUs        → state.scoreUs
scoreThem      → state.scoreThem
goals          → state.goals
gameDate       → state.gameDate
opponentName   → state.opponentName
teamName       → state.teamName
halfMinutes    → state.halfMinutes
```

**Do NOT replace** POSITIONS, POSITION_ORDER, FIELD_SVG — these are imported as named constants, not under `state.`.

- [x] **Step 8: Verify the app still works**

Open `http://localhost:8000`. Check:
- Attendance screen loads
- Team Setup screen loads with roster
- Start a game and verify the clock runs
- Check console for errors

- [x] **Step 9: Commit**

```powershell
git add js/state.js index.html
git commit -m "Extract state singleton and constants to js/state.js"
```

---

### Task 3: Extract js/utils.js

**Files:**
- Create: `js/utils.js`
- Modify: `index.html`

- [x] **Step 1: Find the utility functions in index.html**

```powershell
Select-String -Path .\index.html -Pattern "^function showScreen|^function openModal|^function closeModal|^function escHtml|^function applyTheme|^function toggleTheme" -n
```

Note line numbers. Read each function body using:
```powershell
$lines = Get-Content .\index.html; $lines[<start>..<end>]
```

- [x] **Step 2: Create `js/utils.js`**

Copy the six functions from index.html verbatim, adding `export` to each:

```js
import { state } from './state.js';

export function escHtml(str) {
  // paste verbatim from index.html
}

export function showScreen(id) {
  // paste verbatim from index.html
}

export function openModal(id) {
  // paste verbatim from index.html
}

export function closeModal(id) {
  // paste verbatim from index.html
}

export function applyTheme(theme) {
  // paste verbatim from index.html
}

export function toggleTheme() {
  // paste verbatim from index.html
}
```

Only add `import { state }` if any of these functions reference `state.*`. Check before adding.

- [x] **Step 3: Add import to index.html's script block**

After the existing import line(s), add:

```js
import { escHtml, showScreen, openModal, closeModal, applyTheme, toggleTheme } from './js/utils.js';
```

- [x] **Step 4: Remove the six functions from index.html's script block**

Delete the `function escHtml`, `function showScreen`, `function openModal`, `function closeModal`, `function applyTheme`, and `function toggleTheme` bodies from index.html.

- [x] **Step 5: Verify**

Open `http://localhost:8000`. Check:
- Theme toggle button works (dark/light switch)
- Modals open and close (e.g., trigger goal modal during a game)
- No console errors

- [x] **Step 6: Commit**

```powershell
git add js/utils.js index.html
git commit -m "Extract utilities and theme to js/utils.js"
```

---

### Task 4: Extract js/persistence.js

**Files:**
- Create: `js/persistence.js`
- Modify: `index.html`

- [ ] **Step 1: Find persistence functions in index.html**

```powershell
Select-String -Path .\index.html -Pattern "^function save|^function load|^function exportProfile|^function importProfile|^function importLeagueCsv|^function parseCsvRoster|^function importGameReview|^function buildProfile|^function buildGameRecord|^function checkForActiveGame" -n
```

- [ ] **Step 2: Create `js/persistence.js`**

Copy all matched functions verbatim, adding `export` to each. Add imports for their dependencies:

```js
import { state } from './state.js';
import { escHtml, showScreen, openModal } from './utils.js';

export function saveSettings() { /* paste verbatim */ }
export function loadSettings() { /* paste verbatim */ }
export function saveRoster() { /* paste verbatim */ }
export function loadRoster() { /* paste verbatim */ }
export function saveActiveGame() { /* paste verbatim */ }
export function checkForActiveGame() { /* paste verbatim */ }
export function saveGameHistory() { /* paste verbatim */ }
export function loadHistory() { /* paste verbatim */ }
export function buildProfile() { /* paste verbatim */ }
export function exportProfile() { /* paste verbatim */ }
export function importProfile(e) { /* paste verbatim */ }
export function importLeagueCsv(e) { /* paste verbatim */ }
export function parseCsvRoster(text) { /* paste verbatim */ }
export function importGameReview(e) { /* paste verbatim */ }
export function buildGameRecord() { /* paste verbatim */ }
```

If any of these call functions not yet extracted (e.g., `renderTeamSetupRoster`, `renderGameDayCheckboxes`), those calls remain valid — they'll be defined in index.html's script block until extracted in later tasks.

- [ ] **Step 3: Add import to index.html's script block**

```js
import { saveSettings, loadSettings, saveRoster, loadRoster, saveActiveGame,
  checkForActiveGame, saveGameHistory, loadHistory, buildProfile, exportProfile,
  importProfile, importLeagueCsv, parseCsvRoster, importGameReview,
  buildGameRecord } from './js/persistence.js';
```

- [ ] **Step 4: Remove moved functions from index.html**

- [ ] **Step 5: Verify**

Open `http://localhost:8000`. Check:
- Reload page — roster and team name persist (localStorage load works)
- Add a player, reload — player persists (save works)
- Export backup (Backup Team button) — file downloads correctly
- No console errors

- [ ] **Step 6: Commit**

```powershell
git add js/persistence.js index.html
git commit -m "Extract persistence, import/export, and CSV functions to js/persistence.js"
```

---

### Task 5: Extract js/roster.js

**Files:**
- Create: `js/roster.js`
- Modify: `index.html`

- [ ] **Step 1: Find roster and photo functions**

```powershell
Select-String -Path .\index.html -Pattern "^function render(TeamSetup|GameDay)|^function (add|remove|open)(Roster|Rename)|^function confirm(Rename|RemoveRoster)|^function togglePlayerTile|^function checkedPlayers|^function updateStartBtn|^function selectAll|^function loadPhotos|^function avatarHtml|^function avatarParts|^function triggerPhotoUpload|^function resizeAndStorePhoto" -n
```

Also find the half-duration stepper function:

```powershell
Select-String -Path .\index.html -Pattern "^function.*[Hh]alf[Mm]inutes|^function.*[Ss]tepper" -n
```

- [ ] **Step 2: Create `js/roster.js`**

```js
import { state } from './state.js';
import { escHtml, openModal, closeModal } from './utils.js';
import { saveRoster, saveSettings, saveActiveGame } from './persistence.js';

export function loadPhotos() { /* paste verbatim */ }
export function avatarHtml(id, cls) { /* paste verbatim */ }
export function avatarParts(id) { /* paste verbatim */ }
export function triggerPhotoUpload(id) { /* paste verbatim */ }
export function resizeAndStorePhoto(id, file) { /* paste verbatim */ }
export function renderTeamSetupRoster() { /* paste verbatim */ }
export function addRosterPlayer() { /* paste verbatim */ }
export function openRenameModal(id) { /* paste verbatim */ }
export function confirmRename() { /* paste verbatim */ }
export function removeRosterPlayer(id) { /* paste verbatim */ }
export function confirmRemoveRoster() { /* paste verbatim */ }
export function renderGameDayCheckboxes() { /* paste verbatim */ }
export function togglePlayerTile(id) { /* paste verbatim */ }
export function checkedPlayers() { /* paste verbatim */ }
export function updateStartBtn() { /* paste verbatim */ }
export function selectAllAttendance() { /* paste verbatim */ }
// include half-duration stepper function(s) found in Step 1
```

- [ ] **Step 3: Add import to index.html's script block**

```js
import { loadPhotos, avatarHtml, avatarParts, triggerPhotoUpload, resizeAndStorePhoto,
  renderTeamSetupRoster, addRosterPlayer, openRenameModal, confirmRename,
  removeRosterPlayer, confirmRemoveRoster, renderGameDayCheckboxes, togglePlayerTile,
  checkedPlayers, updateStartBtn, selectAllAttendance } from './js/roster.js';
```

Add the half-duration stepper function name(s) to this import.

- [ ] **Step 4: Remove moved functions from index.html**

- [ ] **Step 5: Verify**

Open `http://localhost:8000`. Check:
- Roster tiles render on attendance screen
- Check/uncheck player tiles works
- Team Setup: add player, rename player, remove player all work
- Player photos display correctly
- Half-minutes stepper increments/decrements
- No console errors

- [ ] **Step 6: Commit**

```powershell
git add js/roster.js index.html
git commit -m "Extract roster management, attendance, and photos to js/roster.js"
```

---

### Task 6: Extract js/summary.js

**Files:**
- Create: `js/summary.js`
- Modify: `index.html`

- [ ] **Step 1: Find summary, season, and navigation functions**

```powershell
Select-String -Path .\index.html -Pattern "^function show(Summary|SeasonSummary|GameReview)|^function renderGoals|^function goTo(Setup|SeasonSummary|Lineup)|^function goBack|^function confirmClearData|^function.*[Oo]verflow|^function.*[Nn]av" -n
```

Also check for any function in lines 2522–2752 (game review + season summary section):

```powershell
$lines = Get-Content .\index.html; $lines[2521..2751] | Select-String "^function "
```

- [ ] **Step 2: Create `js/summary.js`**

```js
import { state } from './state.js';
import { escHtml, showScreen, openModal, closeModal } from './utils.js';
import { saveGameHistory, exportProfile } from './persistence.js';

export function renderGoalsHtml(goals) { /* paste verbatim */ }
export function showSummary() { /* paste verbatim */ }
export function showSeasonSummary() { /* paste verbatim */ }
export function showGameReviewFromRecord(record) { /* paste verbatim */ }
export function goToSetup() { /* paste verbatim */ }
export function goToSeasonSummary() { /* paste verbatim */ }
export function confirmClearData() { /* paste verbatim */ }
// include any overflow menu / navigation functions found in Step 1
```

Note: `importGameReview` may have been extracted to `persistence.js` in Task 4. If so, omit it here.

- [ ] **Step 3: Add import to index.html's script block**

```js
import { renderGoalsHtml, showSummary, showSeasonSummary, showGameReviewFromRecord,
  goToSetup, goToSeasonSummary, confirmClearData } from './js/summary.js';
```

- [ ] **Step 4: Remove moved functions from index.html**

- [ ] **Step 5: Verify**

Open `http://localhost:8000`. Start and end a game. Check:
- Game summary screen renders correctly
- Season summary screen renders correctly
- Back navigation works (goToSetup)
- Clear data modal works
- No console errors

- [ ] **Step 6: Commit**

```powershell
git add js/summary.js index.html
git commit -m "Extract summary, season, and navigation functions to js/summary.js"
```

---

### Task 7: Extract js/lineup.js

**Files:**
- Create: `js/lineup.js`
- Modify: `index.html`

- [ ] **Step 1: Find lineup and goalie functions**

```powershell
Select-String -Path .\index.html -Pattern "^function (goTo|build|render|launch|update)(Lineup|LineupDraft|LineupField|LineupLaunch)|^function (show|open|confirm|spin|stop)(Gk|Goalie|Wheel)|^function lineupSlot|^function lineupPlayer|^function seasonFresh|^function initGame|^function confirmGoalies|^function launchGame|^function goBackToGameDay" -n
```

- [ ] **Step 2: Create `js/lineup.js`**

```js
import { state, POSITIONS, POSITION_ORDER, FIELD_SVG } from './state.js';
import { escHtml, showScreen, openModal, closeModal } from './utils.js';
import { saveSettings, saveActiveGame } from './persistence.js';
import { avatarHtml, checkedPlayers } from './roster.js';

export function goToLineup() { /* paste verbatim */ }
export function buildLineupDraft() { /* paste verbatim */ }
export function goBackToGameDay() { /* paste verbatim */ }
export function showGkPicker() { /* paste verbatim */ }
export function openGoaliePicker() { /* paste verbatim */ }
export function openGkSpin() { /* paste verbatim */ }
export function seasonFreshGoalieCandidates() { /* paste verbatim */ }
export function spinWheel() { /* paste verbatim */ }
export function stopWheel() { /* paste verbatim */ }
export function confirmGkFromSpin() { /* paste verbatim */ }
export function confirmGoalies() { /* paste verbatim */ }
export function renderLineup() { /* paste verbatim */ }
export function renderLineupField() { /* paste verbatim */ }
export function lineupSlotTap(pos) { /* paste verbatim */ }
export function lineupPlayerTap(id) { /* paste verbatim */ }
export function updateLineupLaunchBtn() { /* paste verbatim */ }
export function launchGame() { /* paste verbatim */ }
export function initGame() { /* paste verbatim */ }
```

- [ ] **Step 3: Add import to index.html's script block**

```js
import { goToLineup, buildLineupDraft, goBackToGameDay, showGkPicker, openGoaliePicker,
  openGkSpin, seasonFreshGoalieCandidates, spinWheel, stopWheel, confirmGkFromSpin,
  confirmGoalies, renderLineup, renderLineupField, lineupSlotTap, lineupPlayerTap,
  updateLineupLaunchBtn, launchGame, initGame } from './js/lineup.js';
```

- [ ] **Step 4: Remove moved functions from index.html**

- [ ] **Step 5: Verify**

Open `http://localhost:8000`. Check:
- "Start Game" flow: select players → lineup screen renders → assign positions → GK picker appears
- Goalie spin wheel animates and selects
- Launch game works (game screen appears)
- No console errors

- [ ] **Step 6: Commit**

```powershell
git add js/lineup.js index.html
git commit -m "Extract lineup, GK picker, and goalie wheel to js/lineup.js"
```

---

### Task 8: Extract js/game.js

**Files:**
- Create: `js/game.js`
- Modify: `index.html`

This is the largest extraction. Take it section by section.

- [ ] **Step 1: Find all game functions**

```powershell
Select-String -Path .\index.html -Pattern "^function (toggle|pause|resume|render|compute|get|handle|create|cancel|execute|make|move|open|confirm|prompt|start|end)(Pause|Game|Clock|Field|Grid|FairShare|Status|Tap|Plan|Sub|FieldPlayer|LateModal|LateArrival|RemovePlayer|HalfEnd|SecondHalf|Game$|GoalModal|Goal|TheirScore|Score)" -n
```

Also:
```powershell
Select-String -Path .\index.html -Pattern "^function (tick|setBenchSort|getHint|renderScore|recordGoal|endGame)" -n
```

- [ ] **Step 2: Create `js/game.js`**

```js
import { state, POSITIONS, POSITION_ORDER } from './state.js';
import { escHtml, showScreen, openModal, closeModal } from './utils.js';
import { saveActiveGame, saveGameHistory, buildGameRecord } from './persistence.js';
import { avatarHtml } from './roster.js';
import { showSummary } from './summary.js';

// Timer
export function togglePause() { /* paste verbatim */ }
export function pauseGame() { /* paste verbatim */ }
export function resumeGame() { /* paste verbatim */ }
export function tick() { /* paste verbatim */ }
export function renderClock() { /* paste verbatim */ }

// Game render
export function computeFairShare() { /* paste verbatim */ }
export function getStatus(player) { /* paste verbatim */ }
export function renderGame() { /* paste verbatim */ }
export function renderField() { /* paste verbatim */ }
export function renderGrid() { /* paste verbatim */ }
export function setBenchSort(mode) { /* paste verbatim */ }
export function getHint() { /* paste verbatim */ }

// Remove player
export function promptRemovePlayer(id) { /* paste verbatim */ }
export function confirmRemovePlayer() { /* paste verbatim */ }

// Substitutions
export function handleTap(e) { /* paste verbatim */ }
export function createPlan(benchId, pos) { /* paste verbatim */ }
export function cancelPlanForPos(pos) { /* paste verbatim */ }
export function executeAllPlans() { /* paste verbatim */ }
export function makeSub(inId, pos) { /* paste verbatim */ }
export function moveFieldPlayerToBench(id) { /* paste verbatim */ }

// Late arrival
export function openLateModal() { /* paste verbatim */ }
export function confirmLateArrival() { /* paste verbatim */ }

// Half time / end game
export function handleHalfEnd() { /* paste verbatim */ }
export function startSecondHalf() { /* paste verbatim */ }
export function endGame() { /* paste verbatim */ }

// Score / goals
export function openGoalModal() { /* paste verbatim */ }
export function recordGoal(scorerId) { /* paste verbatim */ }
export function confirmGoal() { /* paste verbatim */ }
export function confirmTheirScore() { /* paste verbatim */ }
export function renderScore() { /* paste verbatim */ }
```

- [ ] **Step 3: Add import to index.html's script block**

```js
import { togglePause, pauseGame, resumeGame, tick, renderClock, computeFairShare,
  getStatus, renderGame, renderField, renderGrid, setBenchSort, getHint,
  promptRemovePlayer, confirmRemovePlayer, handleTap, createPlan, cancelPlanForPos,
  executeAllPlans, makeSub, moveFieldPlayerToBench, openLateModal, confirmLateArrival,
  handleHalfEnd, startSecondHalf, endGame, openGoalModal, recordGoal, confirmGoal,
  confirmTheirScore, renderScore } from './js/game.js';
```

- [ ] **Step 4: Remove moved functions from index.html**

- [ ] **Step 5: Verify thoroughly**

Open `http://localhost:8000`. Run through a full game flow:
- Select players → start game
- Clock runs, pause/resume works
- Field renders with player cards
- Bench renders and sorts (Name / Time / Priority)
- Tap bench player + position slot → sub plan appears
- Execute substitution → players swap
- Record a goal — scorer appears in goal list
- Record opponent goal
- Open half-time modal → start second half
- End game → summary screen appears
- Check console for errors throughout

- [ ] **Step 6: Commit**

```powershell
git add js/game.js index.html
git commit -m "Extract timer, render, substitution, goals, and game flow to js/game.js"
```

---

### Task 9: Create js/app.js and finalize migration

**Files:**
- Create: `js/app.js`
- Modify: `index.html`
- Modify: `sw.js`
- Modify: `docs/superpowers/plans/2026-05-12-js-module-split.md` (not needed)
- Modify: `PROJECT_MAP.md`

At this point, `index.html`'s script block should contain only:
- The import statements added in Tasks 2–8
- The init block (lines ~4551–4566): insert SVGs, load theme/photos/settings/history/roster, resume active game, beforeunload handler
- The delegated listeners block (lines ~4567–4593): click handlers and service worker registration

- [ ] **Step 1: Verify what remains in index.html's script block**

```powershell
Select-String -Path .\index.html -Pattern "^function " -n
```

Expected: zero results. If any functions remain, they were missed in earlier tasks — extract them to the appropriate module before continuing.

- [ ] **Step 2: Create `js/app.js`**

Move the import statements, init block, and delegated listeners from index.html's script block into `js/app.js`:

```js
import { state, POSITIONS, POSITION_ORDER, FIELD_SVG } from './state.js';
import { applyTheme, showScreen, openModal, closeModal } from './utils.js';
import { loadSettings, loadRoster, saveActiveGame, checkForActiveGame } from './persistence.js';
import { loadPhotos, renderGameDayCheckboxes, renderTeamSetupRoster,
  togglePlayerTile, addRosterPlayer, openRenameModal, confirmRename,
  removeRosterPlayer, confirmRemoveRoster, triggerPhotoUpload,
  selectAllAttendance, updateStartBtn } from './roster.js';
import { goToLineup, lineupSlotTap, lineupPlayerTap, showGkPicker,
  openGkSpin, spinWheel, stopWheel, confirmGkFromSpin, confirmGoalies,
  launchGame, goBackToGameDay } from './lineup.js';
import { handleTap, executeAllPlans, togglePause, openGoalModal,
  confirmGoal, confirmTheirScore, promptRemovePlayer, confirmRemovePlayer,
  openLateModal, confirmLateArrival, handleHalfEnd, startSecondHalf,
  endGame, setBenchSort } from './game.js';
import { showSummary, showSeasonSummary, goToSetup,
  goToSeasonSummary, confirmClearData } from './summary.js';

// Paste the init block verbatim from index.html (insert SVGs, applyTheme, loadPhotos,
// loadSettings, loadRoster, loadHistory, checkForActiveGame, beforeunload handler)

// Paste the delegated listeners block verbatim from index.html
// (field-positions click, bench-grid click, service worker registration)
```

Adjust the import lists above to match the actual function names you extracted — add any missed functions.

- [ ] **Step 3: Replace index.html's script block**

Remove everything between `<script type="module">` and `</script>` and replace:

```html
<script type="module" src="js/app.js"></script>
```

- [ ] **Step 4: Bump service worker cache version**

In `sw.js` line 1, change:
```js
const CACHE = 'stm-v2';
```
to:
```js
const CACHE = 'stm-v3';
```

- [ ] **Step 5: Verify full app**

Open `http://localhost:8000`. Full smoke test:
- Page loads, roster and team name are restored from localStorage
- Attendance screen: tiles render, check/uncheck works, start button enables
- Team Setup: add/rename/remove player, backup/restore
- Full game flow: lineup → GK pick → game → subs → goals → half-time → end → summary
- Season summary renders
- Theme toggle works
- No console errors

- [ ] **Step 6: Update PROJECT_MAP.md**

Replace the JavaScript map section to reflect the new file structure. Add a new section:

```markdown
## JavaScript modules in js/

| File | Responsibility | Key exports |
|---|---|---|
| `js/state.js` | State singleton + constants | `state`, `POSITIONS`, `POSITION_ORDER`, `FIELD_SVG` |
| `js/utils.js` | DOM helpers + theme | `escHtml`, `showScreen`, `openModal`, `closeModal`, `applyTheme`, `toggleTheme` |
| `js/persistence.js` | localStorage + import/export | `save*`, `load*`, `exportProfile`, `importProfile`, `importLeagueCsv`, `buildGameRecord` |
| `js/roster.js` | Roster, attendance, photos | `renderTeamSetupRoster`, `renderGameDayCheckboxes`, `togglePlayerTile`, `avatarHtml` |
| `js/lineup.js` | Lineup, GK picker, goalie wheel | `goToLineup`, `renderLineup`, `launchGame`, `initGame`, `spinWheel` |
| `js/game.js` | Timer, render, subs, goals, game flow | `handleTap`, `renderGame`, `executeAllPlans`, `endGame`, `renderScore` |
| `js/summary.js` | Summary, season, navigation | `showSummary`, `showSeasonSummary`, `goToSetup`, `confirmClearData` |
| `js/app.js` | Entry point, init, delegated listeners | (no exports) |
```

Update the "Project files" section to list the `js/` directory and note that the JavaScript map section now refers to files in `js/` rather than line ranges in `index.html`.

Update the CSS map line numbers if they shifted during the JS extraction.

- [ ] **Step 7: Final commit**

```powershell
git add js/app.js index.html sw.js PROJECT_MAP.md
git commit -m "Complete JS module split: finalize app.js, bump sw cache to stm-v3, update PROJECT_MAP"
```

---

## Post-Migration Checklist

- [ ] All 8 JS files exist in `js/`
- [ ] `index.html` script block is a single `<script type="module" src="js/app.js">` tag
- [ ] `sw.js` reads `stm-v3`
- [ ] `PROJECT_MAP.md` reflects the new structure
- [ ] Full game flow works in browser
- [ ] No console errors
- [ ] Git log shows 9 clean commits (one per task)
