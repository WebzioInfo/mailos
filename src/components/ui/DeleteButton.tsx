'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ConfirmActionDialog } from './ConfirmActionDialog';
import { toast } from 'sonner';

interface DeleteButtonProps {
  onDelete: () => Promise<{ error?: string } | void>;
  itemName?: string;
  itemType?: string;
  className?: string;
  iconOnly?: boolean;
}

export function DeleteButton({ 
  onDelete, 
  itemName = 'this item', 
  itemType = 'Item',
  className = "",
  iconOnly = true
}: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await onDelete();
      if (result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${itemType} deleted successfully`);
        setShowConfirm(false);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to delete ${itemType.toLowerCase()}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => setShowConfirm(true)}
        className={className || "inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-red-50 dark:hover:bg-red-950/50 text-muted-foreground hover:text-red-500 transition-colors"}
        title={`Delete ${itemType}`}
      >
        {iconOnly ? (
          <Trash2 className="w-4 h-4" />
        ) : (
          <>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </>
        )}
      </button>

      <ConfirmActionDialog 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title={`Delete ${itemType}`}
        message={`Are you sure you want to permanently delete ${itemName}? This action cannot be undone.`}
        confirmText="Delete"
        danger={true}
        isLoading={isDeleting}
      />
    </>
  );
}
