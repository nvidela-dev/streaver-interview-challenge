# Streaver Interview Challenge

A modern, fully-featured blog/posts application built with Next.js 16, React 19, and Prisma. Features a polished UI with smooth animations, optimistic updates, and a great developer experience.

## Features

### Core Functionality
- **CRUD Operations** - Create, read, update, and delete posts
- **Infinite Scroll** - Seamlessly load more posts as you scroll
- **Filter by Author** - Search and filter posts by author with an expandable search input
- **Form Validation** - Client and server-side validation with Yup

### UX Polish
- **Skeleton Loading** - Placeholder cards while content loads
- **Staggered Animations** - Posts cascade in with smooth fade effects
- **Optimistic Updates** - Instant feedback before API confirms
- **Toast Notifications** - Success/error feedback for all actions
- **Keyboard Shortcuts** - `N` for new post, `Escape` to close modals
- **Scroll to Top** - Floating button when scrolled down
- **Confetti Celebration** - Fun animation when creating the first post
- **Hover Effects** - Cards lift with a subtle glow on hover

### Developer Tools
- **Dev Panel** - Clear data, seed sample posts, toggle API throttling
- **TypeScript** - Full type safety throughout
- **Testing** - Comprehensive test suite with Jest and React Testing Library

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Database**: SQLite with Prisma ORM
- **Validation**: Yup
- **Testing**: Jest, React Testing Library, MSW

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nvidela-dev/streaver-interview-challenge.git
   cd streaver-interview-challenge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Create the database and run migrations
   npm run db:migrate

   # Seed with sample data (optional)
   npm run db:seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000/posts](http://localhost:3000/posts)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database (destructive) |

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── posts/        # Posts page
│   │   └── globals.css   # Global styles & animations
│   ├── components/       # React components
│   ├── lib/              # Utilities (Prisma, validation)
│   └── types/            # TypeScript types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── __tests__/            # Test files
└── public/               # Static assets
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Open new post modal |
| `Escape` | Close any open modal |

## License

This project was created as part of an interview challenge for Streaver.
