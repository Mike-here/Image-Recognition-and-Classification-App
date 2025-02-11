export function LoadingIndicator() {
  return (
    <div className="flex items-center space-x-2 text-[#00BFFF]">
      <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
} 