import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeProductHtml,
  stripHtmlToText,
  isHtmlContent,
  buildVideoEmbedHtml,
  buildTableHtml,
  slugifyProductName,
} from './richText';

test('sanitizeProductHtml strips script tags, inline handlers, and javascript URLs while keeping formatting', () => {
  const dirty =
    '<h2 style="color: #123624; text-align: right;">جلابة ملكية</h2>' +
    '<p><b>خياطة المعلم</b> <script>alert(1)</script><img src="/api/media/abc" onerror="alert(2)" alt="صورة" /></p>' +
    '<a href="javascript:alert(3)">رابط خطير</a>' +
    '<a href="https://example.com" target="_blank">رابط آمن</a>';

  const clean = sanitizeProductHtml(dirty);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('onerror'), false);
  assert.equal(clean.includes('javascript:'), false);
  assert.equal(clean.includes('<h2 style="color: #123624; text-align: right">جلابة ملكية</h2>') || clean.includes('جلابة ملكية</h2>'), true);
  assert.equal(clean.includes('<b>خياطة المعلم</b>'), true);
  assert.equal(clean.includes('src="/api/media/abc"'), true);
  assert.equal(clean.includes('href="https://example.com"'), true);
});

test('sanitizeProductHtml allows trusted YouTube iframes and blocks untrusted iframes', () => {
  const mixed =
    '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>' +
    '<iframe src="https://evil.example/phish"></iframe>';
  const clean = sanitizeProductHtml(mixed);
  assert.equal(clean.includes('youtube.com/embed/dQw4w9WgXcQ'), true);
  assert.equal(clean.includes('evil.example'), false);
});

test('stripHtmlToText extracts clean searchable plain text', () => {
  const html = '<h2>قفطان فاسي</h2><ul><li>حرير طبيعي</li><li>صقلي حر</li></ul>';
  assert.equal(stripHtmlToText(html), 'قفطان فاسي حرير طبيعي صقلي حر');
  assert.equal(isHtmlContent(html), true);
  assert.equal(isHtmlContent('وصف نصي عادي بدون وسوم'), false);
});

test('buildVideoEmbedHtml supports YouTube, Vimeo, and uploaded SQLite media videos', () => {
  const yt = buildVideoEmbedHtml('https://youtu.be/dQw4w9WgXcQ');
  assert.ok(yt && yt.includes('https://www.youtube.com/embed/dQw4w9WgXcQ'));

  const vimeo = buildVideoEmbedHtml('https://vimeo.com/123456789');
  assert.ok(vimeo && vimeo.includes('https://player.vimeo.com/video/123456789'));

  const localVideo = buildVideoEmbedHtml('/api/media/video-uuid-1');
  assert.ok(localVideo && localVideo.includes('<video src="/api/media/video-uuid-1" controls playsinline>'));

  assert.equal(buildVideoEmbedHtml('javascript:alert(1)'), null);
});

test('buildTableHtml and slugifyProductName produce valid clean outputs', () => {
  const table = buildTableHtml(3, 2);
  assert.equal(table.includes('<table'), true);
  assert.equal((table.match(/<th>/g) || []).length, 2);
  assert.equal((table.match(/<tr>/g) || []).length, 3);
  assert.equal(slugifyProductName('  جلابة مخزنية 2026! '), 'جلابة-مخزنية-2026');
});
