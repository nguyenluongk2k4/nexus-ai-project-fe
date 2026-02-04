import { ForumGateway, LikeResult } from '../../domain/ports/ForumGateway';
import { ForumPost, ForumCategory, ForumComment, ForumStats, ThreadDetails, ForumUser, ContributorStats } from '../../domain/entities/ForumEntities';

import { apiConfig } from "@/shared/config/api.config";

const API_FORUM_URL = apiConfig.getHttpUrl('/forum');

// Response type interfaces matching backend
interface UserResponse {
    id: string | null;
    username: string;
    full_name: string | null;
    avatar: string | null;
    rank?: string;
    points?: number;
    post_count?: number;
}

interface CategoryResponse {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
    post_count: number;
    iconName: string | null;
    color: string | null;
}

interface PostResponse {
    id: string;
    title: string;
    excerpt: string;
    content: string | null;
    author: UserResponse;
    categoryId: string;
    categoryName: string | null;
    categoryColor: string | null;
    stats: {
        views: number;
        comments: number;
        likes: number;
    };
    createdAt: string;
    updatedAt: string | null;
    isPinned: boolean;
    isHot: boolean;
    isLiked: boolean;
}

interface CommentResponse {
    id: string;
    postId: string;
    parentId: string | null;
    author: UserResponse;
    content: string;
    likes: number;
    createdAt: string;
}

interface DashboardResponse {
    categories: CategoryResponse[];
    latestPosts: PostResponse[];
    stats: {
        totalPosts: number;
        totalMembers: number;
        onlineMembers: number;
    };
}

interface CategoryPostsResponse {
    category: CategoryResponse;
    posts: PostResponse[];
}

interface ThreadDetailsResponse {
    post: PostResponse;
    comments: CommentResponse[];
}

interface ContributorStatsResponse {
    userId: string;
    username: string;
    avatar: string | null;
    totalPoints: number;
    postsCount: number;
    commentsCount: number;
    likesReceived: number;
}

// Mappers
function mapCategory(cat: CategoryResponse): ForumCategory {
    return {
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        iconName: cat.iconName || 'Bot',
        icon: cat.icon || undefined,
        color: cat.color || 'from-gray-500 to-gray-600',
        postCount: cat.post_count,
    };
}

function mapPost(post: PostResponse): ForumPost {
    return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content || undefined,
        author: {
            id: post.author.id || '',
            name: post.author.full_name || post.author.username,
            avatar: post.author.avatar || '👤',
            rank: post.author.rank,
        },
        categoryId: post.categoryId,
        categoryName: post.categoryName || undefined,
        categoryColor: post.categoryColor || undefined,
        stats: {
            views: post.stats.views,
            comments: post.stats.comments,
            likes: post.stats.likes,
        },
        createdAt: new Date(post.createdAt),
        updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
        isPinned: post.isPinned,
        isHot: post.isHot,
        isLiked: post.isLiked || false,
    };
}

function mapComment(comment: CommentResponse): ForumComment {
    return {
        id: comment.id,
        postId: comment.postId,
        parentId: comment.parentId || null,
        author: {
            id: comment.author.id || '',
            name: comment.author.full_name || comment.author.username,
            avatar: comment.author.avatar || '👤',
            rank: comment.author.rank,
        },
        content: comment.content,
        likes: comment.likes,
        createdAt: new Date(comment.createdAt),
    };
}

export class HttpForumGateway implements ForumGateway {

    async getStats(): Promise<ForumStats> {
        const response = await fetch(`${API_FORUM_URL}/stats`);
        if (!response.ok) {
            throw new Error('Failed to fetch forum stats');
        }
        const data = await response.json();
        return {
            totalPosts: data.totalPosts,
            totalMembers: data.totalMembers,
            onlineMembers: data.onlineMembers,
        };
    }

