import React, { useState, useRef } from 'react';
import { MediaFile } from '../../types/store.ts';
import { Upload, Image as ImageIcon, FolderOpen, X, Trash2, Check, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  token: string | null;
  value?: string;
  onChange?: (url: string) => void;
  onMultipleUploaded?: (urls: string[]) => void;
  multiple?: boolean;
  accept?: string;
  label?: string;
  helperText?: string;
  compact?: boolean;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('تعذر قراءة الملف'));
      }
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف من الجهاز'));
    reader.readAsDataURL(file);
  });
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  token,
  value,
  onChange,
  onMultipleUploaded,
  multiple = false,
  accept = 'image/jpeg,image/png,image/webp,image/gif,image/avif',
  label,
  helperText,
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryFiles, setLibraryFiles] = useState<MediaFile[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const uploadFiles = async (files: FileList | File[]) => {
    if (!token) {
      setError('انتهت جلسة الدخول، يرجى إعادة تسجيل الدخول');
      return;
    }
    const list = Array.from(files);
    if (list.length === 0) return;

    setError(null);
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of list) {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`الملف "${file.name}" يتجاوز الحد الأقصى المسموح (10 ميجابايت)`);
        }
        const dataBase64 = await readFileAsBase64(file);
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filename: file.name,
            mime_type: file.type || 'image/jpeg',
            data_base64: dataBase64,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || `تعذر رفع الملف ${file.name}`);
        }
        uploadedUrls.push(data.url);
      }

      if (multiple && onMultipleUploaded && uploadedUrls.length > 0) {
        onMultipleUploaded(uploadedUrls);
      } else if (onChange && uploadedUrls[0]) {
        onChange(uploadedUrls[0]);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء رفع الملف');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openLibrary = async () => {
    if (!token) return;
    setLibraryOpen(true);
    setLoadingLibrary(true);
    try {
      const res = await fetch('/api/admin/media', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLibraryFiles(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!token) return;
    await fetch(`/api/admin/media/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setLibraryFiles(prev => prev.filter(m => m.id !== id));
  };

  const isVideo = Boolean(
    value && (accept.includes('video') || value.endsWith('.mp4') || value.endsWith('.webm'))
  );

  return (
    <div className="space-y-2 text-right">
      {label && <label className="block font-bold text-stone-700 text-xs">{label}</label>}

      <div
        onDragOver={e => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={e => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files?.length) {
            uploadFiles(e.dataTransfer.files);
          }
        }}
        className={`rounded-2xl border-2 border-dashed transition-all p-3 ${
          dragActive
            ? 'border-[#123624] bg-emerald-50/50'
            : 'border-[#D5C9B3] bg-[#FAF7F2]/60 hover:border-[#123624]/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={e => e.target.files && uploadFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-wrap items-center gap-3">
          {!multiple && value && (
            <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-300 bg-white">
              {isVideo ? (
                <video src={value} className="h-full w-full object-cover" muted />
              ) : (
                <img src={value} alt="معاينة" className="h-full w-full object-cover" />
              )}
            </div>
          )}

          <div className="flex-1 min-w-[180px] space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl bg-[#123624] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#1b4d34] disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5 text-[#C5A059]" />
                )}
                <span>
                  {uploading
                    ? 'جاري الرفع إلى قاعدة البيانات...'
                    : multiple
                    ? 'رفع صور متعددة من الجهاز'
                    : 'رفع ملف من الجهاز'}
                </span>
              </button>

              {!multiple && (
                <button
                  type="button"
                  onClick={openLibrary}
                  className="flex items-center gap-1.5 rounded-xl border border-[#D5C9B3] bg-white px-3 py-2 text-xs font-semibold text-[#123624] hover:border-[#123624]"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span>مكتبة الملفات</span>
                </button>
              )}

              {!multiple && onChange && (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] text-stone-500 hover:text-[#123624] underline"
                >
                  {showUrlInput ? 'إخفاء المسار' : 'مسار يدوي'}
                </button>
              )}
            </div>

            {!compact && (
              <p className="text-[11px] text-stone-500">
                {helperText || 'اسحب الملف وأفلته هنا أو اضغط لاختياره من جهازك (يُحفظ مباشرة في قاعدة البيانات)'}
              </p>
            )}
          </div>
        </div>

        {showUrlInput && !multiple && onChange && (
          <div className="mt-2.5 pt-2.5 border-t border-stone-200">
            <input
              type="text"
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              placeholder="/api/media/... أو مسار الصورة"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-left"
              dir="ltr"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[11px] text-red-700">
          {error}
        </div>
      )}

      {/* Media Library Modal */}
      {libraryOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-[#D5C9B3] bg-[#FAF7F2] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E5DAC6] bg-white px-5 py-3.5">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#123624]" />
                <h4 className="font-amiri text-lg font-bold text-[#123624]">
                  مكتبة الملفات المحفوظة في قاعدة البيانات ({libraryFiles.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setLibraryOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {loadingLibrary ? (
                <div className="py-12 text-center text-xs text-stone-500">جاري تحميل المكتبة...</div>
              ) : libraryFiles.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500">
                  لا توجد ملفات مرفوعة في قاعدة البيانات بعد. قم برفع أول صورة من جهازك!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {libraryFiles.map(file => {
                    const isSelected = value === file.url;
                    return (
                      <div
                        key={file.id}
                        className={`group relative overflow-hidden rounded-xl border bg-white p-2 flex flex-col gap-1.5 ${
                          isSelected ? 'border-[#123624] ring-2 ring-[#C5A059]' : 'border-stone-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (onChange) onChange(file.url);
                            setLibraryOpen(false);
                          }}
                          className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-100"
                        >
                          {file.mime_type.startsWith('video/') ? (
                            <video src={file.url} className="h-full w-full object-cover" muted />
                          ) : (
                            <img src={file.url} alt={file.filename} className="h-full w-full object-cover" />
                          )}
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 rounded-full bg-[#123624] p-1 text-white">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </button>
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <span className="truncate text-stone-600 flex-1">{file.filename}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(file.id)}
                            className="text-stone-400 hover:text-red-600 p-0.5"
                            title="حذف الملف من القاعدة"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
