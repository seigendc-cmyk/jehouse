import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const source = path.resolve('assets/branding/sci-file-icon.png');
const output = path.resolve('src-tauri/icons/sci-file.ico');
try { await access(source); } catch {
  console.error(`Official SCI icon missing. Place the unchanged source PNG at: ${source}`);
  process.exit(1);
}
const sizes = [16, 24, 32, 48, 64, 128, 256];
const original = await readFile(source);
const frames = await Promise.all(sizes.map((size) => sharp(original).resize(size, size, { fit: 'contain' }).png().toBuffer()));
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, await pngToIco(frames));
console.log(`Generated ${output} with ${sizes.join(', ')}px frames.`);
