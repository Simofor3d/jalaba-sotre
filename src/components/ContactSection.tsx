import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { DEFAULT_SITE_CONTENT, resolveSiteText } from '../utils/siteContent.ts';
import { Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { settings } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('يرجى ملء الاسم ورقم الهاتف ونص الرسالة');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'تعذر إرسال الرسالة، يرجى المحاولة ثانية');
        return;
      }
      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (e: any) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact-section" className="bg-[var(--brand-bg)] py-16 border-b border-[var(--brand-border)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 text-right">
          {/* Right Info in RTL (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold text-[var(--brand-accent)] uppercase tracking-wider">
                {resolveSiteText(settings.contact_kicker_ar, DEFAULT_SITE_CONTENT.contact_kicker_ar)}
              </span>
              <h2 className="font-amiri text-3xl font-bold text-[var(--brand-primary)] sm:text-4xl mt-1">
                {resolveSiteText(settings.contact_title_ar, DEFAULT_SITE_CONTENT.contact_title_ar)}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                {resolveSiteText(
                  settings.contact_subtitle_ar,
                  DEFAULT_SITE_CONTENT.contact_subtitle_ar
                )}
              </p>
            </div>

            <div className="space-y-4">
              {/* WhatsApp direct card */}
              <a
                href={`https://wa.me/${settings.store_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('السلام عليكم، أود التواصل مع خدمة العملاء')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 transition-all hover:bg-emerald-100 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">محادثة واتساب الفورية</h4>
                  <p className="text-[11px] text-emerald-800 font-mono mt-0.5">{settings.store_whatsapp}</p>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {resolveSiteText(
                      settings.contact_whatsapp_note_ar,
                      DEFAULT_SITE_CONTENT.contact_whatsapp_note_ar
                    )}
                  </span>
                </div>
              </a>

              {/* Phone */}
              <div className="flex items-center gap-4 rounded-2xl border border-[var(--brand-border)] bg-white p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-[var(--brand-accent)]">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[var(--brand-primary)]">الهاتف المباشر</h4>
                  <p className="text-[11px] text-stone-600 font-mono mt-0.5">{settings.store_phone}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 rounded-2xl border border-[var(--brand-border)] bg-white p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-[var(--brand-accent)]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[var(--brand-primary)]">البريد الإلكتروني</h4>
                  <p className="text-[11px] text-stone-600 mt-0.5">{settings.store_email}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4 rounded-2xl border border-[var(--brand-border)] bg-white p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-[var(--brand-accent)]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[var(--brand-primary)]">المقر والورشة التقليدية</h4>
                  <p className="text-[11px] text-stone-600 mt-0.5">{settings.store_city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Left Contact Form in RTL (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[#D5C9B3] bg-white p-6 sm:p-8 shadow-sm">
              <h3 className="font-amiri text-xl font-bold text-[var(--brand-primary)] mb-1">
                أرسل لنا رسالة أو استفساراً
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                سيتواصل معكم أحد مستشارينا في أقرب وقت لتلبية رغباتكم.
              </p>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle2 className="h-14 w-14 text-emerald-600 mb-3" />
                  <h4 className="font-amiri text-xl font-bold text-[var(--brand-primary)]">
                    تم استلام رسالتكم بنجاح
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm">
                    شكراً لتواصلكم، سيتصل بكم فريق خدمة الزبائن عبر الهاتف أو الواتساب قريباً.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 rounded-xl bg-[var(--brand-primary)] px-5 py-2 text-xs font-semibold text-white"
                  >
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        الاسم الكامل <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: يونس العلمي"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full rounded-xl border border-[#D5C9B3] p-2.5 text-xs text-[#1E2522] focus:border-[var(--brand-primary)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        رقم الهاتف <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="06XXXXXXXX أو 07XXXXXXXX"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-[#D5C9B3] p-2.5 text-xs font-mono text-[#1E2522] focus:border-[var(--brand-primary)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        البريد الإلكتروني <span className="text-stone-400">(اختياري)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-[#D5C9B3] p-2.5 text-xs text-[#1E2522] focus:border-[var(--brand-primary)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        موضوع الاستفسار
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: تفصيل جلابة، قياس خاص، توصيل..."
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full rounded-xl border border-[#D5C9B3] p-2.5 text-xs text-[#1E2522] focus:border-[var(--brand-primary)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      نص الرسالة <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="اكتب استفسارك بالتفصيل وسنجيبك بكل سرور..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full rounded-xl border border-[#D5C9B3] p-3 text-xs text-[#1E2522] focus:border-[var(--brand-primary)] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] py-3.5 text-xs font-bold text-[#FAF7F2] shadow-md hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 transition-all"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? 'جاري الإرسال...' : 'إرسال الرسالة الآن'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
