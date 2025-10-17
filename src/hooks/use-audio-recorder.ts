import { useRef, useState } from 'react';

export default function useAudioRecorder() {
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const options: MediaRecorderOptions | undefined = { mimeType: 'audio/webm;codecs=opus' };
    const recorder = new MediaRecorder(stream, options);
    mediaRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
    recorder.start();
    setIsRecording(true);
  }

  function stop(): Promise<Blob> {
    return new Promise(resolve => {
      const recorder = mediaRef.current;
      if (!recorder) return resolve(new Blob());
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
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
    if (!resp.ok) throw new Error(await resp.text());
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
