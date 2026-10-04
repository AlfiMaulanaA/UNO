'use client';

import React, { useState } from 'react';
import { X, Flame, Laugh, MessageSquare, Smile } from 'lucide-react';

const CHEER_STICKERS = [
  '🔥 Semangat!',
  '💪 Gas In!',
  '🏆 GG Pro!',
  '🚀 Top Mantap!',
  '🌟 Hoki Abis!',
  '👏 Nice Move!',
  '❤️ Love ColorCards',
  '🎉 Pesta Menang!'
];

const TAUNT_STICKERS = [
  '🤡 Ups Kena +4!',
  '😭 Ampun Bang!',
  '💥 Skip Dulu ya!',
  '👀 Awas Kartu!',
  '🤪 Wkwkwk!',
  '😡 Balas Dendam!',
  '💣 Booom Combo!',
  '💩 Yahh Rungkad'
];

const QUICK_CHATS = [
  'Ayo lempar kartu! 🎴',
  'Semangat guys! 💪',
  'Minta warna merah dong! 🔴',
  'Minta warna biru dong! 🔵',
  'Masa giliranmu bos? ⏳',
  'LAST CARD! 🔥',
  'GG WP Permainan Seru! 🏆'
];

const EMOJIS = ['👍', '🔥', '🏆', '😭', '🎲', '😎', '😡', '🎉', '🤡', '👏', '❤️', '🥳', '💣', '💩', '😱'];

export default function EmotePicker({ onClose, onSelectEmote, onSelectChat }) {
  const [tab, setTab] = useState('CHEER'); // CHEER | TAUNT | CHAT | EMOJI

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-2xl relative animate-pop-in space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Smile className="w-5 h-5 text-amber-500" /> Stiker & Reaksi Interaktif
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setTab('CHEER')}
            className={`py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all ${
              tab === 'CHEER' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Semangat
          </button>

          <button
            type="button"
            onClick={() => setTab('TAUNT')}
            className={`py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all ${
              tab === 'TAUNT' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laugh className="w-3.5 h-3.5" /> Ejekan
          </button>

          <button
            type="button"
            onClick={() => setTab('CHAT')}
            className={`py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all ${
              tab === 'CHAT' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Pesan
          </button>

          <button
            type="button"
            onClick={() => setTab('EMOJI')}
            className={`py-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all ${
              tab === 'EMOJI' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smile className="w-3.5 h-3.5" /> Emoji
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'CHEER' && (
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {CHEER_STICKERS.map((sticker) => (
              <button
                type="button"
                key={sticker}
                onClick={() => {
                  onSelectEmote(sticker);
                  onClose();
                }}
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-emerald-900 font-extrabold text-xs text-left shadow-sm hover:scale-[1.02] transition-all"
              >
                {sticker}
              </button>
            ))}
          </div>
        )}

        {tab === 'TAUNT' && (
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {TAUNT_STICKERS.map((sticker) => (
              <button
                type="button"
                key={sticker}
                onClick={() => {
                  onSelectEmote(sticker);
                  onClose();
                }}
                className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-900 font-extrabold text-xs text-left shadow-sm hover:scale-[1.02] transition-all"
              >
                {sticker}
              </button>
            ))}
          </div>
        )}

        {tab === 'CHAT' && (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {QUICK_CHATS.map((msg) => (
              <button
                type="button"
                key={msg}
                onClick={() => {
                  if (onSelectChat) onSelectChat(msg);
                  else onSelectEmote(msg);
                  onClose();
                }}
                className="w-full p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 text-purple-900 font-extrabold text-xs text-left shadow-sm hover:scale-[1.01] transition-all"
              >
                {msg}
              </button>
            ))}
          </div>
        )}

        {tab === 'EMOJI' && (
          <div className="grid grid-cols-5 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {EMOJIS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                onClick={() => {
                  onSelectEmote(emoji);
                  onClose();
                }}
                className="text-3xl p-3 rounded-2xl bg-slate-50 hover:bg-amber-100 hover:scale-125 transition-all flex items-center justify-center border-2 border-slate-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
