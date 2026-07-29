import React, { useState } from 'react';
import { 
  BookMarked, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Search, 
  Sparkles, 
  Upload, 
  Info,
  BookOpen,
  X
} from 'lucide-react';
import { BibliographyEntry, BibEntryType, BookProject } from '../types';
import { 
  DEFAULT_SAMPLE_BIBLIOGRAPHY, 
  generateBibTeXString, 
  generateFullLaTeXDocument 
} from '../lib/bibtexUtils';
import { exportToBibTeX, exportToLaTeX } from '../lib/exportUtils';

interface BibliographyManagerProps {
  project: BookProject;
  onUpdateBibliography: (entries: BibliographyEntry[]) => void;
}

export const BibliographyManager: React.FC<BibliographyManagerProps> = ({
  project,
  onUpdateBibliography
}) => {
  const entries = project.bibliography && project.bibliography.length > 0
    ? project.bibliography
    : DEFAULT_SAMPLE_BIBLIOGRAPHY;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<BibliographyEntry> | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawBibtexModal, setShowRawBibtexModal] = useState(false);
  const [rawBibtexImport, setRawBibtexImport] = useState('');

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    const matchesSearch = 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.citeKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.journalOrPublisher || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === 'all' || e.entryType === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenAdd = () => {
    setEditingEntry({
      id: `bib-${Date.now()}`,
      citeKey: `ref_${Date.now().toString().slice(-4)}`,
      entryType: 'article',
      title: '',
      author: '',
      year: new Date().getFullYear().toString(),
      journalOrPublisher: '',
      volume: '',
      numberOrIssue: '',
      pages: '',
      doi: '',
      url: '',
      note: ''
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (entry: BibliographyEntry) => {
    setEditingEntry({ ...entry });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    onUpdateBibliography(updated);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editingEntry.title || !editingEntry.citeKey) return;

    const newEntry: BibliographyEntry = {
      id: editingEntry.id || `bib-${Date.now()}`,
      citeKey: editingEntry.citeKey.trim().replace(/\s+/g, '_'),
      entryType: (editingEntry.entryType as BibEntryType) || 'article',
      title: editingEntry.title.trim(),
      author: editingEntry.author?.trim() || 'Anonymous',
      year: editingEntry.year?.trim() || new Date().getFullYear().toString(),
      journalOrPublisher: editingEntry.journalOrPublisher?.trim(),
      volume: editingEntry.volume?.trim(),
      numberOrIssue: editingEntry.numberOrIssue?.trim(),
      pages: editingEntry.pages?.trim(),
      doi: editingEntry.doi?.trim(),
      url: editingEntry.url?.trim(),
      note: editingEntry.note?.trim()
    };

    const exists = entries.some((item) => item.id === newEntry.id);
    let updatedList: BibliographyEntry[];
    if (exists) {
      updatedList = entries.map((item) => (item.id === newEntry.id ? newEntry : item));
    } else {
      updatedList = [newEntry, ...entries];
    }

    onUpdateBibliography(updatedList);
    setIsEditing(false);
    setEditingEntry(null);
  };

  const handleCopyBibtex = (entry: BibliographyEntry) => {
    const singleBib = generateBibTeXString([entry]);
    navigator.clipboard.writeText(singleBib);
    setCopiedKey(entry.id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAllBibtex = () => {
    const fullBib = generateBibTeXString(entries);
    navigator.clipboard.writeText(fullBib);
    setCopiedKey('all');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLoadDefaults = () => {
    onUpdateBibliography(DEFAULT_SAMPLE_BIBLIOGRAPHY);
  };

  const handleImportBibtex = () => {
    if (!rawBibtexImport.trim()) return;
    // Simple BibTeX parser for @type{key, title={}, author={}}
    const blocks = rawBibtexImport.split(/@/g).filter((b) => b.trim());
    const newEntries: BibliographyEntry[] = [];

    blocks.forEach((block, idx) => {
      const match = block.match(/^([a-zA-Z]+)\s*\{\s*([^,]+),([\s\S]*)\}/);
      if (match) {
        const type = match[1].toLowerCase() as BibEntryType;
        const citeKey = match[2].trim();
        const body = match[3];

        const getField = (field: string) => {
          const regex = new RegExp(`${field}\\s*=\\s*[\"{]([^\n"}]*)[\"}]`, 'i');
          const m = body.match(regex);
          return m ? m[1].trim() : '';
        };

        newEntries.push({
          id: `imported-${Date.now()}-${idx}`,
          citeKey: citeKey || `ref_${idx}`,
          entryType: ['article', 'book', 'inproceedings', 'techreport', 'phdthesis', 'online', 'misc'].includes(type) ? type : 'misc',
          title: getField('title') || 'Imported Reference',
          author: getField('author') || 'Unknown Author',
          year: getField('year') || '2024',
          journalOrPublisher: getField('journal') || getField('publisher') || getField('booktitle'),
          volume: getField('volume'),
          numberOrIssue: getField('number'),
          pages: getField('pages'),
          doi: getField('doi'),
          url: getField('url'),
          note: getField('note')
        });
      }
    });

    if (newEntries.length > 0) {
      onUpdateBibliography([...newEntries, ...entries]);
      setRawBibtexImport('');
      setShowRawBibtexModal(false);
      alert(`Successfully imported ${newEntries.length} citation(s)!`);
    } else {
      alert('Could not parse valid BibTeX entries. Please verify the BibTeX syntax.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#211815] to-[#2d1810] border border-[#58261e] p-5 rounded-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#FF6B00] text-black font-extrabold rounded-lg shadow-md">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight uppercase">
                LaTeX Bibliography & Citation Manager
              </h2>
              <span className="text-[10px] bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 px-2 py-0.5 rounded font-mono font-bold">
                BibTeX Native
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Manage academic citations, generate BibTeX data, and export publication-ready LaTeX manuscripts with formatted reference lists.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportToBibTeX(project)}
            className="flex items-center gap-2 px-3 py-2 bg-[#333333] hover:bg-[#444444] text-white font-bold text-xs rounded-lg border border-[#555] transition-colors cursor-pointer shadow-sm"
            title="Download references as standalone .bib file"
          >
            <Download className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Export .bib</span>
          </button>

          <button
            onClick={() => exportToLaTeX(project)}
            className="flex items-center gap-2 px-3 py-2 bg-[#FF6B00] hover:bg-orange-600 text-black font-extrabold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
            title="Download full LaTeX manuscript including LaTeX bibliography"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export LaTeX (.tex)</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#242427] p-3 rounded-lg border border-[#3f3f46]">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search citations by title, author, key..."
              className="w-full bg-[#18181b] border border-[#3f3f46] rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#FF6B00]"
            />
          </div>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-[#18181b] border border-[#3f3f46] rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Types ({entries.length})</option>
            <option value="article">Article</option>
            <option value="book">Book</option>
            <option value="inproceedings">Conference Paper</option>
            <option value="techreport">Tech Report</option>
            <option value="phdthesis">PhD Thesis</option>
            <option value="online">Online / Web</option>
            <option value="misc">Misc</option>
          </select>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setShowRawBibtexModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-md border border-[#3f3f46] transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import BibTeX</span>
          </button>

          <button
            onClick={handleCopyAllBibtex}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b] hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-md border border-[#3f3f46] transition-colors cursor-pointer"
            title="Copy full BibTeX database to clipboard"
          >
            {copiedKey === 'all' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{copiedKey === 'all' ? 'Copied All!' : 'Copy BibTeX'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00] hover:bg-orange-600 text-black font-extrabold text-xs rounded-md transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Citation</span>
          </button>
        </div>
      </div>

      {/* Citations List */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="bg-[#18181b] border border-dashed border-[#3f3f46] rounded-xl p-8 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-zinc-500 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-300">No Bibliography Citations Found</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Add academic paper citations or book references to cite inside your manuscript with LaTeX <code className="bg-zinc-800 px-1 py-0.5 rounded text-orange-400 font-mono">\cite&#123;key&#125;</code> tags.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleLoadDefaults}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded border border-zinc-700 transition-colors cursor-pointer"
              >
                Load Sample Academic Bibliography
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 bg-[#FF6B00] hover:bg-orange-600 text-black font-bold text-xs rounded transition-colors cursor-pointer"
              >
                Create Custom Reference
              </button>
            </div>
          </div>
        ) : (
          filteredEntries.map((item, index) => (
            <div
              key={item.id}
              className="bg-[#1e1e22] border border-[#333338] hover:border-[#FF6B00]/50 rounded-xl p-4 transition-all space-y-2 shadow-sm group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 px-2 py-0.5 rounded">
                      \cite&#123;{item.citeKey}&#125;
                    </span>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded font-mono">
                      @{item.entryType}
                    </span>
                    {item.year && (
                      <span className="text-xs text-zinc-400 font-mono">({item.year})</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-[#FF6B00] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-zinc-300 font-medium">
                    {item.author}
                  </p>

                  {item.journalOrPublisher && (
                    <p className="text-xs text-zinc-400 italic">
                      {item.journalOrPublisher} {item.volume ? `• Vol. ${item.volume}` : ''} {item.pages ? `• pp. ${item.pages}` : ''}
                    </p>
                  )}
                </div>

                {/* Entry Action Menu */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyBibtex(item)}
                    className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors"
                    title="Copy BibTeX code for this reference"
                  >
                    {copiedKey === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    title="Edit citation details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors"
                    title="Remove reference"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Extra metadata tags */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-zinc-400 border-t border-[#2d2d32]">
                {item.doi && (
                  <span>DOI: <a href={`https://doi.org/${item.doi}`} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">{item.doi}</a></span>
                )}
                {item.url && (
                  <span>URL: <a href={item.url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline truncate max-w-[200px] inline-block align-bottom">{item.url}</a></span>
                )}
                {item.note && (
                  <span className="text-zinc-500 italic">Note: {item.note}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {isEditing && editingEntry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#242427] border border-[#3f3f46] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-sm font-bold uppercase tracking-tight">
                  {editingEntry.id ? 'Edit Bibliography Citation' : 'Add Bibliography Citation'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">LaTeX Citation Key *</label>
                  <input
                    type="text"
                    required
                    value={editingEntry.citeKey || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, citeKey: e.target.value })}
                    placeholder="e.g. smith2024neural"
                    className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-white font-mono focus:border-[#FF6B00] outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">BibTeX Entry Type *</label>
                  <select
                    value={editingEntry.entryType || 'article'}
                    onChange={(e) => setEditingEntry({ ...editingEntry, entryType: e.target.value as BibEntryType })}
                    className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-white font-mono focus:border-[#FF6B00] outline-hidden cursor-pointer"
                  >
                    <option value="article">@article (Journal Article)</option>
                    <option value="book">@book (Book / Monograph)</option>
                    <option value="inproceedings">@inproceedings (Conference Paper)</option>
                    <option value="techreport">@techreport (Technical Report)</option>
                    <option value="phdthesis">@phdthesis (PhD Thesis)</option>
                    <option value="online">@online (Website / Web Resource)</option>
                    <option value="misc">@misc (Miscellaneous Reference)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingEntry.title || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                  placeholder="e.g. Neural Manuscript Synthesis and Computational Book Layouts"
                  className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-white focus:border-[#FF6B00] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-zinc-300 block mb-1">Author(s)</label>
                  <input
                    type="text"
                    value={editingEntry.author || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, author: e.target.value })}
                    placeholder="e.g. Smith, John and Doe, Jane"
                    className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-white focus:border-[#FF6B00] outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Year</label>
                  <input
                    type="text"
                    value={editingEntry.year || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, year: e.target.value })}
                    placeholder="2024"
                    className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-white font-mono focus:border-[#FF6B00] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Journal / Book Title / Publisher</label>
                <input
                  type="text"
                  value={editingEntry.journalOrPublisher || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, journalOrPublisher: e.target.value })}
                  placeholder="e.g. Journal of Digital Publishing or Addison-Wesley"
                  className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-white focus:border-[#FF6B00] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Volume</label>
                  <input
                    type="text"
                    value={editingEntry.volume || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, volume: e.target.value })}
                    placeholder="15"
                    className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-white font-mono focus:border-[#FF6B00] outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Issue / Number</label>
                  <input
                    type="text"
                    value={editingEntry.numberOrIssue || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, numberOrIssue: e.target.value })}
                    placeholder="2"
                    className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-white font-mono focus:border-[#FF6B00] outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Pages</label>
                  <input
                    type="text"
                    value={editingEntry.pages || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, pages: e.target.value })}
                    placeholder="104--122"
                    className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-white font-mono focus:border-[#FF6B00] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">DOI</label>
                  <input
                    type="text"
                    value={editingEntry.doi || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, doi: e.target.value })}
                    placeholder="10.1016/j.jdp.2024.02"
                    className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-white font-mono focus:border-[#FF6B00] outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">URL</label>
                  <input
                    type="text"
                    value={editingEntry.url || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-white font-mono focus:border-[#FF6B00] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Note / Annotation</label>
                <input
                  type="text"
                  value={editingEntry.note || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, note: e.target.value })}
                  placeholder="Optional notes or remarks"
                  className="w-full bg-[#18181b] border border-zinc-700 rounded p-2 text-white focus:border-[#FF6B00] outline-hidden"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-orange-600 text-black font-extrabold rounded text-xs transition-colors cursor-pointer"
                >
                  Save Citation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raw BibTeX Import Modal */}
      {showRawBibtexModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#242427] border border-[#3f3f46] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-tight">Import Raw BibTeX Code</h3>
              </div>
              <button
                onClick={() => setShowRawBibtexModal(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Paste standard BibTeX entries below (e.g., exported from Google Scholar, IEEE Xplore, or JSTOR) to import them directly into your manuscript bibliography.
            </p>

            <textarea
              rows={8}
              value={rawBibtexImport}
              onChange={(e) => setRawBibtexImport(e.target.value)}
              placeholder={`@article{smith2024,\n  author = {Smith, John},\n  title = {Neural Book Typography},\n  journal = {Journal of Design},\n  year = {2024}\n}`}
              className="w-full bg-[#18181b] border border-zinc-700 rounded p-3 font-mono text-xs text-emerald-300 focus:border-[#FF6B00] outline-hidden"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRawBibtexModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportBibtex}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded text-xs transition-colors cursor-pointer"
              >
                Parse & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
