import { Server } from 'http';
import { Server as IOServer } from 'socket.io';
import { registerChatNamespace } from './modules/Chat/chat.socket';

// Store the io instance at module level
export let ioInstance: IOServer | null = null;

export const initializeSocket = (Server: Server) => {
  ioInstance = new IOServer(Server, {
    cors: {
      origin: '*',

      // origin: ['http://localhost:5173', 'https://chattychatapp.vercel.app'],
      // // origin: '*', // Adjust for production
      // methods: ['GET', 'POST'],
    },
  });

  const chatNsp = ioInstance.of('/chat');
  registerChatNamespace(chatNsp);

  return ioInstance;
};

export const getIO = () => ioInstance;
