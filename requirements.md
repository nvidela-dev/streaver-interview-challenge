# Requirements

## Functional Requirements

### FR-1: Posts Listing
- Display all posts from the database on a `/posts` page
- Each post displayed as a card element
- Cards show post title, body content, and author info (name/username)

### FR-2: Post Deletion
- Each post card has a "Delete" button
- Clicking delete shows a confirmation modal/dialog
- On confirmation, post is deleted from database
- UI updates to reflect deletion

### FR-3: Filter by User
- Users can filter posts by the author's userId
- Filter mechanism on the `/posts` page

### FR-4: Error Handling
- Display user-friendly error messages when:
  - Posts fail to load
  - Post deletion fails
- Errors should not crash the application

### FR-5: Offline Resilience
- App should handle poor/unstable internet connections gracefully

## Technical Requirements

### TR-1: Stack
- **Framework**: Next.js with TypeScript
- **ORM**: Prisma
- **Database**: SQLite
- **Testing**: Jest

### TR-2: Database Schema
- **Users table**: id, name, username, email, address fields, phone, website, company fields
- **Posts table**: id, userId (FK), title, body

### TR-3: Seeding
- Seed users from `sample-user-list.json`
- Seed posts from `sample-posts.json`
- Seeding script included in solution

### TR-4: Environment
- Database connection in `.env` file
- `.env` committed to repo (for evaluation purposes)

## UI Requirements

### UI-1: Color Scheme
- Dark greens
- Olives
- Khakis

### UI-2: Layout
- Single page application (`/posts`)
- Card-based post listing
- Confirmation modal for deletions
