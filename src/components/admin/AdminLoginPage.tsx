import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const { login } = useAdminAuth();
  const { settings } = useStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const storeName = settings.store_name || 'الأصالة المغربية';

  useEffect(() => {
    document.title = `تسجيل دخول الإدارة | ${storeName}`;
  }, [storeName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setLoginError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoginError(null);
    setLoggingIn(true);
    const res = await login(username.trim(), password);
    setLoggingIn(false);

    if (!res.success) {
      setLoginError(res.error || 'بيانات الدخول غير صحيحة');
    } else {
      onLoginSuccess();
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-[var(--brand-bg)] text-[#1E2522] grid grid-cols-1 lg:grid-cols-12"
    >
      {/* Brand Architectural Side Panel (Right in RTL) */}
      <aside className="relative hidden lg:flex lg:col-span-5 flex-col justify-between overflow-hidden bg-[var(--brand-primary)] p-10 text-[#FAF7F2]">
        {/* Subtle Moroccan Geometric Star Pattern */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="admin-moroccan-star"
              width="72"
              height="72"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M36 4 L44 28 L68 36 L44 44 L36 68 L28 44 L4 36 L28 28 Z"
                fill="none"
                stroke="#C5A059"
                strokeWidth="1.2"
              />
              <circle cx="36" cy="36" r="6" fill="none" stroke="#C5A059" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-moroccan-star)" />
        </svg>

        {/* Top Brand Emblem */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C5A059]/40 bg-white/10 text-[var(--brand-accent)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="font-amiri text-2xl font-bold tracking-wide text-[#FAF7F2]">
              {storeName}
            </p>
            <p className="text-xs text-[#E5DAC6]/80">بوابة الإدارة المستقلة</p>
          </div>
        </div>

        {/* Center Editorial Statement */}
        <div className="relative z-10 my-12 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-lg border border-[#C5A059]/35 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#E8CF96]">
            <ShieldCheck className="h-4 w-4" />
            <span>منطقة إدارية محمية ومستقلة</span>
          </div>

          <h1 className="font-amiri text-4xl font-bold leading-snug text-white">
            تحكّم كامل في متجرك التقليدي بكل أمان وسلاسة
          </h1>

          <p className="max-w-md text-sm leading-relaxed text-[#E5DAC6]/85">
            إدارة الطلبات الواردة، المنتجات والتشكيلات، الصور، الألوان، ومحتوى الصفحات من
            لوحة تحكم مركزية منفصلة تماماً عن واجهة الزبناء.
          </p>

          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs text-[#E5DAC6]">
              <KeyRound className="h-4 w-4 shrink-0 text-[#C5A059]" />
              <span>جلسات دخول مشفّرة ومحمية على مستوى الخادم</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#E5DAC6]">
              <Lock className="h-4 w-4 shrink-0 text-[#C5A059]" />
              <span>فصل كامل بين لوحة الإدارة وواجهة المتجر العامة</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-[11px] text-[#E5DAC6]/70">
          <span>{storeName} · نظام إدارة المتجر</span>
          <span>صُنع بالمملكة المغربية</span>
        </div>
      </aside>

      {/* Standalone Login Form Section (Left in RTL / Full Width on Mobile) */}
      <main className="lg:col-span-7 flex flex-col justify-between px-5 py-8 sm:px-10 md:px-14">
        {/* Top Utility Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-[var(--brand-accent)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-amiri text-lg font-bold text-[var(--brand-primary)]">
              {storeName}
            </span>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="mr-auto lg:mr-0 inline-flex items-center gap-2 rounded-xl border border-[var(--brand-border)] bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>العودة إلى واجهة المتجر</span>
          </button>
        </div>

        {/* Centered Login Card */}
        <div className="mx-auto my-10 w-full max-w-md">
          <div className="rounded-2xl border border-[#D5C9B3] bg-white p-7 sm:p-8 shadow-sm">
            <div className="mb-6 border-b border-[var(--brand-border)] pb-5">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-[var(--brand-accent)]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="font-amiri text-2xl font-bold text-[var(--brand-primary)]">
                تسجيل دخول الإدارة
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                أدخل بيانات حساب المسؤول للوصول إلى لوحة التحكم الخاصة بـ {storeName}.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {loginError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="admin-username"
                  className="mb-1.5 block text-xs font-semibold text-stone-700"
                >
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    id="admin-username"
                    name="username"
                    type="text"
                    required
                    autoFocus
                    autoComplete="username"
                    placeholder="أدخل اسم المستخدم"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-[#D5C9B3] bg-stone-50/60 py-3 pr-10 pl-3.5 text-sm text-[#1E2522] transition-colors focus:border-[var(--brand-primary)] focus:bg-white focus:outline-none"
                  />
                  <User className="pointer-events-none absolute top-3.5 right-3 h-4 w-4 text-stone-400" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-xs font-semibold text-stone-700"
                >
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#D5C9B3] bg-stone-50/60 py-3 pr-10 pl-10 text-sm text-[#1E2522] transition-colors focus:border-[var(--brand-primary)] focus:bg-white focus:outline-none"
                  />
                  <Lock className="pointer-events-none absolute top-3.5 right-3 h-4 w-4 text-stone-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    className="absolute top-2.5 left-2.5 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جاري التحقق من الهوية...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-[var(--brand-accent)]" />
                    <span>تسجيل الدخول إلى لوحة التحكم</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Subtle Footer Note */}
        <div className="text-center text-[11px] text-stone-500">
          صفحة دخول مخصصة لإدارة المتجر فقط · المسار المحمي{' '}
          <span className="font-mono text-stone-600" dir="ltr">
            /admin/login
          </span>
        </div>
      </main>
    </div>
  );
};
