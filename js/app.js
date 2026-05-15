import { FIELD_SVG, state } from './state.js';
import {
  checkForActiveGame,
  exportProfile,
  importGameReview,
  importLeagueCsv,
  importProfile,
  loadGameHistory,
  loadRoster,
  loadSettings,
  saveActiveGame,
  saveSettings
} from './persistence.js';
import {
  addRosterPlayer,
  changeHalfMinutes,
  checkAllPlayers,
  closeRemoveRosterModal,
  closeRenameModal,
  confirmRemoveRosterPlayer,
  confirmRename,
  loadPhotos,
  renderGameDayCheckboxes,
  renderRoster,
  renderTeamSetupRoster,
  updateStartBtn
} from './roster.js';
import {
  closeClearDataModal,
  closeOverflowMenu,
  confirmClearData,
  executeClearData,
  goBackFromTeamSetup,
  goToSetup,
  goToTeamSetup,
  openAboutModal,
  setSeasonSort,
  showGameReviewFromRecord,
  showSeasonSummary,
  toggleOverflowMenu
} from './summary.js';
import {
  cancelGoalieSpin,
  confirmGkFromSpin,
  confirmGoalies,
  goBackFromLineup,
  goToLineup,
  handleLineupPointerDown,
  handleLineupPointerMove,
  handleLineupPointerUp,
  launchGame,
  nextGoaliePick,
  openGkSpin,
  skipGkPicker,
  spinAgain,
  spinWheel,
  stopWheel
} from './lineup.js';
import {
  adjustTheirScore,
  closeGoalModal,
  closeHalfModal,
  closeLateModal,
  closeRemovePlayerModal,
  confirmGoal,
  confirmHalfAction,
  confirmRemovePlayer,
  confirmTheirScore,
  endGame,
  executeAllPlans,
  handleFieldSlotPointerDown,
  handleFieldSlotPointerMove,
  handleFieldSlotPointerUp,
  handleHalfEnd,
  isFieldClickSuppressed,
  moveFieldPlayerToBench,
  openGoalModal,
  openLateModal,
  pauseGame,
  promptRemovePlayer,
  recordGoal,
  renderClock,
  renderGame,
  renderScore,
  setBenchSort,
  syncGamePhaseUi,
  togglePause,
  updateGoalBtn
} from './game.js';
import { applyTheme, closeModal, toggleTheme } from './utils.js';

function onTeamNameInput() {
  const val = document.getElementById('team-name-input').value.trim();
  document.getElementById('app-title-name').textContent = val || 'My Team';
  updateStartBtn();
}


document.addEventListener('game:resumed', () => {
  syncGamePhaseUi();
  renderClock();
  renderScore();
  renderGame();
  updateGoalBtn();
  pauseGame();
});

document.addEventListener('game:started', () => {
  renderScore();
  renderClock();
  renderGame();
});

document.addEventListener('league-csv:imported', () => {
  renderTeamSetupRoster();
  renderGameDayCheckboxes();
});

document.addEventListener('profile:imported', () => {
  renderRoster();
  updateStartBtn();
});

document.addEventListener('game-review:loaded', e => {
  showGameReviewFromRecord(e.detail.gameRecord, e.detail.teamName);
});

document.getElementById('lineup-field-diagram').insertAdjacentHTML('afterbegin', FIELD_SVG);
document.getElementById('game-field-diagram').insertAdjacentHTML('afterbegin', FIELD_SVG);
applyTheme(localStorage.getItem('theme') || 'dark');
loadPhotos();
loadSettings();
loadGameHistory();
loadRoster();
renderTeamSetupRoster();
renderGameDayCheckboxes();
checkForActiveGame();

window.addEventListener('beforeunload', () => {
  if (state.players.length > 0) saveActiveGame();
});

