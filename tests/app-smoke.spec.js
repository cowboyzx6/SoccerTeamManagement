// @ts-check
import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__STM_DISABLE_SW__ = true;
  });

  page.on('pageerror', error => {
    throw error;
  });

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('team setup opens and roster can be added', async ({ page }) => {
  await page.getByRole('button', { name: /Set Up My Team/i }).click();

  await expect(page.locator('#team-setup-screen')).toHaveClass(/active/);

  await page.locator('#team-name-input').fill('Oyster Blueberries');
  await page.locator('#new-player-input').fill('Avery');
  await page.locator('#add-player-btn').click();

  await expect(page.locator('#roster-list')).toContainText('Avery');
  await expect(page.locator('#app-title-name')).toHaveText('Oyster Blueberries');
});

test('attendance can reach lineup screen', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('soccerRoster', JSON.stringify([{ id: 1, name: 'Avery' }]));
    localStorage.setItem('soccerSettings', JSON.stringify({ teamName: 'Oyster Blueberries', halfMinutes: 25 }));
  });

  await page.reload();
  await page.locator('#opponent-input').fill('Blue Team');
  await page.locator('#tile-1').click();
  await page.locator('#start-btn').click();

  await expect(page.locator('#gk-picker-modal')).not.toHaveClass(/hidden/);
  await page.locator('#gk-picker-skip-btn').click();

  await expect(page.locator('#lineup-screen')).toHaveClass(/active/);
  await expect(page.locator('#lineup-header-title')).toContainText('Oyster Blueberries');
});

test('restore backup normalizes profile data and clears stale photos', async ({ page }, testInfo) => {
  const profilePath = testInfo.outputPath('restore-profile.json');
  await fs.writeFile(profilePath, JSON.stringify({
    teamName: ' Restored Team ',
    halfMinutes: '30',
    roster: [
      { id: '1', name: ' Avery ' },
      { id: '1', name: 'Duplicate Avery' },
      { id: 'bad', name: 'Invalid' },
    ],
    games: [{
      date: '2026-05-09',
      opponent: ' Blue Team ',
      ourScore: '2',
      theirScore: '1',
      goals: [{ team: 'us', scorer: 'Avery', scorerId: '1', half: 'bad' }],
      playerStats: [{
        id: '1',
        name: 'Avery',
        secondsPlayed: '600',
        firstHalfSeconds: '300',
        secondHalfSeconds: '300',
        positionSeconds: { GK: '120', BAD: '999' },
      }],
    }],
  }), 'utf8');

  await page.evaluate(() => {
    localStorage.setItem('playerPhotos', JSON.stringify({ 1: 'data:image/png;base64,OLDPHOTO' }));
  });

  await page.setInputFiles('#import-file-input', profilePath);

  await expect(page.locator('#app-title-name')).toHaveText('Restored Team');
  await expect(page.locator('#half-minutes-display')).toHaveText('30 min');
  await expect(page.locator('#roster-list')).toContainText('Avery');
  await expect(page.locator('#roster-list')).not.toContainText('Duplicate Avery');

  const stored = await page.evaluate(() => ({
    roster: JSON.parse(localStorage.getItem('soccerRoster') || '[]'),
    settings: JSON.parse(localStorage.getItem('soccerSettings') || '{}'),
    history: JSON.parse(localStorage.getItem('soccerGameHistory') || '[]'),
    photos: localStorage.getItem('playerPhotos'),
  }));

  expect(stored.roster).toEqual([{ id: 1, name: 'Avery' }]);
  expect(stored.settings).toEqual({ teamName: 'Restored Team', halfMinutes: 30 });
  expect(stored.history[0].playerStats[0].positionSeconds).toEqual({ GK: 120 });
  expect(stored.history[0].goals[0].scorerId).toBe(1);
  expect(stored.photos).toBeNull();
});

test('review game import validates and renders normalized game data', async ({ page }, testInfo) => {
  const reviewPath = testInfo.outputPath('review-game.json');
  await fs.writeFile(reviewPath, JSON.stringify({
    teamName: 'Review Team',
    games: [{
      date: '2026-05-09',
      opponent: 'Blue Team',
      ourScore: '2',
      theirScore: '1',
      goals: [{ team: 'us', scorer: 'Avery', scorerId: '1', half: 1 }],
      playerStats: [{
        id: '1',
        name: 'Avery',
        secondsPlayed: '600',
        firstHalfSeconds: '300',
        secondHalfSeconds: '300',
        positionSeconds: { GK: '120' },
      }],
    }],
  }), 'utf8');

  await page.setInputFiles('#review-file-input', reviewPath);

  await expect(page.locator('#summary-screen')).toHaveClass(/active/);
  await expect(page.locator('#summary-team-name')).toHaveText('Review Team');
  await expect(page.locator('#summary-vs-line')).toContainText('vs Blue Team');
  await expect(page.locator('#summary-vs-line')).toContainText('2');
  await expect(page.locator('#summary-vs-line')).toContainText('1');
  await expect(page.locator('#summary-body')).toContainText('Avery');
  await expect(page.locator('#summary-body')).toContainText('GK');
  await expect(page.locator('#summary-export-btn')).toBeHidden();
});
