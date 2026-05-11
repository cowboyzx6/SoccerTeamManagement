# Game Screen Layout Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Widen the game screen field panel to 70%, collapse the bench to a single column, and increase on-field player card size by ~30% for better iPad readability.

**Architecture:** Three targeted CSS-only edits to `index.html`. No JavaScript changes, no new files. The `.pos-slot` CSS is shared by the game screen and lineup screen — both benefit automatically.

**Tech Stack:** Plain CSS inside `index.html` `<style>` block.

---

### Task 1: Widen the field panel to 70%

**Files:**
- Modify: `index.html` — `.field-panel` rule (~line 754)

- [ ] **Step 1: Locate the rule**

Search for `.field-panel` in `index.html`. The rule starts around line 754 and contains:
```css
.field-panel {
  flex: 0 0 55%;
  ...
}
```

- [ ] **Step 2: Change the flex basis**

Replace:
```css
flex: 0 0 55%;
```
With:
```css
flex: 0 0 70%;
```

- [ ] **Step 3: Verify visually**

Open `index.html` in a browser (or `http://localhost:8000` if the dev server is running). Start a game with any roster. Confirm the field panel is noticeably wider and the bench panel is narrower.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Widen game screen field panel from 55% to 70%"
```

---

### Task 2: Collapse bench to single column

**Files:**
- Modify: `index.html` — `.player-grid` rule (~line 845)

- [ ] **Step 1: Locate the rule**

Search for `.player-grid` in `index.html`. The rule looks like:
```css
.player-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  ...
}
```

- [ ] **Step 2: Change to single column**

Replace:
```css
grid-template-columns: 1fr 1fr;
```
With:
```css
grid-template-columns: 1fr;
```

- [ ] **Step 3: Verify visually**

On the game screen, confirm bench players are listed in a single column. Each card should now be the full width of the bench panel. Confirm the bench sort buttons and "Late Arrival" button in the bench header still fit without wrapping badly.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Collapse bench grid to single column"
```

---

### Task 3: Increase field player card size ~30%

**Files:**
- Modify: `index.html` — field diagram CSS block (~lines 1684–1795)

- [ ] **Step 1: Update `.pos-slot` width and padding**

Find `.pos-slot` (~line 1684):
```css
.pos-slot {
  ...
  width: 84px;
  ...
  padding: 0 3px 24px;
  ...
}
```

Change to:
```css
.pos-slot {
  ...
  width: 108px;
  ...
  padding: 0 4px 31px;
  ...
}
```

- [ ] **Step 2: Update `.pos-avatar` size and font**

Find `.pos-avatar` (~line 1757):
```css
.pos-avatar {
  width: 28px;
  height: 28px;
  ...
  font-size: 0.72rem;
  ...
}
```

Change to:
```css
.pos-avatar {
  width: 36px;
  height: 36px;
  ...
  font-size: 0.94rem;
  ...
}
```

- [ ] **Step 3: Update `.pos-name` font size**

Find `.pos-name` (~line 1778):
```css
.pos-name {
  font-size: 0.75rem;
  ...
}
```

Change to:
```css
.pos-name {
  font-size: 0.98rem;
  ...
}
```

- [ ] **Step 4: Update `.pos-time` font size**

Find `.pos-time` (~line 1788):
```css
.pos-time {
  font-size: 0.88rem;
  ...
}
```

Change to:
```css
.pos-time {
  font-size: 1.14rem;
  ...
}
```

- [ ] **Step 5: Update `.pos-label` font size**

Find `.pos-label` (~line 1729):
```css
.pos-label {
  font-size: 0.72rem;
  ...
}
```

Change to:
```css
.pos-label {
  font-size: 0.94rem;
  ...
}
```

- [ ] **Step 6: Verify visually**

On the game screen with a full lineup (9 players), confirm:
- All 9 player cards are visible without overlap
- Name text is legible
- Time digits are clearly readable
- Cards in the 3-forward row and 3-midfielder row don't crowd each other
- Check the lineup screen too — it shares `.pos-slot` and should look proportionally correct

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "Increase field player card size ~30% for iPad readability"
```
