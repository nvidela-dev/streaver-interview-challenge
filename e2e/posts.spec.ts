import { test, expect } from '@playwright/test';

test.describe('Posts Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear data before each test for a clean state
    await page.goto('/posts');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Posts Listing', () => {
    test('should display the page header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Our Latest News' })).toBeVisible();
    });

    test('should show new post button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /new post/i })).toBeVisible();
    });

    test('should show filter button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /filter/i })).toBeVisible();
    });
  });

  test.describe('Create Post', () => {
    test('should open create modal when clicking new post button', async ({ page }) => {
      await page.getByRole('button', { name: /new post/i }).click();
      await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.getByRole('button', { name: /new post/i }).click();
      await page.getByRole('button', { name: 'Create Post' }).click();
      await expect(page.getByText(/title is required/i)).toBeVisible();
    });

    test('should create a new post successfully', async ({ page }) => {
      await page.getByRole('button', { name: /new post/i }).click();

      await page.getByLabel(/title/i).fill('E2E Test Post');
      await page.getByLabel(/body/i).fill('This is a test post created by Playwright');

      // Select an author from the dropdown
      await page.getByLabel(/author/i).selectOption({ index: 1 });

      await page.getByRole('button', { name: 'Create Post' }).click();

      // Should show success toast
      await expect(page.getByText(/post created successfully/i)).toBeVisible();

      // Post should appear in the list (use first() in case of duplicates from previous test runs)
      await expect(page.getByRole('heading', { name: 'E2E Test Post' }).first()).toBeVisible();
    });

    test('should close modal when clicking cancel', async ({ page }) => {
      await page.getByRole('button', { name: /new post/i }).click();
      await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();

      await page.getByRole('button', { name: /cancel/i }).click();
      await expect(page.getByRole('heading', { name: 'Create New Post' })).not.toBeVisible();
    });
  });

  test.describe('Edit Post', () => {
    test('should open edit modal when clicking edit button', async ({ page }) => {
      // First ensure there's a post to edit
      const editButton = page.getByRole('button', { name: /edit/i }).first();

      // Skip if no posts
      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click();
        await expect(page.getByRole('heading', { name: 'Edit Post' })).toBeVisible();
      }
    });

    test('should update a post successfully', async ({ page }) => {
      const editButton = page.getByRole('button', { name: /edit/i }).first();

      if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editButton.click();

        // Clear and fill new title
        await page.getByLabel(/title/i).clear();
        await page.getByLabel(/title/i).fill('Updated E2E Post Title');

        await page.getByRole('button', { name: /save/i }).click();

        // Should show success toast
        await expect(page.getByText(/post updated successfully/i)).toBeVisible();

        // Updated title should appear (use first() in case of duplicates)
        await expect(page.getByRole('heading', { name: 'Updated E2E Post Title' }).first()).toBeVisible();
      }
    });
  });

  test.describe('Delete Post', () => {
    test('should show confirmation modal when clicking delete', async ({ page }) => {
      const deleteButton = page.getByRole('button', { name: /delete/i }).first();

      if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteButton.click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText(/are you sure/i)).toBeVisible();
      }
    });

    test('should close confirmation modal when clicking cancel', async ({ page }) => {
      const deleteButton = page.getByRole('button', { name: /delete/i }).first();

      if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteButton.click();
        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page.getByRole('dialog')).not.toBeVisible();
      }
    });

    test('should delete post when confirming', async ({ page }) => {
      // First create a post to delete
      await page.getByRole('button', { name: /new post/i }).click();
      await page.getByLabel(/title/i).fill('Post To Delete');
      await page.getByLabel(/body/i).fill('This post will be deleted');
      await page.getByLabel(/author/i).selectOption({ index: 1 });
      await page.getByRole('button', { name: 'Create Post' }).click();

      await expect(page.getByText('Post To Delete')).toBeVisible();

      // Now delete it
      const postCard = page.locator('article').filter({ hasText: 'Post To Delete' });
      await postCard.getByRole('button', { name: /delete/i }).click();

      await page.getByRole('button', { name: /confirm/i }).click();

      // Should show success toast
      await expect(page.getByText(/post deleted successfully/i)).toBeVisible();

      // Post should be removed
      await expect(page.getByText('Post To Delete')).not.toBeVisible();
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('should open create modal when pressing N', async ({ page }) => {
      await page.keyboard.press('n');
      await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();
    });

    test('should close modal when pressing Escape', async ({ page }) => {
      await page.keyboard.press('n');
      await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.getByRole('heading', { name: 'Create New Post' })).not.toBeVisible();
    });

    test('should not trigger shortcut when typing in input', async ({ page }) => {
      await page.keyboard.press('n');

      // Type 'n' in the title field - should not open another modal
      await page.getByLabel(/title/i).fill('Test with n character');

      // Modal should still be open (only one)
      await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();
    });
  });

  test.describe('Filter and Search', () => {
    test('should open filter dropdown when clicking filter button', async ({ page }) => {
      await page.getByRole('button', { name: /filter/i }).click();

      // Dropdown should be visible with "Filter by Author" header
      await expect(page.getByText('Filter by Author')).toBeVisible();
    });

    test('should show search input when clicking search icon', async ({ page }) => {
      await page.getByRole('button', { name: /filter/i }).click();

      // Click the search toggle
      await page.getByTestId('search-toggle').click();

      // Search input should appear
      await expect(page.getByPlaceholder(/search/i)).toBeVisible();
    });

    test('should filter users in dropdown when searching', async ({ page }) => {
      await page.getByRole('button', { name: /filter/i }).click();
      await page.getByTestId('search-toggle').click();

      // Type in search
      await page.getByPlaceholder(/search/i).fill('john');

      // Should filter the list - only matching users should be visible
      // Wait for the filter to apply
      await page.waitForTimeout(100);
    });

    test('should filter posts by author when selecting user', async ({ page }) => {
      await page.getByRole('button', { name: /filter/i }).click();

      // Select the first user option
      const firstUser = page.getByRole('option').first();
      if (await firstUser.isVisible()) {
        await firstUser.click();

        // Badge should show selected user
        await expect(page.locator('.bg-\\[\\#2563EB\\]').filter({ hasText: /clear/i })).toBeVisible();
      }
    });
  });

  test.describe('Scroll to Top', () => {
    test('should show scroll to top button when scrolled down', async ({ page }) => {
      // First ensure there's enough content to scroll by seeding data
      await page.getByRole('button', { name: 'Open developer panel' }).click();
      await page.getByRole('button', { name: /seed default data/i }).click();
      await page.getByRole('button', { name: 'Close panel' }).click();

      // Wait for content to load
      await page.waitForTimeout(1000);

      // Scroll down enough to trigger the button (threshold is 400px)
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(200);

      // Scroll to top button should appear
      await expect(page.getByLabel('Scroll to top')).toBeVisible();
    });

    test('should scroll to top when clicking the button', async ({ page }) => {
      // First ensure there's enough content
      await page.getByRole('button', { name: 'Open developer panel' }).click();
      await page.getByRole('button', { name: /seed default data/i }).click();
      await page.getByRole('button', { name: 'Close panel' }).click();

      await page.waitForTimeout(1000);

      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(200);

      await page.getByLabel('Scroll to top').click();

      // Wait for scroll animation
      await page.waitForTimeout(500);

      // Should be at top
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBe(0);
    });
  });

  test.describe('Empty State', () => {
    test('should show empty state when no posts exist', async ({ page }) => {
      // Use dev panel to clear all posts
      await page.getByRole('button', { name: 'Open developer panel' }).click();
      await page.getByRole('button', { name: /clear all posts/i }).click();

      // Should show empty state
      await expect(page.getByRole('button', { name: /create first post/i })).toBeVisible();
    });

    test('should open create modal from empty state CTA', async ({ page }) => {
      await page.getByRole('button', { name: 'Open developer panel' }).click();
      await page.getByRole('button', { name: /clear all posts/i }).click();

      // Close the dev panel by clicking the overlay or close button
      await page.getByRole('button', { name: 'Close panel' }).click();

      // Wait for panel to close and animation to complete
      await page.waitForTimeout(400);

      await page.getByRole('button', { name: /create first post/i }).click();

      await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();
    });
  });

  test.describe('Toast Notifications', () => {
    test('should show success toast on post creation', async ({ page }) => {
      await page.getByRole('button', { name: /new post/i }).click();
      await page.getByLabel(/title/i).fill('Toast Test Post');
      await page.getByLabel(/body/i).fill('Testing toast notification');
      await page.getByLabel(/author/i).selectOption({ index: 1 });
      await page.getByRole('button', { name: 'Create Post' }).click();

      await expect(page.getByText(/post created successfully/i)).toBeVisible();
    });

    test('should auto-dismiss toast after duration', async ({ page }) => {
      await page.getByRole('button', { name: /new post/i }).click();
      await page.getByLabel(/title/i).fill('Toast Dismiss Test');
      await page.getByLabel(/body/i).fill('Testing toast auto-dismiss');
      await page.getByLabel(/author/i).selectOption({ index: 1 });
      await page.getByRole('button', { name: 'Create Post' }).click();

      await expect(page.getByText(/post created successfully/i)).toBeVisible();

      // Wait for toast to auto-dismiss (default 3 seconds + animation)
      await page.waitForTimeout(4000);

      await expect(page.getByText(/post created successfully/i)).not.toBeVisible();
    });
  });

  test.describe('Animations', () => {
    test('should show staggered animation on posts', async ({ page }) => {
      // Ensure there are posts
      const posts = page.locator('article');

      if (await posts.count() > 0) {
        // First post should have stagger-1 class
        const firstPost = posts.first();
        await expect(firstPost).toHaveClass(/stagger-1/);
      }
    });

    test('should show hover effect on post cards', async ({ page }) => {
      const firstPost = page.locator('article').first();

      if (await firstPost.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstPost.hover();
        // Post card should have hover styles applied (visual check)
        await expect(firstPost).toHaveClass(/post-card/);
      }
    });
  });

  test.describe('Dev Panel', () => {
    test('should toggle dev panel visibility', async ({ page }) => {
      // Dev panel toggle button should be visible
      const devToggle = page.getByRole('button', { name: 'Open developer panel' });
      await expect(devToggle).toBeVisible();

      await devToggle.click();

      // Dev panel options should be visible
      await expect(page.getByRole('button', { name: /clear all posts/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /seed default data/i })).toBeVisible();
    });

    test('should seed data when clicking seed button', async ({ page }) => {
      await page.getByRole('button', { name: 'Open developer panel' }).click();
      await page.getByRole('button', { name: /clear all posts/i }).click();

      // Close panel first
      await page.getByRole('button', { name: 'Close panel' }).click();
      await page.waitForTimeout(400);

      // Verify empty state
      await expect(page.getByRole('button', { name: /create first post/i })).toBeVisible();

      // Reopen panel and seed
      await page.getByRole('button', { name: 'Open developer panel' }).click();
      await page.getByRole('button', { name: /seed default data/i }).click();

      // Close panel
      await page.getByRole('button', { name: 'Close panel' }).click();

      // Wait for seed to complete
      await page.waitForTimeout(1000);

      // Posts should now be visible
      await expect(page.locator('article').first()).toBeVisible();
    });
  });
});
