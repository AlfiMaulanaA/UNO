import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/lib/uno/engine.js';
import { processBotTurn, getBestColorForBot } from '../src/lib/uno/ai.js';
import { CARD_TYPES } from '../src/lib/uno/deck.js';

test('processBotTurn plays valid card or draws card', () => {
  const players = [
    { id: 'bot1', name: 'Bot Alice', isBot: true, botDifficulty: 'medium' },
    { id: 'p2', name: 'Human Bob', isBot: false }
  ];
  const game = createGame({ players });

  const initialHandLength = game.players[0].hand.length;
  const initialTurn = game.turnCount;

  const nextState = processBotTurn(game);

  // State should advance turn count
  assert.equal(nextState.turnCount, initialTurn + 1);
});

test('getBestColorForBot returns dominant color in hand', () => {
  const hand = [
    { color: 'red', type: CARD_TYPES.NUMBER, value: 1 },
    { color: 'red', type: CARD_TYPES.NUMBER, value: 3 },
    { color: 'blue', type: CARD_TYPES.NUMBER, value: 5 }
  ];

  const bestColor = getBestColorForBot(hand, 'hard');
  assert.equal(bestColor, 'red');
});
