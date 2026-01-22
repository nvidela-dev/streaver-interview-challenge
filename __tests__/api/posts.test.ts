import { PrismaClient } from '@/generated/prisma/client';

// Mock Prisma client
jest.mock('@/generated/prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

const mockPrisma = {
  post: {
    findMany: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

const mockPostsWithUsers = [
  {
    id: 1,
    userId: 1,
    title: 'First Post',
    body: 'This is the first post body',
    user: { name: 'John Doe', username: 'johndoe' },
  },
  {
    id: 2,
    userId: 1,
    title: 'Second Post',
    body: 'This is the second post body',
    user: { name: 'John Doe', username: 'johndoe' },
  },
  {
    id: 3,
    userId: 2,
    title: 'Third Post',
    body: 'This is the third post body',
    user: { name: 'Jane Smith', username: 'janesmith' },
  },
];

describe('GET /api/posts', () => {
  it('should return all posts with author info', async () => {
    mockPrisma.post.findMany.mockResolvedValue(mockPostsWithUsers);
    mockPrisma.post.count.mockResolvedValue(3);

    const { GET } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts');
    const response = await GET(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data).toHaveLength(3);
    expect(result.data[0]).toEqual({
      id: 1,
      userId: 1,
      title: 'First Post',
      body: 'This is the first post body',
      author: { name: 'John Doe', username: 'johndoe' },
    });
    expect(result.pagination).toMatchObject({
      page: 1,
      total: 3,
      hasMore: false,
    });
  });

  it('should filter posts by userId when query param provided', async () => {
    const filteredPosts = mockPostsWithUsers.filter((p) => p.userId === 1);
    mockPrisma.post.findMany.mockResolvedValue(filteredPosts);
    mockPrisma.post.count.mockResolvedValue(2);

    const { GET } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts?userId=1');
    const response = await GET(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data).toHaveLength(2);
    expect(result.data.every((post: { userId: number }) => post.userId === 1)).toBe(true);
    expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 1 },
      })
    );
  });

  it('should return 400 for invalid userId', async () => {
    const { GET } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts?userId=invalid');
    const response = await GET(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result).toHaveProperty('error');
  });

  it('should return empty array when no posts exist', async () => {
    mockPrisma.post.findMany.mockResolvedValue([]);
    mockPrisma.post.count.mockResolvedValue(0);

    const { GET } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts');
    const response = await GET(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });

  it('should return 500 on database error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockPrisma.post.findMany.mockRejectedValue(new Error('Database error'));
    mockPrisma.post.count.mockRejectedValue(new Error('Database error'));

    const { GET } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts');
    const response = await GET(request);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result).toHaveProperty('error');
    consoleSpy.mockRestore();
  });
});

describe('DELETE /api/posts/[id]', () => {
  it('should delete a post and return success', async () => {
    const deletedPost = { id: 1, userId: 1, title: 'Deleted Post', body: 'Body' };
    mockPrisma.post.findUnique.mockResolvedValue(deletedPost);
    mockPrisma.post.delete.mockResolvedValue(deletedPost);

    const { DELETE } = await import('@/app/api/posts/[id]/route');
    const request = new Request('http://localhost:3000/api/posts/1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('message');
    expect(mockPrisma.post.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should return 404 when post not found', async () => {
    mockPrisma.post.findUnique.mockResolvedValue(null);

    const { DELETE } = await import('@/app/api/posts/[id]/route');
    const request = new Request('http://localhost:3000/api/posts/999', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
  });

  it('should return 400 for invalid post id', async () => {
    const { DELETE } = await import('@/app/api/posts/[id]/route');
    const request = new Request('http://localhost:3000/api/posts/invalid', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'invalid' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('should return 500 on database error during delete', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockPrisma.post.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.post.delete.mockRejectedValue(new Error('Database error'));

    const { DELETE } = await import('@/app/api/posts/[id]/route');
    const request = new Request('http://localhost:3000/api/posts/1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    consoleSpy.mockRestore();
  });
});

describe('POST /api/posts validation', () => {
  const mockUser = { id: 1, name: 'John Doe', username: 'johndoe' };
  const mockCreatedPost = {
    id: 1,
    userId: 1,
    title: 'Valid Title',
    body: 'Valid body content here.',
    user: { name: 'John Doe', username: 'johndoe' },
  };

  it('should create a post with valid data', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.post.create.mockResolvedValue(mockCreatedPost);

    const { POST } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Valid Title',
        body: 'Valid body content here.',
        userId: 1,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.title).toBe('Valid Title');
  });

  it('should return 400 for empty title', async () => {
    const { POST } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '',
        body: 'Valid body content here.',
        userId: 1,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.errors).toHaveProperty('title');
  });

  it('should return 400 for title too short', async () => {
    const { POST } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Hi',
        body: 'Valid body content here.',
        userId: 1,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.title).toContain('at least');
  });

  it('should return 400 for body too short', async () => {
    const { POST } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Valid Title',
        body: 'Short',
        userId: 1,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.body).toContain('at least');
  });

  it('should return 400 for missing userId', async () => {
    const { POST } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Valid Title',
        body: 'Valid body content here.',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors).toHaveProperty('userId');
  });

  it('should return 404 for non-existent user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const { POST } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Valid Title',
        body: 'Valid body content here.',
        userId: 999,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('User not found');
  });

  it('should return multiple validation errors', async () => {
    const { POST } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '',
        body: '',
        userId: -1,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(Object.keys(data.errors).length).toBeGreaterThanOrEqual(3);
  });
});

describe('PUT /api/posts/[id] validation', () => {
  const mockExistingPost = {
    id: 1,
    userId: 1,
    title: 'Original Title',
    body: 'Original body content.',
  };
  const mockUpdatedPost = {
    id: 1,
    userId: 1,
    title: 'Updated Title',
    body: 'Updated body content here.',
    user: { name: 'John Doe', username: 'johndoe' },
  };

  it('should update a post with valid data', async () => {
    mockPrisma.post.findUnique.mockResolvedValue(mockExistingPost);
    mockPrisma.post.update.mockResolvedValue(mockUpdatedPost);

    const { PUT } = await import('@/app/api/posts/[id]/route');
    const request = new Request('http://localhost:3000/api/posts/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Updated Title',
        body: 'Updated body content here.',
      }),
    });
    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe('Updated Title');
  });

  it('should return 400 for empty title on update', async () => {
    const { PUT } = await import('@/app/api/posts/[id]/route');
    const request = new Request('http://localhost:3000/api/posts/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '',
        body: 'Valid body content here.',
      }),
    });
    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.errors).toHaveProperty('title');
  });

  it('should return 400 for title too short on update', async () => {
    const { PUT } = await import('@/app/api/posts/[id]/route');
    const request = new Request('http://localhost:3000/api/posts/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Hi',
        body: 'Valid body content here.',
      }),
    });
    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.title).toContain('at least');
  });

  it('should return 400 for body too short on update', async () => {
    const { PUT } = await import('@/app/api/posts/[id]/route');
    const request = new Request('http://localhost:3000/api/posts/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Valid Title',
        body: 'Short',
      }),
    });
    const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.body).toContain('at least');
  });

  it('should return 404 for non-existent post on update', async () => {
    mockPrisma.post.findUnique.mockResolvedValue(null);

    const { PUT } = await import('@/app/api/posts/[id]/route');
    const request = new Request('http://localhost:3000/api/posts/999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Valid Title',
        body: 'Valid body content here.',
      }),
    });
    const response = await PUT(request, { params: Promise.resolve({ id: '999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Post not found');
  });
});
