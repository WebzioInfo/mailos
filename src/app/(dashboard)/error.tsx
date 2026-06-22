'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="p-4 bg-red-100 text-red-900 rounded-full dark:bg-red-900/20 dark:text-red-400">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md text-center">
        We encountered an error loading this section. You can try recovering the page.
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 font-medium"
      >
        Try again
      </button>
    </div>
  );
}
