import { io } from 'socket.io-client';

export const socket = io({
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 12,
  reconnectionDelay: 700,
  transports: ['websocket', 'polling']
});
