import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
  addNotificationFromSocket,
  updateNotificationFromSocket,
  deleteNotificationFromSocket,
} from '../features/notifications/notificationSlice';

const useSocket = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  const userId = user?._id;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to server (using relative path for proxied setup, or root URL)
    socketRef.current = io(window.location.origin || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket.IO connected. Registering user...');
      socket.emit('register', userId);
    });

    socket.on('new_notification', (notification) => {
      console.log('Socket notification received:', notification);
      dispatch(addNotificationFromSocket(notification));
    });

    socket.on('notification_updated', (notification) => {
      dispatch(updateNotificationFromSocket(notification));
    });

    socket.on('notification_deleted', (data) => {
      dispatch(deleteNotificationFromSocket(data));
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, userId, dispatch]);

  return socketRef.current;
};

export default useSocket;
