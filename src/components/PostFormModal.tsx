'use client';

import { useState, useEffect } from 'react';
import { PostWithAuthor } from '@/types';

interface PostFormModalProps {
  isOpen: boolean;
  post?: PostWithAuthor | null;
  onSave: (data: { title: string; body: string; userId?: number }) => Promise<void>;
  onCancel: () => void;
}

export function PostFormModal({ isOpen, post, onSave, onCancel }: PostFormModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [userId, setUserId] = useState('1');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!post;

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setBody(post.body);
      setUserId(String(post.userId));
    } else {
      setTitle('');
      setBody('');
      setUserId('1');
    }
    setError(null);
  }, [post, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await onSave({
        title,
        body,
        userId: isEditing ? undefined : parseInt(userId, 10),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
        className="bg-stone-800 border border-stone-700 rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl"
      >
        <h2 id="form-title" className="text-xl font-semibold text-stone-100 mb-4">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h2>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-stone-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-stone-900 border border-stone-600 rounded text-stone-100 focus:outline-none focus:border-stone-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="body" className="block text-sm font-medium text-stone-300 mb-1">
              Body
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 bg-stone-900 border border-stone-600 rounded text-stone-100 focus:outline-none focus:border-stone-500 resize-none"
            />
          </div>

          {!isEditing && (
            <div className="mb-6">
              <label htmlFor="userId" className="block text-sm font-medium text-stone-300 mb-1">
                User ID
              </label>
              <input
                type="number"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                min="1"
                max="10"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-600 rounded text-stone-100 focus:outline-none focus:border-stone-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 rounded transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
