import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, playCard, playMultipleCards, drawCard, callLastCard, GAME_STATUS, DIRECTION } from '../src/lib/uno/engine.js';
import { CARD_TYPES } from '../src/lib/uno/deck.js';

test('createGame initializes game with 7 cards per player', () => {
  const players = [{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }];
  const game = createGame({ players });

  assert.equal(game.players.length, 2);
  assert.equal(game.players[0].hand.length, 7);
  assert.equal(game.players[1].hand.length, 7);
  assert.equal(game.discardPile.length, 1);
  assert.equal(game.status, GAME_STATUS.PLAYING);
});

test('playCard removes card and advances turn', () => {
  const players = [{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }];
  const game = createGame({ players });

  const currentPlayer = game.players[0];

  // Force a playable card into player hand for reliable test
  const testCard = { id: 'test_card_1', color: game.activeColor, type: CARD_TYPES.NUMBER, value: 3 };
  currentPlayer.hand[0] = testCard;

  const nextState = playCard(game, 'p1', testCard.id);

  assert.equal(nextState.players[0].hand.length, 6);
  assert.equal(nextState.currentPlayerIndex, 1);
  assert.equal(nextState.discardPile[nextState.discardPile.length - 1].id, testCard.id);
});

test('playMultipleCards plays combo of matching number cards at once', () => {
  const players = [{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }];
  const game = createGame({ players });

  const p1 = game.players[0];
  const card1 = { id: 'multi_1', color: game.activeColor, type: CARD_TYPES.NUMBER, value: 7 };
  const card2 = { id: 'multi_2', color: 'blue', type: CARD_TYPES.NUMBER, value: 7 };

  p1.hand[0] = card1;
  p1.hand[1] = card2;

  const nextState = playMultipleCards(game, 'p1', ['multi_1', 'multi_2']);

  // Played 2 cards, hand length decreases by 2
  assert.equal(nextState.players[0].hand.length, 5);
  // Last card played (blue 7) determines new active color
  assert.equal(nextState.activeColor, 'blue');
  assert.equal(nextState.currentPlayerIndex, 1);
});

test('playCard Skip card advances turn by 2 steps', () => {
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
    { id: 'p3', name: 'Charlie' }
  ];
  const game = createGame({ players });

  const skipCard = { id: 'skip_card', color: game.activeColor, type: CARD_TYPES.SKIP };
  game.players[0].hand[0] = skipCard;

  const nextState = playCard(game, 'p1', skipCard.id);
  // Skipped p2, turn moves to p3 (index 2)
  assert.equal(nextState.currentPlayerIndex, 2);
});

test('playCard Reverse card flips play direction', () => {
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
    { id: 'p3', name: 'Charlie' }
  ];
  const game = createGame({ players });

  const revCard = { id: 'rev_card', color: game.activeColor, type: CARD_TYPES.REVERSE };
  game.players[0].hand[0] = revCard;

  const nextState = playCard(game, 'p1', revCard.id);
  assert.equal(nextState.direction, DIRECTION.COUNTER_CLOCKWISE);
  // From 0 with counter-clockwise 1 step -> index 2 (Charlie)
  assert.equal(nextState.currentPlayerIndex, 2);
});

test('playCard Draw Two (+2) forces next player to draw 2 cards and skips turn', () => {
  const players = [{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }];
  const game = createGame({ players });

  const draw2Card = { id: 'draw2_card', color: game.activeColor, type: CARD_TYPES.DRAW2 };
  game.players[0].hand[0] = draw2Card;

  const p2InitialHandLength = game.players[1].hand.length;

  const nextState = playCard(game, 'p1', draw2Card.id);

  // Bob should have drawn 2 extra cards (7 + 2 = 9 cards)
  assert.equal(nextState.players[1].hand.length, p2InitialHandLength + 2);
  // Skipped Bob, turn comes back to Alice (index 0)
  assert.equal(nextState.currentPlayerIndex, 0);
});

test('playCard Wild Draw Four (+4) sets active color, draws 4 cards for victim, and skips turn', () => {
  const players = [{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }];
  const game = createGame({ players });

  const wild4Card = { id: 'wild4_card', color: 'wild', type: CARD_TYPES.WILD4 };
  game.players[0].hand[0] = wild4Card;

  const p2InitialHandLength = game.players[1].hand.length;

  const nextState = playCard(game, 'p1', wild4Card.id, 'blue');

  assert.equal(nextState.activeColor, 'blue');
  assert.equal(nextState.players[1].hand.length, p2InitialHandLength + 4);
  assert.equal(nextState.currentPlayerIndex, 0);
});

test('forgot LAST CARD call triggers penalty 2 cards draw', () => {
  const players = [{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }];
  const game = createGame({ players });

  const p1 = game.players[0];
  // Give player 2 cards only
  p1.hand = [
    { id: 'c1', color: game.activeColor, type: CARD_TYPES.NUMBER, value: 1 },
    { id: 'c2', color: 'blue', type: CARD_TYPES.NUMBER, value: 8 }
  ];
  p1.cardCount = 2;

  // Play c1 without calling LAST CARD
  const nextState = playCard(game, 'p1', 'c1');

  // 2 cards minus 1 played + 2 penalty = 3 cards
  assert.equal(nextState.players[0].hand.length, 3);
});

test('calling LAST CARD before playing avoids penalty', () => {
  const players = [{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }];
  let game = createGame({ players });

  const p1 = game.players[0];
  p1.hand = [
    { id: 'c1', color: game.activeColor, type: CARD_TYPES.NUMBER, value: 1 },
    { id: 'c2', color: 'blue', type: CARD_TYPES.NUMBER, value: 8 }
  ];
  p1.cardCount = 2;

  game = callLastCard(game, 'p1');
  const nextState = playCard(game, 'p1', 'c1');

  // 2 cards minus 1 played = 1 card left
  assert.equal(nextState.players[0].hand.length, 1);
});

test('win condition triggers when hand is empty', () => {
  const players = [{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }];
  const game = createGame({ players });

  const p1 = game.players[0];
  const winCard = { id: 'win_card', color: game.activeColor, type: CARD_TYPES.NUMBER, value: 7 };
  p1.hand = [winCard];
  p1.cardCount = 1;

  game.calledLastCard['p1'] = true; // Avoid penalty
  const nextState = playCard(game, 'p1', 'win_card');

  assert.equal(nextState.status, GAME_STATUS.FINISHED);
  assert.equal(nextState.winnerId, 'p1');
});
