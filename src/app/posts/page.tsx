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
import { Toast } from '@/components/Toast';
import { SkeletonCard } from '@/components/SkeletonCard';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Confetti } from '@/components/Confetti';
import { useConnectivity } from '@/contexts/ConnectivityContext';

interface User {
  id: number;
  name: string;
  username: string;
}

const POSTS_PER_PAGE = 10;

const EMPTY_STATE_MESSAGES = [
  { heading: 'No posts yet', message: "It's looking a bit empty here. Be the first to share something!" },
  { heading: 'Nothing to see here', message: 'The feed is empty. Why not kick things off?' },
  { heading: 'Crickets...', message: 'No posts have been created yet. Be a trailblazer!' },
  { heading: 'Fresh start!', message: 'This is a blank canvas waiting for your first post.' },
];

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
  const { simulateOffline, setSimulateOffline, isOffline, reportApiFailure, reportApiSuccess } = useConnectivity();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [postToEdit, setPostToEdit] = useState<PostWithAuthor | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [throttleEnabled, setThrottleEnabled] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [emptyStateIndex] = useState(() => Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length));

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const wasEmptyRef = useRef(true);
  const isFetchingRef = useRef(false);

  const fetchPosts = useCallback(async (pageNum: number, append = false, userId?: number, throttle = false, offline = false) => {
    if (isFetchingRef.current && append) return;
    isFetchingRef.current = true;

    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Check for offline mode
      if (offline) {
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }

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
        if (response.status >= 500) {
          throw new Error('The server is experiencing issues. Please try again later.');
        } else if (response.status === 404) {
          throw new Error('The requested resource could not be found.');
        } else {
          throw new Error('Failed to load posts. Please refresh the page to try again.');
        }
      }

      const result: PaginatedResponse = await response.json();
      reportApiSuccess();

      if (append) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = result.data.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      } else {
        setPosts(result.data);
        wasEmptyRef.current = result.data.length === 0;
      }
      setHasMore(result.pagination.hasMore);
    } catch (err) {
      reportApiFailure();
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
          reportApiSuccess();
        } else {
          reportApiFailure();
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        reportApiFailure();
      }
    }
    fetchUsers();
  }, [reportApiSuccess, reportApiFailure]);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, false, selectedUser?.id, throttleEnabled, simulateOffline);
  }, [fetchPosts, selectedUser, throttleEnabled, simulateOffline]);

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
      fetchPosts(page, true, selectedUser?.id, throttleEnabled, simulateOffline);
    }
  }, [page, fetchPosts, selectedUser, throttleEnabled, simulateOffline]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'n' && !showCreateModal && !postToEdit) {
        e.preventDefault();
        setShowCreateModal(true);
      }

      if (e.key === 'Escape') {
        if (showCreateModal) setShowCreateModal(false);
        if (postToEdit) setPostToEdit(null);
        if (postToDelete) setPostToDelete(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCreateModal, postToEdit, postToDelete]);

  async function handleDelete(id: number) {
    try {
      setDeleteError(null);
      setDeletingPostId(id);
      setPostToDelete(null);

      // Check for offline mode
      if (simulateOffline) {
        throw new Error('Unable to delete post while offline. Please check your connection and try again.');
      }

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 300));

      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        reportApiFailure();
        if (response.status >= 500) {
          throw new Error('Server error. Unable to delete the post. Please try again later.');
        }
        throw new Error('Failed to delete post. Please try again.');
      }
      reportApiSuccess();
      setPosts(posts.filter((post) => post.id !== id));
      setToast({ message: 'Post deleted successfully', type: 'success' });
    } catch (err) {
      reportApiFailure();
      const errorMessage = err instanceof TypeError && err.message === 'Failed to fetch'
        ? 'Unable to connect to the server. Please check your connection.'
        : err instanceof Error ? err.message : 'Failed to delete post';
      setDeleteError(errorMessage);
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setDeletingPostId(null);
    }
  }

  async function handleCreate(data: { title: string; body: string; userId?: number }) {
    // Check for offline mode first
    if (simulateOffline) {
      setToast({ message: 'Unable to create post while offline. Please check your connection and try again.', type: 'error' });
      throw new Error('Offline');
    }

    // Optimistic update - create a temporary post
    const tempId = -Date.now();
    const selectedUserData = users.find((u) => u.id === data.userId);
    const optimisticPost: PostWithAuthor = {
      id: tempId,
      userId: data.userId || 0,
      title: data.title,
      body: data.body,
      author: {
        name: selectedUserData?.name || 'Unknown',
        username: selectedUserData?.username || 'unknown',
      },
    };

    const wasEmpty = posts.length === 0;
    setPosts([optimisticPost, ...posts]);
    setShowCreateModal(false);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        reportApiFailure();
        const errorData = await response.json();
        if (response.status >= 500) {
          throw new Error('Server error. Unable to create the post. Please try again later.');
        }
        throw new Error(errorData.error || 'Failed to create post. Please try again.');
      }
      const newPost = await response.json();
      reportApiSuccess();

      // Replace optimistic post with real one
      setPosts((prev) => prev.map((p) => (p.id === tempId ? newPost : p)));

      // Show confetti if this was the first post
      if (wasEmpty) {
        setShowConfetti(true);
      }

      setToast({ message: 'Post created successfully!', type: 'success' });
    } catch (err) {
      reportApiFailure();
      // Rollback optimistic update
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
      const errorMessage = err instanceof TypeError && err.message === 'Failed to fetch'
        ? 'Unable to connect to the server. Please check your connection.'
        : err instanceof Error ? err.message : 'Failed to create post';
      setToast({ message: errorMessage, type: 'error' });
      throw err;
    }
  }

  async function handleEdit(data: { title: string; body: string }) {
    if (!postToEdit) return;

    // Check for offline mode first
    if (simulateOffline) {
      setToast({ message: 'Unable to update post while offline. Please check your connection and try again.', type: 'error' });
      throw new Error('Offline');
    }

    const originalPost = postToEdit;

    // Optimistic update
    const optimisticPost = { ...postToEdit, title: data.title, body: data.body };
    setPosts(posts.map((p) => (p.id === postToEdit.id ? optimisticPost : p)));
    setPostToEdit(null);

    try {
      const response = await fetch(`/api/posts/${originalPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        reportApiFailure();
        const errorData = await response.json();
        if (response.status >= 500) {
          throw new Error('Server error. Unable to update the post. Please try again later.');
        }
        throw new Error(errorData.error || 'Failed to update post. Please try again.');
      }
      const updatedPost = await response.json();
      reportApiSuccess();
      setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
      setToast({ message: 'Post updated successfully!', type: 'success' });
    } catch (err) {
      reportApiFailure();
      // Rollback optimistic update
      setPosts((prev) => prev.map((p) => (p.id === originalPost.id ? originalPost : p)));
      const errorMessage = err instanceof TypeError && err.message === 'Failed to fetch'
        ? 'Unable to connect to the server. Please check your connection.'
        : err instanceof Error ? err.message : 'Failed to update post';
      setToast({ message: errorMessage, type: 'error' });
      throw err;
    }
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
      if (simulateOffline) {
        setToast({ message: 'Unable to clear posts while offline.', type: 'error' });
        return;
      }
      const response = await fetch('/api/dev/clear', { method: 'DELETE' });
      if (!response.ok) {
        reportApiFailure();
        throw new Error('Failed to clear posts');
      }
      reportApiSuccess();
      setPosts([]);
      setPage(1);
      setHasMore(false);
      wasEmptyRef.current = true;
    } catch (err) {
      reportApiFailure();
      console.error('Error clearing posts:', err);
      setToast({ message: 'Failed to clear posts. Please try again.', type: 'error' });
    }
  }

  async function handleSeedData() {
    try {
      if (simulateOffline) {
        setToast({ message: 'Unable to seed data while offline.', type: 'error' });
        return;
      }
      const response = await fetch('/api/dev/seed', { method: 'POST' });
      if (!response.ok) {
        reportApiFailure();
        throw new Error('Failed to seed data');
      }
      reportApiSuccess();
      // Refresh posts
      setPage(1);
      setSelectedUser(null);
      fetchPosts(1, false, undefined, throttleEnabled, simulateOffline);
    } catch (err) {
      reportApiFailure();
      console.error('Error seeding data:', err);
      setToast({ message: 'Failed to seed data. Please try again.', type: 'error' });
    }
  }

  const emptyState = EMPTY_STATE_MESSAGES[emptyStateIndex];

  // Render main content based on state
  let content;
  if (loading) {
    content = (
      <div className="mx-auto w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <div className="flex justify-between items-center mb-10">
          <div className="h-9 w-48 bg-white/10 rounded animate-skeleton" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-white/10 rounded-full animate-skeleton" />
            <div className="h-8 w-8 bg-white/10 rounded-full animate-skeleton" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  } else if (error) {
    content = (
      <div className="mx-auto w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-10 max-w-md text-center animate-modal-content">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {isOffline ? 'Connection Lost' : 'Something went wrong'}
            </h3>
            <p className="text-[#9CA3AF] mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchPosts(1, false, selectedUser?.id, throttleEnabled, simulateOffline);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors btn-press"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 max-w-md text-center animate-modal-content">
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
              <h3 className="text-xl font-semibold text-white mb-2">{emptyState.heading}</h3>
              <p className="text-[#9CA3AF] mb-6">{emptyState.message}</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors btn-press"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Post
              </button>
              <p className="text-[#9CA3AF]/50 text-xs mt-4">
                Pro tip: Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[#9CA3AF]">N</kbd> to create a new post
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                isDeleting={deletingPostId === post.id}
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
        offlineEnabled={simulateOffline}
        onToggleOffline={setSimulateOffline}
      />
      <ScrollToTop />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
    </>
  );
}
