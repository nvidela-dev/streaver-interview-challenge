export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface PostWithAuthor extends Post {
  author: {
    name: string;
    username: string;
  };
}
