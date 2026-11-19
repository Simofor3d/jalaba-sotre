import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MediaFile } from '../../types/store.ts';
import { buildTableHtml, buildVideoEmbedHtml, sanitizeProductHtml } from '../../utils/richText.ts';
import {
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Baseline,
  Highlighter,
  RemoveFormatting,
  Pilcrow,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  ListOrdered,
  List,
  Outdent,
  Indent,
  Link2,
  Table,
  Smile,
  Omega,
  Minus,
  Code2,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Video,
  ChevronDown,
  Upload,
  FolderOpen,
  X,
  Loader2,
  Check,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  token: string | null;
  placeholder?: string;
  minHeight?: number;
}

type OpenPopover =
  | null
  | 'fontSize'
  | 'textColor'
  | 'bgColor'
  | 'formatBlock'
  | 'align'
  | 'link'
  | 'table'
  | 'emoji'
  | 'special'
  | 'image'
  | 'video';

const FONT_SIZES = [
  { label: '12', px: '12px', execSize: '1' },
  { label: '14', px: '14px', execSize: '2' },
  { label: '16', px: '16px', execSize: '3' },
  { label: '18', px: '18px', execSize: '4' },
  { label: '22', px: '22px', execSize: '5' },
  { label: '28', px: '28px', execSize: '6' },
  { label: '34', px: '34px', execSize: '7' },
];

const TEXT_COLORS = [
  '#1E2522',
  '#123624',
  '#C5A059',
  '#B35432',
  '#7C2D12',
  '#1D4ED8',
  '#047857',
  '#6B21A8',
  '#DC2626',
  '#57534E',
  '#FFFFFF',
];

const HIGHLIGHT_COLORS = [
  'transparent',
  '#FEF3C7',
  '#DCFCE7',
  '#DBEAFE',
  '#FCE7F3',
  '#F3E8FF',
  '#FFEDD5',
  '#F5F5F4',
];

const EMOJI_LIST = [
  '✨',
  '⭐',
  '🌟',
  '👑',
  '💎',
  '🧵',
  '🪡',
  '👗',
  '🧥',
  '🇲🇦',
  '📦',
  '🚚',
  '✅',
  '💯',
  '🔥',
  '🎁',
  '❤️',
  '🤍',
  '💚',
  '👌',
  '👏',
  '🌿',
  '🕌',
  '🎉',
];

