import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { installStateForEnvironment } from './installState';

describe('PWA configuration', () => {
  const config = readFileSync(new URL('../../vite.config.ts', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

  it('defines the required installable manifest and local icons', () => {
    expect(config).toContain("name: 'PressCraft Book Studio'");
    expect(config).toContain("short_name: 'PressCraft'");
    expect(config).toContain("display: 'standalone'");
    expect(config).toContain("background_color: '#EA580C'");
    expect(config).toContain('presscraft-192.png');
    expect(config).toContain('presscraft-512.png');
    expect(config).toContain('presscraft-maskable-512.png');
  });

  it('registers generated service-worker support only through the production lifecycle hook', () => {
    const hook = readFileSync(new URL('../hooks/usePwaLifecycle.ts', import.meta.url), 'utf8');
    expect(hook).toContain('import.meta.env.PROD');
    expect(hook).toContain('registerSW');
    expect(config).toContain("navigateFallback: '/index.html'");
    expect(config).toContain('cleanupOutdatedCaches: true');
  });

  it('does not configure runtime caching for project or private API payloads', () => {
    expect(config).not.toContain('firebase');
    expect(config).not.toContain('firestore');
    expect(config).not.toContain('gemini');
    expect(config).not.toContain('presscraft_projects');
    expect(config).not.toContain('BookProject');
    expect(config).toContain("request.destination === 'image'");
  });

  it('shows installation only with a captured prompt and hides it in standalone mode', () => {
    expect(installStateForEnvironment(false, false)).toBe('unsupported');
    expect(installStateForEnvironment(false, true)).toBe('available');
    expect(installStateForEnvironment(true, true)).toBe('standalone');
  });

  it('starts without a project or production sample import', () => {
    expect(app).toContain('useState<BookProject[]>([])');
    expect(app).toContain('useState<string | null>(null)');
    expect(app).not.toContain("from './data/initialBook'");
    expect(app).not.toContain('sampleBookTemplate');
  });

  it('routes book-outline AI through the server without a browser-side key', () => {
    const manager = readFileSync(
      new URL('../components/ProjectManagerModal.tsx', import.meta.url),
      'utf8'
    );
    expect(manager).toContain("fetch('/api/ai/book-outline'");
    expect(manager).not.toContain('VITE_GEMINI_API_KEY');
    expect(manager).not.toContain('@google/genai');
  });
});
