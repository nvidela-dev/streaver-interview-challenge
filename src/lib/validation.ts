import * as yup from 'yup';

// Post validation constants
export const POST_TITLE_MIN_LENGTH = 3;
export const POST_TITLE_MAX_LENGTH = 200;
export const POST_BODY_MIN_LENGTH = 10;
export const POST_BODY_MAX_LENGTH = 10000;

// Create post schema (requires userId)
export const createPostSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Title is required')
    .min(POST_TITLE_MIN_LENGTH, `Title must be at least ${POST_TITLE_MIN_LENGTH} characters`)
    .max(POST_TITLE_MAX_LENGTH, `Title must be no more than ${POST_TITLE_MAX_LENGTH} characters`),
  body: yup
    .string()
    .trim()
    .required('Body is required')
    .min(POST_BODY_MIN_LENGTH, `Body must be at least ${POST_BODY_MIN_LENGTH} characters`)
    .max(POST_BODY_MAX_LENGTH, `Body must be no more than ${POST_BODY_MAX_LENGTH} characters`),
  userId: yup
    .number()
    .required('Author is required')
    .positive('Invalid author selected')
    .integer('Invalid author selected'),
});

// Edit post schema (no userId required)
export const editPostSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Title is required')
    .min(POST_TITLE_MIN_LENGTH, `Title must be at least ${POST_TITLE_MIN_LENGTH} characters`)
    .max(POST_TITLE_MAX_LENGTH, `Title must be no more than ${POST_TITLE_MAX_LENGTH} characters`),
  body: yup
    .string()
    .trim()
    .required('Body is required')
    .min(POST_BODY_MIN_LENGTH, `Body must be at least ${POST_BODY_MIN_LENGTH} characters`)
    .max(POST_BODY_MAX_LENGTH, `Body must be no more than ${POST_BODY_MAX_LENGTH} characters`),
});

// Type exports
export type CreatePostInput = yup.InferType<typeof createPostSchema>;
export type EditPostInput = yup.InferType<typeof editPostSchema>;

// Helper to format Yup validation errors
export function formatYupErrors(error: yup.ValidationError): Record<string, string> {
  const errors: Record<string, string> = {};

  if (error.inner.length > 0) {
    error.inner.forEach((err) => {
      if (err.path && !errors[err.path]) {
        errors[err.path] = err.message;
      }
    });
  } else if (error.path) {
    errors[error.path] = error.message;
  }

  return errors;
}

// Helper for API validation
export async function validateCreatePost(data: unknown): Promise<{
  success: true;
  data: CreatePostInput;
} | {
  success: false;
  errors: Record<string, string>;
}> {
  try {
    const validated = await createPostSchema.validate(data, { abortEarly: false });
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { success: false, errors: formatYupErrors(error) };
    }
    throw error;
  }
}

export async function validateEditPost(data: unknown): Promise<{
  success: true;
  data: EditPostInput;
} | {
  success: false;
  errors: Record<string, string>;
}> {
  try {
    const validated = await editPostSchema.validate(data, { abortEarly: false });
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { success: false, errors: formatYupErrors(error) };
    }
    throw error;
  }
}
