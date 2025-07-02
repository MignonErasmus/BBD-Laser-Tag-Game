// src/global.d.ts
declare namespace AR {
  class Detector {
    constructor(config?: {
      dictionary?: string;
      minMarkerPerimeter?: number;
      maxMarkerPerimeter?: number;
      sizeAfterPerspectiveRemoval?: number;
    });
    
    detect(imageData: ImageData): Array<{
      id: number;
      corners: Array<{ x: number; y: number }>;
      center: { x: number; y: number };
    }>;
  }
}

declare namespace MarkerGenerator {
  function generateMarker(id: number, size?: number): string;
}