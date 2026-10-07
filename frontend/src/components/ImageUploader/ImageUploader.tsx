import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { productApi } from '../../api/product.api';

export interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  minImages?: number;
  maxImages?: number;
  maxSizeMB?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  minImages = 5,
  maxImages = 10,
  maxSizeMB = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
    // Put the selected cover photo at index 0
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

  const isMinMet = images.length >= minImages;

  return (
    <div className="space-y-3">
      {/* Header with Mandatory Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Product Photos <span className="text-red-500 font-bold">*</span>
            </span>
            {isMinMet ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {images.length} uploaded (✓ Minimum {minImages} met)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                {images.length} / {minImages} required ({minImages - images.length} more needed)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Upload at least {minImages} photos. Choose any uploaded photo as your primary cover photo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => !isUploading && fileInputRef.current?.click()}
          disabled={images.length >= maxImages}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Browse Files
        </button>
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

      {/* Upload Drop Zone */}
      {images.length < maxImages && (
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
                : !isMinMet && images.length > 0
                ? 'border-amber-300 hover:border-amber-400 bg-amber-50/30 hover:bg-amber-50/50'
                : 'border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-slate-50'
            } ${isUploading ? 'pointer-events-none opacity-75' : ''}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-xs font-semibold text-slate-700">
                  Processing & Uploading Photos...
                </span>
                <span className="text-[10px] text-slate-400">Saving media files to server</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center shadow-inner">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    <span className="text-indigo-600 underline underline-offset-2">
                      Click to upload photos
                    </span>{' '}
                    or drag & drop files here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, WebP (Minimum <span className="font-semibold text-slate-600">{minImages} photos mandatory</span>, up to {maxImages} photos, max {maxSizeMB}MB each)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Uploaded Thumbnails Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>
              Uploaded Photos ({images.length})
              {!isMinMet && (
                <span className="text-amber-600 font-bold ml-1.5">
                  — Please upload {minImages - images.length} more to reach 5
                </span>
              )}
            </span>
            <span className="hidden sm:inline text-slate-400">
              Click &quot;Set Cover&quot; on any photo to make it the primary display
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((imgUrl, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={`${imgUrl}-${index}`}
                  className={`group relative rounded-2xl overflow-hidden border bg-white p-2 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
                    isCover
                      ? 'border-indigo-600 ring-2 ring-indigo-300 shadow-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Image container */}
                  <div className="w-full h-28 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center relative">
                    <img
                      src={imgUrl}
                      alt={`Product preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Cover badge on top-left */}
                    {isCover && (
                      <div className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
                        <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                        COVER PHOTO
                      </div>
                    )}

                    {/* Delete button on top-right */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/70 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow z-10"
                      title="Delete photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Hover overlay for quick reorder */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveLeft(index)}
                          className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg transition-all shadow"
                          title="Move left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveRight(index)}
                          className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg transition-all shadow"
                          title="Move right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions & Caption bar below photo */}
                  <div className="mt-2 flex flex-col gap-1">
                    {!isCover ? (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="w-full py-1 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-[10px] font-bold transition-colors flex items-center justify-center gap-1 border border-indigo-200 hover:border-indigo-600"
                        title="Set this photo as main cover"
                      >
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        Set as Cover
                      </button>
                    ) : (
                      <div className="w-full py-1 px-2 rounded-lg bg-indigo-600 text-white text-[10px] font-bold text-center flex items-center justify-center gap-1 shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                        Active Cover
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                      <span>Photo #{index + 1}</span>
                      {isCover && (
                        <span className="text-indigo-600 font-semibold">Primary</span>
                      )}
                    </div>
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
