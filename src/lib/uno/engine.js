// ColorCards (UNO) Core Game Engine

import { createDeck, shuffleDeck, isCardPlayable, CARD_TYPES, DECK_CONFIG, COLORS } from './deck.js';

export const GAME_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished'
};

export const DIRECTION = {
  CLOCKWISE: 1,
  COUNTER_CLOCKWISE: -1
};

export const DEFAULT_SETTINGS = {
  allowStacking: false,
  allowMultiCardPlay: true,
  enableLastCardPenalty: true,
  turnTimerSec: 30,
  botDifficulty: 'medium',
  initialHandSize: DECK_CONFIG.INITIAL_HAND_SIZE,
  lastCardPenaltyAmount: DECK_CONFIG.LAST_CARD_PENALTY_CARDS,
  draw2PenaltyAmount: DECK_CONFIG.DRAW2_PENALTY_CARDS,
  wild4PenaltyAmount: DECK_CONFIG.WILD4_PENALTY_CARDS,
  defaultWildColor: COLORS[0] // 'red'
};

export const AVATAR_LIST = ['🐼', '🦊', '🐸', '🐯', '🐧', '🤖'];

/**
 * Creates a brand new UNO / ColorCards game state
 */
export function createGame({ players = [], settings = {} } = {}) {
  const finalSettings = { ...DEFAULT_SETTINGS, ...settings };
  let rawDeck = shuffleDeck(createDeck(DECK_CONFIG));

  // Deal initialHandSize cards per player
  const initializedPlayers = players.map((p, idx) => ({
    id: p.id || `p_${idx + 1}`,
    name: p.name || `Pemain ${idx + 1}`,
    avatar: p.avatar || AVATAR_LIST[idx % AVATAR_LIST.length],
    isBot: Boolean(p.isBot),
    botDifficulty: p.botDifficulty || finalSettings.botDifficulty,
    hand: [],
    cardCount: finalSettings.initialHandSize
  }));

  initializedPlayers.forEach(p => {
    p.hand = rawDeck.splice(0, finalSettings.initialHandSize);
    p.cardCount = p.hand.length;
  });

  // Find a valid starting top discard card (preferably not Wild / Wild4)
  let topDiscardIdx = rawDeck.findIndex(c => c.color !== 'wild');
  if (topDiscardIdx === -1) topDiscardIdx = 0;
  const [topDiscard] = rawDeck.splice(topDiscardIdx, 1);

  const activeColor = topDiscard.color === 'wild' ? finalSettings.defaultWildColor : topDiscard.color;

  return {
    id: `game_${Date.now()}`,
    status: GAME_STATUS.PLAYING,
    players: initializedPlayers,
    currentPlayerIndex: 0,
    direction: DIRECTION.CLOCKWISE,
    drawPile: rawDeck,
    discardPile: [topDiscard],
    activeColor,
    winnerId: null,
    calledLastCard: {}, // playerId -> boolean
    lastActionLog: 'Permainan dimulai! Selamat bermain ColorCards.',
    pendingDrawnCard: null, // Card drawn by player on current turn if unplayable
    settings: finalSettings,
    turnCount: 1,
    gameVersion: 1
  };
}

/**
 * Calculates next player index based on current index, direction, and step count
 */
export function getNextPlayerIndex(currentIndex, totalPlayers, direction = DIRECTION.CLOCKWISE, steps = 1) {
  let next = (currentIndex + (direction * steps)) % totalPlayers;
  if (next < 0) {
    next += totalPlayers;
  }
  return next;
}

/**
 * Reshuffles discard pile back into draw pile when draw pile is low
 */
export function reshuffleDiscardPile(state) {
  const minThreshold = 3;
  if (state.drawPile.length > minThreshold) return state;

  const discardCopy = [...state.discardPile];
  const topCard = discardCopy.pop(); // Keep the current top card

  const reshuffled = shuffleDeck(discardCopy);
  return {
    ...state,
    drawPile: [...state.drawPile, ...reshuffled],
    discardPile: [topCard]
  };
}

/**
 * Player calls "LAST CARD!" before or right as they play down to 1 card
 */
export function callLastCard(state, playerId) {
  return {
    ...state,
    calledLastCard: {
      ...state.calledLastCard,
      [playerId]: true
    },
    lastActionLog: `${getPlayerName(state, playerId)} berseru: "LAST CARD! 🔥"`
  };
}

/**
 * Attempts to play a single card from player's hand
 */
export function playCard(state, playerId, cardId, chosenColor = null) {
  return playMultipleCards(state, playerId, [cardId], chosenColor);
}

/**
 * Attempts to play MULTIPLE cards at once if they share the same value or action type!
 */
