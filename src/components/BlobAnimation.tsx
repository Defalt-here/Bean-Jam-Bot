import { useEffect, useRef } from 'react';

interface BlobAnimationProps {
  isLoading: boolean;
  isBehind: boolean;
  mode?: 'normal' | 'create';
  levels?: Float32Array | null;
}

export const BlobAnimation = ({ isLoading, isBehind, mode = 'normal', levels }: BlobAnimationProps) => {
  const blobRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const levelsRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (!blobRef.current) return;

    const el = blobRef.current;

    const animate = () => {
      if (!el) return;
      const time = performance.now() * 0.001;

      // read latest audio levels (if any) to drive visual reactions
      const currentLevels = levelsRef.current;
      let audioBoost = 0;
      if (currentLevels && currentLevels.length > 0) {
        // compute RMS-like average over a subset for responsiveness
        const len = Math.min(currentLevels.length, 64);
        let sum = 0;
        for (let i = 0; i < len; i++) {
          // currentLevels are in dB (negative), map -60..0 -> 0..1
          const v = currentLevels[i];
          const linear = Math.max(0, 1 + v / 60);
          sum += linear;
        }
        const avg = sum / len;
        // normalize and clamp to [0,1] with a small threshold
        audioBoost = Math.max(0, (avg - 0.02) / 0.45);
      }

      const baseIntensity = isLoading ? 1.6 : 0.8;
      const modeBoost = mode === 'create' ? 1.6 : 1;
      // audioBoost increases intensity dynamically when user speaks
      const intensity = baseIntensity * modeBoost * (1 + audioBoost * (mode === 'create' ? 1.6 : 1.2));

      const x = Math.sin(time * 0.6) * 22 * intensity;
      const y = Math.cos(time * 0.9) * 18 * intensity;
      const rotate = Math.sin(time * 0.4) * 8 * intensity;
      const scale = 1 + Math.sin(time * 1.2) * 0.08 * intensity;

      el.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;

  // adjust blur/saturate based on audio activity
  // when the blob is behind (chat mode) use a lower base blur so it appears sharper
  const baseBlur = isBehind ? 12 : 26;
  const blur = baseBlur - audioBoost * (isBehind ? 6 : 10);
  const saturate = 120 + audioBoost * (isBehind ? 40 : 80);
      el.style.filter = `blur(${blur}px) saturate(${saturate}%)`;

      // update inner glow intensity if present
      const glow = el.querySelector<HTMLElement>('.absolute.inset-0.rounded-full');
      if (glow) {
        const glowAlpha = 0.22 + audioBoost * 0.5;
        if (mode === 'create') {
          glow.style.boxShadow = `0 40px 120px rgba(168,85,247,${0.18 + audioBoost * 0.45})`;
        } else {
          glow.style.boxShadow = `0 30px 90px rgba(16,185,129,${glowAlpha})`;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isLoading, mode, isBehind]);

  // keep levelsRef updated without re-creating the animation effect
  useEffect(() => {
    levelsRef.current = levels ?? null;
  }, [levels]);

  // colors and intensity vary for 'create' mode
  const rootClasses = `fixed inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-700 ${isBehind ? 'z-0 opacity-70' : 'z-20 opacity-100'}`;
  const blobBase = `relative w-96 h-96 rounded-full blob-filter mix-blend-screen transition-all duration-300 ${isLoading ? 'opacity-100' : 'opacity-60'}`;
  const blobBgClass = mode === 'create' ? 'blob-bg-create' : 'blob-bg-normal';
  const shadowClass = mode === 'create' ? 'blob-create-shadow' : 'blob-normal-shadow';

  // compute 8-band equalizer values if levels provided
  const bandCount = 8;
  let bands: number[] | null = null;
  if (levels && levels.length > 0) {
    bands = new Array(bandCount).fill(0).map((_, i) => {
      const start = Math.floor((i / bandCount) * levels.length);
      const end = Math.floor(((i + 1) / bandCount) * levels.length);
      let sum = 0;
      for (let j = start; j < end; j++) {
        // levels are in dB (negative); convert to linear-ish
        const v = levels[j];
        const linear = Math.max(0, 1 + v / 60); // map -60..0 to 0..1
        sum += linear;
      }
      return sum / Math.max(1, end - start);
    });
  }

  return (
    <div className={rootClasses}>
      <div ref={blobRef} className={`${blobBase} ${blobBgClass}`}>
        {/* soft inner glow */}
        <div className={`absolute inset-0 rounded-full ${shadowClass}`} />

        {/* equalizer overlay when audio levels are active */}
        {bands && (
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
            <div className="flex items-end gap-2 w-56 px-4">
              {bands.map((b, idx) => {
                const heightPx = `${Math.max(6, b * 160)}px`;
                const varStyle: Record<string, string> = { '--h': heightPx };
                return <div key={idx} className="flex-1 bg-white/80 rounded-sm eq-bar eq-bar-var" style={varStyle} />;
              })}
            </div>
          </div>
        )}

        {/* goo filter to subtly blend multiple shapes if we later add them */}
        <svg className="absolute -z-10" width="0" height="0" aria-hidden>
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
};
