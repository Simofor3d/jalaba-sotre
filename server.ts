import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { db } from './src/server/database.ts';
import {
  getAllRegions,
  getCitiesByRegion,
  getProvincesByRegion,
  getCommunesByProvince,
  getLocalitiesByCommune,
  validateMoroccoAddressHierarchy,
  validateMoroccoRegionCity,
  searchLocations,
} from './src/data/moroccoGeoData.ts';
import { validateMoroccanPhone } from './src/utils/pricing.ts';
import { stripHtmlToText } from './src/utils/richText.ts';
import type { AdminUser, Order } from './src/types/store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const parsedPort = Number.parseInt(process.env.PORT ?? '', 10);
const PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true }));

// Fast Cloud Run / load balancer health checks
app.get(['/api/health', '/healthz'], (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', port: PORT, uptime: Math.floor(process.uptime()) });
});

// Serve generated Moroccan image assets in both dev & production
app.use('/src/assets/images', express.static(path.join(__dirname, 'src', 'assets', 'images')));

interface AuthenticatedRequest extends Request {
  adminUser?: AdminUser;
  adminToken?: string;
}

// Login brute-force rate limiter (per IP)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;

function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    return { allowed: true };
  }
  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

function recordFailedLogin(ip: string) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearFailedLogins(ip: string) {
  loginAttempts.delete(ip);
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7).trim() || null;
}

function adminAuthMiddleware(req: AuthenticatedRequest, res: Response, next: () => void) {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'غير مصرح لك بالدخول، يرجى تسجيل الدخول كمدير' });
    return;
  }
  const admin = db.verifySessionToken(token);
  if (!admin) {
    res.status(403).json({ error: 'جلسة تسجيل الدخول غير صالحة أو منتهية الصلاحية' });
    return;
  }
  req.adminUser = admin;
  req.adminToken = token;
  next();
}

function sanitizePublicOrder(order: Order) {
  const { internal_notes: _ignored, ...publicOrder } = order;
  return publicOrder;
}

const ALLOWED_MEDIA_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'video/mp4',
  'video/webm',
]);
const MAX_MEDIA_BYTES = 10 * 1024 * 1024; // 10 MB

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

// 1. Settings & Store Info
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

// 2. Categories (Public: active categories only)
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(db.getCategories(false));
});

// 3. Products (Public: active products only)
app.get('/api/products', (req: Request, res: Response) => {
  const categoryId = req.query.category as string | undefined;
  const featured = req.query.featured === 'true';
  const newArrival = req.query.newArrival === 'true';
  const bestSeller = req.query.bestSeller === 'true';
  const search = ((req.query.search as string) || '').toLowerCase().trim();

  let products = db.getProducts().filter(p => p.is_active);

  if (categoryId && categoryId !== 'all') {
    products = products.filter(p => p.category_id === categoryId);
  }
  if (featured) {
    products = products.filter(p => p.is_featured);
  }
  if (newArrival) {
    products = products.filter(p => p.is_new_arrival);
  }
  if (bestSeller) {
    products = products.filter(p => p.is_best_seller);
  }
  if (search) {
    products = products.filter(
      p =>
        p.name_ar.toLowerCase().includes(search) ||
        (p.name_fr && p.name_fr.toLowerCase().includes(search)) ||
        stripHtmlToText(p.description_ar).toLowerCase().includes(search) ||
        p.tags.some(t => t.toLowerCase().includes(search))
    );
  }

  res.json(products);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id) || db.getProductBySlug(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'المنتج غير موجود' });
    return;
  }
  if (!product.is_active) {
    const token = extractBearerToken(req);
    const admin = token ? db.verifySessionToken(token) : null;
    if (!admin) {
      res.status(404).json({ error: 'المنتج غير متاح حالياً' });
      return;
    }
  }
  res.json(product);
});

// 3b. Uploaded Media Streaming Endpoint (backed by SQLite BLOB)
app.get('/api/media/:id', (req: Request, res: Response) => {
  const media = db.getMediaById(req.params.id);
  if (!media) {
    res.status(404).json({ error: 'الملف غير موجود' });
    return;
  }
  res.setHeader('Content-Type', media.mime_type);
  res.setHeader('Content-Length', String(media.size_bytes));
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.send(media.data);
});

// 4. Moroccan Geographic Hierarchy API
app.get('/api/geo/regions', (_req: Request, res: Response) => {
  res.json(getAllRegions());
});

