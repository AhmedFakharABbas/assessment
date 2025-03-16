export interface BlogPost {
    id: number;
    title: string;
    body: string;
    reactions: {
      likes: number;
      dislikes: number;
    };
    tags: string[];
    userId: number;
    views: number;
  }
  