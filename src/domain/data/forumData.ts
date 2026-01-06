export interface ForumPost {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  category: string;
  categoryColor: string;
  excerpt: string;
  comments: number;
  views: string;
  timestamp: string;
}

export const FORUM_POSTS: ForumPost[] = [
  {
    id: 1,
    title: "Thảo luận về mô hình GPT-4 và ứng dụng trong thực tế",
    author: "Nguyễn Văn A",
    authorAvatar: "👨‍💻",
    category: "AI",
    categoryColor: "from-violet-500 to-purple-600",
    excerpt: "GPT-4 đã mang lại nhiều cải tiến đáng kể so với các phiên bản trước. Chúng ta hãy cùng thảo luận về các ứng dụng thực tế...",
    comments: 15,
    views: "2.5k",
    timestamp: "2 giờ trước"
  },
  {
    id: 2,
    title: "Hướng dẫn tối ưu React Performance với useMemo và useCallback",
    author: "Trần Thị B",
    authorAvatar: "👩‍💻",
    category: "Software",
    categoryColor: "from-blue-500 to-cyan-600",
    excerpt: "Trong bài viết này, tôi sẽ chia sẻ các kỹ thuật tối ưu performance cho React application bằng cách sử dụng hooks...",
    comments: 23,
    views: "3.2k",
    timestamp: "4 giờ trước"
  },
  {
    id: 3,
    title: "Phân tích dữ liệu lớn với Apache Spark và Python",
    author: "Lê Văn C",
    authorAvatar: "🧑‍💼",
    category: "Data Analysis",
    categoryColor: "from-orange-500 to-red-600",
    excerpt: "Apache Spark là framework mạnh mẽ cho xử lý dữ liệu lớn. Hãy cùng tìm hiểu cách tích hợp với Python...",
    comments: 12,
    views: "1.8k",
    timestamp: "5 giờ trước"
  },
  {
    id: 4,
    title: "Machine Learning Deployment Best Practices 2024",
    author: "Phạm Thị D",
    authorAvatar: "👨‍🔬",
    category: "AI",
    categoryColor: "from-violet-500 to-purple-600",
    excerpt: "Triển khai ML models vào production đòi hỏi nhiều kỹ thuật và best practices. Tôi muốn chia sẻ kinh nghiệm...",
    comments: 31,
    views: "4.1k",
    timestamp: "6 giờ trước"
  },
  {
    id: 5,
    title: "TypeScript 5.0 - Những tính năng mới đáng chú ý",
    author: "Hoàng Văn E",
    authorAvatar: "👨‍🎓",
    category: "Software",
    categoryColor: "from-blue-500 to-cyan-600",
    excerpt: "TypeScript 5.0 đã được release với nhiều cải tiến về performance và developer experience...",
    comments: 18,
    views: "2.9k",
    timestamp: "8 giờ trước"
  },
  {
    id: 6,
    title: "Data Visualization với D3.js và React",
    author: "Vũ Thị F",
    authorAvatar: "👩‍🎨",
    category: "Data Analysis",
    categoryColor: "from-orange-500 to-red-600",
    excerpt: "Tạo các biểu đồ tương tác đẹp mắt bằng D3.js trong React application của bạn...",
    comments: 9,
    views: "1.5k",
    timestamp: "1 ngày trước"
  },
  {
    id: 7,
    title: "Neural Networks từ cơ bản đến nâng cao",
    author: "Đặng Văn G",
    authorAvatar: "🧑‍🏫",
    category: "AI",
    categoryColor: "from-violet-500 to-purple-600",
    excerpt: "Cùng tìm hiểu chi tiết về cách neural networks hoạt động, từ perceptron đơn giản đến deep learning...",
    comments: 27,
    views: "5.3k",
    timestamp: "1 ngày trước"
  }
];

export const FORUM_CATEGORIES = [
  {
    id: 'ai',
    name: 'Trí tuệ Nhân tạo (AI)',
    color: 'from-violet-500 to-purple-600',
    description: 'Machine Learning, Deep Learning, NLP'
  },
  {
    id: 'software',
    name: 'Phát triển Phần mềm',
    color: 'from-blue-500 to-cyan-600',
    description: 'Web, Mobile, Desktop Development'
  },
  {
    id: 'data',
    name: 'Phân tích Dữ liệu',
    color: 'from-orange-500 to-red-600',
    description: 'Data Science, Analytics, Visualization'
  }
];
