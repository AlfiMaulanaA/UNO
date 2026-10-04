import test from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultStats, getDefaultPrefs } from '../src/lib/uno/storage.js';

test('getDefaultStats returns expected structure', () => {
  const stats = getDefaultStats();
  assert.equal(stats.gamesPlayed, 0);
  assert.equal(stats.wins, 0);
  assert.equal(stats.losses, 0);
  assert.equal(stats.winRate, 0);
});

test('getDefaultPrefs returns expected structure', () => {
  const prefs = getDefaultPrefs();
  assert.equal(typeof prefs.playerName, 'string');
  assert.equal(typeof prefs.soundEnabled, 'boolean');
});
