import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBookDataPack } from '../../src/lib/bookDataPack';
import { createMathAccountingQaFixture } from '../fixtures/createMathAccountingQaFixture';

const qaRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatedDirectory = path.join(qaRoot, 'generated');
const bookPath = path.join(generatedDirectory, 'math-accounting-production-qa.book.json');
const dataPackPath = path.join(generatedDirectory, 'math-accounting-production-qa.data-pack.json');

const project = createMathAccountingQaFixture();
const dataPack = {
  ...createBookDataPack(project),
  exportedAt: '2026-07-30T00:00:00.000Z',
};

await mkdir(generatedDirectory, { recursive: true });
await writeFile(bookPath, `${JSON.stringify(project, null, 2)}\n`, 'utf8');
await writeFile(dataPackPath, `${JSON.stringify(dataPack, null, 2)}\n`, 'utf8');

console.log(`Fixture book: ${bookPath}`);
console.log(`Fixture data pack: ${dataPackPath}`);
console.log(`Semantic checksum: ${dataPack.checksum}`);
