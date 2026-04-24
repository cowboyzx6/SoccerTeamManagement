# Soccer Team Management

A single-file web app for managing youth soccer team rotations and tracking player stats in real time — no server, no install, runs entirely in the browser.

## Features

### Team Setup
- Add and manage your full roster with player names and optional photos
- Import players from a league-exported CSV file (`player_first_name` / `player_last_name` columns)
- Save and restore your full team profile (roster, photos, game history) via JSON export/import

### Game Day
- Check off which players showed up before each game
- Set the opponent name and minutes per half
- Assign your starting lineup to field positions on a visual field diagram (3-3-2 + GK formation)
- Use the goalie wheel spinner to randomly pick a goalkeeper for each half

### Live Game Tracking
- Real-time clock counting down each half
- Pause and resume the timer at any time
- Plan substitutions ahead of time — stage multiple subs and execute them all at once
- Move players directly between field positions and the bench
- Color-coded bench cards show who needs more time (red), is balanced (green), or has played too much (yellow)
- Add late arrivals mid-game
- Record goals with optional scorer attribution; goals can be recorded while paused

### Stats & Summary
- Tracks total playing time per player to the second
- Tracks time spent at each field position (LF, CF, RF, LM, CM, RM, LD, RD, GK)
- Post-game summary table with 1st half / 2nd half split and position breakdown
- Full game history stored locally across sessions

### Import / Export
- Game JSON is automatically exported at the end of every game
- Load any past game file with **Review Game** to view its summary without overwriting your current team
- Export your full profile at any time as a backup

### Other
- Dark and light theme toggle
- Player avatar photos with automatic resizing
- Works on desktop and mobile browsers
- All data stored locally in the browser (no account or internet required after first load)

## Usage

Open `index.html` in any modern browser — no build step or web server needed.

1. Click **Team Settings** to add your roster and team name
2. On the main screen, check the players who showed up and enter the opponent name
3. Click **Set Starting Lineup** to assign positions, then **Start Game**
4. Use the field and bench panels to manage subs and record goals during the game
5. After both halves, the game summary is shown and a JSON file is automatically downloaded

## Data & Privacy

All data (roster, photos, game history) is stored in your browser's `localStorage` and never leaves your device. Use **Save Profile** to back up your data or move it to another browser.

## File Structure

```
index.html   — the entire application (HTML + CSS + JS, self-contained)
README.md    — this file
```
