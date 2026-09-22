import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Socket.IO real-time server:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
    });
  }

  return socket;
};

export const joinUserRoom = (userId: string) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('join_user_room', userId);
  } else {
    s.on('connect', () => {
      s.emit('join_user_room', userId);
    });
  }
};
