import React from 'react';
import { ShieldAlert, Image as ImageIcon, Upload, X, Type, Layers } from 'lucide-react';
import { WatermarkConfig } from '../types';

interface WatermarkEditorProps {
  watermark: WatermarkConfig;
  onUpdateWatermark: (updated: WatermarkConfig) => void;
}

export const WatermarkEditor: React.FC<WatermarkEditorProps> = ({
  watermark,
  onUpdateWatermark,
}) => {
  const activeType = watermark.type || 'text';

  return (
    <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 p-6 sm:p-10 overflow-y-auto h-full">
      <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8 space-y-6">
        
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-500" /> Industrial Watermark & Scene Background Overlay
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Configure manuscript draft watermarking or scene background artwork behind the content for immersive reader interaction.
          </p>
        </div>

        <div className="space-y-5 text-xs">
          
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div>
              <div className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Enable Background Overlay & Watermark</div>
              <div className="text-[11px] text-zinc-500">Render text stamp or background scene artwork behind manuscript content</div>
            </div>
            <input
              type="checkbox"
              checked={watermark.enabled}
              onChange={(e) => onUpdateWatermark({ ...watermark, enabled: e.target.checked })}
              className="h-5 w-5 accent-orange-600 rounded cursor-pointer"
            />
          </div>

          {/* Watermark Type Selector */}
          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-2">Overlay Mode</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onUpdateWatermark({ ...watermark, type: 'text' })}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  activeType === 'text'
                    ? 'bg-orange-500/10 border-orange-500 text-orange-600 font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Type className="w-4 h-4" />
                <span className="text-xs">Text Stamp</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateWatermark({ ...watermark, type: 'image' })}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  activeType === 'image'
                    ? 'bg-orange-500/10 border-orange-500 text-orange-600 font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs">Image Watermark</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateWatermark({ ...watermark, type: 'both' })}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  activeType === 'both'
                    ? 'bg-orange-500/10 border-orange-500 text-orange-600 font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="text-xs">Text + Image Both</span>
              </button>
            </div>
          </div>

          {/* Text Watermark Controls */}
          {(activeType === 'text' || activeType === 'both') && (
            <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Watermark Stamp Text</label>
                <input
                  type="text"
                  value={watermark.text}
                  onChange={(e) => onUpdateWatermark({ ...watermark, text: e.target.value })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100"
                  placeholder="CONFIDENTIAL • DRAFT COPY"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">Text Rotation ({watermark.rotation}°)</label>
                  <input
                    type="range"
                    min="-60"
                    max="0"
                    step="5"
                    value={watermark.rotation}
                    onChange={(e) => onUpdateWatermark({ ...watermark, rotation: parseInt(e.target.value) })}
                    className="w-full accent-orange-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">Font Size ({watermark.fontSize}px)</label>
                  <input
                    type="range"
                    min="32"
                    max="96"
                    step="4"
                    value={watermark.fontSize}
                    onChange={(e) => onUpdateWatermark({ ...watermark, fontSize: parseInt(e.target.value) })}
                    className="w-full accent-orange-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Image Watermark / Scene Background Controls */}
          {(activeType === 'image' || activeType === 'both') && (
            <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
                Background Image / Artwork Watermark
              </label>

              {watermark.imageUrl ? (
                <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <img
                    src={watermark.imageUrl}
                    alt="Watermark Artwork"
                    className="w-16 h-16 object-contain rounded border bg-white dark:bg-zinc-900"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">Image Asset Selected</p>
                    <p className="text-[10px] text-zinc-400">Renders seamlessly behind book content</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateWatermark({ ...watermark, imageUrl: '' })}
                    className="p-1.5 text-rose-500 hover:text-rose-600 rounded hover:bg-rose-500/10 cursor-pointer"
                    title="Remove Watermark Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="px-4 py-2.5 bg-[#FF6B00] hover:bg-orange-600 text-black font-extrabold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image Watermark</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            if (evt.target?.result) {
                              onUpdateWatermark({ ...watermark, imageUrl: evt.target.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <input
                    type="text"
                    value={watermark.imageUrl || ''}
                    onChange={(e) => onUpdateWatermark({ ...watermark, imageUrl: e.target.value })}
                    className="flex-1 p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-mono"
                    placeholder="Or paste image URL (https://...)"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Image Scale ({Math.round((watermark.imageScale || 1.0) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.1"
                    value={watermark.imageScale || 1.0}
                    onChange={(e) => onUpdateWatermark({ ...watermark, imageScale: parseFloat(e.target.value) })}
                    className="w-full accent-orange-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Image Position
                  </label>
                  <select
                    value={watermark.imagePosition || 'center'}
                    onChange={(e) => onUpdateWatermark({ ...watermark, imagePosition: e.target.value as any })}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="center">Centered Page Background</option>
                    <option value="stretch">Full Page Bleed</option>
                    <option value="top-right">Top Right Corner</option>
                    <option value="bottom-left">Bottom Left Corner</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Overall Opacity Slider */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
              Overall Opacity ({Math.round(watermark.opacity * 100)}%)
            </label>
            <input
              type="range"
              min="0.02"
              max="0.5"
              step="0.01"
              value={watermark.opacity}
              onChange={(e) => onUpdateWatermark({ ...watermark, opacity: parseFloat(e.target.value) })}
              className="w-full accent-orange-600"
            />
          </div>

          {/* Live Watermark Stamp & Scene Preview Box */}
          <div className="mt-6 p-8 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 relative overflow-hidden min-h-52 flex flex-col items-center justify-center">
            
            {/* Sample Page Content Text to show readability under watermark */}
            <div className="relative z-10 max-w-md text-center pointer-events-none select-none opacity-80 space-y-1.5">
              <h4 className="font-serif font-bold text-sm text-zinc-800 dark:text-zinc-200">Chapter 1: The Scene Begins</h4>
              <p className="font-serif text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                "The atmosphere shifted as night fell over the ancient library. Every line on the parchment seemed alive..."
              </p>
            </div>

            {/* Background Image Watermark Overlay */}
            {watermark.enabled && watermark.imageUrl && (activeType === 'image' || activeType === 'both') && (
              <img
                src={watermark.imageUrl}
                alt="Background Watermark Preview"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-all"
                style={{
                  opacity: watermark.opacity,
                  transform: `scale(${watermark.imageScale || 1.0})`,
                  objectFit: watermark.imagePosition === 'stretch' ? 'cover' : 'contain',
                }}
              />
            )}

            {/* Text Watermark Stamp Overlay */}
            {watermark.enabled && (activeType === 'text' || activeType === 'both') && (
              <div
                className="absolute font-black text-center select-none uppercase tracking-widest pointer-events-none transition-all z-20"
                style={{
                  opacity: watermark.opacity,
                  transform: `rotate(${watermark.rotation}deg)`,
                  fontSize: `${watermark.fontSize * 0.5}px`,
                  color: '#ea580c'
                }}
              >
                {watermark.text || 'WATERMARK PREVIEW'}
              </div>
            )}

            <div className="absolute bottom-2 right-2 text-[10px] text-zinc-400 font-mono bg-black/40 px-2 py-0.5 rounded">
              Live Background Watermark Preview
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
