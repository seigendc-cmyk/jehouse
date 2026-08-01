import { ContentBlock, ListFormatting, OrderedListStyle, UnorderedListStyle } from '../types';
import { normalizeHexColour } from './bookColours';

export const MAX_LIST_LEVEL = 4;
export const DEFAULT_LIST_INDENT_PT = 24;
export const DEFAULT_LIST_HANGING_PT = 14;

export interface ResolvedListItem {
  listId: string;
  type: 'unordered' | 'ordered';
  level: number;
  markerText: string;
  itemNumber?: number;
  markerStyle: UnorderedListStyle | OrderedListStyle;
  leftIndentPt: number;
  hangingIndentPt: number;
  spacingBeforePt: number;
  spacingAfterPt: number;
  markerColour: string;
  markerSizePercent: number;
  keepWithNext: boolean;
}

export const isListEligibleBlock = (block: ContentBlock): boolean =>
  block.type === 'paragraph' || block.type === 'item';

export const createListId = (): string => `list-${crypto.randomUUID()}`;

export function sanitizeCustomMarker(value: string): string {
  return Array.from(value.normalize('NFKC'))
    .filter((character) => {
      const code = character.codePointAt(0) ?? 0;
      return code >= 0x20 && code !== 0x7f && character !== '<' && character !== '>' && character !== '{' && character !== '}';
    })
    .join('')
    .replace(/javascript:|style\s*=|on\w+\s*=/gi, '')
    .trim()
    .slice(0, 8);
}

export function clampListLevel(level: number, precedingLevel?: number): number {
  const safe = Math.max(0, Math.min(MAX_LIST_LEVEL, Number.isFinite(level) ? Math.floor(level) : 0));
  return precedingLevel === undefined ? safe : Math.min(safe, precedingLevel + 1);
}

export function listFormatting(
  type: 'unordered' | 'ordered',
  listId = createListId(),
  overrides: Partial<ListFormatting> = {}
): ListFormatting {
  return {
    listId,
    type,
    level: 0,
    ...(type === 'unordered' ? { unorderedStyle: 'disc' as const } : { orderedStyle: 'decimal' as const }),
    ...overrides,
    customMarker: overrides.customMarker === undefined ? undefined : sanitizeCustomMarker(overrides.customMarker)
  };
}

export function convertBlocksToList(
  blocks: ContentBlock[],
  blockIds: string[],
  type: 'unordered' | 'ordered',
  id = createListId()
): ContentBlock[] {
  const selected = new Set(blockIds);
  return blocks.map((block) => selected.has(block.id) && isListEligibleBlock(block)
    ? { ...block, type: 'paragraph', listFormatting: listFormatting(type, id) }
    : block);
}

export const removeListFormatting = (block: ContentBlock): ContentBlock => {
  const { listFormatting: _list, ...paragraph } = block;
  return { ...paragraph, type: block.type === 'item' ? 'paragraph' : block.type };
};

export function changeListLevel(blocks: ContentBlock[], index: number, delta: number): ContentBlock[] {
  const block = blocks[index];
  if (!block?.listFormatting) return blocks;
  const previous = blocks.slice(0, index).reverse().find((candidate) => candidate.listFormatting?.listId === block.listFormatting?.listId);
  const requested = block.listFormatting.level + delta;
  const level = delta > 0 ? clampListLevel(requested, previous?.listFormatting?.level) : clampListLevel(requested);
  if (level === block.listFormatting.level) return blocks;
  return blocks.map((candidate, candidateIndex) => candidateIndex === index
    ? { ...candidate, listFormatting: { ...candidate.listFormatting!, level } }
    : candidate);
}

export function splitListAt(blocks: ContentBlock[], index: number, newListId = createListId()): ContentBlock[] {
  const source = blocks[index]?.listFormatting;
  if (!source) return blocks;
  return blocks.map((block, blockIndex) => blockIndex >= index && block.listFormatting?.listId === source.listId
    ? { ...block, listFormatting: { ...block.listFormatting, listId: newListId } }
    : block);
}

export function mergeWithPreviousList(blocks: ContentBlock[], index: number): ContentBlock[] {
  const source = blocks[index]?.listFormatting;
  if (!source) return blocks;
  const previous = blocks.slice(0, index).reverse().find((block) => block.listFormatting?.type === source.type);
  if (!previous?.listFormatting) return blocks;
  return blocks.map((block, blockIndex) => blockIndex >= index && block.listFormatting?.listId === source.listId
    ? { ...block, listFormatting: { ...block.listFormatting, listId: previous.listFormatting!.listId } }
    : block);
}

const alpha = (value: number): string => {
  let result = '';
  for (let number = Math.max(1, value); number > 0; number = Math.floor((number - 1) / 26)) {
    result = String.fromCharCode(97 + ((number - 1) % 26)) + result;
  }
  return result;
};

const roman = (value: number): string => {
  const pairs: Array<[number, string]> = [[1000,'m'],[900,'cm'],[500,'d'],[400,'cd'],[100,'c'],[90,'xc'],[50,'l'],[40,'xl'],[10,'x'],[9,'ix'],[5,'v'],[4,'iv'],[1,'i']];
  let number = Math.max(1, Math.min(3999, value));
  return pairs.reduce((result, [amount, symbol]) => {
    while (number >= amount) { result += symbol; number -= amount; }
    return result;
  }, '');
};

