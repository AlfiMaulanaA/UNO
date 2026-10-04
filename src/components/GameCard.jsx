import React from 'react';
import { COLOR_SYMBOLS, CARD_TYPES } from '../lib/uno/deck.js';

export default function GameCard({
  card,
  isPlayable = false,
  onClick = null,
  disabled = false,
  size = 'md', // 'sm', 'md', 'lg'
  isFaceDown = false,
  showColorBlindSymbol = true
}) {
  if (isFaceDown) {
    return (
      <div className={`
        relative rounded-2xl border-2 border-white bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 
        shadow-md select-none flex items-center justify-center transition-all duration-200
        ${size === 'sm' ? 'w-10 h-14 text-xs' : size === 'lg' ? 'w-24 h-36 text-2xl' : 'w-16 h-24 text-base'}
      `}>
        <div className="w-8/12 h-8/12 rounded-xl border border-white/40 bg-white/20 flex items-center justify-center font-bold text-white drop-shadow">
          🎴
        </div>
      </div>
    );
  }

  if (!card) return null;

  const bgClasses = {
    red: 'bg-gradient-to-br from-red-500 via-rose-500 to-red-600 border-red-200 shadow-red-500/20',
    blue: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 border-blue-200 shadow-blue-500/20',
    green: 'bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 border-emerald-200 shadow-emerald-500/20',
    yellow: 'bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 border-amber-200 shadow-yellow-500/20',
    wild: 'bg-gradient-to-br from-purple-600 via-pink-500 to-amber-400 border-purple-200 shadow-purple-500/20'
  };

  const textClasses = {
    red: 'text-red-600',
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    yellow: 'text-amber-500',
    wild: 'text-purple-600'
  };

  const symbol = COLOR_SYMBOLS[card.color] || '';

  function renderContent() {
    if (card.type === CARD_TYPES.NUMBER) return card.value;
    if (card.type === CARD_TYPES.SKIP) return '⊘';
    if (card.type === CARD_TYPES.REVERSE) return '↻';
    if (card.type === CARD_TYPES.DRAW2) return '+2';
    if (card.type === CARD_TYPES.WILD) return '🌈';
    if (card.type === CARD_TYPES.WILD4) return '+4';
    return '';
  }

  const dimensionClass = size === 'sm' ? 'w-12 h-16' : size === 'lg' ? 'w-24 h-36' : 'w-16 h-24';
  const cornerTextClass = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-sm' : 'text-[11px]';
  
  // Oval sizes and text sizes inside oval
  const ovalClass = size === 'sm' 
    ? 'w-8 h-11 text-xs' 
    : size === 'lg' 
    ? 'w-16 h-24 text-4xl sm:text-5xl' 
    : 'w-11 h-16 text-2xl sm:text-3xl';

  return (
    <button
      type="button"
      onClick={() => isPlayable && !disabled && onClick && onClick(card)}
      disabled={!isPlayable || disabled}
      className={`
        relative rounded-2xl border-2 shadow-lg select-none flex flex-col justify-between p-1.5 transition-all duration-200 overflow-hidden
        ${dimensionClass}
        ${bgClasses[card.color] || bgClasses.wild}
        ${isPlayable && !disabled ? 'ring-4 ring-amber-400 cursor-pointer -translate-y-2.5 hover:-translate-y-3.5 shadow-amber-400/50 shadow-2xl scale-105 z-10' : 'opacity-40 grayscale-[40%] cursor-not-allowed pointer-events-none'}
      `}
    >
      {/* Top Corner Badge */}
      <div className={`flex items-center justify-between font-black leading-none text-white drop-shadow-sm ${cornerTextClass}`}>
        <span>{renderContent()}</span>
        {showColorBlindSymbol && <span className="text-[10px] opacity-90">{symbol}</span>}
      </div>

      {/* Center White Oval Badge & Big Number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`
          rounded-[50%] bg-white shadow-md flex items-center justify-center -rotate-[24deg] border border-white/60
          ${ovalClass}
        `}>
          <span className={`font-black tracking-tighter drop-shadow-sm transform rotate-[24deg] ${textClasses[card.color] || textClasses.wild}`}>
            {renderContent()}
          </span>
        </div>
      </div>

      {/* Bottom Corner Badge (Rotated) */}
      <div className={`flex items-center justify-between font-black leading-none text-white drop-shadow-sm rotate-180 ${cornerTextClass}`}>
        <span>{renderContent()}</span>
        {showColorBlindSymbol && <span className="text-[10px] opacity-90">{symbol}</span>}
      </div>
    </button>
  );
}
