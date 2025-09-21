
import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const Slider: React.FC<SliderProps> = ({ label, value, onChange, min = 0, max = 100, step = 1 }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-sm">
        <label className="font-medium text-gray-300">{label}</label>
        <span className="px-2 py-0.5 bg-gray-700 text-gray-200 rounded-md text-xs font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      />
    </div>
  );
};
