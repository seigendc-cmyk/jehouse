import React, { useState } from 'react';
import { 
  Layers, 
  X, 
  Plus, 
  Trash2, 
  Tv, 
  Film, 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  Printer, 
  Download, 
  Package, 
  Check, 
  Edit3, 
  Calendar, 
  BookOpen, 
  Tag, 
  FileText 
} from 'lucide-react';
import { BookProject, SeriesConfig, Season, Episode, Chapter } from '../types';
import { exportToPDF, exportProjectJSON } from '../lib/exportUtils';

interface SeriesManagerModalProps {
  project: BookProject;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (partial: Partial<BookProject>) => void;
  onOpenPrintPreview?: () => void;
}

export const SeriesManagerModal: React.FC<SeriesManagerModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject,
  onOpenPrintPreview
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'seasons' | 'export'>('seasons');
  const [expandedSeasonId, setExpandedSeasonId] = useState<string | null>(project.series?.seasons[0]?.id || null);
  const [selectedSeasonForExport, setSelectedSeasonForExport] = useState<string>('all');

  if (!isOpen) return null;

  const series: SeriesConfig = project.series || {
    isSeries: true,
    seriesTitle: project.title || 'Untitled Series',
    seriesNumber: 'Book 1',
    publisherSeriesId: 'SERIES-001',
    tagline: 'Multi-Season Book Series',
    seasons: [
      {
        id: 'season-1',
        seasonNumber: 1,
        title: 'Season 1',
        subtitle: 'The Opening Arc',
        description: 'First season of the series.',
        episodes: [
          {
            id: 'ep-1-1',
            episodeNumber: 1,
            title: 'Episode 1',
            subtitle: 'Pilot',
            synopsis: 'Episode 1 description.',
            chapterIds: project.chapters.map(c => c.id)
          }
        ]
      }
    ]
  };

  const handleUpdateSeries = (updatedSeries: SeriesConfig) => {
    onUpdateProject({ series: updatedSeries });
  };

  // Add new Season
  const handleAddSeason = () => {
    const nextSeasonNum = series.seasons.length + 1;
    const newSeason: Season = {
      id: `season-${Date.now()}`,
      seasonNumber: nextSeasonNum,
      title: `Season ${nextSeasonNum}`,
      subtitle: `Arc ${nextSeasonNum}`,
      description: `Description for Season ${nextSeasonNum}`,
      releaseYear: new Date().getFullYear().toString(),
      episodes: [
        {
          id: `ep-${nextSeasonNum}-1`,
          episodeNumber: 1,
          title: `Episode 1`,
          subtitle: `Chapter One`,
          synopsis: `First episode of Season ${nextSeasonNum}`,
          chapterIds: []
        }
      ]
    };

    const updatedSeasons = [...series.seasons, newSeason];
    handleUpdateSeries({ ...series, seasons: updatedSeasons, totalSeasons: updatedSeasons.length });
    setExpandedSeasonId(newSeason.id);
  };

  // Delete Season
  const handleDeleteSeason = (seasonId: string) => {
    if (series.seasons.length <= 1) {
      alert("A series must have at least one season.");
      return;
    }
    const updatedSeasons = series.seasons.filter(s => s.id !== seasonId);
    handleUpdateSeries({ ...series, seasons: updatedSeasons, totalSeasons: updatedSeasons.length });
  };

  // Add Episode to Season
  const handleAddEpisode = (seasonId: string) => {
    const updatedSeasons = series.seasons.map(s => {
      if (s.id !== seasonId) return s;
      const nextEpNum = s.episodes.length + 1;
      const newEp: Episode = {
        id: `ep-${s.seasonNumber}-${Date.now()}`,
        episodeNumber: nextEpNum,
        title: `Episode ${nextEpNum}`,
        subtitle: `Subtitle for Ep ${nextEpNum}`,
        synopsis: `Synopsis for Episode ${nextEpNum}`,
        releaseDate: new Date().toISOString().split('T')[0],
        chapterIds: []
      };
      return {
        ...s,
        episodes: [...s.episodes, newEp]
      };
    });

    handleUpdateSeries({ ...series, seasons: updatedSeasons });
  };

  // Delete Episode from Season
  const handleDeleteEpisode = (seasonId: string, episodeId: string) => {
    const updatedSeasons = series.seasons.map(s => {
      if (s.id !== seasonId) return s;
      return {
        ...s,
        episodes: s.episodes.filter(ep => ep.id !== episodeId)
      };
    });
    handleUpdateSeries({ ...series, seasons: updatedSeasons });
  };

  // Assign Chapter to Episode
  const handleToggleChapterInEpisode = (seasonId: string, episodeId: string, chapterId: string) => {
    const updatedSeasons = series.seasons.map(s => {
      if (s.id !== seasonId) return s;
      const updatedEpisodes = s.episodes.map(ep => {
        if (ep.id !== episodeId) return ep;
        const exists = ep.chapterIds?.includes(chapterId);
        const updatedChapterIds = exists
          ? (ep.chapterIds || []).filter(id => id !== chapterId)
          : [...(ep.chapterIds || []), chapterId];
        return { ...ep, chapterIds: updatedChapterIds };
      });
      return { ...s, episodes: updatedEpisodes };
    });

    // Also update chapter season/episode references
    const updatedChapters = project.chapters.map(c => {
      if (c.id === chapterId) {
        const season = series.seasons.find(s => s.id === seasonId);
        const ep = season?.episodes.find(e => e.id === episodeId);
        return {
          ...c,
          seasonId,
          seasonNumber: season?.seasonNumber,
          episodeId,
          episodeNumber: ep?.episodeNumber,
          episodeTitle: ep?.title
        };
      }
      return c;
    });

    onUpdateProject({ chapters: updatedChapters, series: { ...series, seasons: updatedSeasons } });
  };

  // Auto-Group Chapters sequentially across episodes
  const handleAutoGroupChapters = () => {
    let currentChapterIndex = 0;
    const updatedSeasons = series.seasons.map(s => {
      const updatedEpisodes = s.episodes.map(ep => {
        const ch = project.chapters[currentChapterIndex];
        if (ch) {
          currentChapterIndex++;
          return { ...ep, chapterIds: [ch.id] };
        }
        return ep;
      });
      return { ...s, episodes: updatedEpisodes };
    });

    handleUpdateSeries({ ...series, seasons: updatedSeasons });
  };

  // Export Filtered Season or Full Series as JSON
  const handleExportSeriesJSON = (seasonIdFilter: string) => {
    if (seasonIdFilter === 'all') {
      exportProjectJSON(project);
    } else {
      const targetSeason = series.seasons.find(s => s.id === seasonIdFilter);
      if (!targetSeason) return;

      // Extract only chapters that belong to this season
      const seasonChapterIds = new Set<string>();
      targetSeason.episodes.forEach(ep => (ep.chapterIds || []).forEach(id => seasonChapterIds.add(id)));

      const filteredChapters = project.chapters.filter(c => seasonChapterIds.has(c.id));

      const seasonProject: BookProject = {
        ...project,
        title: `${project.title} - ${targetSeason.title}`,
        subtitle: targetSeason.subtitle || project.subtitle,
        chapters: filteredChapters.length > 0 ? filteredChapters : project.chapters,
        series: {
          ...series,
          seasons: [targetSeason]
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(seasonProject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${targetSeason.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#18181b] border border-[#333333] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-gray-100 overflow-hidden">
        
        {/* Header Bar */}
        <div className="h-16 border-b border-[#333333] bg-[#222225] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-orange-500 text-black font-extrabold">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold uppercase tracking-wider text-white">Series, Seasons & Episodes Manager</h2>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  Series Mode Enabled
                </span>
              </div>
              <p className="text-xs text-gray-400">Manage series metadata, season arcs, episode chapters, and export single or multi-season bundles.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#2a2a2d] hover:bg-[#333] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-[#121214] border-b border-[#333333] px-6 py-2 shrink-0">
          <button
            onClick={() => setActiveTab('seasons')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'seasons' ? 'bg-[#FF6B00] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#222]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Seasons & Episodes ({series.seasons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'details' ? 'bg-[#FF6B00] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#222]'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Series Settings & Tagline</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'export' ? 'bg-[#FF6B00] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#222]'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Print & Export Season Bundles</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: SEASONS & EPISODES MANAGER */}
          {activeTab === 'seasons' && (
            <div className="space-y-6">
              
              {/* Top Action Header */}
              <div className="flex items-center justify-between bg-[#222225] border border-[#333] rounded-lg p-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-orange-400" /> Season & Episode Structure
                  </h3>
                  <p className="text-xs text-gray-400">Organize manuscript chapters into distinct seasons and episodic releases.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAutoGroupChapters}
                    className="px-3 py-1.5 bg-[#2a2a2d] hover:bg-[#333] border border-[#444] text-xs font-bold rounded-lg text-gray-200 transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Automatically assign unassigned chapters to episodes"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    <span>Auto-Group Chapters</span>
                  </button>

                  <button
                    onClick={handleAddSeason}
                    className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Season</span>
                  </button>
                </div>
              </div>

              {/* List of Seasons */}
              <div className="space-y-4">
                {series.seasons.map((season, seasonIdx) => {
                  const isExpanded = expandedSeasonId === season.id;

                  return (
                    <div 
                      key={season.id} 
                      className={`border rounded-xl transition-all ${
                        isExpanded ? 'border-orange-500/60 bg-[#202024]' : 'border-[#333333] bg-[#1a1a1d] hover:border-[#444]'
                      }`}
                    >
                      {/* Season Accordion Header */}
                      <div 
                        onClick={() => setExpandedSeasonId(isExpanded ? null : season.id)}
                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                            S{season.seasonNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{season.title}</span>
                              {season.releaseYear && (
                                <span className="text-[10px] font-mono bg-[#2a2a2d] text-gray-300 px-2 py-0.5 rounded border border-[#333]">
                                  {season.releaseYear}
                                </span>
                              )}
                              <span className="text-xs text-gray-400">
                                ({season.episodes.length} Episodes)
                              </span>
                            </div>
                            {season.subtitle && <p className="text-xs text-gray-400 italic">{season.subtitle}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSeason(season.id);
                            }}
                            className="p-1.5 rounded hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 cursor-pointer"
                            title="Delete Season"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                        </div>
                      </div>

                      {/* Expanded Season Editor */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 border-t border-[#333333] space-y-6">
                          
                          {/* Season Metadata Form */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#161618] p-4 rounded-lg border border-[#333]">
                            <div>
                              <label className="text-[11px] font-bold text-gray-400 block mb-1">Season Title</label>
                              <input
                                type="text"
                                value={season.title}
                                onChange={(e) => {
                                  const updatedSeasons = series.seasons.map(s => s.id === season.id ? { ...s, title: e.target.value } : s);
                                  handleUpdateSeries({ ...series, seasons: updatedSeasons });
                                }}
                                className="w-full text-xs p-2 bg-[#222225] border border-[#444] rounded text-white focus:outline-hidden"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-gray-400 block mb-1">Season Subtitle / Arc Name</label>
                              <input
                                type="text"
                                value={season.subtitle || ''}
                                onChange={(e) => {
                                  const updatedSeasons = series.seasons.map(s => s.id === season.id ? { ...s, subtitle: e.target.value } : s);
                                  handleUpdateSeries({ ...series, seasons: updatedSeasons });
                                }}
                                className="w-full text-xs p-2 bg-[#222225] border border-[#444] rounded text-white focus:outline-hidden"
                                placeholder="e.g. Dawn of Algorithmic Value"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-gray-400 block mb-1">Release Year</label>
                              <input
                                type="text"
                                value={season.releaseYear || ''}
                                onChange={(e) => {
                                  const updatedSeasons = series.seasons.map(s => s.id === season.id ? { ...s, releaseYear: e.target.value } : s);
                                  handleUpdateSeries({ ...series, seasons: updatedSeasons });
                                }}
                                className="w-full text-xs p-2 bg-[#222225] border border-[#444] rounded text-white focus:outline-hidden font-mono"
                                placeholder="2026"
                              />
                            </div>
                          </div>

                          {/* Episodes List in Season */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                                <Film className="w-3.5 h-3.5" /> Episodes in {season.title}
                              </h4>

                              <button
                                onClick={() => handleAddEpisode(season.id)}
                                className="px-3 py-1 bg-[#2a2a2d] hover:bg-orange-500 hover:text-black border border-[#444] text-xs font-bold rounded transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Episode</span>
                              </button>
                            </div>

                            <div className="space-y-3">
                              {season.episodes.map((ep) => (
                                <div key={ep.id} className="bg-[#18181b] border border-[#333] rounded-lg p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-extrabold bg-[#2a2a2d] px-2 py-0.5 rounded text-orange-400 font-mono">
                                        EP {ep.episodeNumber}
                                      </span>
                                      <input
                                        type="text"
                                        value={ep.title}
                                        onChange={(e) => {
                                          const updatedSeasons = series.seasons.map(s => {
                                            if (s.id !== season.id) return s;
                                            const updatedEps = s.episodes.map(item => item.id === ep.id ? { ...item, title: e.target.value } : item);
                                            return { ...s, episodes: updatedEps };
                                          });
                                          handleUpdateSeries({ ...series, seasons: updatedSeasons });
                                        }}
                                        className="text-xs font-bold bg-transparent border-b border-dashed border-[#444] text-white focus:outline-hidden p-0.5"
                                        placeholder="Episode Title"
                                      />
                                    </div>

                                    <button
                                      onClick={() => handleDeleteEpisode(season.id, ep.id)}
                                      className="p-1 rounded hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 cursor-pointer"
                                      title="Delete Episode"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Episode Synopsis Input */}
                                  <input
                                    type="text"
                                    value={ep.synopsis || ''}
                                    onChange={(e) => {
                                      const updatedSeasons = series.seasons.map(s => {
                                        if (s.id !== season.id) return s;
                                        const updatedEps = s.episodes.map(item => item.id === ep.id ? { ...item, synopsis: e.target.value } : item);
                                        return { ...s, episodes: updatedEps };
                                      });
                                      handleUpdateSeries({ ...series, seasons: updatedSeasons });
                                    }}
                                    className="w-full text-xs p-1.5 bg-[#121214] border border-[#333] rounded text-gray-300 focus:outline-hidden"
                                    placeholder="Episode synopsis / summary notes..."
                                  />

                                  {/* Chapter Selector for Episode */}
                                  <div className="pt-2 border-t border-[#2a2a2d]">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                                      Assigned Chapters:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {project.chapters.map((ch) => {
                                        const isAssigned = (ep.chapterIds || []).includes(ch.id);
                                        return (
                                          <button
                                            key={ch.id}
                                            onClick={() => handleToggleChapterInEpisode(season.id, ep.id, ch.id)}
                                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                                              isAssigned
                                                ? 'bg-orange-500 text-black border-orange-500 shadow-xs'
                                                : 'bg-[#222225] text-gray-400 border-[#333] hover:border-[#555] hover:text-white'
                                            }`}
                                          >
                                            {isAssigned && <Check className="w-3 h-3" />}
                                            <span>Ch {ch.number}: {ch.title}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: SERIES DETAILS & SETTINGS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="bg-[#222225] border border-[#333] rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-400" /> Series Metadata
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">Series Master Title</label>
                    <input
                      type="text"
                      value={series.seriesTitle}
                      onChange={(e) => handleUpdateSeries({ ...series, seriesTitle: e.target.value })}
                      className="w-full text-xs p-2.5 bg-[#18181b] border border-[#444] rounded text-white focus:outline-hidden font-bold"
                      placeholder="e.g. Chronicles of Aethelgard"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">Book / Series Volume Number</label>
                    <input
                      type="text"
                      value={series.seriesNumber || ''}
                      onChange={(e) => handleUpdateSeries({ ...series, seriesNumber: e.target.value })}
                      className="w-full text-xs p-2.5 bg-[#18181b] border border-[#444] rounded text-white focus:outline-hidden"
                      placeholder="e.g. Book 1 of 5 or Volume II"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">Publisher Series Catalog ID</label>
                    <input
                      type="text"
                      value={series.publisherSeriesId || ''}
                      onChange={(e) => handleUpdateSeries({ ...series, publisherSeriesId: e.target.value })}
                      className="w-full text-xs p-2.5 bg-[#18181b] border border-[#444] rounded text-white focus:outline-hidden font-mono"
                      placeholder="e.g. SERIES-2026-QA"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">Series Tagline / Logline</label>
                    <input
                      type="text"
                      value={series.tagline || ''}
                      onChange={(e) => handleUpdateSeries({ ...series, tagline: e.target.value })}
                      className="w-full text-xs p-2.5 bg-[#18181b] border border-[#444] rounded text-white focus:outline-hidden"
                      placeholder="e.g. An Epic Multi-Season Technical Saga"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT & PRINT SEASON BUNDLES */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              
              <div className="bg-[#222225] border border-[#333] rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Printer className="w-4 h-4 text-orange-400" /> Print or Export Single/Multiple Seasons
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Select a specific season or export the entire multi-season series collection as JSON or Print PDF.</p>
                </div>

                {/* Season Selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#18181b] p-4 rounded-lg border border-[#333]">
                  <label className="text-xs font-bold text-gray-300 whitespace-nowrap">Target Season Filter:</label>
                  <select
                    value={selectedSeasonForExport}
                    onChange={(e) => setSelectedSeasonForExport(e.target.value)}
                    className="bg-[#222225] border border-[#444] text-xs font-bold text-gray-100 rounded p-2 focus:outline-hidden cursor-pointer flex-1"
                  >
                    <option value="all">Full Series Bundle (All Seasons)</option>
                    {series.seasons.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.episodes.length} Episodes)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => handleExportSeriesJSON(selectedSeasonForExport)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#2a2a2d] hover:bg-[#333] text-white font-extrabold text-xs border border-[#444] transition-colors cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-orange-400" />
                    <span>Export {selectedSeasonForExport === 'all' ? 'Full Series' : 'Season'} JSON File</span>
                  </button>

                  {onOpenPrintPreview && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPrintPreview();
                      }}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs transition-colors cursor-pointer shadow-md"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Launch Print Preview Studio</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
