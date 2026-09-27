import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const socketService = {
  /**
   * Connect to the Socket.IO server and join user's private notification channel
   */
  connect(userId?: string): Socket {
    if (!socket) {
      socket = io(SOCKET_URL, {
        autoConnect: true,
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        // console.log('[Socket.IO] Connected with ID:', socket?.id);
        if (userId) {
          socket?.emit('join_user_room', userId);
        }
      });
    } else {
      if (!socket.connected) {
        socket.connect();
      }
      if (userId) {
        socket.emit('join_user_room', userId);
      }
    }

    return socket;
  },

  /**
   * Disconnect the socket
   */
  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Subscribe to real-time notifications for the current user
   */
  onNotification(callback: (notification: any) => void): () => void {
    if (!socket) this.connect();
    socket?.on('notification:new', callback);
    return () => {
      socket?.off('notification:new', callback);
    };
  },

  /**
   * Subscribe to report status changes
   */
  onStatusChanged(callback: (data: any) => void): () => void {
    if (!socket) this.connect();
    socket?.on('report:status_changed', callback);
    return () => {
      socket?.off('report:status_changed', callback);
    };
  },

  /**
   * Subscribe to new reports broadcast
   */
  onNewReport(callback: (data: any) => void): () => void {
    if (!socket) this.connect();
    socket?.on('report:new', callback);
    return () => {
      socket?.off('report:new', callback);
    };
  },
};
