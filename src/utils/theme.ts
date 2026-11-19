import { HomepageSettings } from '../types/store.ts';

export interface ThemePalette {
  primary: string;
  primaryHover: string;
  dark: string;
  darkDeep: string;
  accent: string;
  accentLight: string;
  bg: string;
  surface: string;
  border: string;
  primaryContrast: string;
  accentContrast: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  primary: string;
  accent: string;
  bg: string;
  dark: string;
}

export const DEFAULT_THEME_COLORS = {
  primary: '#123624',
  accent: '#C5A059',
  bg: '#FAF7F2',
  dark: '#0B2216',
} as const;

export const MOROCCAN_THEME_PRESETS: ThemePreset[] = [
  {
    id: 'royal-emerald',
    name: 'الأخضر الملكي الأصيل',
    description: 'الهوية الكلاسيكية للدار المغربية مع الذهبي الفاسي',
    primary: '#123624',
    accent: '#C5A059',
    bg: '#FAF7F2',
    dark: '#0B2216',
  },
  {
    id: 'fez-indigo',
    name: 'الأزرق الفاسي النبيل',
    description: 'أزرق فاسي عميق مستوحى من الزليج التقليدي',
    primary: '#163554',
    accent: '#C89D54',
    bg: '#F7F8FA',
    dark: '#0D2136',
  },
  {
    id: 'marrakech-burgundy',
    name: 'العنابي المراكشي الملكي',
    description: 'خمري دافئ مستوحى من قصور مراكش والقطيفة الفاخرة',
    primary: '#5C1B26',
    accent: '#D4A857',
    bg: '#FBF7F5',
    dark: '#3B0F17',
  },
  {
    id: 'andalusian-obsidian',
    name: 'الأسود الأندلسي الفاخر',
    description: 'تباين عصري داكن مع لمسات الصقلي الذهبي',
    primary: '#1F2421',
    accent: '#C5A059',
    bg: '#F8F7F4',
    dark: '#111412',
  },
  {
    id: 'chefchaouen-cedar',
    name: 'الأرز الأطلسي الهادئ',
    description: 'بني وأخضر داكن مستوحى من خشب الأرز المغربي',
    primary: '#3F2E21',
    accent: '#C99E52',
    bg: '#FAF6F0',
    dark: '#261B12',
  },
];

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function normalizeHex(hex: string | undefined, fallback: string): string {
  if (!hex || typeof hex !== 'string') return fallback;
  const trimmed = hex.trim();
  if (!HEX_REGEX.test(trimmed)) return fallback;
  if (trimmed.length === 4) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return trimmed.toUpperCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = normalizeHex(hex, '#000000').slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map(v => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export function mixHex(hexA: string, hexB: string, weightB: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const w = Math.max(0, Math.min(1, weightB));
  return rgbToHex(
    a.r + (b.r - a.r) * w,
    a.g + (b.g - a.g) * w,
    a.b + (b.b - a.b) * w
  );
}

export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const linearize = (channel: number) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function getContrastTextColor(bgHex: string): '#FAF7F2' | '#1A1E1C' {
  const lum = getRelativeLuminance(bgHex);
  return lum > 0.42 ? '#1A1E1C' : '#FAF7F2';
}

export function buildThemePalette(
  settings?: Partial<
    Pick<
      HomepageSettings,
      'theme_primary_color' | 'theme_accent_color' | 'theme_bg_color' | 'theme_dark_color'
    >
  >
): ThemePalette {
  const primary = normalizeHex(settings?.theme_primary_color, DEFAULT_THEME_COLORS.primary);
  const accent = normalizeHex(settings?.theme_accent_color, DEFAULT_THEME_COLORS.accent);
  const bg = normalizeHex(settings?.theme_bg_color, DEFAULT_THEME_COLORS.bg);
  const defaultDarkFallback = settings?.theme_primary_color
    ? mixHex(primary, '#000000', 0.42)
    : DEFAULT_THEME_COLORS.dark;
  const dark = normalizeHex(settings?.theme_dark_color, defaultDarkFallback);

  const primaryHover =
    getRelativeLuminance(primary) > 0.25
      ? mixHex(primary, '#000000', 0.16)
      : mixHex(primary, '#FFFFFF', 0.14);

  return {
    primary,
    primaryHover,
    dark,
    darkDeep: mixHex(dark, '#000000', 0.35),
    accent,
    accentLight: mixHex(accent, '#FFFFFF', 0.28),
    bg,
    surface: mixHex(bg, accent, 0.1),
    border: mixHex(bg, accent, 0.24),
    primaryContrast: getContrastTextColor(primary),
    accentContrast: getContrastTextColor(accent),
  };
}

export function applyThemePaletteToRoot(
  palette: ThemePalette,
  target?: HTMLElement
): void {
  const root =
    target || (typeof document !== 'undefined' ? document.documentElement : undefined);
  if (!root) return;

  root.style.setProperty('--brand-primary', palette.primary);
  root.style.setProperty('--brand-primary-hover', palette.primaryHover);
  root.style.setProperty('--brand-dark', palette.dark);
  root.style.setProperty('--brand-dark-deep', palette.darkDeep);
  root.style.setProperty('--brand-accent', palette.accent);
  root.style.setProperty('--brand-accent-light', palette.accentLight);
  root.style.setProperty('--brand-bg', palette.bg);
  root.style.setProperty('--brand-surface', palette.surface);
  root.style.setProperty('--brand-border', palette.border);
  root.style.setProperty('--brand-primary-contrast', palette.primaryContrast);
  root.style.setProperty('--brand-accent-contrast', palette.accentContrast);
}

export function splitAnnouncementItems(raw: string | undefined): [string, string, string] {
  const defaults: [string, string, string] = [
    'توصيل مجاني لجميع الطلبيات',
    'الدفع عند الاستلام',
    'منتجات تقليدية أصلية 100%',
  ];
  if (!raw || !raw.trim()) return defaults;
  const parts = raw
    .split('|')
    .map(p => p.trim())
    .filter(Boolean);
  if (parts.length === 1) {
    return [defaults[0], parts[0], defaults[2]];
  }
  if (parts.length === 2) {
    return [parts[0], parts[1], defaults[2]];
  }
  return [parts[0], parts[1], parts[2]];
}
