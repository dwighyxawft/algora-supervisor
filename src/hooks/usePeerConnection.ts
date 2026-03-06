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

    // Listen for incoming calls from mentor
    peer.on('call', (call) => {
      // Answer with supervisor's local stream
      call.answer(localStream || undefined);

      call.on('stream', (remoteStream) => {
        assignStream(remoteStream);
      });

      call.on('error', (err) => {
        console.error('Call error:', err);
      });

      connectionsRef.current.push(call);
    });

    peer.on('error', (err) => {
      setState(s => ({ ...s, error: `Peer error: ${err.message}` }));
    });
  }, [localStream]);

  const assignStream = useCallback((stream: MediaStream) => {
    // Detect stream type: screen share typically has a video track with displaySurface
    // or higher resolution. Camera streams have audio tracks usually.
    const videoTrack = stream.getVideoTracks()[0];
    const settings = videoTrack?.getSettings();

    // displaySurface is set for screen shares in most browsers
    const isScreenShare = (settings as any)?.displaySurface != null
      || (videoTrack?.label?.toLowerCase().includes('screen'))
      || (videoTrack?.label?.toLowerCase().includes('window'))
      || (videoTrack?.label?.toLowerCase().includes('monitor'))
      || (videoTrack?.label?.toLowerCase().includes('display'));

    setRemoteStreams(prev => {
      if (isScreenShare || (!prev.mentorScreen && prev.mentorCamera)) {
        return { ...prev, mentorScreen: stream };
      }
      return { ...prev, mentorCamera: stream };
    });
  }, []);

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

  return { ...state, remoteStreams, createPeer, destroyPeer };
}
