import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import {
  Product,
  Category,
  Order,
  Review,
  ContactMessage,
  HomepageSettings,
  OrderFulfillmentStatus,
  OrderPaymentStatus,
} from '../../types/store.ts';
import { formatMAD } from '../../utils/pricing.ts';
import {
  MOROCCAN_THEME_PRESETS,
  DEFAULT_THEME_COLORS,
  buildThemePalette,
  applyThemePaletteToRoot,
} from '../../utils/theme.ts';
import {
  DEFAULT_SITE_CONTENT,
  mergeWithDefaultSiteContent,
} from '../../utils/siteContent.ts';
import { ImageUploader } from './ImageUploader.tsx';
import { RichTextEditor } from './RichTextEditor.tsx';
import { AdminLoginPage } from './AdminLoginPage.tsx';
import { sanitizeProductHtml, slugifyProductName } from '../../utils/richText.ts';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Sliders,
  MessageSquare,
  Mail,
  Settings,
  LogOut,
  X,
  Search,
  CheckCircle,
  Clock,
  Printer,
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  TrendingUp,
  Save,
  RefreshCw,
  ExternalLink,
  Layers,
  ShieldCheck,
  KeyRound,
  Palette,
  Image as ImageIcon,
  RotateCcw,
  Check,
} from 'lucide-react';

const BUILTIN_SHOWCASE_IMAGES = [
  {
    url: '/src/assets/images/hero_moroccan_couture_1794683049899.jpg',
    label: 'البانر الرئيسي الأصلي',
  },
  {
    url: '/src/assets/images/cat_women_kaftan_1794683051308.jpg',
    label: 'قفطان مغربي فاخر',
  },
  {
    url: '/src/assets/images/cat_men_djellaba_1794683050322.jpg',
    label: 'جلابة رجالية فاخرة',
  },
  {
    url: '/src/assets/images/prod_djellaba_white_1794683051629.jpg',
    label: 'جلابة بيضاء تقليدية',
  },
  {
    url: '/src/assets/images/prod_gandoura_navy_1794683051598.jpg',
    label: 'قندورة ملكية كحلية',
  },
  {
    url: '/src/assets/images/prod_selham_babouche_1794683051779.jpg',
    label: 'سلهام وبلغة أصيلة',
  },
];

