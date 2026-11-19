import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import type {
  Product,
  Category,
  Order,
  Review,
  ContactMessage,
  HomepageSettings,
  AdminUser,
  MediaFile,
} from '../types/store.ts';
import { DEFAULT_SITE_CONTENT } from '../utils/siteContent.ts';
import { sanitizeProductHtml, slugifyProductName } from '../utils/richText.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SQLITE_FILE = path.join(DATA_DIR, 'store.db');
const LEGACY_JSON_FILE = path.join(DATA_DIR, 'moroccan_store_db.json');

export const LOCAL_ASSETS = {
  hero: '/src/assets/images/hero_moroccan_couture_1794683049899.jpg',
  menDjellaba: '/src/assets/images/cat_men_djellaba_1794683050322.jpg',
  womenKaftan: '/src/assets/images/cat_women_kaftan_1794683051308.jpg',
  whiteDjellaba: '/src/assets/images/prod_djellaba_white_1794683051629.jpg',
  gandouraNavy: '/src/assets/images/prod_gandoura_navy_1794683051598.jpg',
  selhamBabouche: '/src/assets/images/prod_selham_babouche_1794683051779.jpg',
} as const;

export function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { salt: actualSalt, hash: derived };
}

export function verifyPasswordHash(password: string, salt: string, expectedHash: string): boolean {
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const expectedBuf = Buffer.from(expectedHash, 'hex');
    if (derived.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(derived, expectedBuf);
  } catch {
    return false;
  }
}

function sanitizeImageUrl(url: string | undefined, fallback: string): string {
  if (!url || !url.trim()) return fallback;
  if (url.includes('images.unsplash.com')) return fallback;
  return url;
}