export function playMultipleCards(state, playerId, cardIds = [], chosenColor = null) {
  if (state.status !== GAME_STATUS.PLAYING) {
    throw new Error("Permainan belum dimulai atau sudah selesai.");
  }

  if (!cardIds || cardIds.length === 0) {
    throw new Error("Pilih minimal 1 kartu untuk dimainkan.");
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.id !== playerId) {
    throw new Error("Bukan giliran Anda.");
  }

  // Find target cards in player hand
  const cardsToPlay = [];
  cardIds.forEach(id => {
    const found = currentPlayer.hand.find(c => c.id === id);
    if (!found) throw new Error("Kartu tidak ditemukan di tangan Anda.");
    cardsToPlay.push(found);
  });

  // Verify all cards share the same value (for numbers) or same action type (for actions)
  const firstCard = cardsToPlay[0];
  const allSameValue = cardsToPlay.every(c => {
    if (firstCard.type === CARD_TYPES.NUMBER && c.type === CARD_TYPES.NUMBER) {
      return c.value === firstCard.value;
    }
    return c.type === firstCard.type;
  });

  if (!allSameValue) {
    throw new Error("Multi-card combo harus memiliki angka atau tipe kartu yang sama!");
  }

  // First card must be valid against current top discard and active color
  const topDiscard = state.discardPile[state.discardPile.length - 1];
  if (!isCardPlayable(firstCard, topDiscard, state.activeColor)) {
    throw new Error("Kartu pertama tidak valid dimainkan terhadap kartu terbuka saat ini.");
  }

  // Create state clone & reshuffle if needed
  let newState = { ...state };
  newState = reshuffleDiscardPile(newState);

  // Remove cards from hand
  const newHand = currentPlayer.hand.filter(c => !cardIds.includes(c.id));

  // Handle LAST CARD Penalty if enableLastCardPenalty is true
  let penaltyCards = [];
  const triggerHandSizeThreshold = 2; // When player moves to 1 card
  const isTargetOneCardLeft = newHand.length === 1;
  const hadMoreThanOneBefore = currentPlayer.hand.length >= triggerHandSizeThreshold;
  const calledLast = newState.calledLastCard[playerId];

  if (newState.settings.enableLastCardPenalty && isTargetOneCardLeft && hadMoreThanOneBefore && !calledLast) {
    const penaltyAmount = newState.settings.lastCardPenaltyAmount || DECK_CONFIG.LAST_CARD_PENALTY_CARDS;
    for (let i = 0; i < penaltyAmount; i++) {
      if (newState.drawPile.length > 0) {
        penaltyCards.push(newState.drawPile.shift());
      }
    }
  }

  const finalHand = [...newHand, ...penaltyCards];

  // Update current player
  newState.players = newState.players.map((p, idx) => {
    if (idx === newState.currentPlayerIndex) {
      return {
        ...p,
        hand: finalHand,
        cardCount: finalHand.length
      };
    }
    return p;
  });

  // Push cards to discard pile
  newState.discardPile = [...newState.discardPile, ...cardsToPlay];
  newState.pendingDrawnCard = null;

  // Last card played determines active color
  const lastPlayedCard = cardsToPlay[cardsToPlay.length - 1];
  if (lastPlayedCard.color === 'wild') {
    newState.activeColor = chosenColor || newState.settings.defaultWildColor;
  } else {
    newState.activeColor = lastPlayedCard.color;
  }

  // Check victory
  if (finalHand.length === 0) {
    newState.status = GAME_STATUS.FINISHED;
    newState.winnerId = playerId;
    newState.lastActionLog = `🎉 ${currentPlayer.name} memenangkan permainan!`;
    newState.gameVersion += 1;
    return newState;
  }

  // Calculate action card effects & skip steps
  let stepsToNext = 1;
  let logText = cardsToPlay.length > 1
    ? `${currentPlayer.name} memainkan COMBO ${cardsToPlay.length}x kartu ${formatCardName(firstCard)}!`
    : `${currentPlayer.name} memainkan kartu ${formatCardName(firstCard)}.`;

  if (penaltyCards.length > 0) {
    logText += ` (Penalti: Lupa seru LAST CARD! +${penaltyCards.length} kartu)`;
  }

  // Action multipliers
  const comboCount = cardsToPlay.length;

  if (firstCard.type === CARD_TYPES.SKIP) {
    stepsToNext = 1 + comboCount;
    logText += ` ${comboCount} pemain berikutnya dilewati (SKIP x${comboCount})!`;
  } else if (firstCard.type === CARD_TYPES.REVERSE) {
    if (newState.players.length === 2) {
      stepsToNext = 1 + comboCount;
      logText += ` Arah dibalik (SKIP x${comboCount} di 2 pemain)!`;
    } else {
      // If odd number of reverse played, flip direction. If even, stays same.
      if (comboCount % 2 === 1) {
        newState.direction = newState.direction === DIRECTION.CLOCKWISE 
          ? DIRECTION.COUNTER_CLOCKWISE 
          : DIRECTION.CLOCKWISE;
      }
      logText += ` Arah permainan dibalik (REVERSE x${comboCount})!`;
    }
  } else if (firstCard.type === CARD_TYPES.DRAW2) {
    stepsToNext = 2;
    const victimIndex = getNextPlayerIndex(newState.currentPlayerIndex, newState.players.length, newState.direction, 1);
    const victim = newState.players[victimIndex];
    const totalDraw = (newState.settings.draw2PenaltyAmount || DECK_CONFIG.DRAW2_PENALTY_CARDS) * comboCount;
    const drawn = [];
    for (let i = 0; i < totalDraw; i++) {
      if (newState.drawPile.length > 0) drawn.push(newState.drawPile.shift());
    }
    newState.players = newState.players.map((p, idx) => {
      if (idx === victimIndex) {
        const h = [...p.hand, ...drawn];
        return { ...p, hand: h, cardCount: h.length };
      }
      return p;
    });
    logText += ` ${victim.name} mengambil ${totalDraw} kartu (+${totalDraw}) & dilewati!`;
  } else if (firstCard.type === CARD_TYPES.WILD) {
    logText += ` Mengubah warna menjadi ${colorLabel(newState.activeColor)}.`;
  } else if (firstCard.type === CARD_TYPES.WILD4) {
    stepsToNext = 2;
    const victimIndex = getNextPlayerIndex(newState.currentPlayerIndex, newState.players.length, newState.direction, 1);
    const victim = newState.players[victimIndex];
    const totalDraw = (newState.settings.wild4PenaltyAmount || DECK_CONFIG.WILD4_PENALTY_CARDS) * comboCount;
    const drawn = [];
    for (let i = 0; i < totalDraw; i++) {
      if (newState.drawPile.length > 0) drawn.push(newState.drawPile.shift());
    }
    newState.players = newState.players.map((p, idx) => {
      if (idx === victimIndex) {
        const h = [...p.hand, ...drawn];
        return { ...p, hand: h, cardCount: h.length };
      }
      return p;
    });
    logText += ` Warna diganti ke ${colorLabel(newState.activeColor)} & ${victim.name} mengambil ${totalDraw} kartu (+${totalDraw})!`;
  }

  // Reset calledLastCard status for current player
  newState.calledLastCard = {
    ...newState.calledLastCard,
    [playerId]: false
  };

  newState.currentPlayerIndex = getNextPlayerIndex(newState.currentPlayerIndex, newState.players.length, newState.direction, stepsToNext);
  newState.lastActionLog = logText;
  newState.turnCount += 1;
  newState.gameVersion += 1;

  return newState;
}

