import { io } from 'socket.io-client';

let socket = null;
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || null;

export function getSocket() {
  if (typeof window === 'undefined') return null;
  if (!SOCKET_URL && window.location.hostname.includes('vercel.app')) {
    return null;
  }
  if (!socket) {
    socket = io(SOCKET_URL || undefined, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 3000
    });
  }
  return socket;
}
