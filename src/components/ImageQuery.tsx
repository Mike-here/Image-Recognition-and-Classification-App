import { useState, useRef, useEffect } from 'react';

interface ImageQueryProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export default function ImageQuery({ onSubmit, disabled, isProcessing }: ImageQueryProps) {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Handle typing indicator
  useEffect(() => {
    if (query) {
      setIsTyping(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSubmit(query.trim());
      setQuery('');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about the image..."
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-24
            bg-[#1A1A1A] text-[#EAEAEA]
            rounded-xl border border-gray-700
            placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-[#00BFFF]
            transition-all duration-300
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        
        <button
          type="submit"
          disabled={!query.trim() || disabled}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            px-4 py-1.5
            bg-gradient-to-r from-[#00BFFF] to-[#8A2BE2]
            text-white text-sm font-medium rounded-lg
            transition-all duration-300
            ${!query.trim() || disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:brightness-110 hover:shadow-lg hover:shadow-blue-500/20'
            }
          `}
        >
          Ask
        </button>

        {/* Typing Indicator */}
        {isTyping && !disabled && (
          <div className="absolute left-4 -bottom-6 flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-[#00BFFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-[#00BFFF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-[#00BFFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute left-4 -bottom-6 flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-[#8A2BE2] rounded-full animate-pulse" />
            <span className="text-xs text-[#8A2BE2]">Processing query...</span>
          </div>
        )}
      </form>
    </div>
  );
} 