/**
 * Player draws a card from the deck on their turn
 */
export function drawCard(state, playerId) {
  if (state.status !== GAME_STATUS.PLAYING) {
    throw new Error("Permainan tidak aktif.");
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.id !== playerId) {
    throw new Error("Bukan giliran Anda.");
  }

  let newState = reshuffleDiscardPile({ ...state });
  if (newState.drawPile.length === 0) {
    throw new Error("Tumpukan kartu habis.");
  }

  const drawnCard = newState.drawPile.shift();
  const topDiscard = newState.discardPile[newState.discardPile.length - 1];
  const canPlayDrawn = isCardPlayable(drawnCard, topDiscard, newState.activeColor);

  const updatedHand = [...currentPlayer.hand, drawnCard];
  newState.players = newState.players.map((p, idx) => {
    if (idx === newState.currentPlayerIndex) {
      return {
        ...p,
        hand: updatedHand,
        cardCount: updatedHand.length
      };
    }
    return p;
  });

  if (canPlayDrawn) {
    newState.lastActionLog = `${currentPlayer.name} mengambil 1 kartu (${formatCardName(drawnCard)} - dapat dimainkan!).`;
    newState.pendingDrawnCard = drawnCard;
  } else {
    newState.lastActionLog = `${currentPlayer.name} mengambil 1 kartu. Giliran berganti.`;
    newState.pendingDrawnCard = null;
    newState.currentPlayerIndex = getNextPlayerIndex(newState.currentPlayerIndex, newState.players.length, newState.direction, 1);
  }

  newState.turnCount += 1;
  newState.gameVersion += 1;

  return newState;
}

/**
 * Passes turn after drawing an unplayable card or deciding not to play drawn card
 */
export function passTurn(state, playerId) {
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.id !== playerId) {
    throw new Error("Bukan giliran Anda.");
  }

  let newState = { ...state };
  newState.pendingDrawnCard = null;
  newState.currentPlayerIndex = getNextPlayerIndex(newState.currentPlayerIndex, newState.players.length, newState.direction, 1);
  newState.lastActionLog = `${currentPlayer.name} melewati giliran.`;
  newState.turnCount += 1;
  newState.gameVersion += 1;
  return newState;
}

// Helpers
function getPlayerName(state, playerId) {
  const p = state.players.find(player => player.id === playerId);
  return p ? p.name : 'Pemain';
}

function colorLabel(col) {
  const map = { red: 'Merah', blue: 'Biru', green: 'Hijau', yellow: 'Kuning' };
  return map[col] || col;
}

function formatCardName(card) {
  if (card.type === CARD_TYPES.WILD) return 'WILD';
  if (card.type === CARD_TYPES.WILD4) return 'WILD +4';
  if (card.type === CARD_TYPES.DRAW2) return `${colorLabel(card.color)} +2`;
  if (card.type === CARD_TYPES.SKIP) return `${colorLabel(card.color)} SKIP`;
  if (card.type === CARD_TYPES.REVERSE) return `${colorLabel(card.color)} REVERSE`;
  return `${colorLabel(card.color)} ${card.value}`;
}
