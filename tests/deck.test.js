import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck, shuffleDeck, isCardPlayable, CARD_TYPES } from '../src/lib/uno/deck.js';

test('createDeck creates 108 cards', () => {
  const deck = createDeck();
  assert.equal(deck.length, 108);

  const wildCount = deck.filter(c => c.type === CARD_TYPES.WILD).length;
  const wild4Count = deck.filter(c => c.type === CARD_TYPES.WILD4).length;
  assert.equal(wildCount, 4);
  assert.equal(wild4Count, 4);
});

test('shuffleDeck preserves all cards', () => {
  const deck = createDeck();
  const shuffled = shuffleDeck(deck);
  assert.equal(shuffled.length, 108);
  assert.notDeepEqual(deck, shuffled);
});

test('isCardPlayable validates matching color, number, action and wild cards', () => {
  const topRed5 = { color: 'red', type: CARD_TYPES.NUMBER, value: 5 };

  // Match by color
  assert.equal(isCardPlayable({ color: 'red', type: CARD_TYPES.NUMBER, value: 2 }, topRed5), true);

  // Match by number
  assert.equal(isCardPlayable({ color: 'blue', type: CARD_TYPES.NUMBER, value: 5 }, topRed5), true);

  // Non-matching
  assert.equal(isCardPlayable({ color: 'blue', type: CARD_TYPES.NUMBER, value: 9 }, topRed5), false);

  // Wild card
  assert.equal(isCardPlayable({ color: 'wild', type: CARD_TYPES.WILD }, topRed5), true);
  assert.equal(isCardPlayable({ color: 'wild', type: CARD_TYPES.WILD4 }, topRed5), true);
});
