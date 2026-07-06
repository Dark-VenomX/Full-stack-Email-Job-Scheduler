interface VantaOptions {
  el: HTMLElement;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
  color?: number;
  color2?: number;
  backgroundColor?: number;
  size?: number;
  amplitudeFactor?: number;
  haloColor?: number;
  yOffset?: number;
  xOffset?: number;
}

interface VantaHalo {
  (options: VantaOptions): { destroy: () => void };
}

declare global {
  interface Window {
    VANTA?: {
      HALO?: VantaHalo;
      CLOUDS?: any;
    };
    THREE?: unknown;
  }
}

export {};
