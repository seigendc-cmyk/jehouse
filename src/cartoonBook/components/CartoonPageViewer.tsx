import React, { useState } from 'react';
import { 
  CartoonPage, 
  CartoonPanel, 
  SpeechBubble, 
  BubbleType 
} from '../types';
import { 
  RefreshCw, 
  Sparkles, 
  Edit3, 
  Plus, 
  Trash2, 
  Move, 
  Maximize2, 
  Wand2, 
  Volume2, 
  MessageSquare,
  LayoutGrid
} from 'lucide-react';
import { generatePanelImageWithAI } from '../cartoonAiService';

interface CartoonPageViewerProps {
  page: CartoonPage;
  artStyle: string;
  onUpdatePage: (updatedPage: CartoonPage) => void;
  isEditable?: boolean;
}

export const CartoonPageViewer: React.FC<CartoonPageViewerProps> = ({
  page,
  artStyle,
  onUpdatePage,
  isEditable = true
}) => {
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);
  const [editingSfxPanelId, setEditingSfxPanelId] = useState<string | null>(null);

  // Layout grid styling classes based on page layoutType
  const getLayoutGridClass = () => {
    switch (page.layoutType) {
      case '1_panel_splash':
        return 'grid-cols-1 grid-rows-1';
      case '2_panel_horizontal':
        return 'grid-cols-1 sm:grid-cols-2 gap-4';
      case '2_panel_vertical':
        return 'grid-cols-1 gap-4';
      case '3_panel_triad':
        return 'grid-cols-1 md:grid-cols-3 gap-4';
      case '4_panel_grid':
      default:
        return 'grid-cols-1 sm:grid-cols-2 gap-4';
    }
  };

  const handleRegeneratePanelImage = async (panelId: string) => {
    const updatedPanels = page.panels.map((p) => {
      if (p.id === panelId) return { ...p, isGeneratingImage: true };
      return p;
    });
    onUpdatePage({ ...page, panels: updatedPanels });

    const targetPanel = page.panels.find((p) => p.id === panelId);
    if (!targetPanel) return;

    const newUrl = await generatePanelImageWithAI(targetPanel.visualPrompt, artStyle);

    const finalPanels = page.panels.map((p) => {
      if (p.id === panelId) {
        return { ...p, illustrationUrl: newUrl, isGeneratingImage: false };
      }
      return p;
    });

    onUpdatePage({ ...page, panels: finalPanels });
  };

  const handleUpdateBubbleText = (panelId: string, bubbleId: string, text: string) => {
    const updatedPanels = page.panels.map((p) => {
      if (p.id === panelId) {
        const updatedBubbles = p.speechBubbles.map((b) => {
          if (b.id === bubbleId) return { ...b, text };
          return b;
        });
        return { ...p, speechBubbles: updatedBubbles };
      }
      return p;
    });
    onUpdatePage({ ...page, panels: updatedPanels });
  };

  const handleAddSpeechBubble = (panelId: string) => {
    const updatedPanels = page.panels.map((p) => {
      if (p.id === panelId) {
        const newBubble: SpeechBubble = {
          id: `bubble-${Date.now()}`,
          speakerName: 'Character',
          text: 'New cartoon dialogue!',
          bubbleType: 'speech',
          position: { x: 30, y: 30 }
        };
        return { ...p, speechBubbles: [...p.speechBubbles, newBubble] };
      }
      return p;
    });
    onUpdatePage({ ...page, panels: updatedPanels });
  };

  const handleDeleteBubble = (panelId: string, bubbleId: string) => {
    const updatedPanels = page.panels.map((p) => {
      if (p.id === panelId) {
        return {
          ...p,
          speechBubbles: p.speechBubbles.filter((b) => b.id !== bubbleId)
        };
      }
      return p;
    });
    onUpdatePage({ ...page, panels: updatedPanels });
  };

  const handleUpdateSfx = (panelId: string, sfxText: string) => {
    const updatedPanels = page.panels.map((p) => {
      if (p.id === panelId) {
        return { ...p, sfxText };
      }
      return p;
    });
    onUpdatePage({ ...page, panels: updatedPanels });
  };

  return (
    <div className="bg-[#121212] border border-[#2d2d2d] rounded-2xl p-6 space-y-6 shadow-2xl select-none">
      
      {/* Comic Page Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#2A2A2A] pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/40 text-[#FF6B00] text-xs font-mono font-bold uppercase">
              PAGE {page.pageNumber}
            </span>
            <h3 className="text-lg font-black text-white uppercase tracking-wider font-sans">
              {page.pageTitle}
            </h3>
          </div>
          {page.backgroundSetting && (
            <p className="text-xs text-gray-400 mt-1 italic">
              Setting: {page.backgroundSetting}
            </p>
          )}
        </div>

        {isEditable && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 font-bold uppercase mr-1">
              Layout:
            </label>
            <select
              value={page.layoutType}
              onChange={(e) => onUpdatePage({ ...page, layoutType: e.target.value as any })}
              className="bg-[#222222] border border-[#3A3A3A] text-white text-xs rounded px-2.5 py-1 font-mono focus:outline-hidden focus:border-[#FF6B00] cursor-pointer"
            >
              <option value="1_panel_splash">1 Panel Splash Spread</option>
              <option value="2_panel_horizontal">2 Panels Side-by-Side</option>
              <option value="2_panel_vertical">2 Panels Stacked</option>
              <option value="3_panel_triad">3 Panels Triad</option>
              <option value="4_panel_grid">4 Panels Grid</option>
            </select>
          </div>
        )}
      </div>

      {/* Top Narrative Banner Box (if present) */}
      {page.narrativeText && (
        <div className="p-3 bg-[#1E1A16] border-2 border-[#D97706] rounded-lg shadow-md font-serif text-sm text-amber-100 italic">
          <span className="font-sans font-bold uppercase text-amber-500 text-[10px] tracking-widest block not-italic mb-0.5">
            Story Chapter Intro:
          </span>
          "{page.narrativeText}"
        </div>
      )}

      {/* Comic Book Panels Grid */}
      <div className={`grid ${getLayoutGridClass()} gap-5`}>
        {page.panels.map((panel) => (
          <div
            key={panel.id}
            onClick={() => setActivePanelId(panel.id)}
            className={`relative bg-[#1A1A1A] border-4 rounded-xl overflow-hidden transition-all shadow-xl group flex flex-col ${
              activePanelId === panel.id 
                ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/40' 
                : 'border-white hover:border-amber-400'
            }`}
            style={{ minHeight: page.layoutType === '1_panel_splash' ? '420px' : '280px' }}
          >
            {/* Panel Number Badge */}
            <div className="absolute top-2 left-2 z-20 bg-black/80 backdrop-blur-xs text-amber-400 border border-amber-500/50 px-2 py-0.5 rounded font-mono font-black text-xs">
              PANEL {panel.panelNumber}
            </div>

            {/* Panel Actions overlay */}
            {isEditable && (
              <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-lg border border-[#444]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegeneratePanelImage(panel.id);
                  }}
                  disabled={panel.isGeneratingImage}
                  className="p-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded text-xs transition-colors cursor-pointer"
                  title="Re-draw AI Illustration"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddSpeechBubble(panel.id);
                  }}
                  className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded text-xs transition-colors cursor-pointer"
                  title="Add Speech Bubble"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Illustration Canvas / Image Display */}
            <div className="relative flex-1 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
              {panel.isGeneratingImage ? (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10 text-amber-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#FF6B00]" />
                  <span className="text-xs font-mono font-bold">Rendering AI Art Panel...</span>
                </div>
              ) : null}

              <img
                src={panel.illustrationUrl}
                alt={panel.visualPrompt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Sound Effect (SFX) Explosion Overlay */}
              {panel.sfxText && (
                <div 
                  className="absolute bottom-4 right-4 z-10 font-black text-xl sm:text-2xl italic tracking-widest text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] transform -rotate-12 border-2 border-red-600 bg-red-600/80 px-3 py-1 rounded-md shadow-2xl animate-pulse"
                  style={{ color: panel.sfxColor || '#FFE600' }}
                >
                  {panel.sfxText}
                </div>
              )}

              {/* Speech Bubbles Layer */}
              {panel.speechBubbles.map((bubble) => (
                <div
                  key={bubble.id}
                  style={{ top: `${bubble.position.y}%`, left: `${bubble.position.x}%` }}
                  className="absolute z-10 max-w-[70%] transform -translate-x-1/2 -translate-y-1/2"
                >
                  <div
                    className={`relative p-2.5 rounded-2xl shadow-2xl text-xs font-bold text-gray-900 border-2 border-black max-w-xs ${
                      bubble.bubbleType === 'thought'
                        ? 'bg-blue-50 rounded-full border-dashed border-blue-400'
                        : bubble.bubbleType === 'shout'
                        ? 'bg-yellow-200 border-red-600 uppercase tracking-wide transform rotate-1'
                        : 'bg-white'
                    }`}
                  >
                    {/* Speaker Label */}
                    <span className="block text-[9px] font-mono font-black uppercase text-amber-700 tracking-wider mb-0.5">
                      {bubble.speakerName}
                    </span>

                    {/* Speech Text (Editable inline) */}
                    {isEditable && editingBubbleId === bubble.id ? (
                      <input
                        type="text"
                        value={bubble.text}
                        onChange={(e) => handleUpdateBubbleText(panel.id, bubble.id, e.target.value)}
                        onBlur={() => setEditingBubbleId(null)}
                        autoFocus
                        className="w-full bg-yellow-100 border border-amber-400 rounded px-1.5 py-0.5 text-xs text-black focus:outline-hidden"
                      />
                    ) : (
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isEditable) setEditingBubbleId(bubble.id);
                        }}
                        className="cursor-pointer hover:underline"
                        title="Click to edit speech text"
                      >
                        {bubble.text}
                      </span>
                    )}

                    {/* Speech Tail Pointer */}
                    <div className="absolute -bottom-2 left-4 w-3 h-3 bg-white border-b-2 border-r-2 border-black transform rotate-45" />

                    {/* Delete bubble button */}
                    {isEditable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBubble(panel.id, bubble.id);
                        }}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-0.5 rounded-full hover:bg-red-700 cursor-pointer shadow-md"
                        title="Remove bubble"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Caption Box (Classic Comic Narrative) */}
            {panel.narrativeCaption && (
              <div className="bg-[#2A231A] border-t-2 border-black p-2 font-mono text-[11px] text-amber-200 font-bold border-l-4 border-l-[#FF6B00]">
                {panel.narrativeCaption}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
