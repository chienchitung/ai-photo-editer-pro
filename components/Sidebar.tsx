import React, { useState } from 'react';
import { Adjustments, Layer, Preset, Tool, ArtisticStyle, Transform, AiMode } from '../types';
import { SidebarButton } from './SidebarButton';
import { Slider } from './Slider';
import { ICONS } from './Icons';

// Panels
const AdjustPanel: React.FC<{ adjustments: Adjustments; onChange: (adj: keyof Adjustments, val: number) => void; }> = ({ adjustments, onChange }) => (
    <div className="space-y-4">
        <Slider label="Brightness" value={adjustments.brightness} onChange={(v) => onChange('brightness', v)} min={0} max={200} />
        <Slider label="Contrast" value={adjustments.contrast} onChange={(v) => onChange('contrast', v)} min={0} max={200} />
        <Slider label="Saturation" value={adjustments.saturate} onChange={(v) => onChange('saturate', v)} min={0} max={200} />
        <Slider label="Temperature" value={adjustments.temperature} onChange={(v) => onChange('temperature', v)} min={-100} max={100} />
        <Slider label="Tint" value={adjustments.tint} onChange={(v) => onChange('tint', v)} min={-100} max={100} />
    </div>
);

const FilterPanel: React.FC<{ presets: Preset[], onApply: (p: Preset) => void, onSave: (name: string) => void }> = ({ presets, onApply, onSave }) => {
    const [presetName, setPresetName] = useState('');
    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-4 gap-2">
                {presets.map(p => (
                    <button key={p.name} onClick={() => onApply(p)} className="text-xs p-2 bg-gray-700 hover:bg-indigo-500 rounded-md transition-colors text-center">{p.name}</button>
                ))}
            </div>
            <div className="flex gap-2 mt-4 border-t border-gray-600 pt-4">
                <input type="text" value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="New Preset Name" className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                <button onClick={() => { if(presetName) { onSave(presetName); setPresetName('')} }} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-semibold">Save</button>
            </div>
        </div>
    );
};

const TransformPanel: React.FC<{ onTransform: (t: Partial<Transform>) => void, transform: Transform}> = ({ onTransform, transform }) => (
    <div className="flex flex-col gap-4">
         <p className="text-xs text-gray-400 -mb-2">Note: Edits are applied on download.</p>
        <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onTransform({ rotate: transform.rotate - 90 })} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 flex items-center justify-center gap-2"><ICONS.RotateLeft className="w-5 h-5"/>-90°</button>
            <button onClick={() => onTransform({ rotate: transform.rotate + 90 })} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 flex items-center justify-center gap-2">+90° <ICONS.RotateRight className="w-5 h-5"/></button>
            <button onClick={() => onTransform({ scaleX: transform.scaleX * -1 })} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 flex items-center justify-center gap-2"><ICONS.FlipHorizontal className="w-5 h-5"/>Flip H</button>
            <button onClick={() => onTransform({ scaleY: transform.scaleY * -1 })} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 flex items-center justify-center gap-2"><ICONS.FlipVertical className="w-5 h-5"/>Flip V</button>
        </div>
    </div>
);

const LayersPanel: React.FC<{ onAddLayer: (l: Omit<Layer, 'id'>) => void }> = ({ onAddLayer }) => {
    const [text, setText] = useState('Hello World');
    const [color, setColor] = useState('#ffffff');
    const [fontSize, setFontSize] = useState(48);

    const handleAddText = () => {
        onAddLayer({ type: 'text', text, color, fontSize, x: 50, y: 50 });
    };

    return (
        <div className="flex flex-col gap-4">
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-md px-2 py-1 text-sm"/>
            <div className="flex items-center gap-2">
                <label className="text-sm">Color:</label>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 bg-transparent border-none rounded"/>
                <label className="text-sm">Size:</label>
                <input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value, 10))} className="w-16 bg-gray-800 border border-gray-600 rounded-md px-2 py-1 text-sm"/>
            </div>
            <button onClick={handleAddText} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-semibold">Add Text</button>
        </div>
    );
};

