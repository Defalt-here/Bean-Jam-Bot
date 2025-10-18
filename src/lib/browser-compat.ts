/**
 * Browser compatibility utilities
 * Detects browser capabilities and provides graceful fallbacks
 */

export interface BrowserCapabilities {
  hasMediaRecorder: boolean;
  hasGetUserMedia: boolean;
  hasAudioContext: boolean;
  hasGeolocation: boolean;
  supportedAudioFormats: string[];
  browserName: string;
  browserVersion: string;
}

/**
 * Detect browser name and version
 */
export function detectBrowser(): { name: string; version: string } {
  const ua = navigator.userAgent;
  
  // Chrome/Chromium/Edge (Chromium-based)
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    const match = ua.match(/Chrome\/(\d+)/);
    return { name: 'Chrome', version: match?.[1] || 'unknown' };
  }
  
  // Edge (Chromium)
  if (ua.includes('Edg')) {
    const match = ua.match(/Edg\/(\d+)/);
    return { name: 'Edge', version: match?.[1] || 'unknown' };
  }
  
  // Firefox
  if (ua.includes('Firefox')) {
    const match = ua.match(/Firefox\/(\d+)/);
    return { name: 'Firefox', version: match?.[1] || 'unknown' };
  }
  
  // Safari
  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/(\d+)/);
    return { name: 'Safari', version: match?.[1] || 'unknown' };
  }
  
  // Opera
  if (ua.includes('OPR') || ua.includes('Opera')) {
    const match = ua.match(/(?:OPR|Opera)\/(\d+)/);
    return { name: 'Opera', version: match?.[1] || 'unknown' };
  }
  
  return { name: 'Unknown', version: 'unknown' };
}

/**
 * Check browser capabilities
 */
export function checkBrowserCapabilities(): BrowserCapabilities {
  const browser = detectBrowser();
  
  return {
    hasMediaRecorder: typeof MediaRecorder !== 'undefined',
    hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    hasAudioContext: !!(window.AudioContext || (window as any).webkitAudioContext),
    hasGeolocation: 'geolocation' in navigator,
    supportedAudioFormats: getSupportedAudioFormats(),
    browserName: browser.name,
    browserVersion: browser.version,
  };
}

/**
 * Get all supported audio formats for MediaRecorder
 */
function getSupportedAudioFormats(): string[] {
  if (typeof MediaRecorder === 'undefined') {
    return [];
  }
  
  const formats = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/wav',
    'audio/mp4',
    'audio/mpeg',
  ];
  
  return formats.filter(format => MediaRecorder.isTypeSupported(format));
}

/**
 * Check if voice recording is supported
 */
export function isVoiceRecordingSupported(): boolean {
  const caps = checkBrowserCapabilities();
  return caps.hasMediaRecorder && caps.hasGetUserMedia && caps.supportedAudioFormats.length > 0;
}

/**
 * Get user-friendly error message for missing features
 */
export function getCompatibilityMessage(): string | null {
  const caps = checkBrowserCapabilities();
  
  if (!caps.hasGetUserMedia) {
    return `Voice recording requires microphone access. Please use a modern browser (Chrome 47+, Firefox 36+, Safari 11+, Edge 12+).`;
  }
  
  if (!caps.hasMediaRecorder) {
    return `Voice recording is not supported in ${caps.browserName}. Please update your browser or use Chrome, Firefox, Safari, or Edge.`;
  }
  
  if (caps.supportedAudioFormats.length === 0) {
    return `No audio formats are supported in your browser. Please update to the latest version.`;
  }
  
  return null; // All good!
}

/**
 * Log browser capabilities for debugging
 */
export function logBrowserInfo(): void {
  const caps = checkBrowserCapabilities();
  console.group('🌐 Browser Compatibility Check');
  console.log(`Browser: ${caps.browserName} ${caps.browserVersion}`);
  console.log(`MediaRecorder: ${caps.hasMediaRecorder ? '✅' : '❌'}`);
  console.log(`getUserMedia: ${caps.hasGetUserMedia ? '✅' : '❌'}`);
  console.log(`AudioContext: ${caps.hasAudioContext ? '✅' : '❌'}`);
  console.log(`Geolocation: ${caps.hasGeolocation ? '✅' : '❌'}`);
  console.log(`Supported Audio Formats:`, caps.supportedAudioFormats);
  
  const message = getCompatibilityMessage();
  if (message) {
    console.warn('⚠️ Compatibility Issue:', message);
  } else {
    console.log('✅ All features supported!');
  }
  console.groupEnd();
}
