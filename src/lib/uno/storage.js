// ColorCards (UNO) Storage & Stats Helper

const STATS_KEY = 'colorcards_user_stats';
const PREFS_KEY = 'colorcards_user_prefs';

export function getStoredStats() {
  if (typeof window === 'undefined') return getDefaultStats();
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? { ...getDefaultStats(), ...JSON.parse(data) } : getDefaultStats();
  } catch (err) {
    return getDefaultStats();
  }
}

export function saveStats(stats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {}
}

export function recordGameResult(isWin, cardsPlayedCount = 0) {
  const current = getStoredStats();
  const updated = {
    ...current,
    gamesPlayed: current.gamesPlayed + 1,
    wins: current.wins + (isWin ? 1 : 0),
    losses: current.losses + (isWin ? 0 : 1),
    cardsPlayed: current.cardsPlayed + cardsPlayedCount,
    winRate: Math.round(((current.wins + (isWin ? 1 : 0)) / (current.gamesPlayed + 1)) * 100)
  };
  saveStats(updated);
  return updated;
}

export function getDefaultStats() {
  return {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    cardsPlayed: 0,
    winRate: 0
  };
}

export function getStoredPrefs() {
  if (typeof window === 'undefined') return getDefaultPrefs();
  try {
    const data = localStorage.getItem(PREFS_KEY);
    return data ? { ...getDefaultPrefs(), ...JSON.parse(data) } : getDefaultPrefs();
  } catch (err) {
    return getDefaultPrefs();
  }
}

export function savePrefs(prefs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (err) {}
}

export function getDefaultPrefs() {
  return {
    playerName: 'Guest Player',
    soundEnabled: true,
    colorBlindMode: true
  };
}
