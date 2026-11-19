const DANGEROUS_BLOCKS = /<(script|style|object|embed|form|input|button|textarea|select|meta|link|base)\b[^>]*>[\s\S]*?<\/\1>/gi;
const DANGEROUS_SELF_CLOSING = /<(script|style|object|embed|form|input|button|textarea|select|meta|link|base)\b[^>]*\/?>/gi;

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'div',
  'span',
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'strike',
  'del',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'hr',
  'a',
  'img',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'video',
  'source',
  'iframe',
  'figure',
  'figcaption',
  'font',
]);

const ALLOWED_IFRAME_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
];

const SAFE_STYLE_PROPS = new Set([
  'color',
  'background-color',
  'font-size',
  'font-weight',
  'font-style',
  'text-decoration',
  'text-align',
  'width',
  'max-width',
  'height',
  'border',
  'border-collapse',
  'padding',
  'margin',
]);

function isSafeUrl(url: string, allowIframe = false): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (/^(javascript|vbscript|data:text\/html)/i.test(trimmed)) return false;

  if (allowIframe) {
    try {
      const parsed = new URL(trimmed);
      return (
        (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
        ALLOWED_IFRAME_HOSTS.includes(parsed.hostname.toLowerCase())
      );
    } catch {
      return false;
    }
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return true;
  }
  return false;
}

function sanitizeStyleAttr(rawStyle: string): string {
  const parts = rawStyle.split(';');
  const safeParts: string[] = [];
  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const prop = part.slice(0, colonIdx).trim().toLowerCase();
    const val = part.slice(colonIdx + 1).trim();
    if (!SAFE_STYLE_PROPS.has(prop)) continue;
    if (/expression|url\s*\(|javascript:/i.test(val)) continue;
    if (!val) continue;
    safeParts.push(`${prop}: ${val}`);
  }
  return safeParts.join('; ');
}

function sanitizeTagAttributes(tagName: string, rawAttrs: string): string {
  if (!rawAttrs.trim()) return '';

  const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  const kept: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(rawAttrs)) !== null) {
    const attrName = match[1].toLowerCase();
    const attrVal = match[2] ?? match[3] ?? match[4] ?? '';

    // Strip all inline event handlers (onclick, onerror, onload, ...)
    if (attrName.startsWith('on')) continue;

    if (attrName === 'style') {
      const cleanStyle = sanitizeStyleAttr(attrVal);
      if (cleanStyle) kept.push(`style="${cleanStyle.replace(/"/g, '&quot;')}"`);
      continue;
    }

    if (attrName === 'dir' && (attrVal === 'rtl' || attrVal === 'ltr' || attrVal === 'auto')) {
      kept.push(`dir="${attrVal}"`);
      continue;
    }

    if (attrName === 'class') {
      const safeClass = attrVal.replace(/[^a-zA-Z0-9_\-\s/:]/g, '').trim();
      if (safeClass) kept.push(`class="${safeClass}"`);
      continue;
    }

    if (tagName === 'a') {
      if (attrName === 'href' && isSafeUrl(attrVal)) {
        kept.push(`href="${attrVal.replace(/"/g, '&quot;')}"`);
      } else if (attrName === 'target' && attrVal === '_blank') {
        kept.push('target="_blank"');
        kept.push('rel="noopener noreferrer"');
      } else if (attrName === 'title') {
        kept.push(`title="${attrVal.replace(/"/g, '&quot;')}"`);
      }
      continue;
    }

    if (tagName === 'img') {
      if (attrName === 'src' && isSafeUrl(attrVal)) {
        kept.push(`src="${attrVal.replace(/"/g, '&quot;')}"`);
      } else if (attrName === 'alt' || attrName === 'title') {
        kept.push(`${attrName}="${attrVal.replace(/"/g, '&quot;')}"`);
      } else if ((attrName === 'width' || attrName === 'height') && /^\d+%?$/.test(attrVal)) {
        kept.push(`${attrName}="${attrVal}"`);
      }
      continue;
    }

    if (tagName === 'video') {
      if (attrName === 'src' && isSafeUrl(attrVal)) {
        kept.push(`src="${attrVal.replace(/"/g, '&quot;')}"`);
      } else if (attrName === 'controls' || attrName === 'playsinline' || attrName === 'muted') {
        kept.push(attrName);
      } else if (attrName === 'poster' && isSafeUrl(attrVal)) {
        kept.push(`poster="${attrVal.replace(/"/g, '&quot;')}"`);
      }
      continue;
    }

    if (tagName === 'source') {
      if (attrName === 'src' && isSafeUrl(attrVal)) {
        kept.push(`src="${attrVal.replace(/"/g, '&quot;')}"`);
      } else if (attrName === 'type' && /^video\/[a-z0-9.+-]+$/i.test(attrVal)) {
        kept.push(`type="${attrVal}"`);
      }
      continue;
    }

    if (tagName === 'iframe') {
      if (attrName === 'src' && isSafeUrl(attrVal, true)) {
        kept.push(`src="${attrVal.replace(/"/g, '&quot;')}"`);
      } else if (attrName === 'title') {
        kept.push(`title="${attrVal.replace(/"/g, '&quot;')}"`);
      } else if (attrName === 'allowfullscreen') {
        kept.push('allowfullscreen');
      } else if (attrName === 'frameborder' && attrVal === '0') {
        kept.push('frameborder="0"');
      }
      continue;
    }

    if (tagName === 'font') {
      if (attrName === 'color' && /^[#a-zA-Z0-9(),.\s]+$/.test(attrVal)) {
        kept.push(`color="${attrVal.replace(/"/g, '&quot;')}"`);
      } else if (attrName === 'size' && /^[1-7]$/.test(attrVal)) {
        kept.push(`size="${attrVal}"`);
      }
      continue;
    }

    if ((tagName === 'td' || tagName === 'th') && (attrName === 'colspan' || attrName === 'rowspan')) {
      if (/^\d+$/.test(attrVal)) {
        kept.push(`${attrName}="${attrVal}"`);
      }
    }
  }

  return kept.length > 0 ? ' ' + kept.join(' ') : '';
}

