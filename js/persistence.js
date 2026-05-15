import { state } from './state.js';
import { showScreen } from './utils.js';
import { APP_VERSION } from './version.js';

const VALID_POSITIONS = new Set(['LF', 'CF', 'RF', 'LM', 'CM', 'RM', 'LD', 'RD', 'GK']);
const MAX_TEAM_NAME_LEN = 30;
const MAX_PLAYER_NAME_LEN = 30;
const MAX_HALF_MINUTES = 90;

function cleanText(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLen);
}

function toNonNegativeInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

function toPlayerId(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function normalizeHalfMinutes(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return state.halfMinutes;
  return Math.min(MAX_HALF_MINUTES, Math.max(1, Math.round(n)));
}

function normalizePhoto(value) {
  if (typeof value !== 'string') return null;
  return /^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=\s]+$/i.test(value) ? value : null;
}

function normalizePositionSeconds(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([pos]) => VALID_POSITIONS.has(pos))
      .map(([pos, seconds]) => [pos, toNonNegativeInt(seconds)])
      .filter(([, seconds]) => seconds > 0)
  );
}

function normalizeGoal(goal) {
  if (!goal || typeof goal !== 'object') return null;
  const team = goal.team === 'them' ? 'them' : goal.team === 'us' ? 'us' : null;
  if (!team) return null;

  const normalized = {
    scorer: team === 'us' ? cleanText(goal.scorer || '', MAX_PLAYER_NAME_LEN) || null : null,
    half: goal.half === 2 ? 2 : 1,
    team,
  };

  const scorerId = toPlayerId(goal.scorerId);
  if (scorerId !== null) normalized.scorerId = scorerId;

  return normalized;
}

function normalizeGameRecord(game) {
  if (!game || typeof game !== 'object') return null;

  const playerStats = Array.isArray(game.playerStats)
    ? game.playerStats.map(ps => {
        if (!ps || typeof ps !== 'object') return null;
        const id = toPlayerId(ps.id);
        const name = cleanText(ps.name, MAX_PLAYER_NAME_LEN);
        if (id === null || !name) return null;

        const secondsPlayed = toNonNegativeInt(ps.secondsPlayed ?? (Number(ps.minutesPlayed) * 60));
        const firstHalfSeconds = toNonNegativeInt(ps.firstHalfSeconds, secondsPlayed);
        const secondHalfSeconds = toNonNegativeInt(ps.secondHalfSeconds, Math.max(0, secondsPlayed - firstHalfSeconds));
        const positionSeconds = normalizePositionSeconds(ps.positionSeconds);

        return {
          id,
          name,
          minutesPlayed: Math.round(secondsPlayed / 60 * 10) / 10,
          secondsPlayed,
          firstHalfSeconds,
          secondHalfSeconds,
          positionSeconds,
          positionMinutes: Object.fromEntries(
            Object.entries(positionSeconds).map(([pos, seconds]) => [pos, Math.round(seconds / 60 * 10) / 10])
          ),
        };
      }).filter(Boolean)
    : [];

  return {
    date: cleanText(game.date, 20),
    opponent: cleanText(game.opponent, 30),
    ourScore: toNonNegativeInt(game.ourScore),
    theirScore: toNonNegativeInt(game.theirScore),
    goals: Array.isArray(game.goals) ? game.goals.map(normalizeGoal).filter(Boolean) : [],
    playerStats,
  };
}

function normalizeProfile(profile, { requireRoster = false, requireGames = false } = {}) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    throw new Error('Profile must be an object.');
  }
  if (requireRoster && !Array.isArray(profile.roster)) {
    throw new Error('Profile is missing a roster.');
  }
  if (requireGames && !Array.isArray(profile.games)) {
    throw new Error('Profile is missing game records.');
  }

  const roster = Array.isArray(profile.roster)
    ? profile.roster.map(p => {
        if (!p || typeof p !== 'object') return null;
        const id = toPlayerId(p.id);
        const name = cleanText(p.name, MAX_PLAYER_NAME_LEN);
        if (id === null || !name) return null;
        return { id, name, photo: normalizePhoto(p.photo) };
      }).filter(Boolean)
    : null;

  if (requireRoster && (!roster || roster.length === 0)) {
    throw new Error('Profile does not contain any valid roster players.');
  }

  const seenRosterIds = new Set();
  const uniqueRoster = roster
    ? roster.filter(p => {
        if (seenRosterIds.has(p.id)) return false;
        seenRosterIds.add(p.id);
        return true;
      })
    : null;

  const games = Array.isArray(profile.games)
    ? profile.games.map(normalizeGameRecord).filter(Boolean)
    : [];

  if (requireGames && games.length === 0) {
    throw new Error('Profile does not contain any valid game records.');
  }

  return {
    teamName: cleanText(profile.teamName, MAX_TEAM_NAME_LEN) || state.teamName,
    halfMinutes: normalizeHalfMinutes(profile.halfMinutes),
    roster: uniqueRoster,
    games,
  };
}