const StyleTransferPanel: React.FC<{ styles: ArtisticStyle[], onStyleTransfer: (style: ArtisticStyle) => void }> = ({ styles, onStyleTransfer }) => (
    <div className="grid grid-cols-3 gap-3">
        {styles.map(style => (
            <button key={style.name} onClick={() => onStyleTransfer(style)} className="group aspect-square flex flex-col items-center justify-end p-2 rounded-lg bg-gray-800 hover:ring-2 hover:ring-indigo-500 transition-all" style={{backgroundImage: `url(${style.previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="bg-black/60 group-hover:bg-indigo-600/80 p-1 rounded-md transition-colors">
                    <span className="text-xs font-semibold text-white">{style.name}</span>
                </div>
            </button>
        ))}
    </div>
);

const GenerativeAiPanel: React.FC<{
    apiKey: string;
    onApiKeyChange: (key: string) => void;
    prompt: string;
    onPromptChange: (prompt: string) => void;
    brushSize: number;
    onBrushSizeChange: (size: number) => void;
    aiMode: AiMode;
    onAiModeChange: (mode: AiMode) => void;
}> = ({ apiKey, onApiKeyChange, prompt, onPromptChange, brushSize, onBrushSizeChange, aiMode, onAiModeChange }) => (
    <div className="flex flex-col gap-4">
        <div>
            <label className="text-sm font-medium text-gray-300">Gemini API Key</label>
            <input 
                type="password" 
                value={apiKey} 
                onChange={e => onApiKeyChange(e.target.value)}
                placeholder="Enter your API key" 
                className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
             <p className="text-xs text-gray-500 mt-1">Required for AI features. Your key is stored in your browser.</p>
        </div>
        
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button onClick={() => onAiModeChange('fill')} className={`flex-1 py-1 text-sm rounded-md transition-colors ${aiMode === 'fill' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-gray-700'}`}>
            Generative Fill
          </button>
          <button onClick={() => onAiModeChange('eraser')} className={`flex-1 py-1 text-sm rounded-md transition-colors ${aiMode === 'eraser' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-gray-700'}`}>
            Magic Eraser
          </button>
        </div>

        {aiMode === 'fill' && (
          <div>
              <label className="text-sm font-medium text-gray-300">Generative Fill Prompt</label>
              <textarea 
                  value={prompt} 
                  onChange={e => onPromptChange(e.target.value)}
                  placeholder="e.g., add a cat wearing a hat"
                  rows={3}
                  className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
          </div>
        )}
        
        <Slider label="Brush Size" value={brushSize} onChange={onBrushSizeChange} min={5} max={100} />
        
        {aiMode === 'fill' && <p className="text-sm text-gray-400">How to use: Draw a mask on the image, enter a prompt, then click 'Apply Fill' on the canvas.</p>}
        {aiMode === 'eraser' && <p className="text-sm text-gray-400">How to use: Draw a mask over the object you want to remove, then click 'Apply Eraser' on the canvas.</p>}
    </div>
);

const EnhancePanel: React.FC<{
    onRestore: () => void;
    onUpscale: () => void;
    onLowLight: () => void;
}> = ({ onRestore, onUpscale, onLowLight }) => (
    <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold mb-2 text-gray-300 uppercase tracking-wider">AI Smart Repair & Enhancement</h3>
        <p className="text-xs text-gray-400 -mt-2 mb-2">One-click AI tools to fix common photo issues. Requires a Gemini API Key (set in Gen AI panel).</p>
        
        <button onClick={onRestore} className="w-full text-left p-3 bg-gray-700 rounded-md hover:bg-indigo-600 transition-colors">
            <div className="font-semibold">Old Photo Restoration</div>
            <div className="text-xs text-gray-300 mt-1">Remove scratches, fix colors, and enhance clarity in aged photos.</div>
        </button>
        
        <button onClick={onUpscale} className="w-full text-left p-3 bg-gray-700 rounded-md hover:bg-indigo-600 transition-colors">
            <div className="font-semibold">Super Resolution</div>
            <div className="text-xs text-gray-300 mt-1">Increase image resolution and sharpness using AI.</div>
        </button>

        <button onClick={onLowLight} className="w-full text-left p-3 bg-gray-700 rounded-md hover:bg-indigo-600 transition-colors">
            <div className="font-semibold">Low-Light Optimization</div>
            <div className="text-xs text-gray-300 mt-1">Brighten dark photos and reduce noise naturally.</div>
        </button>
    </div>
);


// Main Sidebar Component
interface SidebarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  adjustments: Adjustments;
  onAdjustmentChange: (adjustment: keyof Adjustments, value: number) => void;
  presets: Preset[];
  onApplyPreset: (preset: Preset) => void;
  onSavePreset: (name: string) => void;
  onAddLayer: (layer: Omit<Layer, 'id'>) => void;
  onTransform: (transform: Partial<Transform>) => void;
  transform: Transform;
  styles: ArtisticStyle[];
  onStyleTransfer: (style: ArtisticStyle) => void;
  onApplyCrop: (cropDataUrl: string) => void;
  currentImage: string | null;
  disabled: boolean;
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
  onReset: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  aiPrompt: string;
  onAiPromptChange: (prompt: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  aiMode: AiMode;
  onAiModeChange: (mode: AiMode) => void;
  onRestorePhoto: () => void;
  onUpscale: () => void;
  onLowLight: () => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
    const { activeTool, setActiveTool, disabled, onUndo, canUndo, onRedo, canRedo, onReset } = props;

    const renderPanel = () => {
        switch (activeTool) {
            case 'filters': 
                return (
                    <>
                        <FilterPanel presets={props.presets} onApply={props.onApplyPreset} onSave={props.onSavePreset} />
                        <div className="mt-6 pt-6 border-t border-gray-700/50">
                            <h3 className="text-sm font-semibold mb-4 text-gray-300 uppercase tracking-wider">Adjustments</h3>
                            <AdjustPanel adjustments={props.adjustments} onChange={props.onAdjustmentChange} />
                        </div>
                    </>
                );
            case 'transform': return <TransformPanel onTransform={props.onTransform} transform={props.transform} />;
            case 'layers': return <LayersPanel onAddLayer={props.onAddLayer} />;
            case 'style_transfer': return <StyleTransferPanel styles={props.styles} onStyleTransfer={props.onStyleTransfer} />;
            case 'ai_edit': return <GenerativeAiPanel 
                                        apiKey={props.apiKey} 
                                        onApiKeyChange={props.onApiKeyChange}
                                        prompt={props.aiPrompt}
                                        onPromptChange={props.onAiPromptChange}
                                        brushSize={props.brushSize}
                                        onBrushSizeChange={props.onBrushSizeChange}
                                        aiMode={props.aiMode}
                                        onAiModeChange={props.onAiModeChange}
                                    />;
            case 'crop': return <p className="text-sm text-gray-400">Click and drag on the image to select an area to crop. Then click 'Apply Crop' below the image.</p>;
            case 'enhance': return <EnhancePanel onRestore={props.onRestorePhoto} onUpscale={props.onUpscale} onLowLight={props.onLowLight} />;
            default: return <p>Select a tool</p>;
        }
    };

    return (
        <aside className="w-96 bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50 flex flex-col z-10">
            <div className="flex items-center justify-center border-b border-gray-700/50 p-2">
                 <div className="grid grid-cols-4 gap-1">
                    <SidebarButton icon={<ICONS.Filter />} label="Filters" isActive={activeTool === 'filters'} onClick={() => setActiveTool('filters')} disabled={disabled}/>
                    <SidebarButton icon={<ICONS.Transform />} label="Transform" isActive={activeTool === 'transform'} onClick={() => setActiveTool('transform')} disabled={disabled}/>
                    <SidebarButton icon={<ICONS.Crop />} label="Crop" isActive={activeTool === 'crop'} onClick={() => setActiveTool('crop')} disabled={disabled}/>
                    <SidebarButton icon={<ICONS.Enhance />} label="Enhance" isActive={activeTool === 'enhance'} onClick={() => setActiveTool('enhance')} disabled={disabled}/>
                    <SidebarButton icon={<ICONS.Sparkles />} label="Gen AI" isActive={activeTool === 'ai_edit'} onClick={() => setActiveTool('ai_edit')} disabled={disabled}/>
                    <SidebarButton icon={<ICONS.Palette />} label="Styles" isActive={activeTool === 'style_transfer'} onClick={() => setActiveTool('style_transfer')} disabled={disabled}/>
                    <SidebarButton icon={<ICONS.Layers />} label="Layers" isActive={activeTool === 'layers'} onClick={() => setActiveTool('layers')} disabled={disabled}/>
                </div>
            </div>

            <div className="flex items-center justify-center p-3 gap-2 border-b border-gray-700/50">
                <button onClick={onUndo} disabled={!canUndo || disabled} className="flex-1 px-3 py-1.5 bg-gray-700 text-sm rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <ICONS.Undo className="w-4 h-4" /> Undo
                </button>
                 <button onClick={onRedo} disabled={!canRedo || disabled} className="flex-1 px-3 py-1.5 bg-gray-700 text-sm rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    Redo <ICONS.Redo className="w-4 h-4" />
                </button>
                <button onClick={onReset} disabled={disabled} title="Reset to Original" className="p-1.5 bg-gray-700 text-sm rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    <ICONS.Reset className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-6">
                    {renderPanel()}
                </div>
            </div>
        </aside>
    );
};
