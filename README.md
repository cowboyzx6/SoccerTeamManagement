# Soccer Team Management

A browser-only web app for managing youth soccer rotations during live games. It tracks who is on the field, who is on the bench, playing time by player, time by position, goals, game history, and season totals.

The app is currently implemented as a **single-file vanilla HTML/CSS/JavaScript app** in `index.html`. There is no build system, no npm dependency tree, no backend, and no account requirement.

## What the App Does

### Team setup

- Set the team name.
- Add, rename, and remove roster players.
- Add optional player photos.
- Import players from a league CSV using `player_first_name` and `player_last_name` columns.
- Export and import a full team profile as JSON.
- Clear all locally stored data and reset the app.

### Game day setup

- Select which roster players are attending a game.
- Enter the opponent name.
- Set the game date.
- Adjust minutes per half.
- Assign a starting lineup on a visual 3-3-2 + GK field diagram.
- Pick a goalkeeper manually or use the goalie wheel spinner.

### Live game tracking

- Countdown clock for each half.
- Pause and resume the game timer.
- Track field players, bench players, and active goalkeeper.
- Track total playing time per player.
- Track position-specific time for LF, CF, RF, LM, CM, RM, LD, RD, and GK.
- Stage substitutions ahead of time and execute planned subs together.
- Sub immediately by selecting a field player and then a bench player.
- Move a field player directly to the bench.
- Add late-arriving roster players during a game.
- Mark players as removed from the current game.
- Sort the bench by name, playing time, or substitution priority.
- Use color-coded cards to identify players who are under-played, balanced, or over-played.
- Record goals for either team, with optional scorer attribution for your team.

### Summaries and history

- Show a post-game summary with first-half, second-half, and total time.
- Show position breakdown chips for each player.
- Save completed games into local season history.
- Show a season summary with wins, losses, draws, goals for, goals against, games played, player goals, and total playing time.
- Import a previously exported JSON file through **Review Game** to view a saved game summary.

### Other features

- Dark/light theme toggle.
- Local active-game recovery after an interrupted session.
- Player avatar generation when no photo is set.
- Player photo resize/crop before saving.
- PWA metadata through `manifest.json`.
- Service worker registration through `sw.js` when served from a supported browser context.

## Running the App

For basic use, open `index.html` in a modern browser.

For the most reliable browser behavior, especially PWA/service-worker behavior, serve the folder locally instead of opening the file directly:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

On some systems the command may be:

```bash
python3 -m http.server 8000
```

## Basic Usage

1. Open the app.
2. If no team is configured, choose **Set Up My Team**.
3. Add the team name and roster.
4. Return to the main game-day screen.
5. Select the players who showed up.
6. Enter the opponent and game date.
7. Set the half length.
8. Choose **Set Starting Lineup**.
9. Assign players to positions on the field diagram.
10. Pick or spin for the goalkeeper.
11. Start the game.
12. Use the field and bench panels to plan subs, execute subs, record goals, and track playing time.
13. End the game to save it to local game history and view the summary.
14. Use **Export Game JSON** or **Save Profile** when you want a backup file.

## Data Storage and Privacy

All app data is stored locally in the browser using `localStorage`.

The main storage keys are:

- `soccerRoster` — team roster.
- `soccerSettings` — team name and half length.
- `playerPhotos` — resized player photos as base64 image data.
- `soccerGameHistory` — completed game records.
- `soccerActiveGame` — interrupted in-progress game state.
- `theme` — light/dark theme preference.

No data is sent to a server by this app.

Important limitations:

- Browser storage is not a real database.
- Clearing browser site data will delete the roster, photos, game history, and active game state.
- Player photos can consume browser storage quickly.
- Use **Save Profile** regularly if the data matters.
- Keep exported JSON backups somewhere safe.

## Import and Export Notes

### Save Profile

Exports the team profile, including roster, photos, settings, and saved game history.

### Load Profile

Imports a previously exported profile JSON file.

### Export Game JSON

The summary-screen export uses the same profile-style JSON structure and includes the saved game history. It is useful for backup or later review.

### Review Game

Loads a JSON file and displays the most recent game record found in the file without replacing the current team profile.

### League CSV Import

The CSV importer expects these column names:

```text
player_first_name
player_last_name
```

It imports names as `First L.` and skips duplicates already in the roster.

## File Structure

```text
index.html       Main app: HTML, CSS, and JavaScript
manifest.json   PWA manifest
sw.js           Service worker for offline caching
README.md       Project overview and usage notes
CLAUDE.md       Claude Code project guidance
PROJECT_MAP.md  Lightweight map to help Claude target sections in index.html
```

## Development Notes

This app intentionally has no build step.

- Edit `index.html` directly.
- Test in a browser.
- Use browser DevTools for runtime errors.
- Keep changes targeted; the file is large enough that broad rewrites are risky.
- Avoid dumping the entire file into AI coding tools unless absolutely necessary.
- Use `PROJECT_MAP.md` to locate the relevant section before editing.

## Code Organization

`index.html` contains three major areas:

1. Embedded CSS in the `<style>` block.
2. Screen/modal markup in the `<body>`.
3. App logic in the `<script>` block.

The main screens are:

- `setup-screen` — main landing/game-day screen.
- `team-setup-screen` — roster and team settings.
- `lineup-screen` — starting lineup assignment.
- `game-screen` — live game tracking.
- `summary-screen` — completed game summary and game review display.
- `season-summary-screen` — aggregate season statistics.

Common modals include:

- `gk-picker-modal`
- `goalie-modal`
- `late-modal`
- `remove-player-modal`
- `remove-roster-modal`
- `rename-modal`
- `goal-modal`
- `half-modal`
- `clear-data-modal`

## Key Concepts for Contributors

### State

The app uses global JavaScript state. Mutating state does not automatically update the UI. After changing state, call the appropriate render/update function.

Important state variables include:

```js
roster
players
gameHistory
playerPhotos
teamName
opponentName
scoreUs
scoreThem
goals
subPlans
currentHalf
halfClock
totalElapsed
activeGoalieId
```

### Rendering

UI is refreshed through functions such as:

```js
renderRoster()
renderTeamSetupRoster()
renderGameDayCheckboxes()
renderLineup()
renderGame()
renderField()
renderGrid()
renderClock()
renderScore()
showSummary()
showSeasonSummary()
```

### Substitutions

Substitution flow supports both planned and immediate substitutions:

- Planned: select a bench player, select a field position, then press **Sub Now**.
- Immediate: select a field player, then select a bench player.

Planned substitutions are stored in `subPlans` until executed.

### Timing

The clock uses elapsed real time to reduce drift. Active players accumulate playing time based on `totalElapsed`, `subInAt`, and position timers.

### Position Tracking

Position time is tracked with:

```js
position
positionTime
positionStart
```

Use `commitPositionTime(player)` before changing a player's position or moving them off the field.

## Known Limitations

- The app is a large single-file codebase, which makes navigation and AI-assisted edits harder.
- There are no automated tests.
- Data integrity depends on browser `localStorage`.
- Export/import is JSON-file based, not cloud sync.
- Service worker and PWA install behavior may require serving the app over `localhost` or HTTPS.
- The UI is optimized for practical game-day use, not for multi-user collaboration.

## Suggested Future Improvements

- Split `index.html` into separate `styles.css` and `app.js` files.
- Add automated smoke tests for critical flows.
- Add an explicit backup/reminder flow.
- Add validation around imported JSON/profile files.
- Consider a lightweight data schema/version field for future migrations.
- Improve mobile layout testing across common phone sizes.
