'use client';

import { useState, useRef, useEffect } from 'react';
import { PostWithAuthor } from '@/types';
import { IconButton, EditIcon, DeleteIcon } from './IconButton';

interface PostCardProps {
  post: PostWithAuthor;
  onEdit: (post: PostWithAuthor) => void;
  onDelete: (id: number) => void;
}

const MAX_LINES = 7;

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * MAX_LINES;
      setNeedsTruncation(textRef.current.scrollHeight > maxHeight);
    }
  }, [post.body]);

  return (
    <article className="rounded-md bg-white/5 p-6 text-sm/7">
      <h2 className="text-lg font-semibold text-white mb-2 uppercase">
        {post.title}
      </h2>

      <div className="relative">
        <p
          ref={textRef}
          className={`text-[#9CA3AF] whitespace-pre-wrap ${
            !isExpanded && needsTruncation ? 'line-clamp-[7]' : ''
          }`}
        >
          {post.body}
        </p>

        {!isExpanded && needsTruncation && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0d0d0d] to-transparent pointer-events-none" />
        )}
      </div>

      {needsTruncation && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mt-2 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
        >
          Read More
        </button>
      )}

      {needsTruncation && isExpanded && (
        <div className="sticky bottom-24 mt-3 flex justify-center">
          <button
            onClick={() => setIsExpanded(false)}
            className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-full shadow-lg transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
            Show Less
          </button>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/10">
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
