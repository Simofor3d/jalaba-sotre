export interface ProductVariant {
  id: string;
  color_name_ar: string;
  color_name_fr: string;
  color_code: string;
  size: string;
  sku: string;
  stock_quantity: number;
  additional_price?: number;
}

export interface Product {
  id: string;
  slug: string;
  name_ar: string;
  name_fr?: string;
  description_ar: string;
  description_fr?: string;
  regular_price: number;
  discounted_price?: number;
  category_id: string;
  sku: string;
  main_image: string;
  additional_images: string[];
  variants: ProductVariant[];
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  tags: string[];
  fabric?: string;
  craftsmanship?: string;
  care_instructions?: string;
  specifications?: { label: string; value: string }[];
  shipping_info?: string;
  return_policy?: string;
  video_url?: string;
  related_product_ids?: string[];
  seo_title?: string;
  seo_description?: string;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name_ar: string;
  name_fr: string;
  description_ar: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface OrderItemSnapshot {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  color_name: string;
  size: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url: string;
}

export type OrderPaymentMethod = 'COD' | 'ONLINE_CARD';

export type OrderPaymentStatus = 'AWAITING_PAYMENT' | 'PAID' | 'FAILED' | 'REFUNDED';

export type OrderFulfillmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export interface Order {
  id: string;
  order_number: string;
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
  payment_method: OrderPaymentMethod;
  payment_status: OrderPaymentStatus;
  order_status: OrderFulfillmentStatus;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  items: OrderItemSnapshot[];
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  product_name_ar?: string;
  customer_name: string;
  customer_city?: string;
  rating: number; // 1-5
  comment: string;
  is_approved: boolean;
  admin_reply?: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  is_read: boolean;
  admin_reply?: string;
  created_at: string;
}

export interface HomepageSettings {
  // Header & Hero
  header_made_in_text_ar?: string;
  header_tagline_ar?: string;
  hero_title_ar: string;
  hero_subtitle_ar: string;
  hero_image_url: string;
  hero_cta_text_ar: string;
  hero_cta_link: string;
  announcement_bar_ar: string;

  // Store Benefits Strip (4 items)
  benefit_1_title_ar?: string;
  benefit_1_subtitle_ar?: string;
  benefit_2_title_ar?: string;
  benefit_2_subtitle_ar?: string;
  benefit_3_title_ar?: string;
  benefit_3_subtitle_ar?: string;
  benefit_4_title_ar?: string;
  benefit_4_subtitle_ar?: string;

  // Categories & Products Section
  category_cta_text_ar?: string;
  products_section_title_ar?: string;
  products_section_subtitle_ar?: string;
  products_section_cta_ar?: string;

  // Editorial Promo / Showcase Section
  promo_banner_active: boolean;
  promo_banner_title_ar: string;
  promo_banner_text_ar: string;
  promo_banner_discount: string;
  promo_banner_image_url?: string;
  promo_pillar_1_title_ar?: string;
  promo_pillar_1_text_ar?: string;
  promo_pillar_2_title_ar?: string;
  promo_pillar_2_text_ar?: string;
  promo_cta_text_ar?: string;
  promo_delivery_note_ar?: string;

  // Customer Reviews Section
  reviews_badge_ar?: string;
  reviews_title_ar?: string;
  reviews_subtitle_ar?: string;
  reviews_cta_ar?: string;

  // Footer
  footer_about_text_ar?: string;
  footer_trust_badge_ar?: string;
  footer_col_categories_title_ar?: string;
  footer_col_pages_title_ar?: string;
  footer_col_contact_title_ar?: string;
  footer_copyright_suffix_ar?: string;

  // Standalone Pages: About, Contact, Return Policy, Privacy & Terms
  about_kicker_ar?: string;
  about_title_ar?: string;
  about_paragraph_1_ar?: string;
  about_paragraph_2_ar?: string;
  about_why_title_ar?: string;
  about_why_subtitle_ar?: string;
  about_image_1_url?: string;
  about_image_2_url?: string;
  contact_kicker_ar?: string;
  contact_title_ar?: string;
  contact_subtitle_ar?: string;
  contact_whatsapp_note_ar?: string;
  return_policy_badge_ar?: string;
  return_policy_intro_ar?: string;
  return_policy_cases_ar?: string;
  return_policy_conditions_ar?: string;
  return_policy_refund_ar?: string;
  privacy_intro_ar?: string;
  privacy_body_ar?: string;
  terms_body_ar?: string;

  // Theme Colors
  theme_primary_color?: string;
  theme_accent_color?: string;
  theme_bg_color?: string;
  theme_dark_color?: string;

  // Core Store Settings
  store_name: string;
  store_phone: string;
  store_whatsapp: string;
  store_email: string;
  store_city: string;
  shipping_fee: number;
  free_shipping_threshold: number;
  enable_cod: boolean;
  enable_online_payment: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'super_admin' | 'manager';
  created_at: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  created_at: string;
}
