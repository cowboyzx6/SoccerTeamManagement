# Gameday Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a date picker and game-number display to the gameday screen, replace the three occasional-use header buttons with a `⋯` overflow menu, and make the game-info row responsive (single row on tablet, two rows on phone).

**Architecture:** All changes are in `index.html` (single-file app). Three distinct areas: (1) a new `gameDate` global variable wired into game persistence; (2) a `⋯` dropdown replacing the header button cluster; (3) a new `.game-info-row` flex container housing Game #, date picker, and opponent input with CSS-only responsive behaviour via a 600px media query.

**Tech Stack:** Vanilla JavaScript, CSS flexbox, native `<input type="date">`, localStorage.

---

### Task 1: Add `gameDate` global and wire into persistence

**Files:**
- Modify: `index.html` (STATE ~line 2050, `buildGameRecord` ~line 2168, `saveActiveGame` ~line 2117, `checkForActiveGame` ~line 2132, `goToSetup` ~line 4132)

- [ ] **Step 1: Add `gameDate` global variable**

In the STATE section, find:
```js
let opponentName      = '';
```
Add immediately after:
```js
let gameDate          = '';          // YYYY-MM-DD; set on gameday screen
```

- [ ] **Step 2: Update `buildGameRecord()` to use `gameDate`**

Find `buildGameRecord()` (~line 2168). Change:
```js
date:       new Date().toISOString().slice(0, 10),
```
to:
```js
date:       gameDate || new Date().toISOString().slice(0, 10),
```

- [ ] **Step 3: Add `gameDate` to `saveActiveGame()`**

Find `saveActiveGame()` (~line 2117). Change:
```js
localStorage.setItem('soccerActiveGame', JSON.stringify({
  players, totalElapsed, halfClock, currentHalf, halfActionIsEnd,
  goalie1Id, goalie2Id, activeGoalieId,
  opponentName, scoreUs, scoreThem, goals,
  halfMinutes, subPlans, planningBenchId, planningPosition
}));
```
to:
```js
localStorage.setItem('soccerActiveGame', JSON.stringify({
  players, totalElapsed, halfClock, currentHalf, halfActionIsEnd,
  goalie1Id, goalie2Id, activeGoalieId,
  opponentName, scoreUs, scoreThem, goals,
  halfMinutes, subPlans, planningBenchId, planningPosition,
  gameDate
}));
```

- [ ] **Step 4: Restore `gameDate` in `checkForActiveGame()`**

Find `checkForActiveGame()` (~line 2132). After:
```js
planningPosition = state.planningPosition ?? null;
```
Add:
```js
gameDate         = state.gameDate        || new Date().toISOString().slice(0, 10);
```

- [ ] **Step 5: Reset `gameDate` in `goToSetup()`**

Find `goToSetup()` (~line 4132):
```js
function goToSetup() {
  clearActiveGame();
  showScreen('setup-screen');
  renderGameDayCheckboxes();
}
```
Change to:
```js
function goToSetup() {
  clearActiveGame();
  gameDate = '';
  showScreen('setup-screen');
  renderGameDayCheckboxes();
}
```

- [ ] **Step 6: Verify in browser console**

Open `index.html`. In DevTools console run:
```js
gameDate
```
Expected: `""` (empty string on fresh load, no errors)

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "Add gameDate global variable for game date tracking"
```

---

### Task 2: Replace header buttons with ⋯ overflow menu

**Files:**
- Modify: `index.html` (CSS ~line 202, HTML header ~line 1545, JS `renderGameDayCheckboxes` ~line 2662, new JS functions)

- [ ] **Step 1: Add CSS for overflow menu**

In the `<style>` block, find:
```css
.text-input:focus { border-color: var(--accent); }
```
Add after it:
```css
.overflow-menu-item {
  display: block;
  width: 100%;
  background: none;
  border: none;
  padding: 10px 16px;
  text-align: left;
  font-size: 0.9rem;
  color: var(--text);
  cursor: pointer;
  white-space: nowrap;
}
.overflow-menu-item:hover { background: var(--border); }
.overflow-menu-item + .overflow-menu-item { border-top: 1px solid var(--border); }
```

- [ ] **Step 2: Replace the header HTML**

Find (~line 1545):
```html
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
  <button class="btn-theme" id="theme-btn" onclick="toggleTheme()">&#9728;&#65039;</button>
  <div style="display:flex;gap:8px;">
    <button class="btn btn-gray" style="font-size:0.82rem;padding:6px 12px;" onclick="importGameReview()">&#128202; Review Game</button>
    <button class="btn btn-gray" style="font-size:0.82rem;padding:6px 12px;" onclick="showSeasonSummary()">&#128200; Season</button>
    <button id="team-settings-btn" class="btn btn-gray" style="font-size:0.82rem;padding:6px 12px;" onclick="goToTeamSetup()">&#9881; Team Settings</button>
  </div>
</div>
```
Replace with:
```html
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
  <button class="btn-theme" id="theme-btn" onclick="toggleTheme()">&#9728;&#65039;</button>
  <div style="position:relative;">
    <button id="overflow-menu-btn" class="btn btn-gray" style="font-size:0.82rem;padding:6px 14px;" onclick="toggleOverflowMenu()">&#8943;</button>
    <div id="overflow-menu" style="display:none;position:absolute;right:0;top:calc(100% + 4px);background:var(--bg-card);border:1px solid var(--border);border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:100;min-width:160px;">
      <button class="overflow-menu-item" onclick="importGameReview();closeOverflowMenu()">&#128202; Review Game</button>
      <button class="overflow-menu-item" onclick="showSeasonSummary();closeOverflowMenu()">&#128200; Season</button>
      <button class="overflow-menu-item" onclick="goToTeamSetup();closeOverflowMenu()">&#9881; Team Settings</button>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Remove dead `settingsBtn` references from `renderGameDayCheckboxes()`**

