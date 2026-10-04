// ColorCards (UNO) Server-Authoritative Socket.io Handler

import { createGame, playCard, playMultipleCards, drawCard, passTurn, callLastCard } from '../lib/uno/engine.js';
import { processBotTurn } from '../lib/uno/ai.js';

export const SOCKET_CONFIG = {
  ROOM_CODE_LENGTH: 6,
  ROOM_CODE_CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
  BOT_TAKEOVER_DELAY_MS: 5000,
  BOT_TURN_DELAY_MS: 1200,
  DEFAULT_MAX_PLAYERS: 4,
  DEFAULT_BOT_DIFFICULTY: 'medium',
  BOT_NAMES: ['Bot Nova', 'Bot Pixel', 'Bot Luna', 'Bot Spark'],
  BOT_AVATARS: ['🤖', '👾', '⚡', '🌟'],
  DEFAULT_HOST_AVATAR: '🐼',
  DEFAULT_PLAYER_AVATARS: ['🦊', '🐸', '🐯', '🐧', '🤖']
};

const rooms = new Map(); // roomCode -> roomData

export function setupSocketServer(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    let currentRoomCode = null;
    let currentPlayerId = null;

    // Create Room
    socket.on('CREATE_ROOM', ({ playerName, avatar, settings }, callback) => {
      const roomCode = generateRoomCode();
      const playerId = `user_${socket.id.substring(0, 6)}`;

      const room = {
        code: roomCode,
        hostId: playerId,
        status: 'lobby',
        players: [
          {
            id: playerId,
            socketId: socket.id,
            name: playerName || 'Host Player',
            avatar: avatar || SOCKET_CONFIG.DEFAULT_HOST_AVATAR,
            isBot: false,
            isReady: true,
            connected: true
          }
        ],
        settings: settings || {
          allowStacking: false,
          enableLastCardPenalty: true,
          turnTimerSec: 30,
          maxPlayers: SOCKET_CONFIG.DEFAULT_MAX_PLAYERS
        },
        gameState: null
      };

      rooms.set(roomCode, room);
      socket.join(roomCode);
      currentRoomCode = roomCode;
      currentPlayerId = playerId;

      if (callback) callback({ success: true, roomCode, playerId });
      broadcastRoomState(io, roomCode);
    });

    // Join Room
    socket.on('JOIN_ROOM', ({ roomCode, playerName, avatar }, callback) => {
      const code = (roomCode || '').toUpperCase().trim();
      const room = rooms.get(code);

      if (!room) {
        if (callback) callback({ success: false, error: 'Ruangan tidak ditemukan.' });
        return;
      }

      if (room.status === 'playing') {
        if (callback) callback({ success: false, error: 'Permainan sedang berlangsung.' });
        return;
      }

      const maxPlayersAllowed = room.settings.maxPlayers || SOCKET_CONFIG.DEFAULT_MAX_PLAYERS;
      if (room.players.length >= maxPlayersAllowed) {
        if (callback) callback({ success: false, error: 'Ruangan sudah penuh.' });
        return;
      }

      const playerId = `user_${socket.id.substring(0, 6)}`;
      const avatarIndex = room.players.length % SOCKET_CONFIG.DEFAULT_PLAYER_AVATARS.length;
      const newPlayer = {
        id: playerId,
        socketId: socket.id,
        name: playerName || `Pemain ${room.players.length + 1}`,
        avatar: avatar || SOCKET_CONFIG.DEFAULT_PLAYER_AVATARS[avatarIndex],
        isBot: false,
        isReady: false,
        connected: true
      };

      room.players.push(newPlayer);
      socket.join(code);
      currentRoomCode = code;
      currentPlayerId = playerId;

      if (callback) callback({ success: true, roomCode: code, playerId });
      broadcastRoomState(io, code);
    });

    // Add Bot
    socket.on('ADD_BOT', ({ difficulty = SOCKET_CONFIG.DEFAULT_BOT_DIFFICULTY }) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || room.hostId !== currentPlayerId || room.status === 'playing') return;

      const maxPlayersAllowed = room.settings.maxPlayers || SOCKET_CONFIG.DEFAULT_MAX_PLAYERS;
      if (room.players.length >= maxPlayersAllowed) return;

      const botId = `bot_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const botIndex = room.players.length % SOCKET_CONFIG.BOT_NAMES.length;

      const botPlayer = {
        id: botId,
        socketId: null,
        name: SOCKET_CONFIG.BOT_NAMES[botIndex],
        avatar: SOCKET_CONFIG.BOT_AVATARS[botIndex],
        isBot: true,
        botDifficulty: difficulty,
        isReady: true,
        connected: true
      };

      room.players.push(botPlayer);
      broadcastRoomState(io, currentRoomCode);
    });

    // Toggle Ready
    socket.on('TOGGLE_READY', () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const p = room.players.find(x => x.id === currentPlayerId);
      if (p) {
        p.isReady = !p.isReady;
        broadcastRoomState(io, currentRoomCode);
      }
    });

    // Start Game
    socket.on('START_GAME', () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || room.hostId !== currentPlayerId) return;

      const minPlayersRequired = 2;
      if (room.players.length < minPlayersRequired) return;

      room.status = 'playing';
      room.gameState = createGame({
        players: room.players.map(p => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          isBot: p.isBot,
          botDifficulty: p.botDifficulty
        })),
        settings: room.settings
      });

      broadcastRoomState(io, currentRoomCode);

      // Auto process if first turn is bot
      checkAndRunBotTurn(io, currentRoomCode);
    });

    // Play Card / Multi Cards
    socket.on('PLAY_CARD', ({ cardId, cardIds, chosenColor }, callback) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || room.status !== 'playing' || !room.gameState) return;

      try {
        const idsToPlay = cardIds || (cardId ? [cardId] : []);
        room.gameState = playMultipleCards(room.gameState, currentPlayerId, idsToPlay, chosenColor);
        if (callback) callback({ success: true });
        broadcastRoomState(io, currentRoomCode);
        checkAndRunBotTurn(io, currentRoomCode);
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Draw Card
    socket.on('DRAW_CARD', (callback) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || room.status !== 'playing' || !room.gameState) return;

      try {
        room.gameState = drawCard(room.gameState, currentPlayerId);
        if (callback) callback({ success: true });
        broadcastRoomState(io, currentRoomCode);
        checkAndRunBotTurn(io, currentRoomCode);
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Pass Turn
    socket.on('PASS_TURN', (callback) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || room.status !== 'playing' || !room.gameState) return;

      try {
        room.gameState = passTurn(room.gameState, currentPlayerId);
        if (callback) callback({ success: true });
        broadcastRoomState(io, currentRoomCode);
        checkAndRunBotTurn(io, currentRoomCode);
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Call LAST CARD
    socket.on('CALL_LAST_CARD', () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || room.status !== 'playing' || !room.gameState) return;

      room.gameState = callLastCard(room.gameState, currentPlayerId);
      broadcastRoomState(io, currentRoomCode);
    });

    // Emote Reaction
    socket.on('SEND_EMOTE', ({ emoji }) => {
      if (!currentRoomCode) return;
      io.to(currentRoomCode).emit('EMOTE_RECEIVED', {
        playerId: currentPlayerId,
        emoji
      });
    });

    // Chat Message
    socket.on('SEND_CHAT', ({ message }) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      const sender = room ? room.players.find(p => p.id === currentPlayerId) : null;

      io.to(currentRoomCode).emit('CHAT_RECEIVED', {
        senderName: sender ? sender.name : 'Unknown',
        message
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (currentRoomCode) {
        const room = rooms.get(currentRoomCode);
        if (room) {
          const p = room.players.find(x => x.id === currentPlayerId);
          if (p) {
            p.connected = false;
            // If playing, takeover with Bot AI after BOT_TAKEOVER_DELAY_MS if not reconnected
            setTimeout(() => {
              if (!p.connected && room.status === 'playing' && !p.isBot) {
                p.isBot = true; // Bot takeover
                p.name = `${p.name} (Bot)`;
                broadcastRoomState(io, currentRoomCode);
                checkAndRunBotTurn(io, currentRoomCode);
              }
            }, SOCKET_CONFIG.BOT_TAKEOVER_DELAY_MS);
          }
          broadcastRoomState(io, currentRoomCode);
        }
      }
    });
  });
}

function broadcastRoomState(io, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  // Public state broadcast (Sanitize hidden hands of other players for security!)
  const publicGameState = room.gameState ? {
    ...room.gameState,
    drawPileCount: room.gameState.drawPile.length,
    drawPile: undefined, // Hide draw pile details
    players: room.gameState.players.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isBot: p.isBot,
      botDifficulty: p.botDifficulty,
      cardCount: p.hand.length,
      hand: undefined // Hide hand details from global broadcast
    }))
  } : null;

  const publicRoom = {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    players: room.players,
    settings: room.settings,
    gameState: publicGameState
  };

  // Broadcast public room state
  io.to(roomCode).emit('ROOM_STATE_UPDATED', publicRoom);

  // Send private hand data to each connected socket
  if (room.gameState && room.status === 'playing') {
    room.players.forEach(p => {
      if (p.socketId) {
        const realPlayerState = room.gameState.players.find(x => x.id === p.id);
        if (realPlayerState) {
          io.to(p.socketId).emit('PRIVATE_HAND_UPDATED', {
            hand: realPlayerState.hand,
            calledLast: Boolean(room.gameState.calledLastCard[p.id])
          });
        }
      }
    });
  }
}

function checkAndRunBotTurn(io, roomCode) {
  const room = rooms.get(roomCode);
  if (!room || room.status !== 'playing' || !room.gameState) return;

  const currentP = room.gameState.players[room.gameState.currentPlayerIndex];
  if (currentP && currentP.isBot && room.gameState.status === 'playing') {
    setTimeout(() => {
      if (rooms.has(roomCode) && room.gameState.status === 'playing') {
        const activeP = room.gameState.players[room.gameState.currentPlayerIndex];
        if (activeP && activeP.id === currentP.id) {
          room.gameState = processBotTurn(room.gameState);
          broadcastRoomState(io, roomCode);
          checkAndRunBotTurn(io, roomCode);
        }
      }
    }, SOCKET_CONFIG.BOT_TURN_DELAY_MS);
  }
}

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < SOCKET_CONFIG.ROOM_CODE_LENGTH; i++) {
    code += SOCKET_CONFIG.ROOM_CODE_CHARS.charAt(
      Math.floor(Math.random() * SOCKET_CONFIG.ROOM_CODE_CHARS.length)
    );
  }
  return code;
}
