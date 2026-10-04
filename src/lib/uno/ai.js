// ColorCards (UNO) Bot AI Engine

import { isCardPlayable, COLORS, CARD_TYPES } from './deck.js';
import { playCard, drawCard, callLastCard, passTurn, getNextPlayerIndex } from './engine.js';

/**
 * Decides and executes the best move for a bot player
 */
export function processBotTurn(state) {
  const currentBot = state.players[state.currentPlayerIndex];
  if (!currentBot || !currentBot.isBot || state.status !== 'playing') {
    return state;
  }

  let newState = { ...state };
  const difficulty = currentBot.botDifficulty || 'medium';
  const topDiscard = newState.discardPile[newState.discardPile.length - 1];

  // 1. Call LAST CARD if bot has 2 cards (or randomly for Easy)
  if (currentBot.hand.length === 2) {
    const shouldCall = difficulty === 'easy' ? Math.random() > 0.3 : true;
    if (shouldCall && !newState.calledLastCard[currentBot.id]) {
      newState = callLastCard(newState, currentBot.id);
    }
  }

  // 2. Find all playable cards
  const playableCards = currentBot.hand.filter(card =>
    isCardPlayable(card, topDiscard, newState.activeColor)
  );

  // If no playable cards, draw card
  if (playableCards.length === 0) {
    newState = drawCard(newState, currentBot.id);
    const updatedBot = newState.players[newState.currentPlayerIndex];

    // Check if drawn card can be played
    if (newState.pendingDrawnCard && updatedBot && updatedBot.id === currentBot.id) {
      const drawnCard = newState.pendingDrawnCard;
      const chosenColor = getBestColorForBot(updatedBot.hand, difficulty);
      newState = playCard(newState, currentBot.id, drawnCard.id, chosenColor);
    }
    return newState;
  }

  // Choose best card based on difficulty strategy
  const chosenMove = selectCardByDifficulty(playableCards, currentBot, newState, difficulty);
  const chosenColor = getBestColorForBot(currentBot.hand, difficulty);

  return playCard(newState, currentBot.id, chosenMove.id, chosenColor);
}

/**
 * Selects card based on difficulty level
 */
function selectCardByDifficulty(playableCards, botPlayer, state, difficulty) {
  if (difficulty === 'easy') {
    // Pick random valid card
    return playableCards[Math.floor(Math.random() * playableCards.length)];
  }

  const nextPlayerIdx = getNextPlayerIndex(state.currentPlayerIndex, state.players.length, state.direction, 1);
  const nextPlayer = state.players[nextPlayerIdx];

  // Hard Difficulty: Attack next player if they are low on cards!
  if (difficulty === 'hard' && nextPlayer && nextPlayer.cardCount <= 2) {
    // Prioritize +4, +2, Skip, Reverse
    const attackCard = playableCards.find(c =>
      c.type === CARD_TYPES.WILD4 ||
      c.type === CARD_TYPES.DRAW2 ||
      c.type === CARD_TYPES.SKIP ||
      c.type === CARD_TYPES.REVERSE
    );
    if (attackCard) return attackCard;
  }

  // Medium & Hard: Count colors in bot's hand
  const colorCounts = getColorDistribution(botPlayer.hand);

  // Non-wild cards matching dominant color
  const nonWildPlayable = playableCards.filter(c => c.color !== 'wild');

  if (nonWildPlayable.length > 0) {
    // Sort by color count descending
    nonWildPlayable.sort((a, b) => (colorCounts[b.color] || 0) - (colorCounts[a.color] || 0));
    return nonWildPlayable[0];
  }

  // If only wild cards left, return first wild
  return playableCards[0];
}

/**
 * Finds the color the bot holds the most of in its hand
 */
export function getBestColorForBot(hand, difficulty = 'medium') {
  if (difficulty === 'easy') {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  const counts = getColorDistribution(hand);
  let maxColor = COLORS[0];
  let maxCount = -1;

  COLORS.forEach(color => {
    const c = counts[color] || 0;
    if (c > maxCount) {
      maxCount = c;
      maxColor = color;
    }
  });

  return maxColor;
}

function getColorDistribution(hand) {
  const counts = { red: 0, blue: 0, green: 0, yellow: 0 };
  hand.forEach(c => {
    if (c.color !== 'wild' && counts[c.color] !== undefined) {
      counts[c.color]++;
    }
  });
  return counts;
}
