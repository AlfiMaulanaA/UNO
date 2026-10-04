import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function VictoryModal({ isOpen, winnerName, isUserWinner, onPlayAgain, onExit }) {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-2xl text-center">
        <div className="text-6xl mb-2 animate-bounce">🏆</div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">
          {isUserWinner ? 'SELAMAT! ANDA MENANG!' : 'PERMAINAN SELESAI'}
        </h2>
        <p className="text-xs font-black text-amber-600 mb-6">
          {winnerName} berhasil menghabiskan seluruh kartu! 🎉
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="btn-candy btn-candy-emerald w-full text-xs font-black"
          >
            PLAY AGAIN 🔄
          </button>
          <button
            type="button"
            onClick={onExit}
            className="w-full py-3 rounded-2xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all"
          >
            KEMBALI KE MENU UTAMA
          </button>
        </div>
      </div>
    </div>
  );
}

export function PassDeviceModal({ isOpen, nextPlayerName, onReady }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-2xl text-center">
        <div className="text-5xl mb-3">📱</div>
        <h3 className="text-lg font-black text-slate-900 mb-1">OPER PERANGKAT</h3>
        <p className="text-xs font-bold text-slate-600 mb-6">
          Serahkan layar perangkat ke <span className="text-indigo-600 font-black">{nextPlayerName}</span>. Kartu akan disembunyikan sampai tombol siap ditekan.
        </p>

        <button
          type="button"
          onClick={onReady}
          className="btn-candy btn-candy-purple w-full text-xs font-black"
        >
          SAYA SIAP! TAMPILKAN KARTU 🚀
        </button>
      </div>
    </div>
  );
}

export function ExitModal({ isOpen, onConfirmExit, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
      <div className="w-full max-w-xs p-5 rounded-3xl bg-white border-2 border-slate-100 shadow-2xl text-center">
        <h4 className="text-base font-black text-slate-900 mb-2">Keluar Permainan?</h4>
        <p className="text-xs font-bold text-slate-500 mb-5">Progres pertandingan yang sedang berjalan akan dihentikan.</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-xs font-black bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirmExit}
            className="flex-1 btn-candy btn-candy-red text-xs font-black"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
