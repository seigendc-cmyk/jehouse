import React, { useState } from 'react';
import { Bookmark, Sparkles, Image as ImageIcon, Check, Upload, UploadCloud, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { CoverConfig } from '../types';
import { PublishingGeometrySettings } from '../lib/publishingGeometry';
import { classifyCoverSuitability, coverImageStyle, getCoverPrintRequirements, optimizeCoverArtwork, resetCoverImageAppearance, showCoverField } from '../lib/coverArtwork';

interface CoverEditorProps {
  cover: CoverConfig;
  totalPages: number;
  printSettings: PublishingGeometrySettings;
  seriesLabel?: string;
  onUpdateCover: (updated: CoverConfig) => void;
  onOpenImageGallery?: () => void;
}

const COLOR_PRESETS = [
  { name: 'Charcoal & Orange (Project Standard)', bg: '#18181b', text: '#f4f4f5', accent: '#f97316' },
  { name: 'Deep Slate & Flame', bg: '#0f172a', text: '#f8fafc', accent: '#ea580c' },
  { name: 'Matte Obsidian & Gold', bg: '#121212', text: '#ffffff', accent: '#eab308' },
  { name: 'Classic Parchment & Burgundy', bg: '#faf8f5', text: '#27272a', accent: '#991b1b' },
  { name: 'Minimalist Ivory & Jet Black', bg: '#fdfbf7', text: '#09090b', accent: '#27272a' }
];

export const CoverEditor: React.FC<CoverEditorProps> = ({
  cover,
  totalPages,
  printSettings,
  seriesLabel,
  onUpdateCover,
  onOpenImageGallery,
}) => {
  const [activeTab, setActiveTab] = useState<'design' | 'artwork' | 'spine'>('design');
  const [autoSaveNotice, setAutoSaveNotice] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculated spine thickness based on 0.06mm per page (standard 60lb cream paper)
  const calculatedSpineMm = Math.max(10, Math.round(totalPages * 0.065));
  const currentPrintRequirement = getCoverPrintRequirements(printSettings);
  const currentSuitability = cover.artworkAsset
    ? classifyCoverSuitability(cover.artworkAsset.width, cover.artworkAsset.height, currentPrintRequirement.width, currentPrintRequirement.height)
    : undefined;

  const processAndSaveImage = async (file: File) => {
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const { blob, artworkAsset } = await optimizeCoverArtwork(file, printSettings, {
        quality: cover.imageQuality,
        automaticResize: cover.optimizeArtworkAutomatically
      });
      const artworkUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      onUpdateCover({ ...cover, artworkUrl, artworkAsset, imageFormat: 'webp', imageQuality: artworkAsset.quality });
      setAutoSaveNotice('Cover optimized as WebP and auto-saved');
      setTimeout(() => setAutoSaveNotice(null), 4000);
    } catch (error) {
      setProcessingError(error instanceof Error ? error.message : 'Cover artwork could not be processed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes: number) => bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
      
      {/* Left Settings Panel */}
      <div className="w-full lg:w-96 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6 overflow-y-auto space-y-6">
        
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-orange-500" /> Cover Designer
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Industrial grade front cover, spine, and back jacket layout.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-2 text-center border-b-2 ${
              activeTab === 'design' 
                ? 'border-orange-500 text-orange-600 dark:text-orange-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Typography & Colors
          </button>
          <button
            onClick={() => setActiveTab('artwork')}
            className={`flex-1 py-2 text-center border-b-2 ${
              activeTab === 'artwork' 
                ? 'border-orange-500 text-orange-600 dark:text-orange-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Artwork & Blurb
          </button>
          <button
            onClick={() => setActiveTab('spine')}
            className={`flex-1 py-2 text-center border-b-2 ${
              activeTab === 'spine' 
                ? 'border-orange-500 text-orange-600 dark:text-orange-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Spine & Imprint
          </button>
        </div>

        {/* Tab 1: Design & Colors */}
        {activeTab === 'design' && (
          <div className="space-y-4 text-xs">
            
            {/* Color Presets */}
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-2">Color Palette Presets</label>
              <div className="space-y-2">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => onUpdateCover({
                      ...cover,
                      coverBgColor: p.bg,
                      textColor: p.text,
                      accentColor: p.accent
                    })}
                    className="w-full flex items-center justify-between p-2 rounded border border-zinc-200 dark:border-zinc-800 hover:border-orange-500 transition-colors bg-zinc-50 dark:bg-zinc-800/50"
                  >
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{p.name}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full border border-zinc-300" style={{ backgroundColor: p.bg }} />
                      <div className="w-4 h-4 rounded-full border border-zinc-300" style={{ backgroundColor: p.accent }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Style */}
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-2">Cover Layout Archetype</label>
              <select
                value={cover.layoutStyle}
                onChange={(e) => onUpdateCover({ ...cover, layoutStyle: e.target.value as any })}
                className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
              >
                <option value="centered">Centered Classical</option>
                <option value="modern-minimal">Modern Minimalist (High-Contrast)</option>
                <option value="bold-editorial">Bold Editorial (Large Display Type)</option>
                <option value="classic-frame">Classic Framed Border</option>
              </select>
            </div>

            {/* Titles & Author inputs */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">Book Title</label>
                <input
                  type="text"
                  value={cover.title}
                  onChange={(e) => onUpdateCover({ ...cover, title: e.target.value })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded font-bold uppercase text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={cover.subtitle}
                  onChange={(e) => onUpdateCover({ ...cover, subtitle: e.target.value })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">Author Name</label>
                <input
                  type="text"
                  value={cover.author}
                  onChange={(e) => onUpdateCover({ ...cover, author: e.target.value })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Artwork & Blurb */}
        {activeTab === 'artwork' && (
          <div className="space-y-4 text-xs">
            
            {/* Auto Save Confirmation Notice */}
            {autoSaveNotice && (
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg text-xs flex items-center gap-2 animate-fade-in shadow-xs">
                <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{autoSaveNotice}</span>
              </div>
            )}
            {processingError && (
              <div className="p-2.5 border border-rose-500/40 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {processingError}
              </div>
            )}

            <div className="space-y-2">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block">Cover Illustration / Artwork</label>
              
              {/* Device File Dropzone & Upload Button */}
              <div 
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-500 rounded-xl p-4 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    processAndSaveImage(file);
                  }
                }}
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">Upload Artwork from Local Device</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Drag & drop image file or browse (Auto-saves instantly)</p>
                </div>
                <label className="mt-1 px-3 py-1.5 bg-[#FF6B00] hover:bg-orange-600 text-black font-extrabold text-xs rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Optimizing…' : 'Choose Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isProcessing}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        processAndSaveImage(file);
                      }
                    }}
                  />
                </label>
              </div>

              {onOpenImageGallery && (
                <button
                  type="button"
                  onClick={onOpenImageGallery}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-lg border border-zinc-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ImageIcon className="w-4 h-4 text-orange-400" />
                  <span>Select Artwork from Asset Library</span>
                </button>
              )}

              {/* URL Alternative */}
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">Or paste Image Web URL</label>
                <input
                  type="text"
                  value={cover.artworkUrl || ''}
                  onChange={(e) => {
                    onUpdateCover({ ...cover, artworkUrl: e.target.value });
                    if (e.target.value) {
                      setAutoSaveNotice('✓ Image URL saved & updated');
                      setTimeout(() => setAutoSaveNotice(null), 3000);
                    }
                  }}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded font-mono text-xs text-zinc-900 dark:text-zinc-100"
                  placeholder="https://..."
                />
              </div>

              {cover.artworkUrl && (
                <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  {/* Full Bleed Toggle Card */}
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-lg space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs block">Full-Bleed Cover Image</span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Enlarge artwork to cover the entire book cover</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!cover.fullBleedImage}
                        onChange={(e) => onUpdateCover({ ...cover, fullBleedImage: e.target.checked })}
                        className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                      />
                    </label>

                    <div className="pt-2 border-t border-orange-200/60 dark:border-orange-900/40 space-y-3">
                      {([
                        ['Image Brightness / Lightness', 'imageBrightness', 50, 160, 100],
                        ['Image Opacity / Tint', 'imageOpacity', 40, 100, 90],
                        ['Image Contrast', 'imageContrast', 70, 140, 100]
                      ] as const).map(([label, key, min, max, fallback]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                            <span>{label}</span>
                            <span className="font-mono text-orange-600 dark:text-orange-400">{cover[key] ?? fallback}%</span>
                          </div>
                          <input type="range" min={min} max={max} value={cover[key] ?? fallback}
                            onChange={(e) => onUpdateCover({ ...cover, [key]: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                        </div>
                      ))}
                      <button type="button" onClick={() => onUpdateCover(resetCoverImageAppearance(cover))}
                        className="flex items-center gap-1.5 border border-zinc-300 dark:border-zinc-700 px-2 py-1.5 font-bold hover:border-orange-500">
                        <RotateCcw className="w-3.5 h-3.5" /> Reset Image Appearance
                      </button>
                    </div>
                  </div>

                  <div className="border border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
                    <div className="font-extrabold tracking-wider text-zinc-800 dark:text-zinc-200">IMAGE OPTIMISATION</div>
                    <div className="flex justify-between"><span>Output Format</span><strong>WebP</strong></div>
                    <label className="block space-y-1">
                      <span className="flex justify-between"><span>Quality</span><strong>{cover.imageQuality ?? 88}%</strong></span>
                      <input type="range" min="70" max="100" value={cover.imageQuality ?? 88}
                        onChange={(e) => onUpdateCover({ ...cover, imageQuality: Number(e.target.value) })}
                        className="w-full accent-orange-500" />
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={cover.optimizeArtworkAutomatically ?? true}
                        onChange={(e) => onUpdateCover({ ...cover, optimizeArtworkAutomatically: e.target.checked })}
                        className="accent-orange-500" />
                      Optimize uploaded artwork automatically
                    </label>
                    {cover.artworkAsset && (
                      <div className={`border-l-2 pl-2 ${currentSuitability === 'Low Resolution' ? 'border-amber-500 text-amber-700 dark:text-amber-400' : 'border-emerald-500 text-emerald-700 dark:text-emerald-400'}`}>
                        <strong>{currentSuitability === 'Low Resolution' ? 'Low-resolution image' : 'Cover optimized'}</strong>
                        <div className="text-[10px] mt-1">{cover.artworkAsset.originalFormat.replace('image/', '').toUpperCase()} → WebP · {formatBytes(cover.artworkAsset.originalSizeBytes)} → {formatBytes(cover.artworkAsset.optimizedSizeBytes)}</div>
                        <div className="text-[10px]">{cover.artworkAsset.width} × {cover.artworkAsset.height}px · Quality {cover.artworkAsset.quality}% · {currentSuitability}</div>
                        <div className="text-[10px] text-zinc-500">Recommended for {printSettings.trimSize} with bleed: {currentPrintRequirement.width} × {currentPrintRequirement.height}px</div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onUpdateCover({ ...cover, artworkUrl: '', artworkAsset: undefined })}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <X className="w-3.5 h-3.5" /> Clear Cover Artwork
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-300 dark:border-zinc-700 pt-4 space-y-2">
              <div className="font-extrabold tracking-wider text-zinc-800 dark:text-zinc-200">COVER TYPOGRAPHY</div>
              <label className="flex items-center justify-between font-bold">
                <span>Show Book Details on Cover</span>
                <input type="checkbox" checked={cover.showBookDetails ?? true}
                  onChange={(e) => onUpdateCover({ ...cover, showBookDetails: e.target.checked })}
                  className="accent-orange-500" />
              </label>
              <div className={`pl-3 border-l border-zinc-300 dark:border-zinc-700 space-y-1.5 ${cover.showBookDetails === false ? 'opacity-40 pointer-events-none' : ''}`}>
                {([
                  ['Book Title', 'showTitle', true],
                  ['Subtitle', 'showSubtitle', true],
                  ['Author Name', 'showAuthor', true],
                  ['Series / Season', 'showSeries', false],
                  ['Publisher / Imprint', 'showImprint', false]
                ] as const).map(([label, key, fallback]) => (
                  <label key={key} className="flex items-center justify-between">
                    <span>{label}</span>
                    <input type="checkbox" checked={cover[key] ?? fallback}
                      onChange={(e) => onUpdateCover({ ...cover, [key]: e.target.checked })}
                      className="accent-orange-500" />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Back Cover Synopsis / Blurb</label>
              <textarea
                value={cover.backBlurb}
                onChange={(e) => onUpdateCover({ ...cover, backBlurb: e.target.value })}
                rows={6}
                className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
                placeholder="Write compelling back jacket description..."
              />
            </div>
          </div>
        )}

        {/* Tab 3: Spine & Imprint */}
        {activeTab === 'spine' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="font-bold text-orange-700 dark:text-orange-300 mb-1">Spine Calculator</div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Calculated for ~{totalPages * 30} words across {totalPages} pages: <strong className="text-orange-600">{calculatedSpineMm} mm</strong>.
              </p>
            </div>

            <div>
              <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">Publisher Imprint</label>
              <input
                type="text"
                value={cover.publisher}
                onChange={(e) => onUpdateCover({ ...cover, publisher: e.target.value })}
                className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        )}

      </div>

      {/* Right Live 3D / Flat Mockup Canvas */}
      <div className="flex-1 p-8 flex items-center justify-center overflow-auto relative">
        
        {/* Book Cover Live Mockup */}
        <div 
          className="w-80 sm:w-96 h-[520px] rounded-r-lg shadow-2xl p-8 flex flex-col justify-between relative transition-all border-l-8 border-black/30 overflow-hidden"
          style={{
            backgroundColor: cover.coverBgColor,
            color: cover.textColor,
          }}
        >
          {/* Full Bleed Artwork Background */}
          {cover.artworkUrl && cover.fullBleedImage && (
            <>
              <img 
                src={cover.artworkUrl} 
                alt="Full Bleed Cover Background" 
                className="absolute inset-0 w-full h-full object-cover transition-opacity"
                style={coverImageStyle(cover)}
                referrerPolicy="no-referrer"
              />
              {cover.showBookDetails !== false && <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/60 pointer-events-none" />}
            </>
          )}

          {/* Top Title & Subtitle */}
          {cover.showBookDetails !== false && <div className="relative z-10">
            {showCoverField(cover, 'series') && seriesLabel && <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: cover.accentColor }}>{seriesLabel}</div>}
            {showCoverField(cover, 'title') && <div className="text-2xl font-black tracking-wider uppercase border-b-2 pb-2 drop-shadow-md" style={{ borderColor: cover.accentColor }}>
              {cover.title || 'BOOK TITLE'}
            </div>}
            {showCoverField(cover, 'subtitle') && <div className="text-xs font-serif italic mt-2 drop-shadow-sm" style={{ color: cover.accentColor }}>
              {cover.subtitle}
            </div>}
          </div>}

          {/* Inset Artwork (when NOT full-bleed) */}
          {cover.artworkUrl && !cover.fullBleedImage && (
            <div className="my-auto text-center relative z-10">
              <img 
                src={cover.artworkUrl} 
                alt="Cover Artwork" 
                className="max-h-48 mx-auto rounded border-2 object-cover shadow-lg"
                style={{ borderColor: cover.accentColor, ...coverImageStyle(cover) }}
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Bottom Author & Publisher */}
          {cover.showBookDetails !== false && <div className="relative z-10">
            {showCoverField(cover, 'author') && <div className="text-sm font-bold tracking-widest uppercase drop-shadow-sm">
              {cover.author || 'AUTHOR NAME'}
            </div>}
            {showCoverField(cover, 'imprint') && <div className="text-[10px] tracking-widest opacity-80 mt-1 uppercase font-mono">
              {cover.publisher}
            </div>}
          </div>}
        </div>

      </div>

    </div>
  );
};
