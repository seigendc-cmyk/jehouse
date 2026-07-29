import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  ArrowRight, 
  Upload, 
  Plus, 
  Trash2, 
  Eye, 
  Check, 
  FileText, 
  ShoppingBag, 
  Heart, 
  Palette, 
  Layout, 
  Image as ImageIcon, 
  Tag, 
  Sparkles, 
  Layers,
  Star
} from 'lucide-react';
import { 
  BusinessFlyer, 
  ProductCatalogue, 
  InvitationCard, 
  DocumentFormat, 
  PageOrientation,
  FlyerTheme,
  CatalogueLayout,
  InvitationType,
  InvitationTheme,
  FlyerFeatureItem,
  CatalogueProduct
} from '../types';
import { PRESET_FLYERS, PRESET_CATALOGUES, PRESET_INVITATIONS } from '../templates';
import { FlyerPreview } from './FlyerPreview';
import { CataloguePreview } from './CataloguePreview';
import { InvitationPreview } from './InvitationPreview';

interface DesignStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportToBookStudio?: (chapter: { id: string; number: number; title: string; wordCount: number; blocks: any[] }) => void;
}

export const DesignStudioModal: React.FC<DesignStudioModalProps> = ({
  isOpen,
  onClose,
  onImportToBookStudio
}) => {
  const [activeModule, setActiveModule] = useState<'flyer' | 'catalogue' | 'invitation'>('flyer');
  
  // States for active items
  const [flyer, setFlyer] = useState<BusinessFlyer>(PRESET_FLYERS[0]);
  const [catalogue, setCatalogue] = useState<ProductCatalogue>(PRESET_CATALOGUES[0]);
  const [invitation, setInvitation] = useState<InvitationCard>(PRESET_INVITATIONS[0]);

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper for image upload
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onSuccess(event.target.result as string);
        showToast('Image uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Print & PDF Export
  const handlePrintPdf = () => {
    window.print();
  };

  // Handle Import to Book Studio
  const handleImportToBook = () => {
    if (!onImportToBookStudio) return;

    let title = '';
    let blocks: any[] = [];

    if (activeModule === 'flyer') {
      title = `Flyer: ${flyer.title}`;
      blocks = [
        { id: `b-${Date.now()}-1`, type: 'heading', text: flyer.title },
        { id: `b-${Date.now()}-2`, type: 'paragraph', text: `${flyer.subtitle}\n${flyer.bodyText}` },
        { id: `b-${Date.now()}-3`, type: 'paragraph', text: `Call to Action: ${flyer.callToAction}` }
      ];
    } else if (activeModule === 'catalogue') {
      title = `Catalogue: ${catalogue.title}`;
      blocks = [
        { id: `b-${Date.now()}-1`, type: 'heading', text: catalogue.title },
        { id: `b-${Date.now()}-2`, type: 'paragraph', text: `Company: ${catalogue.companyName}\n${catalogue.subtitle}` },
        ...catalogue.products.map((p, idx) => ({
          id: `b-${Date.now()}-p-${idx}`,
          type: 'paragraph',
          text: `[PRODUCT] ${p.name} - ${catalogue.currencySymbol}${p.price}\n${p.description}`
        }))
      ];
    } else {
      title = `Invitation: ${invitation.celebrants}`;
      blocks = [
        { id: `b-${Date.now()}-1`, type: 'heading', text: invitation.title },
        { id: `b-${Date.now()}-2`, type: 'paragraph', text: `${invitation.celebrants}\nDate: ${invitation.eventDate} at ${invitation.eventTime}\nVenue: ${invitation.venueName}, ${invitation.address}` }
      ];
    }

    onImportToBookStudio({
      id: `ch-ds-${Date.now()}`,
      number: 99,
      title: title,
      wordCount: blocks.reduce((acc, b) => acc + b.text.split(' ').length, 0),
      blocks: blocks
    });

    showToast(`Imported ${activeModule.toUpperCase()} into Book Studio as a Chapter!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-[#1C1C1E] text-zinc-100 border border-zinc-700/80 rounded-2xl w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 bg-[#252528] border-b border-zinc-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white tracking-wide">
                  Design Studio Pro
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Flyers • Catalogues • Invitations
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Design business flyers, product catalogues & luxury invitation cards with custom formats & page orientations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrintPdf}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {onImportToBookStudio && (
              <button
                onClick={handleImportToBook}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                title="Convert to Chapter in Book Studio"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Import to Book</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOP MODULE SELECTOR BAR */}
        <div className="bg-[#212124] border-b border-zinc-800 px-5 py-2.5 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModule('flyer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeModule === 'flyer' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. Business Flyer</span>
            </button>

            <button
              onClick={() => setActiveModule('catalogue')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeModule === 'catalogue' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>2. Product Catalogue</span>
            </button>

            <button
              onClick={() => setActiveModule('invitation')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeModule === 'invitation' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>3. Invitation Cards</span>
            </button>
          </div>

          {/* PRESET LOADERS DROPDOWN */}
          <div className="flex items-center gap-2 text-xs">
            {activeModule === 'flyer' && (
              <select
                onChange={(e) => {
                  const found = PRESET_FLYERS.find(p => p.id === e.target.value);
                  if (found) {
                    setFlyer(found);
                    showToast(`Loaded "${found.title}" preset flyer!`);
                  }
                }}
                className="bg-zinc-800 text-xs text-zinc-200 border border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="">Load Preset Flyer Template...</option>
                {PRESET_FLYERS.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            )}

            {activeModule === 'catalogue' && (
              <select
                onChange={(e) => {
                  const found = PRESET_CATALOGUES.find(p => p.id === e.target.value);
                  if (found) {
                    setCatalogue(found);
                    showToast(`Loaded "${found.title}" preset catalogue!`);
                  }
                }}
                className="bg-zinc-800 text-xs text-zinc-200 border border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="">Load Preset Catalogue Template...</option>
                {PRESET_CATALOGUES.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            )}

            {activeModule === 'invitation' && (
              <select
                onChange={(e) => {
                  const found = PRESET_INVITATIONS.find(p => p.id === e.target.value);
                  if (found) {
                    setInvitation(found);
                    showToast(`Loaded "${found.celebrants}" invitation template!`);
                  }
                }}
                className="bg-zinc-800 text-xs text-zinc-200 border border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="">Load Preset Invitation Template...</option>
                {PRESET_INVITATIONS.map(p => (
                  <option key={p.id} value={p.id}>{p.celebrants} ({p.type})</option>
                ))}
              </select>
            )}
          </div>

        </div>

        {/* MAIN SPLIT WORKSPACE: EDITOR & PREVIEW */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT COLUMN: CONTROLS & FORM EDITOR */}
          <div className="lg:col-span-6 border-r border-zinc-800 flex flex-col h-full bg-[#1C1C1E] overflow-y-auto p-5 space-y-6">
            
            {/* FORMAT & ORIENTATION CONTROLS (SHARED FOR ALL MODULES) */}
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 border-b border-zinc-800 pb-2">
                <Layout className="w-4 h-4" />
                <span>Document Format & Page Orientation Settings</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                
                {/* Format selection */}
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Paper Format</label>
                  <select
                    value={
                      activeModule === 'flyer' ? flyer.format :
                      activeModule === 'catalogue' ? catalogue.format : invitation.format
                    }
                    onChange={(e) => {
                      const fmt = e.target.value as DocumentFormat;
                      if (activeModule === 'flyer') setFlyer(f => ({ ...f, format: fmt }));
                      else if (activeModule === 'catalogue') setCatalogue(c => ({ ...c, format: fmt }));
                      else setInvitation(i => ({ ...i, format: fmt }));
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                  >
                    <option value="a4">A4 Standard</option>
                    <option value="us_letter">US Letter</option>
                    <option value="square_1to1">Square (1:1)</option>
                    <option value="social_banner">Social Banner (16:9)</option>
                  </select>
                </div>

                {/* Page Orientation */}
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Page Orientation</label>
                  <select
                    value={
                      activeModule === 'flyer' ? flyer.orientation :
                      activeModule === 'catalogue' ? catalogue.orientation : invitation.orientation
                    }
                    onChange={(e) => {
                      const ori = e.target.value as PageOrientation;
                      if (activeModule === 'flyer') setFlyer(f => ({ ...f, orientation: ori }));
                      else if (activeModule === 'catalogue') setCatalogue(c => ({ ...c, orientation: ori }));
                      else setInvitation(i => ({ ...i, orientation: ori }));
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                  >
                    <option value="portrait">Portrait (Vertical)</option>
                    <option value="landscape">Landscape (Horizontal)</option>
                  </select>
                </div>

                {/* Accent Color picker */}
                <div className="col-span-2">
                  <label className="block text-zinc-400 text-[11px] mb-1">Primary Color Accent</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={
                        activeModule === 'flyer' ? flyer.primaryColor :
                        activeModule === 'catalogue' ? catalogue.primaryColor : invitation.primaryColor
                      }
                      onChange={(e) => {
                        const col = e.target.value;
                        if (activeModule === 'flyer') setFlyer(f => ({ ...f, primaryColor: col }));
                        else if (activeModule === 'catalogue') setCatalogue(c => ({ ...c, primaryColor: col }));
                        else setInvitation(i => ({ ...i, primaryColor: col }));
                      }}
                      className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={
                        activeModule === 'flyer' ? flyer.primaryColor :
                        activeModule === 'catalogue' ? catalogue.primaryColor : invitation.primaryColor
                      }
                      onChange={(e) => {
                        const col = e.target.value;
                        if (activeModule === 'flyer') setFlyer(f => ({ ...f, primaryColor: col }));
                        else if (activeModule === 'catalogue') setCatalogue(c => ({ ...c, primaryColor: col }));
                        else setInvitation(i => ({ ...i, primaryColor: col }));
                      }}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono flex-1"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* MODULE 1: BUSINESS FLYER FORM */}
            {activeModule === 'flyer' && (
              <div className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Flyer Headline / Title</label>
                    <input 
                      type="text" 
                      value={flyer.title}
                      onChange={e => setFlyer(f => ({ ...f, title: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Subtitle</label>
                    <input 
                      type="text" 
                      value={flyer.subtitle}
                      onChange={e => setFlyer(f => ({ ...f, subtitle: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Promo Badge (e.g. 50% OFF)</label>
                    <input 
                      type="text" 
                      value={flyer.promoBadge || ''}
                      onChange={e => setFlyer(f => ({ ...f, promoBadge: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Discount Headline</label>
                    <input 
                      type="text" 
                      value={flyer.discountHeadline || ''}
                      onChange={e => setFlyer(f => ({ ...f, discountHeadline: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Main Body Text</label>
                  <textarea 
                    rows={3}
                    value={flyer.bodyText}
                    onChange={e => setFlyer(f => ({ ...f, bodyText: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white text-xs leading-relaxed"
                  />
                </div>

                {/* Hero Image & Logo Upload */}
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between font-bold text-zinc-300">
                    <span>Flyer Hero Image & Logo Upload</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 text-[11px] mb-1">Hero Image</label>
                      <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer font-bold border border-zinc-700">
                        <Upload className="w-3.5 h-3.5 text-purple-400" />
                        <span>Upload Hero Image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={e => handleImageUpload(e, url => setFlyer(f => ({ ...f, heroImageUrl: url })))}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-[11px] mb-1">Logo Image</label>
                      <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer font-bold border border-zinc-700">
                        <Upload className="w-3.5 h-3.5 text-purple-400" />
                        <span>Upload Logo File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={e => handleImageUpload(e, url => setFlyer(f => ({ ...f, logoUrl: url })))}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Features List Manager */}
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between font-bold text-purple-400">
                    <span>Key Features ({flyer.features.length})</span>
                    <button
                      onClick={() => {
                        const newFeat: FlyerFeatureItem = { id: `f-${Date.now()}`, title: 'New Feature', description: 'Feature description...' };
                        setFlyer(f => ({ ...f, features: [...f.features, newFeat] }));
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-2.5 py-1 rounded-lg"
                    >
                      + Add Feature
                    </button>
                  </div>

                  <div className="space-y-2">
                    {flyer.features.map((feat, idx) => (
                      <div key={feat.id} className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <input 
                            type="text" 
                            value={feat.title}
                            onChange={e => {
                              const updated = [...flyer.features];
                              updated[idx].title = e.target.value;
                              setFlyer(f => ({ ...f, features: updated }));
                            }}
                            className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-white font-bold"
                          />
                          <button
                            onClick={() => setFlyer(f => ({ ...f, features: f.features.filter((_, i) => i !== idx) }))}
                            className="text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input 
                          type="text" 
                          value={feat.description}
                          onChange={e => {
                            const updated = [...flyer.features];
                            updated[idx].description = e.target.value;
                            setFlyer(f => ({ ...f, features: updated }));
                          }}
                          className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-zinc-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA & Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-zinc-400 font-medium mb-1">Call to Action Text</label>
                    <input 
                      type="text" 
                      value={flyer.callToAction}
                      onChange={e => setFlyer(f => ({ ...f, callToAction: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-bold text-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Email</label>
                    <input 
                      type="text" 
                      value={flyer.contactEmail}
                      onChange={e => setFlyer(f => ({ ...f, contactEmail: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={flyer.contactPhone}
                      onChange={e => setFlyer(f => ({ ...f, contactPhone: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* MODULE 2: PRODUCT CATALOGUE FORM */}
            {activeModule === 'catalogue' && (
              <div className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Catalogue Title</label>
                    <input 
                      type="text" 
                      value={catalogue.title}
                      onChange={e => setCatalogue(c => ({ ...c, title: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Company Name</label>
                    <input 
                      type="text" 
                      value={catalogue.companyName}
                      onChange={e => setCatalogue(c => ({ ...c, companyName: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Grid Layout Style</label>
                    <select
                      value={catalogue.layout}
                      onChange={e => setCatalogue(c => ({ ...c, layout: e.target.value as CatalogueLayout }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="grid_3col">3-Column Grid</option>
                      <option value="grid_2col">2-Column Grid</option>
                      <option value="hero_featured">Single Focus / Featured</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Currency Symbol</label>
                    <input 
                      type="text" 
                      value={catalogue.currencySymbol}
                      onChange={e => setCatalogue(c => ({ ...c, currencySymbol: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-amber-400 font-bold"
                    />
                  </div>
                </div>

                {/* Catalogue Cover Image Upload */}
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between font-bold text-zinc-300">
                    <span>Catalogue Cover Image & Logo Upload</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer font-bold border border-zinc-700">
                      <Upload className="w-3.5 h-3.5 text-purple-400" />
                      <span>Upload Cover Image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => handleImageUpload(e, url => setCatalogue(c => ({ ...c, coverImageUrl: url })))}
                      />
                    </label>

                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer font-bold border border-zinc-700">
                      <Upload className="w-3.5 h-3.5 text-purple-400" />
                      <span>Upload Logo File</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => handleImageUpload(e, url => setCatalogue(c => ({ ...c, logoUrl: url })))}
                      />
                    </label>
                  </div>
                </div>

                {/* Products Manager */}
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between font-bold text-purple-400">
                    <span>Products ({catalogue.products.length})</span>
                    <button
                      onClick={() => {
                        const newProd: CatalogueProduct = {
                          id: `p-${Date.now()}`,
                          name: 'New Product',
                          category: 'General',
                          price: '99',
                          description: 'Product specification description...'
                        };
                        setCatalogue(c => ({ ...c, products: [...c.products, newProd] }));
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-2.5 py-1 rounded-lg"
                    >
                      + Add Product
                    </button>
                  </div>

                  <div className="space-y-3">
                    {catalogue.products.map((prod, pIdx) => (
                      <div key={prod.id} className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input 
                            type="text" 
                            value={prod.name}
                            onChange={e => {
                              const updated = [...catalogue.products];
                              updated[pIdx].name = e.target.value;
                              setCatalogue(c => ({ ...c, products: updated }));
                            }}
                            className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-white font-bold flex-1"
                          />
                          <div className="flex items-center gap-1">
                            <input 
                              type="text" 
                              placeholder="Price"
                              value={prod.price}
                              onChange={e => {
                                const updated = [...catalogue.products];
                                updated[pIdx].price = e.target.value;
                                setCatalogue(c => ({ ...c, products: updated }));
                              }}
                              className="w-16 bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-amber-400 font-bold"
                            />
                            <button
                              onClick={() => setCatalogue(c => ({ ...c, products: c.products.filter((_, i) => i !== pIdx) }))}
                              className="text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            placeholder="Category"
                            value={prod.category}
                            onChange={e => {
                              const updated = [...catalogue.products];
                              updated[pIdx].category = e.target.value;
                              setCatalogue(c => ({ ...c, products: updated }));
                            }}
                            className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-zinc-300"
                          />
                          <input 
                            type="text" 
                            placeholder="Badge (e.g. BEST SELLER)"
                            value={prod.badge || ''}
                            onChange={e => {
                              const updated = [...catalogue.products];
                              updated[pIdx].badge = e.target.value;
                              setCatalogue(c => ({ ...c, products: updated }));
                            }}
                            className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-amber-400"
                          />
                        </div>

                        <textarea 
                          rows={2}
                          value={prod.description}
                          onChange={e => {
                            const updated = [...catalogue.products];
                            updated[pIdx].description = e.target.value;
                            setCatalogue(c => ({ ...c, products: updated }));
                          }}
                          className="w-full bg-zinc-900 border border-zinc-600 rounded p-2 text-zinc-300"
                        />

                        {/* Product Image Upload */}
                        <div className="flex items-center gap-2">
                          <label className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-600 cursor-pointer text-[11px] font-bold">
                            Upload Product Image
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => handleImageUpload(e, url => {
                                const updated = [...catalogue.products];
                                updated[pIdx].imageUrl = url;
                                setCatalogue(c => ({ ...c, products: updated }));
                              })}
                            />
                          </label>
                          {prod.imageUrl && <span className="text-[10px] text-emerald-400 font-bold">✓ Image Set</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* MODULE 3: INVITATION CARDS FORM */}
            {activeModule === 'invitation' && (
              <div className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Invitation Type</label>
                    <select
                      value={invitation.type}
                      onChange={e => setInvitation(i => ({ ...i, type: e.target.value as InvitationType }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="marriage">Marriage Ceremony</option>
                      <option value="birthday">Birthday Party</option>
                      <option value="gala">Gala / Ball</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="graduation">Graduation</option>
                      <option value="baby_shower">Baby Shower</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Font Style</label>
                    <select
                      value={invitation.fontStyle}
                      onChange={e => setInvitation(i => ({ ...i, fontStyle: e.target.value as any }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="serif_gold">Royal Gold Serif</option>
                      <option value="script_romance">Romantic Italic</option>
                      <option value="playful">Playful Party Bold</option>
                      <option value="sans_modern">Modern Minimal Sans</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Header Title</label>
                    <input 
                      type="text" 
                      value={invitation.title}
                      onChange={e => setInvitation(i => ({ ...i, title: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Celebrants / Host Names</label>
                    <input 
                      type="text" 
                      value={invitation.celebrants}
                      onChange={e => setInvitation(i => ({ ...i, celebrants: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Event Date</label>
                    <input 
                      type="text" 
                      value={invitation.eventDate}
                      onChange={e => setInvitation(i => ({ ...i, eventDate: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Event Time</label>
                    <input 
                      type="text" 
                      value={invitation.eventTime}
                      onChange={e => setInvitation(i => ({ ...i, eventTime: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-zinc-400 font-medium mb-1">Venue Name & Address</label>
                    <input 
                      type="text" 
                      value={invitation.venueName}
                      onChange={e => setInvitation(i => ({ ...i, venueName: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white mb-1"
                      placeholder="Venue Name"
                    />
                    <input 
                      type="text" 
                      value={invitation.address}
                      onChange={e => setInvitation(i => ({ ...i, address: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      placeholder="Address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Personal Message / Quote</label>
                  <textarea 
                    rows={3}
                    value={invitation.message}
                    onChange={e => setInvitation(i => ({ ...i, message: e.target.value }))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white text-xs leading-relaxed"
                  />
                </div>

                {/* Hero Photo Upload */}
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between font-bold text-zinc-300">
                    <span>Celebration Photo Upload</span>
                  </div>

                  <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer font-bold border border-zinc-700">
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>Upload Couple / Host Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={e => handleImageUpload(e, url => setInvitation(i => ({ ...i, heroImageUrl: url })))}
                    />
                  </label>
                </div>

                {/* Dress Code & RSVP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Dress Code</label>
                    <input 
                      type="text" 
                      value={invitation.dressCode || ''}
                      onChange={e => setInvitation(i => ({ ...i, dressCode: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">RSVP Deadline</label>
                    <input 
                      type="text" 
                      value={invitation.rsvpDeadline || ''}
                      onChange={e => setInvitation(i => ({ ...i, rsvpDeadline: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* RIGHT COLUMN: REAL-TIME DOCUMENT PREVIEW */}
          <div className="lg:col-span-6 bg-zinc-950 p-6 overflow-y-auto h-full flex flex-col items-center justify-start">
            <div className="w-full max-w-xl transform scale-95 origin-top space-y-4">
              
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-2">
                <span>Active Preview Mode</span>
                <span className="text-purple-400 font-bold uppercase">
                  {activeModule.toUpperCase()} • {
                    activeModule === 'flyer' ? `${flyer.format} (${flyer.orientation})` :
                    activeModule === 'catalogue' ? `${catalogue.format} (${catalogue.orientation})` :
                    `${invitation.format} (${invitation.orientation})`
                  }
                </span>
              </div>

              {activeModule === 'flyer' && <FlyerPreview flyer={flyer} />}
              {activeModule === 'catalogue' && <CataloguePreview catalogue={catalogue} />}
              {activeModule === 'invitation' && <InvitationPreview invitation={invitation} />}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
