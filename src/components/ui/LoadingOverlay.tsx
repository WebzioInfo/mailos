'use client';

export function LoadingOverlay({ message = "Loading...", fullScreen = true }: { message?: string, fullScreen?: boolean }) {
  const overlayClass = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
    : "absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-inherit";

  return (
    <div className={overlayClass}>
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}
