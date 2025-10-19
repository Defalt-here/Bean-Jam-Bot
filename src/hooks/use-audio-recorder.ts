import { useRef, useState } from 'react';

/**
 * Get the best supported audio format for the current browser
 * Priority: webm/opus (Chrome/Edge) > ogg/opus (Firefox) > audio/wav (Safari/fallback)
 */
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',  // Chrome, Edge, Opera
    'audio/ogg;codecs=opus',   // Firefox
    'audio/wav',               // Safari, fallback
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  // Ultimate fallback - let MediaRecorder use default
  return '';
}

export default function useAudioRecorder() {
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mimeTypeRef = useRef<string>('');

  async function start() {
    try {
      // Check for getUserMedia support (with legacy prefixes)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser. Please use a modern browser (Chrome, Firefox, Safari, Edge).');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      // Check MediaRecorder support
      if (typeof MediaRecorder === 'undefined') {
        stream.getTracks().forEach(t => t.stop());
        throw new Error('MediaRecorder not supported in this browser.');
      }
      
      // Get best supported format for this browser
      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      
      const options: MediaRecorderOptions | undefined = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      
      mediaRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      setIsRecording(false);
      throw error;
    }
  }

  function stop(): Promise<Blob> {
    return new Promise(resolve => {
      const recorder = mediaRef.current;
      if (!recorder) return resolve(new Blob());
      recorder.onstop = () => {
        // Use the actual mime type from the recorder (browser may override)
        const actualMimeType = recorder.mimeType || mimeTypeRef.current || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        setIsRecording(false);
        recorder.stream.getTracks().forEach(t => t.stop());
        resolve(blob);
      };
      recorder.stop();
      mediaRef.current = null;
    });
  }

  async function sendToServer(blob: Blob, languageCode = 'en-US') {
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = bufferToBase64(arrayBuffer);
    
    // Prefer environment-configured endpoint (e.g., Lambda Function URL),
    // fallback to local proxy route if not provided.
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
    const TRANSCRIBE_URL = env.VITE_TRANSCRIBE_API_URL || '/api/transcribe';
    
    const resp = await fetch(TRANSCRIBE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64: base64, mimeType: blob.type, languageCode }),
    });
    
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Transcription failed (${resp.status}): ${errorText}`);
    }
    
    return resp.json();
  }

  function bufferToBase64(ab: ArrayBuffer) {
    const bytes = new Uint8Array(ab);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
    }
    return btoa(binary);
  }

  return { start, stop, sendToServer, isRecording } as const;
}
