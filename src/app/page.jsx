'use client';

import React, { useState, useEffect } from 'react';
import GameCard from '../components/GameCard';
import PlayerHand from '../components/PlayerHand';
import GameTable from '../components/GameTable';
import ColorPickerModal from '../components/ColorPickerModal';
import OnlineLobby from '../components/OnlineLobby';
import EmotePicker from '../components/EmotePicker';
import ChatPanel from '../components/ChatPanel';
import { VictoryModal, PassDeviceModal, ExitModal } from '../components/Modals';

import { createGame, playCard, playMultipleCards, drawCard, passTurn, callLastCard } from '../lib/uno/engine';
import { processBotTurn } from '../lib/uno/ai';
import { soundFx } from '../lib/uno/audio';
import { getStoredStats, recordGameResult, getStoredPrefs, savePrefs } from '../lib/uno/storage';
import { getSocket } from '../lib/socket/socketClient';
import { p2pManager } from '../lib/socket/p2pRoom';

export default function ColorCardsApp() {
  // Navigation & Mode
  const [view, setView] = useState('menu'); // 'menu', 'setup_bot', 'setup_local', 'setup_online', 'lobby_online', 'game'
  const [gameMode, setGameMode] = useState('bot'); // 'bot', 'local', 'online'

  // Game Engine State (Offline)
  const [gameState, setGameState] = useState(null);
  const [pendingWildCards, setPendingWildCards] = useState(null); // cardIds awaiting color pick
  const [userPlayerId, setUserPlayerId] = useState('p1');
  const [showPassDeviceModal, setShowPassDeviceModal] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Chat, Emote & Player Dropdown Modals
  const [showChatModal, setShowChatModal] = useState(false);
  const [showEmoteModal, setShowEmoteModal] = useState(false);
  const [showPlayersDropdown, setShowPlayersDropdown] = useState(false);

  // Online Multiplayer State
  const [socket, setSocket] = useState(null);
  const [onlineRoomCode, setOnlineRoomCode] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [onlineRoom, setOnlineRoom] = useState(null);
  const [privateHand, setPrivateHand] = useState([]);
  const [calledLastOnline, setCalledLastOnline] = useState(false);
  const [floatingEmotes, setFloatingEmotes] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  // Player Prefs & Stats
  const [prefs, setPrefs] = useState({ playerName: 'Pemain 1', soundEnabled: true, colorBlindMode: true });
  const [stats, setStats] = useState({ gamesPlayed: 0, wins: 0, winRate: 0 });

  // Setup options
  const [botCount, setBotCount] = useState(3);
  const [botDifficulty, setBotDifficulty] = useState('medium');
  const [localPlayerCount, setLocalPlayerCount] = useState(3);

  // Initialize Socket & Stats
  useEffect(() => {
    setStats(getStoredStats());
    setPrefs(getStoredPrefs());

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        setJoinCodeInput(roomParam.toUpperCase());
        setView('setup_online');
      }
    }
  }, []);

  // Connect Socket for Online Mode
  function initSocketConnection() {
    const s = getSocket();
    setSocket(s);

    if (s) {
      s.off('ROOM_STATE_UPDATED');
      s.off('PRIVATE_HAND_UPDATED');
      s.off('EMOTE_RECEIVED');
      s.off('CHAT_RECEIVED');

      s.on('ROOM_STATE_UPDATED', (updatedRoom) => {
        setOnlineRoom(updatedRoom);
        if (updatedRoom.status === 'playing') {
          setView('game');
        }
      });

      s.on('PRIVATE_HAND_UPDATED', ({ hand, calledLast }) => {
        setPrivateHand(hand);
        setCalledLastOnline(calledLast);
      });

      s.on('EMOTE_RECEIVED', ({ playerId, emoji }) => {
        triggerFloatingEmote(playerId, emoji);
      });

      s.on('CHAT_RECEIVED', (msg) => {
        addChatMessage(msg.senderName, msg.message);
      });
    }

    p2pManager.off('ROOM_STATE_UPDATED');
    p2pManager.off('GAME_STARTED');
    p2pManager.off('GAME_STATE_UPDATED');
    p2pManager.off('EMOTE_RECEIVED');
    p2pManager.off('CHAT_RECEIVED');

    p2pManager.on('ROOM_STATE_UPDATED', (updatedRoom) => {
      setOnlineRoom(updatedRoom);
      if (updatedRoom.status === 'playing') {
        setView('game');
      }
    });

    p2pManager.on('GAME_STARTED', ({ roomState, game: g }) => {
      setOnlineRoom(roomState);
      setGameState(g);
      setGameMode('online');
      setView('game');
    });

    p2pManager.on('GAME_STATE_UPDATED', (g) => {
      setGameState(g);
    });

    p2pManager.on('EMOTE_RECEIVED', ({ playerId, emoji }) => {
      triggerFloatingEmote(playerId, emoji);
    });

    p2pManager.on('CHAT_RECEIVED', (msg) => {
      addChatMessage(msg.senderName || msg.sender, msg.message || msg.text);
    });

    return s;
  }

  function triggerFloatingEmote(playerId, text) {
    const newEmote = { id: Date.now() + Math.random(), playerId, text };
    setFloatingEmotes((prev) => [...prev, newEmote]);
    setTimeout(() => {
      setFloatingEmotes((prev) => prev.filter((e) => e.id !== newEmote.id));
    }, 3000);
  }

  function addChatMessage(sender, text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: Date.now() + Math.random(), sender, text, time };
    setChatMessages((prev) => [...prev, newMsg]);
  }

  // --- OFFLINE BOT GAME CREATION ---
  function startBotGame() {
    const players = [
      { id: 'p1', name: prefs.playerName || 'Pemain 1', isBot: false, avatar: '🐼' }
    ];
    const botNames = ['Bot Nova', 'Bot Pixel', 'Bot Luna'];
    const botAvatars = ['🤖', '👾', '⚡'];

    for (let i = 0; i < botCount; i++) {
      players.push({
        id: `bot_${i + 1}`,
        name: botNames[i % 3],
        isBot: true,
        botDifficulty,
        avatar: botAvatars[i % 3]
      });
    }

    const state = createGame({ players });
    setGameState(state);
    setUserPlayerId('p1');
    setGameMode('bot');
    setChatMessages([]);
    setView('game');
  }

  // --- OFFLINE PASS & PLAY GAME CREATION ---
  function startLocalGame() {
    const players = [];
    const avatars = ['🐼', '🦊', '🐸', '🐯', '🐧', '🤖'];
    for (let i = 0; i < localPlayerCount; i++) {
      players.push({
        id: `local_p${i + 1}`,
        name: `Pemain ${i + 1}`,
        isBot: false,
        avatar: avatars[i % 6]
      });
    }

    const state = createGame({ players });
    setGameState(state);
    setUserPlayerId('local_p1');
    setGameMode('local');
    setChatMessages([]);
    setView('game');
  }

  // --- ONLINE MULTIPLAYER ACTIONS ---
  function handleCreateOnlineRoom() {
    const s = initSocketConnection();
    if (!s || !s.connected) {
      p2pManager.createRoom({ hostName: prefs.playerName, avatar: '🐼' }, (res) => {
        if (res?.success) {
          setOnlineRoomCode(res.roomCode);
          setOnlineRoom(res.roomState);
          setUserPlayerId(res.playerId);
          setGameMode('online');
          setChatMessages([]);
          setView('lobby_online');
        } else {
          alert(res?.error || 'Gagal membuat ruangan P2P.');
        }
      });
      return;
    }
    s.emit('CREATE_ROOM', { playerName: prefs.playerName, avatar: '🐼' }, (res) => {
      if (res?.success) {
        setOnlineRoomCode(res.roomCode);
        setUserPlayerId(res.playerId);
        setGameMode('online');
        setChatMessages([]);
        setView('lobby_online');
      }
    });
  }

  function handleJoinOnlineRoom() {
    if (!joinCodeInput.trim()) return;
    const s = initSocketConnection();
    if (!s || !s.connected) {
      p2pManager.joinRoom({ roomCode: joinCodeInput, playerName: prefs.playerName, avatar: '🦊' }, (res) => {
        if (res?.success) {
          setOnlineRoomCode(res.roomCode);
          setOnlineRoom(res.roomState);
          setUserPlayerId(res.playerId);
          setGameMode('online');
          setChatMessages([]);
          setView('lobby_online');
        } else {
          alert(res?.error || 'Gagal bergabung ke ruangan P2P.');
        }
      });
      return;
    }
    s.emit('JOIN_ROOM', { roomCode: joinCodeInput, playerName: prefs.playerName, avatar: '🦊' }, (res) => {
      if (res?.success) {
        setOnlineRoomCode(res.roomCode);
        setUserPlayerId(res.playerId);
        setGameMode('online');
        setChatMessages([]);
        setView('lobby_online');
      } else {
        alert(res?.error || 'Gagal bergabung ke ruangan.');
      }
    });
  }

  function handleStartOnlineGame() {
    if (socket && socket.connected) {
      socket.emit('START_GAME');
      return;
    }
    if (onlineRoom) {
      const targetCount = onlineRoom.maxPlayers || 4;
      const players = onlineRoom.players.map(p => ({
        id: p.id || p.socketId,
        name: p.name,
        isBot: !!p.isBot,
        botDifficulty: p.botDifficulty || 'medium',
        avatar: p.avatar || '🐼'
      }));
      const botNames = ['Bot Nova 🤖', 'Bot Pixel 👾', 'Bot Luna ⚡'];

      while (players.length < targetCount) {
        const i = players.filter(p => p.isBot).length;
        players.push({
          id: `bot_${Date.now()}_${i}`,
          name: botNames[i % 3],
          isBot: true,
          botDifficulty: 'medium',
          isReady: true,
          avatar: '🤖'
        });
      }

      const updatedRoom = { ...onlineRoom, status: 'playing' };
      const state = createGame({ players });
      setGameState(state);
      setUserPlayerId(p2pManager.myId || onlineRoom.players[0]?.id || 'p1');
      setGameMode('online');
      setView('game');

      p2pManager.broadcast('GAME_STARTED', { roomState: updatedRoom, game: state });
    }
  }

  function handleAddOnlineBot(difficulty = 'medium') {
    if (socket && socket.connected) {
      socket.emit('ADD_BOT', { difficulty });
      return;
    }
    if (onlineRoom) {
      const botNames = ['Bot Nova 🤖', 'Bot Pixel 👾', 'Bot Luna ⚡'];
      const botCount = onlineRoom.players.filter(p => p.isBot).length;
      const newBot = {
        id: `bot_${Date.now()}_${botCount}`,
        name: botNames[botCount % 3],
        isBot: true,
        botDifficulty: difficulty,
        isReady: true,
        avatar: '🤖'
      };
      setOnlineRoom(prev => prev ? { ...prev, players: [...prev.players, newBot] } : prev);
    }
  }

  function handleToggleReady() {
    if (socket && socket.connected) {
      socket.emit('TOGGLE_READY');
      return;
    }
    if (onlineRoom) {
      setOnlineRoom(prev => {
        if (!prev) return prev;
        const next = prev.players.map(p =>
          p.id === userPlayerId ? { ...p, isReady: !p.isReady } : p
        );
        return { ...prev, players: next };
      });
    }
  }

  // --- CARD PLAYING LOGIC ---
  function handleAttemptPlaySingleCard(card) {
    handleAttemptPlayMultipleCards([card.id]);
  }

  function handleAttemptPlayMultipleCards(cardIds) {
    const activeH = gameMode === 'online' ? privateHand : (gameState?.players[gameState?.currentPlayerIndex]?.hand || []);
    const targetCards = activeH.filter(c => cardIds.includes(c.id));
    const lastCard = targetCards[targetCards.length - 1];

    if (lastCard && lastCard.color === 'wild') {
      setPendingWildCards(cardIds);
      return;
    }
    executePlayMultipleCards(cardIds, null);
  }

  function handleSelectWildColor(color) {
    if (!pendingWildCards) return;
    const ids = pendingWildCards;
    setPendingWildCards(null);
    executePlayMultipleCards(ids, color);
  }

  function executePlayMultipleCards(cardIds, chosenColor) {
    if (gameMode === 'online') {
      if (socket) {
        socket.emit('PLAY_CARD', { cardIds, chosenColor }, (res) => {
          if (res && res.success) {
            soundFx.playCardPlaySound();
          }
        });
      }
      return;
    }

    // Offline mode
    try {
      let nextState = playMultipleCards(gameState, gameState.players[gameState.currentPlayerIndex].id, cardIds, chosenColor);
      soundFx.playCardPlaySound();
      setGameState(nextState);

      if (nextState.status === 'finished') {
        soundFx.playVictoryFanfare();
        const isWin = nextState.winnerId === 'p1';
        setStats(recordGameResult(isWin, 7));
        setShowVictoryModal(true);
        return;
      }

      if (gameMode === 'local') {
        setShowPassDeviceModal(true);
        setUserPlayerId(nextState.players[nextState.currentPlayerIndex].id);
      } else if (gameMode === 'bot') {
        triggerBotTurns(nextState);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function handleDrawCard() {
    if (gameMode === 'online') {
      if (socket) socket.emit('DRAW_CARD');
      soundFx.playCardDrawSound();
      return;
    }

    try {
      const currentP = gameState.players[gameState.currentPlayerIndex];
      let nextState = drawCard(gameState, currentP.id);
      soundFx.playCardDrawSound();
      setGameState(nextState);

      if (gameMode === 'bot' && !nextState.pendingDrawnCard) {
        triggerBotTurns(nextState);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function handlePassTurn() {
    if (gameMode === 'online') {
      if (socket) socket.emit('PASS_TURN');
      return;
    }

    try {
      const currentP = gameState.players[gameState.currentPlayerIndex];
      let nextState = passTurn(gameState, currentP.id);
      setGameState(nextState);

      if (gameMode === 'bot') {
        triggerBotTurns(nextState);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function handleCallLastCard() {
    if (gameMode === 'online') {
      if (socket) socket.emit('CALL_LAST_CARD');
      soundFx.playLastCardAlert();
      return;
    }

    const currentP = gameState.players[gameState.currentPlayerIndex];
    let nextState = callLastCard(gameState, currentP.id);
    soundFx.playLastCardAlert();
    setGameState(nextState);
  }

  function triggerBotTurns(initialState) {
    let currentState = initialState;
    const runStep = () => {
      if (!currentState || currentState.status !== 'playing') return;
      const currentP = currentState.players[currentState.currentPlayerIndex];
      if (currentP && currentP.isBot) {
        setTimeout(() => {
          currentState = processBotTurn(currentState);
          setGameState({ ...currentState });
          soundFx.playCardPlaySound();

          // Bot random reactions / chats
          if (Math.random() < 0.25) {
            const botReactions = ['🤖 Bip bop!', '🔥 Semangat!', '🤡 Ups Kena!', '🚀 Top Mantap!', '🤪 Wkwkwk!'];
            const reactText = botReactions[Math.floor(Math.random() * botReactions.length)];
            triggerFloatingEmote(currentP.id, reactText);
          }

          if (currentState.status === 'finished') {
            soundFx.playVictoryFanfare();
            setShowVictoryModal(true);
            return;
          }

          if (currentState.players[currentState.currentPlayerIndex].isBot) {
            runStep();
          }
        }, 1000);
      }
    };
    runStep();
  }

  function handleSendEmote(emoji) {
    if (socket && gameMode === 'online') {
      socket.emit('SEND_EMOTE', { emoji });
    } else {
      triggerFloatingEmote(userPlayerId, emoji);
    }
  }

  function handleSendChat(message) {
    if (socket && gameMode === 'online') {
      socket.emit('SEND_CHAT', { message });
    } else {
      const activePName = activeGame?.players.find(p => p.id === userPlayerId)?.name || prefs.playerName || 'Pemain';
      addChatMessage(activePName, message);
    }
  }

  // Active game data resolution
  const activeGame = gameMode === 'online' ? onlineRoom?.gameState : gameState;
  const isOnlineGame = gameMode === 'online';
  const currentHand = isOnlineGame ? privateHand : (activeGame?.players[activeGame?.currentPlayerIndex]?.hand || []);
  const activePlayer = activeGame?.players[activeGame?.currentPlayerIndex];
  const isMyTurn = isOnlineGame ? (activePlayer?.id === userPlayerId) : (activePlayer && !activePlayer.isBot);
  const calledLast = isOnlineGame ? calledLastOnline : (activeGame?.calledLastCard[activePlayer?.id] || false);

  return (
    <div className="relative min-h-screen flex flex-col justify-between p-3 sm:p-6 pb-20 max-w-6xl mx-auto w-full">
      {/* Background Soft Colorful Radial Gradients */}
      <div className="bg-scene"></div>

      {/* Navbar Header */}
      <header className="relative flex items-center justify-between py-2.5 px-3 sm:px-4 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-slate-100 shadow-sm mb-2 z-30">
        <div className="flex items-center gap-2.5">
          <img src="/app-logo.jpeg" alt="ColorCards Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover border-2 border-indigo-200 shadow-sm" />
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
              ColorCards <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black border border-indigo-200">UNO</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400">Casual Card Arena</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              const muted = soundFx.toggleMute();
              setPrefs((p) => ({ ...p, soundEnabled: !muted }));
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all text-xs font-black"
          >
            {prefs.soundEnabled ? '🔊' : '🔇'}
          </button>
          {view === 'game' && (
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 text-xs font-black transition-all"
            >
              Keluar
            </button>
          )}
        </div>
      </header>

      {/* --- MENU MAIN VIEW --- */}
      {view === 'menu' && (
        <div className="flex-1 flex flex-col items-center justify-center my-4 space-y-6 animate-fadeIn">
          
          {/* Compact Clean Hero Section */}
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl border-2 border-slate-100 rounded-3xl p-5 shadow-xl shadow-slate-200/50 text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              MATCH. COMBO. <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-indigo-600">WIN!</span>
            </h2>
            <p className="text-xs font-bold text-slate-500 max-w-lg mx-auto leading-relaxed">
              Mainkan combo kartu angka sama, tantang bot AI, main 1 layar bersama teman, atau buat room multiplayer online real-time!
            </p>
          </div>

          {/* Super Compact Mode Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-2xl">
            
            {/* VS Bot AI */}
            <button
              type="button"
              onClick={() => setView('setup_bot')}
              className="group p-3 rounded-2xl bg-white border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50/50 hover:shadow-md transition-all text-left flex items-center gap-3 h-20 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl shrink-0 font-bold group-hover:scale-110 transition-transform">
                🤖
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                  VS Bot AI <span className="text-[10px] text-indigo-600">→</span>
                </h3>
                <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">Offline vs 1–3 Bot AI</p>
              </div>
            </button>

            {/* Pass & Play Local */}
            <button
              type="button"
              onClick={() => setView('setup_local')}
              className="group p-3 rounded-2xl bg-white border-2 border-amber-100 hover:border-amber-500 hover:bg-amber-50/50 hover:shadow-md transition-all text-left flex items-center gap-3 h-20 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl shrink-0 font-bold group-hover:scale-110 transition-transform">
                📱
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-black text-slate-900 group-hover:text-amber-600 transition-colors flex items-center justify-between">
                  Local Pass & Play <span className="text-[10px] text-amber-600">→</span>
                </h3>
                <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">2–4 Pemain 1 Layar</p>
              </div>
            </button>

            {/* Online Multiplayer */}
            <button
              type="button"
              onClick={() => setView('setup_online')}
              className="group p-3 rounded-2xl bg-white border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-md transition-all text-left flex items-center gap-3 h-20 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0 font-bold group-hover:scale-110 transition-transform">
                🌐
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-black text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
                  Online Room <span className="text-[10px] text-emerald-600">→</span>
                </h3>
                <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">Multiplayer Real-time</p>
              </div>
            </button>

          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 bg-white border-2 border-slate-100 px-6 py-2.5 rounded-full text-xs font-black text-slate-600 shadow-sm">
            <span>🎮 Total Game: <strong className="text-slate-900">{stats.gamesPlayed}</strong></span>
            <span>🏆 Menang: <strong className="text-emerald-600">{stats.wins}</strong></span>
            <span>📊 Win Rate: <strong className="text-indigo-600">{stats.winRate}%</strong></span>
          </div>

        </div>
      )}

      {/* --- SETUP BOT VIEW --- */}
      {view === 'setup_bot' && (
        <div className="flex-1 flex flex-col items-center justify-center my-auto py-4 animate-fadeIn w-full">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-2xl space-y-5">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 text-center flex items-center justify-center gap-2">
              🤖 Pengaturan Game VS Bot
            </h3>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-500 mb-1.5 text-left">Nama Anda:</label>
                <input
                  type="text"
                  value={prefs.playerName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPrefs((p) => ({ ...p, playerName: val }));
                    savePrefs({ ...prefs, playerName: val });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 text-left">Jumlah Bot:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBotCount(num)}
                      className={`py-2.5 px-1 rounded-xl border text-center transition-all ${botCount === num ? 'bg-indigo-600 border-indigo-600 text-white font-black shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      <div className="text-xs font-black">{num} Bot</div>
                      <div className="text-[9px] opacity-80">({num + 1} Pemain)</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 text-left">Tingkat Kesulitan Bot AI:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['easy', 'medium', 'hard'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setBotDifficulty(diff)}
                      className={`py-2.5 rounded-xl uppercase border text-center transition-all text-xs ${botDifficulty === diff ? 'bg-purple-600 border-purple-600 text-white font-black shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 font-bold'}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="flex-1 py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={startBotGame}
                className="flex-1 btn-candy btn-candy-purple text-xs font-black"
              >
                MULAI PERMAINAN 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SETUP LOCAL VIEW --- */}
      {view === 'setup_local' && (
        <div className="flex-1 flex flex-col items-center justify-center my-auto py-4 animate-fadeIn w-full">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-2xl space-y-5">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 text-center flex items-center justify-center gap-2">
              📱 Main Lokal (Pass & Play)
            </h3>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-500 mb-1.5 text-left">Jumlah Pemain (2–4 Pemain):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setLocalPlayerCount(num)}
                      className={`py-2.5 rounded-xl border text-center transition-all text-xs ${localPlayerCount === num ? 'bg-amber-500 border-amber-500 text-white font-black shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      {num} Pemain
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="flex-1 py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={startLocalGame}
                className="flex-1 btn-candy btn-candy-yellow text-xs font-black"
              >
                MULAI MAIN LOKAL 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SETUP ONLINE VIEW --- */}
      {view === 'setup_online' && (
        <div className="flex-1 flex flex-col items-center justify-center my-auto py-4 animate-fadeIn w-full">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-2xl space-y-5">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 text-center flex items-center justify-center gap-2">
              🌐 Multiplayer Online Room
            </h3>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-500 mb-1.5 text-left">Nama Tampilan Anda:</label>
                <input
                  type="text"
                  value={prefs.playerName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPrefs((p) => ({ ...p, playerName: val }));
                    savePrefs({ ...prefs, playerName: val });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <button
                  type="button"
                  onClick={handleCreateOnlineRoom}
                  className="btn-candy btn-candy-emerald w-full text-xs font-black"
                >
                  + BUAT RUANGAN BARU
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-bold uppercase">Atau Masuk Kode Room</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="KODE ROOM"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono uppercase tracking-wider text-xs font-black"
                  />
                  <button
                    type="button"
                    onClick={handleJoinOnlineRoom}
                    className="btn-candy btn-candy-blue text-xs font-black px-4"
                  >
                    GABUNG
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ONLINE LOBBY VIEW --- */}
      {view === 'lobby_online' && onlineRoom && (
        <OnlineLobby
          roomCode={onlineRoom.code}
          isHost={onlineRoom.hostId === userPlayerId}
          players={onlineRoom.players}
          settings={onlineRoom.settings}
          onStartGame={handleStartOnlineGame}
          onAddBot={handleAddOnlineBot}
          onToggleReady={handleToggleReady}
          onLeave={() => setView('menu')}
        />
      )}

      {/* --- MAIN GAME VIEW --- */}
      {view === 'game' && activeGame && (
        <div className="flex-1 flex flex-col justify-between space-y-2 animate-fadeIn relative max-w-4xl mx-auto w-full">
          
          {/* Floating Emote Notification Toast Container */}
          {floatingEmotes.length > 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 pointer-events-none">
              {floatingEmotes.map((e) => {
                const senderName = activeGame.players.find(p => p.id === e.playerId)?.name || 'Pemain';
                return (
                  <div key={e.id} className="bg-white border-2 border-amber-300 px-3.5 py-1 rounded-full text-xs font-black text-slate-900 shadow-2xl animate-bounce">
                    <span>{senderName}:</span> <span className="text-sm">{e.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* TOP SEATS ROW (2 Players at Top) */}
          <div className="flex items-center justify-center gap-3 px-2 py-1">
            {activeGame.players.slice(0, Math.min(2, Math.ceil(activeGame.players.length / 2))).map((p) => {
              const playerIdx = activeGame.players.findIndex(pl => pl.id === p.id);
              const isCurrent = playerIdx === activeGame.currentPlayerIndex;
              return (
                <div
                  key={p.id}
                  className={`
                    relative flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all text-xs font-black shadow-sm bg-white shrink-0
                    ${isCurrent 
                      ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400 shadow-md scale-105' 
                      : 'border-slate-200 text-slate-700'}
                  `}
                >
                  <span className="text-base sm:text-lg">{p.avatar || '🐼'}</span>
                  <div>
                    <div className="flex items-center gap-1 leading-none">
                      <span className="text-slate-900 font-black">{p.name}</span>
                      {p.id === userPlayerId && <span className="text-[9px] text-emerald-600 font-extrabold">(Anda)</span>}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      🎴 {p.cardCount || p.hand?.length || 0} kartu
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Card Game Table */}
          <GameTable
            discardTop={activeGame.discardPile ? activeGame.discardPile[activeGame.discardPile.length - 1] : null}
            activeColor={activeGame.activeColor}
            drawPileCount={activeGame.drawPileCount !== undefined ? activeGame.drawPileCount : activeGame.drawPile?.length}
            direction={activeGame.direction}
            isCurrentTurn={isMyTurn}
            onDrawCard={handleDrawCard}
            onCallLastCard={handleCallLastCard}
            onPassTurn={handlePassTurn}
            hasPendingDrawn={Boolean(activeGame.pendingDrawnCard)}
            calledLast={calledLast}
            lastActionLog={activeGame.lastActionLog}
          />

          {/* BOTTOM SEATS ROW (2 Players at Bottom) */}
          {activeGame.players.length > 2 && (
            <div className="flex items-center justify-center gap-3 px-2 py-1">
              {activeGame.players.slice(2, 4).map((p) => {
                const playerIdx = activeGame.players.findIndex(pl => pl.id === p.id);
                const isCurrent = playerIdx === activeGame.currentPlayerIndex;
                return (
                  <div
                    key={p.id}
                    className={`
                      relative flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all text-xs font-black shadow-sm bg-white shrink-0
                      ${isCurrent 
                        ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400 shadow-md scale-105' 
                        : 'border-slate-200 text-slate-700'}
                    `}
                  >
                    <span className="text-base sm:text-lg">{p.avatar || '🐼'}</span>
                    <div>
                      <div className="flex items-center gap-1 leading-none">
                        <span className="text-slate-900 font-black">{p.name}</span>
                        {p.id === userPlayerId && <span className="text-[9px] text-emerald-600 font-extrabold">(Anda)</span>}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        🎴 {p.cardCount || p.hand?.length || 0} kartu
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Player Hand Cards */}
          <PlayerHand
            hand={currentHand}
            topDiscard={activeGame.discardPile ? activeGame.discardPile[activeGame.discardPile.length - 1] : null}
            activeColor={activeGame.activeColor}
            isCurrentTurn={isMyTurn}
            activePlayerName={activePlayer?.name}
            onPlayCard={handleAttemptPlaySingleCard}
            onPlayMultipleCards={handleAttemptPlayMultipleCards}
            onOpenChat={() => setShowChatModal(true)}
            onOpenEmote={() => setShowEmoteModal(true)}
            showColorBlindSymbol={prefs.colorBlindMode}
          />

        </div>
      )}

      {/* CHAT & EMOTE MODALS */}
      {showChatModal && (
        <ChatPanel
          messages={chatMessages}
          onClose={() => setShowChatModal(false)}
          onSendMessage={handleSendChat}
        />
      )}

      {showEmoteModal && (
        <EmotePicker
          onClose={() => setShowEmoteModal(false)}
          onSelectEmote={handleSendEmote}
          onSelectChat={handleSendChat}
        />
      )}

      {/* GAME MODALS */}
      <ColorPickerModal
        isOpen={Boolean(pendingWildCards)}
        onSelectColor={handleSelectWildColor}
      />

      <VictoryModal
        isOpen={showVictoryModal}
        winnerName={activeGame?.players.find(p => p.id === activeGame?.winnerId)?.name || 'Pemain'}
        isUserWinner={activeGame?.winnerId === userPlayerId}
        onPlayAgain={() => {
          setShowVictoryModal(false);
          if (gameMode === 'bot') startBotGame();
          else if (gameMode === 'local') startLocalGame();
        }}
        onExit={() => {
          setShowVictoryModal(false);
          setView('menu');
        }}
      />

      <PassDeviceModal
        isOpen={showPassDeviceModal}
        nextPlayerName={activePlayer?.name || 'Pemain Next'}
        onReady={() => setShowPassDeviceModal(false)}
      />

      <ExitModal
        isOpen={showExitModal}
        onConfirmExit={() => {
          setShowExitModal(false);
          setView('menu');
        }}
        onCancel={() => setShowExitModal(false)}
      />

    </div>
  );
}
