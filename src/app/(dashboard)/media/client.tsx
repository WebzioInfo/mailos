'use client';

import { useState } from "react";
import { UploadCloud, Image as ImageIcon, Trash2, Link as LinkIcon } from "lucide-react";
import { uploadMedia } from "@/modules/media/actions";
import { removeMedia } from "@/modules/media/delete-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MediaClient({ initialMedia }: { initialMedia: any[] }) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const result: any = await uploadMedia({}, formData);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("File uploaded successfully");
      router.refresh();
    }
    setIsUploading(false);
    // Reset input
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    const result: any = await removeMedia(id);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("File deleted");
      router.refresh();
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground mt-1">Upload and manage images for your templates.</p>
        </div>
        <div>
          <label className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-50">
            {isUploading ? "Uploading..." : <><UploadCloud className="mr-2 h-4 w-4" /> Upload File</>}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {initialMedia.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground">
            <ImageIcon className="h-12 w-12 opacity-20 mb-3" />
            <p>No media files uploaded yet.</p>
          </div>
        )}

        {initialMedia.map(media => (
          <div key={media.id} className="group border rounded-xl overflow-hidden bg-background shadow-sm hover:shadow-md transition-all relative">
            <div className="aspect-square bg-slate-100 dark:bg-zinc-900 flex items-center justify-center p-4">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div className="p-3 border-t">
              <p className="text-xs font-medium truncate" title={media.fileName}>{media.fileName}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{(media.sizeBytes / 1024).toFixed(1)} KB</p>
            </div>

            {/* Hover Actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => copyUrl(media.url)} className="p-1.5 bg-background border rounded-md shadow-sm hover:bg-accent text-foreground">
                <LinkIcon className="h-3 w-3" />
              </button>
              <button onClick={() => handleDelete(media.id)} className="p-1.5 bg-red-50 border-red-100 border text-red-600 rounded-md shadow-sm hover:bg-red-100 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
