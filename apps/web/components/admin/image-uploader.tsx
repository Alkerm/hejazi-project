'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UploadCloud, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImageUrl, onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files (JPEG, PNG, WebP) are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:4000/api/v1/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || 'Image upload failed');
      }

      const imageUrl = json.data.url;
      setPreviewUrl(imageUrl);
      onImageUploaded(imageUrl);
      toast.success('Product image uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-slate-700 block">Product Image Upload:</label>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Preview Container */}
        <div className="relative w-28 h-28 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-inner">
          {previewUrl ? (
            <Image src={previewUrl} alt="Product Preview" fill className="object-cover" />
          ) : (
            <div className="text-center p-2 text-slate-400">
              <ImageIcon className="w-6 h-6 mx-auto" />
              <span className="text-[10px] block mt-1">No Image</span>
            </div>
          )}
        </div>

        {/* Drag & Drop Input Container */}
        <label className="flex-1 w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all text-center">
          <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
          <span className="text-xs font-semibold text-slate-700">
            {uploading ? 'Uploading image...' : 'Click to select or drag product photo'}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>

      {previewUrl && (
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" /> Direct URL: <span className="underline truncate max-w-xs">{previewUrl}</span>
        </div>
      )}
    </div>
  );
};
