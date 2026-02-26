import React, { useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoUrl: (url: string) => void;
  currentUrl?: string;
}

export default function PhotoUpload({ onPhotoUrl, currentUrl }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string>(currentUrl || '');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      onPhotoUrl(dataUrl);
      setUploading(false);
    };
    reader.onerror = () => {
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview('');
    onPhotoUrl('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="KYC Photo"
            className="w-28 h-28 rounded-2xl object-cover border-2 border-primary-200"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-28 h-28 rounded-2xl border-2 border-dashed border-primary-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary-50 transition-colors"
        >
          <Camera size={28} className="text-primary-400" />
          <span className="text-xs text-primary-500 font-medium">Upload Photo</span>
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 text-xs text-primary-600 font-medium hover:underline disabled:opacity-50"
      >
        <Upload size={14} />
        {uploading ? 'Loading...' : preview ? 'Change Photo' : 'Select Photo'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
