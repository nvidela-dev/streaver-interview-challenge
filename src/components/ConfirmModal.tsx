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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-stone-800 border border-stone-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <h2 id="modal-title" className="text-xl font-semibold text-stone-100 mb-2">
          {title}
        </h2>
        <p className="text-stone-300 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-900 hover:bg-red-800 text-red-100 rounded transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
