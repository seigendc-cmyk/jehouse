import React from 'react';
import { BookOpen, CloudOff, X } from 'lucide-react';

export type HelpGuidePage = 'getting-started' | 'offline';

export function HelpGuideModal({ page, onClose }: { page: HelpGuidePage; onClose: () => void }) {
  const offline = page === 'offline';
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="help-guide-title">
      <article className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-orange-500/30 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex gap-3">
            {offline ? <CloudOff className="mt-1 h-6 w-6 text-orange-400" /> : <BookOpen className="mt-1 h-6 w-6 text-orange-400" />}
            <div><h2 id="help-guide-title" className="text-xl font-black">{offline ? 'Offline Guide' : 'Getting Started'}</h2><p className="mt-1 text-sm text-zinc-400">PressCraft Book Publisher</p></div>
          </div>
          <button onClick={onClose} aria-label="Close guide" className="rounded-lg p-2 hover:bg-zinc-800"><X className="h-5 w-5" /></button>
        </header>
        {offline ? (
          <div className="mt-5 space-y-5 text-sm leading-6 text-zinc-300">
            <section><h3 className="font-bold text-white">Work without a connection</h3><p>Your editor and confirmed local projects remain available offline after the app has loaded. Connectivity status appears in the title bar.</p></section>
            <section><h3 className="font-bold text-white">Save and recover</h3><p>PressCraft autosaves complete project snapshots to IndexedDB. Ctrl+S saves immediately. Desktop SCI files are written to Documents\Book Publisher unless you opened an existing SCI file from another location.</p></section>
            <section><h3 className="font-bold text-white">Portable projects</h3><p>Use File → Export Book SCI to create a validated portable project. Use Import Book SCI or double-click an associated SCI file to reopen it.</p></section>
            <section><h3 className="font-bold text-white">Cloud status</h3><p>Cloud synchronization remains disabled until secure owner-isolated rules are approved. Local editing and SCI import/export do not depend on cloud sync.</p></section>
          </div>
        ) : (
          <ol className="mt-5 space-y-4 text-sm leading-6 text-zinc-300">
            <li><strong className="text-white">1. Create or open a book.</strong> Use File → New / Open, Import Book SCI, or a recent book on the welcome page.</li>
            <li><strong className="text-white">2. Build the manuscript.</strong> Add chapters and blocks in the editor; use Insert for images, lists, mathematics, and accounting content.</li>
            <li><strong className="text-white">3. Design the publication.</strong> Book links to covers, front matter, typography, assets, series, and specialised studios.</li>
            <li><strong className="text-white">4. Review it.</strong> Run Proofread, inspect tracked changes, and use Print Preview before publishing.</li>
            <li><strong className="text-white">5. Save or publish.</strong> Ctrl+S saves immediately. File → Export Book SCI creates a portable project; Publish provides document export formats.</li>
          </ol>
        )}
      </article>
    </div>
  );
}
