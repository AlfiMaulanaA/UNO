import React, { useState } from 'react';

export default function OnlineLobby({
  roomCode = '',
  isHost = false,
  players = [],
  settings = {},
  onStartGame = null,
  onAddBot = null,
  onToggleReady = null,
  onLeave = null
}) {
  const [copied, setCopied] = useState(false);

  function copyInviteLink() {
    if (typeof window === 'undefined') return;
    const link = `${window.location.origin}?room=${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full max-w-xl mx-auto my-6 p-6 rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-slate-100 shadow-2xl shadow-slate-200/70">
      
      {/* Room Code Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">KODE RUANGAN ONLINE</span>
        <div className="flex items-center justify-center gap-3 mt-1.5">
          <span className="text-3xl font-black tracking-wider text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-2xl border border-indigo-200 shadow-sm">
            {roomCode}
          </span>
          <button
            type="button"
            onClick={copyInviteLink}
            className="btn-candy btn-candy-blue text-xs font-black"
          >
            {copied ? '✓ Tersalin!' : '📋 Bagikan Link'}
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-xs font-black text-slate-500 px-1">
          <span>Daftar Pemain ({players.length}/{settings.maxPlayers || 4})</span>
          <span>Status</span>
        </div>

        {players.map((p, idx) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.avatar || '🐼'}</span>
              <div>
                <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>{p.name}</span>
                  {p.id === roomCode && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-black border border-amber-300">HOST</span>}
                  {p.isBot && <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-black border border-purple-300">BOT</span>}
                </div>
              </div>
            </div>

            <div>
              {p.isReady ? (
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  READY ✓
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full border border-slate-300">
                  Menunggu...
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lobby Controls */}
      <div className="flex flex-col gap-3">
        {isHost && players.length < (settings.maxPlayers || 4) && (
          <button
            type="button"
            onClick={() => onAddBot && onAddBot('medium')}
            className="btn-candy btn-candy-purple text-xs font-black w-full"
          >
            🤖 + Tambah Bot AI Filler
          </button>
        )}

        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={onLeave}
            className="flex-1 py-3 rounded-2xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all"
          >
            Keluar Lobby
          </button>

          {!isHost && (
            <button
              type="button"
              onClick={onToggleReady}
              className="flex-1 btn-candy btn-candy-emerald text-xs font-black"
            >
              TOGGLE READY
            </button>
          )}

          {isHost && (
            <button
              type="button"
              onClick={onStartGame}
              disabled={players.length < 2}
              className={`
                flex-1 btn-candy text-xs font-black
                ${players.length >= 2 
                  ? 'btn-candy-emerald' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'}
              `}
            >
              MULAI PERMAINAN 🚀
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