const SPECIAL_CHARS = [
  '«',
  '»',
  '—',
  '–',
  '·',
  '•',
  '✓',
  '✕',
  '★',
  '☆',
  '♥',
  '♦',
  '©',
  '®',
  '™',
  '§',
  '°',
  '±',
  '×',
  '÷',
  '€',
  '$',
  '£',
  '‰',
];

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('تعذر قراءة الملف'));
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف من الجهاز'));
    reader.readAsDataURL(file);
  });
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  token,
  placeholder = 'اكتب وصف المنتج بالتفصيل هنا... يمكنك تنسيق الخطوط وإضافة صور وجداول وفيديوهات',
  minHeight = 230,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastEmittedRef = useRef<string>(value || '');
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCodeView, setIsCodeView] = useState(false);
  const [openPopover, setOpenPopover] = useState<OpenPopover>(null);
  const [currentFontSize, setCurrentFontSize] = useState('14');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    orderedList: false,
    unorderedList: false,
  });

  // Popover form states
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);

  const [tableHover, setTableHover] = useState({ rows: 3, cols: 3 });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageAltInput, setImageAltInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<MediaFile[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [showLibraryGrid, setShowLibraryGrid] = useState(false);

  // Sync external value into contentEditable when product switches or resets
  useEffect(() => {
    const normalized = value || '';
    if (!isCodeView && editorRef.current && normalized !== lastEmittedRef.current) {
      editorRef.current.innerHTML = normalized;
      lastEmittedRef.current = normalized;
    }
  }, [value, isCodeView]);

  // Initialize content on mount or when leaving code view
  useEffect(() => {
    if (!isCodeView && editorRef.current) {
      editorRef.current.innerHTML = value || '';
      lastEmittedRef.current = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCodeView]);

  const refreshActiveFormats = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strike: document.queryCommandState('strikeThrough'),
        orderedList: document.queryCommandState('insertOrderedList'),
        unorderedList: document.queryCommandState('insertUnorderedList'),
      });
    } catch {
      // ignore queryCommandState failures in detached nodes
    }
  }, []);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const emitChange = () => {
    if (!editorRef.current) return;
    const rawHtml = editorRef.current.innerHTML;
    // Treat empty browser artifacts like <br> as empty string
    const cleaned = rawHtml === '<br>' || rawHtml === '<p><br></p>' ? '' : rawHtml;
    lastEmittedRef.current = cleaned;
    onChange(cleaned);
    refreshActiveFormats();
  };

  const execCommand = (command: string, commandValue?: string) => {
    if (isCodeView) return;
    restoreSelection();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const insertHtmlAtCursor = (html: string) => {
    if (isCodeView) {
      const next = `${value || ''}${html}`;
      lastEmittedRef.current = next;
      onChange(next);
      return;
    }
    restoreSelection();
    document.execCommand('insertHTML', false, html);
    emitChange();
  };

  const togglePopover = (target: OpenPopover) => {
    if (openPopover === target) {
      setOpenPopover(null);
      return;
    }
    saveSelection();
    setMediaError(null);
    setShowLibraryGrid(false);
    if (target === 'link') {
      const selText = window.getSelection()?.toString() || '';
      setLinkText(selText);
      setLinkUrl('https://');
    }
    setOpenPopover(target);
  };

  const applyFontSize = (sizeObj: { label: string; px: string; execSize: string }) => {
    setCurrentFontSize(sizeObj.label);
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      document.execCommand('fontSize', false, sizeObj.execSize);
      // Replace legacy <font size="..."> with clean inline style span for exact px control
      if (editorRef.current) {
        editorRef.current.querySelectorAll('font[size]').forEach(fontEl => {
          const span = document.createElement('span');
          span.style.fontSize = sizeObj.px;
          span.innerHTML = fontEl.innerHTML;
          fontEl.replaceWith(span);
        });
      }
      emitChange();
    } else {
      insertHtmlAtCursor(`<span style="font-size: ${sizeObj.px}">&#8203;</span>`);
    }
    setOpenPopover(null);
  };

  const handleInsertLink = () => {
    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl || /^javascript:/i.test(trimmedUrl)) {
      setMediaError('يرجى إدخال رابط صالح يبدأ بـ https:// أو /');
      return;
    }
    const label = (linkText.trim() || trimmedUrl).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeHref = trimmedUrl.replace(/"/g, '&quot;');
    const targetAttr = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    insertHtmlAtCursor(`<a href="${safeHref}"${targetAttr}>${label}</a> `);
    setOpenPopover(null);
  };

  const handleInsertTable = (rows: number, cols: number) => {
    insertHtmlAtCursor(buildTableHtml(rows, cols));
    setOpenPopover(null);
  };

  const handleUploadMedia = async (file: File, kind: 'image' | 'video') => {
    if (!token) {
      setMediaError('انتهت جلسة المسؤول، يرجى إعادة تسجيل الدخول');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMediaError('حجم الملف يتجاوز الحد الأقصى المسموح (10 ميجابايت)');
      return;
    }
    setMediaError(null);
    setUploadingMedia(true);
    try {
      const dataBase64 = await readFileAsBase64(file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          mime_type: file.type || (kind === 'image' ? 'image/jpeg' : 'video/mp4'),
          data_base64: dataBase64,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'تعذر رفع الملف إلى قاعدة البيانات');
      }

      if (kind === 'image') {
        const alt = (imageAltInput.trim() || file.name).replace(/"/g, '&quot;');
        insertHtmlAtCursor(
          `<figure class="rich-figure"><img src="${data.url}" alt="${alt}" /></figure><p><br /></p>`
        );
      } else {
        const embed = buildVideoEmbedHtml(data.url);
        if (embed) {
          insertHtmlAtCursor(`${embed}<p><br /></p>`);
        }
      }
      setImageAltInput('');
      setOpenPopover(null);
    } catch (err: any) {
      setMediaError(err.message || 'فشل رفع الملف');
    } finally {
      setUploadingMedia(false);
      if (imageFileInputRef.current) imageFileInputRef.current.value = '';
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  const loadLibrary = async () => {
    if (!token) return;
    setShowLibraryGrid(true);
    setLoadingLibrary(true);
    try {
      const res = await fetch('/api/admin/media', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMediaLibrary(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleInsertImageUrl = () => {
    const clean = imageUrlInput.trim();
    if (!clean || /^javascript:/i.test(clean)) {
      setMediaError('يرجى إدخال مسار أو رابط صورة صحيح');
      return;
    }
    const alt = (imageAltInput.trim() || 'صورة المنتج').replace(/"/g, '&quot;');
    const safeSrc = clean.replace(/"/g, '&quot;');
    insertHtmlAtCursor(
      `<figure class="rich-figure"><img src="${safeSrc}" alt="${alt}" /></figure><p><br /></p>`
    );
    setImageUrlInput('');
    setImageAltInput('');
    setOpenPopover(null);
  };

  const handleInsertVideoUrl = () => {
    const embed = buildVideoEmbedHtml(videoUrlInput);
    if (!embed) {
      setMediaError('الرابط غير مدعوم — أدخل رابط YouTube أو Vimeo أو رابط فيديو MP4 / WebM مباشر');
      return;
    }
    insertHtmlAtCursor(`${embed}<p><br /></p>`);
    setVideoUrlInput('');
    setOpenPopover(null);
  };

  const toolbarBtnClass = (active = false) =>
    `flex h-8 min-w-[30px] items-center justify-center gap-0.5 rounded-md px-1.5 text-stone-700 transition-colors cursor-pointer ${
      active
        ? 'bg-[#123624]/15 text-[#123624] font-bold'
        : 'hover:bg-stone-100 hover:text-[#123624]'
    } disabled:opacity-35 disabled:cursor-not-allowed`;

  const isEmptyVisual = !value || value.replace(/<[^>]*>/g, '').trim() === '' && !/<(img|video|iframe|table|hr)/i.test(value);

  const editorBody = (
    <div
      className={`flex flex-col overflow-visible rounded-xl border border-stone-300 bg-white shadow-2xs transition-all ${
        isFullscreen ? 'fixed inset-4 z-[80] shadow-2xl border-[#123624]' : 'relative w-full'
      }`}
    >
      {/* Hidden File Inputs for direct SQLite uploads */}
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleUploadMedia(file, 'image');
        }}
      />
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleUploadMedia(file, 'video');
        }}
      />

      {/* ============================================================
          TOOLBAR (2 ROWS — MATCHING REFERENCE SCREENSHOT)
         ============================================================ */}
      <div
        dir="ltr"
        className="relative select-none border-b border-stone-200 bg-white px-2.5 py-2 rounded-t-xl space-y-1.5"
      >
        {/* ROW 1 */}
        <div className="flex flex-wrap items-center gap-1">
          {/* 1. Fullscreen */}
          <button
            type="button"
            title={isFullscreen ? 'تصغير المحرر' : 'ملء الشاشة'}
            aria-label={isFullscreen ? 'تصغير المحرر' : 'ملء الشاشة'}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={toolbarBtnClass(isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* 2. Bold */}
          <button
            type="button"
            disabled={isCodeView}
            title="عريض (Bold)"
            aria-label="عريض"
            onMouseDown={e => e.preventDefault()}
            onClick={() => execCommand('bold')}
            className={toolbarBtnClass(activeFormats.bold)}
          >
            <Bold className="h-4 w-4" />
          </button>

          {/* 3. Italic */}
          <button
            type="button"
            disabled={isCodeView}
            title="مائل (Italic)"
            aria-label="مائل"
            onMouseDown={e => e.preventDefault()}
            onClick={() => execCommand('italic')}
            className={toolbarBtnClass(activeFormats.italic)}
          >
            <Italic className="h-4 w-4" />
          </button>

          {/* 4. Underline */}
          <button
            type="button"
            disabled={isCodeView}
            title="تسطير (Underline)"
            aria-label="تسطير"
            onMouseDown={e => e.preventDefault()}
            onClick={() => execCommand('underline')}
            className={toolbarBtnClass(activeFormats.underline)}
          >
            <Underline className="h-4 w-4" />
          </button>

          {/* 5. Strikethrough */}
          <button
            type="button"
            disabled={isCodeView}
            title="يتوسطه خط (Strikethrough)"
            aria-label="يتوسطه خط"
            onMouseDown={e => e.preventDefault()}
            onClick={() => execCommand('strikeThrough')}
            className={toolbarBtnClass(activeFormats.strike)}
          >
            <Strikethrough className="h-4 w-4" />
          </button>

          {/* 6. Font Size Dropdown */}
          <div className="relative">
            <button
              type="button"
              disabled={isCodeView}
              title="حجم الخط"
              aria-label="حجم الخط"
              onMouseDown={e => e.preventDefault()}
              onClick={() => togglePopover('fontSize')}
              className={toolbarBtnClass(openPopover === 'fontSize')}
            >
              <span className="text-xs font-semibold font-mono">{currentFontSize}</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            {openPopover === 'fontSize' && (
              <div className="absolute left-0 top-full z-40 mt-1 w-24 rounded-xl border border-stone-200 bg-white py-1 shadow-xl">
                {FONT_SIZES.map(sz => (
                  <button
                    key={sz.label}
                    type="button"
                    onClick={() => applyFontSize(sz)}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-xs hover:bg-stone-100 ${
                      currentFontSize === sz.label ? 'font-bold text-[#123624] bg-stone-50' : 'text-stone-700'
                    }`}
                  >
                    <span>{sz.label}px</span>
                    {currentFontSize === sz.label && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 7. Text Color */}
          <div className="relative">
            <button
              type="button"
              disabled={isCodeView}
              title="لون النص"
              aria-label="لون النص"
              onMouseDown={e => e.preventDefault()}
              onClick={() => togglePopover('textColor')}
              className={toolbarBtnClass(openPopover === 'textColor')}
            >
              <Baseline className="h-4 w-4" />
            </button>
            {openPopover === 'textColor' && (
              <div
                dir="rtl"
                className="absolute left-0 top-full z-40 mt-1 w-48 rounded-xl border border-stone-200 bg-white p-2.5 shadow-xl space-y-2"
              >
                <div className="text-[11px] font-bold text-stone-600">اختر لون النص:</div>
                <div className="grid grid-cols-6 gap-1.5">
                  {TEXT_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        execCommand('foreColor', color);
                        setOpenPopover(null);
                      }}
                      className="h-6 w-6 rounded-md border border-stone-300 transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 8. Clear Formatting */}
          <button
            type="button"
            disabled={isCodeView}
            title="إزالة التنسيق"
            aria-label="إزالة التنسيق"
            onMouseDown={e => e.preventDefault()}
            onClick={() => execCommand('removeFormat')}
            className={toolbarBtnClass()}
          >
            <RemoveFormatting className="h-4 w-4" />
          </button>

          {/* 9. Highlight Color */}
          <div className="relative">
            <button
              type="button"
              disabled={isCodeView}
              title="تمييز خلفية النص"
              aria-label="تمييز خلفية النص"
              onMouseDown={e => e.preventDefault()}
              onClick={() => togglePopover('bgColor')}
              className={toolbarBtnClass(openPopover === 'bgColor')}
            >
              <Highlighter className="h-4 w-4" />
            </button>
            {openPopover === 'bgColor' && (
              <div
                dir="rtl"
                className="absolute left-0 top-full z-40 mt-1 w-44 rounded-xl border border-stone-200 bg-white p-2.5 shadow-xl space-y-2"
              >
                <div className="text-[11px] font-bold text-stone-600">لون التمييز:</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {HIGHLIGHT_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        execCommand('hiliteColor', color);
                        setOpenPopover(null);
                      }}
                      className="h-6 w-full rounded-md border border-stone-300 text-[9px] hover:scale-105"
                      style={{ backgroundColor: color === 'transparent' ? '#ffffff' : color }}
                      title={color === 'transparent' ? 'بدون تمييز' : color}
                    >
                      {color === 'transparent' ? '✕' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 10. Paragraph / Heading Format (¶) */}
          <div className="relative">
            <button
              type="button"
              disabled={isCodeView}
              title="نمط الفقرة والعناوين"
              aria-label="نمط الفقرة والعناوين"
              onMouseDown={e => e.preventDefault()}
              onClick={() => togglePopover('formatBlock')}
              className={toolbarBtnClass(openPopover === 'formatBlock')}
            >
              <Pilcrow className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            {openPopover === 'formatBlock' && (
              <div
                dir="rtl"
                className="absolute left-0 top-full z-40 mt-1 w-44 rounded-xl border border-stone-200 bg-white py-1 shadow-xl text-right"
              >
                {[
                  { tag: 'P', label: 'فقرة عادية', cls: 'text-xs' },
                  { tag: 'H1', label: 'عنوان رئيسي (H1)', cls: 'text-base font-bold text-[#123624]' },
                  { tag: 'H2', label: 'عنوان فرعي (H2)', cls: 'text-sm font-bold text-[#123624]' },
                  { tag: 'H3', label: 'عنوان صغير (H3)', cls: 'text-xs font-bold text-stone-800' },
                  { tag: 'BLOCKQUOTE', label: 'اقتباس مميز', cls: 'text-xs italic text-stone-600' },
                ].map(item => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => {
                      execCommand('formatBlock', `<${item.tag}>`);
                      setOpenPopover(null);
                    }}
                    className={`block w-full px-3 py-1.5 text-right hover:bg-stone-100 ${item.cls}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 11. Alignment Dropdown */}
          <div className="relative">
            <button
              type="button"
              disabled={isCodeView}
              title="محاذاة النص"
              aria-label="محاذاة النص"
              onMouseDown={e => e.preventDefault()}
              onClick={() => togglePopover('align')}
              className={toolbarBtnClass(openPopover === 'align')}
            >
              <AlignRight className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            {openPopover === 'align' && (
              <div className="absolute left-0 top-full z-40 mt-1 flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl">
                <button
                  type="button"
                  title="محاذاة لليمين"
                  onClick={() => {
                    execCommand('justifyRight');
                    setOpenPopover(null);
                  }}
                  className={toolbarBtnClass()}
                >
                  <AlignRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="توسيط"
                  onClick={() => {
                    execCommand('justifyCenter');
                    setOpenPopover(null);
                  }}
                  className={toolbarBtnClass()}
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="محاذاة لليسار"
                  onClick={() => {
                    execCommand('justifyLeft');
                    setOpenPopover(null);
                  }}
                  className={toolbarBtnClass()}
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="ضبط النص"
                  onClick={() => {
                    execCommand('justifyFull');
                    setOpenPopover(null);
                  }}
                  className={toolbarBtnClass()}
                >
                  <AlignJustify className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* 12. Ordered List */}
          <button
            type="button"
            disabled={isCodeView}
            title="قائمة مرقمة"
            aria-label="قائمة مرقمة"
            onMouseDown={e => e.preventDefault()}
            onClick={() => execCommand('insertOrderedList')}
            className={toolbarBtnClass(activeFormats.orderedList)}
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          {/* 13. Unordered List */}
          <button
            type="button"
            disabled={isCodeView}
            title="قائمة نقطية"
            aria-label="قائمة نقطية"
            onMouseDown={e => e.preventDefault()}
            onClick={() => execCommand('insertUnorderedList')}
            className={toolbarBtnClass(activeFormats.unorderedList)}
          >
            <List className="h-4 w-4" />
          </button>

          {/* 14. Outdent */}
          <button
            type="button"
            disabled={isCodeView}
            title="تقليل المسافة البادئة"
            aria-label="تقليل المسافة البادئة"
            onMouseDown={e => e.preventDefault()}
            onClick={() => execCommand('outdent')}
            className={toolbarBtnClass()}
          >
            <Outdent className="h-4 w-4" />
          </button>

          {/* 15. Indent */}
          <button
            type="button"
            disabled={isCodeView}
            title="زيادة المسافة البادئة"
            aria-label="زيادة المسافة البادئة"
            onMouseDown={e => e.preventDefault()}
            onClick={() => execCommand('indent')}
            className={toolbarBtnClass()}
          >
            <Indent className="h-4 w-4" />
          </button>

          {/* 16. Insert Link */}
          <div className="relative">
            <button
              type="button"
              disabled={isCodeView}
              title="إدراج رابط"
              aria-label="إدراج رابط"
              onMouseDown={e => e.preventDefault()}
              onClick={() => togglePopover('link')}
              className={toolbarBtnClass(openPopover === 'link')}
            >
              <Link2 className="h-4 w-4" />
            </button>
            {openPopover === 'link' && (
              <div
                dir="rtl"
                className="absolute right-0 sm:left-0 top-full z-40 mt-1 w-72 rounded-xl border border-stone-200 bg-white p-3 shadow-xl space-y-2.5 text-right"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#123624]">إدراج رابط</span>
                  <button type="button" onClick={() => setOpenPopover(null)} className="text-stone-400 hover:text-stone-700">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="النص الظاهر للرابط"
                  value={linkText}
                  onChange={e => setLinkText(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs"
                />
                <input
                  type="url"
                  dir="ltr"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-left"
                />
                <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkNewTab}
                    onChange={e => setLinkNewTab(e.target.checked)}
                  />
                  <span>فتح الرابط في نافذة جديدة</span>
                </label>
                {mediaError && <p className="text-[11px] text-red-600">{mediaError}</p>}
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="w-full rounded-lg bg-[#123624] py-1.5 text-xs font-bold text-white hover:bg-[#1b4d34]"
                >
                  إدراج الرابط
                </button>
              </div>
            )}
          </div>

          {/* 17. Insert Table */}
          <div className="relative">
            <button
              type="button"
              disabled={isCodeView}
              title="إدراج جدول"
              aria-label="إدراج جدول"
              onMouseDown={e => e.preventDefault()}
              onClick={() => togglePopover('table')}
              className={toolbarBtnClass(openPopover === 'table')}
            >
              <Table className="h-4 w-4" />
            </button>
            {openPopover === 'table' && (
              <div
                dir="rtl"
                className="absolute right-0 top-full z-40 mt-1 w-52 rounded-xl border border-stone-200 bg-white p-3 shadow-xl space-y-2 text-right"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-[#123624]">
                  <span>اختر أبعاد الجدول</span>
                  <span className="font-mono text-stone-500">
                    {tableHover.rows} × {tableHover.cols}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1" dir="ltr">
                  {Array.from({ length: 5 }).map((_, rIdx) =>
                    Array.from({ length: 6 }).map((__, cIdx) => {
                      const active = rIdx < tableHover.rows && cIdx < tableHover.cols;
                      return (
                        <button
                          key={`${rIdx}-${cIdx}`}
                          type="button"
                          onMouseEnter={() => setTableHover({ rows: rIdx + 1, cols: cIdx + 1 })}
                          onClick={() => handleInsertTable(rIdx + 1, cIdx + 1)}
                          className={`h-5 w-5 rounded border transition-colors ${
                            active
                              ? 'border-[#123624] bg-[#123624]/20'
                              : 'border-stone-200 bg-stone-50 hover:border-stone-400'
                          }`}
                        />
                      );
                    })
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleInsertTable(tableHover.rows, tableHover.cols)}
                  className="w-full rounded-lg bg-[#123624] py-1.5 text-[11px] font-bold text-white hover:bg-[#1b4d34]"
                >
                  إدراج جدول ({tableHover.rows} صفوف × {tableHover.cols} أعمدة)
                </button>
              </div>
            )}
          </div>

          {/* 18. Emoji Picker */}
          <div className="relative">
            <button
              type="button"
              disabled={isCodeView}
              title="إدراج رمز تعبيري"
              aria-label="إدراج رمز تعبيري"
              onMouseDown={e => e.preventDefault()}
              onClick={() => togglePopover('emoji')}
              className={toolbarBtnClass(openPopover === 'emoji')}
            >
              <Smile className="h-4 w-4" />
            </button>
            {openPopover === 'emoji' && (
              <div className="absolute right-0 top-full z-40 mt-1 w-56 rounded-xl border border-stone-200 bg-white p-2.5 shadow-xl">
                <div className="grid grid-cols-6 gap-1">
                  {EMOJI_LIST.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        insertHtmlAtCursor(em);
                        setOpenPopover(null);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-base hover:bg-stone-100"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 19. Special Characters (Ω) */}
          <div className="relative">
            <button
              type="button"
              disabled={isCodeView}
              title="رموز خاصة"
              aria-label="رموز خاصة"
              onMouseDown={e => e.preventDefault()}
              onClick={() => togglePopover('special')}
              className={toolbarBtnClass(openPopover === 'special')}
            >
              <Omega className="h-4 w-4" />
            </button>
            {openPopover === 'special' && (
              <div className="absolute right-0 top-full z-40 mt-1 w-56 rounded-xl border border-stone-200 bg-white p-2.5 shadow-xl">
                <div className="grid grid-cols-6 gap-1">
                  {SPECIAL_CHARS.map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => {
                        insertHtmlAtCursor(ch);
                        setOpenPopover(null);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 20. Horizontal Rule */}
          <button
            type="button"
            disabled={isCodeView}
            title="إدراج خط فاصل"
            aria-label="إدراج خط فاصل"
            onMouseDown={e => e.preventDefault()}
            onClick={() => execCommand('insertHorizontalRule')}
            className={toolbarBtnClass()}
          >
            <Minus className="h-4 w-4" />
          </button>

          {/* 21. Code View (<>) */}
          <button
            type="button"
            title={isCodeView ? 'العودة للعرض المرئي' : 'عرض كود HTML'}
            aria-label={isCodeView ? 'العودة للعرض المرئي' : 'عرض كود HTML'}
            onClick={() => {
              setOpenPopover(null);
              if (!isCodeView && editorRef.current) {
                const current = editorRef.current.innerHTML;
                lastEmittedRef.current = current;
                onChange(current);
              }
              setIsCodeView(!isCodeView);
            }}
            className={toolbarBtnClass(isCodeView)}
          >
            <Code2 className="h-4 w-4" />
          </button>
        </div>

        {/* ROW 2: Undo, Redo, Insert Image, Insert Video */}
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          {/* Undo */}
          <button
            type="button"
            disabled={isCodeView}
            title="تراجع (Undo)"
            aria-label="تراجع"
            onMouseDown={e => e.preventDefault()}
            onClick={() => execCommand('undo')}
            className={toolbarBtnClass()}
          >
            <Undo2 className="h-4 w-4" />
          </button>

          {/* Redo */}
          <button
            type="button"
            disabled={isCodeView}
            title="إعادة (Redo)"
            aria-label="إعادة"
            onMouseDown={e => e.preventDefault()}
            onClick={() => execCommand('redo')}
            className={toolbarBtnClass()}
          >
            <Redo2 className="h-4 w-4" />
          </button>

          {/* Insert Image (Upload to DB / Media Library / URL) */}
          <div className="relative">
            <button
              type="button"
              title="إدراج صورة داخل الوصف"
              aria-label="إدراج صورة داخل الوصف"
              onMouseDown={e => e.preventDefault()}
              onClick={() => togglePopover('image')}
              className={toolbarBtnClass(openPopover === 'image')}
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            {openPopover === 'image' && (
              <div
                dir="rtl"
                className="absolute left-0 top-full z-40 mt-1 w-80 rounded-xl border border-stone-200 bg-white p-3.5 shadow-xl space-y-3 text-right"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#123624]">إدراج صورة في وصف المنتج</span>
                  <button type="button" onClick={() => setOpenPopover(null)} className="text-stone-400 hover:text-stone-700">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={uploadingMedia}
                    onClick={() => imageFileInputRef.current?.click()}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#123624] px-3 py-2 text-xs font-bold text-white hover:bg-[#1b4d34] disabled:opacity-50"
                  >
                    {uploadingMedia ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 text-[#C5A059]" />}
                    <span>{uploadingMedia ? 'جاري الرفع...' : 'رفع من الجهاز'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={loadLibrary}
                    className="flex items-center gap-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                  >
                    <FolderOpen className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>المكتبة</span>
                  </button>
                </div>

                {showLibraryGrid && (
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-stone-200 bg-stone-50 p-2">
                    {loadingLibrary ? (
                      <div className="py-4 text-center text-[11px] text-stone-500">جاري التحميل...</div>
                    ) : mediaLibrary.filter(m => m.mime_type.startsWith('image/')).length === 0 ? (
                      <div className="py-4 text-center text-[11px] text-stone-500">لا توجد صور مرفوعة بعد</div>
                    ) : (
                      <div className="grid grid-cols-4 gap-1.5">
                        {mediaLibrary
                          .filter(m => m.mime_type.startsWith('image/'))
                          .map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                insertHtmlAtCursor(
                                  `<figure class="rich-figure"><img src="${m.url}" alt="${m.filename.replace(/"/g, '&quot;')}" /></figure><p><br /></p>`
                                );
                                setOpenPopover(null);
                              }}
                              className="aspect-square overflow-hidden rounded-md border border-stone-200 hover:border-[#123624]"
                            >
                              <img src={m.url} alt={m.filename} className="h-full w-full object-cover" />
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5 border-t border-stone-100 pt-2">
                  <input
                    type="text"
                    placeholder="أو الصق رابط/مسار صورة مباشر..."
                    dir="ltr"
                    value={imageUrlInput}
                    onChange={e => setImageUrlInput(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-left"
                  />
                  <input
                    type="text"
                    placeholder="وصف الصورة (اختياري)"
                    value={imageAltInput}
                    onChange={e => setImageAltInput(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs"
                  />
                  {mediaError && <p className="text-[11px] text-red-600">{mediaError}</p>}
                  <button
                    type="button"
                    onClick={handleInsertImageUrl}
                    className="w-full rounded-lg border border-[#123624] py-1.5 text-xs font-bold text-[#123624] hover:bg-[#123624]/5"
                  >
                    إدراج الصورة بالرابط
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Insert Video (Upload MP4/WebM to DB or YouTube/Vimeo link) */}
          <div className="relative">
            <button
              type="button"
              title="إدراج فيديو داخل الوصف"
              aria-label="إدراج فيديو داخل الوصف"
              onMouseDown={e => e.preventDefault()}
              onClick={() => togglePopover('video')}
              className={toolbarBtnClass(openPopover === 'video')}
            >
              <Video className="h-4 w-4" />
            </button>
            {openPopover === 'video' && (
              <div
                dir="rtl"
                className="absolute left-0 top-full z-40 mt-1 w-80 rounded-xl border border-stone-200 bg-white p-3.5 shadow-xl space-y-3 text-right"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#123624]">إدراج فيديو في وصف المنتج</span>
                  <button type="button" onClick={() => setOpenPopover(null)} className="text-stone-400 hover:text-stone-700">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={uploadingMedia}
                  onClick={() => videoFileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#123624] px-3 py-2 text-xs font-bold text-white hover:bg-[#1b4d34] disabled:opacity-50"
                >
                  {uploadingMedia ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 text-[#C5A059]" />}
                  <span>{uploadingMedia ? 'جاري رفع الفيديو...' : 'رفع فيديو MP4/WebM من الجهاز'}</span>
                </button>

                <div className="space-y-1.5 border-t border-stone-100 pt-2">
                  <label className="block text-[11px] font-semibold text-stone-600">
                    أو أدخل رابط YouTube / Vimeo / MP4:
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrlInput}
                    onChange={e => setVideoUrlInput(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-left"
                  />
                  {mediaError && <p className="text-[11px] text-red-600">{mediaError}</p>}
                  <button
                    type="button"
                    onClick={handleInsertVideoUrl}
                    className="w-full rounded-lg border border-[#123624] py-1.5 text-xs font-bold text-[#123624] hover:bg-[#123624]/5"
                  >
                    إدراج الفيديو
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          EDITING AREA (WYSIWYG OR HTML CODE VIEW)
         ============================================================ */}
      {isCodeView ? (
        <textarea
          dir="ltr"
          aria-label="كود HTML لوصف المنتج"
          value={value || ''}
          onChange={e => {
            lastEmittedRef.current = e.target.value;
            onChange(e.target.value);
          }}
          onBlur={e => {
            const sanitized = sanitizeProductHtml(e.target.value);
            lastEmittedRef.current = sanitized;
            onChange(sanitized);
          }}
          style={{ minHeight: isFullscreen ? 'calc(100vh - 150px)' : `${minHeight}px` }}
          className="w-full flex-1 resize-y rounded-b-xl bg-stone-950 p-4 font-mono text-xs text-emerald-300 focus:outline-none text-left"
          placeholder="<p>أدخل كود HTML هنا...</p>"
        />
      ) : (
        <div
          className="relative flex-1 overflow-y-auto rounded-b-xl bg-white"
          style={{ minHeight: isFullscreen ? 'calc(100vh - 150px)' : `${minHeight}px` }}
          onClick={() => {
            if (openPopover) setOpenPopover(null);
          }}
        >
          {isEmptyVisual && (
            <div className="pointer-events-none absolute top-4 right-4 left-4 text-xs text-stone-400 select-none">
              {placeholder}
            </div>
          )}
          <div
            ref={editorRef}
            role="textbox"
            aria-multiline="true"
            aria-label="محرر وصف المنتج التفصيلي"
            contentEditable
            suppressContentEditableWarning
            dir="rtl"
            onInput={emitChange}
            onKeyUp={refreshActiveFormats}
            onMouseUp={() => {
              saveSelection();
              refreshActiveFormats();
            }}
            onBlur={() => {
              saveSelection();
              emitChange();
            }}
            className="rich-content h-full min-h-[inherit] w-full p-4 text-right text-sm text-[#1E2522] focus:outline-none"
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[75] bg-black/60 backdrop-blur-xs"
          onClick={() => setIsFullscreen(false)}
        />
      )}
      {editorBody}
    </>
  );
};
