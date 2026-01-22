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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
      >
        <h2 id="modal-title" className="text-xl font-semibold text-white mb-2">
          {title}
        </h2>
        <p className="text-[#9CA3AF] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
