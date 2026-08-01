import { createServer } from 'node:http';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const createViteServer = vi.fn();
vi.mock('vite', () => ({ createServer: createViteServer }));

import { httpServer, installShutdownHandlers, startServer, startupErrorMessage } from './server';

describe.sequential('production HTTP server lifecycle', () => {
  let distDirectory: string;

  beforeAll(async () => {
    distDirectory = await mkdtemp(path.join(tmpdir(), 'presscraft-server-'));
    await writeFile(path.join(distDirectory, 'index.html'), '<!doctype html><title>PressCraft</title>');
    await writeFile(path.join(distDirectory, 'sw.js'), 'self.addEventListener("fetch",()=>undefined);');
    await writeFile(path.join(distDirectory, 'manifest.webmanifest'), '{"name":"PressCraft"}');
  });

  afterAll(async () => {
    if (httpServer.listening) await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  });

  it('successful production startup remains listening', async () => {
    const running = await startServer({ production: true, port: 0, host: '127.0.0.1', distDirectory });
    await new Promise(resolve => setTimeout(resolve, 25));
    expect(httpServer.listening).toBe(true);
    await running.close();
  });

  it.each([['application shell', '/'], ['service worker', '/sw.js']])('%s returns HTTP 200', async (_label, pathname) => {
    const running = await startServer({ production: true, port: 0, host: '127.0.0.1', distDirectory });
    const response = await fetch(`http://127.0.0.1:${running.port}${pathname}`);
    expect(response.status).toBe(200);
    await running.close();
  });

  it('successful startup does not call process.exit', async () => {
    const exit = vi.spyOn(process, 'exit');
    const running = await startServer({ production: true, port: 0, host: '127.0.0.1', distDirectory });
    expect(exit).not.toHaveBeenCalled();
    await running.close();
    exit.mockRestore();
  });

  it('successful startup does not unref the HTTP server', async () => {
    const unref = vi.spyOn(httpServer, 'unref');
    const running = await startServer({ production: true, port: 0, host: '127.0.0.1', distDirectory });
    expect(unref).not.toHaveBeenCalled();
    await running.close();
    unref.mockRestore();
  });

  it('EADDRINUSE reports clearly and is a startup failure', async () => {
    const blocker = createServer();
    await new Promise<void>((resolve) => blocker.listen(0, '127.0.0.1', resolve));
    const address = blocker.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    let error: NodeJS.ErrnoException | undefined;
    try {
      await startServer({ production: true, port, host: '127.0.0.1', distDirectory });
    } catch (value) {
      error = value as NodeJS.ErrnoException;
    }
    expect(error).toBeDefined();
    if (!error) throw new Error('Expected EADDRINUSE startup failure.');
    expect(error.code).toBe('EADDRINUSE');
    expect(startupErrorMessage(error, port)).toContain(`port ${port} is already in use`);
    await new Promise<void>((resolve) => blocker.close(() => resolve()));
  });

  it.each(['SIGINT', 'SIGTERM'] as const)('%s closes the HTTP server', async (signal) => {
    const running = await startServer({ production: true, port: 0, host: '127.0.0.1', distDirectory });
    const removeHandlers = installShutdownHandlers(running);
    process.emit(signal, signal);
    await vi.waitFor(() => expect(httpServer.listening).toBe(false));
    removeHandlers();
  });

  it('does not create development Vite middleware in production', async () => {
    const running = await startServer({ production: true, port: 0, host: '127.0.0.1', distDirectory });
    expect(createViteServer).not.toHaveBeenCalled();
    await running.close();
  });

  it('does not create a port 5173 listener', async () => {
    const running = await startServer({ production: true, port: 0, host: '127.0.0.1', distDirectory });
    expect(running.port).not.toBe(5173);
    expect(httpServer.address()).toMatchObject({ port: running.port });
    await running.close();
  });
});