export function sanitizeProductHtml(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';

  // Remove dangerous blocks completely
  let clean = input.replace(DANGEROUS_BLOCKS, '').replace(DANGEROUS_SELF_CLOSING, '');

  // Filter every remaining tag against the allowlist
  clean = clean.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (_full, slash: string, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      return '';
    }
    if (slash === '/') {
      return `</${tag}>`;
    }

    const attrs = sanitizeTagAttributes(tag, rawAttrs);
    // Drop iframe completely if its src was stripped as untrusted
    if (tag === 'iframe' && !/\bsrc=/.test(attrs)) {
      return '';
    }
    const selfClose = tag === 'br' || tag === 'hr' || tag === 'img' || tag === 'source' ? ' /' : '';
    return `<${tag}${attrs}${selfClose}>`;
  });

  return clean.trim();
}

export function isHtmlContent(text: string | undefined | null): boolean {
  if (!text) return false;
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

export function stripHtmlToText(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(DANGEROUS_BLOCKS, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildVideoEmbedHtml(rawUrl: string): string | null {
  const url = rawUrl.trim();
  if (!url) return null;

  // YouTube watch / short / embed links
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch) {
    const videoId = ytMatch[1];
    return `<div class="rich-video-wrapper"><iframe src="https://www.youtube.com/embed/${videoId}" title="فيديو المنتج" frameborder="0" allowfullscreen></iframe></div>`;
  }

  // Vimeo links
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return `<div class="rich-video-wrapper"><iframe src="https://player.vimeo.com/video/${videoId}" title="فيديو المنتج" frameborder="0" allowfullscreen></iframe></div>`;
  }

  // Direct uploaded media or MP4/WebM URL
  if (isSafeUrl(url) && (url.startsWith('/api/media/') || /\.(mp4|webm|ogg)(\?.*)?$/i.test(url))) {
    const escaped = url.replace(/"/g, '&quot;');
    return `<div class="rich-video-wrapper"><video src="${escaped}" controls playsinline></video></div>`;
  }

  return null;
}

export function buildTableHtml(rows: number, cols: number): string {
  const safeRows = Math.max(1, Math.min(10, Math.floor(rows)));
  const safeCols = Math.max(1, Math.min(8, Math.floor(cols)));

  const headerCells = Array.from({ length: safeCols }, (_, c) => `<th>العمود ${c + 1}</th>`).join('');
  const bodyRows = Array.from({ length: Math.max(1, safeRows - 1) }, () => {
    const cells = Array.from({ length: safeCols }, () => `<td>...</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `<table class="rich-table"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table><p><br /></p>`;
}

export function slugifyProductName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
