/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostsPage from '@/app/posts/page';
import { PostWithAuthor } from '@/types';

// Mock data
const mockPosts: PostWithAuthor[] = [
  {
    id: 1,
    userId: 1,
    title: 'First Post Title',
    body: 'This is the body of the first post',
    author: { name: 'John Doe', username: 'johndoe' },
  },
  {
    id: 2,
    userId: 1,
    title: 'Second Post Title',
    body: 'This is the body of the second post',
    author: { name: 'John Doe', username: 'johndoe' },
  },
  {
    id: 3,
    userId: 2,
    title: 'Third Post Title',
    body: 'This is the body of the third post',
    author: { name: 'Jane Smith', username: 'janesmith' },
  },
];

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

// Helper to create paginated response
function createPaginatedResponse(posts: PostWithAuthor[]) {
  return {
    data: posts,
    pagination: {
      page: 1,
      limit: 10,
      total: posts.length,
      totalPages: 1,
      hasMore: false,
    },
  };
}

// Helper to set up successful fetch responses
function mockFetchSuccess(posts: PostWithAuthor[] = mockPosts) {
  mockFetch.mockImplementation((url: string, options?: RequestInit) => {
    if (url.startsWith('/api/posts?') && (!options || options.method !== 'DELETE')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(createPaginatedResponse(posts)),
      });
    }
    if (url.match(/\/api\/posts\/\d+/) && options?.method === 'DELETE') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Post deleted successfully' }),
      });
    }
    return Promise.reject(new Error('Unknown URL'));
  });
}

function mockFetchError() {
  mockFetch.mockImplementation(() => {
    return Promise.resolve({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' }),
    });
  });
}

function mockDeleteError() {
  mockFetch.mockImplementation((url: string, options?: RequestInit) => {
    if (url.startsWith('/api/posts?')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(createPaginatedResponse(mockPosts)),
      });
    }
    if (options?.method === 'DELETE') {
      return Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Failed to delete post' }),
      });
    }
    return Promise.reject(new Error('Unknown URL'));
  });
}

describe('Posts Page', () => {
  describe('Posts Listing', () => {
    it('should render loading state initially', () => {
      mockFetchSuccess();
      render(<PostsPage />);
      // Loading spinner is shown (no posts visible yet)
      expect(screen.queryByText('First Post Title')).not.toBeInTheDocument();
    });

    it('should render all posts with author info', async () => {
      mockFetchSuccess();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('First Post Title')).toBeInTheDocument();
      });

      // Check all posts are rendered
      expect(screen.getByText('Second Post Title')).toBeInTheDocument();
      expect(screen.getByText('Third Post Title')).toBeInTheDocument();

      // Check author info is displayed
      expect(screen.getAllByText(/John Doe/)).toHaveLength(2);
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
    });

    it('should render posts in card layout', async () => {
      mockFetchSuccess();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('First Post Title')).toBeInTheDocument();
      });

      // Each post should have title, body, and author in a card (article element)
      const firstPost = screen.getByText('First Post Title').closest('article');
      expect(firstPost).toBeInTheDocument();
      expect(within(firstPost!).getByText(/This is the body of the first post/)).toBeInTheDocument();
    });

    it('should display post body content', async () => {
      mockFetchSuccess();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText(/This is the body of the first post/)).toBeInTheDocument();
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should show delete button on each post', async () => {
      mockFetchSuccess();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('First Post Title')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons).toHaveLength(mockPosts.length);
    });

    it('should show confirmation modal when delete button is clicked', async () => {
      mockFetchSuccess();
      const user = userEvent.setup();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('First Post Title')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    it('should close modal when cancel is clicked', async () => {
      mockFetchSuccess();
      const user = userEvent.setup();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('First Post Title')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should delete post when confirm is clicked', async () => {
      mockFetchSuccess();
      const user = userEvent.setup();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('First Post Title')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('First Post Title')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should display error message when posts fail to load', async () => {
      mockFetchError();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should display error when delete fails', async () => {
      mockDeleteError();
      const user = userEvent.setup();

      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('First Post Title')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        // Both error banner and toast show the error
        const errorMessages = screen.getAllByText(/failed to delete/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state card when no posts exist', async () => {
      mockFetchSuccess([]);
      render(<PostsPage />);

      // Wait for empty state card (has create button)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create first post/i })).toBeInTheDocument();
      });
    });

    it('should display create first post button in empty state', async () => {
      mockFetchSuccess([]);
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create first post/i })).toBeInTheDocument();
      });
    });

    it('should open create modal when clicking create first post button', async () => {
      mockFetchSuccess([]);
      const user = userEvent.setup();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create first post/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create first post/i }));

      await waitFor(() => {
        expect(screen.getByText('Create New Post')).toBeInTheDocument();
      });
    });
  });

  describe('End of List', () => {
    it('should display caught up message when no more posts', async () => {
      mockFetchSuccess();
      render(<PostsPage />);

      await waitFor(() => {
        expect(screen.getByText('First Post Title')).toBeInTheDocument();
      });

      expect(screen.getByText(/You're all caught up!/)).toBeInTheDocument();
    });
  });
});
