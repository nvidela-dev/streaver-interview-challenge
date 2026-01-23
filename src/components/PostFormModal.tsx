'use client';

import { useState, useEffect } from 'react';
import { PostWithAuthor } from '@/types';
import {
  createPostSchema,
  editPostSchema,
  POST_TITLE_MAX_LENGTH,
  POST_BODY_MAX_LENGTH,
  formatYupErrors,
} from '@/lib/validation';
import * as yup from 'yup';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
    setFieldErrors({});
    setTouched({});
  }, [post, isOpen, users]);

  // Validate a single field
  async function validateField(field: string, value: string) {
    const schema = isEditing ? editPostSchema : createPostSchema;
    try {
      await schema.validateAt(field, {
        title,
        body,
        userId: userId ? parseInt(userId, 10) : undefined,
        [field]: field === 'userId' ? (value ? parseInt(value, 10) : undefined) : value,
      });
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setFieldErrors((prev) => ({ ...prev, [field]: err.message }));
      }
    }
  }

  // Handle field blur
  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === 'title' ? title : field === 'body' ? body : userId;
    validateField(field, value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const schema = isEditing ? editPostSchema : createPostSchema;
    const data = isEditing
      ? { title, body }
      : { title, body, userId: userId ? parseInt(userId, 10) : undefined };

    try {
      await schema.validate(data, { abortEarly: false });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setFieldErrors(formatYupErrors(err));
        setTouched({ title: true, body: true, userId: true });
        return;
      }
    }

    setSaving(true);

    try {
      await onSave({
        title: title.trim(),
        body: body.trim(),
        userId: isEditing ? undefined : parseInt(userId, 10),
      });
    } catch (err) {
      if (err instanceof Error) {
        // Check if the error contains field-specific errors from the API
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.errors) {
            setFieldErrors(parsed.errors);
            return;
          }
        } catch {
          // Not a JSON error, use the message as-is
        }
        setError(err.message);
      } else {
        setError('Failed to save post');
      }
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-backdrop">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
        className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl animate-modal-content"
      >
        <h2 id="form-title" className="text-xl font-semibold text-white mb-4">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="title" className="block text-sm font-medium text-[#9CA3AF]">
                Title
              </label>
              <span className={`text-xs ${title.length > POST_TITLE_MAX_LENGTH ? 'text-red-400' : 'text-[#9CA3AF]/60'}`}>
                {title.length}/{POST_TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (touched.title) validateField('title', e.target.value);
              }}
              onBlur={() => handleBlur('title')}
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                touched.title && fieldErrors.title
                  ? 'border-red-500/50 focus:ring-red-500'
                  : 'border-white/10 focus:ring-[#2563EB]'
              }`}
              placeholder="Enter post title..."
            />
            {touched.title && fieldErrors.title && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.title}</p>
            )}
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="body" className="block text-sm font-medium text-[#9CA3AF]">
                Body
              </label>
              <span className={`text-xs ${body.length > POST_BODY_MAX_LENGTH ? 'text-red-400' : 'text-[#9CA3AF]/60'}`}>
                {body.length}/{POST_BODY_MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="body"
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (touched.body) validateField('body', e.target.value);
              }}
              onBlur={() => handleBlur('body')}
              rows={4}
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${
                touched.body && fieldErrors.body
                  ? 'border-red-500/50 focus:ring-red-500'
                  : 'border-white/10 focus:ring-[#2563EB]'
              }`}
              placeholder="Write your post content..."
            />
            {touched.body && fieldErrors.body && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.body}</p>
            )}
          </div>

          {!isEditing && (
            <div className="mb-6">
              <label htmlFor="userId" className="block text-sm font-medium text-[#9CA3AF] mb-2">
                Author
              </label>
              <select
                id="userId"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  if (touched.userId) validateField('userId', e.target.value);
                }}
                onBlur={() => handleBlur('userId')}
                disabled={loadingUsers}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 appearance-none cursor-pointer ${
                  touched.userId && fieldErrors.userId
                    ? 'border-red-500/50 focus:ring-red-500'
                    : 'border-white/10 focus:ring-[#2563EB]'
                }`}
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
              {touched.userId && fieldErrors.userId && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.userId}</p>
              )}
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
