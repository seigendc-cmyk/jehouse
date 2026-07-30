import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(import.meta.dirname, '../..');
const fixtureDirectory = path.join(repositoryRoot, 'qa', 'generated');
const fixtureBookPath = path.join(fixtureDirectory, 'math-accounting-production-qa.book.json');
const fixturePackPath = path.join(fixtureDirectory, 'math-accounting-production-qa.data-pack.json');
const evidenceDirectory = path.join(repositoryRoot, 'qa', 'evidence', 'production-qa');
const downloadDirectory = path.join(evidenceDirectory, 'exports');
const chromeProfile = path.join(os.tmpdir(), `presscraft-production-qa-${process.pid}`);
const baseUrl = 'http://localhost:3000';
const debugPort = 9333;

const chromeCandidates = process.env.PRESSCRAFT_QA_BROWSER
  ? [process.env.PRESSCRAFT_QA_BROWSER]
  : process.platform === 'win32'
  ? [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    ]
  : process.platform === 'darwin'
    ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const step = message => console.log(`[qa] ${message}`);

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function firstExisting(paths) {
  for (const candidate of paths) {
    if (await fileExists(candidate)) return candidate;
  }
  throw new Error(`Chrome/Chromium was not found. Checked: ${paths.join(', ')}`);
}

async function poll(callback, description, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const value = await callback();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await wait(150);
  }
  throw new Error(`Timed out waiting for ${description}${lastError ? `: ${lastError.message}` : ''}`);
}

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      for (const listener of this.listeners.get(message.method) ?? []) listener(message.params);
    });
    return this;
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  close() {
    this.socket.close();
  }
}

async function connectPage(target) {
  const client = await new CdpClient(target.webSocketDebuggerUrl).open();
  const errors = [];
  const requests = [];
  const dialogs = [];
  client.on('Runtime.exceptionThrown', params => {
    errors.push(`exception: ${params.exceptionDetails.exception?.description || params.exceptionDetails.text}`);
  });
  client.on('Runtime.consoleAPICalled', params => {
    if (params.type === 'error') {
      errors.push(`console: ${params.args.map(arg => arg.value || arg.description || '').join(' ')}`);
    }
  });
  client.on('Log.entryAdded', params => {
    if (params.entry.level === 'error') errors.push(`log: ${params.entry.text}`);
  });
  client.on('Network.requestWillBeSent', params => requests.push(params.request.url));
  client.on('Page.javascriptDialogOpening', params => {
    dialogs.push({ type: params.type, message: params.message });
    void client.send('Page.handleJavaScriptDialog', { accept: true });
  });
  await Promise.all([
    client.send('Runtime.enable'),
    client.send('Log.enable'),
    client.send('Page.enable'),
    client.send('DOM.enable'),
    client.send('Network.enable'),
    client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    }),
  ]);
  return { client, errors, requests, dialogs };
}

async function evaluate(page, expression) {
  const result = await page.client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
  return result.result.value;
}

async function waitForText(page, text, timeout = 15_000) {
  return poll(
    async () => evaluate(page, `(() => {
      const text = ${JSON.stringify(text.toLowerCase())};
      if (document.body?.innerText.toLowerCase().includes(text)) return true;
      return [...document.querySelectorAll('input, textarea')]
        .some(element => element.value?.toLowerCase().includes(text));
    })()`),
    `text "${text}"`,
    timeout,
  );
}

async function clickText(page, text) {
  const clicked = await evaluate(page, `(() => {
    const text = ${JSON.stringify(text)};
    const candidates = [...document.querySelectorAll('button, [role="button"], label, span, div')]
      .filter(element => element.innerText?.trim() === text && element.getClientRects().length > 0)
      .map(element => element.closest('button, [role="button"]') || element)
      .sort((left, right) => Number(right.matches('button, [role="button"]')) - Number(left.matches('button, [role="button"]')));
    const target = candidates[0];
    if (!target) return false;
    target.click();
    return true;
  })()`);
  if (!clicked) {
    const body = await evaluate(page, 'document.body?.innerText.slice(0, 3000)');
    throw new Error(`Could not click "${text}". Current page:\n${body}`);
  }
  await wait(250);
}

