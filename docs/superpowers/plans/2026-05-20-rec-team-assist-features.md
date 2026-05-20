# Rec Team Assist Features — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three gameplay assists for rec team coaches: a configurable minimum play time floor with at-risk highlighting, a per-player bench streak timer, and a one-tap undo for the last recorded goal.

**Architecture:** All changes follow the existing no-build ES-module pattern — state mutations in `state.js`, persistence in `persistence.js`, domain logic in `game.js`/`roster.js`, wiring in `app.js`. No new files are created. Each feature is self-contained; tasks can be reviewed independently.

**Tech Stack:** Vanilla JS ES modules, localStorage, CSS custom properties, Playwright (smoke tests only)

---

## File map

| File | What changes |
|---|---|
| `js/state.js` | Add `minPlayMinutes: 0` |
| `js/persistence.js` | `saveSettings` / `loadSettings` / `applySettingsToUi` include `minPlayMinutes` |
| `js/roster.js` | Add and export `changeMinPlayMinutes(delta)` |
| `js/game.js` | Add `isMinPlayAtRisk`, `undoLastGoal`; update `renderGrid`, `renderScore`, `makeSub`, `executeAllPlans`, `moveFieldPlayerToBench`, `startSecondHalf`, `confirmLateArrival` |
| `js/lineup.js` | Set `benchSince` in `startGameDirect` |
| `js/app.js` | Import + wire `changeMinPlayMinutes`, `undoLastGoal`; add button listeners |
| `index.html` | Min-play control row (setup screen), undo button (game screen score bar) |
| `css/styles.css` | `.at-risk`, `.bench-streak`, `.score-undo-btn` |
| `CLAUDE.md` | Rec team context, new state vars, new functions |
| `PROJECT_MAP.md` | New state vars, new functions in bug-target table |
| `README.md` | Feature list update |

---

## Task 1 — Add `minPlayMinutes` to state and persistence

**Files:**
- Modify: `js/state.js`
- Modify: `js/persistence.js`

- [ ] **Step 1: Confirm smoke tests pass (baseline)**

```powershell
npm.cmd test
```
Expected: all tests pass.

- [ ] **Step 2: Add `minPlayMinutes` to the state singleton**

In `js/state.js`, add after `halfMinutes: 25,` (line 16):

```js
  halfMinutes: 25,
  minPlayMinutes: 0,
```

- [ ] **Step 3: Persist `minPlayMinutes` in `saveSettings`**

In `js/persistence.js`, replace the `saveSettings` function body:

Old:
```js
export function saveSettings() {
  localStorage.setItem('soccerSettings', JSON.stringify({
    teamName: state.teamName,
    halfMinutes: state.halfMinutes
  }));
}
```

New:
```js
export function saveSettings() {
  localStorage.setItem('soccerSettings', JSON.stringify({
    teamName: state.teamName,
    halfMinutes: state.halfMinutes,
    minPlayMinutes: state.minPlayMinutes,
  }));
}
```

- [ ] **Step 4: Load `minPlayMinutes` in `loadSettings`**

In `js/persistence.js`, inside `loadSettings`, after `if (s.halfMinutes) state.halfMinutes = s.halfMinutes;`:

Old:
```js
      if (s.teamName)    state.teamName    = s.teamName;
      if (s.halfMinutes) state.halfMinutes = s.halfMinutes;
```

New:
```js
      if (s.teamName)              state.teamName       = s.teamName;
      if (s.halfMinutes)           state.halfMinutes    = s.halfMinutes;
      if (s.minPlayMinutes != null) state.minPlayMinutes = s.minPlayMinutes;
```

- [ ] **Step 5: Update `applySettingsToUi` to reflect `minPlayMinutes`**

In `js/persistence.js`, replace `applySettingsToUi`:

Old:
```js
export function applySettingsToUi() {
  document.getElementById('team-name-input').value = state.teamName;
  document.getElementById('app-title-name').textContent = state.teamName;
  document.getElementById('half-minutes-display').textContent = `${state.halfMinutes} min`;
}
```

New:
```js
export function applySettingsToUi() {
  document.getElementById('team-name-input').value = state.teamName;
  document.getElementById('app-title-name').textContent = state.teamName;
  document.getElementById('half-minutes-display').textContent = `${state.halfMinutes} min`;
  const minPlayEl = document.getElementById('min-play-display');
  if (minPlayEl) minPlayEl.textContent = state.minPlayMinutes === 0 ? 'off' : `${state.minPlayMinutes} min`;
}
```

