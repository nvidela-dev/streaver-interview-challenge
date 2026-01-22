import { PrismaClient } from '../src/generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SeedUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

interface SeedPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

async function main() {
  console.log('Seeding database...');

  // Read seed data from JSON files
  const usersPath = path.join(__dirname, '../context/sample-user-list.json');
  const postsPath = path.join(__dirname, '../context/sample-posts.json');

  const users: SeedUser[] = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  const posts: SeedPost[] = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

  // Clear existing data
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Seed users
  console.log(`Seeding ${users.length} users...`);
  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        street: user.address.street,
        suite: user.address.suite,
        city: user.address.city,
        zipcode: user.address.zipcode,
        lat: user.address.geo.lat,
        lng: user.address.geo.lng,
        phone: user.phone,
        website: user.website,
        companyName: user.company.name,
        companyCatchPhrase: user.company.catchPhrase,
        companyBs: user.company.bs,
      },
    });
  }

  // Seed posts
  console.log(`Seeding ${posts.length} posts...`);
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

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
