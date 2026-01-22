/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostFormModal } from '@/components/PostFormModal';

// Mock fetch for users API
global.fetch = jest.fn();

const mockUsers = [
  { id: 1, name: 'John Doe', username: 'johndoe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', username: 'janesmith', email: 'jane@example.com' },
];

beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => mockUsers,
  });
});

describe('PostFormModal Validation', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Create Mode', () => {
    it('should render the create form', async () => {
      render(
        <PostFormModal
          isOpen={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Create New Post')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/body/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
      });
    });

    it('should show character counts', async () => {
      render(
        <PostFormModal
          isOpen={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('0/200')).toBeInTheDocument(); // Title counter
      expect(screen.getByText('0/10000')).toBeInTheDocument(); // Body counter
    });

    it('should update character count as user types', async () => {
      const user = userEvent.setup();
      render(
        <PostFormModal
          isOpen={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Hello');

      expect(screen.getByText('5/200')).toBeInTheDocument();
    });

    it('should show validation error for empty title on blur', async () => {
      const user = userEvent.setup();
      render(
        <PostFormModal
          isOpen={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.click(titleInput);
      await user.tab(); // blur

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });

    it('should show validation error for title too short on blur', async () => {
      const user = userEvent.setup();
      render(
        <PostFormModal
          isOpen={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Hi');
      await user.tab(); // blur

      await waitFor(() => {
        expect(screen.getByText(/Title must be at least 3 characters/)).toBeInTheDocument();
      });
    });

    it('should show validation error for body too short on blur', async () => {
      const user = userEvent.setup();
      render(
        <PostFormModal
          isOpen={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const bodyInput = screen.getByLabelText(/body/i);
      await user.type(bodyInput, 'Short');
      await user.tab(); // blur

      await waitFor(() => {
        expect(screen.getByText(/Body must be at least 10 characters/)).toBeInTheDocument();
      });
    });

    it('should clear error when valid input is entered', async () => {
      const user = userEvent.setup();
      render(
        <PostFormModal
          isOpen={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);

      // Trigger error
      await user.type(titleInput, 'Hi');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Title must be at least 3 characters/)).toBeInTheDocument();
      });

      // Fix the error
      await user.click(titleInput);
      await user.type(titleInput, 'llo World');

      await waitFor(() => {
        expect(screen.queryByText(/Title must be at least 3 characters/)).not.toBeInTheDocument();
      });
    });

    it('should show all validation errors on submit with invalid data', async () => {
      const user = userEvent.setup();
      render(
        <PostFormModal
          isOpen={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /create post/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('Body is required')).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should call onSave with valid data', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(
        <PostFormModal
          isOpen={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/title/i);
      const bodyInput = screen.getByLabelText(/body/i);

      await user.type(titleInput, 'Valid Title');
      await user.type(bodyInput, 'This is a valid body with enough characters.');

      const submitButton = screen.getByRole('button', { name: /create post/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: 'Valid Title',
          body: 'This is a valid body with enough characters.',
          userId: 1,
        });
      });
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PostFormModal
          isOpen={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    const mockPost = {
      id: 1,
      userId: 1,
      title: 'Existing Title',
      body: 'Existing body content here.',
      author: { name: 'John Doe', username: 'johndoe' },
    };

    it('should render the edit form with existing data', async () => {
      render(
        <PostFormModal
          isOpen={true}
          post={mockPost}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Edit Post')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Title')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing body content here.')).toBeInTheDocument();
    });

    it('should not show author field in edit mode', async () => {
      render(
        <PostFormModal
          isOpen={true}
          post={mockPost}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByLabelText(/author/i)).not.toBeInTheDocument();
    });

    it('should validate on edit and show errors', async () => {
      const user = userEvent.setup();
      render(
        <PostFormModal
          isOpen={true}
          post={mockPost}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.clear(titleInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });
    });

    it('should call onSave without userId in edit mode', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(
        <PostFormModal
          isOpen={true}
          post={mockPost}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: 'Updated Title',
          body: 'Existing body content here.',
          userId: undefined,
        });
      });
    });
  });

  describe('Modal visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <PostFormModal
          isOpen={false}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByText('Create New Post')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <PostFormModal
          isOpen={true}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Create New Post')).toBeInTheDocument();
    });
  });
});