export function orderedMarker(style: OrderedListStyle, value: number, outline: number[]): string {
  switch (style) {
    case 'lower-alpha': return `${alpha(value)}.`;
    case 'upper-alpha': return `${alpha(value).toUpperCase()}.`;
    case 'lower-roman': return `${roman(value)}.`;
    case 'upper-roman': return `${roman(value).toUpperCase()}.`;
    case 'decimal-leading-zero': return `${String(value).padStart(2, '0')}.`;
    case 'decimal-outline': return `${outline.join('.')}.`;
    default: return `${value}.`;
  }
}

function legacyUnorderedMarker(style: UnorderedListStyle, customMarker?: string): string {
  switch (style) {
    case 'circle': return '◦';
    case 'square': return '▪';
    case 'dash': return '–';
    case 'arrow': return '→';
    case 'check': return '✓';
    case 'custom': return sanitizeCustomMarker(customMarker ?? '') || '•';
    default: return '•';
  }
}

export function unorderedMarker(style: UnorderedListStyle, customMarker?: string): string {
  if (style === 'custom') return sanitizeCustomMarker(customMarker ?? '') || '\u2022';
  return ({ disc: '\u2022', circle: '\u25e6', square: '\u25aa', dash: '\u2013', arrow: '\u2192', check: '\u2713' } as const)[style];
}

/** Resolves markers in manuscript order. Counters are scoped by stable listId and reset below shallower levels. */
export function resolveStructuredLists(
  blocks: ContentBlock[],
  colours: { accent?: string; body?: string } = {}
): Map<string, ResolvedListItem> {
  const colour = (value?: string) => value ? normalizeHexColour(value) : null;
  const resolved = new Map<string, ResolvedListItem>();
  const counters = new Map<string, number[]>();
  for (const block of blocks) {
    const formatting = block.listFormatting;
    if (!formatting) continue;
    const level = clampListLevel(formatting.level);
    const style = formatting.type === 'ordered'
      ? formatting.orderedStyle ?? 'decimal'
      : formatting.unorderedStyle ?? (level === 1 ? 'circle' : level === 2 ? 'square' : level >= 3 ? 'dash' : 'disc');
    let itemNumber: number | undefined;
    let markerText: string;
    if (formatting.type === 'ordered') {
      const values = counters.get(formatting.listId) ?? [];
      values.length = level + 1;
      if (formatting.restart || values[level] === undefined) values[level] = Math.max(1, Math.floor(formatting.startAt ?? 1));
      else values[level] += 1;
      for (let child = 0; child < level; child += 1) values[child] ??= 1;
      counters.set(formatting.listId, values);
      itemNumber = values[level];
      markerText = orderedMarker(style as OrderedListStyle, itemNumber, values.slice(0, level + 1));
    } else {
      markerText = unorderedMarker(style as UnorderedListStyle, formatting.customMarker);
    }
    resolved.set(block.id, {
      listId: formatting.listId,
      type: formatting.type,
      level,
      markerText,
      itemNumber,
      markerStyle: style,
      leftIndentPt: DEFAULT_LIST_INDENT_PT * (level + 1),
      hangingIndentPt: DEFAULT_LIST_HANGING_PT,
      spacingBeforePt: Math.max(0, formatting.spacingBeforePt ?? 0),
      spacingAfterPt: Math.max(0, formatting.spacingAfterPt ?? 4),
      markerColour: colour(formatting.markerColour) ?? colour(block.textColour) ?? colour(colours.accent) ?? colour(colours.body) ?? '#111111',
      markerSizePercent: Math.max(50, Math.min(200, formatting.markerSizePercent ?? 100)),
      keepWithNext: formatting.keepWithNext ?? false
    });
  }
  return resolved;
}

const escapeListHtml = (value: string): string => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]!));

/** Render one contiguous logical list with valid nested list elements. */
export function renderListRunHtml(blocks: ContentBlock[], resolved = resolveStructuredLists(blocks)): string {
  if (!blocks.length) return '';
  let html = '';
  const open: Array<'ol' | 'ul'> = [];
  blocks.forEach((block, index) => {
    const item = resolved.get(block.id);
    if (!item) return;
    const tag = item.type === 'ordered' ? 'ol' : 'ul';
    const depth = item.level + 1;
    while (open.length > depth) html += `</li></${open.pop()}>`;
    if (index > 0 && open.length === depth) html += '</li>';
    while (open.length < depth) {
      const start = tag === 'ol' && item.itemNumber && item.itemNumber !== 1 ? ` start="${item.itemNumber}"` : '';
      html += `<${tag}${start}>`;
      open.push(tag);
    }
    html += `<li data-list-id="${escapeListHtml(item.listId)}" style="color:${escapeListHtml(item.markerColour)};margin-top:${item.spacingBeforePt}pt;margin-bottom:${item.spacingAfterPt}pt">${escapeListHtml(block.text)}`;
  });
  while (open.length) html += `</li></${open.pop()}>`;
  return html;
}

export function renderListBlockMarkdown(block: ContentBlock, item: ResolvedListItem): string {
  const marker = item.type === 'ordered' ? `${item.itemNumber ?? 1}.` : '-';
  return `${'  '.repeat(item.level)}${marker} ${block.text}`;
}
