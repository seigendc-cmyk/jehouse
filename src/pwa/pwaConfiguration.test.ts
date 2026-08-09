import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { installStateForEnvironment } from './installState';

describe('PWA configuration', () => {
  const config = readFileSync(new URL('../../vite.config.ts', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
  const manifest = JSON.parse(
    readFileSync(new URL('../../public/manifest.webmanifest', import.meta.url), 'utf8')
  );
  const worker = readFileSync(
    new URL('./service-worker-template.js', import.meta.url),
    'utf8'
  );
  const server = readFileSync(new URL('../../server.ts', import.meta.url), 'utf8');

  it('defines the required installable manifest and local icons', () => {
    expect(manifest.name).toBe('PressCraft Book Studio');
    expect(manifest.short_name).toBe('PressCraft');
    expect(manifest.display).toBe('standalone');
    expect(manifest.id).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display_override).toContain('standalone');
    expect(manifest.prefer_related_applications).toBe(false);
    expect(manifest.background_color).toBe('#EA580C');
    expect(manifest.icons.map(({ src }: { src: string }) => src)).toEqual([
      '/icons/presscraft-192.png',
      '/icons/presscraft-512.png',
      '/icons/presscraft-maskable-512.png'
    ]);
  });

  it('registers the native service worker only through the production lifecycle hook', () => {
    const hook = readFileSync(new URL('../hooks/usePwaLifecycle.ts', import.meta.url), 'utf8');
    expect(hook).toContain('import.meta.env.PROD');
    expect(hook).toContain("register('/sw.js'");
    expect(hook).toContain('controllerchange');
    expect(hook).toContain("postMessage({ type: 'SKIP_WAITING' })");
    expect(hook).not.toContain('virtual:pwa-register');
    expect(config).not.toContain('VitePWA');
  });

  it('keeps private, API and cross-origin data on the network', () => {
    expect(worker).toContain("url.pathname.startsWith('/api/')");
    expect(worker).toContain("url.pathname.startsWith('/firebase/')");
    expect(worker).toContain("url.pathname.startsWith('/firestore/')");
    expect(worker).toContain("url.pathname.startsWith('/gemini/')");
    expect(worker).toContain('url.origin !== self.location.origin');
    expect(worker).not.toContain('presscraft_projects');
    expect(worker).not.toContain('BookProject');
  });

  it('uses bounded local-image caching and navigation-only shell fallback', () => {
    expect(worker).toContain('MAX_RUNTIME_IMAGES = 32');
    expect(worker).toContain("request.mode === 'navigate'");
    expect(worker).toContain("caches.match('/index.html')");
    expect(worker).toContain("request.destination === 'image'");
    expect(worker).toContain('cached || Response.error()');
    expect(worker).toContain('cached || fetch(request)');
  });

  it('serves the worker at root scope without stale HTTP caching', () => {
    expect(server).toContain('app.get("/sw.js"');
    expect(server).toContain('Service-Worker-Allowed');
    expect(server).toContain('no-cache, no-store, must-revalidate');
    expect(server).toContain('application/manifest+json');
  });

  it('removes only obsolete PressCraft shell caches and waits for update approval', () => {
    expect(worker).toContain("name.startsWith('presscraft-shell-')");
    expect(worker).toContain('name !== SHELL_CACHE');
    expect(worker).toContain("event.data?.type === 'SKIP_WAITING'");
    expect(worker).not.toContain("addEventListener('install', (event) => {\n  self.skipWaiting()");
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
