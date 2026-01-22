import { PrismaClient } from '@/generated/prisma/client';

// Mock Prisma client
jest.mock('@/generated/prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

const mockPrisma = {
  post: {
    findMany: jest.fn(),
    delete: jest.fn(),
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

    const { GET } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(3);
    expect(data[0]).toEqual({
      id: 1,
      userId: 1,
      title: 'First Post',
      body: 'This is the first post body',
      author: { name: 'John Doe', username: 'johndoe' },
    });
  });

  it('should filter posts by userId when query param provided', async () => {
    const filteredPosts = mockPostsWithUsers.filter((p) => p.userId === 1);
    mockPrisma.post.findMany.mockResolvedValue(filteredPosts);

    const { GET } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts?userId=1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data.every((post: { userId: number }) => post.userId === 1)).toBe(true);
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
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('should return empty array when no posts exist', async () => {
    mockPrisma.post.findMany.mockResolvedValue([]);

    const { GET } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('should return 500 on database error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockPrisma.post.findMany.mockRejectedValue(new Error('Database error'));

    const { GET } = await import('@/app/api/posts/route');
    const request = new Request('http://localhost:3000/api/posts');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
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