- [ ] **Step 6: Run smoke tests**

```powershell
npm.cmd test
```
Expected: all tests pass.

- [ ] **Step 7: Commit**

```powershell
git add js/state.js js/persistence.js
git commit -m "feat: add minPlayMinutes to state and persistence"
```

---

## Task 2 — Add HTML for min-play control and undo button

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the min-play control row to the setup screen**

In `index.html`, after the closing `</div>` of the `.half-duration-row` block (the block ending around line 74), add a new row:

Old (end of half-duration-row block):
```html
      <div class="half-duration-row">
        <span class="half-duration-label">Minutes per half</span>
        <div class="half-duration-controls">
          <button class="btn-stepper" id="half-minus-btn">&#8722;</button>
          <span class="half-duration-value" id="half-minutes-display">25 min</span>
          <button class="btn-stepper" id="half-plus-btn">+</button>
        </div>
      </div>

      <button class="btn btn-green btn-full" id="start-btn" disabled>
```

New:
```html
      <div class="half-duration-row">
        <span class="half-duration-label">Minutes per half</span>
        <div class="half-duration-controls">
          <button class="btn-stepper" id="half-minus-btn">&#8722;</button>
          <span class="half-duration-value" id="half-minutes-display">25 min</span>
          <button class="btn-stepper" id="half-plus-btn">+</button>
        </div>
      </div>

      <div class="half-duration-row">
        <span class="half-duration-label">Min play</span>
        <div class="half-duration-controls">
          <button class="btn-stepper" id="min-play-minus-btn">&#8722;</button>
          <span class="half-duration-value" id="min-play-display">off</span>
          <button class="btn-stepper" id="min-play-plus-btn">+</button>
        </div>
      </div>

      <button class="btn btn-green btn-full" id="start-btn" disabled>
```

- [ ] **Step 2: Add the undo goal button to the game screen score bar**

In `index.html`, after the goal button in the score bar:

Old:
```html
      <button id="goal-btn" class="score-goal-btn" disabled>+ Goal</button>
    </div>
```

New:
```html
      <button id="goal-btn" class="score-goal-btn" disabled>+ Goal</button>
      <button id="undo-goal-btn" class="score-undo-btn" style="display:none;">&#8617; Undo</button>
    </div>
```

- [ ] **Step 3: Open the app in a browser and verify the min-play control row appears below "Minutes per half" on the setup screen**

Open `index.html` via `http://localhost:8000` (run `python3 -m http.server 8000` if not already running). Navigate to a game day with a roster configured. Confirm the "Min play" row with +/- buttons and "off" is visible below "Minutes per half". The undo button won't be visible yet (hidden by inline style).

- [ ] **Step 4: Commit**

```powershell
git add index.html
git commit -m "feat: add min-play control row and undo goal button to HTML"
```

---

## Task 3 — CSS for new UI elements

**Files:**
- Modify: `css/styles.css`

- [ ] **Step 1: Add `.at-risk` bench card style**

In `css/styles.css`, after the `.s-red` rule (around line 876):

Old:
```css
    .s-green  { background: var(--status-green-bg);  border-color: #2e7d32; }
    .s-yellow { background: var(--status-yellow-bg); border-color: #f57c00; }
    .s-red    { background: var(--status-red-bg);    border-color: #c62828; }
```

New:
```css
    .s-green  { background: var(--status-green-bg);  border-color: #2e7d32; }
    .s-yellow { background: var(--status-yellow-bg); border-color: #f57c00; }
    .s-red    { background: var(--status-red-bg);    border-color: #c62828; }
    .player-card.at-risk { border-left: 4px solid #ff8f00 !important; }
```

- [ ] **Step 2: Add `.bench-streak` style**

In `css/styles.css`, after the `.p-sublabel` rule (around line 934), add:

Old:
```css
    .p-sublabel {
      font-size: 0.52rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-card-label);
    }
```

New:
```css
    .p-sublabel {
      font-size: 0.52rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-card-label);
    }

    .bench-streak {
      font-size: 0.68rem;
      color: var(--text-muted);
      margin-top: 1px;
      font-variant-numeric: tabular-nums;
    }
```

