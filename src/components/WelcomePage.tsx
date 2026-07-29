import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CloudOff,
  Download,
  FolderOpen,
  History,
  Plus,
  Wifi
} from 'lucide-react';
import { ProjectSummary, ProjectVersion } from '../persistence/types';

interface WelcomePageProps {
  recentProjects: ProjectSummary[];
  recoveryVersions: ProjectVersion[];
  isOnline: boolean;
  canInstall: boolean;
  onInstall: () => void;
  onCreateProject: () => void;
  onOpenExisting: () => void;
  onContinueProject: (projectId: string) => void;
  onRecoverVersion: (version: ProjectVersion) => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  recentProjects,
  recoveryVersions,
  isOnline,
  canInstall,
  onInstall,
  onCreateProject,
  onOpenExisting,
  onContinueProject,
  onRecoverVersion
}) => {
  const lastProject = recentProjects[0];

  return (
    <main className="min-h-screen w-full overflow-y-auto bg-[#EA580C] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col px-6 py-7 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white/80">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-[0.18em]">PressCraft</div>
              <div className="text-xs text-orange-100">Book Studio</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold">
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}
            {isOnline ? 'Online' : 'Offline mode'}
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-4">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-orange-100">
              Your publishing desk, ready anywhere
            </p>
            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Write. Design.
              <br />
              Publish.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-orange-50 sm:text-lg">
              A professional offline-first studio for creating books, training manuals and serialized stories.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={onCreateProject}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-black text-[#C2410C] shadow-lg shadow-orange-950/15 outline-none transition hover:bg-orange-50 focus-visible:ring-4 focus-visible:ring-white/50"
              >
                <Plus className="h-4 w-4" />
                Create New Book
              </button>
              <button
                onClick={onOpenExisting}
                className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-5 py-3 text-sm font-bold text-white outline-none transition hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-white/40"
              >
                <FolderOpen className="h-4 w-4" />
                Open Existing Project
              </button>
              {lastProject ? (
                <button
                  onClick={() => onContinueProject(lastProject.projectId)}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white underline decoration-white/50 underline-offset-4 outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                >
                  Continue Last Project
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
              {canInstall ? (
                <button
                  onClick={onInstall}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-5 py-3 text-sm font-bold outline-none transition hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-white/40"
                >
                  <Download className="h-4 w-4" />
                  Install PressCraft
                </button>
              ) : null}
            </div>
          </div>

          <div className="relative min-h-[360px] self-stretch lg:min-h-[600px]">
            <img
              src="/brand/presscraft-welcome-books.webp"
              alt="A standing hardcover book, open manuscript and fountain pen"
              className="absolute inset-0 h-full w-full object-contain object-center lg:object-right"
            />
          </div>
        </section>

        <section aria-labelledby="recent-books-heading" className="border-t border-white/30 py-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-100">
                Stored on this device
              </p>
              <h2 id="recent-books-heading" className="mt-1 text-2xl font-black">Recent books</h2>
            </div>
            <button onClick={onOpenExisting} className="text-xs font-bold underline underline-offset-4">
              View all projects
            </button>
          </div>

          {recentProjects.length === 0 ? (
            <p className="mt-5 border-l-2 border-white/60 pl-4 text-sm text-orange-50">
              No books have been created on this device yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {recentProjects.slice(0, 6).map((project) => (
                <button
                  key={project.projectId}
                  onClick={() => onContinueProject(project.projectId)}
                  className="group flex min-h-28 items-center justify-between gap-4 rounded-xl border border-white/35 bg-white/10 p-4 text-left outline-none transition hover:bg-white/15 focus-visible:ring-4 focus-visible:ring-white/40"
                >
                  <div className="min-w-0">
                    <div className="truncate text-base font-black">
                      {project.title.trim() || 'Untitled Book'}
                    </div>
                    {project.author.trim() ? (
                      <div className="mt-1 truncate text-xs text-orange-100">by {project.author}</div>
                    ) : null}
                    <div className="mt-3 text-[11px] text-orange-100">
                      {new Date(project.lastSavedAt).toLocaleString()} · Revision {project.localRevision}
                    </div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/80">
                      Local project · {project.category}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          )}
        </section>

        {recoveryVersions.length > 0 ? (
          <section aria-labelledby="recovery-heading" className="border-t border-white/30 py-6">
            <h2 id="recovery-heading" className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em]">
              <History className="h-4 w-4" />
              Recovery versions
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {recoveryVersions.slice(0, 5).map((version) => (
                <button
                  key={version.versionId}
                  onClick={() => onRecoverVersion(version)}
                  className="rounded-lg border border-white/35 px-3 py-2 text-left text-xs outline-none hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-white/40"
                >
                  <strong>{version.title || 'Untitled Book'}</strong>
                  <span className="ml-2 text-orange-100">
                    {new Date(version.createdAt).toLocaleString()} · Revision {version.localRevision}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
};
