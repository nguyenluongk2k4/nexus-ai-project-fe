import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ThumbsUp, MessageSquare, Share2, Bookmark, Clock } from 'lucide-react';

interface Comment {
  id: number;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

export function ThreadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const onNavigateToSubForum = () => {
    // Navigate back to the AI category as a default or use the actual category from threadData
    // For now, following the existing structure in SubForum where it defaults to 'ai'
    navigate('/forum/ai');
  };

  const [replyContent, setReplyContent] = useState('');
  const [comments] = useState<Comment[]>([
    {
      id: 1,
      author: "Trần Văn B",
      authorAvatar: "👨‍🔬",
      content: "Rất hữu ích! Tôi đã thử nghiệm GPT-4 API và thấy performance tốt hơn nhiều so với GPT-3.5. Đặc biệt là khả năng hiểu context và reasoning.",
      timestamp: "3 giờ trước",
      likes: 8
    },
    {
      id: 2,
      author: "Lê Thị C",
      authorAvatar: "👩‍💼",
      content: "Mình đang implement một chatbot sử dụng GPT-4 cho doanh nghiệp. Có bạn nào có kinh nghiệm về prompt engineering không? Mình muốn tối ưu chi phí API calls.",
      timestamp: "2 giờ trước",
      likes: 5
    },
    {
      id: 3,
      author: "Nguyễn Văn D",
      authorAvatar: "🧑‍💻",
      content: "Câu hỏi hay! Mình suggest các bạn nên:\n1. Cache responses cho các queries tương tự\n2. Sử dụng system prompts hiệu quả\n3. Giới hạn max_tokens hợp lý\n4. Implement retry logic với exponential backoff",
      timestamp: "1 giờ trước",
      likes: 12
    },
    {
      id: 4,
      author: "Phạm Thị E",
      authorAvatar: "👩‍🎓",
      content: "GPT-4 vision API cũng rất mạnh! Mình đã dùng để phân tích hình ảnh y tế và độ chính xác khá ấn tượng.",
      timestamp: "45 phút trước",
      likes: 6
    },
    {
      id: 5,
      author: "Hoàng Văn F",
      authorAvatar: "👨‍🏫",
      content: "Có ai thử function calling chưa? Mình thấy tính năng này rất useful cho việc integrate với external tools.",
      timestamp: "30 phút trước",
      likes: 4
    }
  ]);

  const threadData = {
    title: "Thảo luận về mô hình GPT-4 và ứng dụng trong thực tế",
    author: "Nguyễn Văn A",
    authorAvatar: "👨‍💻",
    category: "AI",
    categoryName: "Trí tuệ Nhân tạo",
    date: "29/10/2024 14:30",
    views: 2534,
    content: `
# GPT-4: Một bước đột phá trong công nghệ AI

Xin chào mọi người! 👋

Gần đây mình có cơ hội làm việc với GPT-4 API và muốn chia sẻ một số insights về mô hình này cũng như các ứng dụng thực tế mà mình đã triển khai.

## Điểm mạnh của GPT-4

**1. Reasoning và Logic tốt hơn**
- GPT-4 có khả năng suy luận logic phức tạp tốt hơn nhiều so với GPT-3.5
- Có thể handle các bài toán toán học và lập trình phức tạp
- Hiểu context dài hơn (128k tokens vs 4k-16k của GPT-3.5)

**2. Multimodal Capabilities**
- Có thể xử lý cả text và image
- Vision API cho phép phân tích hình ảnh, đọc text từ ảnh, mô tả scene
- Rất hữu ích cho các ứng dụng accessibility và education

**3. Better Following Instructions**
- Tuân thủ system prompts tốt hơn
- Ít hallucination hơn
- Consistent output format

## Các Use Cases mình đã implement

### 1. Chatbot hỗ trợ khách hàng
- Tích hợp với CRM system
- Function calling để query database
- Multi-turn conversations với context awareness

### 2. Code Review Assistant
- Phân tích code và suggest improvements
- Detect potential bugs và security issues
- Generate unit tests tự động

### 3. Content Generation
- Blog posts, product descriptions
- SEO optimization
- Multi-language support

## Challenges và Solutions

**Chi phí cao**
- Solution: Implement caching layer, optimize prompts
- Sử dụng GPT-3.5 cho simple tasks, GPT-4 cho complex ones

**Latency**
- Solution: Streaming responses, async processing
- Pre-compute common queries

**Rate Limits**
- Solution: Implement queue system, retry logic
- Request rate limit increase từ OpenAI

Mọi người có kinh nghiệm gì với GPT-4 không? Chia sẻ thêm nhé! 🚀
    `
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reply submitted:', replyContent);
    setReplyContent('');
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-accent/20">
      <div className="max-w-[900px] mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 text-muted-foreground">
          <button 
            onClick={() => navigate('/forum')}
            className="hover:text-violet-600 transition-colors"
          >
            Trang chủ
          </button>
          <ChevronRight className="w-4 h-4" />
          <button 
            onClick={onNavigateToSubForum}
            className="hover:text-violet-600 transition-colors"
          >
            {threadData.categoryName}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium truncate">{threadData.title}</span>
        </div>

        {/* Main Thread Post */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-border mb-6">
          {/* Thread Header */}
          <div className="mb-6 pb-6 border-b border-border">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-teal-100 flex items-center justify-center text-2xl flex-shrink-0">
                {threadData.authorAvatar}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{threadData.title}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{threadData.author}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{threadData.date}</span>
                  </div>
                  <span>•</span>
                  <span>{threadData.views.toLocaleString()} lượt xem</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600">
                {threadData.category}
              </span>
            </div>
          </div>

          {/* Thread Content */}
          <div className="prose prose-slate max-w-none mb-6">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {threadData.content}
            </div>
          </div>

          {/* Thread Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-border">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 hover:from-violet-100 hover:to-purple-100 transition-all font-medium">
              <ThumbsUp className="w-4 h-4" />
              <span>Thích (24)</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-all text-muted-foreground">
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-all text-muted-foreground">
              <Bookmark className="w-4 h-4" />
              <span>Lưu</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-600" />
            {comments.length} Bình luận
          </h2>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-teal-100 flex items-center justify-center text-xl flex-shrink-0">
                    {comment.authorAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{comment.author}</span>
                      <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-foreground mb-3 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-violet-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Form */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-border">
          <h3 className="text-lg font-bold mb-4">Viết bình luận</h3>
          <form onSubmit={handleSubmitReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Chia sẻ suy nghĩ của bạn..."
              className="w-full min-h-[120px] p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-4"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Hãy lịch sự và tôn trọng mọi người trong cộng đồng
              </p>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Gửi bình luận
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
