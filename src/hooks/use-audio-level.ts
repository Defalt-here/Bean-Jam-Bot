import { useEffect, useRef, useState } from 'react';

export type AudioLevels = Float32Array | null;

export const useAudioLevel = (active: boolean) => {
  const [levels, setLevels] = useState<AudioLevels>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      // stop and cleanup
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      analyserRef.current = null;
      setLevels(null);
      return;
    }

    let mounted = true;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted) return;
        mediaStreamRef.current = stream;

  const AudioContextCtor = (window.AudioContext || (window as unknown as { webkitAudioContext?: (typeof AudioContext) | undefined }).webkitAudioContext) as typeof AudioContext;
  const audioCtx = new AudioContextCtor();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.6;
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const data = new Float32Array(bufferLength);

        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getFloatFrequencyData(data);
          // copy so React notices change
          setLevels(new Float32Array(data));
          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        console.warn('Microphone access error', err);
        setLevels(null);
      }
    };

    start();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      analyserRef.current = null;
    };
  }, [active]);

  return levels;
};

export default useAudioLevel;