const DEFAULT_SETTINGS: HomepageSettings = {
  ...DEFAULT_SITE_CONTENT,
  hero_image_url: LOCAL_ASSETS.hero,
  promo_banner_image_url: LOCAL_ASSETS.womenKaftan,
  theme_primary_color: '#123624',
  theme_accent_color: '#C5A059',
  theme_bg_color: '#FAF7F2',
  theme_dark_color: '#0B2216',
  store_name: 'الأصالة المغربية',
  store_phone: '+212 5 22 45 88 90',
  store_whatsapp: '+212 6 61 78 90 12',
  store_email: 'contact@daralmaghribia.ma',
  store_city: 'الدار البيضاء، المملكة المغربية',
  shipping_fee: 40,
  free_shipping_threshold: 500,
  enable_cod: true,
  enable_online_payment: true,
};

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-men-djellaba',
    slug: 'men-djellaba',
    name_ar: 'جلابيب رجالية',
    name_fr: 'Djellabas Homme',
    description_ar: 'جلابيب رجالية مخزنية صوفية ومليفة مطرزة بخياطة المعلم والسفيفة الدقيقة.',
    image_url: LOCAL_ASSETS.menDjellaba,
    display_order: 1,
    is_active: true,
  },
  {
    id: 'cat-women-djellaba',
    slug: 'women-djellaba',
    name_ar: 'جلابيب نسائية',
    name_fr: 'Djellabas & Caftans Femme',
    description_ar: 'إبداع مغربي راقٍ من القفاطين والجلابيب الحريرية المرصعة بالعقاد والضفائر المذهبة.',
    image_url: LOCAL_ASSETS.womenKaftan,
    display_order: 2,
    is_active: true,
  },
  {
    id: 'cat-gandoura',
    slug: 'gandouras',
    name_ar: 'كاندورات وجبادور',
    name_fr: 'Gandouras & Jabador',
    description_ar: 'كاندورات صيفية ومناسباتية بلمسات مغربية أصيلة وخامات قطنية ومخملية مريحة.',
    image_url: LOCAL_ASSETS.gandouraNavy,
    display_order: 3,
    is_active: true,
  },
  {
    id: 'cat-selham-access',
    slug: 'selham-accessories',
    name_ar: 'سلاهم وإكسسوارات',
    name_fr: 'Selhams & Accessoires',
    description_ar: 'سلاهم صوفية ملكية، بلغة فاس ومراكش الجلدية الأصلية، وطربوش فاس الأصيل.',
    image_url: LOCAL_ASSETS.selhamBabouche,
    display_order: 4,
    is_active: true,
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    slug: 'djellaba-makhzania-homme-verte',
    name_ar: 'جلابة مخزنية رجالية ملكية خضراء',
    name_fr: 'Djellaba Makhzania Homme Vert Forêt',
    description_ar:
      'جلابة مغربية مخزنية أصيلة منسوجة من أرقى أقمشة المليفة الكشميرية الفاخرة بلون أخضر زمردي ملكي. مطرزة يدوياً بسفيفة حريرية وعقاد مبرومة على يد كبار معلمين مدينة فاس. تتميز بقصة مخزنية ملكية واسعة وأكمام متناسقة توفر أعلى درجات الهيبة والراحة في صلاة الجمعة والأعياد والمناسبات الوطنية.',
    description_fr:
      'Djellaba marocaine traditionnelle confectionnée dans un tissu noble de cachemire vert forêt avec broderie sfifa et aqqads faits main par les maîtres artisans de Fès.',
    regular_price: 1200,
    discounted_price: 950,
    category_id: 'cat-men-djellaba',
    sku: 'DJ-MAK-01-GRN',
    main_image: LOCAL_ASSETS.menDjellaba,
    additional_images: [
      LOCAL_ASSETS.whiteDjellaba,
      LOCAL_ASSETS.hero,
      LOCAL_ASSETS.selhamBabouche,
    ],
    fabric: 'مليفة كشمير إيطالية ممتازة ناعمة ومقاومة للتجعد',
    craftsmanship: 'خياطة المعلم التقليدية بسفيفة بريسم حر وعقاد مبرومة يدوياً',
    care_instructions:
      'يُنصح بالتنظيف الجاف (Pressing) للحفاظ على خيوط الحرير وتناسق السفيفة. الكي بحرارة خفيفة من الجهة الداخلية.',
    specifications: [
      { label: 'القصة والتصميم', value: 'مخزنية ملكية واسعة (Coupe Makhzania Traditionnelle)' },
      { label: 'نوع القماش', value: 'مليفة كشمير من الصوف والحرير عالي الجودة' },
      { label: 'الخياطة', value: 'خياطة المعلم اليدوية بسفيفة وعقاد بريسم' },
      { label: 'مكان الصنع', value: 'صناعة تقليدية مغربية 100% - فاس العريقة' },
      { label: 'المناسبات', value: 'الأعياد الدينية، حفلات الزفاف، صلاة الجمعة، والمناسبات الرسمية' },
      { label: 'الموسم', value: 'جميع الفصول (ربيعي، خريفي، شتوي)' },
    ],
    shipping_info:
      'توصيل مجاني وسريع لكافة ربوع المملكة المغربية خلال 24 إلى 48 ساعة مع خدمة الفحص والمعاينة قبل الدفع.',
    return_policy: 'استبدال المقاس أو اللون مجاناً ومضمون 100% خلال 7 أيام من الاستلام.',
    related_product_ids: ['prod-002', 'prod-005', 'prod-006'],
    seo_title: 'جلابة مخزنية رجالية ملكية خضراء | الأصالة المغربية',
    seo_description:
      'تسوق جلابة مخزنية مغربية رجالية خضراء بخياطة المعلم وسفيفة حرير أصلية مع الدفع عند الاستلام بالمغرب.',
    variants: [
      { id: 'v-01-m-gr', color_name_ar: 'أخضر ملكي', color_name_fr: 'Vert Royal', color_code: '#123624', size: 'M', sku: 'DJ-01-M-GR', stock_quantity: 8 },
      { id: 'v-01-l-gr', color_name_ar: 'أخضر ملكي', color_name_fr: 'Vert Royal', color_code: '#123624', size: 'L', sku: 'DJ-01-L-GR', stock_quantity: 12 },
      { id: 'v-01-xl-gr', color_name_ar: 'أخضر ملكي', color_name_fr: 'Vert Royal', color_code: '#123624', size: 'XL', sku: 'DJ-01-XL-GR', stock_quantity: 6 },
      { id: 'v-01-xxl-gr', color_name_ar: 'أخضر ملكي', color_name_fr: 'Vert Royal', color_code: '#123624', size: 'XXL', sku: 'DJ-01-XXL-GR', stock_quantity: 4 },
      { id: 'v-01-l-cr', color_name_ar: 'بيج كريمي', color_name_fr: 'Beige Crème', color_code: '#F2ECE1', size: 'L', sku: 'DJ-01-L-CR', stock_quantity: 7 },
      { id: 'v-01-xl-cr', color_name_ar: 'بيج كريمي', color_name_fr: 'Beige Crème', color_code: '#F2ECE1', size: 'XL', sku: 'DJ-01-XL-CR', stock_quantity: 5 },
    ],
    is_active: true,
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: true,
    tags: ['جلابة رجالية', 'مخزنية', 'أخضر ملكي', 'خياطة المعلم'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    slug: 'djellaba-ouazzania-laine-blanche',
    name_ar: 'جلابة وزانية صوفية بيضاء أصيلة',
    name_fr: 'Djellaba Ouazzania Pure Laine Blanc',
    description_ar:
      'جلابة وزانية أصيلة مصنوعة من الصوف الطبيعي الخالص 100% المنسوج على النول اليدوي بمدينة وزان العريقة. دافئة وخفيفة الوزن في آن واحد مع خياطة بالضفيرة والعقاد العريضة. رمز الهيبة والوقار المغربي الأصيل، مريحة وتدوم لسنوات طويلة دون أن تفقد رونقها.',
    description_fr:
      "Véritable djellaba ouazzania en pure laine vierge tissée à la main sur les métiers traditionnels de la cité spirituelle d'Ouezzane.",
    regular_price: 1450,
    discounted_price: 1190,
    category_id: 'cat-men-djellaba',
    sku: 'DJ-OUAZ-02-WHT',
    main_image: LOCAL_ASSETS.whiteDjellaba,
    additional_images: [
      LOCAL_ASSETS.menDjellaba,
      LOCAL_ASSETS.hero,
    ],
    fabric: 'صوف وزاني طبيعي خالص 100% غزل يدوي',
    craftsmanship: 'نسيج يدوي بالمرمة التقليدية وخياطة بالضفيرة والعقاد العريضة',
    care_instructions:
      'تنظيف جاف فقط للحفاظ على الصوف الطبيعي. يُحفظ في مكان جيد التهوية مع كرات الخزامى الطبيعية.',
    specifications: [
      { label: 'القصة', value: 'جلابة مغربية أصيلة مع قُب متسع' },
      { label: 'نوع الصوف', value: 'صوف وزاني بكر 100%' },
      { label: 'الوزن', value: 'متوسط الدفء خفيف ومريح على الأكتاف' },
      { label: 'المنشأ', value: 'مدينة وزان - دار الضمانة' },
    ],
    shipping_info: 'توصيل مجاني وسريع لكافة مدن المغرب خلال 24-48 ساعة.',
    return_policy: 'استبدال المقاس متاح ومضمون خلال 7 أيام.',
    related_product_ids: ['prod-001', 'prod-005', 'prod-006'],
    seo_title: 'جلابة وزانية صوفية بيضاء أصلية | الأصالة المغربية',
    seo_description:
      'جلابة وزانية مغربية من الصوف الطبيعي الأبيض الخالص، نسج وخياطة يدوية فاخرة مع الدفع عند الاستلام.',
    variants: [
      { id: 'v-02-m-wh', color_name_ar: 'أبيض ناصع', color_name_fr: 'Blanc', color_code: '#FFFFFF', size: 'M', sku: 'DJ-02-M-WH', stock_quantity: 5 },
      { id: 'v-02-l-wh', color_name_ar: 'أبيض ناصع', color_name_fr: 'Blanc', color_code: '#FFFFFF', size: 'L', sku: 'DJ-02-L-WH', stock_quantity: 9 },
      { id: 'v-02-xl-wh', color_name_ar: 'أبيض ناصع', color_name_fr: 'Blanc', color_code: '#FFFFFF', size: 'XL', sku: 'DJ-02-XL-WH', stock_quantity: 11 },
      { id: 'v-02-xxl-wh', color_name_ar: 'أبيض ناصع', color_name_fr: 'Blanc', color_code: '#FFFFFF', size: 'XXL', sku: 'DJ-02-XXL-WH', stock_quantity: 3 },
    ],
    is_active: true,
    is_featured: true,
    is_new_arrival: false,
    is_best_seller: true,
    tags: ['جلابة وزانية', 'صوف طبيعي', 'أبيض ملكي'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    slug: 'caftan-marocain-soie-dore',
    name_ar: 'جلابة وقفطان نسائي مطرز بصقلي ذهبي',
    name_fr: 'Caftan & Djellaba Femme Brodé Or',
    description_ar:
      'قطعة نسائية فاخرة للمناسبات والأعراس من المخمل والحرير الطبيعي الخالص مع تطريز نطع فاسي أصيل بخيوط الصقلي الذهبي المقاوم للأكسدة. مزينة بعقاد حريرية رقيقة تبرز الأناقة المغربية برقي لا مثيل له.',
    description_fr:
      'Caftan & Djellaba haute couture marocaine en soie et velours, richement brodé de fil doré Sqalli résistant.',
    regular_price: 2400,
    discounted_price: 1890,
    category_id: 'cat-women-djellaba',
    sku: 'CAF-ROY-03-GLD',
    main_image: LOCAL_ASSETS.womenKaftan,
    additional_images: [
      LOCAL_ASSETS.hero,
    ],
    fabric: 'حرير ساتان ومخمل إيطالي عالي النعومة',
    craftsmanship: 'طرز النطع الفاسي اليدوي بصقلي حر وعقاد مذهبة',
    care_instructions: 'تنظيف جاف متخصص فقط (Dry Clean Only). عدم رش العطور مباشرة على خيوط الصقلي.',
    specifications: [
      { label: 'النوع', value: 'جلابة وقفطان مناسبات ملكي' },
      { label: 'التطريز', value: 'طرز النطع والصقلي الذهبي الحر المقاوم' },
      { label: 'بلد الصنع', value: 'المملكة المغربية - فاس ومراكش' },
    ],
    shipping_info: 'شحن مجاني مميز في علبة فاخرة تحمي القطعة وتطريزها خلال 24-48 ساعة.',
    return_policy: 'استبدال المقاس متاح ومضمون خلال 7 أيام.',
    related_product_ids: ['prod-001', 'prod-004'],
    seo_title: 'جلابة وقفطان مغربي ملكي مطرز بصقلي ذهبي | الأصالة المغربية',
    seo_description: 'قفطان وجلابة مغربية أصلية حرير ومطرز بصقلي ذهبي ناعم للأعراس والمناسبات الكبرى.',
    variants: [
      { id: 'v-03-m-gd', color_name_ar: 'عنابي مع ذهبي', color_name_fr: 'Bordeaux Doré', color_code: '#6E1D2A', size: 'M', sku: 'CAF-03-M-GD', stock_quantity: 4 },
      { id: 'v-03-l-gd', color_name_ar: 'عنابي مع ذهبي', color_name_fr: 'Bordeaux Doré', color_code: '#6E1D2A', size: 'L', sku: 'CAF-03-L-GD', stock_quantity: 6 },
      { id: 'v-03-xl-gd', color_name_ar: 'عنابي مع ذهبي', color_name_fr: 'Bordeaux Doré', color_code: '#6E1D2A', size: 'XL', sku: 'CAF-03-XL-GD', stock_quantity: 3 },
      { id: 'v-03-l-bl', color_name_ar: 'أزرق ملكي مذهب', color_name_fr: 'Bleu Royal Doré', color_code: '#1E3A8A', size: 'L', sku: 'CAF-03-L-BL', stock_quantity: 5 },
    ],
    is_active: true,
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: true,
    tags: ['قفطان مغربي', 'جلابة نسائية', 'صقلي ذهبي', 'حرير'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-004',
    slug: 'gandoura-marocaine-royale-bleu',
    name_ar: 'كاندورة مغربية فاسية زرقاء مطرزة',
    name_fr: 'Gandoura Marocaine Homme Bleu Roi',
    description_ar:
      'كاندورة مريحة وفاخرة من الكتان الطبيعي عالي الجودة مع تطريز فاسي دقيق حول الياقة والصدر بخيوط حريرية مذهبة متناسقة. تصميم خفيف وبارد يوفر الراحة التامة في المناسبات العائلية، الأيام الصيفية، وصلاة الجمعة.',
    description_fr:
      "Gandoura marocaine pour homme en pur lin respirant avec broderies raffinées à l'encolure.",
    regular_price: 750,
    discounted_price: 680,
    category_id: 'cat-gandoura',
    sku: 'GAN-ROY-04-BLU',
    main_image: LOCAL_ASSETS.gandouraNavy,
    additional_images: [
      LOCAL_ASSETS.whiteDjellaba,
    ],
    fabric: 'كتان طبيعي 100% معالج ضد الانكماش',
    craftsmanship: 'طرز فاسي ورباطي متقن وسفيفة رقيقة حول الصدر',
    care_instructions: 'غسيل يدوي أو في الغسالة بماء بارد (30 درجة). الكي بحرارة متوسطة.',
    specifications: [
      { label: 'النوع', value: 'كاندورة رجالية يومية ومناسباتية' },
      { label: 'القماش', value: 'كتان طبيعي بارد ومريح' },
      { label: 'الأكمام', value: 'كم تقليدي مريح' },
    ],
    shipping_info: 'توصيل سريع لكافة المدن خلال 24-48 ساعة.',
    return_policy: 'استبدال المقاس متوفر مجاناً خلال 7 أيام.',
    related_product_ids: ['prod-001', 'prod-006'],
    variants: [
      { id: 'v-04-m-bl', color_name_ar: 'أزرق نيلي', color_name_fr: 'Bleu Indigo', color_code: '#1E3A8A', size: 'M', sku: 'GAN-04-M-BL', stock_quantity: 10 },
      { id: 'v-04-l-bl', color_name_ar: 'أزرق نيلي', color_name_fr: 'Bleu Indigo', color_code: '#1E3A8A', size: 'L', sku: 'GAN-04-L-BL', stock_quantity: 14 },
      { id: 'v-04-xl-bl', color_name_ar: 'أزرق نيلي', color_name_fr: 'Bleu Indigo', color_code: '#1E3A8A', size: 'XL', sku: 'GAN-04-XL-BL', stock_quantity: 8 },
      { id: 'v-04-l-wh', color_name_ar: 'أبيض قطني', color_name_fr: 'Blanc Coton', color_code: '#FFFFFF', size: 'L', sku: 'GAN-04-L-WH', stock_quantity: 12 },
    ],
    is_active: true,
    is_featured: false,
    is_new_arrival: true,
    is_best_seller: false,
    tags: ['كاندورة', 'كتان', 'أزرق نيلي'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-005',
    slug: 'selham-marocain-royal-noir',
    name_ar: 'سلهام مغربي ملكي أسود بصوف فاخر',
    name_fr: 'Selham (Burnous) Royal Noir en Drap de Laine',
    description_ar:
      'السلهام المغربي الأصيل (البرنوس) من الصوف الأسود الملكي الكثيف، يلبس فوق الجلابة ليعطي وقاراً وهيبة استثنائية في حفلات الزفاف الرسمية والاستقبالات والمناسبات الوطنية المغربية.',
    description_fr:
      "Cape traditionnelle Selham (Burnous) en drap de laine noir d'une élégance incomparable pour les grands événements.",
    regular_price: 1800,
    discounted_price: 1490,
    category_id: 'cat-selham-access',
    sku: 'SEL-ROY-05-BLK',
    main_image: LOCAL_ASSETS.selhamBabouche,
    additional_images: [
      LOCAL_ASSETS.menDjellaba,
    ],
    fabric: 'صوف كشمير عالي الكثافة دافئ ومريح',
    craftsmanship: 'خياطة المعلم بالسفيفة العريضة والشوشة المبرومة باليد',
    care_instructions: 'تنظيف جاف فقط للحفاظ على كثافة الصوف وشوشة السلهام الحريرية.',
    specifications: [
      { label: 'النوع', value: 'سلهام (برنوس) ملكي رسمي' },
      { label: 'القماش', value: 'صوف كشمير أسود ممتاز' },
      { label: 'المقاس', value: 'مقاس موحد يغطي القامة بالكامل' },
    ],
    shipping_info: 'توصيل مجاني في علبة حماية راقية لجميع أنحاء المغرب.',
    return_policy: 'ضمان الاستبدال خلال 7 أيام.',
    related_product_ids: ['prod-001', 'prod-002', 'prod-006'],
    variants: [
      { id: 'v-05-std-bk', color_name_ar: 'أسود ملكي', color_name_fr: 'Noir Royal', color_code: '#111827', size: 'مقاس موحد (Standard)', sku: 'SEL-05-BK', stock_quantity: 6 },
      { id: 'v-05-std-wh', color_name_ar: 'أبيض سكري', color_name_fr: 'Blanc Cassé', color_code: '#F9FAFB', size: 'مقاس موحد (Standard)', sku: 'SEL-05-WH', stock_quantity: 7 },
    ],
    is_active: true,
    is_featured: true,
    is_new_arrival: false,
    is_best_seller: false,
    tags: ['سلهام', 'برنوس', 'أسود ملكي', 'صوف كشمير'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-006',
    slug: 'tarbouche-fassi-cuir-babouche',
    name_ar: 'طقم بلغة فاس الجلدية الأصلية مع طربوش وطني',
    name_fr: 'Ensemble Babouche Fassi Cuir & Tarbouche',
    description_ar:
      'طقم تقليدي متكامل يضم بلغة فاسية من الجلد الطبيعي المدبوغ يدوياً في مدابغ دار الدباغ بفاس العريقة مع نقش دقيق، وطربوش وطني أحمر مزين بشرابة حريرية سوداء تكتمل بهما أناقة الجلابة المغربية.',
    description_fr:
      'Ensemble traditionnel comprenant babouches en cuir véritable faites main à Fès et tarbouche national brodé.',
    regular_price: 490,
    discounted_price: 380,
    category_id: 'cat-selham-access',
    sku: 'ACC-FAS-06-SET',
    main_image: LOCAL_ASSETS.selhamBabouche,
    additional_images: [
      LOCAL_ASSETS.whiteDjellaba,
    ],
    fabric: 'جلد ماعز طبيعي مدبوغ تقليدياً 100%',
    craftsmanship: 'صناعة ودباغة يدوية أصيلة بدار الدباغ بفاس',
    care_instructions: 'مسح بقطعة قماش ناعمة ومرهم ترطيب الجلد الطبيعي.',
    specifications: [
      { label: 'المحتويات', value: 'زوج بلغة فاسية + طربوش وطني أحمر' },
      { label: 'المادة', value: 'جلد طبيعي مغربي 100%' },
      { label: 'اللون', value: 'أصفر فاسي أصيل (Ziwani)' },
    ],
    shipping_info: 'توصيل سريع لكافة المدن.',
    return_policy: 'استبدال المقاس متوفر مجاناً.',
    related_product_ids: ['prod-001', 'prod-002', 'prod-004'],
    variants: [
      { id: 'v-06-41-yl', color_name_ar: 'أصفر فاسي تقليدي', color_name_fr: 'Jaune Fassi', color_code: '#EAB308', size: '41', sku: 'BAB-41-YL', stock_quantity: 8 },
      { id: 'v-06-42-yl', color_name_ar: 'أصفر فاسي تقليدي', color_name_fr: 'Jaune Fassi', color_code: '#EAB308', size: '42', sku: 'BAB-42-YL', stock_quantity: 12 },
      { id: 'v-06-43-yl', color_name_ar: 'أصفر فاسي تقليدي', color_name_fr: 'Jaune Fassi', color_code: '#EAB308', size: '43', sku: 'BAB-43-YL', stock_quantity: 9 },
      { id: 'v-06-44-yl', color_name_ar: 'أصفر فاسي تقليدي', color_name_fr: 'Jaune Fassi', color_code: '#EAB308', size: '44', sku: 'BAB-44-YL', stock_quantity: 5 },
    ],
    is_active: true,
    is_featured: false,
    is_new_arrival: true,
    is_best_seller: true,
    tags: ['بلغة فاسية', 'طربوش فاس', 'جلد طبيعي'],
    created_at: new Date().toISOString(),
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    product_id: 'prod-001',
    product_name_ar: 'جلابة مخزنية رجالية ملكية خضراء',
    customer_name: 'عمر التازي',
    customer_city: 'الدار البيضاء',
    rating: 5,
    comment:
      'تبارك الله على إتقان الخياطة وسفيفة المعلم! الجلابة وصلتني في يومين وقياسها مضبوط تماماً. القماش ممتاز والخياطة متقونة بزاف.',
    is_approved: true,
    admin_reply: 'شكراً جزيلاً سي عمر، شهادتكم وسام فخر لمعلمينا التقليديين بالأصالة المغربية.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'rev-02',
    product_id: 'prod-002',
    product_name_ar: 'جلابة وزانية صوفية بيضاء أصيلة',
    customer_name: 'الحاج إدريس السوسي',
    customer_city: 'مراكش',
    rating: 5,
    comment:
      'صوف وزاني حقيقي ودافئ جداً وناعم، الجلابة قمة في الوقار والهيبة. خدمة التوصيل والدفع عند الاستلام مريحة ومحترمة.',
    is_approved: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'rev-03',
    product_id: 'prod-003',
    product_name_ar: 'جلابة وقفطان نسائي مطرز بصقلي ذهبي',
    customer_name: 'لالة مريم العلمي',
    customer_city: 'الرباط',
    rating: 5,
    comment:
      'القفطان أكثر من رائع في الواقع! الصقلي بيور ويلمع بأناقة راقية جداً ولبسته في عرس أخي ونال إعجاب الجميع. شكراً لكم.',
    is_approved: true,
    admin_reply: 'بالصحة والراحة لالة مريم، مبارك مسعود.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-01',
    name: 'كريم البودالي',
    phone: '0661984521',
    email: 'karim.b@gmail.com',
    subject: 'استفسار عن إمكانية خياطة جلابة بقياسات خاصة',
    message:
      'السلام عليكم ورحمة الله، هل يمكن تفصيل جلابة مخزنية خضراء بقياس طول خاص (1.92 متر)؟ وما هي المدة المطلوبة للتوصيل؟ شكراً جزيلاً.',
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

function safeJsonParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

export class StoreDatabase {
  private sqlite: DatabaseSync;
  private dbPath: string;

  constructor(customDbPath?: string) {
    const preferredPath = customDbPath || process.env.SQLITE_DB_PATH || SQLITE_FILE;
    this.dbPath = this.resolveWritableDbPath(preferredPath, Boolean(customDbPath));
    this.sqlite = new DatabaseSync(this.dbPath);
    this.initSchema();
    this.seedOrMigrate(Boolean(customDbPath));
  }

  private resolveWritableDbPath(preferredPath: string, isExplicitCustomPath: boolean): string {
    try {
      const dir = path.dirname(preferredPath);
      this.ensureDir(dir);
      fs.accessSync(dir, fs.constants.W_OK);
      return preferredPath;
    } catch (err) {
      if (isExplicitCustomPath) {
        throw err;
      }
      const fallbackDir = path.join(os.tmpdir(), 'dar-al-maghribia-data');
      this.ensureDir(fallbackDir);
      console.warn(
        `[StoreDatabase] Data directory not writable (${preferredPath}); falling back to ${fallbackDir}`
      );
      return path.join(fallbackDir, 'store.db');
    }
  }

  private ensureDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private initSchema() {
    this.sqlite.exec(`
      PRAGMA busy_timeout = 5000;
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admin_sessions (
        token TEXT PRIMARY KEY,
        admin_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        name_ar TEXT NOT NULL,
        name_fr TEXT NOT NULL,
        description_ar TEXT NOT NULL,
        image_url TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        name_ar TEXT NOT NULL,
        name_fr TEXT,
        description_ar TEXT NOT NULL,
        description_fr TEXT,
        regular_price REAL NOT NULL,
        discounted_price REAL,
        category_id TEXT NOT NULL,
        sku TEXT NOT NULL,
        main_image TEXT NOT NULL,
        additional_images TEXT NOT NULL,
        variants TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        is_featured INTEGER NOT NULL DEFAULT 0,
        is_new_arrival INTEGER NOT NULL DEFAULT 0,
        is_best_seller INTEGER NOT NULL DEFAULT 0,
        tags TEXT NOT NULL,
        fabric TEXT,
        craftsmanship TEXT,
        care_instructions TEXT,
        specifications TEXT NOT NULL,
        shipping_info TEXT,
        return_policy TEXT,
        video_url TEXT,
        related_product_ids TEXT NOT NULL,
        seo_title TEXT,
        seo_description TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        address_line TEXT NOT NULL,
        region_id TEXT NOT NULL,
        province_id TEXT NOT NULL,
        commune_id TEXT NOT NULL,
        locality_id TEXT,
        region_name_ar TEXT NOT NULL,
        province_name_ar TEXT NOT NULL,
        commune_name_ar TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        order_status TEXT NOT NULL,
        subtotal REAL NOT NULL,
        shipping_cost REAL NOT NULL,
        discount_amount REAL NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL,
        items TEXT NOT NULL,
        internal_notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        product_name_ar TEXT,
        customer_name TEXT NOT NULL,
        customer_city TEXT,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        is_approved INTEGER NOT NULL DEFAULT 0,
        admin_reply TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0,
        admin_reply TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS media_files (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        data BLOB NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  private seedOrMigrate(skipLegacyFile: boolean) {
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      const adminCountRow = this.sqlite.prepare('SELECT COUNT(*) as cnt FROM admins').get() as { cnt: number };
      if (adminCountRow.cnt === 0) {
        const initialUsername = (process.env.ADMIN_USERNAME || 'admin').trim();
        const initialPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const { salt, hash } = hashPassword(initialPassword);
        this.sqlite
          .prepare(
            'INSERT OR IGNORE INTO admins (id, username, name, role, password_salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
          )
          .run('admin-01', initialUsername, 'المدير العام للمتجر', 'super_admin', salt, hash, new Date().toISOString());
      }

    const catCountRow = this.sqlite.prepare('SELECT COUNT(*) as cnt FROM categories').get() as { cnt: number };
    if (catCountRow.cnt === 0) {
      let legacy: any = null;
      if (!skipLegacyFile && fs.existsSync(LEGACY_JSON_FILE)) {
        try {
          legacy = JSON.parse(fs.readFileSync(LEGACY_JSON_FILE, 'utf-8'));
        } catch {
          legacy = null;
        }
      }

      const fallbackByCat: Record<string, string> = {
        'cat-men-djellaba': LOCAL_ASSETS.menDjellaba,
        'cat-women-djellaba': LOCAL_ASSETS.womenKaftan,
        'cat-gandoura': LOCAL_ASSETS.gandouraNavy,
        'cat-selham-access': LOCAL_ASSETS.selhamBabouche,
      };

      const categoriesToInsert: Category[] = (legacy?.categories || INITIAL_CATEGORIES).map((c: Category, idx: number) => ({
        ...c,
        image_url: sanitizeImageUrl(c.image_url, fallbackByCat[c.id] || LOCAL_ASSETS.menDjellaba),
        display_order: c.display_order ?? idx + 1,
        is_active: c.is_active ?? true,
      }));
      for (const c of categoriesToInsert) {
        this.insertCategoryRow(c);
      }

      const fallbackByProd: Record<string, string> = {
        'prod-001': LOCAL_ASSETS.menDjellaba,
        'prod-002': LOCAL_ASSETS.whiteDjellaba,
        'prod-003': LOCAL_ASSETS.womenKaftan,
        'prod-004': LOCAL_ASSETS.gandouraNavy,
        'prod-005': LOCAL_ASSETS.selhamBabouche,
        'prod-006': LOCAL_ASSETS.selhamBabouche,
      };

      const productsToInsert: Product[] = (legacy?.products || INITIAL_PRODUCTS).map((p: Product) => {
        const init = INITIAL_PRODUCTS.find(i => i.id === p.id);
        const mainImg = sanitizeImageUrl(p.main_image, fallbackByProd[p.id] || LOCAL_ASSETS.menDjellaba);
        const addImgsRaw: string[] =
          p.additional_images && p.additional_images.length > 0
            ? p.additional_images
            : init?.additional_images || [];
        const addImgs = addImgsRaw
          .map(img => sanitizeImageUrl(img, ''))
          .filter(Boolean);
        const finalAddImgs =
          addImgs.length > 0 ? addImgs : init?.additional_images || [];

        return {
          ...init,
          ...p,
          main_image: mainImg,
          additional_images: finalAddImgs,
          specifications:
            p.specifications && p.specifications.length > 0
              ? p.specifications
              : init?.specifications || [],
          care_instructions: p.care_instructions || init?.care_instructions,
          shipping_info: p.shipping_info || init?.shipping_info,
          return_policy: p.return_policy || init?.return_policy,
        };
      });
      for (const p of productsToInsert) {
        this.insertProductRow(p);
      }

      const ordersToInsert: Order[] = legacy?.orders || [];
      for (const o of ordersToInsert) {
        this.insertOrderRow(o);
      }

      const reviewsToInsert: Review[] = legacy?.reviews || INITIAL_REVIEWS;
      for (const r of reviewsToInsert) {
        this.sqlite
          .prepare(
            'INSERT OR IGNORE INTO reviews (id, product_id, product_name_ar, customer_name, customer_city, rating, comment, is_approved, admin_reply, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
          .run(
            r.id,
            r.product_id,
            r.product_name_ar || null,
            r.customer_name,
            r.customer_city || null,
            r.rating,
            r.comment,
            r.is_approved ? 1 : 0,
            r.admin_reply || null,
            r.created_at
          );
      }

      const messagesToInsert: ContactMessage[] = legacy?.messages || INITIAL_MESSAGES;
      for (const m of messagesToInsert) {
        this.sqlite
          .prepare(
            'INSERT OR IGNORE INTO messages (id, name, phone, email, subject, message, is_read, admin_reply, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
          .run(
            m.id,
            m.name,
            m.phone,
            m.email || null,
            m.subject,
            m.message,
            m.is_read ? 1 : 0,
            m.admin_reply || null,
            m.created_at
          );
      }

      const legacySettings = legacy?.settings || {};
      const mergedSettings: HomepageSettings = {
        ...DEFAULT_SETTINGS,
        ...legacySettings,
        hero_image_url: sanitizeImageUrl(legacySettings.hero_image_url, LOCAL_ASSETS.hero),
      };
      this.sqlite.prepare('INSERT OR REPLACE INTO settings (id, data) VALUES (1, ?)').run(JSON.stringify(mergedSettings));
    }

      const settingsRow = this.sqlite.prepare('SELECT data FROM settings WHERE id = 1').get() as { data: string } | undefined;
      if (!settingsRow) {
        this.sqlite.prepare('INSERT OR IGNORE INTO settings (id, data) VALUES (1, ?)').run(JSON.stringify(DEFAULT_SETTINGS));
      } else {
        const parsed = safeJsonParse<Record<string, any>>(settingsRow.data, {});
        let dirty = false;
        if (parsed.promo_banner_title_ar === 'عروض الموسم التقليدي') {
          parsed.promo_banner_title_ar = DEFAULT_SETTINGS.promo_banner_title_ar;
          dirty = true;
        }
        if (parsed.promo_banner_discount === 'خصم 25%') {
          parsed.promo_banner_discount = DEFAULT_SETTINGS.promo_banner_discount;
          dirty = true;
        }
        if (
          typeof parsed.promo_banner_text_ar === 'string' &&
          parsed.promo_banner_text_ar.includes('تخفيضات حصرية تصل إلى 25%')
        ) {
          parsed.promo_banner_text_ar = DEFAULT_SETTINGS.promo_banner_text_ar;
          dirty = true;
        }
        if (!parsed.promo_banner_image_url) {
          parsed.promo_banner_image_url = DEFAULT_SETTINGS.promo_banner_image_url;
          dirty = true;
        }
        if (!parsed.theme_primary_color) {
          parsed.theme_primary_color = DEFAULT_SETTINGS.theme_primary_color;
          parsed.theme_accent_color = DEFAULT_SETTINGS.theme_accent_color;
          parsed.theme_bg_color = DEFAULT_SETTINGS.theme_bg_color;
          parsed.theme_dark_color = DEFAULT_SETTINGS.theme_dark_color;
          dirty = true;
        }
        if (typeof parsed.announcement_bar_ar === 'string' && parsed.announcement_bar_ar.includes('✨')) {
          parsed.announcement_bar_ar = DEFAULT_SETTINGS.announcement_bar_ar;
          dirty = true;
        }
        if (dirty) {
          this.sqlite
            .prepare('UPDATE settings SET data = ? WHERE id = 1')
            .run(JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed }));
        }
      }
      this.sqlite.exec('COMMIT');
    } catch (err) {
      this.sqlite.exec('ROLLBACK');
      throw err;
    }
  }

  private mapProductRow(row: any): Product {
    return {
      id: row.id,
      slug: row.slug,
      name_ar: row.name_ar,
      name_fr: row.name_fr || undefined,
      description_ar: row.description_ar,
      description_fr: row.description_fr || undefined,
      regular_price: Number(row.regular_price),
      discounted_price: row.discounted_price !== null && row.discounted_price !== undefined ? Number(row.discounted_price) : undefined,
      category_id: row.category_id,
      sku: row.sku,
      main_image: row.main_image,
      additional_images: safeJsonParse<string[]>(row.additional_images, []),
      variants: safeJsonParse(row.variants, []),
      is_active: Boolean(row.is_active),
      is_featured: Boolean(row.is_featured),
      is_new_arrival: Boolean(row.is_new_arrival),
      is_best_seller: Boolean(row.is_best_seller),
      tags: safeJsonParse<string[]>(row.tags, []),
      fabric: row.fabric || undefined,
      craftsmanship: row.craftsmanship || undefined,
      care_instructions: row.care_instructions || undefined,
      specifications: safeJsonParse(row.specifications, []),
      shipping_info: row.shipping_info || undefined,
      return_policy: row.return_policy || undefined,
      video_url: row.video_url || undefined,
      related_product_ids: safeJsonParse<string[]>(row.related_product_ids, []),
      seo_title: row.seo_title || undefined,
      seo_description: row.seo_description || undefined,
      created_at: row.created_at,
    };
  }

  private insertProductRow(p: Product) {
    this.sqlite
      .prepare(
        `INSERT OR REPLACE INTO products (
          id, slug, name_ar, name_fr, description_ar, description_fr,
          regular_price, discounted_price, category_id, sku,
          main_image, additional_images, variants,
          is_active, is_featured, is_new_arrival, is_best_seller,
          tags, fabric, craftsmanship, care_instructions, specifications,
          shipping_info, return_policy, video_url, related_product_ids,
          seo_title, seo_description, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        p.id,
        p.slug,
        p.name_ar,
        p.name_fr || null,
        p.description_ar,
        p.description_fr || null,
        p.regular_price,
        p.discounted_price ?? null,
        p.category_id,
        p.sku,
        p.main_image,
        JSON.stringify(p.additional_images || []),
        JSON.stringify(p.variants || []),
        p.is_active ? 1 : 0,
        p.is_featured ? 1 : 0,
        p.is_new_arrival ? 1 : 0,
        p.is_best_seller ? 1 : 0,
        JSON.stringify(p.tags || []),
        p.fabric || null,
        p.craftsmanship || null,
        p.care_instructions || null,
        JSON.stringify(p.specifications || []),
        p.shipping_info || null,
        p.return_policy || null,
        p.video_url || null,
        JSON.stringify(p.related_product_ids || []),
        p.seo_title || null,
        p.seo_description || null,
        p.created_at
      );
  }

  private insertCategoryRow(c: Category) {
    this.sqlite
      .prepare(
        `INSERT OR REPLACE INTO categories (
          id, slug, name_ar, name_fr, description_ar, image_url, display_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        c.id,
        c.slug,
        c.name_ar,
        c.name_fr,
        c.description_ar,
        c.image_url,
        c.display_order,
        c.is_active ? 1 : 0
      );
  }

  private insertOrderRow(o: Order) {
    this.sqlite
      .prepare(
        `INSERT OR REPLACE INTO orders (
          id, order_number, customer_name, customer_phone, customer_email,
          address_line, region_id, province_id, commune_id, locality_id,
          region_name_ar, province_name_ar, commune_name_ar,
          payment_method, payment_status, order_status,
          subtotal, shipping_cost, discount_amount, total_amount,
          items, internal_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        o.id,
        o.order_number,
        o.customer_name,
        o.customer_phone,
        o.customer_email || null,
        o.address_line,
        o.region_id,
        o.province_id,
        o.commune_id,
        o.locality_id || null,
        o.region_name_ar,
        o.province_name_ar,
        o.commune_name_ar,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.subtotal,
        o.shipping_cost,
        o.discount_amount,
        o.total_amount,
        JSON.stringify(o.items || []),
        o.internal_notes || '',
        o.created_at,
        o.updated_at
      );
  }

  private mapOrderRow(row: any): Order {
    return {
      id: row.id,
      order_number: row.order_number,
      customer_name: row.customer_name,
      customer_phone: row.customer_phone,
      customer_email: row.customer_email || undefined,
      address_line: row.address_line,
      region_id: row.region_id,
      province_id: row.province_id,
      commune_id: row.commune_id,
      locality_id: row.locality_id || undefined,
      region_name_ar: row.region_name_ar,
      province_name_ar: row.province_name_ar,
      commune_name_ar: row.commune_name_ar,
      payment_method: row.payment_method,
      payment_status: row.payment_status,
      order_status: row.order_status,
      subtotal: Number(row.subtotal),
      shipping_cost: Number(row.shipping_cost),
      discount_amount: Number(row.discount_amount || 0),
      total_amount: Number(row.total_amount),
      items: safeJsonParse(row.items, []),
      internal_notes: row.internal_notes || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  // --- Products ---
  getProducts(): Product[] {
    const rows = this.sqlite.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    return rows.map(r => this.mapProductRow(r));
  }

  getProductById(id: string): Product | undefined {
    const row = this.sqlite.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return row ? this.mapProductRow(row) : undefined;
  }

  getProductBySlug(slug: string): Product | undefined {
    const row = this.sqlite.prepare('SELECT * FROM products WHERE slug = ?').get(slug);
    return row ? this.mapProductRow(row) : undefined;
  }

  saveProduct(productData: Partial<Product> & { name_ar: string; regular_price: number }): Product {
    const existing = productData.id ? this.getProductById(productData.id) : undefined;
    const sanitizedDesc =
      productData.description_ar !== undefined
        ? sanitizeProductHtml(productData.description_ar)
        : undefined;

    if (existing) {
      const requestedSlug =
        productData.slug !== undefined
          ? productData.slug.trim().replace(/\s+/g, '-') || slugifyProductName(productData.name_ar)
          : existing.slug;
      const conflict = this.getProductBySlug(requestedSlug);
      const safeSlug =
        conflict && conflict.id !== existing.id
          ? `${requestedSlug}-${Date.now().toString().slice(-4)}`
          : requestedSlug;

      const updated: Product = {
        ...existing,
        ...productData,
        slug: safeSlug,
        description_ar: sanitizedDesc !== undefined ? sanitizedDesc : existing.description_ar,
        regular_price: Number(productData.regular_price),
        discounted_price:
          productData.discounted_price !== undefined && productData.discounted_price !== null
            ? Number(productData.discounted_price)
            : undefined,
      };
      this.insertProductRow(updated);
      return updated;
    }

    const categories = this.getCategories(true);
    const slugBase =
      (productData.slug || slugifyProductName(productData.name_ar) || `prod-${Date.now()}`)
        .trim()
        .replace(/\s+/g, '-') || `prod-${Date.now()}`;
    const slugConflict = this.getProductBySlug(slugBase);
    const uniqueSlug = slugConflict ? `${slugBase}-${Date.now().toString().slice(-4)}` : slugBase;

    const newProduct: Product = {
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slug: uniqueSlug,
      name_ar: productData.name_ar,
      name_fr: productData.name_fr || '',
      description_ar: sanitizedDesc || '',
      description_fr: productData.description_fr || '',
      regular_price: Number(productData.regular_price),
      discounted_price: productData.discounted_price ? Number(productData.discounted_price) : undefined,
      category_id: productData.category_id || (categories[0]?.id ?? 'cat-men-djellaba'),
      sku: productData.sku || `SKU-${Date.now()}`,
      main_image: productData.main_image || LOCAL_ASSETS.menDjellaba,
      additional_images: productData.additional_images || [],
      variants:
        productData.variants && productData.variants.length > 0
          ? productData.variants
          : [
              {
                id: `v-${Date.now()}-1`,
                color_name_ar: 'أخضر ملكي',
                color_name_fr: 'Vert Royal',
                color_code: '#123624',
                size: 'L',
                sku: `${productData.sku || 'SKU'}-L`,
                stock_quantity: 10,
              },
            ],
      is_active: productData.is_active ?? true,
      is_featured: productData.is_featured ?? false,
      is_new_arrival: productData.is_new_arrival ?? true,
      is_best_seller: productData.is_best_seller ?? false,
      tags: productData.tags || [],
      fabric: productData.fabric,
      craftsmanship: productData.craftsmanship,
      care_instructions: productData.care_instructions,
      specifications: productData.specifications || [],
      shipping_info: productData.shipping_info,
      return_policy: productData.return_policy,
      video_url: productData.video_url,
      related_product_ids: productData.related_product_ids || [],
      seo_title: productData.seo_title,
      seo_description: productData.seo_description,
      created_at: new Date().toISOString(),
    };

    this.insertProductRow(newProduct);
    return newProduct;
  }

  deleteProduct(id: string): boolean {
    const info = this.sqlite.prepare('DELETE FROM products WHERE id = ?').run(id);
    return Number(info.changes) > 0;
  }

  // --- Categories ---
  getCategories(includeInactive: boolean = false): Category[] {
    const query = includeInactive
      ? 'SELECT * FROM categories ORDER BY display_order ASC, name_ar ASC'
      : 'SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC, name_ar ASC';
    const rows = this.sqlite.prepare(query).all();
    return rows.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      name_ar: r.name_ar,
      name_fr: r.name_fr,
      description_ar: r.description_ar,
      image_url: r.image_url,
      display_order: Number(r.display_order),
      is_active: Boolean(r.is_active),
    }));
  }

  getCategoryById(id: string): Category | undefined {
    const r: any = this.sqlite.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!r) return undefined;
    return {
      id: r.id,
      slug: r.slug,
      name_ar: r.name_ar,
      name_fr: r.name_fr,
      description_ar: r.description_ar,
      image_url: r.image_url,
      display_order: Number(r.display_order),
      is_active: Boolean(r.is_active),
    };
  }

  saveCategory(catData: Partial<Category> & { name_ar: string }): Category {
    const existing = catData.id ? this.getCategoryById(catData.id) : undefined;
    if (existing) {
      const updated: Category = {
        ...existing,
        ...catData,
        display_order: catData.display_order !== undefined ? Number(catData.display_order) : existing.display_order,
        is_active: catData.is_active !== undefined ? Boolean(catData.is_active) : existing.is_active,
      };
      this.insertCategoryRow(updated);
      return updated;
    }

    const existingCount = this.getCategories(true).length;
    const rawSlug = (catData.slug || `cat-${Date.now()}`).trim().replace(/\s+/g, '-');
    const slugExists = this.sqlite.prepare('SELECT id FROM categories WHERE slug = ?').get(rawSlug);
    const uniqueSlug = slugExists ? `${rawSlug}-${Date.now().toString().slice(-4)}` : rawSlug;

    const newCat: Category = {
      id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slug: uniqueSlug,
      name_ar: catData.name_ar.trim(),
      name_fr: (catData.name_fr || catData.name_ar).trim(),
      description_ar: (catData.description_ar || '').trim(),
      image_url: catData.image_url || LOCAL_ASSETS.menDjellaba,
      display_order: catData.display_order !== undefined ? Number(catData.display_order) : existingCount + 1,
      is_active: catData.is_active ?? true,
    };

    this.insertCategoryRow(newCat);
    return newCat;
  }

  deleteCategory(id: string): boolean {
    const info = this.sqlite.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return Number(info.changes) > 0;
  }

  // --- Orders & Atomic Stock Reservation ---
  getOrders(): Order[] {
    const rows = this.sqlite.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    return rows.map(r => this.mapOrderRow(r));
  }

  getOrderById(id: string): Order | undefined {
    const row = this.sqlite
      .prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?')
      .get(id, id);
    return row ? this.mapOrderRow(row) : undefined;
  }

  trackOrder(orderNumber: string, phone: string): Omit<Order, 'internal_notes' | 'customer_email'> | undefined {
    const cleanOrderNum = orderNumber.trim().toUpperCase();
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    if (!cleanOrderNum || digitsOnly.length < 8) return undefined;

    const row = this.sqlite
      .prepare('SELECT * FROM orders WHERE UPPER(order_number) = ?')
      .get(cleanOrderNum);
    if (!row) return undefined;

    const order = this.mapOrderRow(row);
    const storedDigits = order.customer_phone.replace(/[^0-9]/g, '');
    const inputTail = digitsOnly.slice(-9);
    const storedTail = storedDigits.slice(-9);
    if (!inputTail || inputTail !== storedTail) {
      return undefined;
    }

    const { internal_notes: _ignoredNotes, customer_email: _ignoredEmail, ...safeOrder } = order;
    return safeOrder;
  }

  createOrder(orderInput: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    address_line: string;
    region_id: string;
    province_id: string;
    commune_id: string;
    locality_id?: string;
    region_name_ar: string;
    province_name_ar: string;
    commune_name_ar: string;
    payment_method: 'COD' | 'ONLINE_CARD';
    items: { product_id: string; variant_id: string; quantity: number }[];
    internal_notes?: string;
  }): { success: boolean; order?: Order; error?: string } {
    if (!orderInput.items || orderInput.items.length === 0) {
      return { success: false, error: 'سلة المشتريات فارغة' };
    }

    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      const orderSnapshots = [];
      let calculatedSubtotal = 0;
      const updatedProductsMap = new Map<string, Product>();

      for (const itemReq of orderInput.items) {
        const qty = Number(itemReq.quantity);
        if (!Number.isInteger(qty) || qty <= 0) {
          this.sqlite.exec('ROLLBACK');
          return { success: false, error: 'كمية غير صالحة' };
        }

        const product = updatedProductsMap.get(itemReq.product_id) || this.getProductById(itemReq.product_id);
        if (!product || !product.is_active) {
          this.sqlite.exec('ROLLBACK');
          return { success: false, error: 'المنتج غير متاح حالياً' };
        }

        const variant = product.variants.find(v => v.id === itemReq.variant_id);
        if (!variant) {
          this.sqlite.exec('ROLLBACK');
          return {
            success: false,
            error: `المقاس أو اللون المطلوب في منتج (${product.name_ar}) غير متوفر`,
          };
        }

        if (variant.stock_quantity < qty) {
          this.sqlite.exec('ROLLBACK');
          return {
            success: false,
            error: `الكمية المطلوبة من (${product.name_ar} - ${variant.color_name_ar} ${variant.size}) غير كافية، المتبقي في المخزون: ${variant.stock_quantity} قطع`,
          };
        }

        const unitPrice = (product.discounted_price ?? product.regular_price) + (variant.additional_price || 0);
        const lineTotal = unitPrice * qty;
        calculatedSubtotal += lineTotal;

        variant.stock_quantity -= qty;
        updatedProductsMap.set(product.id, product);

        orderSnapshots.push({
          id: `snap-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          product_id: product.id,
          variant_id: variant.id,
          product_name: product.name_ar,
          color_name: variant.color_name_ar,
          size: variant.size,
          sku: variant.sku,
          unit_price: unitPrice,
          quantity: qty,
          total_price: lineTotal,
          image_url: product.main_image,
        });
      }

      const settings = this.getSettings();
      const isFreeShipping = calculatedSubtotal >= settings.free_shipping_threshold;
      const shippingCost = isFreeShipping ? 0 : settings.shipping_fee;
      const totalAmount = calculatedSubtotal + shippingCost;

      for (const updatedProd of updatedProductsMap.values()) {
        this.insertProductRow(updatedProd);
      }

      const year = new Date().getFullYear();
      const orderNumber = `DM-${year}-${Math.floor(1000 + Math.random() * 9000)}-${crypto.randomBytes(1).toString('hex').toUpperCase()}`;
      const now = new Date().toISOString();

      const newOrder: Order = {
        id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        order_number: orderNumber,
        customer_name: orderInput.customer_name.trim(),
        customer_phone: orderInput.customer_phone.trim(),
        customer_email: orderInput.customer_email?.trim(),
        address_line: orderInput.address_line.trim(),
        region_id: orderInput.region_id,
        province_id: orderInput.province_id,
        commune_id: orderInput.commune_id,
        locality_id: orderInput.locality_id,
        region_name_ar: orderInput.region_name_ar,
        province_name_ar: orderInput.province_name_ar,
        commune_name_ar: orderInput.commune_name_ar,
        payment_method: orderInput.payment_method,
        payment_status: orderInput.payment_method === 'ONLINE_CARD' ? 'PAID' : 'AWAITING_PAYMENT',
        order_status: 'PENDING',
        subtotal: calculatedSubtotal,
        shipping_cost: shippingCost,
        discount_amount: 0,
        total_amount: totalAmount,
        items: orderSnapshots,
        internal_notes: orderInput.internal_notes || '',
        created_at: now,
        updated_at: now,
      };

      this.insertOrderRow(newOrder);
      this.sqlite.exec('COMMIT');
      return { success: true, order: newOrder };
    } catch (err) {
      this.sqlite.exec('ROLLBACK');
      console.error('Order transaction error', err);
      return { success: false, error: 'تعذر تسجيل الطلب' };
    }
  }

  updateOrderStatus(
    orderId: string,
    updates: {
      order_status?: Order['order_status'];
      payment_status?: Order['payment_status'];
      internal_notes?: string;
    }
  ): Order | undefined {
    const order = this.getOrderById(orderId);
    if (!order) return undefined;

    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      if (updates.order_status === 'CANCELLED' && order.order_status !== 'CANCELLED') {
        for (const item of order.items) {
          const prod = this.getProductById(item.product_id);
          if (prod) {
            const variant = prod.variants.find(v => v.id === item.variant_id);
            if (variant) {
              variant.stock_quantity += item.quantity;
              this.insertProductRow(prod);
            }
          }
        }
      }

      if (updates.order_status) order.order_status = updates.order_status;
      if (updates.payment_status) order.payment_status = updates.payment_status;
      if (updates.internal_notes !== undefined) order.internal_notes = updates.internal_notes;
      order.updated_at = new Date().toISOString();

      this.insertOrderRow(order);
      this.sqlite.exec('COMMIT');
      return order;
    } catch (err) {
      this.sqlite.exec('ROLLBACK');
      console.error('Order status update error', err);
      return undefined;
    }
  }

  // --- Reviews ---
  getReviews(includeUnapproved: boolean = false): Review[] {
    const query = includeUnapproved
      ? 'SELECT * FROM reviews ORDER BY created_at DESC'
      : 'SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC';
    const rows = this.sqlite.prepare(query).all();
    return rows.map((r: any) => ({
      id: r.id,
      product_id: r.product_id,
      product_name_ar: r.product_name_ar || undefined,
      customer_name: r.customer_name,
      customer_city: r.customer_city || undefined,
      rating: Number(r.rating),
      comment: r.comment,
      is_approved: Boolean(r.is_approved),
      admin_reply: r.admin_reply || undefined,
      created_at: r.created_at,
    }));
  }

  addReview(reviewData: {
    product_id: string;
    customer_name: string;
    customer_city?: string;
    rating: number;
    comment: string;
  }): Review {
    const prod = this.getProductById(reviewData.product_id);
    const newRev: Review = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      product_id: reviewData.product_id,
      product_name_ar: prod ? prod.name_ar : 'منتج تقليدي',
      customer_name: reviewData.customer_name.trim(),
      customer_city: reviewData.customer_city?.trim() || 'المغرب',
      rating: Math.max(1, Math.min(5, Number(reviewData.rating) || 5)),
      comment: reviewData.comment.trim(),
      is_approved: false,
      created_at: new Date().toISOString(),
    };
    this.sqlite
      .prepare(
        'INSERT INTO reviews (id, product_id, product_name_ar, customer_name, customer_city, rating, comment, is_approved, admin_reply, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        newRev.id,
        newRev.product_id,
        newRev.product_name_ar || null,
        newRev.customer_name,
        newRev.customer_city || null,
        newRev.rating,
        newRev.comment,
        0,
        null,
        newRev.created_at
      );
    return newRev;
  }

  updateReview(id: string, updates: { is_approved?: boolean; admin_reply?: string }): Review | undefined {
    const existing: any = this.sqlite.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    if (!existing) return undefined;

    const nextApproved = updates.is_approved !== undefined ? (updates.is_approved ? 1 : 0) : existing.is_approved;
    const nextReply = updates.admin_reply !== undefined ? updates.admin_reply : existing.admin_reply;

    this.sqlite
      .prepare('UPDATE reviews SET is_approved = ?, admin_reply = ? WHERE id = ?')
      .run(nextApproved, nextReply, id);

    return {
      id: existing.id,
      product_id: existing.product_id,
      product_name_ar: existing.product_name_ar || undefined,
      customer_name: existing.customer_name,
      customer_city: existing.customer_city || undefined,
      rating: Number(existing.rating),
      comment: existing.comment,
      is_approved: Boolean(nextApproved),
      admin_reply: nextReply || undefined,
      created_at: existing.created_at,
    };
  }

  deleteReview(id: string): boolean {
    const info = this.sqlite.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    return Number(info.changes) > 0;
  }

  // --- Messages ---
  getMessages(): ContactMessage[] {
    const rows = this.sqlite.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    return rows.map((m: any) => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      email: m.email || undefined,
      subject: m.subject,
      message: m.message,
      is_read: Boolean(m.is_read),
      admin_reply: m.admin_reply || undefined,
      created_at: m.created_at,
    }));
  }

  addMessage(msgData: {
    name: string;
    phone: string;
    email?: string;
    subject: string;
    message: string;
  }): ContactMessage {
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: msgData.name.trim(),
      phone: msgData.phone.trim(),
      email: msgData.email?.trim(),
      subject: msgData.subject.trim(),
      message: msgData.message.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.sqlite
      .prepare(
        'INSERT INTO messages (id, name, phone, email, subject, message, is_read, admin_reply, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        newMsg.id,
        newMsg.name,
        newMsg.phone,
        newMsg.email || null,
        newMsg.subject,
        newMsg.message,
        0,
        null,
        newMsg.created_at
      );
    return newMsg;
  }

  updateMessage(id: string, updates: { is_read?: boolean; admin_reply?: string }): ContactMessage | undefined {
    const existing: any = this.sqlite.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    if (!existing) return undefined;

    const nextRead = updates.is_read !== undefined ? (updates.is_read ? 1 : 0) : existing.is_read;
    const nextReply = updates.admin_reply !== undefined ? updates.admin_reply : existing.admin_reply;
    this.sqlite
      .prepare('UPDATE messages SET is_read = ?, admin_reply = ? WHERE id = ?')
      .run(nextRead, nextReply, id);

    return {
      id: existing.id,
      name: existing.name,
      phone: existing.phone,
      email: existing.email || undefined,
      subject: existing.subject,
      message: existing.message,
      is_read: Boolean(nextRead),
      admin_reply: nextReply || undefined,
      created_at: existing.created_at,
    };
  }

  deleteMessage(id: string): boolean {
    const info = this.sqlite.prepare('DELETE FROM messages WHERE id = ?').run(id);
    return Number(info.changes) > 0;
  }

  // --- Settings ---
  getSettings(): HomepageSettings {
    const row = this.sqlite.prepare('SELECT data FROM settings WHERE id = 1').get() as { data: string } | undefined;
    if (!row) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...safeJsonParse(row.data, DEFAULT_SETTINGS) };
  }

  updateSettings(updates: Partial<HomepageSettings>): HomepageSettings {
    const merged = { ...this.getSettings(), ...updates };
    this.sqlite.prepare('INSERT OR REPLACE INTO settings (id, data) VALUES (1, ?)').run(JSON.stringify(merged));
    return merged;
  }

  // --- Direct Media File Storage (SQLite BLOB) ---
  saveMedia(params: { filename: string; mime_type: string; buffer: Buffer }): MediaFile {
    const id = `media-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const createdAt = new Date().toISOString();
    const safeFilename = path.basename(params.filename).slice(0, 120) || 'upload.bin';

    this.sqlite
      .prepare(
        'INSERT INTO media_files (id, filename, mime_type, size_bytes, data, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(id, safeFilename, params.mime_type, params.buffer.length, params.buffer, createdAt);

    return {
      id,
      filename: safeFilename,
      mime_type: params.mime_type,
      size_bytes: params.buffer.length,
      url: `/api/media/${id}`,
      created_at: createdAt,
    };
  }

  getMediaById(id: string): { id: string; filename: string; mime_type: string; size_bytes: number; data: Buffer; created_at: string } | undefined {
    const row: any = this.sqlite.prepare('SELECT * FROM media_files WHERE id = ?').get(id);
    if (!row) return undefined;
    return {
      id: row.id,
      filename: row.filename,
      mime_type: row.mime_type,
      size_bytes: Number(row.size_bytes),
      data: Buffer.from(row.data),
      created_at: row.created_at,
    };
  }

  listMedia(): MediaFile[] {
    const rows = this.sqlite
      .prepare('SELECT id, filename, mime_type, size_bytes, created_at FROM media_files ORDER BY created_at DESC')
      .all();
    return rows.map((r: any) => ({
      id: r.id,
      filename: r.filename,
      mime_type: r.mime_type,
      size_bytes: Number(r.size_bytes),
      url: `/api/media/${r.id}`,
      created_at: r.created_at,
    }));
  }

  deleteMedia(id: string): boolean {
    const info = this.sqlite.prepare('DELETE FROM media_files WHERE id = ?').run(id);
    return Number(info.changes) > 0;
  }

  // --- Admin Authentication & Secure Sessions ---
  verifyAdmin(username: string, passwordAttempt: string): AdminUser | null {
    if (!username || !passwordAttempt) return null;
    const row: any = this.sqlite
      .prepare('SELECT * FROM admins WHERE LOWER(username) = LOWER(?)')
      .get(username.trim());
    if (!row) return null;

    if (!verifyPasswordHash(passwordAttempt, row.password_salt, row.password_hash)) {
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      name: row.name,
      role: row.role,
      created_at: row.created_at,
    };
  }

  createAdminSession(adminId: string, ttlHours: number = 24): string {
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expires = new Date(now.getTime() + ttlHours * 3600 * 1000);
    // Clean expired sessions opportunistically
    this.sqlite.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').run(now.toISOString());
    this.sqlite
      .prepare('INSERT INTO admin_sessions (token, admin_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
      .run(token, adminId, expires.toISOString(), now.toISOString());
    return token;
  }

  verifySessionToken(token: string): AdminUser | null {
    if (!token) return null;
    const row: any = this.sqlite
      .prepare(
        `SELECT a.id, a.username, a.name, a.role, a.created_at, s.expires_at
         FROM admin_sessions s
         JOIN admins a ON a.id = s.admin_id
         WHERE s.token = ?`
      )
      .get(token);

    if (!row) return null;
    if (new Date(row.expires_at).getTime() <= Date.now()) {
      this.sqlite.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      name: row.name,
      role: row.role,
      created_at: row.created_at,
    };
  }

  deleteSessionToken(token: string): void {
    this.sqlite.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
  }

  updateAdminCredentials(
    adminId: string,
    currentPassword: string,
    newPassword: string,
    newUsername?: string
  ): { success: boolean; error?: string; user?: AdminUser } {
    const row: any = this.sqlite.prepare('SELECT * FROM admins WHERE id = ?').get(adminId);
    if (!row) return { success: false, error: 'الحساب غير موجود' };

    if (!verifyPasswordHash(currentPassword, row.password_salt, row.password_hash)) {
      return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
    }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل' };
    }

    const updatedUsername = newUsername && newUsername.trim().length >= 3 ? newUsername.trim() : row.username;
    const { salt, hash } = hashPassword(newPassword);

    this.sqlite
      .prepare('UPDATE admins SET username = ?, password_salt = ?, password_hash = ? WHERE id = ?')
      .run(updatedUsername, salt, hash, adminId);

    // Invalidate existing sessions for security
    this.sqlite.prepare('DELETE FROM admin_sessions WHERE admin_id = ?').run(adminId);

    return {
      success: true,
      user: {
        id: row.id,
        username: updatedUsername,
        name: row.name,
        role: row.role,
        created_at: row.created_at,
      },
    };
  }

  close() {
    this.sqlite.close();
  }
}

export const db = new StoreDatabase();
