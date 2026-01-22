App details

We would like to build a web app using TypeScript (TS) for the frontend and the backend. Because of that, we have decided that a technology like NextJS seems like a perfect match for our needs. It provides a lot of functionality for developers and is a “production-ready” framework.

The application we are trying to build allows users to list posts from an API and allows the users to filter the posts by the userId of whoever wrote the post. The users of the application you are building usually travel a lot and are in places with bad or unstable internet connections and because of that we want to add some features that allow users to have a better experience.

Step 1 - Setup

Create an application using NextJS and upload it to a public repository in GitHub. If you prefer a private repository you need to request the usernames of the evaluation team. Ensure a file named assumptions.md is placed at the project's root to detail all presumed factors during development.

Step 2 - Database

We will need to use a database for this project. We suggest using Prisma ORM with SQLite.

Create the necessary tables for a blog where several users can post several posts. You can use the data from these APIs to seed the tables <https://jsonplaceholder.typicode.com/users> <https://jsonplaceholder.typicode.com/posts>. The seeding script must be included in the solution.

Important: Please put the database connection details in the .env  file and push it to the repository. This is a bad practice but will make it easier for us to run the project locally

Step 3 - Posts listing

Create a /posts page that lists all the posts returned by the database. For the UI, use a list of “card” elements. You can see some examples at <https://tailwindcss.com/> (but you don’t need to use TailwindCSS if you don’t want to)

Step 4 - Post deletion

Each post can be deleted. Add a button to each card to allow the posts to be deleted. When you click the “Delete” button a modal or dialog should appear asking for confirmation.

Step 5 - Error handling

When the endpoint fails to retrieve the posts or it fails to delete an error should be shown to the user.
