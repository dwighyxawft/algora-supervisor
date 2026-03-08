import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Peer, { MediaConnection } from 'peerjs';
import { BASE_URL } from '@/lib/api/routes';

interface Participant {
  peerId: string;
  mentorId: string;
  stream: MediaStream | null;
}

interface MeetingState {
  isConnected: boolean;
  isAuthenticated: boolean;
  isMeetingStarted: boolean;
  connectionStatus: string;
  error: string | null;
}

export function useSupervisorMeeting(supervisorId: string) {
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<MediaConnection[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<MeetingState>({
    isConnected: false,
    isAuthenticated: false,
    isMeetingStarted: false,
    connectionStatus: 'Disconnected',
    error: null,
  });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());

  const addParticipant = useCallback((peerId: string, mentorId: string, stream: MediaStream | null) => {
    setParticipants(prev => {
      const next = new Map(prev);
      next.set(peerId, { peerId, mentorId, stream });
      return next;
    });
  }, []);

  const removeParticipant = useCallback((peerId: string) => {
    setParticipants(prev => {
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  }, []);

  const startMeeting = useCallback(async () => {
    if (!supervisorId) return;

    setState(s => ({ ...s, error: null, connectionStatus: 'Starting camera...' }));

    // Step 1: Capture camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera access denied. Please allow camera permissions.'
        : `Camera error: ${err.message}`;
      setState(s => ({ ...s, error: msg, connectionStatus: 'Camera failed' }));
      return;
    }

    // Step 2: Connect socket
    setState(s => ({ ...s, connectionStatus: 'Connecting...' }));
    const socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setState(s => ({ ...s, isConnected: true, connectionStatus: 'Authenticating...' }));
      // Step 2: Authenticate
      socket.emit('authenticate', { userId: supervisorId, userType: 'supervisor' });
    });

    socket.on('authenticated', () => {
      setState(s => ({ ...s, isAuthenticated: true, connectionStatus: 'Starting meeting...' }));

      // Step 3: Start meeting (joins room supervisor-call-{supervisorId})
      socket.emit('supervisor-start-meeting', { supervisorId });

      // Step 4: Initialize PeerJS
      const peer = new Peer({
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });
      peerRef.current = peer;

      peer.on('open', (peerId) => {
        // Step 5: Share peer ID
        socket.emit('supervisor-join-supervisor-call', { supervisorId, peerId });
        setState(s => ({
          ...s,
          isMeetingStarted: true,
          connectionStatus: 'Waiting for mentors...',
        }));
      });

      // Handle incoming calls from mentors
      peer.on('call', (call) => {
        call.answer(localStreamRef.current || undefined);
        call.on('stream', (remoteStream) => {
          const mentorId = call.metadata?.mentorId || call.metadata?.userId || 'unknown';
          addParticipant(call.peer, mentorId, remoteStream);
        });
        call.on('close', () => removeParticipant(call.peer));
        call.on('error', () => removeParticipant(call.peer));
        connectionsRef.current.push(call);
      });

      peer.on('error', (err) => {
        setState(s => ({ ...s, error: `Peer error: ${err.message}` }));
      });
    });

    // Mentor joined — receive their peerId and call them
    socket.on('mentor-join-supervisor-room', (data: { peerId: string; userId: string; userType: string }) => {
      setState(s => ({ ...s, connectionStatus: 'Mentor connecting...' }));

      if (peerRef.current && localStreamRef.current) {
        const call = peerRef.current.call(data.peerId, localStreamRef.current, {
          metadata: { userId: supervisorId, userType: 'supervisor' },
        });
        if (call) {
          call.on('stream', (remoteStream) => {
            addParticipant(data.peerId, data.userId, remoteStream);
            setState(s => ({ ...s, connectionStatus: `${participants.size + 1} mentor(s) connected` }));
          });
          call.on('close', () => removeParticipant(data.peerId));
          call.on('error', () => removeParticipant(data.peerId));
          connectionsRef.current.push(call);
        }
      }
    });

    socket.on('connect_error', (err) => {
      setState(s => ({ ...s, error: `Connection failed: ${err.message}`, connectionStatus: 'Connection failed' }));
    });

    socket.on('disconnect', () => {
      setState(s => ({ ...s, isConnected: false, isAuthenticated: false, connectionStatus: 'Disconnected' }));
    });
  }, [supervisorId, addParticipant, removeParticipant]);

  const endMeeting = useCallback(() => {
    // Stop all peer connections
    connectionsRef.current.forEach(c => c.close());
    connectionsRef.current = [];
    peerRef.current?.destroy();
    peerRef.current = null;

    // Stop camera
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);

    // Socket cleanup
    if (socketRef.current) {
      socketRef.current.emit('supervisor-end-meeting', { supervisorId });
      socketRef.current.emit('unauthenticate', { userId: supervisorId, userType: 'supervisor' });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setParticipants(new Map());
    setState({
      isConnected: false,
      isAuthenticated: false,
      isMeetingStarted: false,
      connectionStatus: 'Disconnected',
      error: null,
    });
  }, [supervisorId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { endMeeting(); };
  }, [endMeeting]);

  return { ...state, localStream, participants, startMeeting, endMeeting };
}
