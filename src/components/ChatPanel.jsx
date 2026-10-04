'use client';

import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function ChatPanel({ messages = [], onClose, onSendMessage }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-2xl flex flex-col h-[440px] relative animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3 mb-3">
          <h3 className="text-sm font-black text-slate-800">Obrolan Permainan</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3">
          {messages.length === 0 ? (
            <div className="text-center text-xs font-bold text-slate-400 py-12">Belum ada pesan. Sapa pemain lain!</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id || msg.time} className="p-3 rounded-2xl bg-slate-50 border-2 border-slate-100 text-xs">
                <div className="flex items-center justify-between font-black mb-1">
                  <span className="text-indigo-600">{msg.sender}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{msg.time}</span>
                </div>
                <div className="text-slate-800 font-extrabold break-words">{msg.text}</div>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            maxLength={100}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="btn-candy btn-candy-purple text-xs font-black px-4 py-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
