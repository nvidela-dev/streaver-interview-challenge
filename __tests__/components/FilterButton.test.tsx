/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterButton } from '@/components/FilterButton';

const mockUsers = [
  { id: 1, name: 'John Doe', username: 'johndoe' },
  { id: 2, name: 'Jane Smith', username: 'janesmith' },
  { id: 3, name: 'Bob Wilson', username: 'bobwilson' },
];

describe('FilterButton', () => {
  const mockOnSelectUser = jest.fn();

  beforeEach(() => {
    mockOnSelectUser.mockClear();
  });

  describe('Dropdown', () => {
    it('should render the filter button', () => {
      render(
        <FilterButton
          users={mockUsers}
          selectedUser={null}
          onSelectUser={mockOnSelectUser}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(
        <FilterButton
          users={mockUsers}
          selectedUser={null}
          onSelectUser={mockOnSelectUser}
        />
      );

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Filter by Author')).toBeInTheDocument();
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should select user when clicked', async () => {
      const user = userEvent.setup();
      render(
        <FilterButton
          users={mockUsers}
          selectedUser={null}
          onSelectUser={mockOnSelectUser}
        />
      );

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Jane Smith'));

      expect(mockOnSelectUser).toHaveBeenCalledWith(mockUsers[1]);
    });

    it('should display selected user name', () => {
      render(
        <FilterButton
          users={mockUsers}
          selectedUser={mockUsers[0]}
          onSelectUser={mockOnSelectUser}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('should show search input when search icon is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FilterButton
          users={mockUsers}
          selectedUser={null}
          onSelectUser={mockOnSelectUser}
        />
      );

      // Open dropdown
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Filter by Author')).toBeInTheDocument();
      });

      // Find and click the search button
      const searchButton = screen.getByTestId('search-toggle');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      });
    });

    it('should filter users by name', async () => {
      const user = userEvent.setup();
      render(
        <FilterButton
          users={mockUsers}
          selectedUser={null}
          onSelectUser={mockOnSelectUser}
        />
      );

      // Open dropdown
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Filter by Author')).toBeInTheDocument();
      });

      // Click search button
      const searchButton = screen.getByTestId('search-toggle');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      });

      // Type in search
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'Jane');

      // Only Jane should be visible
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
      });
    });

    it('should filter users by username', async () => {
      const user = userEvent.setup();
      render(
        <FilterButton
          users={mockUsers}
          selectedUser={null}
          onSelectUser={mockOnSelectUser}
        />
      );

      // Open dropdown
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Filter by Author')).toBeInTheDocument();
      });

      // Click search button
      const searchButton = screen.getByTestId('search-toggle');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      });

      // Type in search
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'bobwilson');

      // Only Bob should be visible
      await waitFor(() => {
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('should show no authors found when search has no matches', async () => {
      const user = userEvent.setup();
      render(
        <FilterButton
          users={mockUsers}
          selectedUser={null}
          onSelectUser={mockOnSelectUser}
        />
      );

      // Open dropdown
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Filter by Author')).toBeInTheDocument();
      });

      // Click search button
      const searchButton = screen.getByTestId('search-toggle');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      });

      // Type in search that won't match
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No authors found')).toBeInTheDocument();
      });
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();
      render(
        <FilterButton
          users={mockUsers}
          selectedUser={null}
          onSelectUser={mockOnSelectUser}
        />
      );

      // Open dropdown
      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Filter by Author')).toBeInTheDocument();
      });

      // Click search button
      const searchButton = screen.getByTestId('search-toggle');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      });

      // Type in search with different case
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'JOHN');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });
});
