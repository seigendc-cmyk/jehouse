import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { WorkspaceLoading } from './OptionalWorkspace';

describe('optional workspace states', () => {
  it('renders an accessible, product-specific loading state', () => {
    const markup = renderToStaticMarkup(<WorkspaceLoading label="Preparing Export Tools" />);
    expect(markup).toContain('role="status"');
    expect(markup).toContain('Preparing Export Tools');
    expect(markup).toContain('Your manuscript remains available.');
  });
});
