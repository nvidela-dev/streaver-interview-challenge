'use client';

import { PostWithAuthor } from '@/types';

interface PostCardProps {
  post: PostWithAuthor;
  onEdit: (post: PostWithAuthor) => void;
  onDelete: (id: number) => void;
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  return (
    <article className="rounded-md bg-taupe-950/[0.025] p-6 text-sm/7 dark:bg-white/5">
      <h2 className="text-lg font-semibold text-taupe-950 dark:text-white mb-2 uppercase">
        {post.title}
      </h2>
      <p className="text-taupe-700 dark:text-taupe-400 mb-4">{post.body}</p>
      <div className="flex justify-between items-center pt-4 border-t border-taupe-950/10 dark:border-white/10">
        <span className="text-xs/6 text-taupe-600 dark:text-taupe-400">
          By <span className="font-medium text-taupe-950 dark:text-white">{post.author.name}</span>{' '}
          <span className="text-taupe-500 dark:text-taupe-500">@{post.author.username}</span>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(post)}
            className="px-3 py-1 rounded-full text-sm/7 font-medium bg-taupe-950/10 hover:bg-taupe-950/15 text-taupe-950 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="px-3 py-1 rounded-full text-sm/7 font-medium text-taupe-700 hover:bg-taupe-950/10 dark:text-taupe-400 dark:hover:bg-white/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