interface AdminDashboardProps {
  onExitAdmin?: () => void;
  onLoggedOut?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin, onLoggedOut }) => {
  const { isAdminLoggedIn, adminUser, logout, updateSession, setIsAdminOpen, token } = useAdminAuth();
  const { refreshData, settings: activeStoreSettings } = useStore();

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // In-app confirmation dialog & invoice print preview (no native confirm / window.open)
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [invoicePreviewOrder, setInvoicePreviewOrder] = useState<Order | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'categories' | 'products' | 'homepage' | 'reviews' | 'messages' | 'settings'
  >('overview');
  const [contentSubTab, setContentSubTab] = useState<
    'header_hero' | 'home_sections' | 'promo' | 'reviews_footer' | 'pages'
  >('header_hero');

  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [adminCategories, setAdminCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settingsData, setSettingsData] = useState<HomepageSettings | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Order Detail / Edit Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusUpdate, setOrderStatusUpdate] = useState<OrderFulfillmentStatus>('PENDING');
  const [paymentStatusUpdate, setPaymentStatusUpdate] = useState<OrderPaymentStatus>('AWAITING_PAYMENT');
  const [orderNotesUpdate, setOrderNotesUpdate] = useState('');

  // Order Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('all');

  // Category Edit Modal
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Security password update state
  const [pwForm, setPwForm] = useState({
    current_password: '',
    new_username: '',
    new_password: '',
    confirm_password: '',
  });

  // Product Edit Modal
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newVariantColor, setNewVariantColor] = useState('أخضر ملكي');
  const [newVariantColorCode, setNewVariantColorCode] = useState('#123624');
  const [newVariantSize, setNewVariantSize] = useState('L');
  const [newVariantStock, setNewVariantStock] = useState(10);

  // Fetch admin data
  const fetchAdminData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [ordersRes, prodsRes, catsRes, revsRes, msgsRes, settRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/categories', { headers }),
        fetch('/api/admin/reviews', { headers }),
        fetch('/api/admin/messages', { headers }),
        fetch('/api/settings'),
        fetch('/api/admin/analytics', { headers }),
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (prodsRes.ok) setProducts(await prodsRes.json());
      if (catsRes.ok) setAdminCategories(await catsRes.json());
      if (revsRes.ok) setReviews(await revsRes.json());
      if (msgsRes.ok) setMessages(await msgsRes.json());
      if (settRes.ok) setSettingsData(mergeWithDefaultSiteContent(await settRes.json()));
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      document.title = `لوحة التحكم الإدارية | ${activeStoreSettings.store_name || 'الأصالة المغربية'}`;
      fetchAdminData();
    }
  }, [isAdminLoggedIn]);

  const handleCloseDashboard = () => {
    // Re-sync storefront theme to persisted store settings on exit
    applyThemePaletteToRoot(buildThemePalette(activeStoreSettings));
    setIsAdminOpen(false);
    if (onExitAdmin) onExitAdmin();
  };

  // Fallback to standalone AdminLoginPage if not authenticated
  if (!isAdminLoggedIn) {
    return (
      <AdminLoginPage
        onLoginSuccess={() => fetchAdminData()}
        onNavigateHome={handleCloseDashboard}
      />
    );
  }

  // Handle Order Status Update
  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_status: orderStatusUpdate,
          payment_status: paymentStatusUpdate,
          internal_notes: orderNotesUpdate,
        }),
      });
      if (res.ok) {
        setSelectedOrder(null);
        fetchAdminData();
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export Orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['رقم الطلب', 'اسم الزبون', 'الهاتف', 'الجهة', 'الإقليم', 'العنوان', 'طريقة الدفع', 'حالة الدفع', 'حالة الطلب', 'المجموع (درهم)', 'التاريخ'];
    const rows = orders.map(o => [
      o.order_number,
      `"${o.customer_name}"`,
      `"${o.customer_phone}"`,
      `"${o.region_name_ar}"`,
      `"${o.province_name_ar}"`,
      `"${o.address_line}"`,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.total_amount,
      `"${new Date(o.created_at).toLocaleDateString('ar-MA')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `طلبات_الدار_المغربية_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open clean in-app printable Invoice modal (avoids popup blockers / window.open)
  const handlePrintInvoice = (order: Order) => {
    setInvoicePreviewOrder(order);
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_phone.includes(orderSearch);

    const matchesStatus = orderStatusFilter === 'all' || o.order_status === orderStatusFilter;
    const matchesPayment = orderPaymentFilter === 'all' || o.payment_method === orderPaymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div dir="rtl" className="min-h-screen h-screen w-full flex bg-[#FAF7F2]">
      <div className={`relative flex h-full w-full flex-col bg-[#FAF7F2] text-right ${invoicePreviewOrder ? 'no-print' : ''}`}>
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-[#E5DAC6] bg-white px-6 py-3.5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#123624] text-[#C5A059]">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-amiri text-lg font-bold text-[#123624]">
                لوحة التحكم الإدارية الشاملة
              </h2>
              <span className="text-[11px] text-stone-500">
                إدارة المتجر، الطلبات، المنتجات، المراجعات، والمحتوى
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {toastMsg && (
              <div
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-xs ${
                  toastMsg.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}
              >
                {toastMsg.text}
              </div>
            )}

            <button
              onClick={fetchAdminData}
              className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              onClick={async () => {
                applyThemePaletteToRoot(buildThemePalette(activeStoreSettings));
                await logout();
                if (onLoggedOut) {
                  onLoggedOut();
                } else if (onExitAdmin) {
                  onExitAdmin();
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>تسجيل الخروج</span>
            </button>

            <button
              onClick={handleCloseDashboard}
              className="flex items-center gap-1.5 rounded-xl border border-[#D5C9B3] bg-[#FAF7F2] px-3 py-1.5 text-xs font-semibold text-[#123624] hover:bg-[#EFE7D8]"
              title="العودة للمتجر"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">واجهة المتجر</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body (Sidebar Tabs + Content) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Right Sidebar Tabs in RTL */}
          <aside className="w-64 border-l border-[#E5DAC6] bg-white p-4 space-y-1 overflow-y-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#123624] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>نظرة عامة وإحصائيات</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#123624] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4" />
                <span>إدارة الطلبات</span>
              </div>
              {orders.length > 0 && (
                <span className="rounded-full bg-[#C5A059] px-2 py-0.5 text-[10px] text-[#123624]">
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'categories'
                  ? 'bg-[#123624] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4" />
                <span>إدارة التصنيفات</span>
              </div>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-700">
                {adminCategories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-[#123624] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>إدارة المنتجات والمخزون</span>
            </button>

            <button
              onClick={() => setActiveTab('homepage')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'homepage'
                  ? 'bg-[#123624] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>محرر محتوى ونصوص الموقع</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-[#123624] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4" />
                <span>مراجعات وتقييمات العملاء</span>
              </div>
              {reviews.filter(r => !r.is_approved).length > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] text-white">
                  {reviews.filter(r => !r.is_approved).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'messages'
                  ? 'bg-[#123624] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4" />
                <span>صندوق رسائل الزبائن</span>
              </div>
              {messages.filter(m => !m.is_read).length > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">
                  {messages.filter(m => !m.is_read).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#123624] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>إعدادات المتجر العامة</span>
            </button>
          </aside>

          {/* Main Tab Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* ========================================================
               TAB 1: OVERVIEW & KPIS
               ======================================================== */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-[#E5DAC6] bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                      <span>إجمالي المبيعات المؤكدة</span>
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-[#123624] font-mono">
                      {formatMAD(analytics?.totalRevenue || 0)}
                    </div>
                    <span className="text-[10px] text-stone-400">من جميع الطلبات غير الملغاة</span>
                  </div>

                  <div className="rounded-2xl border border-[#E5DAC6] bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                      <span>إجمالي عدد الطلبات</span>
                      <ShoppingBag className="h-4 w-4 text-[#C5A059]" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-[#123624] font-mono">
                      {orders.length}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {orders.filter(o => o.order_status === 'DELIVERED').length} تم توصيلها بنجاح
                    </span>
                  </div>

                  <div className="rounded-2xl border border-[#E5DAC6] bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                      <span>طلبات جديدة قيد الانتظار</span>
                      <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-amber-600 font-mono">
                      {orders.filter(o => o.order_status === 'PENDING').length}
                    </div>
                    <span className="text-[10px] text-stone-400">تتطلب اتصال التأكيد مع الزبون</span>
                  </div>

                  <div className="rounded-2xl border border-[#E5DAC6] bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
                      <span>تنبيهات نقص المخزون</span>
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-red-600 font-mono">
                      {analytics?.lowStockCount || 0}
                    </div>
                    <span className="text-[10px] text-stone-400">منتجات بها 3 قطع أو أقل</span>
                  </div>
                </div>

                {/* Low Stock Warning List */}
                {analytics?.lowStockProducts && analytics.lowStockProducts.length > 0 && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-red-800 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span>تنبيه: منتجات بحاجة إلى إعادة تزويد المخزون فوراً:</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {analytics.lowStockProducts.map((p: Product) => (
                        <div key={p.id} className="rounded-xl border border-red-200 bg-white p-2.5 text-xs">
                          <span className="font-bold text-stone-800">{p.name_ar}</span>
                          <div className="text-[11px] text-red-600 font-mono mt-0.5">
                            المخزون الحالي: {p.variants.reduce((s, v) => s + v.stock_quantity, 0)} قطع
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Orders Table */}
                <div className="rounded-2xl border border-[#E5DAC6] bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#E5DAC6] pb-3 mb-4">
                    <h3 className="font-amiri text-lg font-bold text-[#123624]">أحدث الطلبات</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-[#123624] hover:underline"
                    >
                      عرض جميع الطلبات
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-400">
                          <th className="pb-2 font-semibold">رقم الطلب</th>
                          <th className="pb-2 font-semibold">الزبون</th>
                          <th className="pb-2 font-semibold">المدينة</th>
                          <th className="pb-2 font-semibold">المبلغ</th>
                          <th className="pb-2 font-semibold">الدفع</th>
                          <th className="pb-2 font-semibold">حالة الطلب</th>
                          <th className="pb-2 font-semibold">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {orders.slice(0, 6).map(o => (
                          <tr key={o.id} className="hover:bg-[#FAF7F2]">
                            <td className="py-2.5 font-mono font-bold text-[#123624]">{o.order_number}</td>
                            <td className="py-2.5 font-medium">{o.customer_name}</td>
                            <td className="py-2.5 text-stone-600">{o.province_name_ar}</td>
                            <td className="py-2.5 font-bold text-[#B35432]">{formatMAD(o.total_amount)}</td>
                            <td className="py-2.5">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                  o.payment_method === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {o.payment_method === 'COD' ? 'عند الاستلام' : 'بطاقة بنكية'}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                  o.order_status === 'DELIVERED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : o.order_status === 'PENDING'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {o.order_status}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <button
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setOrderStatusUpdate(o.order_status);
                                  setPaymentStatusUpdate(o.payment_status);
                                  setOrderNotesUpdate(o.internal_notes || '');
                                }}
                                className="text-xs font-semibold text-[#123624] hover:underline"
                              >
                                عرض وتعديل
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
               TAB 2: ORDER MANAGEMENT
               ======================================================== */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Filters & Actions Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-2xl border border-[#E5DAC6] bg-white p-4">
                  <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="ابحث برقم الطلب، اسم الزبون، أو رقم الهاتف..."
                        value={orderSearch}
                        onChange={e => setOrderSearch(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 py-2 pr-9 pl-3 text-xs focus:border-[#123624] focus:outline-none"
                      />
                      <Search className="absolute top-2.5 right-3 h-4 w-4 text-stone-400" />
                    </div>

                    <select
                      value={orderStatusFilter}
                      onChange={e => setOrderStatusFilter(e.target.value)}
                      className="rounded-xl border border-stone-300 bg-white p-2 text-xs"
                    >
                      <option value="all">كل الحالات</option>
                      <option value="PENDING">قيد الانتظار (PENDING)</option>
                      <option value="CONFIRMED">مؤكد (CONFIRMED)</option>
                      <option value="PROCESSING">قيد التجهيز (PROCESSING)</option>
                      <option value="SHIPPED">تم الشحن (SHIPPED)</option>
                      <option value="DELIVERED">تم التوصيل (DELIVERED)</option>
                      <option value="CANCELLED">ملغى (CANCELLED)</option>
                    </select>

                    <select
                      value={orderPaymentFilter}
                      onChange={e => setOrderPaymentFilter(e.target.value)}
                      className="rounded-xl border border-stone-300 bg-white p-2 text-xs"
                    >
                      <option value="all">كل طرق الدفع</option>
                      <option value="COD">الدفع عند الاستلام</option>
                      <option value="ONLINE_CARD">بطاقة بنكية</option>
                    </select>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 rounded-xl border border-[#123624] bg-white px-4 py-2 text-xs font-bold text-[#123624] hover:bg-[#123624]/5"
                  >
                    <Download className="h-4 w-4" />
                    <span>تصدير الطلبات (Excel/CSV)</span>
                  </button>
                </div>

                {/* Orders Table */}
                <div className="rounded-2xl border border-[#E5DAC6] bg-white p-4 shadow-xs overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500">
                        <th className="pb-3 font-semibold">رقم الطلب</th>
                        <th className="pb-3 font-semibold">الزبون</th>
                        <th className="pb-3 font-semibold">الهاتف</th>
                        <th className="pb-3 font-semibold">المدينة والعنوان</th>
                        <th className="pb-3 font-semibold">القطع</th>
                        <th className="pb-3 font-semibold">الإجمالي</th>
                        <th className="pb-3 font-semibold">طريقة الدفع</th>
                        <th className="pb-3 font-semibold">حالة الطلب</th>
                        <th className="pb-3 font-semibold">التاريخ</th>
                        <th className="pb-3 font-semibold">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-10 text-center text-stone-400">
                            لا توجد طلبات مطابقة للبحث
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map(o => (
                          <tr key={o.id} className="hover:bg-[#FAF7F2]">
                            <td className="py-3 font-mono font-bold text-[#123624]">{o.order_number}</td>
                            <td className="py-3 font-semibold text-stone-900">{o.customer_name}</td>
                            <td className="py-3 font-mono text-stone-700">{o.customer_phone}</td>
                            <td className="py-3 text-stone-600 max-w-xs truncate">
                              {o.province_name_ar}
                              {o.commune_name_ar && o.commune_name_ar !== o.province_name_ar
                                ? ` - ${o.commune_name_ar}`
                                : ''}{' '}
                              ({o.address_line})
                            </td>
                            <td className="py-3 font-medium text-stone-600">
                              {o.items.reduce((s, i) => s + i.quantity, 0)} قطعة
                            </td>
                            <td className="py-3 font-bold text-[#B35432]">{formatMAD(o.total_amount)}</td>
                            <td className="py-3">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                  o.payment_method === 'COD' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                                }`}
                              >
                                {o.payment_method === 'COD' ? 'COD' : 'بطاقة'}
                              </span>
                            </td>
                            <td className="py-3">
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                  o.order_status === 'DELIVERED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : o.order_status === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {o.order_status}
                              </span>
                            </td>
                            <td className="py-3 text-[11px] text-stone-400">
                              {new Date(o.created_at).toLocaleDateString('ar-MA')}
                            </td>
                            <td className="py-3 flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setOrderStatusUpdate(o.order_status);
                                  setPaymentStatusUpdate(o.payment_status);
                                  setOrderNotesUpdate(o.internal_notes || '');
                                }}
                                className="rounded-lg bg-stone-100 p-1.5 text-stone-600 hover:bg-[#123624] hover:text-white"
                                title="تعديل وتفاصيل"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handlePrintInvoice(o)}
                                className="rounded-lg bg-stone-100 p-1.5 text-stone-600 hover:bg-[#123624] hover:text-white"
                                title="طباعة الفاتورة"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Selected Order Detail & Status Update Modal */}
                {selectedOrder && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#D5C9B3] bg-[#FAF7F2] p-6 text-right shadow-2xl">
                      <div className="flex items-center justify-between border-b border-[#E5DAC6] pb-3">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-5 w-5 text-[#123624]" />
                          <h3 className="font-amiri text-xl font-bold text-[#123624]">
                            تفاصيل الطلب: {selectedOrder.order_number}
                          </h3>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className="rounded-full p-1 text-stone-400 hover:bg-stone-200"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Items Ordered */}
                      <div className="mt-4 space-y-2">
                        <h4 className="text-xs font-bold text-stone-700">المنتجات المطلوبة:</h4>
                        {selectedOrder.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-2.5 text-xs"
                          >
                            <img src={it.image_url} alt="" className="h-12 w-10 rounded object-cover" />
                            <div className="flex-1">
                              <span className="font-bold text-[#123624]">{it.product_name}</span>
                              <div className="text-[11px] text-stone-500">
                                المقاس: {it.size} | اللون: {it.color_name} | الكمية: {it.quantity}
                              </div>
                            </div>
                            <span className="font-bold text-[#B35432]">{formatMAD(it.total_price)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status Changing Form */}
                      <div className="mt-5 space-y-3 rounded-xl border border-[#C5A059] bg-white p-4 text-xs">
                        <h4 className="font-bold text-[#123624]">تحديث حالة الطلب والدفع:</h4>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-medium text-stone-700 mb-1">
                              حالة التجهيز والتوصيل
                            </label>
                            <select
                              value={orderStatusUpdate}
                              onChange={e => setOrderStatusUpdate(e.target.value as any)}
                              className="w-full rounded-lg border border-stone-300 p-2 font-bold"
                            >
                              <option value="PENDING">قيد الانتظار (PENDING)</option>
                              <option value="CONFIRMED">مؤكد هاتفياً (CONFIRMED)</option>
                              <option value="PROCESSING">قيد التجهيز بالورشة (PROCESSING)</option>
                              <option value="SHIPPED">تم التسليم للإرسالية (SHIPPED)</option>
                              <option value="DELIVERED">تم التوصيل للزبون (DELIVERED)</option>
                              <option value="CANCELLED">ملغى مع استرجاع المخزون (CANCELLED)</option>
                              <option value="RETURNED">مُرتجع (RETURNED)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-medium text-stone-700 mb-1">حالة الدفع</label>
                            <select
                              value={paymentStatusUpdate}
                              onChange={e => setPaymentStatusUpdate(e.target.value as any)}
                              className="w-full rounded-lg border border-stone-300 p-2 font-bold"
                            >
                              <option value="AWAITING_PAYMENT">في انتظار الدفع (AWAITING)</option>
                              <option value="PAID">تم الدفع بالكامل (PAID)</option>
                              <option value="FAILED">فشلت عملية الدفع (FAILED)</option>
                              <option value="REFUNDED">مسترجع (REFUNDED)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-medium text-stone-700 mb-1">
                            ملاحظات الإدارة الداخلية
                          </label>
                          <textarea
                            rows={2}
                            value={orderNotesUpdate}
                            onChange={e => setOrderNotesUpdate(e.target.value)}
                            placeholder="مثال: تم الاتصال بالزبون وأكد موعد التوصيل يوم الجمعة..."
                            className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleUpdateOrder}
                            className="flex-1 rounded-xl bg-[#123624] py-2.5 font-bold text-white hover:bg-[#1b4d34]"
                          >
                            حفظ التعديلات
                          </button>
                          <button
                            onClick={() => handlePrintInvoice(selectedOrder)}
                            className="flex items-center gap-1.5 rounded-xl border border-stone-300 px-4 py-2.5 font-semibold text-stone-700 hover:bg-stone-50"
                          >
                            <Printer className="h-4 w-4" />
                            <span>طباعة الفاتورة</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
               TAB 2B: CATEGORY MANAGEMENT (FULL CRUD + DIRECT UPLOAD)
               ======================================================== */}
            {activeTab === 'categories' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-amiri text-xl font-bold text-[#123624]">
                      إدارة تصنيفات المتجر ({adminCategories.length})
                    </h3>
                    <p className="text-xs text-stone-500">
                      أضف تصنيفات جديدة، عدّل الأسماء والصور، أو تحكم في ترتيبها وظهورها للعملاء
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsNewCategory(true);
                      setEditingCategory({
                        name_ar: '',
                        name_fr: '',
                        slug: '',
                        description_ar: '',
                        image_url: '/src/assets/images/cat_men_djellaba_1794683050322.jpg',
                        display_order: adminCategories.length + 1,
                        is_active: true,
                      });
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-[#123624] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1b4d34]"
                  >
                    <Plus className="h-4 w-4 text-[#C5A059]" />
                    <span>إضافة تصنيف جديد</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminCategories.map(cat => {
                    const prodCount = products.filter(p => p.category_id === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className={`rounded-2xl border bg-white p-4 space-y-3 flex flex-col justify-between ${
                          cat.is_active ? 'border-[#E5DAC6]' : 'border-stone-200 opacity-75'
                        }`}
                      >
                        <div className="flex gap-3">
                          <img
                            src={cat.image_url}
                            alt={cat.name_ar}
                            className="h-20 w-20 rounded-xl object-cover shrink-0 border border-stone-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-amiri text-base font-bold text-[#123624] truncate">
                                {cat.name_ar}
                              </h4>
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                                  cat.is_active
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-stone-200 text-stone-600'
                                }`}
                              >
                                {cat.is_active ? 'نشط' : 'مخفي'}
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-400 font-mono block truncate">
                              /{cat.slug} · الترتيب: {cat.display_order}
                            </span>
                            <p className="mt-1 text-xs text-stone-600 line-clamp-2">
                              {cat.description_ar || 'بدون وصف'}
                            </p>
                            <div className="mt-1.5 text-[11px] font-semibold text-[#B35432]">
                              {prodCount} منتجات مرتبطة
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-stone-100 pt-2.5 text-xs">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setIsNewCategory(false);
                                setEditingCategory(cat);
                              }}
                              className="flex items-center gap-1 font-semibold text-[#123624] hover:underline"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span>تعديل</span>
                            </button>

                            <button
                              onClick={async () => {
                                const res = await fetch('/api/admin/categories', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ ...cat, is_active: !cat.is_active }),
                                });
                                if (res.ok) {
                                  showToast(cat.is_active ? 'تم إخفاء التصنيف من الواجهة' : 'تم تفعيل التصنيف في الواجهة');
                                  fetchAdminData();
                                  refreshData();
                                }
                              }}
                              className="text-stone-600 hover:text-[#123624] font-medium"
                            >
                              {cat.is_active ? 'إخفاء' : 'تفعيل'}
                            </button>
                          </div>

                          <button
                            onClick={async () => {
                              const res = await fetch(`/api/admin/categories/${cat.id}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              const data = await res.json();
                              if (!res.ok) {
                                showToast(data.error || 'تعذر حذف التصنيف', 'error');
                                return;
                              }
                              showToast('تم حذف التصنيف بنجاح');
                              fetchAdminData();
                              refreshData();
                            }}
                            className="text-stone-400 hover:text-red-600 p-1"
                            title="حذف التصنيف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add / Edit Category Modal */}
                {editingCategory && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#D5C9B3] bg-[#FAF7F2] p-6 text-right shadow-2xl">
                      <div className="flex items-center justify-between border-b border-[#E5DAC6] pb-3 mb-4">
                        <h3 className="font-amiri text-xl font-bold text-[#123624]">
                          {isNewCategory ? 'إضافة تصنيف جديد' : `تعديل التصنيف: ${editingCategory.name_ar || ''}`}
                        </h3>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <form
                        onSubmit={async e => {
                          e.preventDefault();
                          const res = await fetch('/api/admin/categories', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(editingCategory),
                          });
                          const data = await res.json();
                          if (!res.ok) {
                            showToast(data.error || 'فشل حفظ التصنيف', 'error');
                            return;
                          }
                          setEditingCategory(null);
                          showToast('تم حفظ التصنيف بنجاح');
                          fetchAdminData();
                          refreshData();
                        }}
                        className="space-y-4 text-xs"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-stone-700 mb-1">
                              اسم التصنيف بالعربية <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={editingCategory.name_ar || ''}
                              onChange={e => {
                                const name = e.target.value;
                                const updates: Partial<Category> = { name_ar: name };
                                if (isNewCategory && !editingCategory.slug) {
                                  updates.slug = name
                                    .toLowerCase()
                                    .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '-')
                                    .replace(/-+/g, '-');
                                }
                                setEditingCategory({ ...editingCategory, ...updates });
                              }}
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-stone-700 mb-1">
                              الاسم بالفرنسية
                            </label>
                            <input
                              type="text"
                              value={editingCategory.name_fr || ''}
                              onChange={e =>
                                setEditingCategory({ ...editingCategory, name_fr: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-stone-700 mb-1">
                              المعرّف الدائم (Slug)
                            </label>
                            <input
                              type="text"
                              required
                              value={editingCategory.slug || ''}
                              onChange={e =>
                                setEditingCategory({ ...editingCategory, slug: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-stone-700 mb-1">
                              ترتيب العرض في المتجر
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={editingCategory.display_order ?? 1}
                              onChange={e =>
                                setEditingCategory({
                                  ...editingCategory,
                                  display_order: Number(e.target.value),
                                })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">وصف التصنيف</label>
                          <textarea
                            rows={2}
                            value={editingCategory.description_ar || ''}
                            onChange={e =>
                              setEditingCategory({
                                ...editingCategory,
                                description_ar: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                          />
                        </div>

                        <ImageUploader
                          token={token}
                          label="صورة غلاف التصنيف (رفع مباشر من الجهاز)"
                          value={editingCategory.image_url}
                          onChange={url =>
                            setEditingCategory({ ...editingCategory, image_url: url })
                          }
                        />

                        <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                          <input
                            type="checkbox"
                            checked={editingCategory.is_active ?? true}
                            onChange={e =>
                              setEditingCategory({
                                ...editingCategory,
                                is_active: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-stone-300"
                          />
                          <span>إظهار التصنيف للعملاء على الواجهة الرئيسية</span>
                        </label>

                        <div className="flex gap-2 pt-3 border-t border-[#E5DAC6]">
                          <button
                            type="submit"
                            className="flex-1 rounded-xl bg-[#123624] py-3 font-bold text-white hover:bg-[#1b4d34]"
                          >
                            حفظ التصنيف
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="rounded-xl border border-stone-300 px-5 py-3 text-stone-600"
                          >
                            إلغاء
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
               TAB 3: PRODUCT MANAGEMENT
               ======================================================== */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-amiri text-lg font-bold text-[#123624]">
                    قائمة المنتجات والمخزون ({products.length})
                  </h3>
                  <button
                    onClick={() => {
                      setIsNewProduct(true);
                      setSlugManuallyEdited(false);
                      setEditingProduct({
                        name_ar: '',
                        name_fr: '',
                        description_ar: '',
                        regular_price: 900,
                        discounted_price: undefined,
                        category_id: adminCategories[0]?.id || 'cat-men-djellaba',
                        sku: `DJ-${Date.now().toString().slice(-4)}`,
                        main_image: '/src/assets/images/cat_men_djellaba_1794683050322.jpg',
                        variants: [
                          {
                            id: `v-${Date.now()}-1`,
                            color_name_ar: 'أخضر ملكي',
                            color_name_fr: 'Vert Royal',
                            color_code: '#123624',
                            size: 'L',
                            sku: `DJ-L-GR`,
                            stock_quantity: 10,
                          },
                        ],
                        is_active: true,
                        is_featured: false,
                        is_new_arrival: true,
                        is_best_seller: false,
                        tags: ['جلابة مغربية', 'خياطة المعلم'],
                      });
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-[#123624] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4d34]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>إضافة منتج تقليدي جديد</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(p => {
                    const totalStock = p.variants.reduce((s, v) => s + v.stock_quantity, 0);
                    return (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-[#E5DAC6] bg-white p-4 space-y-3 flex flex-col justify-between"
                      >
                        <div className="flex gap-3">
                          <img
                            src={p.main_image}
                            alt=""
                            className="h-20 w-16 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-[#123624] truncate">{p.name_ar}</h4>
                            <span className="text-[10px] text-stone-400 font-mono">SKU: {p.sku}</span>
                            <div className="mt-1 flex items-baseline gap-2">
                              <span className="font-bold text-xs text-[#B35432]">
                                {formatMAD(p.discounted_price ?? p.regular_price)}
                              </span>
                              {p.discounted_price && (
                                <span className="text-[10px] text-stone-400 line-through">
                                  {formatMAD(p.regular_price)}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-[11px] font-semibold text-stone-600">
                              إجمالي المخزون: {totalStock} قطع
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-xs">
                          <button
                            onClick={() => {
                              setIsNewProduct(false);
                              setSlugManuallyEdited(true);
                              setEditingProduct({
                                ...p,
                                variants: (p.variants || []).map(v => ({ ...v })),
                                specifications: (p.specifications || []).map(s => ({ ...s })),
                                additional_images: [...(p.additional_images || [])],
                                tags: [...(p.tags || [])],
                                related_product_ids: [...(p.related_product_ids || [])],
                              });
                            }}
                            className="flex items-center gap-1 font-semibold text-[#123624] hover:underline"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>تعديل المنتج</span>
                          </button>

                          <button
                            onClick={() => {
                              setConfirmDialog({
                                title: 'تأكيد حذف المنتج',
                                message: `هل أنت متأكد من حذف المنتج "${p.name_ar}" نهائياً من قاعدة البيانات؟`,
                                onConfirm: async () => {
                                  const res = await fetch(`/api/admin/products/${p.id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` },
                                  });
                                  if (!res.ok) {
                                    showToast('تعذر حذف المنتج، يرجى المحاولة مرة أخرى', 'error');
                                    return;
                                  }
                                  await fetchAdminData();
                                  await refreshData();
                                  showToast('تم حذف المنتج بنجاح');
                                },
                              });
                            }}
                            className="text-stone-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Product Add/Edit Modal */}
                {editingProduct && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
                    <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#D5C9B3] bg-[#FAF7F2] p-6 sm:p-8 text-right shadow-2xl">
                      <div className="flex items-center justify-between border-b border-[#E5DAC6] pb-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123624] text-[#C5A059]">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-amiri text-2xl font-bold text-[#123624]">
                              {isNewProduct ? 'إضافة منتج تقليدي جديد للمتجر' : `تعديل المنتج: ${editingProduct.name_ar || ''}`}
                            </h3>
                            <span className="text-[11px] text-stone-500">
                              إدارة الصور، المقاسات، المخزون، المواصفات الفنية، وبيانات SEO
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {editingProduct.slug && (
                            <a
                              href={`/products/${encodeURIComponent(editingProduct.slug)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 rounded-xl border border-[#123624] bg-white px-3 py-1.5 text-xs font-bold text-[#123624] hover:bg-[#123624] hover:text-white transition-all"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>معاينة صفحة المنتج</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="rounded-full p-2 text-stone-400 hover:bg-stone-200"
                            aria-label="إغلاق نافذة المنتج"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <form
                        onSubmit={async e => {
                          e.preventDefault();
                          if (savingProduct) return;

                          const nameAr = (editingProduct.name_ar || '').trim();
                          const regularPrice = Number(editingProduct.regular_price);
                          const discountedPrice =
                            editingProduct.discounted_price !== undefined &&
                            editingProduct.discounted_price !== null &&
                            String(editingProduct.discounted_price) !== ''
                              ? Number(editingProduct.discounted_price)
                              : undefined;

                          if (!nameAr) {
                            showToast('يرجى إدخال اسم المنتج بالعربية', 'error');
                            return;
                          }
                          if (!Number.isFinite(regularPrice) || regularPrice <= 0) {
                            showToast('يرجى إدخال سعر أصلي صحيح أكبر من 0', 'error');
                            return;
                          }
                          if (discountedPrice !== undefined && (discountedPrice <= 0 || discountedPrice >= regularPrice)) {
                            showToast('سعر التخفيض يجب أن يكون أكبر من 0 وأقل من السعر الأصلي', 'error');
                            return;
                          }
                          if (!editingProduct.variants || editingProduct.variants.length === 0) {
                            showToast('يرجى إضافة متغير واحد على الأقل (لون ومقاس)', 'error');
                            return;
                          }

                          const payload = {
                            ...editingProduct,
                            name_ar: nameAr,
                            regular_price: regularPrice,
                            discounted_price: discountedPrice,
                            category_id: editingProduct.category_id || adminCategories[0]?.id || 'cat-men-djellaba',
                            slug: (editingProduct.slug || '').trim() || slugifyProductName(nameAr),
                            description_ar: sanitizeProductHtml(editingProduct.description_ar || ''),
                          };

                          try {
                            setSavingProduct(true);
                            const res = await fetch('/api/admin/products', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify(payload),
                            });
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok) {
                              showToast(data.error || 'تعذر حفظ المنتج، يرجى مراجعة البيانات والمحاولة مجدداً', 'error');
                              return;
                            }
                            setEditingProduct(null);
                            await Promise.all([fetchAdminData(), refreshData()]);
                            showToast(isNewProduct ? 'تمت إضافة المنتج الجديد بنجاح!' : 'تم تحديث بيانات المنتج بنجاح!');
                          } catch {
                            showToast('حدث خطأ في الاتصال أثناء حفظ المنتج', 'error');
                          } finally {
                            setSavingProduct(false);
                          }
                        }}
                        className="space-y-6 text-xs"
                      >
                        {/* SECTION 1: الأساسيات والتسعير والتصنيف */}
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
                          <h4 className="font-amiri text-base font-bold text-[#123624] border-b pb-2">
                            1. البيانات الأساسية والتسعير
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                اسم المنتج بالعربية <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={editingProduct.name_ar || ''}
                                onChange={e => {
                                  const name = e.target.value;
                                  const updates: Partial<Product> = { name_ar: name };
                                  if (isNewProduct && !slugManuallyEdited) {
                                    updates.slug = slugifyProductName(name);
                                  }
                                  setEditingProduct(prev => (prev ? { ...prev, ...updates } : prev));
                                }}
                                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs bg-white font-medium"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                الاسم بالفرنسية (Nom en Français)
                              </label>
                              <input
                                type="text"
                                value={editingProduct.name_fr || ''}
                                onChange={e =>
                                  setEditingProduct({ ...editingProduct, name_fr: e.target.value })
                                }
                                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs bg-white font-sans"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                التصنيف الرئيسي <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={editingProduct.category_id || adminCategories[0]?.id || ''}
                                onChange={e =>
                                  setEditingProduct({ ...editingProduct, category_id: e.target.value })
                                }
                                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs bg-white font-bold text-[#123624]"
                              >
                                {adminCategories.map(c => (
                                  <option key={c.id} value={c.id}>
                                    {c.name_ar}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                رمز المنتج SKU <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={editingProduct.sku || ''}
                                onChange={e =>
                                  setEditingProduct({ ...editingProduct, sku: e.target.value })
                                }
                                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs bg-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                السعر الأصلي (درهم مغربي) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                required
                                value={editingProduct.regular_price || 0}
                                onChange={e =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    regular_price: Number(e.target.value),
                                  })
                                }
                                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs bg-white font-mono font-bold text-[#B35432]"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                سعر التخفيض (اختياري)
                              </label>
                              <input
                                type="number"
                                value={editingProduct.discounted_price || ''}
                                onChange={e =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    discounted_price: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                placeholder="اختياري (مثال: 750)"
                                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs bg-white font-mono placeholder:font-tajawal"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                رابط المنتج الدائم (URL Slug) <span className="text-red-500">*</span>
                              </label>
                              <div className="flex items-center rounded-xl border border-stone-300 bg-stone-50 px-2.5">
                                <span className="text-[11px] text-stone-400 font-mono">/products/</span>
                                <input
                                  type="text"
                                  required
                                  value={editingProduct.slug || ''}
                                  onChange={e => {
                                    setSlugManuallyEdited(true);
                                    setEditingProduct({ ...editingProduct, slug: e.target.value });
                                  }}
                                  dir="auto"
                                  className="w-full bg-transparent p-2 text-xs font-tajawal font-semibold text-[#123624] focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                عنوان محركات البحث (SEO Title)
                              </label>
                              <input
                                type="text"
                                value={editingProduct.seo_title || ''}
                                onChange={e =>
                                  setEditingProduct({ ...editingProduct, seo_title: e.target.value })
                                }
                                placeholder="مثال: جلابة مخزنية ملكية فاخرة | الدار المغربية"
                                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold text-stone-700 mb-1.5">
                              الوصف التسويقي والتفصيلي للقطعة (محرر نصوص متقدم)
                            </label>
                            <RichTextEditor
                              token={token}
                              value={editingProduct.description_ar || ''}
                              onChange={html =>
                                setEditingProduct(prev => (prev ? { ...prev, description_ar: html } : prev))
                              }
                              placeholder="اكتب وصفاً تفصيلياً للقطعة... يمكنك تنسيق العناوين وإدراج القوائم والجداول والصور والفيديو مباشرة"
                            />
                          </div>
                        </div>

                        {/* SECTION 2: معرض الصور المتعددة والرفع المباشر */}
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
                          <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="font-amiri text-base font-bold text-[#123624]">
                              2. صور وفيديو المنتج (رفع مباشر إلى قاعدة البيانات)
                            </h4>
                            <span className="text-[11px] text-stone-500">
                              حمّل الصور مباشرة من جهازك بدون الحاجة لروابط خارجية
                            </span>
                          </div>

                          <ImageUploader
                            token={token}
                            label="الصورة الرئيسية للمنتج *"
                            value={editingProduct.main_image || ''}
                            onChange={url =>
                              setEditingProduct({ ...editingProduct, main_image: url })
                            }
                          />

                          {/* Gallery Images List */}
                          <div>
                            <label className="block font-bold text-stone-700 mb-2">
                              الصور الإضافية في المعرض ({editingProduct.additional_images?.length || 0})
                            </label>

                            {editingProduct.additional_images && editingProduct.additional_images.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                {editingProduct.additional_images.map((img, idx) => (
                                  <div
                                    key={idx}
                                    className="group relative rounded-xl border border-stone-200 overflow-hidden bg-stone-50 p-2 flex flex-col items-center gap-2"
                                  >
                                    <img
                                      src={img}
                                      alt=""
                                      className="h-24 w-full rounded-lg object-cover"
                                    />
                                    <div className="flex items-center gap-1 w-full justify-between">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const prevMain = editingProduct.main_image || '';
                                          const newAdd = [...(editingProduct.additional_images || [])];
                                          newAdd[idx] = prevMain;
                                          setEditingProduct({
                                            ...editingProduct,
                                            main_image: img,
                                            additional_images: newAdd,
                                          });
                                        }}
                                        className="text-[10px] font-bold text-[#123624] hover:underline"
                                      >
                                        تعيين كرئيسية
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const filtered = (editingProduct.additional_images || []).filter(
                                            (_, i) => i !== idx
                                          );
                                          setEditingProduct({
                                            ...editingProduct,
                                            additional_images: filtered,
                                          });
                                        }}
                                        className="text-stone-400 hover:text-red-600 p-1"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-stone-400 mb-3">
                                لا توجد صور إضافية بعد. ارفع عدة صور لعرض تفاصيل الخياطة من زوايا متعددة.
                              </p>
                            )}

                            <ImageUploader
                              token={token}
                              multiple={true}
                              compact={true}
                              helperText="يمكنك تحديد أكثر من صورة دفعة واحدة لإضافتها مباشرة إلى معرض المنتج"
                              onMultipleUploaded={urls => {
                                const current = editingProduct.additional_images || [];
                                setEditingProduct({
                                  ...editingProduct,
                                  additional_images: [...current, ...urls],
                                });
                              }}
                            />
                          </div>

                          {/* Optional Product Video Upload */}
                          <ImageUploader
                            token={token}
                            label="فيديو استعراض المنتج (اختياري - MP4 / WebM)"
                            accept="video/mp4,video/webm"
                            value={editingProduct.video_url || ''}
                            onChange={url =>
                              setEditingProduct({ ...editingProduct, video_url: url })
                            }
                            helperText="ارفع فيديو قصير يبرز تفاصيل السفيفة والعقاد وحركة القماش"
                          />
                        </div>

                        {/* SECTION 3: خياطة المعلم والمواصفات (Specifications) */}
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
                          <h4 className="font-amiri text-base font-bold text-[#123624] border-b pb-2">
                            3. مواصفات الصنعة والقماش والسياسات
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                نوع القماش والخامات
                              </label>
                              <input
                                type="text"
                                value={editingProduct.fabric || ''}
                                onChange={e =>
                                  setEditingProduct({ ...editingProduct, fabric: e.target.value })
                                }
                                placeholder="مثال: صوف كشمير عالي الكثافة دافئ ومريح"
                                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs bg-white"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                نوع الخياطة والتطريز (الصنعة المغربية)
                              </label>
                              <input
                                type="text"
                                value={editingProduct.craftsmanship || ''}
                                onChange={e =>
                                  setEditingProduct({ ...editingProduct, craftsmanship: e.target.value })
                                }
                                placeholder="مثال: خياطة المعلم بالسفيفة العريضة والعقد المبرومة باليد"
                                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs bg-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                تعليمات العناية والغسيل
                              </label>
                              <textarea
                                rows={2}
                                value={editingProduct.care_instructions || ''}
                                onChange={e =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    care_instructions: e.target.value,
                                  })
                                }
                                placeholder="مثال: تنظيف جاف فقط أو غسيل يدوي بماء بارد..."
                                className="w-full rounded-xl border border-stone-300 p-2 text-xs bg-white"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                معلومات الشحن والتوصيل
                              </label>
                              <textarea
                                rows={2}
                                value={editingProduct.shipping_info || ''}
                                onChange={e =>
                                  setEditingProduct({ ...editingProduct, shipping_info: e.target.value })
                                }
                                placeholder="مثال: توصيل سريع لكافة المدن خلال 24-48 ساعة..."
                                className="w-full rounded-xl border border-stone-300 p-2 text-xs bg-white"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-stone-700 mb-1">
                                سياسة الاستبدال والضمان
                              </label>
                              <textarea
                                rows={2}
                                value={editingProduct.return_policy || ''}
                                onChange={e =>
                                  setEditingProduct({ ...editingProduct, return_policy: e.target.value })
                                }
                                placeholder="مثال: استبدال المقاس متوفر مجاناً خلال 7 أيام..."
                                className="w-full rounded-xl border border-stone-300 p-2 text-xs bg-white"
                              />
                            </div>
                          </div>

                          {/* Dynamic Specifications Key-Value rows */}
                          <div className="border-t border-stone-100 pt-3">
                            <label className="block font-bold text-stone-700 mb-2">
                              جدول المواصفات الفنية التفصيلية (يظهر في تبويب المواصفات بصفحة المنتج):
                            </label>

                            <div className="space-y-2 mb-3">
                              {(editingProduct.specifications || []).map((spec, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={spec.label}
                                    onChange={e => {
                                      const val = e.target.value;
                                      const updated = (editingProduct.specifications || []).map((item, idx) =>
                                        idx === i ? { ...item, label: val } : item
                                      );
                                      setEditingProduct({ ...editingProduct, specifications: updated });
                                    }}
                                    className="w-1/3 rounded-lg border border-stone-300 p-2 text-xs bg-white"
                                  />
                                  <input
                                    type="text"
                                    value={spec.value}
                                    onChange={e => {
                                      const val = e.target.value;
                                      const updated = (editingProduct.specifications || []).map((item, idx) =>
                                        idx === i ? { ...item, value: val } : item
                                      );
                                      setEditingProduct({ ...editingProduct, specifications: updated });
                                    }}
                                    className="flex-1 rounded-lg border border-stone-300 p-2 text-xs bg-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = (editingProduct.specifications || []).filter(
                                        (_, idx) => idx !== i
                                      );
                                      setEditingProduct({ ...editingProduct, specifications: updated });
                                    }}
                                    className="text-stone-400 hover:text-red-600 p-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="عنوان الخاصية (مثال: نوع الصدرية)"
                                value={newSpecLabel}
                                onChange={e => setNewSpecLabel(e.target.value)}
                                className="w-1/3 rounded-xl border border-stone-300 p-2 text-xs bg-white"
                              />
                              <input
                                type="text"
                                placeholder="القيمة (مثال: نصف طوق مخزني مطرز بالصقلي)"
                                value={newSpecValue}
                                onChange={e => setNewSpecValue(e.target.value)}
                                className="flex-1 rounded-xl border border-stone-300 p-2 text-xs bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
                                  const current = editingProduct.specifications || [];
                                  setEditingProduct({
                                    ...editingProduct,
                                    specifications: [
                                      ...current,
                                      { label: newSpecLabel.trim(), value: newSpecValue.trim() },
                                    ],
                                  });
                                  setNewSpecLabel('');
                                  setNewSpecValue('');
                                }}
                                className="rounded-xl border border-[#123624] px-4 py-2 text-xs font-bold text-[#123624] hover:bg-[#123624]/5"
                              >
                                + سطر جديد
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* SECTION 4: المتغيرات والمقاسات والمخزون (Variants & Stock) */}
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
                          <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="font-amiri text-base font-bold text-[#123624]">
                              4. إدارة الألوان والمقاسات والمخزون التفصيلي
                            </h4>
                            <span className="text-xs font-bold text-[#B35432] font-mono">
                              إجمالي المخزون: {(editingProduct.variants || []).reduce((s, v) => s + (v.stock_quantity || 0), 0)} قطعة
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                              <thead>
                                <tr className="border-b text-stone-500">
                                  <th className="pb-2">اللون (بالعربية)</th>
                                  <th className="pb-2">كود اللون</th>
                                  <th className="pb-2">المقاس</th>
                                  <th className="pb-2">رمز المتغير SKU</th>
                                  <th className="pb-2">كمية المخزون</th>
                                  <th className="pb-2">حذف</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100">
                                {(editingProduct.variants || []).map((v, idx) => (
                                  <tr key={idx}>
                                    <td className="py-2">
                                      <input
                                        type="text"
                                        value={v.color_name_ar}
                                        onChange={e => {
                                          const val = e.target.value;
                                          const vars = (editingProduct.variants || []).map((item, i) =>
                                            i === idx ? { ...item, color_name_ar: val } : item
                                          );
                                          setEditingProduct({ ...editingProduct, variants: vars });
                                        }}
                                        className="w-28 rounded-lg border border-stone-200 p-1.5 text-xs bg-white"
                                      />
                                    </td>
                                    <td className="py-2">
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="color"
                                          value={v.color_code}
                                          onChange={e => {
                                            const val = e.target.value;
                                            const vars = (editingProduct.variants || []).map((item, i) =>
                                              i === idx ? { ...item, color_code: val } : item
                                            );
                                            setEditingProduct({ ...editingProduct, variants: vars });
                                          }}
                                          className="h-7 w-7 rounded border border-stone-300 cursor-pointer"
                                        />
                                        <span className="font-mono text-[10px] text-stone-400">
                                          {v.color_code}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2">
                                      <input
                                        type="text"
                                        value={v.size}
                                        onChange={e => {
                                          const val = e.target.value;
                                          const vars = (editingProduct.variants || []).map((item, i) =>
                                            i === idx ? { ...item, size: val } : item
                                          );
                                          setEditingProduct({ ...editingProduct, variants: vars });
                                        }}
                                        className="w-20 rounded-lg border border-stone-200 p-1.5 text-xs bg-white font-bold text-center"
                                      />
                                    </td>
                                    <td className="py-2">
                                      <input
                                        type="text"
                                        value={v.sku}
                                        onChange={e => {
                                          const val = e.target.value;
                                          const vars = (editingProduct.variants || []).map((item, i) =>
                                            i === idx ? { ...item, sku: val } : item
                                          );
                                          setEditingProduct({ ...editingProduct, variants: vars });
                                        }}
                                        className="w-28 rounded-lg border border-stone-200 p-1.5 text-xs bg-white font-mono text-[11px]"
                                      />
                                    </td>
                                    <td className="py-2">
                                      <input
                                        type="number"
                                        min={0}
                                        value={v.stock_quantity}
                                        onChange={e => {
                                          const val = Number(e.target.value);
                                          const vars = (editingProduct.variants || []).map((item, i) =>
                                            i === idx ? { ...item, stock_quantity: val } : item
                                          );
                                          setEditingProduct({ ...editingProduct, variants: vars });
                                        }}
                                        className="w-20 rounded-lg border border-stone-200 p-1.5 text-xs bg-white font-mono font-bold text-emerald-800"
                                      />
                                    </td>
                                    <td className="py-2">
                                      <button
                                        type="button"
                                        disabled={(editingProduct.variants || []).length <= 1}
                                        onClick={() => {
                                          const vars = (editingProduct.variants || []).filter(
                                            (_, i) => i !== idx
                                          );
                                          setEditingProduct({ ...editingProduct, variants: vars });
                                        }}
                                        className="text-stone-400 hover:text-red-600 disabled:opacity-20 p-1"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Add Variant Form */}
                          <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
                            <input
                              type="text"
                              placeholder="اسم اللون (أزرق نيلي)"
                              value={newVariantColor}
                              onChange={e => setNewVariantColor(e.target.value)}
                              className="w-28 rounded-xl border border-stone-300 p-2 text-xs bg-white"
                            />
                            <div className="flex items-center gap-1">
                              <input
                                type="color"
                                value={newVariantColorCode}
                                onChange={e => setNewVariantColorCode(e.target.value)}
                                className="h-8 w-8 rounded-lg border border-stone-300 cursor-pointer"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="المقاس (M, L, XL)"
                              value={newVariantSize}
                              onChange={e => setNewVariantSize(e.target.value)}
                              className="w-24 rounded-xl border border-stone-300 p-2 text-xs bg-white font-bold text-center"
                            />
                            <input
                              type="number"
                              min={1}
                              placeholder="المخزون"
                              value={newVariantStock}
                              onChange={e => setNewVariantStock(Number(e.target.value))}
                              className="w-20 rounded-xl border border-stone-300 p-2 text-xs bg-white font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const current = editingProduct.variants || [];
                                const newV = {
                                  id: `v-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                                  color_name_ar: newVariantColor,
                                  color_name_fr: '',
                                  color_code: newVariantColorCode,
                                  size: newVariantSize,
                                  sku: `${editingProduct.sku || 'SKU'}-${newVariantSize}`,
                                  stock_quantity: newVariantStock,
                                };
                                setEditingProduct({ ...editingProduct, variants: [...current, newV] });
                              }}
                              className="rounded-xl bg-[#123624] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4d34]"
                            >
                              + إضافة هذا المتغير
                            </button>
                          </div>
                        </div>

                        {/* SECTION 5: شارات وظهور المنتج في المتجر */}
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
                          <h4 className="font-amiri text-base font-bold text-[#123624] border-b pb-2">
                            5. شارات وظهور المنتج
                          </h4>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                              <input
                                type="checkbox"
                                checked={editingProduct.is_active ?? true}
                                onChange={e =>
                                  setEditingProduct({ ...editingProduct, is_active: e.target.checked })
                                }
                                className="h-4 w-4 rounded border-stone-300"
                              />
                              <span>منتج نشط في المتجر</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                              <input
                                type="checkbox"
                                checked={editingProduct.is_best_seller ?? false}
                                onChange={e =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    is_best_seller: e.target.checked,
                                  })
                                }
                                className="h-4 w-4 rounded border-stone-300"
                              />
                              <span>الأكثر طلباً ⭐</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                              <input
                                type="checkbox"
                                checked={editingProduct.is_new_arrival ?? true}
                                onChange={e =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    is_new_arrival: e.target.checked,
                                  })
                                }
                                className="h-4 w-4 rounded border-stone-300"
                              />
                              <span>وصل حديثاً ✨</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                              <input
                                type="checkbox"
                                checked={editingProduct.is_featured ?? false}
                                onChange={e =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    is_featured: e.target.checked,
                                  })
                                }
                                className="h-4 w-4 rounded border-stone-300"
                              />
                              <span>مميز في الصفحة الرئيسية</span>
                            </label>
                          </div>
                        </div>

                        {/* Submit & Cancel Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-[#E5DAC6]">
                          <button
                            type="submit"
                            disabled={savingProduct}
                            className="flex-1 rounded-2xl bg-[#123624] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#1b4d34] disabled:opacity-60 transition-all cursor-pointer"
                          >
                            {savingProduct
                              ? 'جاري حفظ بيانات المنتج...'
                              : isNewProduct
                              ? 'حفظ وإضافة المنتج الجديد'
                              : 'حفظ وتحديث بيانات المنتج فوراً'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="rounded-2xl border border-stone-300 px-6 py-3.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                          >
                            إلغاء التعديل
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
               TAB 4: FULL SITE CONTENT & HOMEPAGE CMS EDITOR
               ======================================================== */}
            {activeTab === 'homepage' && settingsData && (
              <div className="max-w-4xl space-y-5 rounded-2xl border border-[#E5DAC6] bg-white p-6 shadow-xs text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="font-amiri text-lg font-bold text-[#123624] flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-[#C5A059]" />
                      <span>محرر محتوى ونصوص وصور الموقع بالكامل</span>
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      يمكنك تعديل كل النصوص والعناوين والفقرات والصور الظاهرة في الواجهة والتذييل والصفحات المستقلة.
                    </p>
                  </div>
                </div>

                {/* Sub-tabs Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3" role="tablist">
                  {[
                    { id: 'header_hero' as const, label: 'الهيدر والبانر الرئيسي' },
                    { id: 'home_sections' as const, label: 'المميزات والتصنيفات والمنتجات' },
                    { id: 'promo' as const, label: 'قسم الإصدارات المختارة' },
                    { id: 'reviews_footer' as const, label: 'التقييمات والتذييل (Footer)' },
                    { id: 'pages' as const, label: 'الصفحات المستقلة' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={contentSubTab === tab.id}
                      onClick={() => setContentSubTab(tab.id)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                        contentSubTab === tab.id
                          ? 'bg-[#123624] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    const res = await fetch('/api/admin/settings', {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(settingsData),
                    });
                    if (!res.ok) {
                      const errData = await res.json().catch(() => ({}));
                      showToast(errData.error || 'تعذر حفظ محتوى الموقع', 'error');
                      return;
                    }
                    const updated = await res.json().catch(() => settingsData);
                    setSettingsData(mergeWithDefaultSiteContent(updated));
                    await refreshData();
                    showToast('تم حفظ ونشر جميع تعديلات محتوى الموقع بنجاح!');
                  }}
                  className="space-y-5"
                >
                  {/* SUB-TAB 1: HEADER & HERO */}
                  {contentSubTab === 'header_hero' && (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-[#E5DAC6] bg-[#FAF7F2]/50 p-4 space-y-3">
                        <h4 className="font-bold text-[#123624]">الشريط العلوي والهيدر</h4>

                        <div>
                          <label htmlFor="cms-announcement" className="block font-bold text-stone-700 mb-1">
                            نص شريط الإعلانات العلوي (افصل العبارات بعلامة |)
                          </label>
                          <input
                            id="cms-announcement"
                            type="text"
                            value={settingsData.announcement_bar_ar}
                            onChange={e =>
                              setSettingsData({ ...settingsData, announcement_bar_ar: e.target.value })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="cms-header-made-in" className="block font-bold text-stone-700 mb-1">
                              نص شارة الأصل بجانب العلم (الهيدر)
                            </label>
                            <input
                              id="cms-header-made-in"
                              type="text"
                              value={settingsData.header_made_in_text_ar ?? DEFAULT_SITE_CONTENT.header_made_in_text_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, header_made_in_text_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="cms-header-tagline" className="block font-bold text-stone-700 mb-1">
                              العبارة التعريفية تحت اسم المتجر
                            </label>
                            <input
                              id="cms-header-tagline"
                              type="text"
                              value={settingsData.header_tagline_ar ?? DEFAULT_SITE_CONTENT.header_tagline_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, header_tagline_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#E5DAC6] bg-[#FAF7F2]/50 p-4 space-y-3">
                        <h4 className="font-bold text-[#123624]">نصوص البانر الرئيسي (Hero)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="cms-hero-title" className="block font-bold text-stone-700 mb-1">
                              عنوان البانر الرئيسي
                            </label>
                            <input
                              id="cms-hero-title"
                              type="text"
                              value={settingsData.hero_title_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, hero_title_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="cms-hero-cta" className="block font-bold text-stone-700 mb-1">
                              نص زر البانر الرئيسي
                            </label>
                            <input
                              id="cms-hero-cta"
                              type="text"
                              value={settingsData.hero_cta_text_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, hero_cta_text_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="cms-hero-subtitle" className="block font-bold text-stone-700 mb-1">
                            وصف البانر الرئيسي
                          </label>
                          <textarea
                            id="cms-hero-subtitle"
                            rows={2}
                            value={settingsData.hero_subtitle_ar}
                            onChange={e =>
                              setSettingsData({ ...settingsData, hero_subtitle_ar: e.target.value })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                          />
                        </div>
                      </div>

                      {/* Hero Image Editor with Preview + Quick Picker + Upload */}
                      <div className="rounded-2xl border border-[#E5DAC6] bg-[#FAF7F2]/60 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#123624]">صورة الصفحة الرئيسية (البانر الرئيسي)</h4>
                          <span className="text-[11px] text-stone-500">
                            ارفع صورة من جهازك أو اختر من الأرشيف الفوتوغرافي
                          </span>
                        </div>

                        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                          <img
                            src={settingsData.hero_image_url}
                            alt="معاينة صورة الصفحة الرئيسية"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-3">
                            <span className="text-white text-[11px] font-bold">
                              معاينة حيّة لصورة الواجهة الرئيسية
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-600 mb-2">
                            اختيار سريع من صور الدار الجاهزة:
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {BUILTIN_SHOWCASE_IMAGES.map(preset => {
                              const isSelected = settingsData.hero_image_url === preset.url;
                              return (
                                <button
                                  key={preset.url}
                                  type="button"
                                  onClick={() =>
                                    setSettingsData({ ...settingsData, hero_image_url: preset.url })
                                  }
                                  className={`group relative overflow-hidden rounded-lg border-2 text-right transition-all ${
                                    isSelected
                                      ? 'border-[#123624] ring-2 ring-[#C5A059]'
                                      : 'border-stone-200 hover:border-stone-400'
                                  }`}
                                  title={preset.label}
                                >
                                  <img
                                    src={preset.url}
                                    alt={preset.label}
                                    className="h-14 w-full object-cover"
                                  />
                                  <span className="block truncate bg-white px-1 py-0.5 text-[9px] font-medium text-stone-700">
                                    {preset.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <ImageUploader
                          token={token}
                          label="رفع صورة جديدة من الجهاز أو اختيار من مكتبة الوسائط"
                          value={settingsData.hero_image_url}
                          onChange={url =>
                            setSettingsData({ ...settingsData, hero_image_url: url })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: BENEFITS, CATEGORIES & PRODUCTS SECTION */}
                  {contentSubTab === 'home_sections' && (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-[#E5DAC6] bg-[#FAF7F2]/50 p-4 space-y-3">
                        <h4 className="font-bold text-[#123624]">شريط مميزات المتجر (4 بطاقات تحت البانر)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {([1, 2, 3, 4] as const).map(num => {
                            const titleKey = `benefit_${num}_title_ar` as keyof HomepageSettings;
                            const subKey = `benefit_${num}_subtitle_ar` as keyof HomepageSettings;
                            return (
                              <div key={num} className="rounded-xl border border-stone-200 bg-white p-3 space-y-2">
                                <div className="text-[11px] font-bold text-[#C5A059]">الميزة رقم {num}</div>
                                <div>
                                  <label className="block font-semibold text-stone-700 mb-1">العنوان</label>
                                  <input
                                    type="text"
                                    value={(settingsData[titleKey] as string) ?? (DEFAULT_SITE_CONTENT[titleKey as keyof typeof DEFAULT_SITE_CONTENT] as string)}
                                    onChange={e =>
                                      setSettingsData({ ...settingsData, [titleKey]: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold text-stone-700 mb-1">الوصف المختصر</label>
                                  <input
                                    type="text"
                                    value={(settingsData[subKey] as string) ?? (DEFAULT_SITE_CONTENT[subKey as keyof typeof DEFAULT_SITE_CONTENT] as string)}
                                    onChange={e =>
                                      setSettingsData({ ...settingsData, [subKey]: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#E5DAC6] bg-[#FAF7F2]/50 p-4 space-y-3">
                        <h4 className="font-bold text-[#123624]">نصوص بطاقات التصنيفات وقسم المنتجات</h4>
                        <div>
                          <label htmlFor="cms-cat-cta" className="block font-bold text-stone-700 mb-1">
                            نص الزر داخل بطاقات التصنيفات (مثل: تسوق الآن)
                          </label>
                          <input
                            id="cms-cat-cta"
                            type="text"
                            value={settingsData.category_cta_text_ar ?? DEFAULT_SITE_CONTENT.category_cta_text_ar}
                            onChange={e =>
                              setSettingsData({ ...settingsData, category_cta_text_ar: e.target.value })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="cms-prods-title" className="block font-bold text-stone-700 mb-1">
                              عنوان قسم المنتجات في الصفحة الرئيسية
                            </label>
                            <input
                              id="cms-prods-title"
                              type="text"
                              value={settingsData.products_section_title_ar ?? DEFAULT_SITE_CONTENT.products_section_title_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, products_section_title_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="cms-prods-cta" className="block font-bold text-stone-700 mb-1">
                              نص زر عرض جميع المنتجات
                            </label>
                            <input
                              id="cms-prods-cta"
                              type="text"
                              value={settingsData.products_section_cta_ar ?? DEFAULT_SITE_CONTENT.products_section_cta_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, products_section_cta_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="cms-prods-sub" className="block font-bold text-stone-700 mb-1">
                            الوصف الفرعي لقسم المنتجات
                          </label>
                          <input
                            id="cms-prods-sub"
                            type="text"
                            value={settingsData.products_section_subtitle_ar ?? DEFAULT_SITE_CONTENT.products_section_subtitle_ar}
                            onChange={e =>
                              setSettingsData({ ...settingsData, products_section_subtitle_ar: e.target.value })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: PROMO SHOWCASE BANNER */}
                  {contentSubTab === 'promo' && (
                    <div className="space-y-4 rounded-2xl border border-[#E5DAC6] bg-[#FAF7F2]/50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-[#123624]">قسم الإصدارات المختارة (الواجهة الوسطى)</h4>
                        <label className="flex items-center gap-2 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={settingsData.promo_banner_active}
                            onChange={e =>
                              setSettingsData({ ...settingsData, promo_banner_active: e.target.checked })
                            }
                          />
                          <span>إظهار القسم في الصفحة الرئيسية</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="cms-promo-title" className="block font-semibold mb-1">
                            العنوان الرئيسي للقسم
                          </label>
                          <input
                            id="cms-promo-title"
                            type="text"
                            value={settingsData.promo_banner_title_ar}
                            onChange={e =>
                              setSettingsData({ ...settingsData, promo_banner_title_ar: e.target.value })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                          />
                        </div>
                        <div>
                          <label htmlFor="cms-promo-badge" className="block font-semibold mb-1">
                            الوسم / العنوان الفرعي العلوي
                          </label>
                          <input
                            id="cms-promo-badge"
                            type="text"
                            value={settingsData.promo_banner_discount}
                            onChange={e =>
                              setSettingsData({ ...settingsData, promo_banner_discount: e.target.value })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="cms-promo-text" className="block font-semibold mb-1">
                          النص التحريري للقسم
                        </label>
                        <textarea
                          id="cms-promo-text"
                          rows={2}
                          value={settingsData.promo_banner_text_ar}
                          onChange={e =>
                            setSettingsData({ ...settingsData, promo_banner_text_ar: e.target.value })
                          }
                          className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                        />
                      </div>

                      {/* Craftsmanship Pillars inside PromoBanner */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200">
                        <div className="rounded-xl border border-stone-200 bg-white p-3 space-y-2">
                          <div className="text-[11px] font-bold text-[#C5A059]">الركيزة الأولى (الميزة 1)</div>
                          <div>
                            <label htmlFor="cms-promo-p1-title" className="block font-semibold mb-1">
                              عنوان الركيزة الأولى
                            </label>
                            <input
                              id="cms-promo-p1-title"
                              type="text"
                              value={settingsData.promo_pillar_1_title_ar ?? DEFAULT_SITE_CONTENT.promo_pillar_1_title_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, promo_pillar_1_title_ar: e.target.value })
                              }
                              className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="cms-promo-p1-text" className="block font-semibold mb-1">
                              وصف الركيزة الأولى
                            </label>
                            <textarea
                              id="cms-promo-p1-text"
                              rows={2}
                              value={settingsData.promo_pillar_1_text_ar ?? DEFAULT_SITE_CONTENT.promo_pillar_1_text_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, promo_pillar_1_text_ar: e.target.value })
                              }
                              className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                            />
                          </div>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white p-3 space-y-2">
                          <div className="text-[11px] font-bold text-[#C5A059]">الركيزة الثانية (الميزة 2)</div>
                          <div>
                            <label htmlFor="cms-promo-p2-title" className="block font-semibold mb-1">
                              عنوان الركيزة الثانية
                            </label>
                            <input
                              id="cms-promo-p2-title"
                              type="text"
                              value={settingsData.promo_pillar_2_title_ar ?? DEFAULT_SITE_CONTENT.promo_pillar_2_title_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, promo_pillar_2_title_ar: e.target.value })
                              }
                              className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="cms-promo-p2-text" className="block font-semibold mb-1">
                              وصف الركيزة الثانية
                            </label>
                            <textarea
                              id="cms-promo-p2-text"
                              rows={2}
                              value={settingsData.promo_pillar_2_text_ar ?? DEFAULT_SITE_CONTENT.promo_pillar_2_text_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, promo_pillar_2_text_ar: e.target.value })
                              }
                              className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="cms-promo-cta" className="block font-semibold mb-1">
                            نص زر الدعوة للإجراء (CTA)
                          </label>
                          <input
                            id="cms-promo-cta"
                            type="text"
                            value={settingsData.promo_cta_text_ar ?? DEFAULT_SITE_CONTENT.promo_cta_text_ar}
                            onChange={e =>
                              setSettingsData({ ...settingsData, promo_cta_text_ar: e.target.value })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                          />
                        </div>
                        <div>
                          <label htmlFor="cms-promo-delivery" className="block font-semibold mb-1">
                            ملاحظة التوصيل بجانب الزر
                          </label>
                          <input
                            id="cms-promo-delivery"
                            type="text"
                            value={settingsData.promo_delivery_note_ar ?? DEFAULT_SITE_CONTENT.promo_delivery_note_ar}
                            onChange={e =>
                              setSettingsData({ ...settingsData, promo_delivery_note_ar: e.target.value })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                          />
                        </div>
                      </div>

                      <ImageUploader
                        token={token}
                        label="صورة قسم الإصدارات المختارة"
                        value={settingsData.promo_banner_image_url || '/src/assets/images/cat_women_kaftan_1794683051308.jpg'}
                        onChange={url =>
                          setSettingsData({ ...settingsData, promo_banner_image_url: url })
                        }
                      />
                    </div>
                  )}

                  {/* SUB-TAB 4: REVIEWS & FOOTER */}
                  {contentSubTab === 'reviews_footer' && (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-[#E5DAC6] bg-[#FAF7F2]/50 p-4 space-y-3">
                        <h4 className="font-bold text-[#123624]">قسم آراء وتقييمات الزبائن</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="cms-rev-badge" className="block font-semibold mb-1">
                              الشارة العلوية للقسم
                            </label>
                            <input
                              id="cms-rev-badge"
                              type="text"
                              value={settingsData.reviews_badge_ar ?? DEFAULT_SITE_CONTENT.reviews_badge_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, reviews_badge_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="cms-rev-title" className="block font-semibold mb-1">
                              عنوان قسم التقييمات
                            </label>
                            <input
                              id="cms-rev-title"
                              type="text"
                              value={settingsData.reviews_title_ar ?? DEFAULT_SITE_CONTENT.reviews_title_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, reviews_title_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="cms-rev-sub" className="block font-semibold mb-1">
                              النص الفرعي تحت العنوان
                            </label>
                            <input
                              id="cms-rev-sub"
                              type="text"
                              value={settingsData.reviews_subtitle_ar ?? DEFAULT_SITE_CONTENT.reviews_subtitle_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, reviews_subtitle_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="cms-rev-cta" className="block font-semibold mb-1">
                              نص زر إضافة تقييم
                            </label>
                            <input
                              id="cms-rev-cta"
                              type="text"
                              value={settingsData.reviews_cta_ar ?? DEFAULT_SITE_CONTENT.reviews_cta_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, reviews_cta_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#E5DAC6] bg-[#FAF7F2]/50 p-4 space-y-3">
                        <h4 className="font-bold text-[#123624]">تذييل الموقع (Footer)</h4>
                        <div>
                          <label htmlFor="cms-footer-about" className="block font-bold text-stone-700 mb-1">
                            فقرة التعريف بالعلامة التجارية في أسفل الموقع
                          </label>
                          <textarea
                            id="cms-footer-about"
                            rows={3}
                            value={settingsData.footer_about_text_ar ?? DEFAULT_SITE_CONTENT.footer_about_text_ar}
                            onChange={e =>
                              setSettingsData({ ...settingsData, footer_about_text_ar: e.target.value })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                          />
                        </div>

                        <div>
                          <label htmlFor="cms-footer-trust" className="block font-bold text-stone-700 mb-1">
                            عبارة الثقة والضمان (تحت فقرة التعريف)
                          </label>
                          <input
                            id="cms-footer-trust"
                            type="text"
                            value={settingsData.footer_trust_badge_ar ?? DEFAULT_SITE_CONTENT.footer_trust_badge_ar}
                            onChange={e =>
                              setSettingsData({ ...settingsData, footer_trust_badge_ar: e.target.value })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label htmlFor="cms-footer-col1" className="block font-semibold mb-1">
                              عنوان العمود 1 (التصنيفات)
                            </label>
                            <input
                              id="cms-footer-col1"
                              type="text"
                              value={settingsData.footer_col_categories_title_ar ?? DEFAULT_SITE_CONTENT.footer_col_categories_title_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, footer_col_categories_title_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="cms-footer-col2" className="block font-semibold mb-1">
                              عنوان العمود 2 (الصفحات)
                            </label>
                            <input
                              id="cms-footer-col2"
                              type="text"
                              value={settingsData.footer_col_pages_title_ar ?? DEFAULT_SITE_CONTENT.footer_col_pages_title_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, footer_col_pages_title_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="cms-footer-col3" className="block font-semibold mb-1">
                              عنوان العمود 3 (التواصل)
                            </label>
                            <input
                              id="cms-footer-col3"
                              type="text"
                              value={settingsData.footer_col_contact_title_ar ?? DEFAULT_SITE_CONTENT.footer_col_contact_title_ar}
                              onChange={e =>
                                setSettingsData({ ...settingsData, footer_col_contact_title_ar: e.target.value })
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="cms-footer-copy" className="block font-semibold mb-1">
                            نص ذيل حقوق النشر (بعد اسم المتجر)
                          </label>
                          <input
                            id="cms-footer-copy"
                            type="text"
                            value={settingsData.footer_copyright_suffix_ar ?? DEFAULT_SITE_CONTENT.footer_copyright_suffix_ar}
                            onChange={e =>
                              setSettingsData({ ...settingsData, footer_copyright_suffix_ar: e.target.value })
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white p-2.5 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 5: STANDALONE PAGES (ABOUT, CONTACT, RETURN POLICY, PRIVACY & TERMS) */}
                  {contentSubTab === 'pages' && (
                    <div className="space-y-5">
                      {/* About Page */}
                      <div className="rounded-2xl border border-[#E5DAC6] bg-[#FAF7F2]/50 p-4 space-y-3">
                        <h4 className="font-bold text-[#123624]">صفحة «من نحن» (About Us)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold mb-1">العنوان التمهيدي الصغير</label>
                            <input
                              type="text"
                              value={settingsData.about_kicker_ar ?? DEFAULT_SITE_CONTENT.about_kicker_ar}
                              onChange={e => setSettingsData({ ...settingsData, about_kicker_ar: e.target.value })}
                              className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1">العنوان الرئيسي</label>
                            <input
                              type="text"
                              value={settingsData.about_title_ar ?? DEFAULT_SITE_CONTENT.about_title_ar}
                              onChange={e => setSettingsData({ ...settingsData, about_title_ar: e.target.value })}
                              className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">الفقرة الأولى (قصة المتجر)</label>
                          <textarea
                            rows={2}
                            value={settingsData.about_paragraph_1_ar ?? DEFAULT_SITE_CONTENT.about_paragraph_1_ar}
                            onChange={e => setSettingsData({ ...settingsData, about_paragraph_1_ar: e.target.value })}
                            className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">الفقرة الثانية (الرؤية)</label>
                          <textarea
                            rows={2}
                            value={settingsData.about_paragraph_2_ar ?? DEFAULT_SITE_CONTENT.about_paragraph_2_ar}
                            onChange={e => setSettingsData({ ...settingsData, about_paragraph_2_ar: e.target.value })}
                            className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold mb-1">عنوان قسم «لماذا يثق زبناؤنا»</label>
                            <input
                              type="text"
                              value={settingsData.about_why_title_ar ?? DEFAULT_SITE_CONTENT.about_why_title_ar}
                              onChange={e => setSettingsData({ ...settingsData, about_why_title_ar: e.target.value })}
                              className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1">الوصف الفرعي لقسم الثقة</label>
                            <input
                              type="text"
                              value={settingsData.about_why_subtitle_ar ?? DEFAULT_SITE_CONTENT.about_why_subtitle_ar}
                              onChange={e => setSettingsData({ ...settingsData, about_why_subtitle_ar: e.target.value })}
                              className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <ImageUploader
                            token={token}
                            label="الصورة الأولى في صفحة من نحن"
                            value={settingsData.about_image_1_url || DEFAULT_SITE_CONTENT.about_image_1_url}
                            onChange={url => setSettingsData({ ...settingsData, about_image_1_url: url })}
                          />
                          <ImageUploader
                            token={token}
                            label="الصورة الثانية في صفحة من نحن"
                            value={settingsData.about_image_2_url || DEFAULT_SITE_CONTENT.about_image_2_url}
                            onChange={url => setSettingsData({ ...settingsData, about_image_2_url: url })}
                          />
                        </div>
                      </div>

                      {/* Contact Page */}
                      <div className="rounded-2xl border border-[#E5DAC6] bg-[#FAF7F2]/50 p-4 space-y-3">
                        <h4 className="font-bold text-[#123624]">صفحة «اتصل بنا» (Contact Us)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold mb-1">الشارة التمهيدية</label>
                            <input
                              type="text"
                              value={settingsData.contact_kicker_ar ?? DEFAULT_SITE_CONTENT.contact_kicker_ar}
                              onChange={e => setSettingsData({ ...settingsData, contact_kicker_ar: e.target.value })}
                              className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1">عنوان صفحة التواصل</label>
                            <input
                              type="text"
                              value={settingsData.contact_title_ar ?? DEFAULT_SITE_CONTENT.contact_title_ar}
                              onChange={e => setSettingsData({ ...settingsData, contact_title_ar: e.target.value })}
                              className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">وصف صفحة التواصل</label>
                          <textarea
                            rows={2}
                            value={settingsData.contact_subtitle_ar ?? DEFAULT_SITE_CONTENT.contact_subtitle_ar}
                            onChange={e => setSettingsData({ ...settingsData, contact_subtitle_ar: e.target.value })}
                            className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">ملاحظة توفر خدمة الواتساب</label>
                          <input
                            type="text"
                            value={settingsData.contact_whatsapp_note_ar ?? DEFAULT_SITE_CONTENT.contact_whatsapp_note_ar}
                            onChange={e => setSettingsData({ ...settingsData, contact_whatsapp_note_ar: e.target.value })}
                            className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                          />
                        </div>
                      </div>

                      {/* Return Policy Page */}
                      <div className="rounded-2xl border border-[#E5DAC6] bg-[#FAF7F2]/50 p-4 space-y-3">
                        <h4 className="font-bold text-[#123624]">صفحة «سياسة الاستبدال والإرجاع»</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold mb-1">الشارة العلوية</label>
                            <input
                              type="text"
                              value={settingsData.return_policy_badge_ar ?? DEFAULT_SITE_CONTENT.return_policy_badge_ar}
                              onChange={e => setSettingsData({ ...settingsData, return_policy_badge_ar: e.target.value })}
                              className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1">المقدمة التعريفية</label>
                            <input
                              type="text"
                              value={settingsData.return_policy_intro_ar ?? DEFAULT_SITE_CONTENT.return_policy_intro_ar}
                              onChange={e => setSettingsData({ ...settingsData, return_policy_intro_ar: e.target.value })}
                              className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">حالات الاستبدال والإرجاع (كل نقطة في سطر جديد)</label>
                          <textarea
                            rows={3}
                            value={settingsData.return_policy_cases_ar ?? DEFAULT_SITE_CONTENT.return_policy_cases_ar}
                            onChange={e => setSettingsData({ ...settingsData, return_policy_cases_ar: e.target.value })}
                            className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">شروط قبول الطلب (كل شرط في سطر جديد)</label>
                          <textarea
                            rows={3}
                            value={settingsData.return_policy_conditions_ar ?? DEFAULT_SITE_CONTENT.return_policy_conditions_ar}
                            onChange={e => setSettingsData({ ...settingsData, return_policy_conditions_ar: e.target.value })}
                            className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">طريقة استرداد المبلغ</label>
                          <textarea
                            rows={2}
                            value={settingsData.return_policy_refund_ar ?? DEFAULT_SITE_CONTENT.return_policy_refund_ar}
                            onChange={e => setSettingsData({ ...settingsData, return_policy_refund_ar: e.target.value })}
                            className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                          />
                        </div>
                      </div>

                      {/* Privacy & Terms Page */}
                      <div className="rounded-2xl border border-[#E5DAC6] bg-[#FAF7F2]/50 p-4 space-y-3">
                        <h4 className="font-bold text-[#123624]">صفحة «سياسة الخصوصية والشروط والأحكام»</h4>
                        <div>
                          <label className="block font-semibold mb-1">المقدمة التعريفية</label>
                          <input
                            type="text"
                            value={settingsData.privacy_intro_ar ?? DEFAULT_SITE_CONTENT.privacy_intro_ar}
                            onChange={e => setSettingsData({ ...settingsData, privacy_intro_ar: e.target.value })}
                            className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">بنود سياسة الخصوصية (كل بند في سطر جديد)</label>
                          <textarea
                            rows={4}
                            value={settingsData.privacy_body_ar ?? DEFAULT_SITE_CONTENT.privacy_body_ar}
                            onChange={e => setSettingsData({ ...settingsData, privacy_body_ar: e.target.value })}
                            className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">الشروط والأحكام العامة (كل شرط في سطر جديد)</label>
                          <textarea
                            rows={4}
                            value={settingsData.terms_body_ar ?? DEFAULT_SITE_CONTENT.terms_body_ar}
                            onChange={e => setSettingsData({ ...settingsData, terms_body_ar: e.target.value })}
                            className="w-full rounded-xl border border-stone-300 bg-white p-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsData({
                          ...settingsData,
                          ...DEFAULT_SITE_CONTENT,
                        })
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 font-bold text-stone-700 hover:bg-stone-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>استعادة النصوص الافتراضية</span>
                    </button>

                    <button
                      type="submit"
                      className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-[#123624] px-6 py-3 font-bold text-white hover:bg-[#1b4d34]"
                    >
                      <Save className="h-4 w-4 text-[#C5A059]" />
                      <span>حفظ ونشر جميع تعديلات الموقع</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================
               TAB 5: REVIEWS MODERATION
               ======================================================== */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h3 className="font-amiri text-lg font-bold text-[#123624]">
                  مراجعات وتقييمات العملاء ({reviews.length})
                </h3>

                <div className="space-y-3">
                  {reviews.map(rev => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-[#E5DAC6] bg-white p-4 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#123624] text-sm">{rev.customer_name}</span>
                          <span className="text-stone-400 mr-2">({rev.customer_city || 'المغرب'})</span>
                          <span className="text-stone-500 mr-2">· المنتج: {rev.product_name_ar}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              rev.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rev.is_approved ? 'معتمد ومنشور' : 'قيد المراجعة'}
                          </span>

                          <button
                            onClick={async () => {
                              await fetch(`/api/admin/reviews/${rev.id}`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ is_approved: !rev.is_approved }),
                              });
                              fetchAdminData();
                              refreshData();
                            }}
                            className="rounded-lg bg-stone-100 px-3 py-1 font-semibold hover:bg-stone-200"
                          >
                            {rev.is_approved ? 'إخفاء' : 'قبول ونشر'}
                          </button>

                          <button
                            onClick={() => {
                              setConfirmDialog({
                                title: 'تأكيد حذف التقييم',
                                message: `هل تريد حذف تقييم الزبون "${rev.customer_name}" نهائياً؟`,
                                onConfirm: async () => {
                                  const res = await fetch(`/api/admin/reviews/${rev.id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` },
                                  });
                                  if (!res.ok) {
                                    showToast('تعذر حذف التقييم', 'error');
                                    return;
                                  }
                                  await fetchAdminData();
                                  await refreshData();
                                  showToast('تم حذف التقييم بنجاح');
                                },
                              });
                            }}
                            className="text-stone-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-stone-700 bg-stone-50 p-2.5 rounded-xl">"{rev.comment}"</p>

                      {/* Admin Reply Input */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="اكتب رد المتجر على هذا الزبون..."
                          defaultValue={rev.admin_reply || ''}
                          onKeyDown={async e => {
                            if (e.key === 'Enter') {
                              const input = e.currentTarget.value;
                              await fetch(`/api/admin/reviews/${rev.id}`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ admin_reply: input }),
                              });
                              fetchAdminData();
                              refreshData();
                            }
                          }}
                          className="flex-1 rounded-lg border border-stone-300 p-2 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================
               TAB 6: MESSAGES INBOX
               ======================================================== */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <h3 className="font-amiri text-lg font-bold text-[#123624]">
                  صندوق رسائل واستفسارات الزبائن ({messages.length})
                </h3>

                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="rounded-xl border border-stone-200 bg-white p-10 text-center text-stone-400">
                      لا توجد رسائل حالياً
                    </div>
                  ) : (
                    messages.map(m => (
                      <div
                        key={m.id}
                        className={`rounded-2xl border p-4 text-xs space-y-2 ${
                          m.is_read ? 'border-[#E5DAC6] bg-white' : 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-sm text-[#123624]">{m.name}</span>
                            <span className="mr-3 font-mono text-stone-600">{m.phone}</span>
                            {m.email && <span className="mr-2 text-stone-500">({m.email})</span>}
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`السلام عليكم ${m.name}، بخصوص رسالتكم إلى الدار المغربية...`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#20ba59]"
                            >
                              <span>رد عبر واتساب</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>

                            <button
                              onClick={async () => {
                                await fetch(`/api/admin/messages/${m.id}`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ is_read: !m.is_read }),
                                });
                                fetchAdminData();
                              }}
                              className="rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700"
                            >
                              {m.is_read ? 'تحديد كغير مقروءة' : 'تحديد كمقروءة'}
                            </button>

                            <button
                              onClick={() => {
                                setConfirmDialog({
                                  title: 'تأكيد حذف الرسالة',
                                  message: `هل تريد حذف رسالة "${m.name}"؟`,
                                  onConfirm: async () => {
                                    const res = await fetch(`/api/admin/messages/${m.id}`, {
                                      method: 'DELETE',
                                      headers: { Authorization: `Bearer ${token}` },
                                    });
                                    if (!res.ok) {
                                      showToast('تعذر حذف الرسالة', 'error');
                                      return;
                                    }
                                    await fetchAdminData();
                                    showToast('تم حذف الرسالة بنجاح');
                                  },
                                });
                              }}
                              className="text-stone-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="font-bold text-stone-800">{m.subject}</div>
                        <p className="text-stone-700 bg-stone-50 p-3 rounded-xl leading-relaxed">
                          {m.message}
                        </p>
                        <span className="text-[10px] text-stone-400">
                          بتاريخ: {new Date(m.created_at).toLocaleString('ar-MA')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ========================================================
               TAB 7: STORE SETTINGS, THEME COLORS & SECURITY CREDENTIALS
               ======================================================== */}
            {activeTab === 'settings' && settingsData && (
              <div className="space-y-6 max-w-3xl">
                {/* Site Theme & Color Palette Card */}
                <div className="space-y-4 rounded-2xl border border-[#E5DAC6] bg-white p-6 shadow-xs text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-[#C5A059]" />
                      <div>
                        <h3 className="font-amiri text-lg font-bold text-[#123624]">
                          ألوان ومظهر الموقع (هوية المتجر)
                        </h3>
                        <p className="text-[11px] text-stone-500">
                          اختر لوحة ألوان مغربية جاهزة أو خصص الألوان الأربعة بحرية مع معاينة فورية
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const next = {
                          ...settingsData,
                          theme_primary_color: DEFAULT_THEME_COLORS.primary,
                          theme_accent_color: DEFAULT_THEME_COLORS.accent,
                          theme_bg_color: DEFAULT_THEME_COLORS.bg,
                          theme_dark_color: DEFAULT_THEME_COLORS.dark,
                        };
                        setSettingsData(next);
                        applyThemePaletteToRoot(buildThemePalette(next));
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-stone-300 px-3 py-1.5 text-[11px] font-bold text-stone-700 hover:bg-stone-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>استعادة الألوان الافتراضية</span>
                    </button>
                  </div>

                  {/* Preset Palettes */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-2">
                      لوحات ألوان مغربية مقترحة:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {MOROCCAN_THEME_PRESETS.map(preset => {
                        const isActive =
                          (settingsData.theme_primary_color || DEFAULT_THEME_COLORS.primary).toLowerCase() ===
                            preset.primary.toLowerCase() &&
                          (settingsData.theme_accent_color || DEFAULT_THEME_COLORS.accent).toLowerCase() ===
                            preset.accent.toLowerCase();

                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              const next = {
                                ...settingsData,
                                theme_primary_color: preset.primary,
                                theme_accent_color: preset.accent,
                                theme_bg_color: preset.bg,
                                theme_dark_color: preset.dark,
                              };
                              setSettingsData(next);
                              applyThemePaletteToRoot(buildThemePalette(next));
                            }}
                            className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-right transition-all ${
                              isActive
                                ? 'border-[#123624] bg-[#FAF7F2] ring-2 ring-[#C5A059]/60'
                                : 'border-stone-200 bg-white hover:border-stone-400'
                            }`}
                          >
                            <div className="flex w-full items-center justify-between">
                              <span className="font-bold text-stone-900">{preset.name}</span>
                              {isActive && <Check className="h-4 w-4 text-emerald-700" />}
                            </div>
                            <span className="text-[10px] text-stone-500 leading-tight">
                              {preset.description}
                            </span>
                            <div className="flex items-center gap-1.5 pt-1">
                              <span
                                className="h-5 w-5 rounded-md border border-black/15"
                                style={{ backgroundColor: preset.primary }}
                                title="اللون الأساسي"
                              />
                              <span
                                className="h-5 w-5 rounded-md border border-black/15"
                                style={{ backgroundColor: preset.accent }}
                                title="اللون التكميلي"
                              />
                              <span
                                className="h-5 w-5 rounded-md border border-black/15"
                                style={{ backgroundColor: preset.bg }}
                                title="الخلفية"
                              />
                              <span
                                className="h-5 w-5 rounded-md border border-black/15"
                                style={{ backgroundColor: preset.dark }}
                                title="التذييل الداكن"
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-stone-200 pt-3">
                    {[
                      {
                        key: 'theme_primary_color' as const,
                        label: 'اللون الأساسي للموقع (الأزرار والعناوين)',
                        fallback: DEFAULT_THEME_COLORS.primary,
                      },
                      {
                        key: 'theme_accent_color' as const,
                        label: 'اللون الذهبي / التكميلي (اللمسات والزخارف)',
                        fallback: DEFAULT_THEME_COLORS.accent,
                      },
                      {
                        key: 'theme_bg_color' as const,
                        label: 'لون خلفية الصفحات العام',
                        fallback: DEFAULT_THEME_COLORS.bg,
                      },
                      {
                        key: 'theme_dark_color' as const,
                        label: 'اللون الداكن للتذييل والشريط العلوي',
                        fallback: DEFAULT_THEME_COLORS.dark,
                      },
                    ].map(field => {
                      const currentVal = settingsData[field.key] || field.fallback;
                      return (
                        <div key={field.key} className="rounded-xl border border-stone-200 bg-stone-50/70 p-3">
                          <label className="block font-bold text-stone-700 mb-2">
                            {field.label}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={/^#[0-9a-fA-F]{6}$/.test(currentVal) ? currentVal : field.fallback}
                              onChange={e => {
                                const next = { ...settingsData, [field.key]: e.target.value };
                                setSettingsData(next);
                                applyThemePaletteToRoot(buildThemePalette(next));
                              }}
                              className="h-9 w-12 cursor-pointer rounded-lg border border-stone-300 bg-white p-0.5"
                            />
                            <input
                              type="text"
                              dir="ltr"
                              value={currentVal}
                              onChange={e => {
                                const next = { ...settingsData, [field.key]: e.target.value };
                                setSettingsData(next);
                                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value.trim())) {
                                  applyThemePaletteToRoot(buildThemePalette(next));
                                }
                              }}
                              className="flex-1 rounded-lg border border-stone-300 bg-white px-2.5 py-2 font-mono text-xs"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Live Theme Mini Preview Bar */}
                  <div
                    className="rounded-xl border p-4 transition-colors"
                    style={{
                      backgroundColor: settingsData.theme_bg_color || DEFAULT_THEME_COLORS.bg,
                      borderColor: settingsData.theme_accent_color || DEFAULT_THEME_COLORS.accent,
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span
                          className="text-[11px] font-bold"
                          style={{ color: settingsData.theme_accent_color || DEFAULT_THEME_COLORS.accent }}
                        >
                          معاينة فورية لتناسق الألوان
                        </span>
                        <h4
                          className="font-amiri text-lg font-bold"
                          style={{ color: settingsData.theme_primary_color || DEFAULT_THEME_COLORS.primary }}
                        >
                          {settingsData.store_name || 'الأصالة المغربية'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded-lg px-4 py-2 text-[11px] font-bold text-white"
                          style={{ backgroundColor: settingsData.theme_primary_color || DEFAULT_THEME_COLORS.primary }}
                        >
                          زر الشراء الرئيسي
                        </span>
                        <span
                          className="rounded-lg px-3 py-2 text-[11px] font-bold text-white"
                          style={{ backgroundColor: settingsData.theme_dark_color || DEFAULT_THEME_COLORS.dark }}
                        >
                          شريط التذييل
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const res = await fetch('/api/admin/settings', {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(settingsData),
                      });
                      if (!res.ok) {
                        showToast('تعذر حفظ ألوان الموقع', 'error');
                        return;
                      }
                      await refreshData();
                      showToast('تم حفظ وتطبيق ألوان الموقع على جميع صفحات المتجر!');
                    }}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#123624] py-3 font-bold text-white hover:bg-[#1b4d34]"
                  >
                    <Palette className="h-4 w-4 text-[#C5A059]" />
                    <span>حفظ وتطبيق ألوان الموقع</span>
                  </button>
                </div>

                <div className="space-y-4 rounded-2xl border border-[#E5DAC6] bg-white p-6 shadow-xs text-xs">
                  <h3 className="font-amiri text-lg font-bold text-[#123624] border-b pb-2">
                    إعدادات المتجر والشحن والمدفوعات
                  </h3>

                  <form
                    onSubmit={async e => {
                      e.preventDefault();
                      const res = await fetch('/api/admin/settings', {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(settingsData),
                      });
                      if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        showToast(errData.error || 'تعذر حفظ إعدادات المتجر', 'error');
                        return;
                      }
                      await refreshData();
                      showToast('تم حفظ جميع إعدادات المتجر بنجاح!');
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1">اسم المتجر</label>
                        <input
                          type="text"
                          value={settingsData.store_name}
                          onChange={e =>
                            setSettingsData({ ...settingsData, store_name: e.target.value })
                          }
                          className="w-full rounded-xl border border-stone-300 p-2.5"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">المدينة والمقر</label>
                        <input
                          type="text"
                          value={settingsData.store_city}
                          onChange={e =>
                            setSettingsData({ ...settingsData, store_city: e.target.value })
                          }
                          className="w-full rounded-xl border border-stone-300 p-2.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1">رقم الواتساب الرسمي</label>
                        <input
                          type="text"
                          value={settingsData.store_whatsapp}
                          onChange={e =>
                            setSettingsData({ ...settingsData, store_whatsapp: e.target.value })
                          }
                          className="w-full rounded-xl border border-stone-300 p-2.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">هاتف الاتصال</label>
                        <input
                          type="text"
                          value={settingsData.store_phone}
                          onChange={e =>
                            setSettingsData({ ...settingsData, store_phone: e.target.value })
                          }
                          className="w-full rounded-xl border border-stone-300 p-2.5 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1">تكلفة الشحن القياسية (د.م.)</label>
                        <input
                          type="number"
                          value={settingsData.shipping_fee}
                          onChange={e =>
                            setSettingsData({ ...settingsData, shipping_fee: Number(e.target.value) })
                          }
                          className="w-full rounded-xl border border-stone-300 p-2.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">حد الشحن المجاني (د.م.)</label>
                        <input
                          type="number"
                          value={settingsData.free_shipping_threshold}
                          onChange={e =>
                            setSettingsData({
                              ...settingsData,
                              free_shipping_threshold: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-xl border border-stone-300 p-2.5 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex gap-6 border-t border-stone-200 pt-3">
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={settingsData.enable_cod}
                          onChange={e =>
                            setSettingsData({ ...settingsData, enable_cod: e.target.checked })
                          }
                        />
                        <span>تفعيل الدفع عند الاستلام (COD)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={settingsData.enable_online_payment}
                          onChange={e =>
                            setSettingsData({
                              ...settingsData,
                              enable_online_payment: e.target.checked,
                            })
                          }
                        />
                        <span>تفعيل الدفع الإلكتروني بالبطاقة البنكية (CMI)</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#123624] py-3 font-bold text-white hover:bg-[#1b4d34]"
                    >
                      <Save className="h-4 w-4 text-[#C5A059]" />
                      <span>حفظ جميع الإعدادات</span>
                    </button>
                  </form>
                </div>

                {/* Admin Credentials Security Card */}
                <div className="space-y-4 rounded-2xl border border-[#E5DAC6] bg-white p-6 shadow-xs text-xs">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <KeyRound className="h-4 w-4 text-[#C5A059]" />
                    <h3 className="font-amiri text-lg font-bold text-[#123624]">
                      أمان حساب الإدارة وتغيير كلمة المرور
                    </h3>
                  </div>

                  <form
                    onSubmit={async e => {
                      e.preventDefault();
                      if (pwForm.new_password !== pwForm.confirm_password) {
                        showToast('كلمة المرور الجديدة وتأكيدها غير متطابقتين', 'error');
                        return;
                      }
                      const res = await fetch('/api/admin/change-password', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          current_password: pwForm.current_password,
                          new_username: pwForm.new_username || undefined,
                          new_password: pwForm.new_password,
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        showToast(data.error || 'فشل تحديث بيانات الدخول', 'error');
                        return;
                      }
                      if (data.token && data.user) {
                        updateSession(data.token, data.user);
                      }
                      setPwForm({
                        current_password: '',
                        new_username: '',
                        new_password: '',
                        confirm_password: '',
                      });
                      showToast('تم تحديث بيانات دخول المدير وتشفيرها بنجاح!');
                    }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1">اسم المستخدم الحالي / الجديد (اختياري)</label>
                        <input
                          type="text"
                          placeholder={adminUser?.username || 'اسم المستخدم'}
                          value={pwForm.new_username}
                          onChange={e => setPwForm({ ...pwForm, new_username: e.target.value })}
                          className="w-full rounded-xl border border-stone-300 p-2.5"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">كلمة المرور الحالية *</label>
                        <input
                          type="password"
                          required
                          value={pwForm.current_password}
                          onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })}
                          className="w-full rounded-xl border border-stone-300 p-2.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1">كلمة المرور الجديدة (8 أحرف فأكثر) *</label>
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={pwForm.new_password}
                          onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
                          className="w-full rounded-xl border border-stone-300 p-2.5"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">تأكيد كلمة المرور الجديدة *</label>
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={pwForm.confirm_password}
                          onChange={e => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                          className="w-full rounded-xl border border-stone-300 p-2.5"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#123624] bg-[#FAF7F2] py-2.5 font-bold text-[#123624] hover:bg-[#123624] hover:text-white transition-all"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>تحديث كلمة المرور وتأمين الحساب</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Confirmation Dialog Modal (replaces native confirm()) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
          <div className="w-full max-w-md rounded-2xl border border-[#E5DAC6] bg-white p-6 text-right shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h4 className="font-amiri text-lg font-bold">{confirmDialog.title}</h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  await action();
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                نعم، تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Order Invoice Modal (replaces window.open) */}
      {invoicePreviewOrder && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 p-4 overflow-y-auto print:static print:bg-white print:p-0">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-8 text-right shadow-2xl print:shadow-none print:max-w-none print:rounded-none">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5 no-print">
              <h3 className="font-amiri text-lg font-bold text-[#123624]">
                معاينة وطباعة الفاتورة — {invoicePreviewOrder.order_number}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#123624] px-4 py-2 text-xs font-bold text-white hover:bg-[#1b4d34]"
                >
                  <Printer className="h-4 w-4 text-[#C5A059]" />
                  <span>طباعة الفاتورة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoicePreviewOrder(null)}
                  className="rounded-xl border border-stone-300 p-2 text-stone-600 hover:bg-stone-100"
                  aria-label="إغلاق الفاتورة"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div dir="rtl" className="space-y-5 text-xs text-stone-800">
              <div className="flex items-start justify-between border-b-2 border-[#123624] pb-3">
                <div>
                  <h2 className="font-amiri text-2xl font-bold text-[#123624]">
                    {settingsData?.store_name || 'الأصالة المغربية للأزياء التقليدية'}
                  </h2>
                  <p className="text-[11px] text-stone-500 mt-0.5">وصل تسليم وفاتورة بيع رسمية</p>
                </div>
                <div className="text-left">
                  <div className="font-mono text-sm font-bold text-[#123624]">
                    {invoicePreviewOrder.order_number}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    التاريخ: {new Date(invoicePreviewOrder.created_at).toLocaleDateString('ar-MA')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-stone-50 p-4 border border-stone-200">
                <div className="space-y-1">
                  <strong className="block text-[#123624]">بيانات الزبون:</strong>
                  <div>الاسم: {invoicePreviewOrder.customer_name}</div>
                  <div className="font-mono">الهاتف: {invoicePreviewOrder.customer_phone}</div>
                  <div>
                    طريقة الدفع:{' '}
                    {invoicePreviewOrder.payment_method === 'COD'
                      ? 'الدفع نقداً عند الاستلام'
                      : 'بطاقة بنكية'}
                  </div>
                </div>
                <div className="space-y-1">
                  <strong className="block text-[#123624]">عنوان التوصيل بالمغرب:</strong>
                  <div>الجهة: {invoicePreviewOrder.region_name_ar}</div>
                  <div>
                    المدينة: {invoicePreviewOrder.province_name_ar}
                    {invoicePreviewOrder.commune_name_ar &&
                    invoicePreviewOrder.commune_name_ar !== invoicePreviewOrder.province_name_ar
                      ? ` - ${invoicePreviewOrder.commune_name_ar}`
                      : ''}
                  </div>
                  <div>العنوان: {invoicePreviewOrder.address_line}</div>
                </div>
              </div>

              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#123624] text-white">
                    <th className="p-2.5 text-right">المنتج</th>
                    <th className="p-2.5 text-right">المقاس</th>
                    <th className="p-2.5 text-right">اللون</th>
                    <th className="p-2.5 text-right">الكمية</th>
                    <th className="p-2.5 text-right">سعر الوحدة</th>
                    <th className="p-2.5 text-right">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicePreviewOrder.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-stone-200">
                      <td className="p-2.5 font-semibold">{item.product_name}</td>
                      <td className="p-2.5">{item.size}</td>
                      <td className="p-2.5">{item.color_name}</td>
                      <td className="p-2.5 font-mono">{item.quantity}</td>
                      <td className="p-2.5 font-mono">{formatMAD(item.unit_price)}</td>
                      <td className="p-2.5 font-mono font-bold">{formatMAD(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mr-auto w-full sm:w-64 space-y-1.5 border-t border-stone-200 pt-3">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono">{formatMAD(invoicePreviewOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>مصاريف التوصيل:</span>
                  <span className="font-mono">
                    {invoicePreviewOrder.shipping_cost === 0
                      ? 'مجاني'
                      : formatMAD(invoicePreviewOrder.shipping_cost)}
                  </span>
                </div>
                <div className="flex justify-between border-t-2 border-[#123624] pt-2 text-sm font-bold text-[#B35432]">
                  <span>المبلغ الإجمالي للدفع:</span>
                  <span className="font-mono">{formatMAD(invoicePreviewOrder.total_amount)}</span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-3 text-center text-[11px] text-stone-500">
                نشكركم على ثقتكم في أصالة أزياءنا التقليدية المغربية | هاتف:{' '}
                {settingsData?.store_phone || ''} | واتساب: {settingsData?.store_whatsapp || ''}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