app.get('/api/geo/cities/:regionId', (req: Request, res: Response) => {
  res.json(getCitiesByRegion(req.params.regionId));
});

app.get('/api/geo/provinces/:regionId', (req: Request, res: Response) => {
  res.json(getProvincesByRegion(req.params.regionId));
});

app.get('/api/geo/communes/:provinceId', (req: Request, res: Response) => {
  res.json(getCommunesByProvince(req.params.provinceId));
});

app.get('/api/geo/localities/:communeId', (req: Request, res: Response) => {
  res.json(getLocalitiesByCommune(req.params.communeId));
});

app.get('/api/geo/search', (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  res.json(searchLocations(q));
});

// 5. Order Placement (COD & Online Payment Intent)
app.post('/api/orders', (req: Request, res: Response) => {
  const {
    customer_name,
    customer_phone,
    customer_email,
    address_line,
    region_id,
    city_id,
    province_id,
    commune_id,
    locality_id,
    region_name_ar,
    province_name_ar,
    commune_name_ar,
    payment_method,
    items,
    internal_notes,
  } = req.body;

  if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
    res.status(400).json({ error: 'يرجى إدخال الاسم الكامل بشكل صحيح' });
    return;
  }

  const phoneVal = validateMoroccanPhone(customer_phone);
  if (!phoneVal.isValid) {
    res.status(400).json({ error: phoneVal.error || 'رقم الهاتف غير صحيح' });
    return;
  }

  if (!address_line || typeof address_line !== 'string' || address_line.trim().length < 3) {
    res.status(400).json({ error: 'يرجى إدخال العنوان الدقيق (الشارع، رقم المنزل أو الإقامة)' });
    return;
  }

  let resolvedProvinceId = province_id || '';
  let resolvedCommuneId = commune_id || '';
  let resolvedRegionName = region_name_ar || '';
  let resolvedProvinceName = province_name_ar || '';
  let resolvedCommuneName = commune_name_ar || '';

  const targetCityId =
    typeof city_id === 'string' && city_id.trim()
      ? city_id.trim()
      : typeof commune_id === 'string' && commune_id.startsWith('city-')
      ? commune_id
      : '';

  if (targetCityId) {
    if (!region_id) {
      res.status(400).json({ error: 'يرجى اختيار الجهة ثم المدينة أو القرية بدقة' });
      return;
    }
    const cityCheck = validateMoroccoRegionCity(region_id, targetCityId);
    if (!cityCheck.isValid || !cityCheck.city || !cityCheck.region) {
      res.status(400).json({ error: cityCheck.error || 'الجهة أو المدينة المحددة غير صحيحة' });
      return;
    }
    resolvedProvinceId = cityCheck.city.province_id;
    resolvedCommuneId = cityCheck.city.id;
    resolvedRegionName = cityCheck.region.name_ar;
    resolvedProvinceName = cityCheck.city.name_ar;
    resolvedCommuneName = cityCheck.city.name_ar;
  } else {
    if (!region_id || !province_id || !commune_id) {
      res.status(400).json({ error: 'يرجى اختيار الجهة والمدينة أو القرية بدقة' });
      return;
    }
    const geoCheck = validateMoroccoAddressHierarchy(region_id, province_id, commune_id);
    if (!geoCheck.isValid) {
      res.status(400).json({ error: geoCheck.error || 'بيانات العنوان الإداري غير متطابقة' });
      return;
    }
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'سلة المشتريات فارغة' });
    return;
  }

  const result = db.createOrder({
    customer_name,
    customer_phone: phoneVal.normalized!,
    customer_email,
    address_line,
    region_id,
    province_id: resolvedProvinceId,
    commune_id: resolvedCommuneId,
    locality_id,
    region_name_ar: resolvedRegionName,
    province_name_ar: resolvedProvinceName,
    commune_name_ar: resolvedCommuneName,
    payment_method: payment_method === 'ONLINE_CARD' ? 'ONLINE_CARD' : 'COD',
    items,
    internal_notes:
      typeof internal_notes === 'string' && internal_notes.trim()
        ? internal_notes.trim().slice(0, 500)
        : undefined,
  });

  if (!result.success || !result.order) {
    res.status(400).json({ error: result.error || 'تعذر تسجيل الطلب، يرجى المحاولة ثانية' });
    return;
  }

  res.status(201).json({
    success: true,
    order: sanitizePublicOrder(result.order),
    message: 'تم تأكيد طلبكم بنجاح وسيتواصل معكم فريق التوصيل لتأكيد موعد التسليم.',
  });
});

