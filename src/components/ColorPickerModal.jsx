import React from 'react';

export default function ColorPickerModal({ isOpen = false, onSelectColor }) {
  if (!isOpen) return null;

  const colors = [
    { id: 'red', name: 'Merah', symbol: '●', bg: 'btn-candy-red text-white' },
    { id: 'blue', name: 'Biru', symbol: '◆', bg: 'btn-candy-blue text-white' },
    { id: 'green', name: 'Hijau', symbol: '▲', bg: 'btn-candy-emerald text-white' },
    { id: 'yellow', name: 'Kuning', symbol: '★', bg: 'btn-candy-yellow text-slate-900' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-3xl bg-white border-2 border-slate-100 shadow-2xl text-center">
        <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center justify-center gap-2">
          <span>🌈</span> Pilih Warna Selanjutnya
        </h3>
        <p className="text-xs font-bold text-slate-500 mb-6">
          Anda memainkan kartu Wild! Pilih warna aktif untuk pemain berikutnya.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {colors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectColor(c.id)}
              className={`
                btn-candy p-4 rounded-2xl font-black text-base flex flex-col items-center justify-center gap-1.5 
                transition-all duration-200 ${c.bg}
              `}
            >
              <span className="text-3xl">{c.symbol}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
