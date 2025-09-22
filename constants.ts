
import { Adjustments, Preset, ArtisticStyle } from './types';
import { 
    OIL_PAINTING_PREVIEW,
    WATERCOLOR_PREVIEW,
    CARTOON_PREVIEW,
    PIXEL_ART_PREVIEW,
    SCI_FI_PREVIEW,
    FANTASY_PREVIEW
} from './assets/images';

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
    { name: 'Oil Painting', prompt: 'Transform this photo into a detailed oil painting with visible brushstrokes.', previewUrl: OIL_PAINTING_PREVIEW },
    { name: 'Watercolor', prompt: 'Convert this image into a soft and vibrant watercolor painting.', previewUrl: WATERCOLOR_PREVIEW },
    { name: 'Cartoon', prompt: 'Turn this photo into a bold, colorful cartoon style with thick outlines.', previewUrl: CARTOON_PREVIEW },
    { name: 'Pixel Art', prompt: 'Convert this image into an 8-bit pixel art style.', previewUrl: PIXEL_ART_PREVIEW },
    { name: 'Sci-Fi', prompt: 'Reimagine this image with a futuristic, science-fiction aesthetic, including neon lights and holographic elements.', previewUrl: SCI_FI_PREVIEW },
    { name: 'Fantasy', prompt: 'Transform this image into a magical fantasy scene with enchanted lighting and mystical elements.', previewUrl: FANTASY_PREVIEW },
];

export const LOADING_MESSAGES = [
    "Summoning digital paintbrushes...",
    "Teaching the AI about art history...",
    "Reticulating splines...",
    "Generating masterpiece...",
    "Polishing pixels...",
    "One moment, art takes time...",
];
