export type Tool = 'filters' | 'transform' | 'layers' | 'ai_edit' | 'style_transfer' | 'crop' | 'enhance';

export type AiMode = 'fill' | 'eraser';

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturate: number;
  temperature: number;
  tint: number;
  sharpness: number;
}

export interface Preset {
  name: string;
  adjustments: Adjustments;
}

export interface Layer {
  id: string;
  type: 'text';
  text: string;
  color: string;
  fontSize: number;
  x: number;
  y: number;
}

export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Transform {
    rotate: number;
    scaleX: number;
    scaleY: number;
}

export interface ArtisticStyle {
    name: string;
    prompt: string;
    previewUrl: string;
}
