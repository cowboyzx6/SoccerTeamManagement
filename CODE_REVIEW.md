# Code Review — SoccerTeamManagement

Generated: 2026-05-13

---

## Critical

### C1. `loadRoster()` missing try/catch
**File:** `persistence.js:331`

`JSON.parse(saved)` is unguarded. A corrupt `soccerRoster` entry throws on startup and freezes the app. Every other `localStorage` read in the file has try/catch + key removal — this one doesn't.

---

### C2. `moveFieldPlayerToBench` doesn't call `saveActiveGame()`
**File:** `game.js:543`

Moves a player off the field, commits position time, clears goalie state — but nothing is persisted. A page refresh after tapping the down-arrow on a field player restores the player as still on field.

---

### C3. `confirmLateArrival` doesn't call `saveActiveGame()`
**File:** `game.js:663`

Mutates `state.players` and re-renders, but never persists. A late-added player vanishes on refresh.

---

## Medium

### M1. Fragile two-loop halftime pattern
**File:** `game.js:748`

`h1Snapshot` is assigned before `subInAt` is nulled — they live in two separate sequential loops. Correct only if nothing throws between them. Merging into one loop removes the fragility.

---

### M3. `createPlan` (empty-slot path) doesn't call `saveActiveGame()`
**File:** `game.js:494`

When the target field slot is empty, the bench player is placed immediately with no save. `executeAllPlans` does save; this direct-placement path does not. Substitution state lost on refresh.

---

### M4. `makeSub` doesn't call `saveActiveGame()`
**File:** `game.js:601`

Direct substitutions (field player selected, then bench player tapped) mutate `onField`, `subInAt`, `position`, and `positionTime` without persisting. `executeAllPlans` saves; `makeSub` does not.

---

### M5. Phase-2 GK drag doesn't update `goalie2Id`
**File:** `lineup.js:98`

If the user drags a different player into the GK slot after the goalie picker already ran, `state.goalie2Id` still points to the originally picked player. `launchGame` resets `goalie1Id` from `lineupDraft` but not `goalie2Id`.

---

### M6. `stopWheel` writes `goalie1Id`/`goalie2Id` before the user confirms
**File:** `lineup.js:579`

Tapping "Spin Again" doesn't clear the prematurely written state, leaving dirty goalie state during the re-spin window.

---

### M7. `cancelGoalieSpin` doesn't clear lineup selection state
**File:** `lineup.js:628`

`state.selectedLineupPlayer` and `state.selectedLineupSlot` are not reset on cancel, leaving a ghost selection visible after dismissal.

---

### M8. No NaN guard in `adjustTheirScore`
**File:** `game.js:845`

`parseInt(preview.textContent)` has no NaN validation. If the DOM text is ever non-numeric, `scoreThem` silently becomes `NaN` and propagates into saved game history.

---

## Security

### S1. Photo URLs from imported profiles not validated
**Files:** `roster.js:29`, `persistence.js:277`

`importProfile` writes the raw photo string from the imported JSON directly to `state.playerPhotos` without checking the format. A crafted backup could inject a remote URL, causing a silent outbound request on every render. A `startsWith('data:image/')` guard in the import handler would close it.

---

## Minor

### m3. `fmt()` duplicated across two modules
**Files:** `game.js:112`, `summary.js:13`

Identical time-formatting function defined in two modules. Should live in `utils.js` and be imported.

---

### m4. Goal summary deduplication uses player name, not ID
**File:** `summary.js:23`

Two roster players with the same name will have their goals merged into one row in the game summary. `g.scorerId` is available on goal records and should be used as the map key instead of the name string.

---

### m5. `endGame` auto-triggers a file download without user action
**File:** `game.js:891`

`exportProfile(false, true)` fires a browser download automatically at game end. Surprising on mobile where download prompts behave differently, and can delay the summary screen if the dialog blocks the tab.

---

### m6. `state.players` not cleared after `endGame` — causes false resume prompt
**File:** `game.js:875`

The `beforeunload` handler in `app.js` checks `state.players.length > 0` to decide whether to save an active game. After a game ends, `state.players` is still populated, so closing the browser re-saves the finished game as active — causing a spurious "resume?" prompt on the next load even though the game was already recorded in history.

---

## Refactor Suggestions

### R1. Handler injection has an invisible initialization ordering contract
**Files:** `app.js`, `persistence.js`, `roster.js`, `lineup.js`

`configurePersistenceHandlers`, `configureLineupGameHandlers`, and `configureSummaryHandlers` create a silent "must call before any DOM events fire" dependency. Consolidating all event wiring into `app.js` would make the dependencies explicit and eliminate the injection pattern.

---

### R2. Module-level DOM queries at parse time
**Files:** `persistence.js:182`, `roster.js:48`, and others

`document.getElementById(...)` calls at the top level of modules tie initialization to a specific DOM state and make the modules impossible to import outside a browser (e.g., in tests).

---

### R3. `state.savedChecked` grafted onto `state` at runtime
**File:** `lineup.js:47`

A `Set` is written directly onto the shared `state` object from `lineup.js` so `roster.js` can read it. It is not declared in `state.js`, making the data flow invisible. It should be declared in `state.js` or passed explicitly between modules.

---

### R4. `manifest.json` missing from `sw.js` cache manifest
**File:** `sw.js:2`

`manifest.json` is not listed in `ASSETS`. The PWA manifest won't be cached for offline use, which can affect install reliability.

---

### R6. Shadowed variable `p` in `renderLineupPlayers`
**File:** `lineup.js:278`

```js
const p = state.lineupDraft.find(p => p.id === state.selectedLineupPlayer);
```

The inner arrow-function parameter `p` shadows the outer `const p`. Works by coincidence; renaming one of them would remove the ambiguity.

---

## Summary

| ID | Severity | File | Issue |
|----|----------|------|-------|
| C1 | Critical | persistence.js:331 | `loadRoster` no try/catch around JSON.parse |
| C2 | Critical | game.js:543 | `moveFieldPlayerToBench` missing saveActiveGame() |
| C3 | Critical | game.js:663 | `confirmLateArrival` missing saveActiveGame() |
| M1 | Medium | game.js:748 | Two-loop halftime fragility |
| M3 | Medium | game.js:494 | `createPlan` empty-slot path missing saveActiveGame() |
| M4 | Medium | game.js:601 | `makeSub` missing saveActiveGame() |
| M5 | Medium | lineup.js:98 | Phase-2 GK drag doesn't update goalie2Id |
| M6 | Medium | lineup.js:579 | stopWheel premature state write before confirmation |
| M7 | Medium | lineup.js:628 | cancelGoalieSpin leaves stale selection state |
| M8 | Medium | game.js:845 | adjustTheirScore no NaN guard on parseInt |
| S1 | Security | roster.js:29, persistence.js:277 | Photo URL not validated on profile import |
| m3 | Minor | game.js:112, summary.js:13 | fmt() duplicated across two modules |
| m4 | Minor | summary.js:23 | Goal summary keyed by name, not player ID |
| m5 | Minor | game.js:891 | Auto-download on game end without user action |
| m6 | Minor | game.js:875 | state.players not cleared → false resume prompt |
| R1 | Refactor | app.js / persistence.js | Handler injection has implicit ordering contract |
| R2 | Refactor | persistence.js, roster.js | DOM queries at module parse time |
| R3 | Refactor | lineup.js:47 | savedChecked grafted onto state at runtime |
| R4 | Refactor | sw.js:2 | manifest.json missing from SW cache ASSETS |
| R6 | Refactor | lineup.js:278 | Shadowed variable p in renderLineupPlayers |
