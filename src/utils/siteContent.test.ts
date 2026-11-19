import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SITE_CONTENT,
  resolveSiteText,
  splitMultilineItems,
  mergeWithDefaultSiteContent,
} from './siteContent.ts';

test('resolveSiteText returns trimmed custom value or fallback for empty/undefined strings', () => {
  assert.equal(resolveSiteText('  نص مخصص جديد  ', 'افتراضي'), 'نص مخصص جديد');
  assert.equal(resolveSiteText('   ', 'افتراضي'), 'افتراضي');
  assert.equal(resolveSiteText(undefined, 'افتراضي'), 'افتراضي');
});

test('splitMultilineItems splits policy lines cleanly and ignores blank lines', () => {
  const lines = splitMultilineItems('البند الأول\n\n  البند الثاني  \r\nالبند الثالث', 'افتراضي');
  assert.deepEqual(lines, ['البند الأول', 'البند الثاني', 'البند الثالث']);

  const fallbackLines = splitMultilineItems('', 'سطر أول\nسطر ثاني');
  assert.deepEqual(fallbackLines, ['سطر أول', 'سطر ثاني']);
});

test('mergeWithDefaultSiteContent preserves custom edits while filling missing CMS fields', () => {
  const merged = mergeWithDefaultSiteContent({
    store_name: 'دار فاس الملكية',
    footer_about_text_ar: 'نص تعريفي مخصص للتذييل',
    promo_pillar_1_title_ar: 'تطريز يدوي فاخر',
  });

  assert.equal(merged.store_name, 'دار فاس الملكية');
  assert.equal(merged.footer_about_text_ar, 'نص تعريفي مخصص للتذييل');
  assert.equal(merged.promo_pillar_1_title_ar, 'تطريز يدوي فاخر');
  assert.equal(merged.promo_cta_text_ar, DEFAULT_SITE_CONTENT.promo_cta_text_ar);
  assert.equal(merged.footer_trust_badge_ar, DEFAULT_SITE_CONTENT.footer_trust_badge_ar);
});