Find in `renderGameDayCheckboxes()` (~line 2662):
```js
const settingsBtn = document.getElementById('team-settings-btn');
if (!roster.length) {
  empty.style.display       = 'block';
  content.style.display     = 'none';
  settingsBtn.style.display = 'none';
  return;
}

empty.style.display       = 'none';
content.style.display     = 'block';
settingsBtn.style.display = '';
```
Replace with:
```js
if (!roster.length) {
  empty.style.display   = 'block';
  content.style.display = 'none';
  return;
}

empty.style.display   = 'none';
content.style.display = 'block';
```

- [ ] **Step 4: Add overflow menu JS functions**

Find `function goToSetup()` (~line 4132) and add before it:
```js
function toggleOverflowMenu() {
  const menu = document.getElementById('overflow-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function closeOverflowMenu() {
  document.getElementById('overflow-menu').style.display = 'none';
}

document.addEventListener('click', function(e) {
  const menu = document.getElementById('overflow-menu');
  if (!menu || menu.style.display === 'none') return;
  const btn = document.getElementById('overflow-menu-btn');
  if (!menu.contains(e.target) && e.target !== btn) {
    menu.style.display = 'none';
  }
});
```

- [ ] **Step 5: Verify manually**

Open `index.html` in browser. Confirm:
1. The three header buttons are gone; a `⋯` button appears in the top right.
2. Tapping `⋯` opens a dropdown with Review Game, Season, Team Settings.
3. Each item navigates correctly.
4. Tapping anywhere outside the dropdown closes it.
5. No JS errors in the console.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Replace header buttons with overflow menu on gameday screen"
```

---

### Task 3: Add responsive game info row (Game #, Date, Opponent)

**Files:**
- Modify: `index.html` (CSS ~line 240, HTML ~line 1566, JS `renderGameDayCheckboxes` ~line 2662, `goToLineup` ~line 2822)

- [ ] **Step 1: Add CSS for game info row**

In the `<style>` block, find:
```css
/* ===== GAMEDAY PLAYER TILES ===== */
```
Add before it:
```css
/* ===== GAME INFO ROW ===== */
.game-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
.game-number-badge {
  white-space: nowrap;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  flex-shrink: 0;
}
.game-date-input {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text);
  font-size: 1rem;
  outline: none;
  flex-shrink: 0;
}
.game-date-input:focus { border-color: var(--accent); }
/* On mobile: opponent takes its own row */
.game-info-row .text-input { flex: 1 1 100%; margin: 0; }
/* On tablet+: all three on one row */
@media (min-width: 600px) {
  .game-info-row { flex-wrap: nowrap; }
  .game-info-row .text-input { flex: 1 1 auto; min-width: 120px; }
}
```

- [ ] **Step 2: Replace opponent input div with game info row in HTML**

Find (~line 1566):
```html
<div id="gameday-content" style="display:none;">
  <div class="add-row" style="margin-bottom:4px;">
    <input class="text-input" type="text" id="opponent-input" placeholder="Today's opponent (required)..." maxlength="30" autocomplete="off" oninput="updateStartBtn()">
  </div>
```
Replace with:
```html
<div id="gameday-content" style="display:none;">
  <div class="game-info-row">
    <span class="game-number-badge" id="game-number-label">Game 1</span>
    <input class="game-date-input" type="date" id="game-date-input" oninput="gameDate=this.value">
    <input class="text-input" type="text" id="opponent-input" placeholder="Opponent (required)..." maxlength="30" autocomplete="off" oninput="updateStartBtn()">
  </div>
```

- [ ] **Step 3: Initialize game number and date in `renderGameDayCheckboxes()`**

In `renderGameDayCheckboxes()` (~line 2662), find the two lines that show content:
```js
empty.style.display   = 'none';
content.style.display = 'block';
```
Add immediately after:
```js
document.getElementById('game-number-label').textContent = `Game ${gameHistory.length + 1}`;
if (!gameDate) gameDate = new Date().toISOString().slice(0, 10);
document.getElementById('game-date-input').value = gameDate;
```

- [ ] **Step 4: Read game date in `goToLineup()`**

In `goToLineup()` (~line 2822), find:
```js
opponentName = document.getElementById('opponent-input').value.trim();
```
Add immediately after:
```js
gameDate     = document.getElementById('game-date-input').value || new Date().toISOString().slice(0, 10);
```

- [ ] **Step 5: Verify — phone layout**

In DevTools, set device to a phone (< 600px width). Confirm:
1. Game # badge and date picker appear on the same line.
2. Opponent input appears full-width on the line below.
3. Opponent field is comfortably tappable.

- [ ] **Step 6: Verify — tablet/iPad layout**

Set device width to ≥ 600px (e.g. iPad). Confirm:
1. All three elements (Game #, date, opponent) appear on one row.
2. Opponent input stretches to fill remaining space.
3. Game # badge and date picker stay at their natural widths.

- [ ] **Step 7: Verify date persists through a game**

1. Change the date picker to yesterday's date.
2. Enter an opponent, select players, tap "Set Starting Lineup".
3. Open DevTools → Application → Local Storage → `soccerActiveGame`.
4. Confirm `gameDate` matches the date you picked.
5. Finish a game. In the season summary, that game's date should match.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "Add responsive game info row: date picker and game number"
```
