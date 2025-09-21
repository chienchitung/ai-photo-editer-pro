import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { Tool, Adjustments, Layer, Preset, ArtisticStyle, Crop, Transform, AiMode } from './types';
import { INITIAL_ADJUSTMENTS, PRESET_FILTERS, ARTISTIC_STYLES } from './constants';
import { applyArtisticStyle, performGenerativeFill, restoreOldPhoto, upscaleImage, fixLowLight } from './services/geminiService';
import { fileToBase64, applyClientSideEdits } from './utils/imageUtils';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('filters');
  const [adjustments, setAdjustments] = useState<Adjustments>(INITIAL_ADJUSTMENTS);
  const [presets, setPresets] = useState<Preset[]>(PRESET_FILTERS);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 0, height: 0 });
  const [transform, setTransform] = useState<Transform>({ rotate: 0, scaleX: 1, scaleY: 1 });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  // AI Tool State
  const [apiKey, setApiKey] = useState<string>('');
  const [brushSize, setBrushSize] = useState<number>(40);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiMode, setAiMode] = useState<AiMode>('fill');


  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const updateDisplayImage = useCallback(() => {
    if (currentImage) {
      applyClientSideEdits(currentImage, adjustments, transform).then(setDisplayImage);
    }
  }, [currentImage, adjustments, transform]);

  useEffect(() => {
    updateDisplayImage();
  }, [updateDisplayImage]);

  const addToHistory = (imageState: string) => {
    // If we're at a previous state, truncate the future history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentImage(history[newIndex]);
      // Note: We don't reset adjustments on undo, as they are part of the image state now
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentImage(history[newIndex]);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setLoadingMessage('Loading image...');
    const base64Image = await fileToBase64(file);
    setOriginalImage(base64Image);
    setCurrentImage(base64Image);
    setHistory([base64Image]);
    setHistoryIndex(0);
    resetAllStates();
    setActiveTool('filters');
    setIsLoading(false);
  };
  
  const resetAllStates = () => {
    setAdjustments(INITIAL_ADJUSTMENTS);
    setLayers([]);
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
    setTransform({ rotate: 0, scaleX: 1, scaleY: 1 });
    setError(null);
  }

  const handleReset = () => {
    if (originalImage) {
      setCurrentImage(originalImage);
      resetAllStates();
      setHistory([originalImage]);
      setHistoryIndex(0);
    }
  };

  const handleAdjustmentChange = (adjustment: keyof Adjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [adjustment]: value }));
  };

  const applyPreset = (preset: Preset) => {
    setAdjustments(preset.adjustments);
  };
  
  const handleFinalizeAdjustments = () => {
      if (currentImage) {
          setIsLoading(true);
          setLoadingMessage("Applying adjustments...");
          applyClientSideEdits(currentImage, adjustments, transform).then(newImage => {
              setCurrentImage(newImage);
              addToHistory(newImage);
              setAdjustments(INITIAL_ADJUSTMENTS);
              setTransform({ rotate: 0, scaleX: 1, scaleY: 1 });
              setIsLoading(false);
          });
      }
  };


  const savePreset = (name: string) => {
    const newPreset: Preset = { name, adjustments: { ...adjustments } };
    setPresets(prev => [...prev, newPreset]);
  };

  const addLayer = (layer: Omit<Layer, 'id'>) => {
    setLayers(prev => [...prev, { ...layer, id: Date.now().toString() }]);
  };
  
  const handleApplyCrop = (cropDataUrl: string) => {
    setCurrentImage(cropDataUrl);
    addToHistory(cropDataUrl);
    setActiveTool('filters'); 
  };
  
  const handleTransform = (newTransform: Partial<Transform>) => {
    setTransform(prev => ({...prev, ...newTransform}));
  }

  const handleGenerativeAction = async (maskBase64: string, mimeType: string) => {
    if (!currentImage) return;
    
    const prompt = aiMode === 'eraser' 
      ? 'Remove the content within the masked area and realistically fill it in based on the surrounding image context. The result should be seamless and high-quality.' 
      : aiPrompt;
      
    if (aiMode === 'fill' && !prompt.trim()) {
      setError('Please enter a prompt for Generative Fill.');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage(aiMode === 'eraser' ? 'Applying Magic Eraser...' : 'Applying AI magic...');
    setError(null);
    try {
      const result = await performGenerativeFill(currentImage, maskBase64, prompt, mimeType, apiKey);
      setCurrentImage(result);
      addToHistory(result);
      setAiPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStyleTransfer = async (style: ArtisticStyle) => {
    if (!currentImage) return;
    setIsLoading(true);
    setLoadingMessage(`Applying ${style.name} style...`);
    setError(null);
    try {
      const result = await applyArtisticStyle(currentImage, style.prompt, apiKey);
      setCurrentImage(result);
      addToHistory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePhoto = async () => {
    if (!currentImage) return;
    setIsLoading(true);
    setLoadingMessage('Restoring old photo...');
    setError(null);
    try {
      const result = await restoreOldPhoto(currentImage, apiKey);
      setCurrentImage(result);
      addToHistory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpscale = async () => {
    if (!currentImage) return;
    setIsLoading(true);
    setLoadingMessage('Upscaling resolution...');
    setError(null);
    try {
      const result = await upscaleImage(currentImage, apiKey);
      setCurrentImage(result);
      addToHistory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLowLight = async () => {
    if (!currentImage) return;
    setIsLoading(true);
    setLoadingMessage('Optimizing lighting...');
    setError(null);
    try {
      const result = await fixLowLight(currentImage, apiKey);
      setCurrentImage(result);
      addToHistory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (imageRef.current?.src) {
        applyClientSideEdits(currentImage!, adjustments, transform).then(finalImage => {
            const link = document.createElement('a');
            link.href = finalImage;
            link.download = `edited-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
  };


  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
      <Header onUpload={handleImageUpload} onDownload={handleDownload} hasImage={!!currentImage} />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          adjustments={adjustments}
          onAdjustmentChange={handleAdjustmentChange}
          presets={presets}
          onApplyPreset={applyPreset}
          onSavePreset={savePreset}
          onAddLayer={addLayer}
          onTransform={handleTransform}
          transform={transform}
          styles={ARTISTIC_STYLES}
          onStyleTransfer={handleStyleTransfer}
          onApplyCrop={handleApplyCrop}
          currentImage={currentImage}
          disabled={!currentImage || isLoading}
          onUndo={handleUndo}
          canUndo={historyIndex > 0}
          onRedo={handleRedo}
          canRedo={historyIndex < history.length - 1}
          onReset={handleReset}
          // AI Props
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          aiPrompt={aiPrompt}
          onAiPromptChange={setAiPrompt}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          aiMode={aiMode}
          onAiModeChange={setAiMode}
          // Enhancement props
          onRestorePhoto={handleRestorePhoto}
          onUpscale={handleUpscale}
          onLowLight={handleLowLight}
        />
        <main className="flex-grow flex items-center justify-center p-4 lg:p-8 bg-gray-800/50 overflow-auto">
          {isLoading && <Loader message={loadingMessage} />}
          {error && <div className="absolute top-20 z-50 bg-red-500 text-white p-4 rounded-md shadow-lg animate-pulse" onClick={() => setError(null)}>{error}</div>}
          <Canvas
            image={displayImage}
            layers={layers}
            activeTool={activeTool}
            onApplyCrop={handleApplyCrop}
            imageRef={imageRef}
            containerRef={canvasContainerRef}
            onGenerativeAction={handleGenerativeAction}
            brushSize={brushSize}
            aiMode={aiMode}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
