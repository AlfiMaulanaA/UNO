// ColorCards (UNO) Deck & Helper Functions

export const COLORS = ['red', 'blue', 'green', 'yellow'];

export const COLOR_SYMBOLS = {
  red: '●',
  blue: '◆',
  green: '▲',
  yellow: '★',
  wild: '🌈'
};

export const COLOR_LABELS = {
  red: 'Merah',
  blue: 'Biru',
  green: 'Hijau',
  yellow: 'Kuning'
};

export const CARD_TYPES = {
  NUMBER: 'number',
  SKIP: 'skip',
  REVERSE: 'reverse',
  DRAW2: 'draw2',
  WILD: 'wild',
  WILD4: 'wild4'
};

// Configurable Deck & Rule Constants
export const DECK_CONFIG = {
  INITIAL_HAND_SIZE: 7,
  WILD_COUNT: 4,
  WILD4_COUNT: 4,
  NUMBER_CARDS_RANGE: { MIN: 0, MAX: 9 },
  COPIES_PER_NUMBER: 2,
  COPIES_FOR_ZERO: 1,
  ACTION_CARDS_PER_COLOR: 2,
  DRAW2_PENALTY_CARDS: 2,
  WILD4_PENALTY_CARDS: 4,
  LAST_CARD_PENALTY_CARDS: 2
};

/**
 * Generates a full standard 108-card deck for ColorCards dynamically using configuration
 */
export function createDeck(config = DECK_CONFIG) {
  const deck = [];
  let idCounter = 1;

  COLORS.forEach((color) => {
    // Zero card(s) per color
    for (let z = 0; z < config.COPIES_FOR_ZERO; z++) {
      deck.push({
        id: `card_${idCounter++}`,
        color,
        type: CARD_TYPES.NUMBER,
        value: 0
      });
    }

    // Number cards MIN+1 to MAX
    for (let num = config.NUMBER_CARDS_RANGE.MIN + 1; num <= config.NUMBER_CARDS_RANGE.MAX; num++) {
      for (let c = 0; c < config.COPIES_PER_NUMBER; c++) {
        deck.push({
          id: `card_${idCounter++}`,
          color,
          type: CARD_TYPES.NUMBER,
          value: num
        });
      }
    }

    // Action cards per color (Skip, Reverse, Draw Two)
    [CARD_TYPES.SKIP, CARD_TYPES.REVERSE, CARD_TYPES.DRAW2].forEach((actionType) => {
      for (let a = 0; a < config.ACTION_CARDS_PER_COLOR; a++) {
        deck.push({
          id: `card_${idCounter++}`,
          color,
          type: actionType
        });
      }
    });
  });

  // Wild cards
  for (let i = 0; i < config.WILD_COUNT; i++) {
    deck.push({
      id: `card_${idCounter++}`,
      color: 'wild',
      type: CARD_TYPES.WILD
    });
  }

  // Wild Draw Four (+4) cards
  for (let i = 0; i < config.WILD4_COUNT; i++) {
    deck.push({
      id: `card_${idCounter++}`,
      color: 'wild',
      type: CARD_TYPES.WILD4
    });
  }

  return deck;
}

/**
 * Cryptographically secure Fisher-Yates shuffle
 */
export function shuffleDeck(deckToShuffle) {
  const deck = [...deckToShuffle];
  for (let i = deck.length - 1; i > 0; i--) {
    let j;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randomBuffer = new Uint32Array(1);
      crypto.getRandomValues(randomBuffer);
      j = randomBuffer[0] % (i + 1);
    } else {
      j = Math.floor(Math.random() * (i + 1));
    }
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Checks if a card is playable against the top discard card and active color
 */
export function isCardPlayable(card, topDiscard, activeColor) {
  if (!card || !topDiscard) return false;

  // Wild cards can always be played
  if (card.color === 'wild' || card.type === CARD_TYPES.WILD || card.type === CARD_TYPES.WILD4) {
    return true;
  }

  const currentEffectiveColor = activeColor || topDiscard.color;

  // Match by color
  if (card.color === currentEffectiveColor) {
    return true;
  }

  // Match by number value if both are number cards
  if (card.type === CARD_TYPES.NUMBER && topDiscard.type === CARD_TYPES.NUMBER && card.value === topDiscard.value) {
    return true;
  }

  // Match by action type (e.g. Skip on Skip, Reverse on Reverse, Draw2 on Draw2)
  if (card.type !== CARD_TYPES.NUMBER && card.type === topDiscard.type) {
    return true;
  }

  return false;
}
