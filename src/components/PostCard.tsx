'use client';

import { PostWithAuthor } from '@/types';
import { IconButton, EditIcon, DeleteIcon } from './IconButton';

interface PostCardProps {
  post: PostWithAuthor;
  onEdit: (post: PostWithAuthor) => void;
  onDelete: (id: number) => void;
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  return (
    <article className="rounded-md bg-white/5 p-6 text-sm/7">
      <h2 className="text-lg font-semibold text-white mb-2 uppercase">
        {post.title}
      </h2>
      <p className="text-[#9CA3AF] mb-4">{post.body}</p>
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <span className="text-xs/6 text-[#9CA3AF]">
          By <span className="font-medium text-white">{post.author.name}</span>{' '}
          <span className="text-[#9CA3AF]/60">@{post.author.username}</span>
        </span>
        <div className="flex gap-2">
          <IconButton
            icon={<EditIcon />}
            label="Edit"
            variant="default"
            onClick={() => onEdit(post)}
          />
          <IconButton
            icon={<DeleteIcon />}
            label="Delete"
            variant="danger"
            onClick={() => onDelete(post.id)}
          />
        </div>
      </div>
    </article>
  );
}
