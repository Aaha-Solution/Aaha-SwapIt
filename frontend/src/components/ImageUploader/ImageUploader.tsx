import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { productApi } from '../../api/product.api';

export interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

const SAMPLE_PRESETS = [
  { label: 'Mobile (iPhone)', path: '/images/phone_purple.png' },
  { label: 'Laptop (MacBook)', path: '/images/laptop_macbook.png' },
  { label: 'Car (Sedan)', path: '/images/car_red.png' },
  { label: 'Bike (Yamaha)', path: '/images/bike_yamaha.png' },
  { label: 'Sofa (Furniture)', path: '/images/sofa_brown.png' },
  { label: 'Camera (DSLR)', path: '/images/camera.png' },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 6,
  maxSizeMB = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<{ fileName: string; fileContentBase64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve({
          fileName: file.name,
          fileContentBase64: base64String,
          mimeType: file.type || 'image/jpeg',
        });
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    setUploadError(null);
    const files = Array.from(fileList);

    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setUploadError(`You can upload a maximum of ${maxImages} images in total.`);
      return;
    }

    // Validate size & type
    const validFiles: File[] = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        setUploadError(`"${f.name}" is not a valid image format.`);
        return;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        setUploadError(`"${f.name}" exceeds the ${maxSizeMB}MB size limit.`);
        return;
      }
      validFiles.push(f);
    }

    setIsUploading(true);
    try {
      const base64Files = await Promise.all(validFiles.map(fileToBase64));
      const res = await productApi.uploadImages(base64Files);

      if (res.success && res.data) {
        const newUrls = res.data.map((item) => item.url);
        onChange([...images, ...newUrls]);
      } else {
        setUploadError('Failed to upload photos. Please try again.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error processing uploaded images');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const cover = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([cover, ...rest]);
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const copy = [...images];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    const copy = [...images];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  const handleSelectPreset = (presetPath: string) => {
    if (images.includes(presetPath)) {
      // Toggle remove
      onChange(images.filter((img) => img !== presetPath));
    } else {
      if (images.length >= maxImages) {
        setUploadError(`Maximum ${maxImages} images allowed.`);
        return;
      }
      onChange([...images, presetPath]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Product Photos</span>
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {images.length} / {maxImages} uploaded
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            The first photo will be used as the primary cover photo.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Upload Device
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'presets'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Presets
          </button>
        </div>
      </div>

      {/* Error alert */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      {activeTab === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`group relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                : 'border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-slate-50'
            } ${isUploading ? 'pointer-events-none opacity-75' : ''}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-xs font-semibold text-slate-700">
                  Processing & Uploading Photos...
                </span>
                <span className="text-[10px] text-slate-400">Saving media files</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center shadow-inner">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    <span className="text-indigo-600 underline underline-offset-2">
                      Click to upload
                    </span>{' '}
                    or drag & drop files here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PNG, JPG, WebP, GIF (Max {maxSizeMB}MB each, up to {maxImages} photos)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preset Pickers */}
      {activeTab === 'presets' && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-600 mb-2.5">
            Select one or more demo catalog photos:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SAMPLE_PRESETS.map((preset) => {
              const isSelected = images.includes(preset.path);
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset.path)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-200 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.path}
                    alt={preset.label}
                    className="w-12 h-12 object-contain"
                  />
                  <span className="text-[10px] text-slate-700 font-semibold truncate w-full text-center">
                    {preset.label.split(' ')[0]}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Uploaded Thumbnails Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Uploaded Photos ({images.length})</span>
            <span>Hover to manage or set cover photo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((imgUrl, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={`${imgUrl}-${index}`}
                  className={`group relative rounded-2xl overflow-hidden border bg-white p-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                    isCover
                      ? 'border-indigo-500 ring-2 ring-indigo-200/80'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Image container */}
                  <div className="w-full h-28 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center relative">
                    <img
                      src={imgUrl}
                      alt={`Product preview ${index + 1}`}
                      className="w-full h-full object-contain"
                    />

                    {/* Cover badge */}
                    {isCover && (
                      <div className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                        COVER PHOTO
                      </div>
                    )}

                    {/* Hover overlay with action buttons */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex items-center justify-between">
                        {!isCover ? (
                          <button
                            type="button"
                            onClick={() => handleSetCover(index)}
                            className="bg-white/90 hover:bg-white text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-all shadow"
                            title="Set as main cover photo"
                          >
                            <Star className="w-3 h-3 text-amber-500" />
                            Set Cover
                          </button>
                        ) : (
                          <span className="text-[10px] text-indigo-300 font-bold">
                            Main Cover
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow ml-auto"
                          title="Delete photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reorder controls */}
                      <div className="flex items-center justify-center gap-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveLeft(index)}
                            className="p-1 bg-white/90 hover:bg-white text-slate-800 rounded-md transition-all shadow"
                            title="Move left"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {index < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveRight(index)}
                            className="p-1 bg-white/90 hover:bg-white text-slate-800 rounded-md transition-all shadow"
                            title="Move right"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Caption & Index */}
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span>Photo #{index + 1}</span>
                    {isCover && (
                      <span className="text-indigo-600 font-bold">Primary</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
