import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HelpGuideModal } from './HelpGuideModal';

describe('HelpGuideModal', () => {
  it('provides actionable getting-started navigation', () => {
    const markup = renderToStaticMarkup(<HelpGuideModal page="getting-started" onClose={() => undefined} />);
    expect(markup).toContain('Getting Started');
    expect(markup).toContain('File → New / Open');
    expect(markup).toContain('Export Book SCI');
  });

  it('explains offline persistence and portable projects', () => {
    const markup = renderToStaticMarkup(<HelpGuideModal page="offline" onClose={() => undefined} />);
    expect(markup).toContain('Offline Guide');
    expect(markup).toContain('Documents\\Book Publisher');
    expect(markup).toContain('Cloud synchronization remains disabled');
  });
});
