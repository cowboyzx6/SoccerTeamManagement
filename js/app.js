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
  openRenameModal,
  renderGameDayCheckboxes,
  renderRoster,
  renderTeamSetupRoster,
  removeRosterPlayer,
  togglePlayerTile,
  triggerPhotoUpload,
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
  pickGk,
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

function saveTeamName() {
  state.teamName = document.getElementById('team-name-input').value.trim() || 'My Team';
  document.getElementById('app-title-name').textContent = state.teamName;
  saveSettings();
}

// Transitional bridge: inline HTML handlers cannot see module-scoped functions.
// Remove this as handlers move to addEventListener wiring.
Object.assign(window, {
  state,
  addRosterPlayer,
  adjustTheirScore,
  cancelGoalieSpin,
  changeHalfMinutes,
  checkAllPlayers,
  closeClearDataModal,
  closeGoalModal,
  closeHalfModal,
  closeLateModal,
  closeModal,
  closeOverflowMenu,
  closeRemovePlayerModal,
  closeRemoveRosterModal,
  closeRenameModal,
  confirmClearData,
  confirmGkFromSpin,
  confirmGoal,
  confirmGoalies,
  confirmHalfAction,
  confirmRemovePlayer,
  confirmRemoveRosterPlayer,
  confirmRename,
  confirmTheirScore,
  endGame,
  executeAllPlans,
  executeClearData,
  exportProfile,
  goBackFromLineup,
  goBackFromTeamSetup,
  goToLineup,
  goToSetup,
  goToTeamSetup,
  handleHalfEnd,
  importGameReview,
  importLeagueCsv,
  importProfile,
  launchGame,
  nextGoaliePick,
  onTeamNameInput,
  openAboutModal,
  openGkSpin,
  openGoalModal,
  openLateModal,
  openRenameModal,
  pickGk,
  recordGoal,
  renderClock,
  renderGame,
  renderGameDayCheckboxes,
  renderRoster,
  renderScore,
  renderTeamSetupRoster,
  removeRosterPlayer,
  saveTeamName,
  setBenchSort,
  setSeasonSort,
  showGameReviewFromRecord,
  showSeasonSummary,
  skipGkPicker,
  spinAgain,
  spinWheel,
  stopWheel,
  syncGamePhaseUi,
  toggleOverflowMenu,
  togglePause,
  togglePlayerTile,
  toggleTheme,
  triggerPhotoUpload,
  updateGoalBtn,
  updateStartBtn,
});

document.getElementById('lineup-field-diagram').insertAdjacentHTML('afterbegin', FIELD_SVG);
document.getElementById('game-field-diagram').insertAdjacentHTML('afterbegin', FIELD_SVG);
applyTheme(localStorage.getItem('theme') || 'dark');
loadPhotos();
loadSettings();
loadGameHistory();
loadRoster();
checkForActiveGame();

window.addEventListener('beforeunload', () => {
  if (state.players.length > 0) saveActiveGame();
});

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
