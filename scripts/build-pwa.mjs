import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APPROVED_EXTENSIONS = new Set([
  '.css', '.html', '.ico', '.js', '.png', '.svg', '.ttf', '.wasm', '.webmanifest', '.webp', '.woff', '.woff2'
]);
const EXCLUDED_NAMES = new Set(['asset-manifest.json', 'server.cjs', 'server.cjs.map', 'sw.js']);

export function isApprovedShellAsset(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  const basename = path.posix.basename(normalized);
  if (EXCLUDED_NAMES.has(basename) || normalized.endsWith('.map')) return false;
  if (normalized.startsWith('exports/') || normalized.startsWith('uploads/')) return false;
  return APPROVED_EXTENSIONS.has(path.posix.extname(normalized));
}

async function walkFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) files.push(...(await walkFiles(root, absolute)));
    else files.push(path.relative(root, absolute).replaceAll('\\', '/'));
  }
  return files;
}

export async function createAssetManifest(distDirectory) {
  const files = (await walkFiles(distDirectory)).filter(isApprovedShellAsset).sort();
  const entries = [];
  for (const relativePath of files) {
    const contents = await readFile(path.join(distDirectory, relativePath));
    const revision = createHash('sha256').update(contents).digest('hex');
    entries.push({ url: `/${relativePath}`, revision: `sha256-${revision}` });
  }
  return entries;
}

export function createBuildRevision(entries) {
  return createHash('sha256').update(JSON.stringify(entries)).digest('hex').slice(0, 16);
}

export async function buildPwa({
  distDirectory,
  templatePath
}) {
  const entries = await createAssetManifest(distDirectory);
  const revision = createBuildRevision(entries);
  const template = await readFile(templatePath, 'utf8');
  const serviceWorker = template
    .replace('__PRESSCRAFT_PRECACHE_ENTRIES__', JSON.stringify(entries))
    .replace('__PRESSCRAFT_BUILD_REVISION__', revision);

  await writeFile(
    path.join(distDirectory, 'asset-manifest.json'),
    `${JSON.stringify(entries, null, 2)}\n`,
    'utf8'
  );
  await writeFile(path.join(distDirectory, 'sw.js'), serviceWorker, 'utf8');
  return { entries, revision };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const result = await buildPwa({
    distDirectory: path.join(repositoryRoot, 'dist'),
    templatePath: path.join(repositoryRoot, 'src/pwa/service-worker-template.js')
  });
  const totalBytes = (
    await Promise.all(
      result.entries.map(async ({ url }) => {
        const file = await readFile(path.join(repositoryRoot, 'dist', url.slice(1)));
        return file.byteLength;
      })
    )
  ).reduce((sum, size) => sum + size, 0);
  console.log(
    `Native PWA: ${result.entries.length} shell assets, ${(totalBytes / 1024).toFixed(2)} KiB, revision ${result.revision}`
  );
}
