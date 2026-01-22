'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-taupe-950/50 dark:bg-black/60 flex items-center justify-center z-50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-taupe-50 dark:bg-taupe-900 rounded-md p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <h2 id="modal-title" className="text-xl font-semibold text-taupe-950 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-taupe-700 dark:text-taupe-400 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm/7 font-medium bg-taupe-950/10 hover:bg-taupe-950/15 text-taupe-950 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full text-sm/7 font-medium bg-taupe-950 hover:bg-taupe-800 text-white dark:bg-taupe-300 dark:hover:bg-taupe-200 dark:text-taupe-950 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
