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

  const assignStream = useCallback((stream: MediaStream, metadata?: any) => {
    // Use metadata sent by the caller to determine stream type
    if (metadata?.type === 'screen') {
      setRemoteStreams(prev => ({ ...prev, mentorScreen: stream }));
      return;
    }
    if (metadata?.type === 'camera') {
      setRemoteStreams(prev => ({ ...prev, mentorCamera: stream }));
      return;
    }

    // Fallback: detect via track settings
    const videoTrack = stream.getVideoTracks()[0];
    const settings = videoTrack?.getSettings();
    const isScreenShare = (settings as any)?.displaySurface != null
      || videoTrack?.label?.toLowerCase().includes('screen')
      || videoTrack?.label?.toLowerCase().includes('window')
      || videoTrack?.label?.toLowerCase().includes('monitor')
      || videoTrack?.label?.toLowerCase().includes('display');

    setRemoteStreams(prev => {
      if (isScreenShare || (!prev.mentorScreen && prev.mentorCamera)) {
        return { ...prev, mentorScreen: stream };
      }
      return { ...prev, mentorCamera: stream };
    });
  }, []);

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

    peer.on('open', (id) => {
      setState({ peerId: id, isReady: true, error: null });
    });

    // Listen for incoming calls from mentor (both scenarios)
    peer.on('call', (call) => {
      call.answer(localStream || undefined);

      call.on('stream', (remoteStream) => {
        assignStream(remoteStream, call.metadata);
      });

      call.on('error', (err) => {
        console.error('Call error:', err);
      });

      connectionsRef.current.push(call);
    });

    peer.on('error', (err) => {
      setState(s => ({ ...s, error: `Peer error: ${err.message}` }));
    });
  }, [localStream, assignStream]);

  // Call mentor when supervisor joins first and receives mentor's peerId
  const callPeer = useCallback((remotePeerId: string) => {
    if (!peerRef.current || !localStream) return;
    const call = peerRef.current.call(remotePeerId, localStream);
    if (!call) return;

    call.on('stream', (remoteStream) => {
      assignStream(remoteStream, call.metadata);
    });

    call.on('error', (err) => {
      console.error('Outgoing call error:', err);
    });

    connectionsRef.current.push(call);
  }, [localStream, assignStream]);

  const destroyPeer = useCallback(() => {
    connectionsRef.current.forEach(c => c.close());
    connectionsRef.current = [];
    peerRef.current?.destroy();
    peerRef.current = null;
    setState({ peerId: null, isReady: false, error: null });
    setRemoteStreams({ mentorCamera: null, mentorScreen: null });
  }, []);

  useEffect(() => {
    return () => { destroyPeer(); };
  }, [destroyPeer]);

  return { ...state, remoteStreams, createPeer, destroyPeer, callPeer };
}
