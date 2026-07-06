import { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

const palettes = {
  dark: {
    backgroundColor: 0x0a0e1f,
    skyColor: 0x1a2b4c,
    cloudColor: 0x2a3b5c,
    cloudShadowColor: 0x000000,
    sunColor: 0x4a4a5a,
    sunGlareColor: 0x2a2a3a,
    sunlightColor: 0x3a3a4a,
    speed: 1,
  },
  light: {
    backgroundColor: 0xffffff,
    skyColor: 0x68b8d7,
    cloudColor: 0xadc1de,
    cloudShadowColor: 0x183550,
    sunColor: 0xff9919,
    sunGlareColor: 0xff6633,
    sunlightColor: 0xff9933,
    speed: 1,
  },
} as const;

export function BackgroundWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<{ destroy: () => void } | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    // Tear down any existing effect before re-initializing with the new palette.
    effectRef.current?.destroy();
    effectRef.current = null;

    const init = () => {
      if (cancelled || !window.VANTA?.CLOUDS || !el) return;
      effectRef.current = window.VANTA.CLOUDS({
        el,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        ...palettes[theme],
      });
    };

    if (window.VANTA?.CLOUDS) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.VANTA?.CLOUDS) {
          clearInterval(interval);
          init();
        }
      }, 200);
      return () => {
        cancelled = true;
        clearInterval(interval);
        effectRef.current?.destroy();
        effectRef.current = null;
      };
    }

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, [theme]);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full">
      <div className="relative z-10">{children}</div>
    </div>
  );
}
