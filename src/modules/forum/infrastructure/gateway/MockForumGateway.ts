import { ForumGateway } from '../../domain/ports/ForumGateway';
import { ForumPost, ForumCategory, ForumComment, ForumStats } from '../../domain/entities/ForumEntities';

const MOCK_POSTS: ForumPost[] = [
  {
    id: 1,
    title: "Thảo luận về mô hình GPT-4 và ứng dụng trong thực tế",
    excerpt: "GPT-4 đã mang lại nhiều cải tiến đáng kể so với các phiên bản trước. Chúng ta hãy cùng thảo luận về các ứng dụng thực tế...",
    author: {
      id: 'u1',
      name: "Nguyễn Văn A",
      avatar: "👨‍💻",
    },
    categoryId: 'ai',
    categoryName: "AI",
    categoryColor: "from-violet-500 to-purple-600",
    stats: {
      views: "2.5k",
      comments: 15,
      likes: 42,
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isPinned: true,
    isHot: true,
  },
  {
    id: 2,
    title: "Hướng dẫn tối ưu React Performance với useMemo và useCallback",
    excerpt: "Trong bài viết này, tôi sẽ chia sẻ các kỹ thuật tối ưu performance cho React application bằng cách sử dụng hooks...",
    author: {
      id: 'u2',
      name: "Trần Thị B",
      avatar: "👩‍💻",
    },
    categoryId: 'software',
    categoryName: "Software",
    categoryColor: "from-blue-500 to-cyan-600",
    stats: {
      views: "3.2k",
      comments: 23,
      likes: 56,
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: 3,
    title: "Phân tích dữ liệu lớn với Apache Spark và Python",
    excerpt: "Apache Spark là framework mạnh mẽ cho xử lý dữ liệu lớn. Hãy cùng tìm hiểu cách tích hợp với Python...",
    author: {
      id: 'u3',
      name: "Lê Văn C",
      avatar: "🧑‍💼",
    },
    categoryId: 'data',
    categoryName: "Data Analysis",
    categoryColor: "from-orange-500 to-red-600",
    stats: {
      views: "1.8k",
      comments: 12,
      likes: 28,
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: 4,
    title: "Machine Learning Deployment Best Practices 2024",
    excerpt: "Triển khai ML models vào production đòi hỏi nhiều kỹ thuật và best practices. Tôi muốn chia sẻ kinh nghiệm...",
    author: {
      id: 'u4',
      name: "Phạm Thị D",
      avatar: "👨‍🔬",
    },
    categoryId: 'ai',
    categoryName: "AI",
    categoryColor: "from-violet-500 to-purple-600",
    stats: {
      views: "4.1k",
      comments: 31,
      likes: 89,
    },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isHot: true,
  },
  {
    id: 5,
    title: "TypeScript 5.0 - Những tính năng mới đáng chú ý",
    excerpt: "TypeScript 5.0 đã được release với nhiều cải tiến về performance và developer experience...",
    author: {
      id: 'u5',
      name: "Hoàng Văn E",
      avatar: "👨‍🎓",
    },
    categoryId: 'software',
    categoryName: "Software",
    categoryColor: "from-blue-500 to-cyan-600",
    stats: {
      views: "2.9k",
      comments: 18,
      likes: 45,
    },
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
  },
  {
    id: 6,
    title: "Data Visualization với D3.js và React",
    excerpt: "Tạo các biểu đồ tương tác đẹp mắt bằng D3.js trong React application của bạn...",
    author: {
      id: 'u6',
      name: "Vũ Thị F",
      avatar: "👩‍🎨",
    },
    categoryId: 'data',
    categoryName: "Data Analysis",
    categoryColor: "from-orange-500 to-red-600",
    stats: {
      views: "1.5k",
      comments: 9,
      likes: 22,
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 7,
    title: "Neural Networks từ cơ bản đến nâng cao",
    excerpt: "Cùng tìm hiểu chi tiết về cách neural networks hoạt động, từ perceptron đơn giản đến deep learning...",
    author: {
      id: 'u7',
      name: "Đặng Văn G",
      avatar: "🧑‍🏫",
    },
    categoryId: 'ai',
    categoryName: "AI",
    categoryColor: "from-violet-500 to-purple-600",
    stats: {
      views: "5.3k",
      comments: 27,
      likes: 104,
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  }
];

const MOCK_CATEGORIES: ForumCategory[] = [
  {
    id: 'ai',
    name: 'Trí tuệ Nhân tạo (AI)',
    iconName: 'Bot',
    color: 'from-violet-500 to-purple-600',
    description: 'Machine Learning, Deep Learning, NLP',
    postCount: 156,
  },
  {
    id: 'software',
    name: 'Phát triển Phần mềm',
    iconName: 'Code',
    color: 'from-blue-500 to-cyan-600',
    description: 'Web, Mobile, Desktop Development',
    postCount: 243,
  },
  {
    id: 'data',
    name: 'Phân tích Dữ liệu',
    iconName: 'Database',
    color: 'from-orange-500 to-red-600',
    description: 'Data Science, Analytics, Visualization',
    postCount: 89,
  }
];

export class MockForumGateway implements ForumGateway {
  async getStats(): Promise<ForumStats> {
    return {
      totalPosts: 1234,
      totalMembers: 5678,
      onlineMembers: 142,
    };
  }

  async getCategories(): Promise<ForumCategory[]> {
    return MOCK_CATEGORIES;
  }

  async getCategoryById(id: string): Promise<ForumCategory | null> {
    return MOCK_CATEGORIES.find(c => c.id === id) || null;
  }

  async getLatestPosts(): Promise<ForumPost[]> {
    return MOCK_POSTS;
  }

  async getPostsByCategory(categoryId: string): Promise<ForumPost[]> {
    return MOCK_POSTS.filter((p) => p.categoryId === categoryId);
  }

  async getPostDetails(postId: number): Promise<ForumPost | null> {
    return MOCK_POSTS.find((p) => p.id === postId) || null;
  }

  async getComments(postId: number): Promise<ForumComment[]> {
    return []; // Mock comments if needed later
  }

  async createPost(post: Omit<ForumPost, 'id' | 'stats' | 'createdAt'>): Promise<ForumPost> {
    const newPost: ForumPost = {
      ...post,
      id: Math.floor(Math.random() * 10000),
      stats: { views: 0, comments: 0, likes: 0 },
      createdAt: new Date(),
    };
    // In a real mock, we might add to the array, but for now just return it
    return newPost;
  }

  async addComment(postId: number, content: string): Promise<ForumComment> {
    return {
      id: `c_${Date.now()}`,
      postId,
      author: { id: 'me', name: 'Me', avatar: '👤' },
      content,
      likes: 0,
      createdAt: new Date(),
    };
  }
}