- [ ] **Step 3: Add `.score-undo-btn` style**

In `css/styles.css`, after the `.score-goal-btn:active` rule (around line 700):

Old:
```css
    .score-goal-btn:active { opacity: 0.8; }
```

New:
```css
    .score-goal-btn:active { opacity: 0.8; }

    .score-undo-btn {
      background: #455a64;
      border: 1px solid #607d8b;
      color: #fff;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 5px 10px;
      cursor: pointer;
      white-space: nowrap;
      margin-left: 4px;
    }
    .score-undo-btn:active { opacity: 0.8; }
```

- [ ] **Step 4: Run smoke tests**

```powershell
npm.cmd test
```
Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add css/styles.css
git commit -m "feat: add at-risk, bench-streak, and score-undo-btn CSS"
```

---

## Task 4 — `changeMinPlayMinutes` function and wiring

**Files:**
- Modify: `js/roster.js`
- Modify: `js/app.js`

- [ ] **Step 1: Add `changeMinPlayMinutes` to `js/roster.js`**

In `js/roster.js`, after the `changeHalfMinutes` function (after line 12):

Old:
```js
export function changeHalfMinutes(delta) {
  state.halfMinutes = Math.max(1, state.halfMinutes + delta);
  document.getElementById('half-minutes-display').textContent = `${state.halfMinutes} min`;
  saveSettings();
}
```

New:
```js
export function changeHalfMinutes(delta) {
  state.halfMinutes = Math.max(1, state.halfMinutes + delta);
  document.getElementById('half-minutes-display').textContent = `${state.halfMinutes} min`;
  saveSettings();
}