// 5b. Secure Public Order Tracking (requires both Order Number + Phone)
app.get('/api/orders/track', (req: Request, res: Response) => {
  const orderNumber = String(req.query.orderNumber || '').trim();
  const phone = String(req.query.phone || '').trim();

  if (!orderNumber || !phone) {
    res.status(400).json({ error: 'يرجى إدخال رقم الطلب ورقم الهاتف المسجل في الطلب' });
    return;
  }

  const tracked = db.trackOrder(orderNumber, phone);
  if (!tracked) {
    res.status(404).json({
      error: 'لم يتم العثور على طلب مطابق لرقم الطلب ورقم الهاتف المدخلين',
    });
    return;
  }

  res.json({ success: true, order: tracked });
});

// 6. Online Payment Simulation / CMI & Payzone Webhook Ready
app.post('/api/payments/process-card', (req: Request, res: Response) => {
  const { order_id, card_number_last4, card_holder } = req.body;
  const order = db.getOrderById(order_id);
  if (!order) {
    res.status(404).json({ error: 'الطلب غير موجود' });
    return;
  }

  const transactionId = `TXN-CMI-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const updated = db.updateOrderStatus(order.id, {
    payment_status: 'PAID',
    order_status: 'CONFIRMED',
    internal_notes: `${order.internal_notes || ''}\nتم الدفع بنجاح بالبطاقة (${card_number_last4 || '****'}) المعاملة: ${transactionId} بواسطة: ${card_holder || 'العميل'}`.trim(),
  });

  res.json({
    success: true,
    transaction_id: transactionId,
    order: updated ? sanitizePublicOrder(updated) : undefined,
    message: 'تمت معالجة الدفع الإلكتروني بنجاح واقتطاع المبلغ وتأكيد الطلب.',
  });
});

// 7. Reviews (Public)
app.get('/api/reviews', (_req: Request, res: Response) => {
  res.json(db.getReviews(false));
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { product_id, customer_name, customer_city, rating, comment } = req.body;
  if (!customer_name || !comment || !rating) {
    res.status(400).json({ error: 'يرجى كتابة الاسم والتقييم والتعليق' });
    return;
  }
  const review = db.addReview({
    product_id,
    customer_name,
    customer_city,
    rating: Number(rating),
    comment,
  });
  res.json({
    success: true,
    review,
    message: 'شكراً لتقييمكم! ستتم مراجعة تعليقكم ونشره قريباً.',
  });
});

// 8. Contact Form
app.post('/api/messages', (req: Request, res: Response) => {
  const { name, phone, email, subject, message } = req.body;
  if (!name || !phone || !message) {
    res.status(400).json({ error: 'يرجى إدخال الاسم ورقم الهاتف ونص الرسالة' });
    return;
  }
  db.addMessage({ name, phone, email, subject: subject || 'استفسار عام', message });
  res.json({
    success: true,
    message: 'تم إرسال رسالتكم بنجاح، سيتواصل معكم فريق المتجر في أقرب وقت.',
  });
});

/* ==========================================================================
   ADMIN DASHBOARD ENDPOINTS (PROTECTED)
   ========================================================================== */

// Admin Login (Rate-limited + Real random server session token)
app.post('/api/admin/login', (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const rateCheck = checkLoginRateLimit(clientIp);
  if (!rateCheck.allowed) {
    res.status(429).json({
      error: `تم تجاوز الحد المسموح لمحاولات الدخول، يرجى الانتظار ${rateCheck.retryAfterSec || 60} ثانية.`,
    });
    return;
  }

  const { username, password } = req.body || {};
  const admin = db.verifyAdmin(String(username || ''), String(password || ''));
  if (!admin) {
    recordFailedLogin(clientIp);
    res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    return;
  }

  clearFailedLogins(clientIp);
  const token = db.createAdminSession(admin.id, 24);
  res.json({
    success: true,
    token,
    user: admin,
  });
});

// Verify active session
app.get('/api/admin/me', adminAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, user: req.adminUser });
});

// Logout & invalidate session token
app.post('/api/admin/logout', adminAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.adminToken) {
    db.deleteSessionToken(req.adminToken);
  }
  res.json({ success: true });
});

// Change admin username / password
app.post('/api/admin/change-password', adminAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { current_password, new_password, new_username } = req.body || {};
  if (!req.adminUser) {
    res.status(401).json({ error: 'غير مصرح' });
    return;
  }
  const result = db.updateAdminCredentials(
    req.adminUser.id,
    String(current_password || ''),
    String(new_password || ''),
    new_username ? String(new_username) : undefined
  );
  if (!result.success || !result.user) {
    res.status(400).json({ error: result.error || 'تعذر تحديث بيانات الدخول' });
    return;
  }
  const newToken = db.createAdminSession(result.user.id, 24);
  res.json({
    success: true,
    token: newToken,
    user: result.user,
    message: 'تم تحديث بيانات الدخول وكلمة المرور بنجاح',
  });
});

// Direct Media Upload to SQLite BLOB
app.post('/api/admin/upload', adminAuthMiddleware, (req: Request, res: Response) => {
  try {
    const { filename, mime_type, data_base64 } = req.body || {};
    if (!filename || !mime_type || !data_base64) {
      res.status(400).json({ error: 'بيانات الملف غير مكتملة' });
      return;
    }

    const normalizedMime = String(mime_type).toLowerCase().trim();
    if (!ALLOWED_MEDIA_MIMES.has(normalizedMime)) {
      res.status(400).json({ error: 'صيغة الملف غير مدعومة (الصيغ المسموحة: JPG, PNG, WebP, GIF, MP4, WebM)' });
      return;
    }

    const rawBase64 = String(data_base64).includes(',')
      ? String(data_base64).split(',')[1]
      : String(data_base64);

    const buffer = Buffer.from(rawBase64, 'base64');
    if (buffer.length === 0) {
      res.status(400).json({ error: 'الملف فارغ أو تالف' });
      return;
    }
    if (buffer.length > MAX_MEDIA_BYTES) {
      res.status(400).json({ error: 'حجم الملف يتجاوز الحد الأقصى المسموح (10 ميجابايت)' });
      return;
    }

    const saved = db.saveMedia({
      filename: String(filename),
      mime_type: normalizedMime,
      buffer,
    });

    res.status(201).json({ success: true, media: saved, url: saved.url });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'تعذر رفع الملف إلى قاعدة البيانات' });
  }
});

app.get('/api/admin/media', adminAuthMiddleware, (_req: Request, res: Response) => {
  res.json(db.listMedia());
});

app.delete('/api/admin/media/:id', adminAuthMiddleware, (req: Request, res: Response) => {
  const deleted = db.deleteMedia(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'الملف غير موجود' });
    return;
  }
  res.json({ success: true });
});

// Admin KPIs & Overview
app.get('/api/admin/analytics', adminAuthMiddleware, (_req: Request, res: Response) => {
  const orders = db.getOrders();
  const products = db.getProducts();

  const totalRevenue = orders
    .filter(o => o.order_status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingOrders = orders.filter(o => o.order_status === 'PENDING').length;
  const confirmedOrders = orders.filter(
    o => o.order_status === 'CONFIRMED' || o.order_status === 'PROCESSING'
  ).length;
  const deliveredOrders = orders.filter(o => o.order_status === 'DELIVERED').length;
  const cancelledOrders = orders.filter(o => o.order_status === 'CANCELLED').length;

  const lowStockProducts = products.filter(p => p.variants.some(v => v.stock_quantity <= 3));

  res.json({
    totalRevenue,
    totalOrders: orders.length,
    pendingOrders,
    confirmedOrders,
    deliveredOrders,
    cancelledOrders,
    totalProducts: products.length,
    lowStockCount: lowStockProducts.length,
    lowStockProducts: lowStockProducts.slice(0, 5),
  });
});

// Admin Orders
app.get('/api/admin/orders', adminAuthMiddleware, (_req: Request, res: Response) => {
  res.json(db.getOrders());
});

app.patch('/api/admin/orders/:id', adminAuthMiddleware, (req: Request, res: Response) => {
  const { order_status, payment_status, internal_notes } = req.body;
  const updated = db.updateOrderStatus(req.params.id, {
    order_status,
    payment_status,
    internal_notes,
  });
  if (!updated) {
    res.status(404).json({ error: 'الطلب غير موجود' });
    return;
  }
  res.json({ success: true, order: updated });
});

// Admin Products Management
app.get('/api/admin/products', adminAuthMiddleware, (_req: Request, res: Response) => {
  res.json(db.getProducts());
});

app.post('/api/admin/products', adminAuthMiddleware, (req: Request, res: Response) => {
  try {
    const saved = db.saveProduct(req.body);
    res.json({ success: true, product: saved });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'فشل حفظ المنتج' });
  }
});

app.delete('/api/admin/products/:id', adminAuthMiddleware, (req: Request, res: Response) => {
  const deleted = db.deleteProduct(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'المنتج غير موجود' });
    return;
  }
  res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
});

// Admin Categories Management (All including inactive)
app.get('/api/admin/categories', adminAuthMiddleware, (_req: Request, res: Response) => {
  res.json(db.getCategories(true));
});

app.post('/api/admin/categories', adminAuthMiddleware, (req: Request, res: Response) => {
  try {
    if (!req.body?.name_ar || !String(req.body.name_ar).trim()) {
      res.status(400).json({ error: 'اسم التصنيف بالعربية مطلوب' });
      return;
    }
    const saved = db.saveCategory(req.body);
    res.json({ success: true, category: saved });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'فشل حفظ التصنيف' });
  }
});

app.delete('/api/admin/categories/:id', adminAuthMiddleware, (req: Request, res: Response) => {
  const allCats = db.getCategories(true);
  if (allCats.length <= 1) {
    res.status(400).json({ error: 'يجب الإبقاء على تصنيف واحد على الأقل في المتجر' });
    return;
  }
  const linkedProducts = db.getProducts().filter(p => p.category_id === req.params.id);
  if (linkedProducts.length > 0) {
    res.status(400).json({
      error: `لا يمكن حذف هذا التصنيف لارتباطه بـ ${linkedProducts.length} منتجات حالياً. قم بنقل المنتجات أولاً أو تعطيل التصنيف.`,
    });
    return;
  }
  const deleted = db.deleteCategory(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'التصنيف غير موجود' });
    return;
  }
  res.json({ success: true });
});

// Admin Reviews Moderation
app.get('/api/admin/reviews', adminAuthMiddleware, (_req: Request, res: Response) => {
  res.json(db.getReviews(true));
});

app.patch('/api/admin/reviews/:id', adminAuthMiddleware, (req: Request, res: Response) => {
  const updated = db.updateReview(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'التقييم غير موجود' });
    return;
  }
  res.json({ success: true, review: updated });
});

app.delete('/api/admin/reviews/:id', adminAuthMiddleware, (req: Request, res: Response) => {
  const deleted = db.deleteReview(req.params.id);
  res.json({ success: deleted });
});

// Admin Messages
app.get('/api/admin/messages', adminAuthMiddleware, (_req: Request, res: Response) => {
  res.json(db.getMessages());
});

app.patch('/api/admin/messages/:id', adminAuthMiddleware, (req: Request, res: Response) => {
  const updated = db.updateMessage(req.params.id, req.body);
  res.json({ success: true, message: updated });
});

app.delete('/api/admin/messages/:id', adminAuthMiddleware, (req: Request, res: Response) => {
  const deleted = db.deleteMessage(req.params.id);
  res.json({ success: deleted });
});

// Admin Homepage Settings
app.patch('/api/admin/settings', adminAuthMiddleware, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

/* ==========================================================================
   VITE DEV SERVER / PRODUCTION STATIC ASSETS
   ========================================================================== */
async function startServer() {
  const distDir = path.join(__dirname, 'dist');
  const distIndexPath = path.join(distDir, 'index.html');
  const hasDistBuild = fs.existsSync(distIndexPath);

  // Run in production static mode when NODE_ENV=production, on Cloud Run (K_SERVICE),
  // or whenever dist/ is built and NODE_ENV is not explicitly 'development'
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.K_SERVICE) ||
    (process.env.NODE_ENV !== 'development' && hasDistBuild);

  if (isProduction) {
    if (hasDistBuild) {
      app.use(express.static(distDir, { index: false }));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(distIndexPath);
      });
    } else {
      console.warn('[Dar Al Maghribia] Production mode started without dist/index.html');
      app.get('*', (_req: Request, res: Response) => {
        res.status(503).send('Application build missing. Please run npm run build.');
      });
    }
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(
      `[Dar Al Maghribia] Server listening on http://${HOST}:${PORT} (mode: ${isProduction ? 'production' : 'development'})`
    );
  });

  const shutdown = (signal: string) => {
    console.log(`[Dar Al Maghribia] Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch(err => {
  console.error('[Dar Al Maghribia] Fatal server startup error:', err);
  process.exit(1);
});
