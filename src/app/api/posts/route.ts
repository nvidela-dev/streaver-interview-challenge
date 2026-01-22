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
