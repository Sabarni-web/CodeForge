import { Server } from 'socket.io';

let io = null;
const userSockets = new Map(); // userId -> Set of socketIds

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173'];
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('vercel.app')) {
          callback(null, true);
        } else {
          callback(null, origin);
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // Authenticate/register user connection
    socket.on('register', (userId) => {
      if (userId) {
        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
        socket.userId = userId;
        console.log(`Socket registered: User ${userId} with socket ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId && userSockets.has(socket.userId)) {
        const sockets = userSockets.get(socket.userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(socket.userId);
        }
        console.log(`Socket disconnected: User ${socket.userId} socket ${socket.id}`);
      }
    });
  });

  return io;
};

export const sendToUser = (userId, event, data) => {
  if (!io) return;
  const userIdStr = userId.toString();
  const sockets = userSockets.get(userIdStr);
  if (sockets) {
    for (const socketId of sockets) {
      io.to(socketId).emit(event, data);
    }
  }
};

export const getIo = () => io;
