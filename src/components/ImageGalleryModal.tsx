import React, { useState, useMemo, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  X, 
  Tag, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  Edit3, 
  Folder, 
  Layers, 
  Sparkles, 
  Info, 
  Grid, 
  List, 
  ArrowUpDown,
  BookOpen,
  Maximize2,
  RefreshCw,
  FileImage,
  CheckCircle2
} from 'lucide-react';
import { BookProject, ProjectAsset, AssetCategory, Chapter } from '../types';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BookProject;
  onUpdateProject: (partial: Partial<BookProject>) => void;
  onInsertImageToChapter?: (imageUrl: string, caption?: string, targetChapterId?: string) => void;
  activeChapterId?: string;
  selectMode?: boolean;
  onSelectAsset?: (asset: ProjectAsset) => void;
}

const CATEGORIES: { label: string; value: AssetCategory | 'all' }[] = [
  { label: 'All Assets', value: 'all' },
  { label: 'Illustrations', value: 'illustrations' },
  { label: 'Charts & Graphs', value: 'charts' },
  { label: 'Cover Art', value: 'covers' },
  { label: 'Figures & Diagrams', value: 'figures' },
  { label: 'Photos', value: 'photos' },
  { label: 'Uncategorized', value: 'uncategorized' },
];

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  onInsertImageToChapter,
  activeChapterId,
  selectMode = false,
  onSelectAsset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Active modal tabs / subviews
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlNameInput, setUrlNameInput] = useState('');
  const [urlCaptionInput, setUrlCaptionInput] = useState('');

  // Selected asset for preview lightbox or edit drawer
  const [previewAsset, setPreviewAsset] = useState<ProjectAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<ProjectAsset | null>(null);

  // Selected chapter for insertion target
  const [targetChapterId, setTargetChapterId] = useState<string>(activeChapterId || project.chapters[0]?.id || '');

  // Copy feedback state
  const [copiedAssetId, setCopiedAssetId] = useState<string | null>(null);

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Existing assets list
  const assets: ProjectAsset[] = project.assets || [];

  // Automatically find any unindexed images from chapters or cover artwork
  const unindexedImages = useMemo(() => {
    const found: { src: string; sourceName: string; caption?: string }[] = [];
    const existingUrls = new Set(assets.map(a => a.url));

    // Cover image
    if (project.cover?.artworkUrl && !existingUrls.has(project.cover.artworkUrl)) {
      found.push({
        src: project.cover.artworkUrl,
        sourceName: `Cover Artwork (${project.title})`,
        caption: project.cover.subtitle || 'Book Cover Illustration'
      });
    }

    // Chapter blocks
    project.chapters.forEach((ch) => {
      ch.blocks.forEach((b) => {
        if (b.type === 'image') {
          const imgSrc = b.imageUrl || (b.text && (b.text.startsWith('http') || b.text.startsWith('data:')) ? b.text : '');
          if (imgSrc && !existingUrls.has(imgSrc)) {
            found.push({
              src: imgSrc,
              sourceName: `Chapter ${ch.number}: ${ch.title}`,
              caption: b.imageCaption || b.text
            });
          }
        }
      });
    });

    return found;
  }, [project, assets]);

  // Helper to format byte size
  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Process and save files to asset library
  const handleProcessFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const newAssetsPromises = fileArray.map((file) => {
      return new Promise<ProjectAsset | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target?.result as string;
          if (!base64Url) return resolve(null);

          const img = new Image();
          img.onload = () => {
            resolve({
              id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: file.name.replace(/\.[^/.]+$/, ''),
              url: base64Url,
              category: file.name.toLowerCase().includes('chart') ? 'charts' 
                       : file.name.toLowerCase().includes('cover') ? 'covers'
                       : 'illustrations',
              tags: ['uploaded', file.type.split('/')[1] || 'image'],
              uploadedAt: new Date().toISOString(),
              sizeBytes: file.size,
              width: img.naturalWidth,
              height: img.naturalHeight
            });
          };
          img.onerror = () => {
            resolve({
              id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: file.name.replace(/\.[^/.]+$/, ''),
              url: base64Url,
              category: 'illustrations',
              tags: ['uploaded'],
              uploadedAt: new Date().toISOString(),
              sizeBytes: file.size
            });
          };
          img.src = base64Url;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    });

    const results = await Promise.all(newAssetsPromises);
    const validAssets = results.filter((a): a is ProjectAsset => a !== null);

    if (validAssets.length > 0) {
      onUpdateProject({
        assets: [...assets, ...validAssets]
      });
    }
  };

  // Add asset via URL
  const handleAddUrlAsset = () => {
    if (!urlInput.trim()) return;

    const img = new Image();
    img.onload = () => {
      const newAsset: ProjectAsset = {
        id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: urlNameInput.trim() || 'Web Asset Image',
        url: urlInput.trim(),
        caption: urlCaptionInput.trim() || undefined,
        category: 'illustrations',
        tags: ['web-link'],
        uploadedAt: new Date().toISOString(),
        width: img.naturalWidth,
        height: img.naturalHeight
      };

      onUpdateProject({
        assets: [newAsset, ...assets]
      });

      setUrlInput('');
      setUrlNameInput('');
      setUrlCaptionInput('');
      setIsUrlInputOpen(false);
    };

    img.onerror = () => {
      // Still add even if dimensions could not be parsed immediately
      const newAsset: ProjectAsset = {
        id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: urlNameInput.trim() || 'Linked Image',
        url: urlInput.trim(),
        caption: urlCaptionInput.trim() || undefined,
        category: 'illustrations',
        tags: ['web-link'],
        uploadedAt: new Date().toISOString()
      };

      onUpdateProject({
        assets: [newAsset, ...assets]
      });

      setUrlInput('');
      setUrlNameInput('');
      setUrlCaptionInput('');
      setIsUrlInputOpen(false);
    };

    img.src = urlInput.trim();
  };

  // Import all unindexed project images into library
  const handleSyncUnindexedImages = () => {
    if (unindexedImages.length === 0) return;

    const newAssets: ProjectAsset[] = unindexedImages.map((img, idx) => ({
      id: `asset-sync-${Date.now()}-${idx}`,
      name: img.sourceName,
      url: img.src,
      caption: img.caption,
      category: img.sourceName.includes('Cover') ? 'covers' : 'illustrations',
      tags: ['project-imported'],
      uploadedAt: new Date().toISOString()
    }));

    onUpdateProject({
      assets: [...assets, ...newAssets]
    });
  };

  // Delete an asset
  const handleDeleteAsset = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this image from the Asset Library?')) {
      const updated = assets.filter(a => a.id !== id);
      onUpdateProject({ assets: updated });
      if (previewAsset?.id === id) setPreviewAsset(null);
      if (editingAsset?.id === id) setEditingAsset(null);
    }
  };

  // Save changes to editing asset
  const handleSaveEditedAsset = () => {
    if (!editingAsset) return;

    const updatedAssets = assets.map(a => a.id === editingAsset.id ? editingAsset : a);
    onUpdateProject({ assets: updatedAssets });
    setEditingAsset(null);
  };

  // Copy asset image URL
  const handleCopyUrl = (asset: ProjectAsset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(asset.url);
    setCopiedAssetId(asset.id);
    setTimeout(() => setCopiedAssetId(null), 2000);
  };

  // Insert image to target chapter
  const handleInsert = (asset: ProjectAsset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (onSelectAsset) {
      onSelectAsset(asset);
      onClose();
      return;
    }

    if (onInsertImageToChapter) {
      onInsertImageToChapter(asset.url, asset.caption || asset.name, targetChapterId);
      onClose();
    }
  };

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    return assets
      .filter((a) => {
        const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query || 
          a.name.toLowerCase().includes(query) ||
          (a.caption && a.caption.toLowerCase().includes(query)) ||
          (a.tags && a.tags.some(t => t.toLowerCase().includes(query)));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        if (sortBy === 'oldest') return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'size') return (b.sizeBytes || 0) - (a.sizeBytes || 0);
        return 0;
      });
  }, [assets, selectedCategory, searchQuery, sortBy]);

  // Find usage in chapters
  const getAssetUsage = (assetUrl: string) => {
    const chaptersUsing: { id: string; number: number; title: string }[] = [];
    let isCover = project.cover?.artworkUrl === assetUrl;

    project.chapters.forEach((ch) => {
      const uses = ch.blocks.some((b) => b.type === 'image' && (b.imageUrl === assetUrl || b.text === assetUrl));
      if (uses) {
        chaptersUsing.push({ id: ch.id, number: ch.number, title: ch.title });
      }
    });

    return { chaptersUsing, isCover };
  };

  // Calculate stats
  const totalSizeBytes = assets.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-hidden animate-fadeIn">
      <div className="bg-[#18181b] border border-zinc-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100 font-sans">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/20 border border-orange-500/40 rounded-xl text-orange-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Project Image Gallery</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
                  {assets.length} {assets.length === 1 ? 'Asset' : 'Assets'}
                </span>
                {totalSizeBytes > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-950/60 text-orange-300 border border-orange-800/40 font-mono">
                    {formatBytes(totalSizeBytes)}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload, store, and manage media assets for quick insertion into chapters and covers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unindexedImages.length > 0 && (
              <button
                onClick={handleSyncUnindexedImages}
                className="flex items-center gap-2 text-xs font-semibold px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/40 rounded-lg transition-all"
                title="Import existing images found in chapters into this library"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync {unindexedImages.length} Project Images</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Controls & Upload Bar */}
        <div className="p-4 bg-zinc-900/50 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Search & Filter */}
          <div className="flex items-center flex-wrap gap-2.5 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets by name, tag or caption..."
                className="w-full pl-9 pr-8 py-2 bg-zinc-800/90 border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-2 bg-zinc-800/90 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-zinc-800/90 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">Size (Largest)</option>
            </select>
          </div>

          {/* Right Actions: View Toggle & Upload Buttons */}
          <div className="flex items-center gap-2">
            
            {/* View Mode Switcher */}
            <div className="flex bg-zinc-800 border border-zinc-700/80 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs transition ${viewMode === 'grid' ? 'bg-orange-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs transition ${viewMode === 'list' ? 'bg-orange-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Add via URL */}
            <button
              onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-xs font-medium text-zinc-200 rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              <span>Link URL</span>
            </button>

            {/* Upload Files Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-xs font-semibold text-white rounded-lg transition shadow-lg shadow-orange-950/40"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleProcessFiles(e.target.files);
              }}
            />
          </div>
        </div>

        {/* Link URL Dropdown Panel */}
        {isUrlInputOpen && (
          <div className="p-4 bg-zinc-900 border-b border-orange-500/30 flex flex-wrap items-end gap-3 animate-fadeIn">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Image URL or Data URI</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg or data:image/png;base64,..."
                className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="w-44">
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Asset Name</label>
              <input
                type="text"
                value={urlNameInput}
                onChange={(e) => setUrlNameInput(e.target.value)}
                placeholder="My Illustration"
                className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="w-48">
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Caption (Optional)</label>
              <input
                type="text"
                value={urlCaptionInput}
                onChange={(e) => setUrlCaptionInput(e.target.value)}
                placeholder="Figure 1.1 Diagram"
                className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddUrlAsset}
                disabled={!urlInput.trim()}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-semibold text-white rounded transition"
              >
                Save Asset
              </button>
              <button
                onClick={() => setIsUrlInputOpen(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Insertion Target Chapter Selector (when opened to insert) */}
        {onInsertImageToChapter && (
          <div className="px-5 py-2.5 bg-orange-950/20 border-b border-orange-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-orange-300 font-medium">
              <BookOpen className="w-4 h-4 text-orange-400" />
              <span>Target Chapter for Insertion:</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={targetChapterId}
                onChange={(e) => setTargetChapterId(e.target.value)}
                className="px-3 py-1.5 bg-zinc-800 border border-orange-500/40 rounded text-xs text-orange-200 focus:outline-none focus:border-orange-400 font-semibold"
              >
                {project.chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Chapter {ch.number}: {ch.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Modal Main Content Area */}
        <div 
          className={`flex-1 overflow-y-auto p-5 transition-colors relative ${isDraggingOver ? 'bg-orange-950/20 border-2 border-dashed border-orange-500' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingOver(false);
            if (e.dataTransfer.files) handleProcessFiles(e.dataTransfer.files);
          }}
        >
          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-zinc-500 mb-4 shadow-inner">
                <FileImage className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-base font-bold text-zinc-200 mb-1">
                {searchQuery || selectedCategory !== 'all' ? 'No matching assets found' : 'No images in your project gallery yet'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mb-6">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try clearing your search filters or selecting a different category tab.'
                  : 'Drag & drop image files anywhere onto this modal, click Upload Image, or sync existing images from your chapters.'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-xs font-semibold text-white rounded-lg transition shadow-md"
                >
                  Upload Your First Image
                </button>
                {unindexedImages.length > 0 && (
                  <button
                    onClick={handleSyncUnindexedImages}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-orange-300 border border-orange-500/30 rounded-lg transition"
                  >
                    Sync {unindexedImages.length} Existing Book Images
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAssets.map((asset) => {
                const { chaptersUsing, isCover } = getAssetUsage(asset.url);
                return (
                  <div
                    key={asset.id}
                    onClick={() => setPreviewAsset(asset)}
                    className="group bg-zinc-900 border border-zinc-800 hover:border-orange-500/80 rounded-xl overflow-hidden transition-all duration-200 flex flex-col cursor-pointer hover:shadow-xl hover:shadow-orange-950/20 relative"
                  >
                    {/* Image Thumbnail Header */}
                    <div className="relative aspect-square bg-zinc-950/80 overflow-hidden flex items-center justify-center">
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Usage Badges overlay */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {isCover && (
                          <span className="px-2 py-0.5 bg-purple-950/90 text-purple-300 text-[10px] font-bold rounded border border-purple-500/50 shadow">
                            Cover
                          </span>
                        )}
                        {chaptersUsing.length > 0 && (
                          <span className="px-2 py-0.5 bg-emerald-950/90 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/50 shadow">
                            Ch. {chaptersUsing.map(c => c.number).join(', ')}
                          </span>
                        )}
                      </div>

                      {/* Hover Quick Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 z-20">
                        <button
                          onClick={(e) => handleInsert(asset, e)}
                          className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg shadow font-semibold text-xs flex items-center gap-1"
                          title="Insert into Chapter"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Insert</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAsset(asset);
                          }}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg shadow"
                          title="Edit Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteAsset(asset.id, e)}
                          className="p-2 bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white rounded-lg shadow transition"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-3 flex-1 flex flex-col justify-between bg-zinc-900/90">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-100 truncate group-hover:text-orange-400 transition" title={asset.name}>
                          {asset.name}
                        </h4>
                        {asset.caption && (
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5" title={asset.caption}>
                            {asset.caption}
                          </p>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span>{asset.width && asset.height ? `${asset.width}×${asset.height}` : 'Vector/Web'}</span>
                        <span>{formatBytes(asset.sizeBytes)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {filteredAssets.map((asset) => {
                const { chaptersUsing, isCover } = getAssetUsage(asset.url);
                return (
                  <div
                    key={asset.id}
                    onClick={() => setPreviewAsset(asset)}
                    className="group bg-zinc-900 border border-zinc-800 hover:border-orange-500/60 rounded-xl p-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-800/50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-zinc-950 overflow-hidden flex-shrink-0 border border-zinc-800 flex items-center justify-center">
                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-100 truncate group-hover:text-orange-400">{asset.name}</h4>
                          <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono border border-zinc-700 capitalize">
                            {asset.category || 'illustration'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{asset.caption || 'No caption set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0 text-xs">
                      {/* Dimensions & Size */}
                      <div className="hidden sm:flex flex-col text-right text-[11px] font-mono text-zinc-400">
                        <span>{asset.width && asset.height ? `${asset.width}×${asset.height} px` : 'Web Image'}</span>
                        <span className="text-zinc-500">{formatBytes(asset.sizeBytes)}</span>
                      </div>

                      {/* Usage badges */}
                      <div className="hidden md:flex items-center gap-1.5">
                        {isCover && (
                          <span className="px-2 py-0.5 bg-purple-950 text-purple-300 text-[10px] font-bold rounded border border-purple-500/30">
                            Cover
                          </span>
                        )}
                        {chaptersUsing.map((c) => (
                          <span key={c.id} className="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/30">
                            Ch. {c.number}
                          </span>
                        ))}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleInsert(asset, e)}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1 shadow"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Insert</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAsset(asset);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                          title="Edit Metadata"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteAsset(asset.id, e)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Lightbox Preview Popup */}
        {previewAsset && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fadeIn">
            <div className="bg-[#18181b] border border-zinc-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
              
              {/* Image Canvas Preview */}
              <div className="flex-1 bg-zinc-950 p-6 flex items-center justify-center relative min-h-[300px]">
                <img
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-2xl"
                />
                <button
                  onClick={() => setPreviewAsset(null)}
                  className="absolute top-3 right-3 p-2 text-zinc-400 hover:text-white bg-zinc-900/80 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Info Panel */}
              <div className="w-full md:w-80 p-6 border-t md:border-t-0 md:border-l border-zinc-800 bg-zinc-900 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Asset Details</span>
                    <h3 className="text-lg font-bold text-white mt-1">{previewAsset.name}</h3>
                    {previewAsset.caption && (
                      <p className="text-xs text-zinc-300 italic mt-1 bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-700/50">
                        "{previewAsset.caption}"
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 text-xs border-t border-b border-zinc-800 py-3 font-mono text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Category:</span>
                      <span className="capitalize text-orange-300 font-semibold">{previewAsset.category || 'Uncategorized'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Dimensions:</span>
                      <span>{previewAsset.width && previewAsset.height ? `${previewAsset.width} × ${previewAsset.height} px` : 'Auto / Vector'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">File Size:</span>
                      <span>{formatBytes(previewAsset.sizeBytes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Uploaded:</span>
                      <span>{new Date(previewAsset.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Usage */}
                  {(() => {
                    const { chaptersUsing, isCover } = getAssetUsage(previewAsset.url);
                    return (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Used In Project</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {isCover && (
                            <span className="px-2 py-1 bg-purple-950 text-purple-300 text-xs font-bold rounded border border-purple-500/40">
                              Book Cover
                            </span>
                          )}
                          {chaptersUsing.map((c) => (
                            <span key={c.id} className="px-2 py-1 bg-emerald-950 text-emerald-300 text-xs font-bold rounded border border-emerald-500/40">
                              Chapter {c.number}
                            </span>
                          ))}
                          {!isCover && chaptersUsing.length === 0 && (
                            <span className="text-xs text-zinc-500 italic">Not currently placed in any chapter</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-6 space-y-2">
                  <button
                    onClick={() => handleInsert(previewAsset)}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Insert into Active Chapter</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyUrl(previewAsset)}
                      className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
                    >
                      {copiedAssetId === previewAsset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAssetId === previewAsset.id ? 'Copied URL!' : 'Copy Link'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingAsset(previewAsset);
                        setPreviewAsset(null);
                      }}
                      className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Asset Metadata Drawer */}
        {editingAsset && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#18181b] border border-zinc-700 rounded-2xl w-full max-w-md p-6 shadow-2xl text-zinc-100 font-sans space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-orange-400" />
                  <span>Edit Asset Metadata</span>
                </h3>
                <button onClick={() => setEditingAsset(null)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Asset Name</label>
                  <input
                    type="text"
                    value={editingAsset.name}
                    onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
                  <select
                    value={editingAsset.category || 'uncategorized'}
                    onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
                  >
                    <option value="illustrations">Illustrations</option>
                    <option value="charts">Charts & Graphs</option>
                    <option value="covers">Cover Art</option>
                    <option value="figures">Figures & Diagrams</option>
                    <option value="photos">Photos</option>
                    <option value="uncategorized">Uncategorized</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Default Caption / Alt Text</label>
                  <textarea
                    rows={2}
                    value={editingAsset.caption || ''}
                    onChange={(e) => setEditingAsset({ ...editingAsset, caption: e.target.value })}
                    placeholder="Enter default image caption or description..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:border-orange-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={(editingAsset.tags || []).join(', ')}
                    onChange={(e) => setEditingAsset({ 
                      ...editingAsset, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    placeholder="diagram, chapter1, finance"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditedAsset}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-xs font-semibold text-white rounded-lg transition shadow"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
