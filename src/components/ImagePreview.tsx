import { motion } from 'framer-motion';

interface ImagePreviewProps {
  file: File;
  result?: {
    filename: string;
    size: number;
    content_type: string;
    labels: string[];
    description: string;
    error?: string;
  };
  isLoading?: boolean;
}

export default function ImagePreview({ file, result, isLoading }: ImagePreviewProps) {
  return (
    <div className="glass-effect rounded-xl p-4 w-full max-w-sm">
      <div className="aspect-square relative overflow-hidden rounded-xl mb-3">
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="object-cover w-full h-full"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#00BFFF] rounded-full" />
          </div>
        )}
      </div>

      <p className="text-sm truncate text-[#EAEAEA] font-medium">{file.name}</p>
      
      {result?.error ? (
        <div className="mt-2 text-sm text-red-400">
          <p>Error: {result.error}</p>
        </div>
      ) : isLoading ? (
        <div className="mt-2 text-sm text-[#00BFFF]">
          <p>Analyzing image...</p>
        </div>
      ) : result && (
        <div className="mt-3 text-sm">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-[#00BFFF] mb-2">Detected Objects</p>
              <div className="flex flex-wrap gap-2">
                {result.labels.map((label, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-lg bg-[#8A2BE2]/20 text-[#EAEAEA] text-xs"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-[#00BFFF] mb-1">Description</p>
              <p className="text-[#B3B3B3] leading-relaxed">
                {result.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 