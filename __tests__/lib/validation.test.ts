import {
  createPostSchema,
  editPostSchema,
  validateCreatePost,
  validateEditPost,
  formatYupErrors,
  POST_TITLE_MIN_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_BODY_MIN_LENGTH,
  POST_BODY_MAX_LENGTH,
} from '@/lib/validation';
import * as yup from 'yup';

describe('Post Validation Schemas', () => {
  describe('createPostSchema', () => {
    it('should validate a valid post', async () => {
      const validPost = {
        title: 'Valid Title',
        body: 'This is a valid body with enough characters.',
        userId: 1,
      };

      await expect(createPostSchema.validate(validPost)).resolves.toEqual({
        title: 'Valid Title',
        body: 'This is a valid body with enough characters.',
        userId: 1,
      });
    });

    it('should trim whitespace from title and body', async () => {
      const postWithWhitespace = {
        title: '  Trimmed Title  ',
        body: '  This body has extra whitespace.  ',
        userId: 1,
      };

      const result = await createPostSchema.validate(postWithWhitespace);
      expect(result.title).toBe('Trimmed Title');
      expect(result.body).toBe('This body has extra whitespace.');
    });

    it('should reject empty title', async () => {
      const invalidPost = {
        title: '',
        body: 'Valid body content here.',
        userId: 1,
      };

      await expect(createPostSchema.validate(invalidPost)).rejects.toThrow('Title is required');
    });

    it('should reject title that is too short', async () => {
      const invalidPost = {
        title: 'Hi',
        body: 'Valid body content here.',
        userId: 1,
      };

      await expect(createPostSchema.validate(invalidPost)).rejects.toThrow(
        `Title must be at least ${POST_TITLE_MIN_LENGTH} characters`
      );
    });

    it('should reject title that is too long', async () => {
      const invalidPost = {
        title: 'A'.repeat(POST_TITLE_MAX_LENGTH + 1),
        body: 'Valid body content here.',
        userId: 1,
      };

      await expect(createPostSchema.validate(invalidPost)).rejects.toThrow(
        `Title must be no more than ${POST_TITLE_MAX_LENGTH} characters`
      );
    });

    it('should reject empty body', async () => {
      const invalidPost = {
        title: 'Valid Title',
        body: '',
        userId: 1,
      };

      await expect(createPostSchema.validate(invalidPost)).rejects.toThrow('Body is required');
    });

    it('should reject body that is too short', async () => {
      const invalidPost = {
        title: 'Valid Title',
        body: 'Short',
        userId: 1,
      };

      await expect(createPostSchema.validate(invalidPost)).rejects.toThrow(
        `Body must be at least ${POST_BODY_MIN_LENGTH} characters`
      );
    });

    it('should reject body that is too long', async () => {
      const invalidPost = {
        title: 'Valid Title',
        body: 'A'.repeat(POST_BODY_MAX_LENGTH + 1),
        userId: 1,
      };

      await expect(createPostSchema.validate(invalidPost)).rejects.toThrow(
        `Body must be no more than ${POST_BODY_MAX_LENGTH} characters`
      );
    });

    it('should reject missing userId', async () => {
      const invalidPost = {
        title: 'Valid Title',
        body: 'Valid body content here.',
      };

      await expect(createPostSchema.validate(invalidPost)).rejects.toThrow('Author is required');
    });

    it('should reject invalid userId (negative)', async () => {
      const invalidPost = {
        title: 'Valid Title',
        body: 'Valid body content here.',
        userId: -1,
      };

      await expect(createPostSchema.validate(invalidPost)).rejects.toThrow('Invalid author selected');
    });

    it('should reject invalid userId (non-integer)', async () => {
      const invalidPost = {
        title: 'Valid Title',
        body: 'Valid body content here.',
        userId: 1.5,
      };

      await expect(createPostSchema.validate(invalidPost)).rejects.toThrow('Invalid author selected');
    });
  });

  describe('editPostSchema', () => {
    it('should validate a valid edit', async () => {
      const validEdit = {
        title: 'Updated Title',
        body: 'Updated body content here.',
      };

      await expect(editPostSchema.validate(validEdit)).resolves.toEqual({
        title: 'Updated Title',
        body: 'Updated body content here.',
      });
    });

    it('should not require userId', async () => {
      const validEdit = {
        title: 'Updated Title',
        body: 'Updated body content here.',
      };

      // Should not throw even without userId
      await expect(editPostSchema.validate(validEdit)).resolves.toBeDefined();
    });

    it('should apply same title validations as create', async () => {
      const invalidEdit = {
        title: 'Hi',
        body: 'Valid body content here.',
      };

      await expect(editPostSchema.validate(invalidEdit)).rejects.toThrow(
        `Title must be at least ${POST_TITLE_MIN_LENGTH} characters`
      );
    });

    it('should apply same body validations as create', async () => {
      const invalidEdit = {
        title: 'Valid Title',
        body: 'Short',
      };

      await expect(editPostSchema.validate(invalidEdit)).rejects.toThrow(
        `Body must be at least ${POST_BODY_MIN_LENGTH} characters`
      );
    });
  });

  describe('validateCreatePost', () => {
    it('should return success with valid data', async () => {
      const result = await validateCreatePost({
        title: 'Valid Title',
        body: 'Valid body content here.',
        userId: 1,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Valid Title');
      }
    });

    it('should return errors for invalid data', async () => {
      const result = await validateCreatePost({
        title: '',
        body: '',
        userId: undefined,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveProperty('title');
        expect(result.errors).toHaveProperty('body');
        expect(result.errors).toHaveProperty('userId');
      }
    });

    it('should collect all errors when abortEarly is false', async () => {
      const result = await validateCreatePost({
        title: 'Hi',
        body: 'Short',
        userId: -1,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('validateEditPost', () => {
    it('should return success with valid data', async () => {
      const result = await validateEditPost({
        title: 'Valid Title',
        body: 'Valid body content here.',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Valid Title');
      }
    });

    it('should return errors for invalid data', async () => {
      const result = await validateEditPost({
        title: '',
        body: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveProperty('title');
        expect(result.errors).toHaveProperty('body');
      }
    });
  });

  describe('formatYupErrors', () => {
    it('should format multiple errors from inner array', () => {
      const error = new yup.ValidationError([
        new yup.ValidationError('Title error', 'bad', 'title'),
        new yup.ValidationError('Body error', 'bad', 'body'),
      ]);

      const formatted = formatYupErrors(error);

      expect(formatted).toEqual({
        title: 'Title error',
        body: 'Body error',
      });
    });

    it('should format single error with path', () => {
      const error = new yup.ValidationError('Single error', 'bad', 'title');

      const formatted = formatYupErrors(error);

      expect(formatted).toEqual({
        title: 'Single error',
      });
    });

    it('should keep first error when multiple errors for same field', () => {
      const error = new yup.ValidationError([
        new yup.ValidationError('First title error', 'bad', 'title'),
        new yup.ValidationError('Second title error', 'bad', 'title'),
      ]);

      const formatted = formatYupErrors(error);

      expect(formatted.title).toBe('First title error');
    });
  });
});