export function changeMinPlayMinutes(delta) {
  let val = state.minPlayMinutes + delta;
  if (val > 45) val = 0;
  if (val < 0) val = 0;
  state.minPlayMinutes = val;
  const label = state.minPlayMinutes === 0 ? 'off' : `${state.minPlayMinutes} min`;
  document.getElementById('min-play-display').textContent = label;
  saveSettings();
}
```

- [ ] **Step 2: Export `changeMinPlayMinutes` from `js/app.js` imports**

In `js/app.js`, update the roster.js import block to include `changeMinPlayMinutes`:

Old:
```js
import {
  addRosterPlayer,
  changeHalfMinutes,
  checkAllPlayers,
```

New:
```js
import {
  addRosterPlayer,
  changeHalfMinutes,
  changeMinPlayMinutes,
  checkAllPlayers,
```

- [ ] **Step 3: Wire the min-play buttons in `js/app.js`**

In `js/app.js`, after the half-minutes button listeners (around lines 181–182):

Old:
```js
document.getElementById('half-minus-btn').addEventListener('click', () => changeHalfMinutes(-1));
document.getElementById('half-plus-btn').addEventListener('click', () => changeHalfMinutes(1));
```

New:
```js
document.getElementById('half-minus-btn').addEventListener('click', () => changeHalfMinutes(-1));
document.getElementById('half-plus-btn').addEventListener('click', () => changeHalfMinutes(1));
document.getElementById('min-play-minus-btn').addEventListener('click', () => changeMinPlayMinutes(-5));
document.getElementById('min-play-plus-btn').addEventListener('click', () => changeMinPlayMinutes(5));
```

- [ ] **Step 4: Verify in browser**

Open the setup screen. Click the `+` on Min play: display cycles `off → 5 min → 10 min … → 45 min → off`. Click `−` at `off` stays at `off`. Reload the page — the value is preserved (persisted to localStorage).

- [ ] **Step 5: Run smoke tests**

```powershell
npm.cmd test
```
Expected: all tests pass.

- [ ] **Step 6: Commit**

```powershell
git add js/roster.js js/app.js
git commit -m "feat: add changeMinPlayMinutes and wire setup screen controls"
```

---

## Task 5 — `isMinPlayAtRisk` logic and at-risk bench card rendering

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Add `isMinPlayAtRisk` as a module-level function in `js/game.js`**

Add this function after the `getStatus` function (around line 113 — after the closing `}` of `getStatus`):

```js
function isMinPlayAtRisk(player) {
  if (!state.minPlayMinutes || player.onField) return false;
  const remainingSecs = (state.halfMinutes * 60 * 2) - state.totalElapsed;
  const neededSecs = (state.minPlayMinutes * 60) - player.totalPlayed;
  return neededSecs > remainingSecs;
}
```

- [ ] **Step 2: Apply `at-risk` class and ⚠ icon in `renderGrid`**

In `js/game.js`, inside `renderGrid`, update the section that builds `benchStreakHtml` and sets `card.className`. Replace the existing `card.className` assignment:

Old:
```js
    const card = document.createElement('div');
    card.className = `player-card ${status}${selected}${planClass}`;
    card.dataset.playerId = String(player.id);
```

New:
```js
    const atRisk = isMinPlayAtRisk(player);
    const card = document.createElement('div');
    card.className = `player-card ${status}${selected}${planClass}${atRisk ? ' at-risk' : ''}`;
    card.dataset.playerId = String(player.id);
```

- [ ] **Step 3: Verify in browser**

Set Min play to 10 min on the setup screen. Start a game. Let it run for a few seconds. At-risk bench cards should show the amber left border (visible once a player has been on the bench long enough that the required time can't be met). With a fresh game and all players needing 10 min of play and 50 min total game time, no cards should be at-risk initially.

To force at-risk for testing: set Min play to 45 min, half to 1 min — bench players with 0 time played will be immediately at-risk (they need 2700s but only ~120s remain).

- [ ] **Step 4: Run smoke tests**

```powershell
npm.cmd test
```
Expected: all tests pass.

- [ ] **Step 5: Commit**

```powershell
git add js/game.js
git commit -m "feat: add isMinPlayAtRisk and at-risk bench card highlighting"
```

---

## Task 6 — `benchSince` initialization at game start and late arrival

**Files:**
- Modify: `js/lineup.js`
- Modify: `js/game.js`

- [ ] **Step 1: Set `benchSince` in `startGameDirect` in `js/lineup.js`**

In `js/lineup.js`, inside the `startGameDirect` function, add `benchSince` to the player object map:

Old:
```js
function startGameDirect() {
  state.players = state.lineupDraft.map(p => ({
    id: p.id,
    name: p.name,
    onField: p.onField,
    totalPlayed: 0,
    subInAt: p.onField ? 0 : null,
    h1Snapshot: null,
    position: p.position || null,
    positionTime: {},
    positionStart: (p.onField && p.position) ? 0 : null,
  }));
```

New:
```js
function startGameDirect() {
  state.players = state.lineupDraft.map(p => ({
    id: p.id,
    name: p.name,
    onField: p.onField,
    totalPlayed: 0,
    subInAt: p.onField ? 0 : null,
    h1Snapshot: null,
    position: p.position || null,
    positionTime: {},
    positionStart: (p.onField && p.position) ? 0 : null,
    benchSince: p.onField ? null : 0,
  }));
```

- [ ] **Step 2: Set `benchSince` in `confirmLateArrival` in `js/game.js`**

In `js/game.js`, inside `confirmLateArrival`, add `benchSince` to the pushed player object:

Old:
```js
  state.players.push({
    id:            rosterPlayer.id,
    name:          rosterPlayer.name,
    onField:       false,
    totalPlayed:   0,
    subInAt:       null,
    h1Snapshot:    state.currentHalf === 2 ? 0 : null,
    position:      null,
    positionTime:  {},
    positionStart: null,
  });
```

New:
```js
  state.players.push({
    id:            rosterPlayer.id,
    name:          rosterPlayer.name,
    onField:       false,
    totalPlayed:   0,
    subInAt:       null,
    h1Snapshot:    state.currentHalf === 2 ? 0 : null,
    position:      null,
    positionTime:  {},
    positionStart: null,
    benchSince:    state.totalElapsed,
  });
```

- [ ] **Step 3: Run smoke tests**

```powershell
npm.cmd test
```
Expected: all tests pass.

- [ ] **Step 4: Commit**

```powershell
git add js/lineup.js js/game.js
git commit -m "feat: set benchSince at game start and late arrival"
```

---

## Task 7 — `benchSince` tracking through substitutions and half-time

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Set/clear `benchSince` in `makeSub`**

In `js/game.js`, inside `makeSub`, add `benchSince` assignments. The existing structure after the `if (!out || !inn) return;` check:

Old:
```js
  commitPositionTime(out);
  if (out.subInAt !== null) {
    out.totalPlayed += state.totalElapsed - out.subInAt;
  }

  const outPosition = out.position;
  out.onField  = false;
  out.subInAt  = null;
  out.position = null;

  inn.onField  = true;
  inn.subInAt  = state.totalElapsed;
  inn.position = outPosition;
  startPositionTimer(inn);
```

New:
```js
  commitPositionTime(out);
  if (out.subInAt !== null) {
    out.totalPlayed += state.totalElapsed - out.subInAt;
  }

  const outPosition = out.position;
  out.onField    = false;
  out.subInAt    = null;
  out.position   = null;
  out.benchSince = state.totalElapsed;

  inn.onField    = true;
  inn.subInAt    = state.totalElapsed;
  inn.position   = outPosition;
  inn.benchSince = null;
  startPositionTimer(inn);
```

- [ ] **Step 2: Set/clear `benchSince` in `executeAllPlans`**

In `js/game.js`, inside `executeAllPlans`, update the outgoing and incoming player blocks:

Old:
```js
    if (out) {
      commitPositionTime(out);
      if (out.subInAt !== null) {
        out.totalPlayed += state.totalElapsed - out.subInAt;
      }
      out.onField  = false;
      out.subInAt  = null;
      out.position = null;
    }

    inn.onField  = true;
    inn.subInAt  = state.totalElapsed;
    inn.position = pos;
    startPositionTimer(inn);
```

New:
```js
    if (out) {
      commitPositionTime(out);
      if (out.subInAt !== null) {
        out.totalPlayed += state.totalElapsed - out.subInAt;
      }
      out.onField    = false;
      out.subInAt    = null;
      out.position   = null;
      out.benchSince = state.totalElapsed;
    }

    inn.onField    = true;
    inn.subInAt    = state.totalElapsed;
    inn.position   = pos;
    inn.benchSince = null;
    startPositionTimer(inn);
```

- [ ] **Step 3: Set `benchSince` in `moveFieldPlayerToBench`**

In `js/game.js`, inside `moveFieldPlayerToBench`, add `benchSince` when the player is benched:

Old:
```js
  player.onField   = false;
  player.subInAt   = null;
  player.position  = null;
  state.subPlans = state.subPlans.filter(pl => pl.inId !== id && pl.pos !== vacatedPos);
```

New:
```js
  player.onField    = false;
  player.subInAt    = null;
  player.position   = null;
  player.benchSince = state.totalElapsed;
  state.subPlans = state.subPlans.filter(pl => pl.inId !== id && pl.pos !== vacatedPos);
```

- [ ] **Step 4: Set/clear `benchSince` in `startSecondHalf`**

In `js/game.js`, inside `startSecondHalf`, the `state.players.forEach` loop that benches everyone needs to set `benchSince`, and the goalie being placed back on field needs it cleared.

Old:
```js
  state.players.forEach(p => {
    if (p.onField && p.subInAt !== null) {
      p.totalPlayed += state.totalElapsed - p.subInAt;
    }
    p.h1Snapshot    = p.totalPlayed;
    p.onField       = false;
    p.subInAt       = null;
    p.position      = null;
    p.positionStart = null;
  });

  const secondHalfGoalie = state.players.find(p => p.id === secondHalfGoalieId);
  if (secondHalfGoalie) {
    secondHalfGoalie.onField  = true;
    secondHalfGoalie.subInAt  = state.totalElapsed;
    secondHalfGoalie.position = 'GK';
  }
```

New:
```js
  state.players.forEach(p => {
    if (p.onField && p.subInAt !== null) {
      p.totalPlayed += state.totalElapsed - p.subInAt;
    }
    p.h1Snapshot    = p.totalPlayed;
    p.onField       = false;
    p.subInAt       = null;
    p.position      = null;
    p.positionStart = null;
    p.benchSince    = state.totalElapsed;
  });

  const secondHalfGoalie = state.players.find(p => p.id === secondHalfGoalieId);
  if (secondHalfGoalie) {
    secondHalfGoalie.onField    = true;
    secondHalfGoalie.subInAt    = state.totalElapsed;
    secondHalfGoalie.position   = 'GK';
    secondHalfGoalie.benchSince = null;
  }
```

- [ ] **Step 5: Run smoke tests**

```powershell
npm.cmd test
```
Expected: all tests pass.

- [ ] **Step 6: Commit**

```powershell
git add js/game.js
git commit -m "feat: track benchSince through subs, drag-bench, and half-time"
```

---

## Task 8 — Bench streak display in `renderGrid`

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Add bench streak HTML to bench cards in `renderGrid`**

In `js/game.js`, inside `renderGrid`, add bench streak computation and insert it into the card HTML.

Old (the `card.innerHTML` assignment):
```js
    card.innerHTML = `
      <div class="p-avatar" style="${avatarBg}">${avatarContent}</div>
      <div class="p-info">
        <div class="p-name">${escHtml(player.name)}</div>
        <div class="p-time">${fmt(time)}</div>
        <div class="p-sublabel">${sublabel}</div>
      </div>
      <button class="btn-remove-player" title="Remove from game">&#10005;</button>
    `;
```

New:
```js
    const benchStreakHtml = player.benchSince != null
      ? `<div class="bench-streak">${atRisk ? '&#9888; ' : ''}&#9203; ${fmt(state.totalElapsed - player.benchSince)}</div>`
      : '';
    card.innerHTML = `
      <div class="p-avatar" style="${avatarBg}">${avatarContent}</div>
      <div class="p-info">
        <div class="p-name">${escHtml(player.name)}</div>
        <div class="p-time">${fmt(time)}</div>
        ${benchStreakHtml}
        <div class="p-sublabel">${sublabel}</div>
      </div>
      <button class="btn-remove-player" title="Remove from game">&#10005;</button>
    `;
```

Note: `&#9888;` is ⚠ (U+26A0), `&#9203;` is ⏳ (U+23F3).

- [ ] **Step 2: Verify in browser**

Start a game with a bench player. After a few seconds, bench cards should show `⏳ 0:05` (or however many seconds). After a sub, the newly benched player resets to `⏳ 0:00` while the incoming player's bench streak disappears. Set Min play to 45 min with 1-min halves to force at-risk — bench cards should show `⚠ ⏳ X:XX` with amber left border.

- [ ] **Step 3: Run smoke tests**

```powershell
npm.cmd test
```
Expected: all tests pass.

- [ ] **Step 4: Commit**

```powershell
git add js/game.js
git commit -m "feat: show bench streak timer and at-risk indicator on bench cards"
```

---

## Task 9 — `undoLastGoal`, `renderScore` update, and wiring

**Files:**
- Modify: `js/game.js`
- Modify: `js/app.js`

- [ ] **Step 1: Add `undoLastGoal` to `js/game.js`**

In `js/game.js`, add this function after `renderScore` (after line 804):

```js
export function undoLastGoal() {
  if (!state.goals.length) return;
  const last = state.goals.pop();
  if (last.team === 'us') state.scoreUs = Math.max(0, state.scoreUs - 1);
  else state.scoreThem = Math.max(0, state.scoreThem - 1);
  renderScore();
  saveActiveGame();
}
```

- [ ] **Step 2: Update `renderScore` to show/hide the undo button**

In `js/game.js`, replace `renderScore`:

Old:
```js
export function renderScore() {
  document.getElementById('score-us').textContent   = state.scoreUs;
  document.getElementById('score-them').textContent = state.scoreThem;
}
```

New:
```js
export function renderScore() {
  document.getElementById('score-us').textContent   = state.scoreUs;
  document.getElementById('score-them').textContent = state.scoreThem;
  const undoBtn = document.getElementById('undo-goal-btn');
  if (undoBtn) undoBtn.style.display = state.goals.length ? '' : 'none';
}
```

- [ ] **Step 3: Import `undoLastGoal` in `js/app.js`**

In `js/app.js`, update the game.js import block to include `undoLastGoal`. The full `game.js` import currently ends with `togglePause` and `updateGoalBtn`. Add `undoLastGoal` before `updateGoalBtn`:

Old (last two lines of game.js import):
```js
  togglePause,
  updateGoalBtn
} from './game.js';
```

New:
```js
  togglePause,
  undoLastGoal,
  updateGoalBtn
} from './game.js';
```

- [ ] **Step 4: Wire the undo button in `js/app.js`**

In `js/app.js`, after the goal-btn listener (around line 197):

Old:
```js
document.getElementById('goal-btn').addEventListener('click', openGoalModal);
```

New:
```js
document.getElementById('goal-btn').addEventListener('click', openGoalModal);
document.getElementById('undo-goal-btn').addEventListener('click', undoLastGoal);
```

- [ ] **Step 5: Verify in browser**

Start a game. Record a goal (our team). The "↩ Undo" button appears in the score bar. Click it — score decrements and button hides. Record an opponent goal — undo button appears and reverts it. With zero goals recorded, button stays hidden.

- [ ] **Step 6: Verify resumed game preserves goals for undo**

Start a game, record a goal, reload the page, resume the interrupted game. The undo button should be visible (goals restored from `saveActiveGame`).

- [ ] **Step 7: Run smoke tests**

```powershell
npm.cmd test
```
Expected: all tests pass.

- [ ] **Step 8: Commit**

```powershell
git add js/game.js js/app.js
git commit -m "feat: add undoLastGoal and wire undo button in score bar"
```

---

## Task 10 — Docs update

**Files:**
- Modify: `CLAUDE.md`
- Modify: `PROJECT_MAP.md`
- Modify: `README.md`

- [ ] **Step 1: Update `CLAUDE.md` — app summary and rec team context**

At the top of the `## App summary` section, add context after the first sentence:

Old:
```
A no-build, single-file PWA for managing youth soccer player rotations during live games. It tracks playing time, position time, substitutions, goalies, goals, game summaries, season stats, roster data, and photos.
```

New:
```
A no-build, single-file PWA for managing youth soccer player rotations during live games. Built specifically for recreational youth soccer teams where equal playing time and sideline-friendly tooling matter most. It tracks playing time, position time, substitutions, goalies, goals, game summaries, season stats, roster data, and photos.
```

- [ ] **Step 2: Update `CLAUDE.md` — new state variables**

In the `## Key state` section, add after `state.halfMinutes`:

Old:
```
state.halfMinutes
```

New:
```
state.halfMinutes
state.minPlayMinutes  // configurable minimum play seconds target (0 = off); persisted in soccerSettings
```

And note that each player object in `state.players` has a new field — add after `state.players`:
```
// Each player in state.players also carries:
//   benchSince: totalElapsed value when player was last benched (null when on field)
```

- [ ] **Step 3: Update `CLAUDE.md` — new functions**

In the `## Important function clusters` section, add to the Goals/score line:

Old:
```
- Goals/score: `openGoalModal`, `recordGoal`, `confirmGoal`, `confirmTheirScore`, `renderScore`
```

New:
```
- Goals/score: `openGoalModal`, `recordGoal`, `confirmGoal`, `confirmTheirScore`, `renderScore`, `undoLastGoal`
- Min play / bench assist: `changeMinPlayMinutes`, `isMinPlayAtRisk`
```

- [ ] **Step 4: Update `PROJECT_MAP.md` — state variables section**

In the `## State variables to understand before editing logic` section, add after the `halfMinutes`/`teamName` entry:

```
- `minPlayMinutes` - per-game minimum play time target in minutes (0 = off); persisted in settings.
- `benchSince` (per-player) - `totalElapsed` value when the player was last benched; `null` when on field. Used to compute bench streak display.
```

- [ ] **Step 5: Update `PROJECT_MAP.md` — Common bug targets table**

Add a new row to the Common bug targets table:

```
| Min play floor / bench streak | `isMinPlayAtRisk`, `changeMinPlayMinutes`, `benchSince`, `renderGrid`, `min-play-display` |
| Undo last goal | `undoLastGoal`, `renderScore`, `undo-goal-btn`, `state.goals` |
```

- [ ] **Step 6: Update `README.md` — feature list**

Add the three new features to the feature list in `README.md`. The exact location depends on the current README structure; add them near the substitution/playing time section:

```markdown
- **Minimum play time floor** — Set a per-game minimum minutes target; bench cards with at-risk players (not enough time remaining to meet the floor) are highlighted with an amber border and ⚠ indicator.
- **Bench streak timer** — Each bench card shows how long that player has been sitting in their current stint (⏳ X:XX), so you can prioritize who goes in next.
- **Undo last goal** — A single tap reverses the most recently recorded goal (ours or theirs) without leaving the game screen.
```

- [ ] **Step 7: Run smoke tests one final time**

```powershell
npm.cmd test
```
Expected: all tests pass.

- [ ] **Step 8: Commit**

```powershell
git add CLAUDE.md PROJECT_MAP.md README.md
git commit -m "docs: add rec team context and document new assist features"
```
