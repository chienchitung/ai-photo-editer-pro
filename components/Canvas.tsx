import React, { useRef, useEffect, useState } from 'react';
import { Layer, Tool } from '../types';

interface CanvasProps {
  image: string | null;
  layers: Layer[];
  activeTool: Tool;
  onApplyCrop: (cropDataUrl: string) => void;
  onGenerativeFill: (maskBase64: string, prompt: string, mimeType: string) => void;
  brushSize: number;
  aiPrompt: string;
  imageRef: React.RefObject<HTMLImageElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

interface Point {
    x: number;
    y: number;
}

const WelcomeScreen: React.FC = () => (
    <div className="text-center text-gray-400 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-xl bg-gray-800/50">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-300">Welcome to AI Photo Editor Pro</h2>
        <p className="mt-2">Upload an image to begin your creative journey.</p>
    </div>
);

export const Canvas: React.FC<CanvasProps> = ({ image, layers, activeTool, onApplyCrop, imageRef, containerRef, onGenerativeFill, brushSize, aiPrompt }) => {
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [cropStartPoint, setCropStartPoint] = useState<Point | null>(null);
  const [cropEndPoint, setCropEndPoint] = useState<Point | null>(null);

  const clearMaskCanvas = () => {
    const canvas = maskCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    clearMaskCanvas();
    setCropStartPoint(null);
    setCropEndPoint(null);
  }, [activeTool, image]);

  const getPoint = (e: React.MouseEvent): Point => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'ai_edit' && activeTool !== 'crop') return;
    setIsDrawing(true);
    const point = getPoint(e);
    if(activeTool === 'crop') {
        setCropStartPoint(point);
        setCropEndPoint(point);
    } else { // ai_edit
        const ctx = maskCanvasRef.current?.getContext('2d');
        if(!ctx) return;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const point = getPoint(e);
     if(activeTool === 'crop' && cropStartPoint) {
        setCropEndPoint(point);
    } else if (activeTool === 'ai_edit') {
        const canvas = maskCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
     if (activeTool === 'ai_edit') {
        const ctx = maskCanvasRef.current?.getContext('2d');
        ctx?.closePath();
    }
  };
  
  const handleApplyCropClick = () => {
    if (!cropStartPoint || !cropEndPoint || !imageRef.current) return;
    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    
    const cropX = Math.min(cropStartPoint.x, cropEndPoint.x) * scaleX;
    const cropY = Math.min(cropStartPoint.y, cropEndPoint.y) * scaleY;
    const cropWidth = Math.abs(cropEndPoint.x - cropStartPoint.x) * scaleX;
    const cropHeight = Math.abs(cropEndPoint.y - cropStartPoint.y) * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;
    ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    onApplyCrop(canvas.toDataURL('image/png'));
    setCropStartPoint(null);
    setCropEndPoint(null);
  };
  
  const handleApplyFill = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas || !aiPrompt.trim()) {
      alert("Please enter a prompt in the sidebar before applying the AI fill.");
      return;
    }
    const mimeType = 'image/png';
    const maskDataUrl = maskCanvas.toDataURL(mimeType);
    onGenerativeFill(maskDataUrl, aiPrompt, mimeType);
    clearMaskCanvas();
  };
  
  const renderCropBox = () => {
      if (!cropStartPoint || !cropEndPoint) return null;
      const x = Math.min(cropStartPoint.x, cropEndPoint.x);
      const y = Math.min(cropStartPoint.y, cropEndPoint.y);
      const width = Math.abs(cropEndPoint.x - cropStartPoint.x);
      const height = Math.abs(cropEndPoint.y - cropStartPoint.y);
      return <div className="absolute border-2 border-dashed border-white bg-black/30" style={{ left: x, top: y, width, height }} />;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      {!image ? (
        <WelcomeScreen />
      ) : (
        <div className="relative" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <img
            ref={imageRef}
            src={image}
            alt="Editable"
            className="max-w-full max-h-full block object-contain shadow-2xl rounded-lg"
            style={{
                maxWidth: 'calc(100vw - 36rem - 4rem)',
                maxHeight: 'calc(100vh - 4rem - 2rem)',
            }}
          />
          <canvas
            ref={maskCanvasRef}
            width={imageRef.current?.clientWidth || 0}
            height={imageRef.current?.clientHeight || 0}
            className="absolute top-0 left-0 pointer-events-none"
            style={{ opacity: activeTool === 'ai_edit' ? 1 : 0 }}
          />
          {renderCropBox()}
          {layers.map(layer => (
            <div
              key={layer.id}
              className="absolute pointer-events-none select-none"
              style={{
                left: `${layer.x}px`,
                top: `${layer.y}px`,
                color: layer.color,
                fontSize: `${layer.fontSize}px`,
                textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
              }}
            >
              {layer.text}
            </div>
          ))}
          {activeTool === 'crop' && cropStartPoint && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <button onClick={handleApplyCropClick} className="px-4 py-2 bg-green-600 rounded-md text-sm font-semibold hover:bg-green-500">Apply Crop</button>
            </div>
          )}
           {activeTool === 'ai_edit' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-gray-900/50 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                <button onClick={handleApplyFill} className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-semibold hover:bg-indigo-500">Apply Fill</button>
                <button onClick={clearMaskCanvas} className="px-4 py-2 bg-gray-600 rounded-md text-sm font-semibold hover:bg-gray-500">Clear Mask</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};