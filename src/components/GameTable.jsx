import React from 'react';
import GameCard from './GameCard';
import { COLOR_SYMBOLS, COLOR_LABELS } from '../lib/uno/deck';

export default function GameTable({
  discardTop = null,
  activeColor = 'red',
  drawPileCount = 0,
  direction = 1,
  isCurrentTurn = false,
  onDrawCard = null,
  onCallLastCard = null,
  onPassTurn = null,
  hasPendingDrawn = false,
  calledLast = false,
  lastActionLog = ''
}) {
  const activeColorBg = {
    red: 'bg-red-500 text-white shadow-red-500/30',
    blue: 'bg-blue-500 text-white shadow-blue-500/30',
    green: 'bg-emerald-500 text-white shadow-emerald-500/30',
    yellow: 'bg-amber-400 text-slate-900 shadow-yellow-500/30'
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto my-2 p-3 sm:p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-xl flex flex-col items-center justify-between min-h-[280px] sm:min-h-[320px]">
      
      {/* Top Header: Active Color & Direction Indicator */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500">Warna Aktif:</span>
          <div className={`px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black flex items-center gap-1 shadow-sm ${activeColorBg[activeColor] || activeColorBg.red}`}>
            <span>{COLOR_SYMBOLS[activeColor]}</span>
            <span>{COLOR_LABELS[activeColor] || activeColor}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 sm:px-3.5 py-1 rounded-full border border-slate-200 shadow-sm">
          <span className="text-base sm:text-lg text-indigo-600">{direction === 1 ? '↻' : '↺'}</span>
          <span className="hidden xs:inline">{direction === 1 ? 'Searah Jarum Jam' : 'Berlawanan'}</span>
          <span className="xs:hidden">{direction === 1 ? 'Searah' : 'Berlawanan'}</span>
        </div>
      </div>

      {/* Center Table: Draw Pile & Discard Pile */}
      <div className="flex items-center justify-center gap-4 sm:gap-10 my-2">
        {/* Draw Pile (Bright Vibrant Card Back) */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onDrawCard}
            disabled={!isCurrentTurn}
            className={`
              relative rounded-2xl border-2 border-white bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 
              w-16 h-24 sm:w-24 sm:h-36 shadow-lg flex flex-col items-center justify-center transition-all duration-200
              ${isCurrentTurn ? 'hover:scale-105 hover:border-amber-400 ring-4 ring-amber-400/60 cursor-pointer shadow-amber-400/30' : 'opacity-70 cursor-not-allowed'}
            `}
          >
            <span className="text-2xl sm:text-3xl font-black text-white/90 drop-shadow">🎴</span>
            <span className="text-[9px] sm:text-[10px] font-black text-yellow-300 uppercase tracking-wider mt-0.5 drop-shadow-sm text-center px-1">
              Ambil Kartu
            </span>
          </button>
          <span className="text-[10px] sm:text-xs font-black text-slate-700 bg-slate-100 px-2.5 sm:px-3 py-0.5 rounded-full border border-slate-200 shadow-sm">
            Sisa: {drawPileCount}
          </span>
        </div>

        {/* Discard Pile */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative">
            <GameCard card={discardTop} size="md" isPlayable={false} />
          </div>
          <span className="text-[10px] sm:text-xs font-black text-slate-700 bg-slate-100 px-2.5 sm:px-3 py-0.5 rounded-full border border-slate-200 shadow-sm">
            Terbuka
          </span>
        </div>
      </div>

      {/* Action Logs & Controls */}
      <div className="w-full flex flex-col items-center gap-2 mt-2">
        {lastActionLog && (
          <div className="text-[11px] sm:text-xs font-bold text-center text-slate-700 bg-indigo-50/90 px-3 py-1 rounded-full border border-indigo-200 max-w-full truncate shadow-sm">
            {lastActionLog}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 w-full">
          {/* LAST CARD Candy Button */}
          <button
            type="button"
            onClick={onCallLastCard}
            disabled={calledLast}
            className={`
              btn-candy transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md text-[11px] sm:text-xs font-black py-2 px-4
              ${calledLast 
                ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none' 
                : 'btn-candy-red hover:scale-105 active:scale-95'}
            `}
          >
            <span>🔥</span>
            <span>{calledLast ? 'LAST CARD DISERUKAN' : 'SERU "LAST CARD!"'}</span>
          </button>

          {/* Pass Turn Button if drawn unplayable card */}
          {hasPendingDrawn && isCurrentTurn && (
            <button
              type="button"
              onClick={onPassTurn}
              className="btn-candy btn-candy-purple text-[11px] sm:text-xs font-black py-2 px-3"
            >
              Lewati Giliran ⏭
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
