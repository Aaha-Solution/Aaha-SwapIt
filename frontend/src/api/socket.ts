import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || undefined;

    socket = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: token ? { token } : undefined,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Socket.IO real-time server:', socket?.id);
      // If user is authenticated in localStorage, auto join user room
      const userRaw = localStorage.getItem('user');
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          if (user?.id) {
            socket?.emit('join_user_room', user.id);
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ Socket connection error:', error.message);
    });
  }

  return socket;
};

export const updateSocketAuth = (token: string | null) => {
  if (socket) {
    if (token) {
      socket.auth = { token };
      if (!socket.connected) {
        socket.connect();
      }
    } else {
      socket.auth = {};
    }
  }
};

export const joinUserRoom = (userId: string) => {
  const s = getSocket();
  if (s.connected) {
    s.emit('join_user_room', userId);
  } else {
    s.once('connect', () => {
      s.emit('join_user_room', userId);
    });
  }
};

export const checkUserOnline = (userId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const s = getSocket();
    if (!s.connected) {
      return resolve(false);
    }
    s.emit('check_user_online', userId, (isOnline: boolean) => {
      resolve(isOnline);
    });
    // Fallback timeout in case server doesn't respond
    setTimeout(() => resolve(false), 2000);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
