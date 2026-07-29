import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { WelcomePage } from './WelcomePage';

const actions = {
  onInstall: vi.fn(),
  onCreateProject: vi.fn(),
  onOpenExisting: vi.fn(),
  onContinueProject: vi.fn(),
  onRecoverVersion: vi.fn()
};

describe('WelcomePage', () => {
  it('shows the truthful first-launch empty state and locally packaged visual', () => {
    const markup = renderToStaticMarkup(
      <WelcomePage
        {...actions}
        recentProjects={[]}
        recoveryVersions={[]}
        isOnline={false}
        canInstall={false}
      />
    );
    expect(markup).toContain('Write. Design.');
    expect(markup).toContain('No books have been created on this device yet.');
    expect(markup).toContain('/brand/presscraft-welcome-books.png');
    expect(markup).toContain('Offline mode');
    expect(markup).not.toContain('Install PressCraft');
  });

  it('renders actual repository summary fields and confirmed timestamps', () => {
    const markup = renderToStaticMarkup(
      <WelcomePage
        {...actions}
        recentProjects={[
          {
            projectId: 'stored-1',
            title: 'Actual Stored Book',
            author: 'Local Author',
            category: 'Academic & Textbook',
            localRevision: 8,
            updatedAt: '2026-07-29T09:24:00.000Z',
            lastSavedAt: '2026-07-29T09:24:00.000Z',
            syncStatus: 'local-only'
          }
        ]}
        recoveryVersions={[]}
        isOnline
        canInstall
      />
    );
    expect(markup).toContain('Actual Stored Book');
    expect(markup).toContain('Local Author');
    expect(markup).toContain('Revision 8');
    expect(markup).toContain('Continue Last Project');
    expect(markup).toContain('Install PressCraft');
  });

  it('renders only real supplied recovery versions', () => {
    const markup = renderToStaticMarkup(
      <WelcomePage
        {...actions}
        recentProjects={[]}
        recoveryVersions={[
          {
            versionId: 'real-version',
            projectId: 'stored-1',
            localRevision: 3,
            createdAt: '2026-07-29T08:00:00.000Z',
            source: 'recovery',
            title: 'Recovered Draft',
            project: {} as never
          }
        ]}
        isOnline
        canInstall={false}
      />
    );
    expect(markup).toContain('Recovery versions');
    expect(markup).toContain('Recovered Draft');
    expect(markup).toContain('Revision 3');
  });
});
