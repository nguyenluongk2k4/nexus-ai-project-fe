import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Send } from 'lucide-react';
import { forumGateway } from '../../providers';
import { ForumCategory } from '../../domain/entities/ForumEntities';
import { useTranslation } from 'react-i18next';

export function CreatePost() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await forumGateway.getCategories();
                setCategories(cats);
                if (cats.length > 0) {
                    setCategoryId(cats[0].id);
                }
            } catch (err) {
                console.error('Failed to load categories:', err);
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

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

            await forumGateway.createPost({
                title: title.trim(),
                excerpt: content.trim().slice(0, 200),
                content: content.trim(),
                categoryId,
                categoryName: selectedCat?.name,
                author: { id: '', name: '', avatar: '' },
                isPinned: false,
                isHot: false,
            });

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
        <div className="flex-1 overflow-auto bg-white">
            <div className="max-w-[800px] mx-auto p-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6 text-muted-foreground">
                    <button
                        onClick={() => navigate('/forum')}
                        className="hover:text-violet-600 transition-colors"
                    >
                        {t('forum.home')}
                    </button>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-foreground font-medium">{t('forum.create.breadcrumb')}</span>
                </div>

                {/* Page Title */}
                <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500">
                    {t('forum.create.title')}
                </h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Category Select */}
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('forum.create.form.category')}</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('forum.create.form.title')}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('forum.create.form.titlePlaceholder')}
                            className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('forum.create.form.content')}</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={t('forum.create.form.contentPlaceholder')}
                            rows={12}
                            className="w-full p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/forum')}
                            className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t('forum.create.form.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !title.trim() || !content.trim()}
                            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            {submitting ? t('forum.create.form.submitting') : t('forum.create.form.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
