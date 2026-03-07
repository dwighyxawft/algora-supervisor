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
  connectionStatus: string;
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
    connectionStatus: 'Disconnected',
  });
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setState(s => ({ ...s, error: null, connectionStatus: 'Connecting...' }));

    const socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setState(s => ({ ...s, isConnected: true, error: null, connectionStatus: 'Authenticating...' }));
      // Step 1: Authenticate
      socket.emit('authenticate', { userId, userType });
    });

    socket.on('authenticated', () => {
      setState(s => ({ ...s, isAuthenticated: true, connectionStatus: 'Joining room...' }));
      // Step 2: Join room
      socket.emit('join-code-interview-room', {
        userId,
        userType: 'SUPERVISOR',
        roomId,
      });
      setState(s => ({ ...s, connectionStatus: 'Connected' }));
    });

    socket.on('user-joined', (data: { userId: string; userType: string }) => {
      if (data.userType === 'MENTOR') {
        setState(s => ({ ...s, mentorJoined: true, connectionStatus: 'Mentor connected' }));
      }
    });

    socket.on('peer-id', (data: PeerIdEvent) => {
      if (data.userType === 'mentor') {
        setRemotePeerId(data.peerId);
        setState(s => ({ ...s, connectionStatus: 'Receiving mentor streams...' }));
      }
    });

    socket.on('user-left', (data: { userId: string; userType: string }) => {
      if (data.userType === 'MENTOR') {
        setState(s => ({ ...s, mentorJoined: false, connectionStatus: 'Waiting for mentor...' }));
        setRemotePeerId(null);
      }
    });

    socket.on('connect_error', (err) => {
      setState(s => ({ ...s, error: `Connection failed: ${err.message}`, connectionStatus: 'Connection failed' }));
    });

    socket.on('disconnect', () => {
      setState(s => ({ ...s, isConnected: false, isAuthenticated: false, connectionStatus: 'Disconnected' }));
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
    setState({ isConnected: false, isAuthenticated: false, error: null, mentorJoined: false, connectionStatus: 'Disconnected' });
    setRemotePeerId(null);
  }, [userId, userType, roomId]);

  useEffect(() => {
    if (autoConnect) connect();
    return () => { disconnect(); };
  }, [autoConnect, connect, disconnect]);

  return { ...state, remotePeerId, connect, disconnect, sharePeerId };
}
