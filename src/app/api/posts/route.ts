import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { validateCreatePost } from '@/lib/validation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const throttle = searchParams.get('throttle');

    // Add artificial delay for testing infinite scroll
    if (throttle === 'true') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Pagination defaults
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page parameter' },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit parameter (must be 1-100)' },
        { status: 400 }
      );
    }

    let where = {};
    if (userIdParam) {
      const userId = parseInt(userIdParam, 10);
      if (isNaN(userId)) {
        return NextResponse.json(
          { error: 'Invalid userId parameter' },
          { status: 400 }
        );
      }
      where = { userId };
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const postsWithAuthor = posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      title: post.title,
      body: post.body,
      author: {
        name: post.user.name,
        username: post.user.username,
      },
    }));

    return NextResponse.json({
      data: postsWithAuthor,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = await validateCreatePost(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const { title, body: postBody, userId } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', errors: { userId: 'Selected author does not exist' } },
        { status: 404 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        body: postBody,
        userId,
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: post.id,
      userId: post.userId,
      title: post.title,
      body: post.body,
      author: {
        name: post.user.name,
        username: post.user.username,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
