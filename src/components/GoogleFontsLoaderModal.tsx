import React, { useState, useEffect } from 'react';
import { Type, Check, Search, X, Sparkles, BookOpen, Layers, RefreshCw } from 'lucide-react';
import { GOOGLE_FONTS, GoogleFont, injectGoogleFont } from '../lib/googleFonts';

interface GoogleFontsLoaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSerifFont?: string;
  selectedSansFont?: string;
  onSelectSerifFont: (fontName: string) => void;
  onSelectSansFont: (fontName: string) => void;
  onApplyFontToActiveBlock?: (fontCSS: string) => void;
}

export const GoogleFontsLoaderModal: React.FC<GoogleFontsLoaderModalProps> = ({
  isOpen,
  onClose,
  selectedSerifFont = 'EB Garamond',
  selectedSansFont = 'Inter',
  onSelectSerifFont,
  onSelectSansFont,
  onApplyFontToActiveBlock,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'serif' | 'sans-serif' | 'monospace'>('serif');
  const [searchQuery, setSearchQuery] = useState('');
  const [customSampleText, setCustomSampleText] = useState('The algorithmic economy and zero-knowledge ledger equilibrium.');
  const [previewFontSize, setPreviewFontSize] = useState<number>(18);

  useEffect(() => {
    // Preload all fonts when modal opens so preview texts render immediately in their real fonts
    if (isOpen) {
      GOOGLE_FONTS.forEach(font => injectGoogleFont(font.googleApiName));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredFonts = GOOGLE_FONTS.filter((font) => {
    const matchesCategory = activeCategory === 'all' || font.category === activeCategory;
    const matchesSearch = font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          font.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#1E1E1E] border border-[#333333] rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-gray-100">
        
        {/* Header */}
        <div className="p-5 border-b border-[#2D2D2D] flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-600/20 text-orange-500 border border-orange-500/30">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                Google Fonts Typography Loader
                <span className="text-[10px] bg-orange-500 text-black font-extrabold px-2 py-0.5 rounded-full font-mono uppercase">
                  PressCraft Typography Studio
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Browse, preview, and inject Google Serif and Sans-Serif fonts directly into your book chapters & front matter.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2A2A2A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Active Selection Indicator */}
        <div className="bg-[#121212] px-6 py-3 border-b border-[#2A2A2A] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold uppercase text-[10px]">Primary Serif Body:</span>
              <span className="text-orange-400 font-bold bg-[#1E1E1E] px-2.5 py-1 rounded border border-[#333]">
                📖 {selectedSerifFont}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold uppercase text-[10px]">Primary Sans Headings:</span>
              <span className="text-blue-400 font-bold bg-[#1E1E1E] px-2.5 py-1 rounded border border-[#333]">
                🎨 {selectedSansFont}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 italic">
            Auto-compiles into PDF, EPUB, and Web publication previews.
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="p-5 border-b border-[#2A2A2A] bg-[#161616] space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Google Fonts by name or style (e.g. Garamond, Lora, Inter)..."
                className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-[#333] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-orange-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-xl border border-[#333] w-full sm:w-auto">
              {(['all', 'serif', 'sans-serif', 'monospace'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All Fonts' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Text Preview Customization */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={customSampleText}
                onChange={(e) => setCustomSampleText(e.target.value)}
                placeholder="Type custom preview text..."
                className="w-full px-3 py-1.5 bg-[#121212] border border-[#2D2D2D] rounded-lg text-xs text-gray-300 placeholder-gray-600 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] text-gray-400 uppercase font-mono font-bold">Size: {previewFontSize}px</span>
              <input
                type="range"
                min={12}
                max={32}
                value={previewFontSize}
                onChange={(e) => setPreviewFontSize(Number(e.target.value))}
                className="w-28 accent-orange-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Font List Grid */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#141414]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFonts.map((font) => {
              const isSelectedSerif = selectedSerifFont.toLowerCase() === font.name.toLowerCase();
              const isSelectedSans = selectedSansFont.toLowerCase() === font.name.toLowerCase();

              return (
                <div
                  key={font.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 bg-[#1A1A1A] ${
                    isSelectedSerif || isSelectedSans
                      ? 'border-orange-500/80 shadow-lg shadow-orange-950/20 ring-1 ring-orange-500/50'
                      : 'border-[#2D2D2D] hover:border-[#444444]'
                  }`}
                >
                  {/* Font Meta */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white tracking-tight">{font.name}</h3>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold ${
                          font.category === 'serif' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' :
                          font.category === 'sans-serif' ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40' :
                          'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                        }`}>
                          {font.category}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-gray-500">{font.weights.length} weights</span>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-1">{font.description}</p>
                  </div>

                  {/* Live Rendered Sample Text */}
                  <div
                    className="p-3 bg-[#111111] border border-[#262626] rounded-xl text-gray-100 overflow-hidden min-h-[70px] flex items-center"
                    style={{
                      fontFamily: font.familyCSS,
                      fontSize: `${previewFontSize}px`,
                      lineHeight: 1.4,
                    }}
                  >
                    {customSampleText || font.sampleText}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#262626]">
                    {font.category === 'serif' && (
                      <button
                        onClick={() => {
                          injectGoogleFont(font.googleApiName);
                          onSelectSerifFont(font.name);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isSelectedSerif
                            ? 'bg-orange-600 text-white'
                            : 'bg-[#262626] text-gray-300 hover:bg-orange-600 hover:text-white'
                        }`}
                      >
                        {isSelectedSerif ? <Check className="w-3.5 h-3.5" /> : null}
                        Set as Book Body Serif
                      </button>
                    )}

                    {font.category === 'sans-serif' && (
                      <button
                        onClick={() => {
                          injectGoogleFont(font.googleApiName);
                          onSelectSansFont(font.name);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isSelectedSans
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#262626] text-gray-300 hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        {isSelectedSans ? <Check className="w-3.5 h-3.5" /> : null}
                        Set as Headings Sans
                      </button>
                    )}

                    {onApplyFontToActiveBlock && (
                      <button
                        onClick={() => {
                          injectGoogleFont(font.googleApiName);
                          onApplyFontToActiveBlock(font.familyCSS);
                        }}
                        className="px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#383838] text-gray-300 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                        title="Apply directly to active chapter block"
                      >
                        <Type className="w-3.5 h-3.5 text-orange-400" />
                        Apply to Selected Block
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFonts.length === 0 && (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <Type className="w-8 h-8 mx-auto opacity-40 text-orange-500" />
              <p className="text-sm font-semibold">No Google Fonts matched "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-orange-400 underline hover:text-orange-300"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2D2D2D] bg-[#181818] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Google Fonts are loaded via high-speed CDN and bundled for offline publishing exports.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
          >
            Done & Save Fonts
          </button>
        </div>
      </div>
    </div>
  );
};
