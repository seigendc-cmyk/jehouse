import React, { useRef } from 'react';
import { PageImageData } from '../types';
import { Image as ImageIcon, Upload, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ImageUploaderBlockProps {
  imageData?: PageImageData;
  onChange: (data?: PageImageData) => void;
}

const PRESET_GRAPHICS = [
  { name: 'Great Zimbabwe Stone Arch', url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Pfumvudza Agriculture Maize Farm', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80' },
  { name: 'Science Laboratory Chemistry Flask', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Solar System & Earth Globe', url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80' },
];

export const ImageUploaderBlock: React.FC<ImageUploaderBlockProps> = ({
  imageData,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      onChange({
        url: base64Url,
        caption: file.name.replace(/\.[^/.]+$/, ''),
        alignment: 'center',
        widthPercent: 75,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4" /> Custom Image / Illustration Block
        </span>
        {imageData && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove Image
          </button>
        )}
      </div>

      {!imageData ? (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-center cursor-pointer hover:border-indigo-500 transition-colors bg-white dark:bg-zinc-900"
          >
            <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-1" />
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Click to Upload Image File
            </p>
            <p className="text-[11px] text-zinc-400">PNG, JPG, SVG or WEBP</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase">Or Select Educational Sample Preset:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
              {PRESET_GRAPHICS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    onChange({
                      url: p.url,
                      caption: p.name,
                      alignment: 'center',
                      widthPercent: 75,
                    })
                  }
                  className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded hover:border-indigo-500 text-left text-[10px] font-medium"
                >
                  <img src={p.url} alt={p.name} className="w-full h-16 object-cover rounded mb-1" />
                  <span className="line-clamp-1">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="flex justify-center">
            <img
              src={imageData.url}
              alt={imageData.caption || 'Inserted Image'}
              style={{ width: `${imageData.widthPercent || 75}%` }}
              className="max-h-64 object-contain rounded border border-zinc-200 dark:border-zinc-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Caption / Figure Label</label>
              <input
                type="text"
                value={imageData.caption || ''}
                onChange={(e) => onChange({ ...imageData, caption: e.target.value })}
                placeholder="e.g. Figure 2.1: Soil Stratification Layers"
                className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Size ({imageData.widthPercent || 75}%)</label>
                <input
                  type="range"
                  min="25"
                  max="100"
                  step="5"
                  value={imageData.widthPercent || 75}
                  onChange={(e) => onChange({ ...imageData, widthPercent: parseInt(e.target.value) })}
                  className="w-28 accent-indigo-600"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Alignment</label>
                <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800 p-0.5">
                  <button
                    type="button"
                    onClick={() => onChange({ ...imageData, alignment: 'left' })}
                    className={`p-1.5 rounded ${imageData.alignment === 'left' ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...imageData, alignment: 'center' })}
                    className={`p-1.5 rounded ${imageData.alignment === 'center' ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...imageData, alignment: 'right' })}
                    className={`p-1.5 rounded ${imageData.alignment === 'right' ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
