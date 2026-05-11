# Game Screen Layout Overhaul

**Date:** 2026-05-11  
**Status:** Approved

## Goal

Make the live game screen easier to read on an iPad-sized device by giving the field more horizontal space, collapsing the bench to a single column, and increasing the size of on-field player cards.

## Changes

### 1. Field panel width

**File:** `index.html` — `.field-panel` CSS (~line 754)

Change `flex: 0 0 55%` to `flex: 0 0 70%`.

The bench panel (`flex: 1`) automatically shrinks to fill the remaining ~30%.

### 2. Bench grid — single column

**File:** `index.html` — `.player-grid` CSS (~line 845)

Change `grid-template-columns: 1fr 1fr` to `grid-template-columns: 1fr`.

Bench cards will naturally fill the wider single column with no additional changes needed.

### 3. Field player card size — ~30% bump

**File:** `index.html` — field diagram CSS (~lines 1684–1795)

| Selector | Property | Current | New |
|---|---|---|---|
| `.pos-slot` | `width` | `84px` | `108px` |
| `.pos-slot` | `padding` | `0 3px 24px` | `0 4px 31px` |
| `.pos-avatar` | `width` + `height` | `28px` | `36px` |
| `.pos-avatar` | `font-size` | `0.72rem` | `0.94rem` |
| `.pos-name` | `font-size` | `0.75rem` | `0.98rem` |
| `.pos-time` | `font-size` | `0.88rem` | `1.14rem` |
| `.pos-label` | `font-size` | `0.72rem` | `0.94rem` |

## Scope

`.pos-slot` CSS is shared between `#game-screen` and `#lineup-screen`. Both screens will get the larger cards — this is intentional and desirable.

No JavaScript changes are required. All three changes are CSS-only.

## Out of scope

- Bench card height/font-size changes (bench cards will be naturally wider from the single-column grid; no explicit size bump needed)
- Any changes to position coordinates (`POSITIONS` object) — slots are absolutely positioned by percentage so they reflow correctly as the field panel grows
