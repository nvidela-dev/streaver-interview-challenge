import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import assert from 'node:assert';

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Running database seed verification tests...\n');
  console.log('ℹ️  Run `npm run db:reset` first if you need to reset the database.\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Should seed 10 users
  try {
    const userCount = await prisma.user.count();
    assert.strictEqual(userCount, 10, `Expected 10 users, got ${userCount}`);
    console.log('✅ Should seed 10 users');
    passed++;
  } catch (error) {
    console.log('❌ Should seed 10 users:', (error as Error).message);
    failed++;
  }

  // Test 2: Should seed 100 posts
  try {
    const postCount = await prisma.post.count();
    assert.strictEqual(postCount, 100, `Expected 100 posts, got ${postCount}`);
    console.log('✅ Should seed 100 posts');
    passed++;
  } catch (error) {
    console.log('❌ Should seed 100 posts:', (error as Error).message);
    failed++;
  }

  // Test 3: Should have valid user-post relationships
  try {
    const usersWithPosts = await prisma.user.findMany({
      include: { posts: true },
    });

    // Each user should have posts
    for (const user of usersWithPosts) {
      assert.ok(
        user.posts.length > 0,
        `User ${user.id} has no posts`
      );
    }

    // Total posts across all users should equal 100
    const totalPosts = usersWithPosts.reduce(
      (sum, user) => sum + user.posts.length,
      0
    );
    assert.strictEqual(totalPosts, 100, `Expected 100 total posts, got ${totalPosts}`);
    console.log('✅ Should have valid user-post relationships');
    passed++;
  } catch (error) {
    console.log('❌ Should have valid user-post relationships:', (error as Error).message);
    failed++;
  }

  // Test 4: Should have correct user data structure
  try {
    const user = await prisma.user.findFirst();
    assert.ok(user !== null, 'No users found');
    assert.ok('id' in user, 'User missing id');
    assert.ok('name' in user, 'User missing name');
    assert.ok('username' in user, 'User missing username');
    assert.ok('email' in user, 'User missing email');
    assert.ok('street' in user, 'User missing street');
    assert.ok('city' in user, 'User missing city');
    assert.ok('companyName' in user, 'User missing companyName');
    console.log('✅ Should have correct user data structure');
    passed++;
  } catch (error) {
    console.log('❌ Should have correct user data structure:', (error as Error).message);
    failed++;
  }

  // Test 5: Should have correct post data structure
  try {
    const post = await prisma.post.findFirst({
      include: { user: true },
    });
    assert.ok(post !== null, 'No posts found');
    assert.ok('id' in post, 'Post missing id');
    assert.ok('title' in post, 'Post missing title');
    assert.ok('body' in post, 'Post missing body');
    assert.ok('userId' in post, 'Post missing userId');
    assert.ok(post.user !== null, 'Post missing user relation');
    console.log('✅ Should have correct post data structure');
    passed++;
  } catch (error) {
    console.log('❌ Should have correct post data structure:', (error as Error).message);
    failed++;
  }

  // Summary
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});
