
import { Adjustments, Transform } from './types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const applyClientSideEdits = (
  baseImage: string,
  adjustments: Adjustments,
  transform: Transform
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(baseImage);
        return;
      }
      
      const rad = transform.rotate * Math.PI / 180;
      const absCos = Math.abs(Math.cos(rad));
      const absSin = Math.abs(Math.sin(rad));
      
      const newWidth = img.width * absCos + img.height * absSin;
      const newHeight = img.height * absCos + img.width * absSin;

      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(rad);
      ctx.scale(transform.scaleX, transform.scaleY);
      
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if(!tempCtx){
        resolve(baseImage);
        return;
      }
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      tempCtx.filter = getCssFilterString(adjustments);
      tempCtx.drawImage(img, 0, 0);

      ctx.drawImage(tempCanvas, -img.width / 2, -img.height / 2);
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = baseImage;
  });
};


export const getCssFilterString = (adjustments: Adjustments): string => {
    const { brightness, contrast, saturate, temperature, tint, sharpness } = adjustments;
    // Note: CSS doesn't have direct filters for temperature/tint/sharpness. We fake them.
    // Temperature/Tint are approximated with sepia and hue-rotate.
    // Sharpness is approximated with a drop-shadow trick or url(#sharpen) SVG filter.
    // For simplicity here, we apply filters that exist.
    // A more complex implementation would use an SVG filter for sharpness.
    
    // Convert temperature (-100 to 100) to sepia and hue-rotate
    const sepia = temperature > 0 ? temperature / 5 : 0; // warm = more sepia
    const hue = temperature < 0 ? 180 + temperature / 2 : 0; // cool = shift towards blue

    return [
      `brightness(${brightness / 100})`,
      `contrast(${contrast / 100})`,
      `saturate(${saturate / 100})`,
      `sepia(${sepia / 100})`,
      `hue-rotate(${hue}deg)`,
      // A more robust sharpness filter would be implemented via SVG or a sharpening matrix on canvas
    ].join(' ');
};
