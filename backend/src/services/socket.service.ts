import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from '../config/env';

let io: SocketIOServer | null = null;

export function initSocketServer(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    // console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Client registers their user ID to join a dedicated private room
    socket.on('join_user_room', (userId: string) => {
      if (userId) {
        const room = `user:${userId}`;
        socket.join(room);
        // console.log(`[Socket.IO] Socket ${socket.id} joined room ${room}`);
      }
    });

    // Leave room
    socket.on('leave_user_room', (userId: string) => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Emit a real-time notification to a specific user's room
 */
export function emitToUser(userId: string, event: string, data: any): void {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Broadcast an event to all connected clients
 */
export function broadcast(event: string, data: any): void {
  if (io) {
    io.emit(event, data);
  }
}
