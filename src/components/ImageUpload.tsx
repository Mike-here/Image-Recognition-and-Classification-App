import { useRef, useState } from 'react';

interface ImageUploadProps {
  onUpload: (files: FileList) => void;
  disabled?: boolean;
}

export default function ImageUpload({ onUpload, disabled }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`
          glass-effect rounded-xl p-8 text-center
          border-2 border-dashed
          ${isDragging ? 'border-[#00BFFF] bg-[#00BFFF]/5' : 'border-gray-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#00BFFF] hover:bg-[#00BFFF]/5'}
          transition-colors duration-300
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && onUpload(e.target.files)}
          disabled={disabled}
        />

        <div className="text-5xl mb-4">
          {isDragging ? '📥' : '📂'}
        </div>
        
        <h3 className="text-[#EAEAEA] font-medium mb-2">
          {disabled ? 'Processing...' : 'Upload Your Images'}
        </h3>
        
        <p className="text-[#B3B3B3] text-sm">
          {isDragging ? 'Drop images here' : 'Drag & drop images here or click to browse'}
        </p>

        {!disabled && (
          <button
            className="mt-4 px-6 py-2 bg-gradient-to-r from-[#00BFFF] to-[#8A2BE2] 
                     text-white rounded-full text-sm font-medium"
          >
            Select Files
          </button>
        )}

        {disabled && (
          <div className="mt-4 text-[#00BFFF]">
            <p>Processing your images...</p>
          </div>
        )}
      </div>
    </div>
  );
} 