document.getElementById('theme-btn').addEventListener('click', toggleTheme);
document.getElementById('overflow-menu-btn').addEventListener('click', toggleOverflowMenu);
document.getElementById('review-game-btn').addEventListener('click', () => {
  importGameReview();
  closeOverflowMenu();
});
document.getElementById('review-season-btn').addEventListener('click', () => {
  showSeasonSummary();
  closeOverflowMenu();
});
document.getElementById('team-settings-btn').addEventListener('click', () => {
  goToTeamSetup();
  closeOverflowMenu();
});
document.getElementById('about-btn').addEventListener('click', () => {
  openAboutModal();
  closeOverflowMenu();
});
document.getElementById('setup-empty-btn').addEventListener('click', goToTeamSetup);
document.getElementById('game-date-input').addEventListener('input', e => {
  state.gameDate = e.target.value;
});
document.getElementById('opponent-input').addEventListener('input', updateStartBtn);
document.getElementById('check-all-btn').addEventListener('click', checkAllPlayers);
document.getElementById('half-minus-btn').addEventListener('click', () => changeHalfMinutes(-1));
document.getElementById('half-plus-btn').addEventListener('click', () => changeHalfMinutes(1));
document.getElementById('start-btn').addEventListener('click', goToLineup);
document.getElementById('team-setup-back-btn').addEventListener('click', goBackFromTeamSetup);
document.getElementById('import-csv-btn').addEventListener('click', importLeagueCsv);
document.getElementById('restore-backup-btn').addEventListener('click', importProfile);
document.getElementById('backup-team-btn').addEventListener('click', () => exportProfile());
document.getElementById('team-name-input').addEventListener('input', onTeamNameInput);
document.getElementById('team-name-input').addEventListener('blur', saveTeamName);
document.getElementById('add-player-btn').addEventListener('click', addRosterPlayer);
document.getElementById('clear-data-btn').addEventListener('click', confirmClearData);
document.getElementById('clear-confirm-btn').addEventListener('click', executeClearData);
document.getElementById('clear-cancel-btn').addEventListener('click', closeClearDataModal);
document.getElementById('about-close-btn').addEventListener('click', () => closeModal('about-modal'));
document.getElementById('lineup-back-btn').addEventListener('click', goBackFromLineup);
document.getElementById('launch-btn').addEventListener('click', launchGame);
document.getElementById('goal-btn').addEventListener('click', openGoalModal);
document.getElementById('pause-btn').addEventListener('click', togglePause);
document.getElementById('action-btn').addEventListener('click', handleHalfEnd);
document.getElementById('sort-name-btn').addEventListener('click', () => setBenchSort('name'));
document.getElementById('sort-time-btn').addEventListener('click', () => setBenchSort('time'));
document.getElementById('sort-priority-btn').addEventListener('click', () => setBenchSort('priority'));
document.getElementById('late-arrival-btn').addEventListener('click', openLateModal);
document.getElementById('sub-now-btn').addEventListener('click', executeAllPlans);
document.getElementById('summary-export-btn').addEventListener('click', () => exportProfile(false, true));
document.getElementById('summary-home-btn').addEventListener('click', goToSetup);
document.getElementById('season-back-btn').addEventListener('click', goToSetup);
document.getElementById('season-sort-player').addEventListener('click', () => setSeasonSort('name'));
document.getElementById('season-sort-gp').addEventListener('click', () => setSeasonSort('games'));
document.getElementById('season-sort-goals').addEventListener('click', () => setSeasonSort('goals'));
document.getElementById('season-sort-time').addEventListener('click', () => setSeasonSort('seconds'));
document.getElementById('wheel-spin-btn').addEventListener('click', spinWheel);
document.getElementById('wheel-stop-btn').addEventListener('click', stopWheel);
document.getElementById('wheel-next-btn').addEventListener('click', nextGoaliePick);
document.getElementById('goalie-confirm-btn').addEventListener('click', confirmGoalies);
document.getElementById('gk-assign-btn').addEventListener('click', confirmGkFromSpin);
document.getElementById('wheel-spin-again-btn').addEventListener('click', spinAgain);
document.getElementById('wheel-cancel-btn').addEventListener('click', cancelGoalieSpin);
document.getElementById('remove-roster-confirm-btn').addEventListener('click', confirmRemoveRosterPlayer);
document.getElementById('remove-roster-cancel-btn').addEventListener('click', closeRemoveRosterModal);
document.getElementById('rename-confirm-btn').addEventListener('click', confirmRename);
document.getElementById('rename-cancel-btn').addEventListener('click', closeRenameModal);
document.getElementById('gk-picker-spin-btn').addEventListener('click', openGkSpin);
document.getElementById('gk-picker-skip-btn').addEventListener('click', skipGkPicker);
document.getElementById('late-cancel-btn').addEventListener('click', closeLateModal);
document.getElementById('remove-player-confirm-btn').addEventListener('click', confirmRemovePlayer);
document.getElementById('remove-player-cancel-btn').addEventListener('click', closeRemovePlayerModal);
document.getElementById('goal-us-btn').addEventListener('click', () => recordGoal('us'));
document.getElementById('goal-them-btn').addEventListener('click', () => recordGoal('them'));
document.getElementById('goal-no-scorer-btn').addEventListener('click', () => confirmGoal(null));
document.getElementById('their-score-minus-btn').addEventListener('click', () => adjustTheirScore(-1));
document.getElementById('their-score-plus-btn').addEventListener('click', () => adjustTheirScore(1));
document.getElementById('their-score-confirm-btn').addEventListener('click', confirmTheirScore);
document.getElementById('goal-cancel-btn').addEventListener('click', closeGoalModal);
document.getElementById('half-confirm-btn').addEventListener('click', confirmHalfAction);
document.getElementById('half-cancel-btn').addEventListener('click', closeHalfModal);
document.getElementById('half-end-early-btn').addEventListener('click', endGame);

document.getElementById('field-positions').addEventListener('click', e => {
  if (isFieldClickSuppressed()) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return;
  }
  const benchBtn = e.target.closest('.pos-bench-btn');
  if (benchBtn) {
    moveFieldPlayerToBench(parseInt(benchBtn.closest('[data-player-id]').dataset.playerId));
  }
}, true);

document.getElementById('field-positions').addEventListener('pointerdown', handleFieldSlotPointerDown);
window.addEventListener('pointermove', handleFieldSlotPointerMove, { passive: false });
window.addEventListener('pointerup', handleFieldSlotPointerUp);
window.addEventListener('pointercancel', handleFieldSlotPointerUp);

document.getElementById('lineup-screen').addEventListener('pointerdown', handleLineupPointerDown);
window.addEventListener('pointermove', handleLineupPointerMove, { passive: false });
window.addEventListener('pointerup', handleLineupPointerUp);
window.addEventListener('pointercancel', handleLineupPointerUp);

document.getElementById('bench-grid').addEventListener('click', e => {
  const removeBtn = e.target.closest('.btn-remove-player');
  if (removeBtn) {
    promptRemovePlayer(parseInt(removeBtn.closest('[data-player-id]').dataset.playerId));
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
