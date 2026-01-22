'use client';

import { PostWithAuthor } from '@/types';

interface PostCardProps {
  post: PostWithAuthor;
  onEdit: (post: PostWithAuthor) => void;
  onDelete: (id: number) => void;
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  return (
    <article className="bg-stone-800 border border-stone-700 rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-semibold text-stone-100 mb-2">{post.title}</h2>
      <p className="text-stone-300 mb-4">{post.body}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-stone-400">
          By {post.author.name} (@{post.author.username})
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(post)}
            className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="px-4 py-2 bg-red-900 hover:bg-red-800 text-red-100 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
