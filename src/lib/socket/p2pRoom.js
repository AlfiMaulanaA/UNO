import Peer from 'peerjs';

class P2PRoomManager {
  constructor() {
    this.peer = null;
    this.connections = new Map();
    this.hostConnection = null;
    this.isHost = false;
    this.roomCode = null;
    this.listeners = new Map();
    this.myId = null;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    if (!callback) {
      this.listeners.delete(event);
      return;
    }
    const list = this.listeners.get(event).filter(cb => cb !== callback);
    this.listeners.set(event, list);
  }

  emit(event, data) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach(cb => cb(data));
    }
  }

  createRoom({ hostName, avatar = '🐼' }, cb) {
    const code = 'UNO' + Math.floor(10 + Math.random() * 90);
    this.roomCode = code;
    this.isHost = true;
    this.myId = 'p_host_' + Date.now();

    const peerId = `uno_room_${code}`;

    if (this.peer) this.peer.destroy();

    this.peer = new Peer(peerId, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    const hostPlayer = {
      id: this.myId,
      socketId: this.myId,
      name: hostName || 'Pemain 1',
      avatar: avatar || '🐼',
      isBot: false,
      isReady: true
    };

    const roomState = {
      roomCode: code,
      hostId: this.myId,
      status: 'lobby',
      maxPlayers: 4,
      players: [hostPlayer]
    };

    this.roomState = roomState;

    this.peer.on('open', () => {
      this.emit('connect', { id: this.myId });
      this.emit('ROOM_STATE_UPDATED', this.roomState);
      cb?.({ success: true, roomCode: code, playerId: this.myId, roomState: this.roomState });
    });

    this.peer.on('connection', conn => {
      const connId = conn.peer;
      this.connections.set(connId, conn);

      conn.on('data', data => {
        this.handleHostDataMessage(conn, data);
      });

      conn.on('close', () => {
        this.connections.delete(connId);
        if (this.roomState) {
          const leftPlayer = this.roomState.players.find(p => p.socketId === connId);
          this.roomState.players = this.roomState.players.filter(p => p.socketId !== connId);
          this.broadcast('ROOM_STATE_UPDATED', this.roomState);
          this.emit('ROOM_STATE_UPDATED', this.roomState);
        }
      });
    });

    this.peer.on('error', err => {
      if (err.type === 'unavailable-id') {
        this.createRoom({ hostName, avatar }, cb);
      } else {
        cb?.({ success: false, error: 'Gagal membuat room P2P: ' + err.message });
      }
    });
  }

  joinRoom({ roomCode, playerName, avatar = '🦊' }, cb) {
    const code = roomCode.toUpperCase().trim();
    this.roomCode = code;
    this.isHost = false;
    this.myId = 'p_guest_' + Date.now();

    const hostPeerId = `uno_room_${code}`;

    if (this.peer) this.peer.destroy();

    this.peer = new Peer({
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    this.peer.on('open', () => {
      const conn = this.peer.connect(hostPeerId, { reliable: true });
      this.hostConnection = conn;

      conn.on('open', () => {
        conn.send({
          type: 'JOIN_ROOM',
          payload: { name: playerName, socketId: this.myId, avatar }
        });
        this.emit('connect', { id: this.myId });
      });

      conn.on('data', data => {
        this.handleGuestDataMessage(data, cb);
      });

      conn.on('close', () => {
        this.emit('PLAYER_LEFT', { name: 'Host', reason: 'left' });
      });

      conn.on('error', err => {
        cb?.({ success: false, error: 'Gagal terhubung ke host room ' + code });
      });
    });

    this.peer.on('error', err => {
      cb?.({ success: false, error: 'Ruangan ' + code + ' tidak ditemukan atau host offline.' });
    });
  }

  handleHostDataMessage(conn, data) {
    const { type, payload } = data;

    if (type === 'JOIN_ROOM') {
      const newPlayer = {
        id: payload.socketId,
        socketId: payload.socketId,
        name: payload.name || 'Pemain',
        avatar: payload.avatar || '🦊',
        isBot: false,
        isReady: true
      };

      if (this.roomState.players.length >= this.roomState.maxPlayers) {
        conn.send({ type: 'JOIN_RESPONSE', payload: { success: false, error: 'Ruangan penuh!' } });
        return;
      }

      this.roomState = {
        ...this.roomState,
        players: [...this.roomState.players, newPlayer]
      };
      conn.send({ type: 'JOIN_RESPONSE', payload: { success: true, roomCode: this.roomCode, playerId: payload.socketId, roomState: this.roomState } });
      this.broadcast('ROOM_STATE_UPDATED', this.roomState);
      this.emit('ROOM_STATE_UPDATED', this.roomState);
    } else if (type === 'SEND_CHAT') {
      this.broadcast('CHAT_RECEIVED', payload);
      this.emit('CHAT_RECEIVED', payload);
    } else if (type === 'SEND_EMOTE') {
      this.broadcast('EMOTE_RECEIVED', payload);
      this.emit('EMOTE_RECEIVED', payload);
    } else if (type === 'CLIENT_GAME_ACTION') {
      this.broadcast('GAME_STATE_UPDATED', payload);
      this.emit('GAME_STATE_UPDATED', payload);
    }
  }

  handleGuestDataMessage(data, joinCb) {
    const { type, payload } = data;
    if (type === 'JOIN_RESPONSE') {
      if (payload.success) {
        this.roomState = payload.roomState;
        this.emit('ROOM_STATE_UPDATED', this.roomState);
        joinCb?.(payload);
      } else {
        joinCb?.({ success: false, error: payload.error });
      }
    } else if (type === 'ROOM_STATE_UPDATED') {
      this.roomState = payload;
      this.emit('ROOM_STATE_UPDATED', payload);
    } else if (type === 'GAME_STATE_UPDATED') {
      this.emit('GAME_STATE_UPDATED', payload);
    } else if (type === 'EMOTE_RECEIVED') {
      this.emit('EMOTE_RECEIVED', payload);
    } else if (type === 'CHAT_RECEIVED') {
      this.emit('CHAT_RECEIVED', payload);
    }
  }

  broadcast(type, payload) {
    const msg = { type, payload };
    for (const conn of this.connections.values()) {
      if (conn.open) {
        conn.send(msg);
      }
    }
  }

  sendToHost(type, payload) {
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send({ type, payload: { ...payload, socketId: this.myId } });
    }
  }

  disconnect() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.connections.clear();
    this.hostConnection = null;
    this.roomState = null;
  }
}

export const p2pManager = new P2PRoomManager();
