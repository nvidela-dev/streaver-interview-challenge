import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    const result = await prisma.post.deleteMany();

    return NextResponse.json({
      message: 'All posts cleared',
      count: result.count,
    });
  } catch (error) {
    console.error('Error clearing posts:', error);
    return NextResponse.json({ error: 'Failed to clear posts' }, { status: 500 });
  }
}
