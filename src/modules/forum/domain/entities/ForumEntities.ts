export interface ForumUser {
  id: string;
  name: string;
  avatar: string; // emoji or url
  role?: string;
  joinedAt?: Date;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  iconName: string; // Store icon name as string to avoid storing component in entity
  color: string; // tailwind classes
  postCount?: number;
}

export interface ForumPost {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  author: ForumUser;
  categoryId: string;
  categoryName?: string;
  categoryColor?: string;
  tags?: string[];
  stats: {
    views: number | string; // string for "2.5k" etc
    comments: number;
    likes: number;
  };
  createdAt: Date;
  updatedAt?: Date;
  isPinned?: boolean;
  isHot?: boolean;
}

export interface ForumComment {
  id: string;
  postId: number;
  author: ForumUser;
  content: string;
  likes: number;
  replies?: ForumComment[];
  createdAt: Date;
}

export interface ForumStats {
  totalPosts: number;
  totalMembers: number;
  onlineMembers: number;
}
