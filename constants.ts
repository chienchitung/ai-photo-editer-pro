
import { Adjustments, Preset, ArtisticStyle } from './types';

export const INITIAL_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  temperature: 0,
  tint: 0,
  sharpness: 0,
};

export const PRESET_FILTERS: Preset[] = [
  { name: 'None', adjustments: INITIAL_ADJUSTMENTS },
  { name: 'Vintage', adjustments: { brightness: 110, contrast: 90, saturate: 80, temperature: 10, tint: 5, sharpness: 5 } },
  { name: 'Noir', adjustments: { brightness: 100, contrast: 120, saturate: 0, temperature: 0, tint: 0, sharpness: 10 } },
  { name: 'Sunny', adjustments: { brightness: 115, contrast: 105, saturate: 120, temperature: 15, tint: -5, sharpness: 0 } },
  { name: 'Cool', adjustments: { brightness: 105, contrast: 95, saturate: 90, temperature: -15, tint: 10, sharpness: 5 } },
];

export const ARTISTIC_STYLES: ArtisticStyle[] = [
    { name: 'Oil Painting', prompt: 'Transform this photo into a detailed oil painting with visible brushstrokes.', previewUrl: 'https://images.unsplash.com/photo-1599745388834-0b89f28a5a54?w=100&h=100&fit=crop&q=80' },
    { name: 'Watercolor', prompt: 'Convert this image into a soft and vibrant watercolor painting.', previewUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=100&h=100&fit=crop&q=80' },
    { name: 'Cartoon', prompt: 'Turn this photo into a bold, colorful cartoon style with thick outlines.', previewUrl: 'https://images.unsplash.com/photo-1611078735399-ccc5a6c37482?w=100&h=100&fit=crop&q=80' },
    { name: 'Pixel Art', prompt: 'Convert this image into an 8-bit pixel art style.', previewUrl: 'https://images.unsplash.com/photo-1621935844302-0320f716c502?w=100&h=100&fit=crop&q=80' },
    { name: 'Sci-Fi', prompt: 'Reimagine this image with a futuristic, science-fiction aesthetic, including neon lights and holographic elements.', previewUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=100&h=100&fit=crop&q=80' },
    { name: 'Fantasy', prompt: 'Transform this image into a magical fantasy scene with enchanted lighting and mystical elements.', previewUrl: 'https://images.unsplash.com/photo-1505239925917-2e1a3b2f0a15?w=100&h=100&fit=crop&q=80' },
];

export const LOADING_MESSAGES = [
    "Summoning digital paintbrushes...",
    "Teaching the AI about art history...",
    "Reticulating splines...",
    "Generating masterpiece...",
    "Polishing pixels...",
    "One moment, art takes time...",
];