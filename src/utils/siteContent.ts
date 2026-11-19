import type { HomepageSettings } from '../types/store.ts';

export const DEFAULT_SITE_CONTENT = {
  // Header & Brand
  header_made_in_text_ar: 'صنع في المغرب',
  header_tagline_ar: 'جلابيب تقليدية تعكس تراثنا',

  // Hero
  hero_title_ar: 'أناقة تراثية بروح مغربية',
  hero_subtitle_ar:
    'جلابيب وقفاطين تقليدية مصنوعة بشغف بأيدي أمهر المعلمين في فاس ومراكش لتعكس أصالة المغرب وجماله',
  hero_image_url: '/src/assets/images/hero_moroccan_couture_1794683049899.jpg',
  hero_cta_text_ar: 'تسوق الآن',
  hero_cta_link: '#products-section',
  announcement_bar_ar: 'توصيل مجاني لجميع الطلبيات | الدفع عند الاستلام | منتجات تقليدية أصلية 100%',

  // Store Benefits Strip (4 items)
  benefit_1_title_ar: 'الدفع عند الاستلام',
  benefit_1_subtitle_ar: 'آمن وموثوق',
  benefit_2_title_ar: 'توصيل مجاني',
  benefit_2_subtitle_ar: 'لجميع الطلبات فوق 500 د.م.',
  benefit_3_title_ar: 'صنع في المغرب',
  benefit_3_subtitle_ar: 'يدعم الصناعة المحلية',
  benefit_4_title_ar: 'منتجات تقليدية أصلية',
  benefit_4_subtitle_ar: 'جودة وخامة فاخرة',

  // Categories & Products Homepage Section
  category_cta_text_ar: 'تسوق الآن',
  products_section_title_ar: 'جديدنا والمختارات الملكية',
  products_section_subtitle_ar: 'اكتشف أحدث الموديلات المغربية الأصيلة بخياطة المعلم والسفيفة الحرة',
  products_section_cta_ar: 'عرض جميع المنتجات',

  // Editorial Promo / Showcase Banner
  promo_banner_active: true,
  promo_banner_title_ar: 'أناقة التراث بلمسة المعلم الفاسي',
  promo_banner_text_ar:
    'قطع منتقاة بعناية من القفاطين الملكية والجلابيب المخزنية، محاكة من صوف وزان الفاخر والحرير الطبيعي لتمنحك تميزاً يليق بمناسباتك.',
  promo_banner_discount: 'إصدار الحرفيين · الدار المغربية',
  promo_banner_image_url: '/src/assets/images/cat_women_kaftan_1794683051308.jpg',
  promo_pillar_1_title_ar: 'خياطة المعلم الأصيلة',
  promo_pillar_1_text_ar: 'سفيفة حريرية وعقاد مبرومة يدوياً في ورشاتنا بفاس ومراكش.',
  promo_pillar_2_title_ar: 'أقمشة مختارة ومعاينة قبل الدفع',
  promo_pillar_2_text_ar: 'صوف وزان وحرير طبيعي مع حق الفحص والاستبدال المجاني.',
  promo_cta_text_ar: 'اكتشف التشكيلة الكاملة',
  promo_delivery_note_ar: 'توصيل سريع إلى كافة مدن المملكة',

  // Customer Reviews Section
  reviews_badge_ar: 'تجارب حقيقية وموثقة',
  reviews_title_ar: 'ماذا يقول زبناؤنا الكرام؟',
  reviews_subtitle_ar: 'شهادات نعتز بها من مختلف عمالات وأقاليم المملكة المغربية',
  reviews_cta_ar: 'شاركنا رأيك وتجربتك',

  // Footer
  footer_about_text_ar:
    'علامة مغربية رائدة متخصصة في خياطة وتصميم الأزياء التقليدية الراقية. نحرص على صون التراث الأصيل بأيدي أمهر الصناع والمعلمين مع لمسات عصرية تناسب كل الأجيال.',
  footer_trust_badge_ar: 'جودة مضمونة وتوصيل موثوق إلى باب منزلك',
  footer_col_categories_title_ar: 'التشكيلات التقليدية',
  footer_col_pages_title_ar: 'صفحات المتجر والسياسات',
  footer_col_contact_title_ar: 'تواصل معنا',
  footer_copyright_suffix_ar: 'بالمملكة المغربية',

  // Standalone Page: About Us
  about_kicker_ar: 'قصتنا ورؤيتنا في الصناعة التقليدية',
  about_title_ar: 'إرث الخياطة المغربية الرفيعة',
  about_paragraph_1_ar:
    'انطلقت دارنا من شغف عميق بالحفاظ على أصالة اللباس المغربي التقليدي، حيث نجمع بين عراقة «خياطة المعلم» المتوارثة عبر الأجيال في فاس ومراكش والدار البيضاء، وبين قصّات متوازنة تلائم حضورك اليومي ومناسباتك الكبرى.',
  about_paragraph_2_ar:
    'رؤيتنا أن تكون لكل بيت مغربي قطعة تقليدية أصيلة تليق بمكانته، دون التنازل عن جودة النسيج أو دقة السفيفة، مع تجربة شراء إلكترونية واضحة وموثوقة تحترم الزبون المغربي.',
  about_why_title_ar: 'لماذا يثق زبناؤنا بالشراء منا؟',
  about_why_subtitle_ar:
    'أربعة التزامات ثابتة تضمن لك قطعة تقليدية تستحق الاقتناء وخدمة ما بعد البيع موثوقة.',
  about_image_1_url: '/src/assets/images/cat_men_djellaba_1794683050322.jpg',
  about_image_2_url: '/src/assets/images/cat_women_kaftan_1794683051308.jpg',

  // Standalone Page: Contact Us
  contact_kicker_ar: 'نحن في خدمتكم دائماً',
  contact_title_ar: 'تواصل مع الدار المغربية',
  contact_subtitle_ar:
    'يسعدنا الرد على استفساراتكم حول مقاسات الجلابيب، تفصيل القفاطين، مواعيد التوصيل، أو أي طلبات خاصة.',
  contact_whatsapp_note_ar: 'متواجدون للرد السريع 7/7 أيام',

  // Standalone Page: Return Policy
  return_policy_badge_ar: 'ضمان رضا الزبون 100%',
  return_policy_intro_ar:
    'نحرص على أن تصلك القطعة التقليدية بالمقاس والجودة التي ترضيك تماماً، لذلك نمنحك حق الاستبدال والاسترجاع بشروط واضحة وميسرة.',
  return_policy_cases_ar:
    'استلام مقاس مختلف عن المطلوب أو الرغبة في تغيير المقاس خلال 7 أيام من تاريخ التوصيل.\nوجود أي عيب مصنعي أو خلل في الخياطة أو السفيفة أو النسيج عند الفتح.\nاختلاف اللون أو الموديل عن القطعة المؤكدة في الطلب.',
  return_policy_conditions_ar:
    'تقديم طلب الاستبدال أو الإرجاع داخل أجل أقصاه 7 أيام من استلام الطرد.\nأن تكون القطعة في حالتها الأصلية (غير ملبوسة، غير مغسولة، وخالية من العطور أو التلف) ومرفقة بتغليفها الأصلي.\nالقطع المفصلة بناءً على قياسات خاصة بطلب من الزبون لا تخضع للإرجاع إلا في حالة وجود خطأ في التنفيذ.',
  return_policy_refund_ar:
    'في حالة الإرجاع للطلبات المؤداة نقداً عند الاستلام أو عبر البطاقة البنكية، يتم تحويل المبلغ عبر التحويل البنكي المغربي (RIB) أو رده عبر نفس وسيلة الدفع خلال يومي عمل من تأكيد استلام القطعة المرتجعة.',

  // Standalone Page: Privacy & Terms
  privacy_intro_ar:
    'الإطار القانوني لحماية معطياتكم الشخصية وتنظيم عمليات البيع والشراء داخل متجرنا.',
  privacy_body_ar:
    'تقتصر المعطيات التي نجمعها فقط على المعلومات الضرورية لتجهيز وتوصيل طلبك (الاسم الكامل، رقم الهاتف المغربي، الجهة والإقليم والجماعة، وعنوان التوصيل).\nلا يتم بيع أو تأجير أو مشاركة معلوماتك مع أي طرف ثالث لأغراض إعلانية؛ وتُمرر فقط لشريك التوصيل المعتمد لإيصال طردك.\nجميع عمليات الدفع الإلكتروني محمية بتشفير SSL ولا يحتفظ المتجر بأي أرقام بطاقات بنكية على خوادمه.\nيحق لك في أي وقت طلب تصحيح أو حذف بياناتك الشخصية بالتواصل معنا عبر البريد الإلكتروني.',
  terms_body_ar:
    'جميع الأسعار المعروضة في المتجر محددة بالدرهم المغربي (د.م. / MAD) وشاملة للرسوم، مع توضيح تكلفة التوصيل أو مجانيته قبل تأكيد الطلب.\nبعد تسجيل الطلب، يتواصل معك فريق المتجر هاتفياً أو عبر الواتساب لتأكيد المعطيات وموعد التسليم، ويتم الشحن خلال 24 إلى 48 ساعة حسب الجهة.\nعند اختيار الدفع عند الاستلام (COD)، يلتزم الزبون بتأكيد عنوانه ورقم هاتفه بشكل صحيح والالتزام باستلام الطرد في الموعد المتفق عليه.\nيمكن تعديل أو إلغاء أي طلب مجاناً قبل تسليمه لشركة التوصيل عبر صفحة تتبع الطلبات أو التواصل المباشر معنا.',
} as const;

export function resolveSiteText(value: string | undefined, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function splitMultilineItems(value: string | undefined, fallback: string): string[] {
  const source = resolveSiteText(value, fallback);
  return source
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

export function mergeWithDefaultSiteContent(
  settings: Partial<HomepageSettings> | undefined
): HomepageSettings {
  return {
    ...DEFAULT_SITE_CONTENT,
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
    ...(settings || {}),
  };
}
