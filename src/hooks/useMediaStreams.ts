import { useEffect, useRef, useState, useCallback } from 'react';

interface MediaStreamState {
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
}

export function useMediaStreams() {
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<MediaStreamState>({ stream: null, isActive: false, error: null });

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      setState({ stream, isActive: true, error: null });
      return stream;
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera access denied. Please allow camera permissions.'
        : `Camera error: ${err.message}`;
      setState(s => ({ ...s, error: msg }));
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setState({ stream: null, isActive: false, error: null });
  }, []);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  return { ...state, startCamera, stopCamera };
}