export function saveSettings() {
  localStorage.setItem('soccerSettings', JSON.stringify({
    teamName: state.teamName,
    halfMinutes: state.halfMinutes
  }));
}

export function loadSettings() {
  const raw = localStorage.getItem('soccerSettings');
  if (raw) {
    try {
      const s = JSON.parse(raw);
      if (s.teamName)    state.teamName    = s.teamName;
      if (s.halfMinutes) state.halfMinutes = s.halfMinutes;
    } catch { localStorage.removeItem('soccerSettings'); }
  }
  document.getElementById('team-name-input').value = state.teamName;
  document.getElementById('app-title-name').textContent = state.teamName;
  document.getElementById('half-minutes-display').textContent = `${state.halfMinutes} min`;
}

export function loadGameHistory() {
  const raw = localStorage.getItem('soccerGameHistory');
  if (raw) {
    try { state.gameHistory = JSON.parse(raw); }
    catch { localStorage.removeItem('soccerGameHistory'); }
  }
}

export function saveGameHistory() {
  localStorage.setItem('soccerGameHistory', JSON.stringify(state.gameHistory));
}

export function saveActiveGame() {
  try {
    localStorage.setItem('soccerActiveGame', JSON.stringify({
      players: state.players,
      totalElapsed: state.totalElapsed,
      halfClock: state.halfClock,
      currentHalf: state.currentHalf,
      halfActionIsEnd: state.halfActionIsEnd,
      goalie1Id: state.goalie1Id,
      goalie2Id: state.goalie2Id,
      activeGoalieId: state.activeGoalieId,
      opponentName: state.opponentName,
      scoreUs: state.scoreUs,
      scoreThem: state.scoreThem,
      goals: state.goals,
      halfMinutes: state.halfMinutes,
      subPlans: state.subPlans,
      planningBenchId: state.planningBenchId,
      planningPosition: state.planningPosition,
      gameDate: state.gameDate
    }));
  } catch (e) {}
}

export function clearActiveGame() {
  localStorage.removeItem('soccerActiveGame');
}

export function checkForActiveGame() {
  const raw = localStorage.getItem('soccerActiveGame');
  if (!raw) return;
  let saved;
  try { saved = JSON.parse(raw); } catch { clearActiveGame(); return; }
  if (!saved.players || !saved.players.length) { clearActiveGame(); return; }
  if (!confirm('A game was interrupted. Resume where you left off?')) { clearActiveGame(); return; }

  state.players          = saved.players         || [];
  state.totalElapsed     = saved.totalElapsed    || 0;
  state.halfClock        = saved.halfClock       || 0;
  state.currentHalf      = saved.currentHalf     || 1;
  state.halfActionIsEnd  = saved.halfActionIsEnd || false;
  state.goalie1Id        = saved.goalie1Id       ?? null;
  state.goalie2Id        = saved.goalie2Id       ?? null;
  state.activeGoalieId   = saved.activeGoalieId  ?? null;
  state.opponentName     = saved.opponentName    || '';
  state.scoreUs          = saved.scoreUs         || 0;
  state.scoreThem        = saved.scoreThem       || 0;
  state.goals            = saved.goals           || [];
  state.halfMinutes      = saved.halfMinutes     || 25;
  state.subPlans         = saved.subPlans        || [];
  state.planningBenchId  = saved.planningBenchId ?? null;
  state.planningPosition = saved.planningPosition ?? null;
  state.gameDate         = saved.gameDate        || new Date().toISOString().slice(0, 10);

  showScreen('game-screen');
  document.dispatchEvent(new CustomEvent('game:resumed'));
}

export function buildGameRecord() {
  return {
    date:       state.gameDate || new Date().toISOString().slice(0, 10),
    opponent:   state.opponentName,
    ourScore:   state.scoreUs,
    theirScore: state.scoreThem,
    goals: state.goals,
    playerStats: state.players.map(p => ({
      id:            p.id,
      name:          p.name,
      minutesPlayed: Math.round(p.totalPlayed / 60 * 10) / 10,
      secondsPlayed: p.totalPlayed,
      firstHalfSeconds: Number.isFinite(p.h1Snapshot) ? p.h1Snapshot : p.totalPlayed,
      secondHalfSeconds: Number.isFinite(p.h1Snapshot) ? Math.max(0, p.totalPlayed - p.h1Snapshot) : 0,
      positionSeconds: p.positionTime || {},
      positionMinutes: Object.fromEntries(
        Object.entries(p.positionTime || {}).map(([pos, s]) => [pos, Math.round(s / 60 * 10) / 10])
      ),
    })),
  };
}

export function buildProfile(includeGameRecord) {
  const profile = {
    appVersion: APP_VERSION,
    teamName: state.teamName,
    halfMinutes: state.halfMinutes,
    roster: state.roster.map(p => ({
      id:    p.id,
      name:  p.name,
      photo: state.playerPhotos[p.id] || null,
    })),
    games: [...state.gameHistory],
  };

  if (includeGameRecord) {
    profile.games.push(buildGameRecord());
  }

  return profile;
}

