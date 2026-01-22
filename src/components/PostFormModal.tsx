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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
        className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl"
      >
        <h2 id="form-title" className="text-xl font-semibold text-white mb-4">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-[#9CA3AF] mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
              placeholder="Enter post title..."
            />
          </div>

          <div className="mb-4">
            <label htmlFor="body" className="block text-sm font-medium text-[#9CA3AF] mb-2">
              Body
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
              placeholder="Write your post content..."
            />
          </div>

          {!isEditing && (
            <div className="mb-6">
              <label htmlFor="userId" className="block text-sm font-medium text-[#9CA3AF] mb-2">
                Author
              </label>
              <select
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                disabled={loadingUsers}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all disabled:opacity-50 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '20px',
                }}
              >
                {loadingUsers ? (
                  <option value="">Loading users...</option>
                ) : (
                  users.map((user) => (
                    <option key={user.id} value={user.id} className="bg-[#0a0a0a] text-white">
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
              className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-full text-sm font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
