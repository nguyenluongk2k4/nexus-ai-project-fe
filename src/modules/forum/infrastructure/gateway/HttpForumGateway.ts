import { ForumGateway } from '../../domain/ports/ForumGateway';
import { ForumPost, ForumCategory, ForumComment, ForumStats } from '../../domain/entities/ForumEntities';

const API_BASE = 'http://localhost:8000/api/forum';

// Response type interfaces matching backend
interface UserResponse {
    id: string | null;
    username: string;
    full_name: string | null;
    avatar: string | null;
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

// Mappers
function mapCategory(cat: CategoryResponse): ForumCategory {
    return {
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        iconName: cat.iconName || 'Bot',
        color: cat.color || 'from-gray-500 to-gray-600',
        postCount: cat.post_count,
    };
}

function mapPost(post: PostResponse): ForumPost {
    return {
        id: parseInt(post.id.split('-')[0], 16) || Math.floor(Math.random() * 10000), // Convert UUID to number for compatibility
        title: post.title,
        excerpt: post.excerpt,
        content: post.content || undefined,
        author: {
            id: post.author.id || '',
            name: post.author.full_name || post.author.username,
            avatar: post.author.avatar || '👤',
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
        postId: parseInt(comment.postId.split('-')[0], 16) || 0,
        parentId: comment.parentId || null,
        author: {
            id: comment.author.id || '',
            name: comment.author.full_name || comment.author.username,
            avatar: comment.author.avatar || '👤',
        },
        content: comment.content,
        likes: comment.likes,
        createdAt: new Date(comment.createdAt),
    };
}

export class HttpForumGateway implements ForumGateway {
    private postIdToUuid: Map<number, string> = new Map();

    async getStats(): Promise<ForumStats> {
        const response = await fetch(`${API_BASE}/stats`);
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
        const response = await fetch(`${API_BASE}/categories`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        const data: CategoryResponse[] = await response.json();
        return data.map(mapCategory);
    }

    async getCategoryById(id: string): Promise<ForumCategory | null> {
        try {
            const response = await fetch(`${API_BASE}/categories/${id}/posts`);
            if (!response.ok) {
                return null;
            }
            const data: CategoryPostsResponse = await response.json();
            return mapCategory(data.category);
        } catch {
            return null;
        }
    }

    async getLatestPosts(): Promise<ForumPost[]> {
        const response = await fetch(`${API_BASE}/posts?limit=10`);
        if (!response.ok) {
            throw new Error('Failed to fetch latest posts');
        }
        const data: PostResponse[] = await response.json();

        // Store UUID mapping for later use
        data.forEach((post) => {
            const numericId = parseInt(post.id.split('-')[0], 16) || 0;
            this.postIdToUuid.set(numericId, post.id);
        });

        return data.map(mapPost);
    }

    async getPostsByCategory(categoryId: string): Promise<ForumPost[]> {
        const response = await fetch(`${API_BASE}/categories/${categoryId}/posts`);
        if (!response.ok) {
            throw new Error('Failed to fetch posts by category');
        }
        const data: CategoryPostsResponse = await response.json();

        // Store UUID mapping
        data.posts.forEach((post) => {
            const numericId = parseInt(post.id.split('-')[0], 16) || 0;
            this.postIdToUuid.set(numericId, post.id);
        });

        return data.posts.map(mapPost);
    }

    async getPostDetails(postId: number): Promise<ForumPost | null> {
        try {
            // Try to find UUID from mapping, otherwise use the number as hex prefix
            const uuid = this.postIdToUuid.get(postId) || postId.toString(16);

            // Try fetching latest posts first to get proper UUID mapping
            if (!this.postIdToUuid.has(postId)) {
                await this.getLatestPosts();
            }

            const actualUuid = this.postIdToUuid.get(postId);
            if (!actualUuid) {
                console.warn(`No UUID mapping for post ID ${postId}`);
                return null;
            }

            // Include auth header so backend can check if user liked the post
            const headers: HeadersInit = {};
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/posts/${actualUuid}`, { headers });
            if (!response.ok) {
                return null;
            }
            const data: ThreadDetailsResponse = await response.json();
            return mapPost(data.post);
        } catch {
            return null;
        }
    }

    async getComments(postId: number): Promise<ForumComment[]> {
        try {
            const actualUuid = this.postIdToUuid.get(postId);
            if (!actualUuid) {
                return [];
            }

            // Include auth header for consistency
            const headers: HeadersInit = {};
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/posts/${actualUuid}`, { headers });
            if (!response.ok) {
                return [];
            }
            const data: ThreadDetailsResponse = await response.json();
            return data.comments.map(mapComment);
        } catch {
            return [];
        }
    }

    async createPost(post: Omit<ForumPost, 'id' | 'stats' | 'createdAt'>): Promise<ForumPost> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${API_BASE}/posts`, {
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

        // Store UUID mapping
        const numericId = parseInt(data.id.split('-')[0], 16) || 0;
        this.postIdToUuid.set(numericId, data.id);

        return mapPost(data);
    }

    async addComment(postId: number, content: string, parentId?: string): Promise<ForumComment> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        const actualUuid = this.postIdToUuid.get(postId);
        if (!actualUuid) {
            throw new Error('Post not found');
        }

        const response = await fetch(`${API_BASE}/posts/${actualUuid}/comments`, {
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

    async likePost(postId: number): Promise<{ liked: boolean; likeCount: number }> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        const actualUuid = this.postIdToUuid.get(postId);
        if (!actualUuid) {
            throw new Error('Post not found');
        }

        const response = await fetch(`${API_BASE}/posts/${actualUuid}/like`, {
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
}

