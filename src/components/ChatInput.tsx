'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateImage, validateImageDimensions } from '@/utils/imageValidation';
import { ErrorBoundary } from './ErrorBoundary';
import { APIErrorBoundary } from './APIErrorBoundary';

interface ChatInputProps {
  onSubmit: (text: string, image?: File) => Promise<void>;
  disabled?: boolean;
}

const ChatInput = ({ onSubmit, disabled }: ChatInputProps) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!text.trim() && !image) return;
    if (disabled || isUploading) return;

    try {
      setIsUploading(true);
      await onSubmit(text.trim(), image);
      setText('');
      setImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    setError(null);
    if (!files?.length || isUploading) return;
    
    try {
      const file = files[0];
      
      // Basic validation
      await validateImage(file, {
        maxSizeInMB: 10,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

      // Client-side dimension validation
      await validateImageDimensions(file, 4096, 4096);

      setImage(file);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to validate image');
      console.error('Image validation error:', error);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isUploading) {
      await handleImageUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#121212] to-transparent">
      <form 
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto relative"
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
      >
        {error && (
          <div className="absolute -top-16 left-0 right-0 p-3 bg-red-900/50 text-red-200 rounded-lg border border-red-800">
            {error}
          </div>
        )}

        <div className={`
          relative rounded-xl overflow-hidden
          ${isDragging ? 'ring-2 ring-[#00BFFF]' : ''}
          transition-all duration-200
        `}>
          {/* Image Preview */}
          {image && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-4 bottom-full mb-2 bg-[#1A1A1A] rounded-lg p-2 flex items-center gap-2"
            >
              <img 
                src={URL.createObjectURL(image)} 
                alt="Preview" 
                className="w-8 h-8 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => !isUploading && setImage(null)}
                className={`text-[#B3B3B3] hover:text-white ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isUploading}
              >
                ✕
              </button>
            </motion.div>
          )}

          {/* Input Bar */}
          <div className="flex items-center bg-[#1A1A1A] rounded-xl">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={image ? "Ask about this image..." : "Ask something or upload an image..."}
              disabled={disabled || isUploading}
              className={`
                flex-1 px-4 py-3 bg-transparent text-[#EAEAEA]
                placeholder:text-gray-500 focus:outline-none
                ${(disabled || isUploading) ? 'cursor-not-allowed' : ''}
              `}
            />
            
            {/* Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => !isUploading && handleImageUpload(e.target.files)}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => !isUploading && fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className={`
                p-2 mx-2 rounded-lg
                ${(disabled || isUploading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2A2A2A]'}
                transition-colors duration-200
              `}
            >
              <span className="text-xl">+</span>
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={(!text.trim() && !image) || disabled || isUploading}
              className={`
                px-4 py-2 mx-2 rounded-lg
                bg-gradient-to-r from-[#00BFFF] to-[#8A2BE2]
                text-white font-medium
                ${(!text.trim() && !image) || disabled || isUploading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-lg hover:shadow-blue-500/20'
                }
                transition-all duration-200
                flex items-center gap-2
              `}
            >
              {isUploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>

        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#00BFFF]/10 border-2 border-dashed border-[#00BFFF] rounded-xl
                         flex items-center justify-center"
            >
              <p className="text-[#00BFFF] font-medium">Drop image here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

const ChatInputWithErrorBoundary = (props: ChatInputProps) => (
  <ErrorBoundary
    fallback={
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        <h3 className="font-semibold">Chat Input Error</h3>
        <p>There was an error loading the chat input. Please refresh the page.</p>
      </div>
    }
  >
    <APIErrorBoundary>
      <ChatInput {...props} />
    </APIErrorBoundary>
  </ErrorBoundary>
);

export default ChatInputWithErrorBoundary; 