import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_THEME_COLORS,
  MOROCCAN_THEME_PRESETS,
  buildThemePalette,
  normalizeHex,
  getContrastTextColor,
  splitAnnouncementItems,
} from './theme';

test('normalizeHex handles 3-digit, 6-digit, and invalid strings safely', () => {
  assert.equal(normalizeHex('#abc', '#123624'), '#AABBCC');
  assert.equal(normalizeHex('  #1e3a5f  ', '#123624'), '#1E3A5F');
  assert.equal(normalizeHex('not-a-color', '#123624'), '#123624');
  assert.equal(normalizeHex(undefined, '#123624'), '#123624');
});

test('buildThemePalette returns default luxury emerald palette when settings are omitted', () => {
  const palette = buildThemePalette();
  assert.equal(palette.primary, DEFAULT_THEME_COLORS.primary);
  assert.equal(palette.accent, DEFAULT_THEME_COLORS.accent);
  assert.equal(palette.bg, DEFAULT_THEME_COLORS.bg);
  assert.equal(palette.dark, DEFAULT_THEME_COLORS.dark);
  assert.equal(palette.primaryContrast, '#FAF7F2');
});

test('buildThemePalette adapts hover, surface, and contrast dynamically for custom colors', () => {
  const custom = buildThemePalette({
    theme_primary_color: '#163554',
    theme_accent_color: '#E5C687',
    theme_bg_color: '#FFFFFF',
    theme_dark_color: '#0D2136',
  });
  assert.equal(custom.primary, '#163554');
  assert.equal(custom.primaryContrast, '#FAF7F2');
  assert.equal(custom.accentContrast, '#1A1E1C');
  assert.notEqual(custom.primaryHover, custom.primary);
  assert.notEqual(custom.darkDeep, custom.dark);
});

test('getContrastTextColor switches text color cleanly for dark vs light backgrounds', () => {
  assert.equal(getContrastTextColor('#123624'), '#FAF7F2');
  assert.equal(getContrastTextColor('#FAF7F2'), '#1A1E1C');
});

test('all Moroccan theme presets produce valid hex palettes', () => {
  assert.ok(MOROCCAN_THEME_PRESETS.length >= 4);
  for (const preset of MOROCCAN_THEME_PRESETS) {
    const p = buildThemePalette({
      theme_primary_color: preset.primary,
      theme_accent_color: preset.accent,
      theme_bg_color: preset.bg,
      theme_dark_color: preset.dark,
    });
    assert.match(p.primary, /^#[0-9A-F]{6}$/);
    assert.match(p.accent, /^#[0-9A-F]{6}$/);
    assert.match(p.bg, /^#[0-9A-F]{6}$/);
    assert.match(p.dark, /^#[0-9A-F]{6}$/);
  }
});

test('splitAnnouncementItems splits 1, 2, or 3 segments cleanly without throwing', () => {
  assert.deepEqual(splitAnnouncementItems('شحن سريع | الدفع عند الاستلام | ضمان أصلي'), [
    'شحن سريع',
    'الدفع عند الاستلام',
    'ضمان أصلي',
  ]);
  const single = splitAnnouncementItems('عرض خاص هذا الأسبوع');
  assert.equal(single[1], 'عرض خاص هذا الأسبوع');
  assert.equal(single.length, 3);
});
