import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');

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

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

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

    return NextResponse.json(postsWithAuthor);
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
    const { title, body: postBody, userId } = body;

    if (!title || !postBody || !userId) {
      return NextResponse.json(
        { error: 'Title, body, and userId are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
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