async function setOnlyFileInput(page, filePath, acceptFragment) {
  const document = await page.client.send('DOM.getDocument', { depth: -1, pierce: true });
  const selector = acceptFragment
    ? `input[type="file"][accept*="${acceptFragment}"]`
    : 'input[type="file"]';
  const result = await page.client.send('DOM.querySelector', {
    nodeId: document.root.nodeId,
    selector,
  });
  if (!result.nodeId) throw new Error(`File input not found with selector ${selector}`);
  await page.client.send('DOM.setFileInputFiles', {
    nodeId: result.nodeId,
    files: [filePath],
  });
}

async function screenshot(page, name) {
  const result = await page.client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(path.join(evidenceDirectory, name), Buffer.from(result.data, 'base64'));
}

async function screenshotAroundText(page, text, name) {
  await evaluate(page, `(() => {
    const text = ${JSON.stringify(text)};
    const element = [...document.querySelectorAll('body *')]
      .filter(candidate => candidate.innerText?.trim() === text || candidate.value?.trim() === text)
      .at(-1);
    if (!element) return false;
    element.scrollIntoView({ block: 'center' });
    return true;
  })()`);
  await wait(350);
  await screenshot(page, name);
}

async function waitForDownload(extension, timeout = 20_000) {
  return poll(async () => {
    const files = await readdir(downloadDirectory);
    const match = files.find(file => file.endsWith(extension) && !file.endsWith('.crdownload'));
    return match ? path.join(downloadDirectory, match) : undefined;
  }, `${extension} download`, timeout);
}

