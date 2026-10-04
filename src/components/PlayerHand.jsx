import React, { useState, useEffect } from 'react';
import GameCard from './GameCard';

export default function PlayerHand({
  hand = [],
  topDiscard = null,
  activeColor = null,
  isCurrentTurn = false,
  activePlayerName = '',
  onPlayCard = null,
  onPlayMultipleCards = null,
  onOpenChat = null,
  onOpenEmote = null,
  showColorBlindSymbol = true
}) {
  const [selectedCardIds, setSelectedCardIds] = useState([]);

  // Reset selected cards if turn ends
  useEffect(() => {
    if (!isCurrentTurn) {
      setSelectedCardIds([]);
    }
  }, [isCurrentTurn]);

  function toggleSelectCard(card) {
    if (!isCurrentTurn) return;

    // Check if card is already selected
    if (selectedCardIds.includes(card.id)) {
      const nextSelection = selectedCardIds.filter(id => id !== card.id);
      setSelectedCardIds(nextSelection);
      return;
    }

    // If no card selected yet, start selection
    if (selectedCardIds.length === 0) {
      setSelectedCardIds([card.id]);
      return;
    }

    // If already has selection, check if new card matches the value/type of existing selections
    const firstSelectedCard = hand.find(c => c.id === selectedCardIds[0]);
    if (!firstSelectedCard) {
      setSelectedCardIds([card.id]);
      return;
    }

    const matchesValue = (firstSelectedCard.type === 'number' && card.type === 'number' && card.value === firstSelectedCard.value)
      || (firstSelectedCard.type !== 'number' && card.type === firstSelectedCard.type);

    if (matchesValue) {
      setSelectedCardIds([...selectedCardIds, card.id]);
    } else {
      // If doesn't match value, switch selection to clicked card
      setSelectedCardIds([card.id]);
    }
  }

  function handlePlaySelectedCombo() {
    if (selectedCardIds.length === 0) return;
    if (selectedCardIds.length === 1 && onPlayCard) {
      const singleCard = hand.find(c => c.id === selectedCardIds[0]);
      if (singleCard) onPlayCard(singleCard);
    } else if (selectedCardIds.length > 1 && onPlayMultipleCards) {
      onPlayMultipleCards(selectedCardIds);
    }
    setSelectedCardIds([]);
  }

  return (
    <div className={`w-full max-w-4xl mx-auto px-2 sm:px-4 py-2.5 sm:py-3.5 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-slate-100 shadow-lg my-1.5 transition-all ${!isCurrentTurn ? 'bg-slate-50/80 border-slate-200' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 px-1 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎴 Kartu Tangan</span>
            <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-indigo-200">
              {hand.length}
            </span>
          </span>

          {/* In-Game Action Buttons: Chat & Stiker */}
          <div className="flex items-center gap-1 ml-1">
            {onOpenChat && (
              <button
                type="button"
                onClick={onOpenChat}
                className="px-2.5 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 text-[11px] font-black transition-all flex items-center gap-1 shadow-sm"
              >
                <span>💬</span>
                <span className="hidden sm:inline">Chat</span>
              </button>
            )}
            {onOpenEmote && (
              <button
                type="button"
                onClick={onOpenEmote}
                className="px-2.5 py-1 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-200 text-[11px] font-black transition-all flex items-center gap-1 shadow-sm"
              >
                <span>😊</span>
                <span className="hidden sm:inline">Stiker</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCardIds.length > 0 && isCurrentTurn && (
            <button
              type="button"
              onClick={handlePlaySelectedCombo}
              className="btn-candy btn-candy-emerald text-xs font-black py-1 px-3.5 shadow-md animate-bounce"
            >
              🚀 Mainkan {selectedCardIds.length > 1 ? `Combo (${selectedCardIds.length})` : 'Kartu'}
            </button>
          )}

          {isCurrentTurn && selectedCardIds.length === 0 && (
            <span className="text-[10px] sm:text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-300 shadow-sm animate-pulse">
              ⚡ Giliran Anda!
            </span>
          )}

          {!isCurrentTurn && (
            <span className="text-[10px] sm:text-xs font-black text-slate-500 bg-slate-100 px-2.5 sm:px-3 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Giliran: {activePlayerName || 'Lawan'} (Kartu dikunci 🔒)</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Scroll Row with extra top padding & high z-index for floating selected cards */}
      <div className={`flex items-center justify-start gap-2.5 sm:gap-3.5 overflow-x-auto pt-8 pb-5 px-3 min-h-[165px] sm:min-h-[190px] scrollbar-thin scrollbar-thumb-slate-300 transition-all ${!isCurrentTurn ? 'pointer-events-none opacity-60' : ''}`}>
        {hand.map((card) => {
          const isSelected = selectedCardIds.includes(card.id);
          return (
            <div
              key={card.id}
              className={`flex-shrink-0 transition-all duration-200 ${
                isSelected 
                  ? 'relative z-30 -translate-y-6 scale-105 sm:scale-110 ring-4 ring-amber-400 rounded-2xl shadow-2xl drop-shadow-2xl' 
                  : 'relative z-10 hover:z-20'
              }`}
            >
              <GameCard
                card={card}
                isPlayable={isCurrentTurn}
                disabled={!isCurrentTurn}
                onClick={() => toggleSelectCard(card)}
                size="md"
                showColorBlindSymbol={showColorBlindSymbol}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
