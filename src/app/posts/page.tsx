'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { PostWithAuthor } from '@/types';
import { PostCard } from '@/components/PostCard';
import { ConfirmModal } from '@/components/ConfirmModal';
import { PostFormModal } from '@/components/PostFormModal';
import { IconButton, PlusIcon } from '@/components/IconButton';
import { FilterButton } from '@/components/FilterButton';
import { DevPanel } from '@/components/DevPanel';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface User {
  id: number;
  name: string;
  username: string;
}

const POSTS_PER_PAGE = 10;

interface PaginatedResponse {
  data: PostWithAuthor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [postToEdit, setPostToEdit] = useState<PostWithAuthor | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [throttleEnabled, setThrottleEnabled] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = useCallback(async (pageNum: number, append = false, userId?: number, throttle = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: POSTS_PER_PAGE.toString(),
      });
      if (userId) {
        params.set('userId', userId.toString());
      }
      if (throttle) {
        params.set('throttle', 'true');
      }

      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const result: PaginatedResponse = await response.json();

      if (append) {
        setPosts((prev) => [...prev, ...result.data]);
      } else {
        setPosts(result.data);
      }
      setHasMore(result.pagination.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, false, selectedUser?.id, throttleEnabled);
  }, [fetchPosts, selectedUser, throttleEnabled]);

  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, true, selectedUser?.id, throttleEnabled);
    }
  }, [page, fetchPosts, selectedUser, throttleEnabled]);

  async function handleDelete(id: number) {
    try {
      setDeleteError(null);
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      setPosts(posts.filter((post) => post.id !== id));
      setPostToDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  }

  async function handleCreate(data: { title: string; body: string; userId?: number }) {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create post');
    }
    const newPost = await response.json();
    setPosts([newPost, ...posts]);
    setShowCreateModal(false);
  }

  async function handleEdit(data: { title: string; body: string }) {
    if (!postToEdit) return;

    const response = await fetch(`/api/posts/${postToEdit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update post');
    }
    const updatedPost = await response.json();
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    setPostToEdit(null);
  }

  function openDeleteModal(id: number) {
    setPostToDelete(id);
    setDeleteError(null);
  }

  function closeDeleteModal() {
    setPostToDelete(null);
    setDeleteError(null);
  }

  async function handleClearPosts() {
    try {
      const response = await fetch('/api/dev/clear', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to clear posts');
      }
      setPosts([]);
      setPage(1);
      setHasMore(false);
    } catch (err) {
      console.error('Error clearing posts:', err);
    }
  }

  async function handleSeedData() {
    try {
      const response = await fetch('/api/dev/seed', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to seed data');
      }
      // Refresh posts
      setPage(1);
      setSelectedUser(null);
      fetchPosts(1, false, undefined, throttleEnabled);
    } catch (err) {
      console.error('Error seeding data:', err);
    }
  }

  // Render main content based on state
  let content;
  if (loading) {
    content = (
      <div className="mx-auto w-full max-w-2xl md:max-w-3xl lg:max-w-4xl flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  } else if (error) {
    content = (
      <div className="mx-auto w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <p className="text-red-400 text-center">Error: {error}</p>
      </div>
    );
  } else {
    content = (
      <div className="mx-auto w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-semibold text-white">Our Latest News</h1>
          <div className="flex items-center gap-2">
            <FilterButton
              users={users}
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
            />
            <IconButton
              icon={<PlusIcon />}
              label="New Post"
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            />
          </div>
        </div>

        {deleteError && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md mb-6 text-sm">
            {deleteError}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 max-w-md text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#2563EB]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-[#9CA3AF] mb-6">
                It's looking a bit empty here. Be the first to share something!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Post
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={setPostToEdit}
                onDelete={openDeleteModal}
              />
            ))}

            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="py-8 flex items-center justify-center">
              {loadingMore && (
                <LoadingSpinner size="md" />
              )}
              {!hasMore && posts.length > 0 && (
                <p className="text-[#9CA3AF]/60 text-sm">You're all caught up! 🚀</p>
              )}
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={postToDelete !== null}
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          onConfirm={() => postToDelete && handleDelete(postToDelete)}
          onCancel={closeDeleteModal}
        />

        <PostFormModal
          isOpen={showCreateModal}
          onSave={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />

        <PostFormModal
          isOpen={postToEdit !== null}
          post={postToEdit}
          onSave={handleEdit}
          onCancel={() => setPostToEdit(null)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen py-16 px-6 lg:px-10">
        {content}
      </div>
      <DevPanel
        onClearPosts={handleClearPosts}
        onSeedData={handleSeedData}
        throttleEnabled={throttleEnabled}
        onToggleThrottle={setThrottleEnabled}
      />
    </>
  );
}
