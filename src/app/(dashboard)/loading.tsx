export default function Loading() {
  return (
    <div className="w-full h-full p-8 flex flex-col space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
        <div className="h-4 w-96 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
      </div>
      <div className="border rounded-xl p-8 bg-background shadow-sm h-64 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}
