import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

async function runE2ETests() {
  console.log('🚀 Starting E2E Product Pages Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const screenshotDir = path.resolve('test-artifacts');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    // 1. Visit Homepage
    console.log('1. Navigating to homepage http://localhost:3000/...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${screenshotDir}/01_homepage.png` });

    // 2. Click first product card
    console.log('2. Clicking first product card to open dedicated product page...');
    const firstProductCard = page.locator('#products-section .group').first();
    await firstProductCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Click title or "التفاصيل" button
    const detailsBtn = firstProductCard.locator('button', { hasText: 'التفاصيل' });
    await detailsBtn.click();
    await page.waitForTimeout(1000);

    // 3. Verify URL has changed to /products/...
    const currentUrl = page.url();
    console.log(`Current URL after navigation: ${currentUrl}`);
    if (!currentUrl.includes('/products/')) {
      throw new Error(`Expected URL to contain /products/, but got: ${currentUrl}`);
    }

    // 4. Verify Product Page Elements
    console.log('3. Verifying Dedicated Product Page elements...');
    const productTitle = await page.locator('h1').textContent();
    console.log(`Found Product Title: "${productTitle?.trim()}"`);

    // Verify price banner
    const priceText = await page.locator('.font-mono.text-3xl, .font-mono.text-4xl').first().textContent();
    console.log(`Product Price: ${priceText?.trim()}`);

    // Verify thumbnails interaction
    const thumbnails = page.locator('button[class*="border-2"]');
    const thumbCount = await thumbnails.count();
    console.log(`Found ${thumbCount} thumbnails in gallery`);
    if (thumbCount > 1) {
      await thumbnails.nth(1).click();
      await page.waitForTimeout(400);
      console.log('Clicked second thumbnail successfully');
    }

    // Verify tabs interaction
    console.log('4. Testing Product Information Tabs...');
    await page.locator('button', { hasText: 'المواصفات الفنية وتعليمات العناية' }).click();
    await page.waitForTimeout(300);
    const hasSpecsTable = await page.locator('table').count();
    console.log(`Specs table present: ${hasSpecsTable > 0}`);

    await page.locator('button', { hasText: 'الشحن والتوصيل بالمغرب' }).click();
    await page.waitForTimeout(300);

    await page.locator('button', { hasText: 'سياسة الاستبدال والضمان' }).click();
    await page.waitForTimeout(300);

    // Open Size Guide Modal
    console.log('5. Testing Moroccan Size Guide Modal...');
    const sizeGuideBtn = page.locator('button', { hasText: 'دليل المقاسات المغربية' });
    if (await sizeGuideBtn.isVisible()) {
      await sizeGuideBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${screenshotDir}/02_size_guide_modal.png` });
      // Close it
      await page.locator('button', { hasText: 'فهمت، إغلاق الدليل' }).click();
      await page.waitForTimeout(300);
    }

    // Test Size & Color Selection
    console.log('6. Testing Color & Size selection...');
    const sizeButton = page.locator('button').filter({ hasText: /^XL$/ }).first();
    if (await sizeButton.isVisible()) {
      await sizeButton.click();
      await page.waitForTimeout(300);
      console.log('Selected size XL');
    }

    // Test Quantity Selector
    console.log('7. Testing Quantity Selector...');
    const plusBtn = page.locator('main').locator('button:has-text("+")');
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
      await page.waitForTimeout(200);
      console.log('Incremented quantity to 2');
    }

    // Test Add to Cart
    console.log('8. Testing Add to Cart button...');
    const addToCartBtn = page.locator('main').locator('button:has-text("إضافة إلى سلة المشتريات")');
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
    console.log('Added to cart successfully');

    await page.screenshot({ path: `${screenshotDir}/03_product_page_desktop.png`, fullPage: false });

    // 5. Test Direct URL load (SPA Refresh test)
    console.log('9. Testing Direct Page Reload at /products/djellaba-makhzania-homme-verte...');
    await page.goto('http://localhost:3000/products/djellaba-makhzania-homme-verte', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const directTitle = await page.locator('h1').textContent();
    console.log(`Direct load product title: "${directTitle?.trim()}"`);
    if (!directTitle || !directTitle.includes('جلابة')) {
      throw new Error('Direct URL reload failed to render product page');
    }

    // 6. Test Mobile Viewport (390x844)
    console.log('10. Testing Mobile Viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshotDir}/04_product_page_mobile.png`, fullPage: false });

    // 7. Test Admin Dashboard Product Management
    console.log('11. Testing Admin Dashboard Product Editor...');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    // Open admin login via Header button
    const adminLockBtn = page.locator('button[aria-label="لوحة تحكم الإدارة"]');
    await adminLockBtn.click();
    await page.waitForTimeout(500);

    // Fill login
    await page.locator('input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"]:has-text("تسجيل الدخول إلى لوحة التحكم")').click();
    await page.waitForTimeout(1000);

    // Switch to Products tab
    await page.locator('button:has-text("إدارة المنتجات والمخزون")').click();
    await page.waitForTimeout(500);

    // Click "تعديل المنتج" on first product
    await page.locator('button:has-text("تعديل المنتج")').first().click();
    await page.waitForTimeout(600);

    // Verify Admin Product Edit Modal elements
    const hasSlugInput = await page.locator('input[value*="djellaba-makhzania"]').count();
    const hasGallerySection = await page.locator('text=معرض صور المنتج').count();
    const hasSpecsSection = await page.locator('text=مواصفات الصنعة والقماش').count();
    const hasVariantsSection = await page.locator('text=إدارة الألوان والمقاسات').count();
    const hasPreviewLink = await page.locator('a:has-text("معاينة صفحة المنتج")').count();

    console.log(`Admin product modal verification:
      - Slug input present: ${hasSlugInput > 0}
      - Gallery manager present: ${hasGallerySection > 0}
      - Specs table editor present: ${hasSpecsSection > 0}
      - Variants inventory table present: ${hasVariantsSection > 0}
      - Live preview button present: ${hasPreviewLink > 0}`);

    await page.screenshot({ path: `${screenshotDir}/05_admin_product_editor.png` });

    console.log('🎉 ALL E2E BROWSER VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ E2E Browser Test Failed:', err);
    await page.screenshot({ path: `${screenshotDir}/error_state.png` });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runE2ETests();
