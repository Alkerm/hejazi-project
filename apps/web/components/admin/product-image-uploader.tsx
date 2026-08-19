'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, CheckCircle2, Loader2, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { toast } from 'sonner';

interface ProductImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

export function ProductImageUploader({
  value,
  onChange,
  label,
  required = false,
}: ProductImageUploaderProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error(
        t('Invalid file format. Please upload JPG, PNG, WebP, or GIF.', 'صيغة غير مدعومة. يرجى رفع صورة بصيغة JPG أو PNG أو WebP أو GIF.')
      );
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        t('Image is too large. Maximum size is 5MB.', 'حجم الصورة كبير جداً. الحد الأقصى المسموح به 5 ميجابايت.')
      );
      return;
    }

    setUploading(true);
    try {
      const res = await api.adminUploadImage(file);
      onChange(res.url);
      toast.success(t('Product image uploaded successfully!', 'تم رفع صورة المنتج بنجاح!'));
    } catch (err: any) {
      toast.error(err.message || t('Failed to upload image', 'فشل في رفع الصورة'));
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
          <span>{label || t('Product Image', 'صورة المنتج')}</span>
          {required && <span className="text-rose-500 font-extrabold">*</span>}
        </label>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>
            {showUrlInput
              ? t('Switch to direct device upload', 'التبديل إلى رفع ملف من الجهاز')
              : t('Or paste external image URL', 'أو إدخال رابط خارجي يدوياً')}
          </span>
        </button>
      </div>

      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

      {/* Mode 1: Manual URL text input */}
      {showUrlInput ? (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/images/product.jpg"
            className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
          />
          {value && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <img
                src={value}
                alt="Preview"
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{t('Image Link Preview', 'معاينة الرابط')}</p>
                <p className="text-[11px] text-slate-400 truncate">{value}</p>
              </div>
            </div>
          )}
        </div>
      ) : value ? (
        /* Mode 2: Image Preview Card with Replace / Delete buttons */
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-slate-50/80 border border-slate-200/80 transition-all">
          <div className="relative aspect-square w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-xs">
            <img
              src={value}
              alt="Product Preview"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-2xs flex items-center justify-center text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1 text-center sm:text-left rtl:sm:text-right">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 mb-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{t('Image Uploaded & Ready', 'تم رفع الصورة وجاهزة')}</span>
            </div>
            <p className="text-xs font-bold text-slate-800 truncate">
              {value.split('/').pop() || 'product-image.jpg'}
            </p>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              {value}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${uploading ? 'animate-spin' : ''}`} />
              <span>{t('Change Image', 'تغيير الصورة')}</span>
            </button>

            <button
              type="button"
              disabled={uploading}
              onClick={() => onChange('')}
              className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition cursor-pointer disabled:opacity-50"
              title={t('Remove Image', 'حذف الصورة')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Mode 3: Drag & Drop Dropzone Box */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`group rounded-3xl border-2 border-dashed p-8 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
            isDragOver
              ? 'border-amber-500 bg-amber-50/40 ring-4 ring-amber-500/10'
              : 'border-slate-300 hover:border-amber-400 bg-slate-50/60 hover:bg-amber-50/20'
          }`}
        >
          {uploading ? (
            <div className="py-3 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs font-bold text-slate-700">
                {t('Uploading image to server...', 'جاري رفع وحفظ الصورة...')}
              </p>
            </div>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-800">
                  {t('Click to upload or drag and drop image here', 'اضغط هنا لرفع صورة من الجهاز أو اسحبها وأفلتها')}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t('Supports PNG, JPG, WebP, GIF (Max size: 5MB)', 'يدعم صيغ PNG, JPG, WebP, GIF (الحد الأقصى 5 ميجابايت)')}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
