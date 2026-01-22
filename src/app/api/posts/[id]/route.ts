import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { validateEditPost } from '@/lib/validation';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid post id' },
        { status: 400 }
      );
    }

    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid post id' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const validation = await validateEditPost(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const { title, body: postBody } = validation.data;

    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        body: postBody,
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
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}
