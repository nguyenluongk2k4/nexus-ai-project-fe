import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { forumGateway } from '../../providers';
import { ForumCategory } from '../../domain/entities/ForumEntities';
import { useTranslation } from 'react-i18next';
import { apiConfig } from '@/shared/config/api.config';

export function CreatePost() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editPostId = searchParams.get('edit');
    const isEditMode = !!editPostId;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [categories, setCategories] = useState<ForumCategory[]>([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const cats = await forumGateway.getCategories();
                setCategories(cats);

                if (isEditMode && editPostId) {
                    const postData = await forumGateway.getPostDetails(editPostId);
                    if (postData) {
                        setTitle(postData.title);
                        setContent(postData.content || postData.excerpt);
                        setCategoryId(postData.categoryId);
                        setImages(postData.images || []);
                    } else {
                        setError(t('forum.create.form.errorNotFound', 'Post not found or unauthorized'));
                    }
                } else if (cats.length > 0) {
                    setCategoryId(cats[0].id);
                }
            } catch (err) {
                console.error('Failed to load data:', err);
                setError(t('forum.create.form.errorLoad', 'Failed to load initial data.'));
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [isEditMode, editPostId]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Validation for each file
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const validFiles = Array.from(files).filter(file => {
            if (!validTypes.includes(file.type)) {
                setError(`File ${file.name} is not a supported image format.`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB Limit
                setError(`File ${file.name} exceeds the 5MB size limit.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        try {
            setUploadingImages(true);
            setError('');
            const uploadedUrls: string[] = [];

            // We must upload them sequentially or in parallel. We'll do parallel for speed.
            const uploadPromises = validFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`${apiConfig.baseUrl}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
                const data = await response.json();
                return data.file_uri;
            });

            const results = await Promise.all(uploadPromises);
            setImages(prev => [...prev, ...results].slice(0, 10)); // max 10 images maybe
        } catch (err: any) {
            console.error('Image upload failed:', err);
            setError('Failed to upload image(s). Please try again.');
        } finally {
            setUploadingImages(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !categoryId) {
            setError(t('forum.create.form.error'));
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            const selectedCat = categories.find(c => c.id === categoryId);

            if (isEditMode && editPostId) {
                await forumGateway.updatePost(editPostId, {
                    title: title.trim(),
                    content: content.trim(),
                    categoryId,
                    images,
                });
            } else {
                await forumGateway.createPost({
                    title: title.trim(),
                    excerpt: content.trim().slice(0, 200),
                    content: content.trim(),
                    categoryId,
                    categoryName: selectedCat?.name,
                    images,
                    author: { id: '', name: '', avatar: '' }, // Handled by backend
                    isPinned: false,
                    isHot: false,
                });
            }

            // Navigate back to forum
            navigate('/forum');
        } catch (err: any) {
            console.error('Failed to create post:', err);
            setError(err.message || t('forum.create.genericError'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto min-h-screen relative">
            {/* Mesh Background */}
            <div
                className="fixed inset-0 -z-10"
                style={{
                    backgroundColor: '#f3f6ff',
                    backgroundImage: `
                        radial-gradient(at 10% 10%, hsla(256, 80%, 96%, 1) 0px, transparent 50%),
                        radial-gradient(at 90% 10%, hsla(220, 80%, 96%, 1) 0px, transparent 50%),
                        radial-gradient(at 50% 50%, hsla(280, 70%, 97%, 1) 0px, transparent 50%),
                        radial-gradient(at 10% 90%, hsla(240, 70%, 96%, 1) 0px, transparent 50%),
                        radial-gradient(at 90% 90%, hsla(200, 70%, 96%, 1) 0px, transparent 50%)
                    `,
                    backgroundAttachment: 'fixed'
                }}
            />

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2 font-medium">
                    <button
                        onClick={() => navigate('/forum')}
                        className="hover:text-violet-600 transition-colors flex items-center"
                    >
                        {t('forum.home')}
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <span className="text-slate-800">{t('forum.create.breadcrumb')}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 space-y-8">
                        {/* Glass Card */}
                        <div
                            className="rounded-3xl p-1 relative overflow-hidden shadow-lg"
                            style={{
                                background: 'rgba(255, 255, 255, 0.75)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            {/* Purple glow effect */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="bg-white/50 rounded-[1.3rem] p-6 sm:p-10 backdrop-blur-sm relative z-10">
                                {/* Page Title */}
                                <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-slate-900 tracking-tight flex items-center gap-4">
                                    <span className="p-3 bg-violet-100 text-violet-600 rounded-2xl shadow-sm">
                                        <Send className="w-6 h-6" />
                                    </span>
                                    {isEditMode ? t('forum.create.titleEdit', 'Edit Post') : t('forum.create.title')}
                                </h1>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-medium flex items-center gap-2 shadow-sm">
                                            ⚠️ {error}
                                        </div>
                                    )}

                                    {/* Category Select */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">{t('forum.create.form.category')}</label>
                                        <div className="relative">
                                            <select
                                                value={categoryId}
                                                onChange={(e) => setCategoryId(e.target.value)}
                                                className="appearance-none w-full p-4 bg-white/80 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 font-medium text-slate-700 cursor-pointer shadow-sm hover:bg-white transition-all"
                                            >
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none rotate-90" />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">{t('forum.create.form.title')}</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={t('forum.create.form.titlePlaceholder')}
                                            className="w-full p-4 bg-white/80 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 font-medium text-slate-900 placeholder:text-slate-400 shadow-sm hover:bg-white transition-all"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">{t('forum.create.form.content')}</label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder={t('forum.create.form.contentPlaceholder')}
                                            rows={8}
                                            className="w-full p-4 bg-white/80 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-300 font-medium text-slate-900 placeholder:text-slate-400 shadow-sm hover:bg-white transition-all resize-none leading-relaxed"
                                        />
                                    </div>

                                    {/* Images */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-slate-700">Images (Optional, Max 4 recommended)</label>

                                        {/* Image Previews */}
                                        {images.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                                {images.map((src, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm">
                                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-2 pointer-events-none">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                                                className="pointer-events-auto p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full h-fit transition-colors"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            multiple
                                            accept="image/png, image/jpeg, image/webp"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImages || images.length >= 10}
                                            className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-dashed border-slate-300 text-sm"
                                        >
                                            {uploadingImages ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                                            {uploadingImages ? 'Uploading...' : 'Attach Images'}
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-8 border-t border-slate-200/50 mt-8">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/forum')}
                                            className="w-full sm:w-auto px-6 py-3.5 text-slate-500 hover:text-slate-800 font-bold transition-colors"
                                        >
                                            {t('forum.create.form.cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting || !title.trim() || !content.trim()}
                                            className="w-full sm:w-auto px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                        >
                                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            {submitting ? t('forum.create.form.submitting') : t('forum.create.form.submit')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right column: Posting Rules */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-lg">
                            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                💡 Mẹo đăng bài
                            </h3>
                            <ul className="space-y-4 text-sm text-slate-600 font-medium">
                                <li className="flex gap-3">
                                    <span className="text-violet-500">•</span>
                                    <span>Nên đặt tiêu đề ngắn gọn súc tích, tóm tắt được nội dung chính.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-violet-500">•</span>
                                    <span>Viết Tiếng Việt có dấu, không sử dụng teencode.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-violet-500">•</span>
                                    <span>Chọn đúng danh mục để mọi người dễ dàng tìm thấy và thảo luận chéo.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-violet-500">•</span>
                                    <span>Hãy tôn trọng các thành viên khác để xây dựng cộng đồng văn minh.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
