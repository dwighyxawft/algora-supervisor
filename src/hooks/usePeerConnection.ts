import { useEffect, useRef, useState, useCallback } from 'react';
import Peer, { MediaConnection } from 'peerjs';

interface PeerState {
  peerId: string | null;
  isReady: boolean;
  error: string | null;
}

interface StreamSet {
  mentorCamera: MediaStream | null;
  mentorScreen: MediaStream | null;
}

export function usePeerConnection(localStream: MediaStream | null) {
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<MediaConnection[]>([]);
  const [state, setState] = useState<PeerState>({ peerId: null, isReady: false, error: null });
  const [remoteStreams, setRemoteStreams] = useState<StreamSet>({ mentorCamera: null, mentorScreen: null });
  // Track whether we already placed an outgoing call so we know incoming = screen
  const outgoingCallPlacedRef = useRef(false);
  const incomingCallCountRef = useRef(0);

  const createPeer = useCallback(() => {
    if (peerRef.current) return;

    const peer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peerRef.current = peer;
    outgoingCallPlacedRef.current = false;
    incomingCallCountRef.current = 0;

    peer.on('open', (id) => {
      setState({ peerId: id, isReady: true, error: null });
    });

    // Handle incoming calls from mentor
    // Per the spec:
    // - If supervisor called mentor first (outgoing call placed), the incoming call is mentor's screen share
    // - If mentor calls first (no outgoing call), first incoming = camera, second incoming = screen
    peer.on('call', (call) => {
      // Answer with supervisor's camera stream
      call.answer(localStream || undefined);

      call.on('stream', (remoteStream) => {
        // Use metadata if available
        if (call.metadata?.type === 'screen') {
          setRemoteStreams(prev => ({ ...prev, mentorScreen: remoteStream }));
          return;
        }
        if (call.metadata?.type === 'camera') {
          setRemoteStreams(prev => ({ ...prev, mentorCamera: remoteStream }));
          return;
        }

        // Fallback logic
        if (outgoingCallPlacedRef.current) {
          // We already called mentor (got camera back), so this incoming call = screen share
          setRemoteStreams(prev => ({ ...prev, mentorScreen: remoteStream }));
        } else {
          // Mentor called us first
          incomingCallCountRef.current++;
          if (incomingCallCountRef.current === 1) {
            // First incoming = camera
            setRemoteStreams(prev => ({ ...prev, mentorCamera: remoteStream }));
          } else {
            // Second incoming = screen share
            setRemoteStreams(prev => ({ ...prev, mentorScreen: remoteStream }));
          }
        }
      });

      call.on('error', (err) => {
        console.error('Incoming call error:', err);
      });

      connectionsRef.current.push(call);
    });

    peer.on('error', (err) => {
      setState(s => ({ ...s, error: `Peer error: ${err.message}` }));
    });
  }, [localStream]);

  // Call mentor — the remote stream back from this call is mentor's camera
  const callPeer = useCallback((remotePeerId: string) => {
    if (!peerRef.current || !localStream) return;
    outgoingCallPlacedRef.current = true;

    const call = peerRef.current.call(remotePeerId, localStream, {
      metadata: { type: 'camera' },
    });
    if (!call) return;

    call.on('stream', (remoteStream) => {
      // The stream we get back from our outgoing call is mentor's camera
      setRemoteStreams(prev => ({ ...prev, mentorCamera: remoteStream }));
    });

    call.on('error', (err) => {
      console.error('Outgoing call error:', err);
    });

    connectionsRef.current.push(call);
  }, [localStream]);

  const destroyPeer = useCallback(() => {
    connectionsRef.current.forEach(c => c.close());
    connectionsRef.current = [];
    peerRef.current?.destroy();
    peerRef.current = null;
    outgoingCallPlacedRef.current = false;
    incomingCallCountRef.current = 0;
    setState({ peerId: null, isReady: false, error: null });
    setRemoteStreams({ mentorCamera: null, mentorScreen: null });
  }, []);

  useEffect(() => {
    return () => { destroyPeer(); };
  }, [destroyPeer]);

  return { ...state, remoteStreams, createPeer, destroyPeer, callPeer };
}
