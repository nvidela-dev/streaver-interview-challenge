# Assumptions

This document details all presumed factors during development.

## Technical Assumptions

1. **Database**: SQLite is sufficient for this demo application. The `.env` file is committed to the repository intentionally to simplify running the project locally (this is not a production best practice).

2. **API**: The API endpoints follow REST conventions. All data operations go through the Next.js API routes.

3. **Data Source**: Users and posts are seeded from static JSON files (`sample-user-list.json` and `sample-posts.json`) derived from the JSONPlaceholder API.

4. **Testing**:
   - Jest is used for both API and frontend tests
   - React Testing Library + MSW for frontend component tests
   - Tests follow a TDD approach where possible

## UI/UX Assumptions

1. **Single Page**: All functionality resides on the `/posts` page as specified.

2. **Post Cards**: Each card displays:
   - Post title
   - Post body (may be truncated for display)
   - Author name and username

3. **Delete Confirmation**: A modal dialog appears before deletion to prevent accidental data loss.

4. **Error States**: Error messages are displayed inline on the page rather than as system alerts.

5. **Color Scheme**: Dark greens, olives, and khakis as specified, creating an earthy aesthetic.

## Scope Assumptions

1. **No Authentication**: This demo does not include user authentication or authorization.

2. **No Pagination**: Posts are displayed in a single list (given the small seed dataset).

3. **No Create/Edit**: Only listing and deletion of posts is implemented per requirements.

4. **Offline Support**: Basic error handling for network failures; no service worker or offline-first implementation.
