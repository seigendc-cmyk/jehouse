import React, { useState } from 'react';
import { ColoringElement } from '../types';
import { getColoringThemeElements } from '../generatorUtils';
import { Palette, PaintBucket, Undo2, RotateCcw, Printer, Sparkles, Eye, Download } from 'lucide-react';

interface InteractiveColoringCanvasProps {
  theme?: string;
  elements?: ColoringElement[];
  colorByNumberLegend?: { number: number; colorName: string; hex: string }[];
  onElementsChange?: (newElements: ColoringElement[]) => void;
  interactive?: boolean;
}

const COLOR_PALETTE = [
  '#ffffff', // White
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#78350f', // Brown
  '#000000', // Black
];

export const InteractiveColoringCanvas: React.FC<InteractiveColoringCanvasProps> = ({
  theme = 'solar_system',
  elements: initialElements,
  colorByNumberLegend,
  onElementsChange,
  interactive = true,
}) => {
  const [elements, setElements] = useState<ColoringElement[]>(
    initialElements && initialElements.length > 0
      ? initialElements
      : getColoringThemeElements(theme)
  );

  const [selectedColor, setSelectedColor] = useState<string>('#3b82f6');
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [history, setHistory] = useState<ColoringElement[][]>([elements]);

  const handleElementClick = (id: string) => {
    if (!interactive) return;

    const updated = elements.map(el => {
      if (el.id === id) {
        return { ...el, fillColor: selectedColor };
      }
      return el;
    });

    setElements(updated);
    setHistory(prev => [...prev, updated]);
    if (onElementsChange) onElementsChange(updated);
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const prevElements = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setElements(prevElements);
      if (onElementsChange) onElementsChange(prevElements);
    }
  };

  const handleReset = () => {
    const resetElements = elements.map(el => ({ ...el, fillColor: '#ffffff' }));
    setElements(resetElements);
    setHistory([resetElements]);
    if (onElementsChange) onElementsChange(resetElements);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      
      {/* Controls Bar */}
      {interactive && (
        <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs">
          
          {/* Color Palette Selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <PaintBucket className="w-3.5 h-3.5 text-orange-500" /> Color:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {COLOR_PALETTE.map(hex => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setSelectedColor(hex)}
                  style={{ backgroundColor: hex }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer shadow-xs ${
                    selectedColor === hex
                      ? 'scale-125 border-orange-500 ring-2 ring-orange-400/50'
                      : 'border-zinc-300 dark:border-zinc-600 hover:scale-110'
                  }`}
                  title={hex}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {colorByNumberLegend && colorByNumberLegend.length > 0 && (
              <button
                type="button"
                onClick={() => setShowNumbers(!showNumbers)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  showNumbers
                    ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {showNumbers ? 'Hide Numbers' : 'Show Numbers'}
              </button>
            )}

            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="p-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded disabled:opacity-40 transition-colors cursor-pointer"
              title="Undo color fill"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded transition-colors cursor-pointer"
              title="Reset artwork to white lineart"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {/* Color By Number Legend Bar */}
      {colorByNumberLegend && colorByNumberLegend.length > 0 && (
        <div className="w-full flex items-center justify-center gap-3 flex-wrap bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 p-2 rounded-lg text-xs font-semibold">
          <span className="text-orange-700 dark:text-orange-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Color Guide:
          </span>
          {colorByNumberLegend.map(item => (
            <div key={item.number} className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded border border-orange-300 dark:border-orange-700">
              <span className="w-4 h-4 rounded-full flex items-center justify-center bg-orange-500 text-black font-extrabold text-[10px]">
                {item.number}
              </span>
              <span style={{ color: item.hex }} className="font-bold">
                {item.colorName}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Interactive SVG Drawing / Coloring Canvas Area */}
      <div className="relative border-2 border-zinc-900 dark:border-zinc-700 rounded-xl bg-white p-4 shadow-inner overflow-hidden flex items-center justify-center max-w-full">
        <svg
          width="480"
          height="340"
          viewBox="0 0 480 340"
          className="w-full h-auto select-none"
        >
          {elements.map(el => {
            const isClickable = interactive;

            if (el.type === 'circle') {
              return (
                <g key={el.id} className="cursor-pointer group" onClick={() => handleElementClick(el.id)}>
                  <circle
                    cx={el.cx}
                    cy={el.cy}
                    r={el.r}
                    stroke={el.strokeColor || '#000000'}
                    strokeWidth={el.strokeWidth || 2}
                    fill={el.fillColor || '#ffffff'}
                    className="transition-colors hover:stroke-orange-500 hover:stroke-[3]"
                  />
                  {showNumbers && el.numberTag && (
                    <text
                      x={el.cx}
                      y={el.cy ? el.cy + 4 : 0}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#111"
                      pointerEvents="none"
                    >
                      {el.numberTag}
                    </text>
                  )}
                </g>
              );
            } else if (el.type === 'rect') {
              return (
                <g key={el.id} className="cursor-pointer group" onClick={() => handleElementClick(el.id)}>
                  <rect
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    stroke={el.strokeColor || '#000000'}
                    strokeWidth={el.strokeWidth || 2}
                    fill={el.fillColor || '#ffffff'}
                    className="transition-colors hover:stroke-orange-500 hover:stroke-[3]"
                  />
                  {showNumbers && el.numberTag && (
                    <text
                      x={(el.x || 0) + (el.width || 0) / 2}
                      y={(el.y || 0) + (el.height || 0) / 2 + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#111"
                      pointerEvents="none"
                    >
                      {el.numberTag}
                    </text>
                  )}
                </g>
              );
            } else {
              return (
                <g key={el.id} className="cursor-pointer group" onClick={() => handleElementClick(el.id)}>
                  <path
                    d={el.d}
                    stroke={el.strokeColor || '#000000'}
                    strokeWidth={el.strokeWidth || 2}
                    fill={el.fillColor || 'none'}
                    className="transition-colors hover:stroke-orange-500 hover:stroke-[3]"
                  />
                </g>
              );
            }
          })}
        </svg>
      </div>

    </div>
  );
};
