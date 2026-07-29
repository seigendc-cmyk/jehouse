export interface GoogleFont {
  id: string;
  name: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display';
  familyCSS: string;
  googleApiName: string;
  weights: string[];
  description: string;
  sampleText: string;
}

export const GOOGLE_FONTS: GoogleFont[] = [
  // SERIF FONTS
  {
    id: 'eb-garamond',
    name: 'EB Garamond',
    category: 'serif',
    familyCSS: '"EB Garamond", Garamond, Georgia, serif',
    googleApiName: 'EB+Garamond:ital,wght@0,400..800;1,400..800',
    weights: ['400', '600', '700', '800'],
    description: 'Classic Renaissance book face; the gold standard for literature and academic essays.',
    sampleText: 'In contemporary industrial systems, capital velocity is coupled to continuous equilibrium.'
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    category: 'serif',
    familyCSS: 'Merriweather, Georgia, serif',
    googleApiName: 'Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700',
    weights: ['300', '400', '700'],
    description: 'Designed specifically for high legibility on screens and printed paper.',
    sampleText: 'The algorithmic economy requires resilient mathematical frameworks and zero-latency pipelines.'
  },
  {
    id: 'lora',
    name: 'Lora',
    category: 'serif',
    familyCSS: 'Lora, Georgia, serif',
    googleApiName: 'Lora:ital,wght@0,400..700;1,400..700',
    weights: ['400', '500', '600', '700'],
    description: 'A contemporary serif with roots in calligraphy; ideal for long-form narrative prose.',
    sampleText: 'A quietly distinguished typeface that elevates technical chapters into works of publishing craft.'
  },
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    category: 'serif',
    familyCSS: '"Playfair Display", Georgia, serif',
    googleApiName: 'Playfair+Display:ital,wght@0,400..900;1,400..900',
    weights: ['400', '600', '700', '900'],
    description: 'High-contrast editorial serif influenced by Enlightenment transitional type cut by John Baskerville.',
    sampleText: 'EXECUTIVE SUMMARY & STRATEGIC ALLIANCES'
  },
  {
    id: 'cormorant-garamond',
    name: 'Cormorant Garamond',
    category: 'serif',
    familyCSS: '"Cormorant Garamond", Garamond, serif',
    googleApiName: 'Cormorant+Garamond:ital,wght@0,300..700;1,300..700',
    weights: ['300', '400', '600', '700'],
    description: 'An exquisitely refined, elegant display serif with delicate contrast and crisp letterforms.',
    sampleText: 'Quantum value architectures and high-frequency autonomous market operations.'
  },
  {
    id: 'pt-serif',
    name: 'PT Serif',
    category: 'serif',
    familyCSS: '"PT Serif", Georgia, serif',
    googleApiName: 'PT+Serif:ital,wght@0,400;0,700;1,400;1,700',
    weights: ['400', '700'],
    description: 'Universal academic serif designed for multi-language publication and crisp body copy.',
    sampleText: 'Stochastic differential equations and tokenized ledger mechanics.'
  },
  {
    id: 'crimson-pro',
    name: 'Crimson Pro',
    category: 'serif',
    familyCSS: '"Crimson Pro", Georgia, serif',
    googleApiName: 'Crimson+Pro:ital,wght@0,200..900;1,200..900',
    weights: ['400', '600', '700'],
    description: 'Designed specifically for book production in the tradition of Garamond and Minion.',
    sampleText: 'To the visionary engineers and mathematical pioneers who construct our digital future.'
  },
  {
    id: 'cinzel',
    name: 'Cinzel',
    category: 'serif',
    familyCSS: 'Cinzel, Georgia, serif',
    googleApiName: 'Cinzel:wght@400..900',
    weights: ['400', '600', '700', '900'],
    description: 'Inspired by classical Roman inscriptions; imposing serif for front matter title pages and headings.',
    sampleText: 'THE ALGORITHMIC ECONOMY: VOLUME I'
  },
  {
    id: 'libre-baskerville',
    name: 'Libre Baskerville',
    category: 'serif',
    familyCSS: '"Libre Baskerville", Baskerville, serif',
    googleApiName: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400',
    weights: ['400', '700'],
    description: 'A web-and-print font optimized for body text with tall x-height and generous counters.',
    sampleText: 'A balanced, traditional typographic rhythm suitable for dense technical books.'
  },

  // SANS-SERIF FONTS
  {
    id: 'inter',
    name: 'Inter',
    category: 'sans-serif',
    familyCSS: 'Inter, system-ui, sans-serif',
    googleApiName: 'Inter:wght@300;400;500;600;700;800',
    weights: ['300', '400', '500', '600', '700', '800'],
    description: 'Precision variable sans-serif crafted for high readability in UI and modern documentation.',
    sampleText: 'Technical specifications, data charts, and executive briefing sidebars.'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    category: 'sans-serif',
    familyCSS: 'Roboto, system-ui, sans-serif',
    googleApiName: 'Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400',
    weights: ['300', '400', '500', '700'],
    description: 'Geometric yet friendly dual-nature grotesque; widely recognized global publishing font.',
    sampleText: 'System status report: Zero-Knowledge multi-agent balance confirmed.'
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    category: 'sans-serif',
    familyCSS: '"Open Sans", system-ui, sans-serif',
    googleApiName: 'Open+Sans:ital,wght@0,300..800;1,300..800',
    weights: ['300', '400', '600', '700', '800'],
    description: 'Neutral, open letterforms providing exceptional legibility across print and web mediums.',
    sampleText: 'Clear, modern preambles and structured financial ledger tables.'
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'sans-serif',
    familyCSS: 'Montserrat, system-ui, sans-serif',
    googleApiName: 'Montserrat:ital,wght@0,300..900;1,300..900',
    weights: ['400', '600', '700', '800'],
    description: 'Bold geometric sans-serif inspired by early 20th-century Buenos Aires urban typography.',
    sampleText: 'SEASON 1: DAWN OF ALGORITHMIC VALUE'
  },
  {
    id: 'lato',
    name: 'Lato',
    category: 'sans-serif',
    familyCSS: 'Lato, system-ui, sans-serif',
    googleApiName: 'Lato:ital,wght@0,300;0,400;0,700;1,300;1,400',
    weights: ['300', '400', '700'],
    description: 'Warm, sleek sans-serif combining structural stability with subtle organic curves.',
    sampleText: 'Modern publishing layouts for corporate summaries and scientific manuals.'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'sans-serif',
    familyCSS: 'Poppins, system-ui, sans-serif',
    googleApiName: 'Poppins:ital,wght@0,300..700;1,300..700',
    weights: ['300', '400', '500', '600', '700'],
    description: 'Geometric sans-serif constructed with crisp circular arcs and pure horizontal baselines.',
    sampleText: 'High-visibility captions, financial models, and callout blocks.'
  },
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta Sans',
    category: 'sans-serif',
    familyCSS: '"Plus Jakarta Sans", system-ui, sans-serif',
    googleApiName: 'Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800',
    weights: ['400', '600', '700', '800'],
    description: 'Contemporary tech-focused sans-serif with geometric precision and distinctive character.',
    sampleText: 'Autonomous governance and zero-knowledge multi-agent architectures.'
  },
  {
    id: 'raleway',
    name: 'Raleway',
    category: 'sans-serif',
    familyCSS: 'Raleway, system-ui, sans-serif',
    googleApiName: 'Raleway:ital,wght@0,200..900;1,200..900',
    weights: ['300', '400', '600', '700'],
    description: 'Elegant headings typeface featuring a unique "W" and refined thin strokes.',
    sampleText: 'AN EPIC MULTI-SEASON TECHNICAL & SPECULATIVE SAGA'
  },

  // MONOSPACE FONTS
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    category: 'monospace',
    familyCSS: '"JetBrains Mono", monospace',
    googleApiName: 'JetBrains+Mono:ital,wght@0,300..800;1,300..800',
    weights: ['400', '600', '700'],
    description: 'Crafted specifically for developers and mathematical equation code blocks.',
    sampleText: 'const equilibrium = calculateStochasticDelta(fees, latency);'
  },
  {
    id: 'courier-prime',
    name: 'Courier Prime',
    category: 'monospace',
    familyCSS: '"Courier Prime", monospace',
    googleApiName: 'Courier+Prime:ital,wght@0,400;0,700;1,400;1,700',
    weights: ['400', '700'],
    description: 'Designed for screenplays and manuscript publishing; authentic 12pt typewriter feel.',
    sampleText: 'FIRST EDITION • OFFICIAL PUBLICATION MANUSCRIPT'
  }
];

