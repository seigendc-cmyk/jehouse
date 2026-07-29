import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Sparkles, 
  Upload, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  Printer, 
  Download, 
  ArrowRight, 
  Layout, 
  Palette, 
  Image as ImageIcon, 
  Layers, 
  Type, 
  Check, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  FileText,
  ChevronUp,
  ChevronDown,
  Bold,
  Italic,
  List,
  Quote,
  Heading2
} from 'lucide-react';
import { CompanyProfile, CompanySection, CompanyServiceItem, CompanyStatItem, CompanyTeamMember, CompanyTestimonial, SectionType } from '../types';
import { COMPANY_PROFILE_TEMPLATES } from '../templates';
import { CompanyProfilePreview } from './CompanyProfilePreview';

interface CompanyProfileStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportToBookStudio?: (chapter: { id: string; number: number; title: string; wordCount: number; blocks: any[] }) => void;
}

export const CompanyProfileStudioModal: React.FC<CompanyProfileStudioModalProps> = ({
  isOpen,
  onClose,
  onImportToBookStudio
}) => {
  const [profile, setProfile] = useState<CompanyProfile>(COMPANY_PROFILE_TEMPLATES[0]);
  const [activeTab, setActiveTab] = useState<'branding' | 'sections' | 'preview'>('branding');
  const [activeSectionId, setActiveSectionId] = useState<string>(COMPANY_PROFILE_TEMPLATES[0].sections[0]?.id || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Preset colors
  const ACCENT_COLORS = [
    { name: 'Cobalt Blue', hex: '#2563eb' },
    { name: 'Executive Slate', hex: '#0f172a' },
    { name: 'Emerald Green', hex: '#059669' },
    { name: 'Royal Amber', hex: '#d97706' },
    { name: 'Crimson Red', hex: '#dc2626' },
    { name: 'Deep Purple', hex: '#7c3aed' }
  ];

  // Helper for profile state update
  const updateProfile = (partial: Partial<CompanyProfile>) => {
    setProfile(prev => ({ ...prev, ...partial }));
  };

  // Helper for updating specific section
  const updateSection = (sectionId: string, partial: Partial<CompanySection>) => {
    setProfile(prev => ({
      ...prev,
      sections: prev.sections.map(sec => sec.id === sectionId ? { ...sec, ...partial } : sec)
    }));
  };

  // Move section up/down
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= profile.sections.length) return;

    const newSections = [...profile.sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(newIndex, 0, moved);

    updateProfile({ sections: newSections });
  };

  // Add new section
  const handleAddSection = (type: SectionType) => {
    const newId = `sec-${Date.now()}`;
    const newSec: CompanySection = {
      id: newId,
      type: type,
      title: type === 'custom' ? 'Custom Company Section' : type.replace('_', ' ').toUpperCase(),
      subtitle: 'Section subtitle description',
      content: 'Enter section content details here...'
    };

    updateProfile({ sections: [...profile.sections, newSec] });
    setActiveSectionId(newId);
    showToast(`Added new ${type.replace('_', ' ')} section!`);
  };

  // Delete section
  const handleDeleteSection = (id: string) => {
    if (profile.sections.length <= 1) return;
    const filtered = profile.sections.filter(s => s.id !== id);
    updateProfile({ sections: filtered });
    if (activeSectionId === id) {
      setActiveSectionId(filtered[0]?.id || '');
    }
  };

  // File Uploader helper for Images
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    onSuccess: (dataUrl: string) => void
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

  // Insert formatting tag into section content
  const insertFormatting = (sectionId: string, formatType: 'bold' | 'heading' | 'bullet' | 'quote') => {
    const targetSection = profile.sections.find(s => s.id === sectionId);
    if (!targetSection) return;

    let addition = '';
    switch (formatType) {
      case 'bold':
        addition = ' **Bold Text** ';
        break;
      case 'heading':
        addition = '\n\n**Subheading Title**\n';
        break;
      case 'bullet':
        addition = '\n- Key point or bullet feature item\n';
        break;
      case 'quote':
        addition = '\n"Key quote or executive statement highlighting our values."\n';
        break;
    }

    updateSection(sectionId, {
      content: (targetSection.content || '') + addition
    });
  };

  // Print & PDF Export Handler
  const handlePrintPdf = () => {
    window.print();
  };

  // Import to Book Studio Handler
  const handleImportToBook = () => {
    if (!onImportToBookStudio) return;

    const blocks = [
      {
        id: `b-${Date.now()}-title`,
        type: 'heading',
        text: `Company Profile: ${profile.name}`
      },
      {
        id: `b-${Date.now()}-tagline`,
        type: 'paragraph',
        text: `Tagline: ${profile.tagline}\nIndustry: ${profile.industry} | HQ: ${profile.headquarters}`
      },
      ...profile.sections.map((sec, idx) => ({
        id: `b-${Date.now()}-sec-${idx}`,
        type: 'paragraph',
        text: `--- ${sec.title.toUpperCase()} ---\n${sec.content}`
      }))
    ];

    onImportToBookStudio({
      id: `ch-cp-${Date.now()}`,
      number: 99,
      title: `Company Profile - ${profile.name}`,
      wordCount: blocks.reduce((acc, b) => acc + b.text.split(' ').length, 0),
      blocks: blocks
    });

    showToast('Imported Company Profile into Book Studio as a Chapter!');
    onClose();
  };

  const activeSection = profile.sections.find(s => s.id === activeSectionId) || profile.sections[0];

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
        
        {/* MODAL TOP HEADER */}
        <div className="px-5 py-3.5 bg-[#252528] border-b border-zinc-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white tracking-wide">
                  Company Profile Studio
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  Pro Module
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Create stunning modern corporate profiles, brochures & business overviews
              </p>
            </div>
          </div>

          {/* Quick Preset Selector & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <select
              onChange={(e) => {
                const t = COMPANY_PROFILE_TEMPLATES.find(temp => temp.id === e.target.value);
                if (t) {
                  setProfile(t);
                  setActiveSectionId(t.sections[0]?.id || '');
                  showToast(`Loaded "${t.name}" profile template!`);
                }
              }}
              className="bg-zinc-800 text-xs text-zinc-200 border border-zinc-600 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer hidden md:block"
            >
              <option value="">Load Preset Profile Template...</option>
              {COMPANY_PROFILE_TEMPLATES.map(temp => (
                <option key={temp.id} value={temp.id}>{temp.name} ({temp.industry})</option>
              ))}
            </select>

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

        {/* WORKSPACE TAB SWITCHER BAR */}
        <div className="bg-[#212124] border-b border-zinc-800 px-5 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab('branding')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'branding' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>1. Identity & Branding</span>
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'sections' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Content & Formatting</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'preview' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3. Full Document Preview</span>
            </button>
          </div>

          <div className="text-xs text-zinc-400 hidden lg:flex items-center gap-2 font-mono">
            <span>Company: <strong className="text-white">{profile.name}</strong></span>
            <span>•</span>
            <span>Sections: <strong className="text-blue-400">{profile.sections.length}</strong></span>
          </div>
        </div>

        {/* MAIN STUDIO CONTENT SPLIT WORKSPACE */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* TAB 1: IDENTITY & BRANDING */}
          {activeTab === 'branding' && (
            <div className="lg:col-span-12 p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
              
              {/* General Company Info Card */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-400 border-b border-zinc-800 pb-2">
                  <Building2 className="w-4 h-4" />
                  <span>General Corporate Metadata</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Company Legal Name</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={e => updateProfile({ name: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Tagline / Motto</label>
                    <input 
                      type="text" 
                      value={profile.tagline} 
                      onChange={e => updateProfile({ tagline: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Industry / Sector</label>
                    <input 
                      type="text" 
                      value={profile.industry} 
                      onChange={e => updateProfile({ industry: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Founded Year</label>
                    <input 
                      type="text" 
                      value={profile.foundedYear} 
                      onChange={e => updateProfile({ foundedYear: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Headquarters Location</label>
                    <input 
                      type="text" 
                      value={profile.headquarters} 
                      onChange={e => updateProfile({ headquarters: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Team Size / Employees</label>
                    <input 
                      type="text" 
                      value={profile.employees} 
                      onChange={e => updateProfile({ employees: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Official Website</label>
                    <input 
                      type="text" 
                      value={profile.website} 
                      onChange={e => updateProfile({ website: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Corporate Email</label>
                    <input 
                      type="text" 
                      value={profile.email} 
                      onChange={e => updateProfile({ email: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Media Uploads Card */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-400 border-b border-zinc-800 pb-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Logo & Banner Header Image Upload</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  
                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <label className="block text-zinc-300 font-semibold">Company Logo</label>
                    <div className="flex items-center gap-3">
                      {profile.logoUrl ? (
                        <img src={profile.logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-xl border border-zinc-700 bg-white p-1" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
                          No Logo
                        </div>
                      )}

                      <div className="space-y-1 flex-1">
                        <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer font-bold transition-colors text-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Logo File</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, (url) => updateProfile({ logoUrl: url }))}
                          />
                        </label>
                        <input 
                          type="text" 
                          placeholder="or paste image URL..." 
                          value={profile.logoUrl || ''} 
                          onChange={e => updateProfile({ logoUrl: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Banner Upload */}
                  <div className="space-y-2">
                    <label className="block text-zinc-300 font-semibold">Hero Background Image</label>
                    <div className="flex items-center gap-3">
                      {profile.heroImageUrl ? (
                        <img src={profile.heroImageUrl} alt="Hero" className="w-24 h-16 object-cover rounded-xl border border-zinc-700" />
                      ) : (
                        <div className="w-24 h-16 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
                          No Banner
                        </div>
                      )}

                      <div className="space-y-1 flex-1">
                        <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer font-bold transition-colors text-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Banner Image</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, (url) => updateProfile({ heroImageUrl: url }))}
                          />
                        </label>
                        <input 
                          type="text" 
                          placeholder="or paste image URL..." 
                          value={profile.heroImageUrl || ''} 
                          onChange={e => updateProfile({ heroImageUrl: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-200"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Theme & Palette Card */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400 border-b border-zinc-800 pb-2">
                  <Palette className="w-4 h-4" />
                  <span>Color Theme & Palette Customization</span>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-zinc-300">Primary Brand Accent Color</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {ACCENT_COLORS.map(col => (
                      <button
                        key={col.hex}
                        onClick={() => updateProfile({ primaryColor: col.hex })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          profile.primaryColor === col.hex ? 'border-white bg-zinc-800' : 'border-zinc-700 bg-zinc-900'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: col.hex }} />
                        <span>{col.name}</span>
                      </button>
                    ))}

                    <div className="flex items-center gap-2 bg-zinc-800 p-1 rounded-lg border border-zinc-700">
                      <input 
                        type="color" 
                        value={profile.primaryColor} 
                        onChange={e => updateProfile({ primaryColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-zinc-300">{profile.primaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SECTIONS & CONTENT FORMATTING (SPLIT EDITOR & PREVIEW) */}
          {activeTab === 'sections' && (
            <>
              {/* LEFT SIDE: Section Navigator & Editor */}
              <div className="lg:col-span-6 border-r border-zinc-800 flex flex-col h-full bg-[#1C1C1E] overflow-hidden">
                
                {/* Section List Horizontal Bar */}
                <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
                  <div className="flex items-center gap-1.5">
                    {profile.sections.map((sec, idx) => (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSectionId(sec.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeSectionId === sec.id 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span>{idx + 1}. {sec.title || sec.type}</span>
                      </button>
                    ))}
                  </div>

                  {/* Add Section Dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddSection(e.target.value as SectionType);
                        e.target.value = '';
                      }
                    }}
                    className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg border-0 focus:outline-none cursor-pointer shrink-0"
                  >
                    <option value="">+ Add New Section...</option>
                    <option value="overview">Executive Overview</option>
                    <option value="mission_vision">Mission & Vision</option>
                    <option value="highlights_stats">Key Statistics</option>
                    <option value="services">Services & Products</option>
                    <option value="leadership">Leadership Team</option>
                    <option value="testimonials">Client Testimonials</option>
                    <option value="contact">Contact & Map</option>
                    <option value="custom">Custom Section</option>
                  </select>
                </div>

                {/* Active Section Form Editor */}
                {activeSection && (
                  <div className="flex-1 p-5 overflow-y-auto space-y-5">
                    
                    {/* Section Header Controls */}
                    <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                        <span className="uppercase text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {activeSection.type}
                        </span>
                        <span>Section Configuration</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveSection(profile.sections.findIndex(s => s.id === activeSection.id), 'up')}
                          className="p-1 hover:bg-zinc-800 text-zinc-400 rounded"
                          title="Move section up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveSection(profile.sections.findIndex(s => s.id === activeSection.id), 'down')}
                          className="p-1 hover:bg-zinc-800 text-zinc-400 rounded"
                          title="Move section down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(activeSection.id)}
                          className="p-1 hover:bg-rose-900/50 text-rose-400 rounded ml-2"
                          title="Delete section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Section Title & Subtitle */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Section Title</label>
                        <input 
                          type="text" 
                          value={activeSection.title} 
                          onChange={e => updateSection(activeSection.id, { title: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Section Subtitle</label>
                        <input 
                          type="text" 
                          value={activeSection.subtitle || ''} 
                          onChange={e => updateSection(activeSection.id, { subtitle: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* FORMATTING TOOLBAR */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <label className="block text-zinc-400 font-medium">Main Content & Text Body</label>
                        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                          <button
                            onClick={() => insertFormatting(activeSection.id, 'bold')}
                            className="p-1 hover:bg-zinc-800 text-zinc-300 rounded"
                            title="Insert Bold Text"
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => insertFormatting(activeSection.id, 'heading')}
                            className="p-1 hover:bg-zinc-800 text-zinc-300 rounded"
                            title="Insert Subheading"
                          >
                            <Heading2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => insertFormatting(activeSection.id, 'bullet')}
                            className="p-1 hover:bg-zinc-800 text-zinc-300 rounded"
                            title="Insert Bullet Point"
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => insertFormatting(activeSection.id, 'quote')}
                            className="p-1 hover:bg-zinc-800 text-zinc-300 rounded"
                            title="Insert Key Quote"
                          >
                            <Quote className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea 
                        rows={6}
                        value={activeSection.content} 
                        onChange={e => updateSection(activeSection.id, { content: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white text-xs leading-relaxed focus:border-blue-500 focus:outline-none font-sans"
                        placeholder="Type section details here... Use **text** for bolding."
                      />
                    </div>

                    {/* SECTION IMAGE UPLOADER */}
                    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3 text-xs">
                      <div className="flex items-center justify-between font-semibold text-zinc-300">
                        <span>Section Feature Image & Layout</span>
                        {activeSection.imageUrl && (
                          <button
                            onClick={() => updateSection(activeSection.id, { imageUrl: undefined })}
                            className="text-rose-400 hover:underline text-[11px]"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer font-bold border border-zinc-700 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-blue-400" />
                          <span>Upload Image File</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, (url) => updateSection(activeSection.id, { imageUrl: url, imagePosition: activeSection.imagePosition || 'right' }))}
                          />
                        </label>

                        <input 
                          type="text" 
                          placeholder="or paste Image URL..." 
                          value={activeSection.imageUrl || ''} 
                          onChange={e => updateSection(activeSection.id, { imageUrl: e.target.value })}
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      {activeSection.imageUrl && (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block text-zinc-400 text-[11px] mb-1">Image Position</label>
                            <select
                              value={activeSection.imagePosition || 'right'}
                              onChange={e => updateSection(activeSection.id, { imagePosition: e.target.value as any })}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                            >
                              <option value="left">Left Side</option>
                              <option value="right">Right Side</option>
                              <option value="full">Full Width Banner</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-zinc-400 text-[11px] mb-1">Image Caption</label>
                            <input 
                              type="text" 
                              value={activeSection.imageCaption || ''} 
                              onChange={e => updateSection(activeSection.id, { imageCaption: e.target.value })}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                              placeholder="Optional caption..."
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* DYNAMIC SUB-ITEMS MANAGERS */}
                    
                    {/* STATS MANAGER */}
                    {activeSection.type === 'highlights_stats' && (
                      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                          <span>Key Statistics Cards ({activeSection.stats?.length || 0})</span>
                          <button
                            onClick={() => {
                              const newStats = [...(activeSection.stats || []), { id: `st-${Date.now()}`, label: 'Metric', value: '100+' }];
                              updateSection(activeSection.id, { stats: newStats });
                            }}
                            className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold px-2.5 py-1 rounded-lg"
                          >
                            + Add Stat
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(activeSection.stats || []).map((st, sIdx) => (
                            <div key={st.id} className="p-2.5 bg-zinc-800 rounded-lg border border-zinc-700 grid grid-cols-3 gap-2 text-xs">
                              <input 
                                type="text" 
                                placeholder="Value (e.g. 99.9%)" 
                                value={st.value} 
                                onChange={e => {
                                  const updated = [...(activeSection.stats || [])];
                                  updated[sIdx].value = e.target.value;
                                  updateSection(activeSection.id, { stats: updated });
                                }}
                                className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-amber-400 font-bold"
                              />
                              <input 
                                type="text" 
                                placeholder="Label (e.g. Uptime SLA)" 
                                value={st.label} 
                                onChange={e => {
                                  const updated = [...(activeSection.stats || [])];
                                  updated[sIdx].label = e.target.value;
                                  updateSection(activeSection.id, { stats: updated });
                                }}
                                className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-white"
                              />
                              <button
                                onClick={() => {
                                  const updated = (activeSection.stats || []).filter((_, i) => i !== sIdx);
                                  updateSection(activeSection.id, { stats: updated });
                                }}
                                className="text-rose-400 hover:text-rose-300 font-bold text-[11px] self-center justify-self-end"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SERVICES MANAGER */}
                    {activeSection.type === 'services' && (
                      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                          <span>Services & Offerings ({activeSection.services?.length || 0})</span>
                          <button
                            onClick={() => {
                              const newServices = [...(activeSection.services || []), { id: `srv-${Date.now()}`, title: 'New Service', description: 'Service description...' }];
                              updateSection(activeSection.id, { services: newServices });
                            }}
                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded-lg"
                          >
                            + Add Service Card
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(activeSection.services || []).map((srv, sIdx) => (
                            <div key={srv.id} className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <input 
                                  type="text" 
                                  value={srv.title} 
                                  onChange={e => {
                                    const updated = [...(activeSection.services || [])];
                                    updated[sIdx].title = e.target.value;
                                    updateSection(activeSection.id, { services: updated });
                                  }}
                                  className="bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-white font-bold"
                                />
                                <button
                                  onClick={() => {
                                    const updated = (activeSection.services || []).filter((_, i) => i !== sIdx);
                                    updateSection(activeSection.id, { services: updated });
                                  }}
                                  className="text-rose-400 text-xs"
                                >
                                  Delete
                                </button>
                              </div>
                              <textarea 
                                rows={2}
                                value={srv.description} 
                                onChange={e => {
                                  const updated = [...(activeSection.services || [])];
                                  updated[sIdx].description = e.target.value;
                                  updateSection(activeSection.id, { services: updated });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-600 rounded p-2 text-zinc-300 text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* RIGHT SIDE: Real-Time Preview Column */}
              <div className="lg:col-span-6 bg-zinc-950 p-6 overflow-y-auto h-full flex flex-col items-center">
                <div className="w-full max-w-2xl transform scale-95 origin-top">
                  <CompanyProfilePreview profile={profile} />
                </div>
              </div>
            </>
          )}

          {/* TAB 3: FULL DOCUMENT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="lg:col-span-12 p-6 sm:p-10 bg-zinc-950 overflow-y-auto h-full flex justify-center">
              <div className="w-full max-w-4xl">
                <CompanyProfilePreview profile={profile} />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
