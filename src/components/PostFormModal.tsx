'use client';

import { useState, useEffect } from 'react';
import { PostWithAuthor } from '@/types';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface PostFormModalProps {
  isOpen: boolean;
  post?: PostWithAuthor | null;
  onSave: (data: { title: string; body: string; userId?: number }) => Promise<void>;
  onCancel: () => void;
}

export function PostFormModal({ isOpen, post, onSave, onCancel }: PostFormModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [userId, setUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isEditing = !!post;

  useEffect(() => {
    if (isOpen && !isEditing) {
      setLoadingUsers(true);
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => {
          setUsers(data);
          if (data.length > 0 && !userId) {
            setUserId(String(data[0].id));
          }
        })
        .catch(() => setError('Failed to load users'))
        .finally(() => setLoadingUsers(false));
    }
  }, [isOpen, isEditing]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setBody(post.body);
      setUserId(String(post.userId));
    } else {
      setTitle('');
      setBody('');
      if (users.length > 0) {
        setUserId(String(users[0].id));
      } else {
        setUserId('');
      }
    }
    setError(null);
  }, [post, isOpen, users]);

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
    <div className="fixed inset-0 bg-taupe-950/50 dark:bg-black/60 flex items-center justify-center z-50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
        className="bg-taupe-50 dark:bg-taupe-900 rounded-md p-6 max-w-lg w-full mx-4 shadow-xl"
      >
        <h2 id="form-title" className="text-xl font-semibold text-taupe-950 dark:text-white mb-4">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-taupe-700 dark:text-taupe-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white dark:bg-taupe-950 border border-taupe-300 dark:border-taupe-700 rounded-md text-taupe-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-taupe-500 dark:focus:ring-taupe-400"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="body" className="block text-sm font-medium text-taupe-700 dark:text-taupe-300 mb-1">
              Body
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 bg-white dark:bg-taupe-950 border border-taupe-300 dark:border-taupe-700 rounded-md text-taupe-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-taupe-500 dark:focus:ring-taupe-400 resize-none"
            />
          </div>

          {!isEditing && (
            <div className="mb-6">
              <label htmlFor="userId" className="block text-sm font-medium text-taupe-700 dark:text-taupe-300 mb-1">
                Author
              </label>
              <select
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                disabled={loadingUsers}
                className="w-full px-3 py-2 bg-white dark:bg-taupe-950 border border-taupe-300 dark:border-taupe-700 rounded-md text-taupe-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-taupe-500 dark:focus:ring-taupe-400 disabled:opacity-50"
              >
                {loadingUsers ? (
                  <option value="">Loading users...</option>
                ) : (
                  users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} (@{user.username})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 rounded-full text-sm/7 font-medium bg-taupe-950/10 hover:bg-taupe-950/15 text-taupe-950 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-full text-sm/7 font-medium bg-taupe-950 hover:bg-taupe-800 text-white dark:bg-taupe-300 dark:hover:bg-taupe-200 dark:text-taupe-950 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
