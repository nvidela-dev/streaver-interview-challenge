# Development Plan

## Workflow Rules
- Each task = one PR
- No code until plan is validated
- PR is done when confirmed merged to origin

## Initialization (No PR) ✅
Setup the repository with all necessary packages, agnostic of business logic:
- [x] Initialize Next.js with TypeScript
- [x] Install Prisma, Jest, React Testing Library, MSW
- [x] Configure ESLint, Prettier
- [x] Create `.env` with SQLite connection string
- [x] Create `assumptions.md`
- [x] Create this `plan.md` and `requirements.md`
- [x] Download `sample-posts.json` from jsonplaceholder API

---

## Backend PRs

### PR-1: Types Folder
**Branch**: `feat/types`

Create shared TypeScript types inferred from seed data:
- `types/user.ts` - User, Address, Geo, Company types
- `types/post.ts` - Post type
- `types/index.ts` - Re-exports

**Files**:
- `src/types/user.ts`
- `src/types/post.ts`
- `src/types/index.ts`

---

### PR-2: Database Schema
**Branch**: `feat/database-schema`

Define Prisma schema and related types:
- `prisma/schema.prisma` - User and Post models
- Database connection configuration

**Files**:
- `prisma/schema.prisma`
- `.env` (update if needed)

---

### PR-3: Migrations and Seeding
**Branch**: `feat/migrations-seeding`

Create migrations and seed script:
- Generate Prisma migration
- Create seed script that reads from JSON files
- Seed both users and posts tables

**Files**:
- `prisma/migrations/` (generated)
- `prisma/seed.ts`
- `package.json` (add seed script)

---

### PR-4: API Tests
**Branch**: `feat/api-tests`

Write Jest tests for API endpoints (TDD approach):
- Test GET `/api/posts` - returns all posts
- Test GET `/api/posts?userId=X` - returns filtered posts
- Test DELETE `/api/posts/[id]` - deletes a post
- Test error scenarios

**Files**:
- `__tests__/api/posts.test.ts`
- `jest.config.js`
- `jest.setup.ts`

---

### PR-5: API Implementation
**Branch**: `feat/api-implementation`

Implement API routes to make tests pass:
- `GET /api/posts` - list all posts with author info (includes user name/username)
- `GET /api/posts?userId=X` - filter by userId
- `DELETE /api/posts/[id]` - delete a post
- Error handling for both endpoints

**Files**:
- `src/app/api/posts/route.ts`
- `src/app/api/posts/[id]/route.ts`

---

## Frontend PRs

### PR-6: Frontend Tests
**Branch**: `feat/frontend-tests`

Write unit tests for the posts page using React Testing Library + MSW (TDD approach):
- Test posts listing renders correctly (with author info)
- Test delete button shows confirmation modal
- Test confirmation modal actions
- Test error states display correctly
- MSW handlers for mocking API responses

**Files**:
- `__tests__/pages/posts.test.tsx`
- `__tests__/components/` (if needed)
- `__tests__/mocks/handlers.ts` (MSW handlers)
- `__tests__/mocks/server.ts` (MSW server setup)

---

### PR-7: Frontend Page
**Branch**: `feat/frontend-page`

Implement the `/posts` page:
- Card-based layout for posts
- Delete button on each card
- Confirmation modal component
- Error display component
- Styling with dark greens, olives, khakis

**Files**:
- `src/app/posts/page.tsx`
- `src/components/PostCard.tsx`
- `src/components/ConfirmModal.tsx`
- `src/components/ErrorMessage.tsx`
- `src/styles/` or inline styles

---

### PR-8: Filter by User
**Branch**: `feat/filter-by-user`

Add userId filtering to the posts page:
- Dropdown or input to select/enter userId
- Filter posts based on selection
- Clear filter option

**Files**:
- `src/app/posts/page.tsx` (update)
- `src/components/UserFilter.tsx`

---

## Verification

After all PRs are merged:
1. Run `npm run dev` and verify `/posts` page loads
2. Verify posts display in cards with correct styling
3. Test delete flow with confirmation modal
4. Test userId filter functionality
5. Test error states by simulating API failures
6. Run full test suite: `npm test`
