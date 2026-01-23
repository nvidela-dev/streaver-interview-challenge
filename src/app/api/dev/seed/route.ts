import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import samplePosts from '../../../../../context/sample-posts.json';

interface SeedPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export async function POST() {
  try {
    // Clear existing posts first
    await prisma.post.deleteMany();

    // Insert posts from sample data
    const posts = samplePosts as SeedPost[];

    for (const post of posts) {
      await prisma.post.create({
        data: {
          id: post.id,
          userId: post.userId,
          title: post.title,
          body: post.body,
        },
      });
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      count: posts.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