const loadedFonts = new Set<string>();

/**
 * Dynamically loads a Google Font by adding a <link> tag into the document head
 */
export function injectGoogleFont(googleApiName: string) {
  if (typeof document === 'undefined') return;
  if (loadedFonts.has(googleApiName)) return;

  const fontId = `google-font-${googleApiName.replace(/[^a-zA-Z0-9]/g, '-')}`;
  if (document.getElementById(fontId)) {
    loadedFonts.add(googleApiName);
    return;
  }

  // Preconnect links for Google Fonts API speed
  if (!document.getElementById('google-fonts-preconnect-1')) {
    const p1 = document.createElement('link');
    p1.id = 'google-fonts-preconnect-1';
    p1.rel = 'preconnect';
    p1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(p1);

    const p2 = document.createElement('link');
    p2.id = 'google-fonts-preconnect-2';
    p2.rel = 'preconnect';
    p2.href = 'https://fonts.gstatic.com';
    p2.crossOrigin = 'anonymous';
    document.head.appendChild(p2);
  }

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${googleApiName}&display=swap`;
  document.head.appendChild(link);

  loadedFonts.add(googleApiName);
}

/**
 * Ensures all Google Fonts referenced by font name or GoogleFont ID are loaded into the page
 */
export function loadFontByName(fontNameOrId: string) {
  const font = GOOGLE_FONTS.find(
    f => f.name.toLowerCase() === fontNameOrId.toLowerCase() ||
         f.id.toLowerCase() === fontNameOrId.toLowerCase() ||
         f.familyCSS.toLowerCase().includes(fontNameOrId.toLowerCase())
  );
  if (font) {
    injectGoogleFont(font.googleApiName);
    return font.familyCSS;
  }
  return fontNameOrId;
}

/**
 * Helper to build Google Fonts HTML link tags for PDF/print compilation
 */
export function getGoogleFontsHTMLForExport(activeFontNames: string[] = []): string {
  const fontsToInclude = new Set<string>();

  // Always include default popular ones
  ['EB+Garamond:ital,wght@0,400..800;1,400..800', 'Inter:wght@300;400;600;700', 'Merriweather:ital,wght@0,300;0,400;0,700', 'Lora:ital,wght@0,400..700'].forEach(f => fontsToInclude.add(f));

  activeFontNames.forEach((name) => {
    const matched = GOOGLE_FONTS.find(
      f => f.name.toLowerCase() === name.toLowerCase() ||
           f.id.toLowerCase() === name.toLowerCase() ||
           f.familyCSS.toLowerCase().includes(name.toLowerCase())
    );
    if (matched) {
      fontsToInclude.add(matched.googleApiName);
    }
  });

  const fontFamiliesQuery = Array.from(fontsToInclude).map(api => `family=${api}`).join('&');
  return `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?${fontFamiliesQuery}&display=swap" rel="stylesheet">
  `;
}