export function exportProfile(includeGameRecord = false, forceGameFilename = false) {
  const profile  = buildProfile(includeGameRecord);
  const safeName = (state.teamName || 'team').replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  let filename;
  if (includeGameRecord || forceGameFilename) {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const latestGame = profile.games[profile.games.length - 1] || {};
    const gameNumber = profile.games.length || 1;
    const dateStr = latestGame.date || `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    filename = `${safeName}_Game_${gameNumber}_${dateStr}_${timeStr}.json`;
  } else {
    filename = `${safeName}-profile.json`;
  }

  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProfile() {
  document.getElementById('import-file-input').click();
}

export function importLeagueCsv() {
  document.getElementById('csv-file-input').click();
}

export function parseCsvRoster(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) { alert('CSV appears empty.'); return; }

  const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const firstIdx = headers.indexOf('player_first_name');
  const lastIdx  = headers.indexOf('player_last_name');

  if (firstIdx === -1 || lastIdx === -1) {
    alert('Could not find player_first_name / player_last_name columns in this CSV.');
    return;
  }

  const imported = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = parseCsvLine(lines[i]);
    const first = (cols[firstIdx] || '').trim();
    const last  = (cols[lastIdx]  || '').trim();
    if (!first) continue;
    const name = last ? `${first} ${last[0].toUpperCase()}.` : first;
    imported.push(name);
  }

  if (!imported.length) { alert('No players found in CSV.'); return; }

  const existing = state.roster.map(p => p.name.toLowerCase());
  const newNames  = imported.filter(n => !existing.includes(n.toLowerCase()));
  const dupNames  = imported.filter(n =>  existing.includes(n.toLowerCase()));

  const msg = [
    `Found ${imported.length} player(s) in CSV.`,
    newNames.length  ? `${newNames.length} will be added.`    : '',
    dupNames.length  ? `${dupNames.length} already exist and will be skipped.` : '',
  ].filter(Boolean).join('\n');

  if (!newNames.length) {
    alert('All players in the CSV already exist in your roster. Nothing to add.');
    return;
  }

  if (confirm(`${msg}\n\nProceed?`)) {
    newNames.forEach(name => {
      state.roster.push({ id: state.nextId++, name });
    });
    saveRoster();
    document.dispatchEvent(new CustomEvent('league-csv:imported'));
  }
}

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

export function importGameReview() {
  document.getElementById('review-file-input').click();
}

export function initEventListeners() {
  document.getElementById('csv-file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => parseCsvRoster(ev.target.result);
    reader.readAsText(file);
    this.value = '';
  });

  document.getElementById('import-file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const profile = normalizeProfile(JSON.parse(ev.target.result), { requireRoster: true });

        state.teamName    = profile.teamName;
        state.halfMinutes = profile.halfMinutes;
        state.gameHistory = profile.games;
        state.roster      = profile.roster.map(p => ({ id: p.id, name: p.name }));
        state.nextId      = state.roster.length ? Math.max(...state.roster.map(p => p.id)) + 1 : 1;
        state.playerPhotos = {};

        profile.roster.forEach(p => {
          if (p.photo) state.playerPhotos[p.id] = p.photo;
        });
        try {
          localStorage.setItem('playerPhotos', JSON.stringify(state.playerPhotos));
        } catch (e) {
          alert('Storage full \u2014 some photos from the imported profile could not be saved.');
        }
        saveRoster();

        saveSettings();
        saveGameHistory();

        document.getElementById('team-name-input').value = state.teamName;
        document.getElementById('app-title-name').textContent = state.teamName;
        document.getElementById('half-minutes-display').textContent = `${state.halfMinutes} min`;
        document.dispatchEvent(new CustomEvent('profile:imported'));
      } catch (err) {
        alert(`Invalid profile file. ${err.message}`);
      }
    };
    reader.readAsText(file);
    this.value = '';
  });

  document.getElementById('review-file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const profile = normalizeProfile(JSON.parse(ev.target.result), { requireGames: true });
        const gameRecord = profile.games[profile.games.length - 1];
        document.dispatchEvent(new CustomEvent('game-review:loaded', {
          detail: { gameRecord, teamName: profile.teamName || state.teamName }
        }));
      } catch (err) {
        alert(`Invalid game file. ${err.message}`);
      }
    };
    reader.readAsText(file);
    this.value = '';
  });
}

export function loadRoster() {
  const saved = localStorage.getItem('soccerRoster');
  if (saved) {
    try {
      state.roster = JSON.parse(saved);
      state.nextId  = state.roster.length ? Math.max(...state.roster.map(p => p.id)) + 1 : 1;
    } catch { localStorage.removeItem('soccerRoster'); }
  }
}

export function saveRoster() {
  localStorage.setItem('soccerRoster', JSON.stringify(state.roster));
}