function externalRequests(urls) {
  return [...new Set(urls.filter(url => {
    try {
      const parsed = new URL(url);
      return !['localhost', '127.0.0.1'].includes(parsed.hostname) &&
        !['blob:', 'data:', 'chrome-extension:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }))];
}

async function targetList() {
  return fetch(`http://127.0.0.1:${debugPort}/json`).then(response => response.json());
}

async function stopProcess(process) {
  if (!process || process.killed) return;
  process.kill('SIGTERM');
  await Promise.race([
    new Promise(resolve => process.once('exit', resolve)),
    wait(2000),
  ]);
  if (!process.killed) process.kill('SIGKILL');
}

await rm(evidenceDirectory, { recursive: true, force: true });
await rm(chromeProfile, { recursive: true, force: true });
await mkdir(downloadDirectory, { recursive: true });

const fixturePack = JSON.parse(await readFile(fixturePackPath, 'utf8'));
const corruptedPackPath = path.join(evidenceDirectory, 'corrupted-checksum.data-pack.json');
const unsupportedPackPath = path.join(evidenceDirectory, 'unsupported-schema.data-pack.json');
await writeFile(corruptedPackPath, JSON.stringify({
  ...fixturePack,
  projectData: { ...fixturePack.projectData, title: 'Checksum corruption fixture' },
}, null, 2));
await writeFile(unsupportedPackPath, JSON.stringify({
  ...fixturePack,
  schemaVersion: '99.0.0',
}, null, 2));

const chromePath = await firstExisting(chromeCandidates);
const server = spawn(process.execPath, ['dist/server.cjs'], {
  cwd: repositoryRoot,
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
server.stdout.on('data', chunk => { serverOutput += chunk; });
server.stderr.on('data', chunk => { serverOutput += chunk; });

let chrome;
const openClients = [];
const report = {
  startedAt: new Date().toISOString(),
  browser: '',
  fixture: path.relative(repositoryRoot, fixtureBookPath).replaceAll('\\', '/'),
  dataPack: path.relative(repositoryRoot, fixturePackPath).replaceAll('\\', '/'),
  checks: {},
  exports: {},
  screenshots: [],
  visualRegression: {
    method: 'Deterministic screenshots plus structural geometry assertions',
    tolerance: '1 CSS pixel for clipping; no bitmap anti-aliasing diff threshold',
  },
  defects: [
    {
      surface: 'PDF print compilation',
      fixtureBlock: 'All equation blocks',
      expected: 'No remote font or renderer dependency.',
      actual: 'The PDF HTML unconditionally linked to Google Fonts.',
      fix: 'Removed the remote Google Fonts injection; local/system typography remains unchanged.',
      regression: 'Source assertion plus browser request/resource logging.',
      status: 'fixed',
    },
    {
      surface: 'Offline data-pack import',
      fixtureBlock: 'Corrupted checksum data pack',
      expected: 'Reject project data that does not match its declared checksum.',
      actual: 'Compatibility validation accepted a modified payload when schema compatibility passed.',
      fix: 'Validate declared checksums while retaining support for legacy packs without a checksum.',
      regression: 'Unit test and offline browser alert assertion.',
      status: 'fixed',
    },
    {
      surface: 'Markdown and DOCX export',
      fixtureBlock: 'Balanced General Journal and structured statements',
      expected: 'Retain accounting rows, headings, amounts, and totals.',
      actual: 'Structured accounting blocks degraded to their title or plain block text.',
      fix: 'Added shared structured accounting rows, Markdown tables, and native DOCX tables.',
      regression: 'Fixture export unit assertions and downloaded artifact checks.',
      status: 'fixed',
    },
    {
      surface: 'PDF multi-page accounting layout',
      fixtureBlock: 'Multi-page Inventory Journal',
      expected: 'Allow pagination, preserve rows, and repeat column headings.',
      actual: 'A blanket break-inside rule attempted to keep the entire 64-row journal together.',
      fix: 'Allow long journals to paginate, repeat table headers/footers, and keep individual rows intact.',
      regression: 'Computed print-geometry checks and selected-page PDF evidence.',
      status: 'fixed',
    },
    {
      surface: 'PDF MathML rendering',
      fixtureBlock: 'qa-math-boxed and qa-math-boundary-result',
      expected: 'Boxed answers retain a tight visible border.',
      actual: 'The MathML-only PDF path omitted the KaTeX box decoration.',
      fix: 'Apply a shrink-to-fit border only to exported MathML generated from boxed source.',
      regression: 'Unit markup assertion and selected-page PDF evidence.',
      status: 'fixed',
    },
  ],
  externalRequests: [],
  consoleErrors: [],
  dialogs: [],
};

try {
  step('waiting for production server');
  await poll(async () => {
    const response = await fetch(baseUrl);
    return response.ok;
  }, 'production server');

  chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--metrics-recording-only',
    '--remote-allow-origins=*',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${chromeProfile}`,
    '--allow-file-access-from-files',
    'about:blank',
  ], { stdio: 'ignore' });

  const version = await poll(
    () => fetch(`http://127.0.0.1:${debugPort}/json/version`).then(response => response.json()),
    'Chrome DevTools endpoint',
  );
  report.browser = version.Browser;
  step(`connected to ${report.browser}`);
  const browser = await new CdpClient(version.webSocketDebuggerUrl).open();
  openClients.push(browser);
  await browser.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadDirectory,
    eventsEnabled: true,
  });

  const created = await browser.send('Target.createTarget', { url: baseUrl });
  const mainTarget = await poll(
    async () => (await targetList()).find(target => target.id === created.targetId),
    'main browser target',
  );
  const main = await connectPage(mainTarget);
  openClients.push(main.client);
  await waitForText(main, 'Create New Book');

  step('waiting for service worker activation');
  report.checks.serviceWorkerReady = await evaluate(main, `(async () => {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker activation timed out')), 20000));
    const registration = await Promise.race([navigator.serviceWorker.ready, timeout]);
    if (!navigator.serviceWorker.controller) {
      await Promise.race([
        new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })),
        timeout,
      ]);
    }
    return Boolean(registration.active && navigator.serviceWorker.controller);
  })()`);

  step('importing fixture book');
  await clickText(main, 'Create New Book');
  await waitForText(main, 'Import Book JSON');
  await setOnlyFileInput(main, fixtureBookPath, '.json');
  await waitForText(main, 'Mathematics and Accounting Production QA');
  await wait(1000);
  if (!await evaluate(main, `document.body.innerText.includes('Core equation forms')`)) {
    if (await evaluate(main, `document.body.innerText.includes('Open & Continue')`)) {
      await clickText(main, 'Open & Continue');
    } else {
      await evaluate(main, `document.querySelector('[aria-label="Close Project Manager"]')?.click()`);
    }
  }
  report.checks.postImportBody = await evaluate(
    main,
    `document.body.innerText.replace(/\\s+/g, ' ').slice(0, 2500)`,
  );
  step(`post-import view: ${report.checks.postImportBody.slice(0, 500)}`);
  await waitForText(main, 'Core equation forms');

  report.checks.initialFixtureLoad = true;
  step('checking author mathematics and accounting workspace');
  await clickText(main, 'Insert');
  await waitForText(main, 'Paste Worked Problem');
  const workspaceCommands = [
    'Paste Worked Problem', 'Insert Inline Equation', 'Insert Display Equation',
    'Insert Aligned Working', 'Insert Boxed Answer', 'Insert Formula',
    'Insert Journal Entry', 'Insert Ledger', 'Insert Trial Balance',
    'Insert Financial Statement', 'Validate Current Block',
    'Run Chapter Preflight', 'Preview Print Layout',
  ];
  report.checks.authorWorkspaceCommands = await evaluate(
    main,
    `(${JSON.stringify(workspaceCommands)}).every(label =>
      [...document.querySelectorAll('.pc-ribbon-button')].some(button => button.innerText.includes(label)))`,
  );
  await screenshot(main, 'author-workspace-ribbon.png');
  report.screenshots.push('author-workspace-ribbon.png');
  await clickText(main, 'Paste Worked Problem');
  await waitForText(main, 'Detect Structure');
  report.checks.pasteWorkedProblemPanel = await evaluate(
    main,
    `Boolean(document.querySelector('[aria-labelledby="paste-worked-problem-title"] textarea'))`,
  );
  await screenshot(main, 'paste-worked-problem-panel.png');
  report.screenshots.push('paste-worked-problem-panel.png');
  await clickText(main, 'Cancel');

  step('checking editor mathematics');
  const nestedFractionSource = '\\frac{1}{1+\\frac{1}{1+\\frac{1}{x}}}';
  report.checks.knownFractionRendered = await evaluate(
    main,
    `Boolean([...document.querySelectorAll('[data-latex-source]')]
      .find(element => element.dataset.latexSource === ${JSON.stringify(nestedFractionSource)})
      ?.querySelector('.katex'))`,
  );
  report.checks.boxedAnswerRendered = await evaluate(
    main,
    `Boolean([...document.querySelectorAll('[data-latex-source]')]
      .find(element => element.dataset.latexSource.startsWith(${JSON.stringify('\\boxed{x =')}))
      ?.querySelector('.katex'))`,
  );
  report.checks.invalidEquationFallback = await evaluate(
    main,
    `[...document.querySelectorAll('[role="alert"]')].some(element => element.innerText.includes('Equation needs attention'))`,
  );
  report.checks.accessibilityLabels = await evaluate(
    main,
    `document.querySelectorAll('[role="math"][aria-label]').length`,
  );
  report.checks.localMathFontLoaded = await evaluate(
    main,
    `document.fonts.check('16px KaTeX_Main') && performance.getEntriesByType('resource').some(entry => /KaTeX_.*\\.(woff2?|ttf)/.test(entry.name))`,
  );
  await screenshotAroundText(main, 'Long-equation width policy', 'editor-mathematics.png');
  report.screenshots.push('editor-mathematics.png');

  await clickText(main, 'Chapter 2 — Accounting Statements');
  await waitForText(main, 'Balanced General Journal');
  report.checks.chapterNavigation = true;
  step('checking editor accounting');
  report.checks.accountingJournalRendered = await evaluate(
    main,
    `[...document.querySelectorAll('caption')].some(element => element.innerText.includes('Balanced General Journal'))`,
  );
  report.checks.unbalancedTrialDetected = await evaluate(
    main,
    `[...document.querySelectorAll('[role="alert"]')].some(element => /Trial balance differs by R500\\.00/.test(element.innerText))`,
  );
  await screenshotAroundText(main, 'Statement of Profit or Loss', 'editor-accounting.png');
  report.screenshots.push('editor-accounting.png');

  await clickText(main, 'File');
  await clickText(main, 'Print Preview');
  step('capturing print preview');
  await waitForText(main, 'Print / Save as PDF');
  await clickText(main, 'Chapters');
  await screenshotAroundText(main, 'Long-equation width policy', 'print-preview-mathematics.png');
  report.screenshots.push('print-preview-mathematics.png');
  await screenshotAroundText(main, 'Multi-page Inventory Journal', 'print-preview-accounting.png');
  report.screenshots.push('print-preview-accounting.png');

  await clickText(main, '.MD');
  step('exporting Markdown and HTML');
  const markdownPath = await waitForDownload('.md');
  await clickText(main, '.HTML');
  const htmlPath = await waitForDownload('.html');
  report.exports.markdown = {
    file: path.relative(repositoryRoot, markdownPath).replaceAll('\\', '/'),
    includesMath: (await readFile(markdownPath, 'utf8')).includes('\\boxed{x ='),
    includesJournalRows: (await readFile(markdownPath, 'utf8')).includes('| 2025-01-02 | Bank | B1 | R12,500.00 |'),
  };
  const htmlExport = await readFile(htmlPath, 'utf8');
  report.exports.html = {
    file: path.relative(repositoryRoot, htmlPath).replaceAll('\\', '/'),
    includesMathMl: htmlExport.includes('<math'),
    includesJournal: htmlExport.includes('Balanced General Journal'),
    externalReferences: externalRequests([...htmlExport.matchAll(/(?:href|src)="([^"]+)"/g)].map(match => match[1])),
  };

  const beforePrintTargets = new Set((await targetList()).map(target => target.id));
  step('opening print compilation window');
  await clickText(main, 'Print / Save as PDF');
  const printTarget = await poll(async () => {
    const targets = await targetList();
    return targets.find(target => !beforePrintTargets.has(target.id) && target.type === 'page');
  }, 'print compilation window');
  const printPage = await connectPage(printTarget);
  openClients.push(printPage.client);
  await poll(
    async () => evaluate(printPage, `document.title.includes('Book PDF Compilation') && document.querySelectorAll('.math-block').length > 0`),
    'rendered print document',
  );
  await evaluate(printPage, 'document.fonts.ready.then(() => true)');
  await wait(500);

  const printGeometry = await evaluate(printPage, `(() => {
    const blocks = [...document.querySelectorAll('.math-block')];
    const long = blocks.find(element => element.dataset.latexSource?.includes('x_{10}'));
    const multi = document.querySelector('.accounting-multipage');
    return {
      mathBlockCount: blocks.length,
      clippedMathBlocks: blocks.filter(element => element.scrollWidth > element.clientWidth + 1).map(element => element.dataset.latexSource),
      longEquation: long ? {
        clientWidth: long.clientWidth,
        scrollWidth: long.scrollWidth,
        overflowX: getComputedStyle(long).overflowX,
      } : null,
      accountingMultiPageBreakInside: multi ? getComputedStyle(multi).breakInside : null,
      accountingHeaderDisplay: multi ? getComputedStyle(multi.querySelector('thead')).display : null,
      invalidWarningVisible: [...document.querySelectorAll('.math-warning')].some(element => element.innerText.includes('Invalid equation')),
      accessibilityLabels: document.querySelectorAll('.math-block[aria-label]').length,
      fontStatus: document.fonts.status,
      externalResources: performance.getEntriesByType('resource')
        .map(entry => entry.name)
        .filter(url => /^https?:/.test(url) && !/localhost|127\\.0\\.0\\.1/.test(url)),
    };
  })()`);
  report.checks.printGeometry = printGeometry;

  await screenshotAroundText(printPage, 'Long-equation width policy', 'print-layout-long-equation.png');
  await screenshotAroundText(printPage, 'Multi-page Inventory Journal', 'print-layout-multipage-journal.png');
  report.screenshots.push('print-layout-long-equation.png', 'print-layout-multipage-journal.png');

  const pdfResult = await printPage.client.send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    generateTaggedPDF: true,
  });
  const pdfBuffer = Buffer.from(pdfResult.data, 'base64');
  const pdfPath = path.join(evidenceDirectory, 'mathematics-accounting-production-qa.pdf');
  await writeFile(pdfPath, pdfBuffer);
  const pdfText = pdfBuffer.toString('latin1');
  const pageCount = (pdfText.match(/\/Type\s*\/Page\b/g) ?? []).length;
  report.exports.pdf = {
    file: path.relative(repositoryRoot, pdfPath).replaceAll('\\', '/'),
    bytes: pdfBuffer.length,
    pageCount,
    tagged: pdfText.includes('/MarkInfo') || pdfText.includes('/StructTreeRoot'),
  };
  step(`generated ${pageCount}-page PDF`);

  const viewer = await browser.send('Target.createTarget', {
    url: `${pathToFileURL(pdfPath).href}#page=1&zoom=page-width`,
  });
  const viewerTarget = await poll(
    async () => (await targetList()).find(target => target.id === viewer.targetId),
    'PDF viewer target',
  );
  const pdfViewer = await connectPage(viewerTarget);
  openClients.push(pdfViewer.client);
  await wait(2000);
  await screenshot(pdfViewer, 'pdf-page-1.png');
  report.screenshots.push('pdf-page-1.png');
  const captureSelectedPdfPage = async (pageNumber, name) => {
    const selectedResult = await printPage.client.send('Page.printToPDF', {
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      generateTaggedPDF: true,
      pageRanges: String(pageNumber),
    });
    const selectedPath = path.join(evidenceDirectory, `.inspection-page-${pageNumber}.pdf`);
    await writeFile(selectedPath, Buffer.from(selectedResult.data, 'base64'));
    const selectedTargetResult = await browser.send('Target.createTarget', {
      url: pathToFileURL(selectedPath).href,
    });
    const selectedTarget = await poll(
      async () => (await targetList()).find(target => target.id === selectedTargetResult.targetId),
      `PDF inspection page ${pageNumber}`,
    );
    const selectedViewer = await connectPage(selectedTarget);
    await wait(1600);
    await screenshot(selectedViewer, name);
    selectedViewer.client.close();
    await browser.send('Target.closeTarget', { targetId: selectedTargetResult.targetId });
    await rm(selectedPath, { force: true });
    report.screenshots.push(name);
  };
  await captureSelectedPdfPage(Math.min(5, pageCount), 'pdf-page-mathematics.png');
  await captureSelectedPdfPage(Math.min(6, pageCount), 'pdf-page-long-equation.png');
  await captureSelectedPdfPage(Math.min(7, pageCount), 'pdf-page-accounting.png');
  await captureSelectedPdfPage(Math.min(9, pageCount), 'pdf-page-accounting-continuation.png');
  await captureSelectedPdfPage(Math.min(11, pageCount), 'pdf-page-journal-continuation.png');
  await captureSelectedPdfPage(pageCount, 'pdf-page-last.png');

  await main.client.send('Page.reload', { ignoreCache: false });
  await waitForText(main, 'Mathematics and Accounting Production QA');
  await main.client.send('Network.emulateNetworkConditions', {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
  });
  await main.client.send('Page.reload', { ignoreCache: false });
  step('network disabled; reloading PWA');
  await waitForText(main, 'Mathematics and Accounting Production QA');
  if (await evaluate(main, `document.body.innerText.includes('Continue Last Project')`)) {
    await clickText(main, 'Continue Last Project');
    await waitForText(main, 'Core equation forms');
  }
  report.checks.offlineReload = true;

  await clickText(main, 'File');
  await clickText(main, 'Export');
  await waitForText(main, 'Load File from Disk');
  await setOnlyFileInput(main, fixturePackPath, '.json');
  step('imported data pack offline');
  await waitForText(main, 'Core equation forms');
  report.checks.offlineDataPackImport = main.dialogs.some(dialog => dialog.message.includes('Successfully imported project'));

  await clickText(main, 'Chapter 3 — Offline Reader Checks');
  await waitForText(main, 'Quasar reconciliation');
  report.checks.offlineSearch = await evaluate(main, `window.find('Quasar reconciliation')`);
  report.checks.missingAssetFallback = await evaluate(main, `(() => {
    const image = [...document.querySelectorAll('img')].find(element => element.alt.includes('Missing asset fallback fixture'));
    return Boolean(image && image.complete && image.naturalWidth === 0);
  })()`);

  await clickText(main, 'Chapter 1 — Mathematics Typesetting');
  await waitForText(main, 'Core equation forms');
  report.checks.offlineFractionRendered = await evaluate(
    main,
    `Boolean([...document.querySelectorAll('[data-latex-source]')]
      .find(element => element.dataset.latexSource.startsWith(${JSON.stringify('\\frac')}))
      ?.querySelector('.katex'))`,
  );
  report.checks.offlineInvalidFallback = await evaluate(main, `[...document.querySelectorAll('[role="alert"]')].some(element => element.innerText.includes('Equation needs attention'))`);

  await clickText(main, 'Chapter 2 — Accounting Statements');
  await waitForText(main, 'Balanced General Journal');
  report.checks.offlineAccountingRendered = await evaluate(main, `[...document.querySelectorAll('caption')].some(element => element.innerText.includes('Balanced General Journal'))`);

  await clickText(main, 'File');
  await clickText(main, 'Export');
  await waitForText(main, 'Load File from Disk');
  await setOnlyFileInput(main, corruptedPackPath, '.json');
  await wait(500);
  report.checks.checksumValidation = main.dialogs.some(dialog => dialog.message.includes('Data-pack checksum mismatch'));

  await setOnlyFileInput(main, unsupportedPackPath, '.json');
  step('checked checksum and schema rejection');
  await wait(500);
  report.checks.unsupportedSchemaHandling = main.dialogs.some(dialog => dialog.message.includes('Unsupported data-pack schema 99.0.0'));

  await main.client.send('Page.reload', { ignoreCache: false });
  await waitForText(main, 'Mathematics and Accounting Production QA');
  if (await evaluate(main, `document.body.innerText.includes('Continue Last Project')`)) {
    await clickText(main, 'Continue Last Project');
    await waitForText(main, 'Core equation forms');
  }
  await clickText(main, 'File');
  await clickText(main, 'Print Preview');
  await waitForText(main, 'Print / Save as PDF');
  await evaluate(main, `(() => {
    const originalOpen = window.open.bind(window);
    window.open = (...args) => {
      const child = originalOpen(...args);
      if (child) child.print = () => { child.__presscraftQaPrintCalled = true; };
      return child;
    };
    return true;
  })()`);
  const offlinePrintTargets = new Set((await targetList()).map(target => target.id));
  await clickText(main, 'Print / Save as PDF');
  const offlinePrintTarget = await poll(async () => {
    const targets = await targetList();
    return targets.find(target => !offlinePrintTargets.has(target.id) && target.type === 'page');
  }, 'offline print window');
  const offlinePrint = await connectPage(offlinePrintTarget);
  openClients.push(offlinePrint.client);
  report.checks.offlinePrintCommand = await poll(
    async () => evaluate(offlinePrint, 'Boolean(window.__presscraftQaPrintCalled)'),
    'offline print command',
    10_000,
  );
  await screenshotAroundText(main, 'Balanced General Journal', 'offline-accounting.png');
  report.screenshots.push('offline-accounting.png');

  await main.client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });
  await main.client.send('Page.reload', { ignoreCache: false });
  await waitForText(main, 'Mathematics and Accounting Production QA');
  if (await evaluate(main, `document.body.innerText.includes('Continue Last Project')`)) {
    await clickText(main, 'Continue Last Project');
    await waitForText(main, 'Core equation forms');
  }
  await clickText(main, 'File');
  await clickText(main, 'Export');
  await waitForText(main, 'Word Document (.docx)');
  await clickText(main, 'Word Document (.docx)');
  step('exporting DOCX');
  const docxPath = await waitForDownload('.docx');
  report.exports.docx = {
    file: path.relative(repositoryRoot, docxPath).replaceAll('\\', '/'),
    bytes: (await stat(docxPath)).size,
  };

  report.externalRequests = externalRequests([
    ...main.requests,
    ...printPage.requests,
    ...offlinePrint.requests,
  ]);
  report.consoleErrors = [...main.errors, ...printPage.errors, ...offlinePrint.errors];
  report.dialogs = main.dialogs;

  const requiredBooleanChecks = [
    'serviceWorkerReady',
    'initialFixtureLoad',
    'authorWorkspaceCommands',
    'pasteWorkedProblemPanel',
    'knownFractionRendered',
    'boxedAnswerRendered',
    'invalidEquationFallback',
    'localMathFontLoaded',
    'chapterNavigation',
    'accountingJournalRendered',
    'unbalancedTrialDetected',
    'offlineReload',
    'offlineDataPackImport',
    'offlineSearch',
    'missingAssetFallback',
    'offlineFractionRendered',
    'offlineInvalidFallback',
    'offlineAccountingRendered',
    'checksumValidation',
    'unsupportedSchemaHandling',
    'offlinePrintCommand',
  ];
  report.passed = requiredBooleanChecks.every(name => report.checks[name] === true) &&
    printGeometry.clippedMathBlocks.length === 0 &&
    printGeometry.externalResources.length === 0 &&
    report.externalRequests.length === 0 &&
    report.consoleErrors.length === 0 &&
    report.exports.html.externalReferences.length === 0;
  step(`completed with passed=${report.passed}`);
} catch (error) {
  report.passed = false;
  report.fatalError = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
} finally {
  report.finishedAt = new Date().toISOString();
  report.serverOutput = serverOutput.trim();
  if (await fileExists(downloadDirectory)) {
    for (const entry of await readdir(downloadDirectory)) {
      if (entry.endsWith('.crdownload')) {
        await rm(path.join(downloadDirectory, entry), { force: true });
      }
    }
  }
  await writeFile(path.join(evidenceDirectory, 'qa-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  for (const client of openClients.reverse()) client.close();
  await stopProcess(chrome);
  await stopProcess(server);
  await wait(500);
  await rm(chromeProfile, { recursive: true, force: true, maxRetries: 4, retryDelay: 250 });
}

console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
