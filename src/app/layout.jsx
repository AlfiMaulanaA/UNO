import './globals.css';

export const metadata = {
  title: 'ColorCards — Modern UNO Style Card Game',
  description: 'Bermain game kartu ColorCards (UNO) online dan offline secara gratis dengan bot AI atau teman!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-white text-slate-800 min-h-screen flex flex-col antialiased selection:bg-yellow-400 selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
