export enum ForumRank {
  MEMBER = 'Member',
  JUNIOR = 'Junior',
  MIDDLE = 'Middle',
  SENIOR = 'Senior',
  EXPERT = 'Expert',
  MODERATOR = 'Moderator',
  HOST = 'Host',
}

export interface ForumUser {
  id: string;
  name: string;
  avatar: string; // emoji or url
  rank?: ForumRank | string;
  points?: number;
  postCount?: number;
  joinedAt?: Date;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  iconName: string; // Store icon name as string to avoid storing component in entity
  icon?: string; // Optional custom icon URL
  color: string; // tailwind classes
  postCount?: number;
}

export interface ForumPost {
  id: string;
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
  isLiked?: boolean;  // Whether current user has liked this post
}

export interface ForumComment {
  id: string;
  postId: string;
  parentId?: string | null;  // For threaded replies
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
  topMembers?: ForumUser[];
}

export interface ThreadDetails {
  post: ForumPost | null;
  comments: ForumComment[];
}

export interface ContributorStats {
  userId: string;
  username: string;
  avatar: string | null;
  totalPoints: number;
  postsCount: number;
  commentsCount: number;
  likesReceived: number;
}