    async getCategories(): Promise<ForumCategory[]> {
        const response = await fetch(`${API_FORUM_URL}/categories`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        const data: CategoryResponse[] = await response.json();
        return data.map(mapCategory);
    }

    async getCategoryById(id: string): Promise<ForumCategory | null> {
        try {
            const response = await fetch(`${API_FORUM_URL}/categories/${id}/posts`);
            if (!response.ok) {
                return null;
            }
            const data: CategoryPostsResponse = await response.json();
            return mapCategory(data.category);
        } catch {
            return null;
        }
    }

    async getDashboard(): Promise<{ stats: ForumStats; categories: ForumCategory[]; latestPosts: ForumPost[]; topMembers: ForumUser[] }> {
        const headers: HeadersInit = {};
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_FORUM_URL}/dashboard`, { headers });
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }

        const data: DashboardResponse & { topMembers: UserResponse[] } = await response.json();

        const topMembers = data.topMembers ? data.topMembers.map(u => ({
            id: u.id || '',
            name: u.full_name || u.username,
            avatar: u.avatar || '👤',
            rank: u.rank,
            points: u.points || 0,
            postCount: u.post_count || 0
        })) : [];

        return {
            categories: data.categories.map(mapCategory),
            latestPosts: data.latestPosts.map(mapPost),
            stats: {
                totalPosts: data.stats.totalPosts,
                totalMembers: data.stats.totalMembers,
                onlineMembers: data.stats.onlineMembers,
                topMembers
            },
            topMembers
        };
    }

    async getPostDetails(postId: string): Promise<ForumPost | null> {
        const data = await this._fetchThread(postId);
        return data ? mapPost(data.post) : null;
    }

    async getComments(postId: string): Promise<ForumComment[]> {
        const data = await this._fetchThread(postId);
        return data ? data.comments.map(mapComment) : [];
    }

    async getThreadDetails(postId: string): Promise<ThreadDetails> {
        const data = await this._fetchThread(postId);
        if (!data) return { post: null, comments: [] };

        const post = mapPost(data.post);
        const comments = data.comments.map(mapComment);

        return { post, comments };
    }

    private async _fetchThread(postId: string): Promise<ThreadDetailsResponse | null> {
        try {
            const headers: HeadersInit = {};
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_FORUM_URL}/posts/${postId}`, { headers });
            if (!response.ok) return null;

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch thread:', error);
            return null;
        }
    }

    async getLatestPosts(): Promise<ForumPost[]> {
        const headers: HeadersInit = {};
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_FORUM_URL}/posts?limit=10`, { headers });
        if (!response.ok) {
            throw new Error('Failed to fetch latest posts');
        }
        const data: PostResponse[] = await response.json();

        return data.map(mapPost);
    }

    async getPostsByCategory(categoryId: string): Promise<ForumPost[]> {
        const headers: HeadersInit = {};
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_FORUM_URL}/categories/${categoryId}/posts`, { headers });
        if (!response.ok) {
            throw new Error('Failed to fetch posts by category');
        }
        const data: CategoryPostsResponse = await response.json();

        return data.posts.map(mapPost);
    }

    async createPost(post: Omit<ForumPost, 'id' | 'stats' | 'createdAt'>): Promise<ForumPost> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_FORUM_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                categoryId: post.categoryId,
                title: post.title,
                content: post.content || post.excerpt,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to create post' }));
            throw new Error(error.detail || 'Failed to create post');
        }

        const data: PostResponse = await response.json();

        return mapPost(data);
    }

    async addComment(postId: string, content: string, parentId?: string): Promise<ForumComment> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_FORUM_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                content,
                parentId: parentId || null,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to add comment' }));
            throw new Error(error.detail || 'Failed to add comment');
        }

        const data: CommentResponse = await response.json();
        return mapComment(data);
    }

    async likePost(postId: string): Promise<LikeResult> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_FORUM_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Failed to like post' }));
            throw new Error(error.detail || 'Failed to like post');
        }

        const data = await response.json();
        return {
            liked: data.liked,
            likeCount: data.likeCount,
        };
    }

    async getTopContributors(limit: number = 10, month?: number, year?: number): Promise<ContributorStats[]> {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (month) params.append('month', month.toString());
        if (year) params.append('year', year.toString());

        const response = await fetch(`${API_FORUM_URL}/contributors/top?${params.toString()}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch top contributors:', response.status, errorText);
            throw new Error(`Failed to fetch top contributors: ${response.status}`);
        }

        const data: ContributorStatsResponse[] = await response.json();
        return data.map(contributor => ({
            userId: contributor.userId,
            username: contributor.username,
            avatar: contributor.avatar,
            totalPoints: contributor.totalPoints,
            postsCount: contributor.postsCount,
            commentsCount: contributor.commentsCount,
            likesReceived: contributor.likesReceived
        }));
    }
}

