import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '@/lib/api/routes';

interface UseSocketConnectionOptions {
  userId: string;
  userType: 'supervisor';
  roomId: string;
  autoConnect?: boolean;
}

interface SocketState {
  isConnected: boolean;
  isAuthenticated: boolean;
  error: string | null;
  mentorJoined: boolean;
}

interface PeerIdEvent {
  peerId: string;
  userId: string;
  userType: 'mentor' | 'supervisor';
}

export function useSocketConnection({ userId, userType, roomId, autoConnect = false }: UseSocketConnectionOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    isAuthenticated: false,
    error: null,
    mentorJoined: false,
  });
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setState(s => ({ ...s, error: null }));

    const socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setState(s => ({ ...s, isConnected: true, error: null }));

      // Step 1: Authenticate
      socket.emit('authenticate', { userId, userType });
    });

    socket.on('authenticated', () => {
      setState(s => ({ ...s, isAuthenticated: true }));

      // Step 2: Join room
      socket.emit('join-code-interview-room', {
        userId,
        userType: 'SUPERVISOR',
        roomId,
      });
    });

    socket.on('user-joined', (data: { userId: string; userType: string }) => {
      if (data.userType === 'MENTOR') {
        setState(s => ({ ...s, mentorJoined: true }));
      }
    });

    socket.on('peer-id', (data: PeerIdEvent) => {
      if (data.userType === 'mentor') {
        setRemotePeerId(data.peerId);
      }
    });

    socket.on('user-left', (data: { userId: string; userType: string }) => {
      if (data.userType === 'MENTOR') {
        setState(s => ({ ...s, mentorJoined: false }));
        setRemotePeerId(null);
      }
    });

    socket.on('connect_error', (err) => {
      setState(s => ({ ...s, error: `Connection failed: ${err.message}` }));
    });

    socket.on('disconnect', () => {
      setState(s => ({ ...s, isConnected: false, isAuthenticated: false }));
    });
  }, [userId, userType, roomId]);

  const sharePeerId = useCallback((peerId: string) => {
    socketRef.current?.emit('send-peer-id-to-code-interview-room', {
      peerId,
      userId,
      userType: 'SUPERVISOR',
      roomId,
    });
  }, [userId, roomId]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave-code-interview-room', {
        userId,
        userType: 'SUPERVISOR',
        roomId,
      });
      socketRef.current.emit('unauthenticate', { userId, userType });
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setState({ isConnected: false, isAuthenticated: false, error: null, mentorJoined: false });
    setRemotePeerId(null);
  }, [userId, userType, roomId]);

  useEffect(() => {
    if (autoConnect) connect();
    return () => { disconnect(); };
  }, [autoConnect, connect, disconnect]);

  return { ...state, remotePeerId, connect, disconnect, sharePeerId };
}
