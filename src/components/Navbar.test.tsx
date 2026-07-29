import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createEmptyBookProject } from '../data/createEmptyBookProject';
import { createInitialSaveState } from '../persistence/localSaveCoordinator';
import { Navbar } from './Navbar';

const noop = () => undefined;

function renderNavbar() {
  const project = { ...createEmptyBookProject(), title: 'The Real Project' };
  return renderToStaticMarkup(
    <Navbar
      project={project}
      activeTab="editor"
      onSelectTab={noop}
      onUpdateProject={noop}
      darkMode={false}
      onToggleDarkMode={noop}
      uiTheme="warm_light"
      onSelectUITheme={noop}
      autoAmbient={false}
      onToggleAutoAmbient={noop}
      onOpenFocusMode={noop}
      onOpenProofread={noop}
      onOpenStoryContinuation={noop}
      onOpenExportModal={noop}
      onOpenPrintPreview={noop}
      onOpenSeriesManager={noop}
      onOpenCloudSync={noop}
      onSaveToLocalDisk={noop}
      saveState={{ ...createInitialSaveState(), status: 'saved', localRevision: 4 }}
      activeDocumentLabel="Chapter 1: Introduction"
      isOnline={false}
    />
  );
}

describe('professional application shell', () => {
  it('shows actual document and local state in the title bar', () => {
    const markup = renderNavbar();
    expect(markup).toContain('PressCraft Book Studio');
    expect(markup).toContain('The Real Project');
    expect(markup).toContain('Chapter 1: Introduction');
    expect(markup).toContain('Offline');
    expect(markup).not.toContain('Synced to cloud');
  });

  it('exposes all application tabs with Home selected', () => {
    const markup = renderNavbar();
    for (const label of [
      'File', 'Home', 'Insert', 'Layout', 'References',
      'Review', 'View', 'Book', 'Publish', 'Help'
    ]) {
      expect(markup).toContain(`>${label}</button>`);
    }
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('Manuscript');
    expect(markup).toContain('Proofread');
  });
});
