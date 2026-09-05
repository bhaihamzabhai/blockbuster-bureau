'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: { src: string; alt: string; width: string }) => void;
}

export default function ImageModal({
  isOpen,
  onClose,
  onInsert,
}: ImageModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [width, setWidth] = useState('full');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setActiveTab('upload');
    setImageUrl('');
    setAltText('');
    setWidth('full');
    setUploading(false);
    setUploadProgress(0);
    setDragOver(false);
    setPreview('');
    setError('');
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Resize image if needed
    const resizedFile = await resizeImage(file);

    // Upload to Firebase Storage
    const fileName = `posts/images/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, resizedFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (err) => {
        setError('Upload failed. Please try again.');
        setUploading(false);
        console.error('Upload error:', err);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(downloadURL);
          setUploading(false);
        } catch (err) {
          setError('Failed to get download URL');
          setUploading(false);
        }
      }
    );
  };

  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        const maxWidth = 1400;
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          0.9
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    if (url) {
      setPreview(url);
    } else {
      setPreview('');
    }
  };

  const handleInsert = () => {
    if (!imageUrl) {
      setError('Please provide an image');
      return;
    }
    if (!altText.trim()) {
      setError('Please provide alt text for accessibility');
      return;
    }
    onInsert({ src: imageUrl, alt: altText, width });
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  };

  const isReadyToInsert = (activeTab === 'upload' && imageUrl) || (activeTab === 'url' && imageUrl && altText.trim());

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
          onKeyDown={handleKeyDown}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-nebula rounded-xl border border-white/10 p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-display text-xl text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gold" />
                Insert Image
              </h3>
              <button
                onClick={handleClose}
                className="p-1 rounded hover:bg-white/10 text-stardust hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-gold/20 text-gold'
                    : 'bg-void text-stardust hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'url'
                    ? 'bg-gold/20 text-gold'
                    : 'bg-void text-stardust hover:text-white'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                From URL
              </button>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? 'border-gold bg-gold/5'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  {uploading ? (
                    <div className="space-y-2">
                      <Loader2 className="w-8 h-8 text-gold mx-auto animate-spin" />
                      <p className="text-stardust">Uploading... {uploadProgress}%</p>
                      <div className="w-full bg-void rounded-full h-2">
                        <div
                          className="bg-gold h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-stardust mx-auto mb-2" />
                      <p className="text-stardust">
                        Drag & drop an image here, or click to browse
                      </p>
                      <p className="text-stardust/50 text-xs mt-1">
                        JPEG, PNG, WebP, GIF (max 5MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
              </div>
            )}

            {/* URL Tab */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-stardust text-sm mb-1">Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 bg-void border border-white/10 rounded-lg text-white placeholder-stardust focus:outline-none focus:border-gold/50"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="mt-4">
                <p className="text-stardust text-sm mb-2">Preview</p>
                <div className="rounded-lg overflow-hidden bg-void p-2">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-40 mx-auto object-contain"
                  />
                </div>
              </div>
            )}

            {/* Alt Text */}
            <div className="mt-4">
              <label className="block text-stardust text-sm mb-1">Alt Text *</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image for accessibility"
                className="w-full px-4 py-2 bg-void border border-white/10 rounded-lg text-white placeholder-stardust focus:outline-none focus:border-gold/50"
              />
            </div>

            {/* Width */}
            <div className="mt-4">
              <label className="block text-stardust text-sm mb-1">Image Size</label>
              <div className="flex gap-2">
                {['full', 'medium', 'small'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setWidth(size)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                      width === size
                        ? 'bg-gold/20 text-gold'
                        : 'bg-void text-stardust hover:text-white'
                    }`}
                  >
                    {size === 'full' ? 'Full Width' : size === 'medium' ? 'Medium (60%)' : 'Small (40%)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 mt-4 border-t border-white/10">
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsert}
                disabled={!isReadyToInsert}
                className="px-4 py-2 rounded-lg bg-gold text-void font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Image
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}