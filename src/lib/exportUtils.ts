import { BookProject, ExportSettings, CustomMargins, MarginPreset } from '../types';
import { getGoogleFontsHTMLForExport } from './googleFonts';
import { calculateTocData } from './tocUtils';
import { generateIndexOfTerms } from './indexUtils';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType 
} from 'docx';

/**
 * Trigger browser print dialog formatted specifically as a book PDF layout
 */
export function getAutomaticMargins(category: string = '', trimSize: string = '6x9'): CustomMargins {
  const cat = category.toLowerCase();
  const trim = trimSize.toLowerCase();

  // Children / Cartoon / Graphic Novels / Art / Poetry / A5
  if (cat.includes('cartoon') || cat.includes('children') || cat.includes('art') || cat.includes('poetry') || trim === 'a5') {
    return { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' };
  }

  // Academic / Science / Technical / 8.5x11 / A4 / Legal
  if (cat.includes('academic') || cat.includes('science') || cat.includes('tech') || cat.includes('legal') || trim === '8.5x11' || trim === 'a4' || trim === 'legal') {
    return { top: '1.0in', right: '1.0in', bottom: '1.0in', left: '1.0in' };
  }

  // Business / Executive / Non-Fiction
  if (cat.includes('business') || cat.includes('executive') || cat.includes('non-fiction')) {
    return { top: '0.8in', right: '0.75in', bottom: '0.8in', left: '0.85in' };
  }

  // Fiction / Novels / Standard 6x9 Trade Paperback (Includes Spine Gutter Compensation)
  return { top: '0.75in', right: '0.625in', bottom: '0.75in', left: '0.875in' };
}

export function resolveMargins(settings: ExportSettings, category: string = ''): CustomMargins {
  const preset = settings.marginPreset || 'auto';
  if (preset === 'compact') return { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' };
  if (preset === 'standard') return { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' };
  if (preset === 'generous') return { top: '1.0in', right: '1.0in', bottom: '1.0in', left: '1.0in' };
  if (preset === 'custom' && settings.customMargins) {
    return settings.customMargins;
  }
  return getAutomaticMargins(category, settings.trimSize);
}

/**
 * Safely extract and format a valid image URL or base64 data URI from a content block or metadata string.
 */
export function resolveImageSrc(blockOrUrl?: { imageUrl?: string; text?: string } | string): string {
  if (!blockOrUrl) return '';

  let src = '';
  if (typeof blockOrUrl === 'string') {
    src = blockOrUrl.trim();
  } else {
    src = (blockOrUrl.imageUrl || '').trim();
    if (!src && blockOrUrl.text) {
      const trimmedText = blockOrUrl.text.trim();
      if (
        trimmedText.startsWith('data:image/') ||
        trimmedText.startsWith('http://') ||
        trimmedText.startsWith('https://') ||
        trimmedText.startsWith('blob:') ||
        trimmedText.startsWith('iVBORw0KG') ||
        trimmedText.startsWith('/9j/') ||
        trimmedText.startsWith('R0lGOD') ||
        trimmedText.startsWith('UklGR') ||
        trimmedText.startsWith('PHN2Zy')
      ) {
        src = trimmedText;
      }
    }
  }

  if (!src) return '';

  if (
    src.startsWith('data:image/') ||
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('blob:')
  ) {
    return src;
  }

  if (src.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${src}`;
  }
  if (src.startsWith('iVBORw0KG')) {
    return `data:image/png;base64,${src}`;
  }
  if (src.startsWith('R0lGOD')) {
    return `data:image/gif;base64,${src}`;
  }
  if (src.startsWith('UklGR')) {
    return `data:image/webp;base64,${src}`;
  }
  if (src.startsWith('PHN2Zy')) {
    return `data:image/svg+xml;base64,${src}`;
  }

  if (/^[A-Za-z0-9+/=]{40,}$/.test(src)) {
    return `data:image/png;base64,${src}`;
  }

  return src;
}

export function exportToPDF(project: BookProject) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate PDF preview.');
    return;
  }

  const { cover, frontMatter, chapters, watermark, exportSettings } = project;
  const coverArtworkSrc = resolveImageSrc(cover.artworkUrl);
  const tocData = calculateTocData(chapters, frontMatter);
  const orientation = exportSettings.pageOrientation || 'portrait';
  const isLandscape = orientation === 'landscape';

  let pageSizeCss = '8.5in 11in';
  if (exportSettings.trimSize === '6x9') pageSizeCss = isLandscape ? '9in 6in' : '6in 9in';
  else if (exportSettings.trimSize === 'A5') pageSizeCss = isLandscape ? '210mm 148mm' : '148mm 210mm';
  else if (exportSettings.trimSize === 'A4') pageSizeCss = isLandscape ? '297mm 210mm' : '210mm 297mm';
  else pageSizeCss = isLandscape ? '11in 8.5in' : '8.5in 11in';

  // Calculate resolved margins automatically based on book build type or user setting
  const margins = resolveMargins(exportSettings, project.category);

  // Resolve body and heading typography with Google Fonts fallback
  const bodyFontFamily = exportSettings.googleSerifFont 
    ? `"${exportSettings.googleSerifFont}", Georgia, serif`
    : (exportSettings.fontPairing === 'Garamond Editorial' ? '"EB Garamond", Garamond, serif'
       : exportSettings.fontPairing === 'Classic Serif' ? 'Georgia, "Times New Roman", serif'
       : exportSettings.fontPairing === 'Literary Lora' ? 'Lora, Georgia, serif'
       : exportSettings.fontPairing === 'Playfair Editorial' ? '"Playfair Display", Georgia, serif'
       : exportSettings.fontPairing === 'Modern Sans' ? 'Inter, system-ui, sans-serif'
       : 'Georgia, serif');

  const headingFontFamily = exportSettings.googleSansFont
    ? `"${exportSettings.googleSansFont}", system-ui, sans-serif`
    : (exportSettings.fontPairing === 'Modern Sans' ? 'Inter, system-ui, sans-serif'
       : exportSettings.fontPairing === 'Playfair Editorial' ? '"Playfair Display", Georgia, serif'
       : bodyFontFamily);

  const isHyphenationEnabled = exportSettings.enableHyphenation !== false && exportSettings.autoHyphenation !== false;

  const formatBlockText = (block: any): string => {
    let text = block.text || '';
    if (!text) return '';
    text = text.replace(/\n/g, '<br>');
    if (block.bold) text = `<strong>${text}</strong>`;
    if (block.italic) text = `<em>${text}</em>`;
    if (block.underline) text = `<u>${text}</u>`;
    if (block.strikethrough) text = `<s style="text-decoration: line-through;">${text}</s>`;
    if (block.footnoteRef) {
      text += `<sup style="font-size: 8pt; color: #ea580c; font-weight: bold; margin-left: 2px;">[${block.footnoteRef}]</sup>`;
    }
    return text;
  };

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${project.title} - Book PDF Compilation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  ${getGoogleFontsHTMLForExport([
    exportSettings.googleSerifFont || '', 
    exportSettings.googleSansFont || '',
    exportSettings.fontPairing || ''
  ])}
  <style>
    @page {
      size: ${pageSizeCss} ${orientation};
      margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      @bottom-center {
        content: counter(page);
        font-family: ${bodyFontFamily};
        font-size: 9pt;
      }
      @top-right {
        content: "${exportSettings.showRunningHeader ? project.title : ''}";
        font-family: ${bodyFontFamily};
        font-size: 8pt;
        color: #666;
        font-style: italic;
      }
    }

    @page :first {
      margin: 0 !important;
      @bottom-center { content: none !important; }
      @top-right { content: none !important; }
    }

    *, *:before, *:after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: ${bodyFontFamily};
      color: #111;
      line-height: 1.65;
      font-size: 11pt;
      margin: 0;
      padding: 0;
      background: #fff;
      hyphens: ${isHyphenationEnabled ? 'auto' : 'none'};
      -webkit-hyphens: ${isHyphenationEnabled ? 'auto' : 'none'};
      -moz-hyphens: ${isHyphenationEnabled ? 'auto' : 'none'};
      -ms-hyphens: ${isHyphenationEnabled ? 'auto' : 'none'};
    }

    h1, h2, h3, h4, .heading-font {
      font-family: ${headingFontFamily};
    }

    .page-break {
      page-break-before: always;
      break-before: page;
      page-break-after: always;
      break-after: page;
    }

    h1, h2, h3, h4, .heading-font {
      font-family: ${headingFontFamily};
      page-break-after: avoid;
      break-after: avoid;
    }

    .code-block, .latex-box, table, .quiz-container, .exec-summary-box, .image-container {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Cover Page */
    .cover-page {
      width: 100vw;
      height: 100vh;
      min-height: 100vh;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      background-color: ${cover.coverBgColor || '#18181b'} !important;
      color: ${cover.textColor || '#ffffff'} !important;
      padding: 2.5in 1.5in;
      page-break-after: always;
      break-after: page;
      position: relative;
      overflow: hidden;
    }

    .cover-title {
      font-family: ${headingFontFamily};
      font-size: 28pt;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      color: ${cover.textColor || '#ffffff'};
      text-shadow: 0 2px 8px rgba(0,0,0,0.6);
    }

    .cover-subtitle {
      font-size: 14pt;
      color: ${cover.accentColor || '#f97316'};
      margin-bottom: 2rem;
      font-style: italic;
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
    }

    .cover-art {
      max-height: 320px;
      max-width: 80%;
      object-fit: cover;
      margin: 1.5rem auto;
      border-radius: 4px;
      border: 2px solid ${cover.accentColor || '#f97316'};
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }

    .cover-author {
      font-size: 16pt;
      font-weight: 600;
      letter-spacing: 2px;
      margin-top: 2rem;
      text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    }

    .cover-publisher {
      font-size: 9pt;
      letter-spacing: 3px;
      opacity: 0.8;
      margin-top: 1rem;
      text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    }

    /* Front Matter */
    .front-matter {
      padding: 2rem 0;
    }

    .title-page-main {
      text-align: center;
      padding-top: 4rem;
    }

    .copyright-page {
      font-size: 9pt;
      color: #444;
      margin-top: 10rem;
      line-height: 1.8;
    }

    .exec-summary-box {
      background: #fafafa;
      border-left: 4px solid #f97316;
      padding: 1.2rem;
      margin: 1.5rem 0;
      font-size: 10.5pt;
    }

    /* Watermark Overlay */
    ${watermark.enabled ? `
    .watermark-bg {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      height: 90%;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 9999;
      text-align: center;
    }
    ` : ''}

    /* Headings & Content */
    h1.chapter-title {
      font-family: ${headingFontFamily};
      font-size: 22pt;
      font-weight: bold;
      text-align: center;
      margin-top: 3rem;
      margin-bottom: 0.5rem;
      border-bottom: 2px solid #111;
      padding-bottom: 0.5rem;
    }

    h2.chapter-subtitle {
      font-family: ${headingFontFamily};
      font-size: 13pt;
      text-align: center;
      font-style: italic;
      color: #555;
      margin-bottom: 2rem;
    }

    p {
      text-indent: 1.5em;
      margin: 0.4em 0;
      text-align: justify;
      hyphens: ${isHyphenationEnabled ? 'auto' : 'none'};
      -webkit-hyphens: ${isHyphenationEnabled ? 'auto' : 'none'};
      -moz-hyphens: ${isHyphenationEnabled ? 'auto' : 'none'};
      -ms-hyphens: ${isHyphenationEnabled ? 'auto' : 'none'};
    }

    .clause-title {
      font-weight: bold;
      margin-top: 1.2em;
      color: #1a1a1a;
    }

    .code-block {
      background: #18181b;
      color: #f4f4f5;
      font-family: monospace;
      padding: 1rem;
      border-radius: 4px;
      font-size: 9.5pt;
      overflow-x: auto;
      white-space: pre-wrap;
      margin: 1em 0;
    }

    .latex-box {
      text-align: center;
      margin: 1.2em 0;
      font-size: 12pt;
      background: #fdfdfd;
      padding: 0.5rem;
    }

    table.ledger-table, table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2em 0;
      font-size: 9.5pt;
    }

    table.ledger-table th, table.ledger-table td, table.data-table th, table.data-table td {
      border: 1px solid #ccc;
      padding: 6px 8px;
    }

    table.ledger-table th, table.data-table th {
      background: #f1f1f1;
      font-weight: bold;
    }

    .quiz-container {
      background: #fff8f5;
      border: 1px solid #fed7aa;
      border-radius: 6px;
      padding: 1rem;
      margin: 1.5em 0;
    }

    .quiz-question {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .quiz-option {
      margin-left: 1.2rem;
      font-size: 10pt;
    }

    .footnote-section {
      border-top: 1px solid #ccc;
      margin-top: 2rem;
      padding-top: 0.5rem;
      font-size: 8.5pt;
      color: #555;
    }
  </style>
</head>
<body>
  ${watermark.enabled ? `
    <div class="watermark-bg">
      ${watermark.imageUrl && (watermark.type === 'image' || watermark.type === 'both') ? `
        <img src="${watermark.imageUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain; opacity: ${watermark.opacity}; transform: scale(${watermark.imageScale || 1.0}); pointer-events: none;" crossorigin="anonymous" />
      ` : ''}
      ${(watermark.type === 'text' || watermark.type === 'both' || !watermark.type) && watermark.text ? `
        <div style="opacity: ${watermark.opacity}; transform: rotate(${watermark.rotation}deg); font-size: ${watermark.fontSize}px; font-weight: 900; color: rgba(0,0,0,0.8); text-transform: uppercase; letter-spacing: 4px;">
          ${watermark.text}
        </div>
      ` : ''}
    </div>
  ` : ''}

  ${exportSettings.includeCover !== false ? `
  <div class="cover-page">
    ${coverArtworkSrc ? `
      <img 
        src="${coverArtworkSrc}" 
        alt="Cover Background" 
        style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; opacity: ${(cover.imageOpacity ?? 90) / 100};" 
        crossorigin="anonymous"
      />
      <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3), rgba(0,0,0,0.6)); z-index: 1;"></div>
    ` : ''}

    <div style="position: relative; z-index: 10;">
      <div class="cover-title">${cover.title || project.title}</div>
      <div class="cover-subtitle">${cover.subtitle || project.subtitle}</div>
      ${coverArtworkSrc && !cover.fullBleedImage ? `
        <img class="cover-art" src="${coverArtworkSrc}" alt="Cover Artwork" style="position: relative; z-index: 10;" crossorigin="anonymous" />
      ` : ''}
    </div>

    <div style="position: relative; z-index: 10;">
      <div class="cover-author">${cover.author || project.author}</div>
      <div class="cover-publisher">${cover.publisher || frontMatter.publisher}</div>
    </div>
  </div>
  ` : ''}

  ${exportSettings.includeFrontMatter ? `
  <!-- Title Page -->
  <div class="title-page-main page-break">
    <h1 style="font-size: 26pt; text-transform: uppercase;">${project.title}</h1>
    <h3 style="font-style: italic; color: #555;">${project.subtitle}</h3>
    <br><br><br>
    <p style="text-align: center; text-indent: 0;"><strong>${project.author}</strong></p>
    <p style="text-align: center; text-indent: 0; font-size: 9pt; color: #777; margin-top: 5rem;">${frontMatter.publisher}</p>
  </div>

  <!-- Copyright Page -->
  ${frontMatter.includeCopyright ? `
  <div class="copyright-page page-break">
    <p style="text-indent: 0;">${frontMatter.copyrightText}</p>
    <p style="text-indent: 0;">ISBN: ${frontMatter.isbn}</p>
    <p style="text-indent: 0;">Published by ${frontMatter.publisher}</p>
    <p style="text-indent: 0; margin-top: 2rem;">First Edition • Industrial Production Build</p>
  </div>
  ` : ''}

  <!-- Dedication -->
  ${frontMatter.includeDedication && frontMatter.dedicationText ? `
  <div class="page-break" style="padding-top: 8rem; text-align: center; font-style: italic;">
    <p style="text-indent: 0; font-size: 13pt;">${frontMatter.dedicationText}</p>
  </div>
  ` : ''}

  <!-- Executive Summary -->
  ${exportSettings.includeExecSummary && frontMatter.executiveSummaryContent ? `
  <div class="page-break">
    <h2 style="border-bottom: 1px solid #111; padding-bottom: 0.3rem;">Executive Summary</h2>
    <div class="exec-summary-box">
      ${frontMatter.executiveSummaryContent.replace(/\n/g, '<br>')}
    </div>
  </div>
  ` : ''}

  <!-- Table of Contents -->
  ${exportSettings.includeTOC ? `
  <div class="page-break">
    <h2 style="border-bottom: 2px solid #111; padding-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; font-family: ${headingFontFamily};">
      ${frontMatter.tocConfig?.title || 'Table of Contents'}
    </h2>
    <div style="margin-top: 2rem; font-family: ${bodyFontFamily};">
      ${tocData.chapters.map((ch) => `
        <div style="margin-bottom: 0.9rem;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; ${frontMatter.tocConfig?.style === 'academic' ? 'border-bottom: 1px solid #333;' : frontMatter.tocConfig?.style === 'clean' ? '' : 'border-bottom: 1px dotted #888;'}">
            <span style="font-weight: bold; font-size: 11pt;">Chapter ${ch.number}: ${ch.title}</span>
            <span style="font-family: monospace; font-size: 10pt; font-weight: bold; margin-left: 1rem;">${ch.pageNumber}</span>
          </div>
          ${(frontMatter.tocConfig?.showChapterSubtitles ?? true) && ch.subtitle ? `
            <div style="font-style: italic; font-size: 9.5pt; color: #555; padding-left: 1rem; margin-top: 0.1rem;">${ch.subtitle}</div>
          ` : ''}
          ${(frontMatter.tocConfig?.showSubheadings ?? true) && ch.subheadings.length > 0 ? `
            <div style="padding-left: 1.2rem; border-left: 2px solid #ddd; margin-top: 0.3rem;">
              ${ch.subheadings.map((sub) => `
                <div style="display: flex; justify-content: space-between; font-size: 9pt; color: #444; ${frontMatter.tocConfig?.style === 'clean' ? '' : 'border-bottom: 1px dotted #ccc;'}">
                  <span style="${sub.type === 'heading' ? 'font-weight: 600;' : 'font-style: italic;'}">${sub.text}</span>
                  <span style="font-family: monospace;">${sub.pageNumber}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}
  ` : ''}

  <!-- Chapters -->
  ${chapters.map((ch) => {
    const footnotes: { ref: string; text: string }[] = [];

    const blocksHtml = ch.blocks.map((block) => {
      if (block.footnoteRef && block.footnoteText) {
        footnotes.push({ ref: block.footnoteRef, text: block.footnoteText });
      }

      if (block.type === 'pagebreak') return `
        <div class="page-break" style="page-break-before: always; break-before: page; height: 0; margin: 0; padding: 0;"></div>
        <div class="continued-chapter-heading" style="font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #222; border-bottom: 2px solid #111; padding-bottom: 0.4rem; margin-top: 1.5rem; margin-bottom: 1.2rem; font-family: ${headingFontFamily}; page-break-after: avoid; break-after: avoid; display: flex; justify-content: space-between; align-items: center;">
          <span>Chapter ${ch.number}: ${ch.title}</span>
          <span style="font-size: 9pt; font-weight: normal; font-style: italic; color: #666; text-transform: none;">(Continued)</span>
        </div>
      `;
      if (block.type === 'heading') return `<h2 style="font-size: 14pt; margin-top: 1.5rem; margin-bottom: 0.5rem; text-indent: 0; font-family: ${headingFontFamily}; font-weight: bold; page-break-after: avoid; break-after: avoid;">${formatBlockText(block)}</h2>`;
      if (block.type === 'subheading') return `<h3 style="font-size: 12pt; margin-top: 1.2rem; margin-bottom: 0.4rem; text-indent: 0; font-family: ${headingFontFamily}; font-weight: 600; color: #333; page-break-after: avoid; break-after: avoid;">${formatBlockText(block)}</h3>`;
      if (block.type === 'clause') return `<div class="clause-title" style="font-weight: bold; margin-top: 1.2em; color: #1a1a1a;">${formatBlockText(block)}</div>`;
      if (block.type === 'latex') return `<div class="latex-box" style="text-align: center; margin: 1.2em 0; font-size: 12pt; background: #fdfdfd; padding: 0.5rem; page-break-inside: avoid; break-inside: avoid;">$$${block.latexFormula || block.text}$$</div>`;
      if (block.type === 'code') return `<div class="code-block" style="background: #18181b; color: #f4f4f5; font-family: monospace; padding: 1rem; border-radius: 4px; font-size: 9.5pt; overflow-x: auto; white-space: pre-wrap; margin: 1em 0; page-break-inside: avoid; break-inside: avoid;">${block.codeSnippet || block.text}</div>`;
      if (block.type === 'quote') return `<blockquote style="margin: 1.2rem 2rem; font-style: italic; text-align: center; color: #444; border-left: 3px solid #ea580c; padding-left: 1rem;">${formatBlockText(block)}</blockquote>`;
      if (block.type === 'callout') return `<div style="background: #f0f4f8; padding: 0.8rem 1rem; border-left: 4px solid #0284c7; margin: 1rem 0; border-radius: 4px; font-size: 10pt; color: #1e293b; page-break-inside: avoid; break-inside: avoid;">${formatBlockText(block)}</div>`;
      
      if (block.type === 'image') {
        const imgSrc = resolveImageSrc(block);
        const caption = block.imageCaption || (block.text && block.text !== block.imageUrl && !block.text.startsWith('data:') && !block.text.startsWith('http') ? block.text : '');
        const wrap = block.imageWrap || 'center';
        const opacity = block.imageOpacity ?? 1.0;
        const width = block.imageWidth || (wrap === 'left' || wrap === 'right' ? '45%' : '100%');

        if (wrap === 'background-watermark' && imgSrc) {
          return `
            <img src="${imgSrc}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; opacity: ${opacity}; pointer-events: none; z-index: 0;" alt="${caption || 'Scene Watermark'}" crossorigin="anonymous" />
          `;
        }

        let wrapStyles = 'text-align: center; margin: 1.5rem auto; clear: both; page-break-inside: avoid; break-inside: avoid;';
        if (wrap === 'left') {
          wrapStyles = `float: left; margin-right: 1.5rem; margin-bottom: 1rem; max-width: ${width}; page-break-inside: avoid; break-inside: avoid;`;
        } else if (wrap === 'right') {
          wrapStyles = `float: right; margin-left: 1.5rem; margin-bottom: 1rem; max-width: ${width}; page-break-inside: avoid; break-inside: avoid;`;
        } else if (wrap === 'full') {
          wrapStyles = 'width: 100%; margin: 1.5rem 0; text-align: center; page-break-inside: avoid; break-inside: avoid;';
        }

        let frameCss = 'border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);';
        if (block.imageFrameStyle === 'polaroid') {
          frameCss = 'padding: 10px 10px 24px 10px; background: #fff; border: 2px solid #e2e8f0; box-shadow: 0 10px 20px rgba(0,0,0,0.15); transform: rotate(-1deg);';
        } else if (block.imageFrameStyle === 'vintage') {
          frameCss = 'filter: sepia(0.8) contrast(1.2); border: 4px solid #78350f; box-shadow: 0 4px 10px rgba(0,0,0,0.2);';
        } else if (block.imageFrameStyle === 'shadow') {
          frameCss = 'border-radius: 8px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25);';
        } else if (block.imageFrameStyle === 'rounded') {
          frameCss = 'border-radius: 24px; shadow: 0 4px 12px rgba(0,0,0,0.1);';
        }

        return `
          <div class="image-container" style="${wrapStyles} width: ${width};">
            ${imgSrc ? `
              <img src="${imgSrc}" style="max-width: 100%; max-height: 480px; object-fit: contain; opacity: ${opacity}; ${frameCss}" alt="${caption || 'Book Illustration'}" crossorigin="anonymous" />
            ` : `
              <div style="padding: 2rem; background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 6px; color: #64748b; font-size: 10pt;">[Image Illustration]</div>
            `}
            ${caption ? `<div style="font-size: 9pt; color: #64748b; font-style: italic; margin-top: 6px; text-align: center; font-family: serif;">${caption}</div>` : ''}
          </div>
        `;
      }

      if (block.type === 'table' && block.tableData) {
        const tbl = block.tableData;
        return `
          <div style="margin: 1.5rem 0; page-break-inside: avoid; break-inside: avoid;">
            ${tbl.title ? `<div style="font-weight: bold; font-size: 11pt; margin-bottom: 0.5rem; text-align: center; color: #111;">${tbl.title}</div>` : ''}
            <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 9.5pt; font-family: ${bodyFontFamily}; margin: 0 auto;">
              ${tbl.headers && tbl.headers.length > 0 ? `
                <thead>
                  <tr style="background: #f1f5f9; border-bottom: 2px solid #111;">
                    ${tbl.headers.map(h => `<th style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-weight: bold;">${h}</th>`).join('')}
                  </tr>
                </thead>
              ` : ''}
              <tbody>
                ${tbl.rows.map((row, rIdx) => `
                  <tr style="${tbl.striped && rIdx % 2 === 1 ? 'background: #f8fafc;' : 'background: #fff;'}">
                    ${row.map(cell => `<td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${tbl.caption ? `<div style="font-size: 8.5pt; color: #64748b; font-style: italic; margin-top: 0.4rem; text-align: center;">${tbl.caption}</div>` : ''}
          </div>
        `;
      }

      if (block.type === 'spreadsheet' && block.spreadsheetData) {
        const sheet = block.spreadsheetData;
        const headers = sheet.headers && sheet.headers.length > 0 ? sheet.headers : sheet.columns;
        return `
          <div style="margin: 1.5rem 0; page-break-inside: avoid; break-inside: avoid;">
            ${sheet.title ? `<div style="font-weight: bold; font-size: 11pt; margin-bottom: 0.5rem; text-align: center; color: #1e293b;">📊 ${sheet.title}</div>` : ''}
            <table style="width: 100%; border-collapse: collapse; font-size: 9pt; font-family: monospace;">
              <thead>
                <tr style="background: #1e293b; color: #fff;">
                  ${headers.map(h => `<th style="border: 1px solid #334155; padding: 6px 8px; text-align: left;">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${sheet.rows.map((row, rIdx) => `
                  <tr style="${rIdx % 2 === 1 ? 'background: #f8fafc;' : 'background: #fff;'}">
                    ${row.map(cell => `<td style="border: 1px solid #e2e8f0; padding: 5px 8px;">${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      if (block.type === 'caption') {
        const cap = block.captionData;
        const capText = cap ? `${cap.type} ${cap.number ? cap.number + ': ' : ''}${cap.text || block.text}` : block.text;
        return `
          <div style="font-size: 9pt; color: #475569; font-style: italic; text-align: center; margin: 0.5rem 0 1.5rem 0; font-family: ${bodyFontFamily};">
            ${capText}
          </div>
        `;
      }

      if (block.type === 'item') {
        return `
          <div style="display: flex; gap: 0.5rem; margin: 0.3rem 0; padding-left: ${1.5 + (block.indentLevel || 0) * 1.2}rem; text-align: left;">
            <span style="color: #ea580c; font-weight: bold;">•</span>
            <span style="flex: 1;">${formatBlockText(block)}</span>
          </div>
        `;
      }

      if (block.type === 'graph' && block.graphData) {
        const graph = block.graphData;
        const showLegend = graph.legendStyle !== 'hidden';
        const isWhiteLegend = graph.legendStyle === 'white';
        const maxVal = Math.max(...graph.data.map(d => d.value)) || 1;
        return `
          <div style="margin: 1.5rem 0; padding: 1.25rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa; text-align: center; page-break-inside: avoid; break-inside: avoid;">
            ${graph.title ? `<div style="font-weight: bold; font-size: 11pt; margin-bottom: 0.75rem; color: #111;">${graph.title}</div>` : ''}
            <div style="display: flex; flex-direction: column; gap: 6px; max-width: 500px; margin: 0 auto; text-align: left;">
              ${graph.data.map(pt => {
                const pct = Math.round((pt.value / maxVal) * 100);
                return `
                  <div style="font-size: 8.5pt;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px; color: #374151;">
                      <span>${pt.label}</span>
                      <span style="font-family: monospace; font-weight: bold;">${pt.value}</span>
                    </div>
                    <div style="background: #e5e7eb; height: 12px; border-radius: 3px; overflow: hidden;">
                      <div style="background: ${graph.color || '#f97316'}; width: ${pct}%; height: 100%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            ${showLegend ? `
              <div style="margin-top: 1rem; display: inline-flex; align-items: center; gap: 8px; font-size: 8.5pt; font-weight: 600; padding: 6px 14px; border-radius: 6px; ${isWhiteLegend ? 'background: #ffffff; color: #111827; border: 1px solid #d1d5db; box-shadow: 0 1px 2px rgba(0,0,0,0.05);' : 'background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb;' }">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${graph.color || '#f97316'};"></span>
                <span>${graph.title || 'Series Data'}</span>
              </div>
            ` : ''}
            ${graph.caption ? `<div style="font-size: 8.5pt; color: #6b7280; font-style: italic; margin-top: 0.75rem;">${graph.caption}</div>` : ''}
          </div>
        `;
      }

      if (block.type === 'ledger' && block.ledgerData) return `
        <table class="ledger-table">
          <thead>
            <tr><th>Date</th><th>Account</th><th>Debit</th><th>Credit</th><th>Notes</th></tr>
          </thead>
          <tbody>
            ${block.ledgerData.map(row => `
              <tr>
                <td>${row.date}</td>
                <td>${row.account}</td>
                <td>${row.debit}</td>
                <td>${row.credit}</td>
                <td>${row.notes || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      if (block.type === 'quiz' && exportSettings.includeQuizzes && block.quizQuestions) return `
        <div class="quiz-container">
          <h4 style="margin: 0 0 0.5rem 0; text-transform: uppercase; font-size: 9pt; color: #ea580c;">Chapter Knowledge Check</h4>
          ${block.quizQuestions.map((q, idx) => `
            <div style="margin-bottom: 1rem;">
              <div class="quiz-question">${idx + 1}. ${q.question}</div>
              ${q.options.map((opt, oIdx) => `<div class="quiz-option">${String.fromCharCode(65 + oIdx)}. ${opt}</div>`).join('')}
            </div>
          `).join('')}
        </div>
      `;

      const alignStyle = block.align ? `text-align: ${block.align};` : 'text-align: justify;';
      const indentStyle = block.indentLevel ? `padding-left: ${block.indentLevel * 1.5}rem; text-indent: 0;` : '';
      const fontSizeStyle = block.fontSize ? `font-size: ${block.fontSize}px;` : '';
      const fontStyleClass = block.fontStyle === 'sans' ? 'font-family: sans-serif;' : block.fontStyle === 'mono' ? 'font-family: monospace;' : '';

      return `<p style="${alignStyle} ${indentStyle} ${fontSizeStyle} ${fontStyleClass}">${formatBlockText(block)}</p>`;
    }).join('');

    const footnotesHtml = footnotes.length > 0 ? `
      <div class="footnote-section">
        ${footnotes.map(f => `<div><sup style="color: #ea580c; font-weight: bold;">[${f.ref}]</sup> ${f.text}</div>`).join('')}
      </div>
    ` : '';

    return `
      <div class="page-break">
        <h1 class="chapter-title">Chapter ${ch.number}<br><span style="font-size: 18pt; font-weight: normal;">${ch.title}</span></h1>
        ${ch.subtitle ? `<h2 class="chapter-subtitle">${ch.subtitle}</h2>` : ''}
        ${blocksHtml}
        ${footnotesHtml}
      </div>
    `;
  }).join('')}

  <!-- Index of Terms Page -->
  ${(frontMatter.includeIndex || exportSettings.includeIndex) ? (() => {
    const indexGroups = generateIndexOfTerms(chapters, frontMatter);
    if (indexGroups.length === 0) return '';
    return `
      <div class="page-break">
        <h2 style="border-bottom: 2px solid #111; padding-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; font-family: ${headingFontFamily};">
          ${frontMatter.indexConfig?.title || 'Index of Terms & Keywords'}
        </h2>
        <div style="column-count: 2; column-gap: 2rem; margin-top: 2rem; font-family: ${bodyFontFamily}; font-size: 9.5pt;">
          ${indexGroups.map(group => `
            <div style="break-inside: avoid; margin-bottom: 1.2rem;">
              <div style="font-weight: bold; font-size: 11pt; border-bottom: 1.5px solid #ea580c; color: #ea580c; padding-bottom: 2px; margin-bottom: 0.4rem;">
                ${group.letter}
              </div>
              ${group.terms.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px dotted #ccc; padding: 2px 0;">
                  <span style="font-weight: 600; color: #222;">${item.term}</span>
                  <span style="font-family: monospace; font-weight: bold; font-size: 9pt; color: #444; margin-left: 0.5rem;">${item.pages.join(', ')}</span>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  })() : ''}

  <script>
    (function() {
      var hasPrinted = false;

      function doPrint() {
        if (hasPrinted) return;
        hasPrinted = true;
        setTimeout(function() {
          window.focus();
          window.print();
        }, 400);
      }

      function checkImagesAndPrint() {
        var images = Array.from(document.images);
        if (images.length === 0) {
          doPrint();
          return;
        }

        var loadedCount = 0;
        var totalImages = images.length;

        function onImgDone() {
          loadedCount++;
          if (loadedCount >= totalImages) {
            doPrint();
          }
        }

        images.forEach(function(img) {
          if (img.complete && img.naturalWidth > 0) {
            onImgDone();
          } else {
            img.addEventListener('load', onImgDone);
            img.addEventListener('error', onImgDone);
          }
        });

        // Safety fallback timeout if an image hangs
        setTimeout(doPrint, 2500);
      }

      if (document.readyState === 'complete') {
        checkImagesAndPrint();
      } else {
        window.addEventListener('load', checkImagesAndPrint);
        document.addEventListener('DOMContentLoaded', checkImagesAndPrint);
        setTimeout(checkImagesAndPrint, 2000);
      }
    })();
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Safety trigger focus on popup window
  setTimeout(() => {
    try {
      if (printWindow && !printWindow.closed) {
        printWindow.focus();
      }
    } catch (e) {
      console.warn('Print window focus fallback:', e);
    }
  }, 1000);
}

/**
 * Generate and download an EPUB / HTML Package file
 */
export function exportToEPUB(project: BookProject) {
  const embeddedImages: { id: string; src: string; caption?: string; chapterNumber: number; blockId: string }[] = [];
  const coverImageSrc = resolveImageSrc(project.cover?.artworkUrl);

  const processedChapters = project.chapters.map((c) => {
    const chapterImages: string[] = [];

    const blocksWithImages = c.blocks.map((b) => {
      const resolvedSrc = resolveImageSrc(b);
      if (resolvedSrc) {
        const imgId = `img_ch${c.number}_${b.id}`;
        embeddedImages.push({
          id: imgId,
          src: resolvedSrc,
          caption: b.imageCaption,
          chapterNumber: c.number,
          blockId: b.id
        });
        chapterImages.push(resolvedSrc);
        return {
          ...b,
          imageUrl: resolvedSrc
        };
      }
      return b;
    });

    const chapterHtml = blocksWithImages.map((b) => {
      if (b.type === 'image' || b.imageUrl) {
        const src = resolveImageSrc(b);
        const caption = b.imageCaption || '';
        return `<div class="epub-image-container" style="text-align: center; margin: 1.5em 0;">
  <img src="${src}" alt="${caption || 'Chapter Image'}" style="max-width: 100%; height: auto; border-radius: 4px;" />
  ${caption ? `<div class="epub-caption" style="font-size: 0.85em; color: #666; font-style: italic; margin-top: 0.4em;">${caption}</div>` : ''}
</div>`;
      }
      if (b.type === 'heading') return `<h2>${b.text}</h2>`;
      if (b.type === 'subheading') return `<h3>${b.text}</h3>`;
      if (b.type === 'quote') return `<blockquote>${b.text}</blockquote>`;
      if (b.type === 'code') return `<pre><code>${b.codeSnippet || b.text}</code></pre>`;
      return `<p>${b.text}</p>`;
    }).join('\n');

    const chapterText = blocksWithImages.map((b) => {
      if (b.type === 'image' || b.imageUrl) {
        const src = resolveImageSrc(b);
        const caption = b.imageCaption ? ` - ${b.imageCaption}` : '';
        return `![Image${caption}](${src})`;
      }
      return b.text;
    }).filter(Boolean).join('\n\n');

    return {
      number: c.number,
      title: c.title,
      subtitle: c.subtitle,
      wordCount: c.wordCount,
      blocks: blocksWithImages,
      html: chapterHtml,
      text: chapterText,
      images: chapterImages
    };
  });

  const fullBookHtml = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en">
<head>
  <meta charset="utf-8" />
  <title>${project.title}</title>
  <style>
    body { font-family: serif; margin: 5%; color: #111; line-height: 1.6; }
    h1 { text-align: center; color: #ea580c; margin-bottom: 0.2em; }
    .subtitle { text-align: center; font-style: italic; color: #666; margin-bottom: 2em; }
    .author { text-align: center; font-weight: bold; margin-bottom: 3em; }
    .cover-container { text-align: center; margin-bottom: 3em; }
    .cover-container img { max-width: 100%; max-height: 600px; object-fit: contain; }
    .chapter { page-break-before: always; margin-top: 3em; }
    .epub-image-container img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="cover-page">
    <h1>${project.title}</h1>
    ${project.subtitle ? `<div class="subtitle">${project.subtitle}</div>` : ''}
    <div class="author">By ${project.author}</div>
    ${coverImageSrc ? `<div class="cover-container"><img src="${coverImageSrc}" alt="Cover Image" /></div>` : ''}
  </div>
  ${processedChapters.map(ch => `
    <div class="chapter" id="chapter-${ch.number}">
      <h2>Chapter ${ch.number}: ${ch.title}</h2>
      ${ch.subtitle ? `<div class="subtitle">${ch.subtitle}</div>` : ''}
      ${ch.html}
    </div>
  `).join('')}
</body>
</html>`;

  const epubData = {
    schemaVersion: "2.0.0-epub-manifest",
    title: project.title,
    subtitle: project.subtitle,
    author: project.author,
    publisher: project.frontMatter.publisher,
    isbn: project.frontMatter.isbn,
    coverImage: coverImageSrc,
    cover: {
      ...project.cover,
      artworkUrl: coverImageSrc
    },
    chapters: processedChapters,
    embeddedImages,
    fullHtml: fullBookHtml
  };

  const jsonString = JSON.stringify(epubData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_epub_manifest.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export project specifically formatted as an Offline Shell JSON dataset
 */
export function exportOfflineShellJSON(project: BookProject) {
  const offlineShellPayload = {
    schemaVersion: "1.0.0-offline-shell",
    exportedAt: new Date().toISOString(),
    shellType: "PressCraft Offline Publication Shell",
    metadata: {
      id: project.id,
      title: project.title,
      subtitle: project.subtitle,
      author: project.author,
      category: project.category,
      isbn: project.frontMatter.isbn,
      publisher: project.frontMatter.publisher,
      totalChapters: project.chapters.length,
      totalWords: project.chapters.reduce((acc, c) => acc + c.wordCount, 0),
      lastSaved: project.lastSaved,
    },
    publicationSettings: {
      trimSize: project.exportSettings.trimSize,
      fontPairing: project.exportSettings.fontPairing,
      watermarkEnabled: project.watermark.enabled,
      watermarkText: project.watermark.text,
    },
    projectData: project
  };

  const jsonString = JSON.stringify(offlineShellPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_offline_shell.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse an imported JSON file and extract a valid BookProject object
 */
export function parseOfflineShellJSON(jsonContent: string): BookProject {
  const parsed = JSON.parse(jsonContent);
  if (parsed.projectData && parsed.projectData.chapters) {
    return parsed.projectData as BookProject;
  }
  if (parsed.chapters && parsed.title) {
    return parsed as BookProject;
  }
  throw new Error("Invalid offline shell JSON format. Expected 'projectData' or standard book schema.");
}

/**
 * Export project as JSON Backup file
 */
export function exportProjectJSON(project: BookProject) {
  const jsonString = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_presscraft_project.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export project as a Markdown document (.md)
 */
export function exportToMarkdown(project: BookProject) {
  let md = `# ${project.title}\n`;
  if (project.subtitle) md += `*${project.subtitle}*\n\n`;
  
  if (project.series?.isSeries) {
    md += `**Series:** ${project.series.seriesTitle} ${project.series.seriesNumber ? `(${project.series.seriesNumber})` : ''}  \n`;
    if (project.series.tagline) md += `*${project.series.tagline}*  \n`;
  }

  md += `**Author:** ${project.author}  \n`;
  if (project.frontMatter.publisher) md += `**Publisher:** ${project.frontMatter.publisher}  \n`;
  if (project.frontMatter.isbn) md += `**ISBN:** ${project.frontMatter.isbn}  \n`;
  md += `\n---\n\n`;

  if (project.frontMatter.executiveSummaryContent) {
    md += `## Executive Summary\n\n${project.frontMatter.executiveSummaryContent}\n\n---\n\n`;
  }

  project.chapters.forEach((ch) => {
    md += `## Chapter ${ch.number}: ${ch.title}\n`;
    if (ch.seasonNumber || ch.episodeNumber) {
      md += `*Season ${ch.seasonNumber || 1} • Episode ${ch.episodeNumber || 1}${ch.episodeTitle ? `: ${ch.episodeTitle}` : ''}*\n\n`;
    } else if (ch.subtitle) {
      md += `*${ch.subtitle}*\n\n`;
    } else {
      md += `\n`;
    }

    ch.blocks.forEach((block) => {
      if (block.type === 'heading') md += `### ${block.text}\n\n`;
      else if (block.type === 'subheading') md += `#### ${block.text}\n\n`;
      else if (block.type === 'clause') md += `**${block.text}**\n\n`;
      else if (block.type === 'quote') md += `> ${block.text}\n\n`;
      else if (block.type === 'callout') md += `> **Note:** ${block.text}\n\n`;
      else if (block.type === 'code') md += `\`\`\`${block.codeLanguage || ''}\n${block.codeSnippet || block.text}\n\`\`\`\n\n`;
      else if (block.type === 'latex') md += `$$\n${block.latexFormula || block.text}\n$$\n\n`;
      else if (block.type === 'pagebreak') md += `\n---\n\n`;
      else if (block.type === 'image') {
        const imgSrc = resolveImageSrc(block);
        md += `![${block.imageCaption || 'Image'}](${imgSrc})\n`;
        if (block.imageCaption) md += `*${block.imageCaption}*\n\n`;
        else md += `\n`;
      } else {
        md += `${block.text}\n\n`;
      }
    });

    md += `---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export project as a Plain Text document (.txt)
 */
export function exportToTxt(project: BookProject) {
  let txt = `${project.title.toUpperCase()}\n`;
  if (project.subtitle) txt += `${project.subtitle}\n`;
  if (project.series?.isSeries) {
    txt += `SERIES: ${project.series.seriesTitle} (${project.series.seriesNumber || ''})\n`;
  }
  txt += `By ${project.author}\n`;
  if (project.frontMatter.publisher) txt += `Publisher: ${project.frontMatter.publisher}\n`;
  txt += `========================================\n\n`;

  if (project.frontMatter.executiveSummaryContent) {
    txt += `EXECUTIVE SUMMARY:\n${project.frontMatter.executiveSummaryContent}\n\n----------------------------------------\n\n`;
  }

  project.chapters.forEach((ch) => {
    txt += `CHAPTER ${ch.number}: ${ch.title.toUpperCase()}\n`;
    if (ch.seasonNumber || ch.episodeNumber) {
      txt += `Season ${ch.seasonNumber || 1} • Episode ${ch.episodeNumber || 1}${ch.episodeTitle ? `: ${ch.episodeTitle}` : ''}\n`;
    } else if (ch.subtitle) {
      txt += `${ch.subtitle}\n`;
    }
    txt += `----------------------------------------\n\n`;

    ch.blocks.forEach((block) => {
      if (block.type === 'pagebreak') {
        txt += `\n[--- PAGE BREAK ---]\n\n`;
      } else {
        txt += `${block.text}\n\n`;
      }
    });
  });

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export project as a standalone HTML Web Edition (.html)
 */
export function exportToHTML(project: BookProject) {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${project.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #222; line-height: 1.8; background: #fafafa; }
    h1 { text-align: center; color: #111; margin-top: 2rem; }
    .subtitle { text-align: center; font-style: italic; color: #666; font-size: 1.2rem; }
    .series-badge { text-align: center; font-weight: bold; color: #f97316; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 0.5rem; }
    .meta { text-align: center; font-size: 0.9rem; color: #888; border-bottom: 2px solid #ea580c; padding-bottom: 1rem; margin-bottom: 2rem; }
    .chapter { background: #fff; padding: 2.5rem; margin-bottom: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .chapter-title { color: #ea580c; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-bottom: 0.25rem; }
    .episode-tag { font-size: 0.85rem; font-weight: bold; color: #888; text-transform: uppercase; margin-bottom: 1rem; }
    blockquote { border-left: 4px solid #ea580c; padding-left: 1rem; font-style: italic; color: #444; }
    pre { background: #18181b; color: #f4f4f5; padding: 1rem; border-radius: 6px; overflow-x: auto; font-family: monospace; }
    hr { border: none; border-top: 1px dashed #ccc; margin: 2rem 0; }
  </style>
</head>
<body>
  <h1>${project.title}</h1>
  ${project.subtitle ? `<div class="subtitle">${project.subtitle}</div>` : ''}
  ${project.series?.isSeries ? `<div class="series-badge">Series: ${project.series.seriesTitle} ${project.series.seriesNumber ? `(${project.series.seriesNumber})` : ''}</div>` : ''}
  <div class="meta">By ${project.author} | Publisher: ${project.frontMatter.publisher || 'Independent'}</div>
`;

  if (project.frontMatter.includeTOC || project.exportSettings.includeTOC) {
    const toc = calculateTocData(project.chapters, project.frontMatter);
    html += `  <div class="chapter" style="background: #fff8f5; border: 1px solid #fed7aa;">\n`;
    html += `    <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 0.5rem; margin-bottom: 1.5rem; text-transform: uppercase; text-align: center;">${project.frontMatter.tocConfig?.title || 'Table of Contents'}</h2>\n`;
    html += `    <div style="line-height: 2;">\n`;
    toc.chapters.forEach((ch) => {
      html += `      <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #fdba74; font-weight: bold;">\n`;
      html += `        <span>Chapter ${ch.number}: ${ch.title}</span>\n`;
      html += `        <span style="font-family: monospace; color: #c2410c;">Page ${ch.pageNumber}</span>\n`;
      html += `      </div>\n`;
      if ((project.frontMatter.tocConfig?.showChapterSubtitles ?? true) && ch.subtitle) {
        html += `      <div style="font-style: italic; font-size: 0.9em; color: #666; margin-top: -0.2em; margin-bottom: 0.5em; padding-left: 1rem;">${ch.subtitle}</div>\n`;
      }
      if ((project.frontMatter.tocConfig?.showSubheadings ?? true) && ch.subheadings.length > 0) {
        ch.subheadings.forEach((sub) => {
          html += `      <div style="display: flex; justify-content: space-between; font-size: 0.85em; color: #555; padding-left: 1.5rem;">\n`;
          html += `        <span style="${sub.type === 'heading' ? 'font-weight: 600;' : 'font-style: italic;'}">${sub.text}</span>\n`;
          html += `        <span style="font-family: monospace;">Page ${sub.pageNumber}</span>\n`;
          html += `      </div>\n`;
        });
      }
    });
    html += `    </div>\n`;
    html += `  </div>\n`;
  }

  project.chapters.forEach((ch) => {
    html += `  <div class="chapter">\n`;
    html += `    <h2 class="chapter-title">Chapter ${ch.number}: ${ch.title}</h2>\n`;
    if (ch.seasonNumber || ch.episodeNumber) {
      html += `    <div class="episode-tag">Season ${ch.seasonNumber || 1} • Episode ${ch.episodeNumber || 1}${ch.episodeTitle ? `: ${ch.episodeTitle}` : ''}</div>\n`;
    }
    ch.blocks.forEach((block) => {
      if (block.type === 'heading') html += `    <h3>${block.text}</h3>\n`;
      else if (block.type === 'subheading') html += `    <h4>${block.text}</h4>\n`;
      else if (block.type === 'quote') html += `    <blockquote>${block.text}</blockquote>\n`;
      else if (block.type === 'callout') html += `    <div style="background: #f0f4f8; border-left: 4px solid #0284c7; padding: 0.8rem; margin: 1rem 0; border-radius: 4px;">${block.text}</div>\n`;
      else if (block.type === 'code') html += `    <pre><code>${block.codeSnippet || block.text}</code></pre>\n`;
      else if (block.type === 'image') {
        const imgSrc = resolveImageSrc(block);
        const caption = block.imageCaption || (block.text && block.text !== block.imageUrl && !block.text.startsWith('data:') && !block.text.startsWith('http') ? block.text : '');
        html += `    <div style="text-align: center; margin: 1.5rem 0;">\n`;
        if (imgSrc) html += `      <img src="${imgSrc}" style="max-width: 100%; max-height: 450px; border-radius: 6px;" alt="${caption || 'Image'}" />\n`;
        if (caption) html += `      <div style="font-size: 0.85em; color: #666; font-style: italic; margin-top: 4px;">${caption}</div>\n`;
        html += `    </div>\n`;
      }
      else if (block.type === 'table' && block.tableData) {
        const tbl = block.tableData;
        html += `    <div style="margin: 1.5rem 0;">\n`;
        if (tbl.title) html += `      <div style="font-weight: bold; margin-bottom: 0.5rem; text-align: center;">${tbl.title}</div>\n`;
        html += `      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">\n`;
        if (tbl.headers && tbl.headers.length > 0) {
          html += `        <thead><tr style="background: #f1f5f9;">${tbl.headers.map(h => `<th style="border: 1px solid #ddd; padding: 8px;">${h}</th>`).join('')}</tr></thead>\n`;
        }
        html += `        <tbody>\n`;
        tbl.rows.forEach((row, rIdx) => {
          html += `          <tr style="${rIdx % 2 === 1 ? 'background: #f8fafc;' : ''}">${row.map(cell => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`).join('')}</tr>\n`;
        });
        html += `        </tbody>\n      </table>\n`;
        if (tbl.caption) html += `      <div style="font-size: 0.85em; color: #666; font-style: italic; margin-top: 4px; text-align: center;">${tbl.caption}</div>\n`;
        html += `    </div>\n`;
      }
      else if (block.type === 'spreadsheet' && block.spreadsheetData) {
        const sheet = block.spreadsheetData;
        const headers = sheet.headers && sheet.headers.length > 0 ? sheet.headers : sheet.columns;
        html += `    <div style="margin: 1.5rem 0;">\n`;
        if (sheet.title) html += `      <div style="font-weight: bold; margin-bottom: 0.5rem; text-align: center;">📊 ${sheet.title}</div>\n`;
        html += `      <table style="width: 100%; border-collapse: collapse; font-family: monospace;">\n`;
        html += `        <thead><tr style="background: #1e293b; color: #fff;">${headers.map(h => `<th style="padding: 6px 8px; border: 1px solid #334155;">${h}</th>`).join('')}</tr></thead>\n`;
        html += `        <tbody>\n`;
        sheet.rows.forEach((row, rIdx) => {
          html += `          <tr style="${rIdx % 2 === 1 ? 'background: #f8fafc;' : ''}">${row.map(cell => `<td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${cell}</td>`).join('')}</tr>\n`;
        });
        html += `        </tbody>\n      </table>\n    </div>\n`;
      }
      else if (block.type === 'caption') {
        const cap = block.captionData;
        const capText = cap ? `${cap.type} ${cap.number ? cap.number + ': ' : ''}${cap.text || block.text}` : block.text;
        html += `    <div style="font-size: 0.9em; color: #555; font-style: italic; text-align: center; margin: 0.5rem 0 1.5rem 0;">${capText}</div>\n`;
      }
      else if (block.type === 'item') {
        html += `    <div style="padding-left: ${1.5 + (block.indentLevel || 0) * 1.2}rem; margin: 0.3rem 0;">• ${block.text}</div>\n`;
      }
      else if (block.type === 'pagebreak') html += `    <hr>\n`;
      else html += `    <p>${block.text}</p>\n`;
    });
    html += `  </div>\n`;
  });

  html += `</body>\n</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Save project directly to local disk in Documents folder (File System Access API or Download trigger)
 */
export async function saveToLocalDiskInDocuments(project: BookProject): Promise<boolean> {
  const jsonContent = JSON.stringify(project, null, 2);
  const cleanTitle = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'presscraft_book';
  const fileName = `${cleanTitle}_document.m2b`;

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'PressCraft Book Document File (*.m2b, *.json)',
            accept: {
              'application/json': ['.m2b', '.json']
            }
          }
        ]
      });
      const writable = await handle.createWritable();
      await writable.write(jsonContent);
      await writable.close();
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return false; // User cancelled save dialog
      }
      console.warn('File picker standard trigger, falling back to download:', err);
    }
  }

  // Fallback to standard Blob file download
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Export project as a Microsoft Word document (.docx)
 */
export async function exportToWordDocx(project: BookProject): Promise<void> {
  const children: Paragraph[] = [];

  // Title / Cover Heading
  children.push(
    new Paragraph({
      text: project.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 }
    })
  );

  if (project.subtitle) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: project.subtitle,
            italics: true,
            size: 28,
            color: '555555'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 }
      })
    );
  }

  if (project.series?.isSeries) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Series: ${project.series.seriesTitle}${project.series.seriesNumber ? ` (Book ${project.series.seriesNumber})` : ''}`,
            bold: true,
            size: 22,
            color: 'FF6B00'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `By ${project.author}`,
          bold: true,
          size: 24
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 }
    })
  );

  if (project.frontMatter.publisher) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Publisher: ${project.frontMatter.publisher}`,
            size: 20,
            color: '777777'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 }
      })
    );
  }

  if (project.frontMatter.isbn) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `ISBN: ${project.frontMatter.isbn}`,
            size: 18,
            color: '777777'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 }
      })
    );
  }

  // Executive Summary if present
  if (project.frontMatter.executiveSummaryContent) {
    children.push(
      new Paragraph({
        text: 'Executive Summary',
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        spacing: { before: 240, after: 180 }
      })
    );

    const summaryLines = project.frontMatter.executiveSummaryContent.split('\n');
    summaryLines.forEach((line) => {
      if (line.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: line.trim(), size: 22 })
            ],
            spacing: { after: 140 }
          })
        );
      }
    });
  }

  // Iterate Chapters
  project.chapters.forEach((ch, idx) => {
    children.push(
      new Paragraph({
        text: `Chapter ${ch.number}: ${ch.title}`,
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: idx > 0 || !!project.frontMatter.executiveSummaryContent,
        spacing: { before: 360, after: 180 }
      })
    );

    if (ch.seasonNumber || ch.episodeNumber) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Season ${ch.seasonNumber || 1} • Episode ${ch.episodeNumber || 1}${ch.episodeTitle ? `: ${ch.episodeTitle}` : ''}`,
              italics: true,
              size: 20,
              color: '888888'
            })
          ],
          spacing: { after: 200 }
        })
      );
    } else if (ch.subtitle) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: ch.subtitle, italics: true, size: 20, color: '666666' })
          ],
          spacing: { after: 200 }
        })
      );
    }

    ch.blocks.forEach((block) => {
      if (block.type === 'heading') {
        children.push(
          new Paragraph({
            text: block.text,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 }
          })
        );
      } else if (block.type === 'subheading') {
        children.push(
          new Paragraph({
            text: block.text,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 180, after: 100 }
          })
        );
      } else if (block.type === 'clause') {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: block.text, bold: true, size: 22 })
            ],
            spacing: { before: 140, after: 100 }
          })
        );
      } else if (block.type === 'quote') {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: block.text, italics: true, size: 22 })
            ],
            indent: { left: 720, right: 720 },
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 180 }
          })
        );
      } else if (block.type === 'callout') {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Note: ${block.text}`, size: 22, color: '0284C7' })
            ],
            indent: { left: 360, right: 360 },
            spacing: { before: 180, after: 180 }
          })
        );
      } else if (block.type === 'code') {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.codeSnippet || block.text,
                font: 'Courier New',
                size: 20,
                color: '1E1E1E'
              })
            ],
            spacing: { before: 140, after: 140 }
          })
        );
      } else if (block.type === 'latex') {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.latexFormula || block.text,
                font: 'Cambria Math',
                italics: true,
                size: 24
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 140, after: 140 }
          })
        );
      } else if (block.type === 'pagebreak') {
        children.push(
          new Paragraph({
            children: [],
            pageBreakBefore: true
          })
        );
      } else {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: block.text, size: 24 })
            ],
            spacing: { after: 140 },
            alignment: AlignmentType.JUSTIFIED
          })
        );
      }
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children
      }
    ]
  });

  const docBlob = await Packer.toBlob(doc);
  const cleanTitle = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'document';
  const fileName = `${cleanTitle}.docx`;

  const url = URL.createObjectURL(docBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export full manuscript + bibliography as standalone LaTeX (.tex) file
 */
export function exportToLaTeX(project: BookProject): void {
  import('./bibtexUtils').then(({ generateFullLaTeXDocument }) => {
    const texContent = generateFullLaTeXDocument(project);
    const blob = new Blob([texContent], { type: 'text/x-tex;charset=utf-8;' });
    const cleanTitle = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'manuscript';
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${cleanTitle}_manuscript.tex`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

/**
 * Export bibliography citations as BibTeX (.bib) file
 */
export function exportToBibTeX(project: BookProject): void {
  import('./bibtexUtils').then(({ generateBibTeXString, DEFAULT_SAMPLE_BIBLIOGRAPHY }) => {
    const entries = project.bibliography && project.bibliography.length > 0
      ? project.bibliography
      : DEFAULT_SAMPLE_BIBLIOGRAPHY;
    const bibContent = generateBibTeXString(entries);
    const blob = new Blob([bibContent], { type: 'text/plain;charset=utf-8;' });
    const cleanTitle = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'references';
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${cleanTitle}_references.bib`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}


