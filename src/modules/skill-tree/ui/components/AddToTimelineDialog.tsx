/**
 * Add To Timeline Dialog Component
 * Two modes: Manual selection and AI Auto-scheduling
 */

import { format } from "date-fns";
import { API_BASE_URL } from "@/config/api";
import { useState, useEffect } from 'react';
import { X, Calendar, Sparkles, Clock, Loader2, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';


interface Resource {
    id: string;
    title: string;
    resourceType: string;
    platform: string;
    estimatedDuration: number | null;
    nodeName: string;
}

interface ScheduleSuggestion {
    resourceId: string;
    resourceName: string;
    scheduledDate: string;
    scheduledTime: string;
    deadline: string;
    priority: string;
}

interface AddToTimelineDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddToTimelineDialog({ isOpen, onClose, onSuccess }: AddToTimelineDialogProps) {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);

    // Manual mode state
    const [selectedResourceId, setSelectedResourceId] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState('medium');

    // AI mode state
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState<ScheduleSuggestion[]>([]);
    const [aiParsed, setAiParsed] = useState<any>(null);
    const [aiError, setAiError] = useState('');

    const getToken = () => localStorage.getItem('token');

    const getHeaders = (): HeadersInit => {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    };

    // Load resources when dialog opens
    useEffect(() => {
        if (isOpen) {
            fetchResources();
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setScheduledDate(tomorrow.toISOString().split('T')[0]);

            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            setDeadline(nextWeek.toISOString().split('T')[0]);
        }
    }, [isOpen]);

    const fetchResources = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/timeline/resources`, {
                headers: getHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setResources(data);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    // Manual mode submit
    const handleManualSubmit = async () => {
        if (!selectedResourceId || !scheduledDate) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/timeline`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    resourceId: selectedResourceId,
                    scheduledDate,
                    deadline: deadline || undefined,
                    priority,
                }),
            });

            if (response.ok) {
                onSuccess();
                onClose();
                resetForm();
            } else {
                alert(t('mySkillTree.timeline.errors.add'));
            }
        } catch (error) {
            console.error('Error adding to timeline:', error);
            alert(t('mySkillTree.timeline.errors.connection'));
        } finally {
            setLoading(false);
        }
    };

    // AI mode - generate suggestions
    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;

        setLoading(true);
        setAiError('');
        setAiSuggestions([]);

        try {
            const response = await fetch(`${API_BASE_URL}/api/timeline/ai-schedule`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    prompt: aiPrompt,
                    weeksAhead: 4,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAiParsed(data.parsed);
                setAiSuggestions(data.suggestions);
            } else {
                setAiError(t('mySkillTree.timeline.errors.aiParse'));
            }
        } catch (error) {
            console.error('Error generating AI schedule:', error);
            setAiError(t('mySkillTree.timeline.errors.connection'));
        } finally {
            setLoading(false);
        }
    };

    // AI mode - confirm suggestions
    const handleAIConfirm = async () => {
        if (aiSuggestions.length === 0) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/timeline/ai-schedule/confirm`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(aiSuggestions),
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message || t('mySkillTree.timeline.success'));
                onSuccess();
                onClose();
                resetForm();
            } else {
                alert(t('mySkillTree.timeline.errors.aiConfirm'));
            }
        } catch (error) {
            console.error('Error confirming AI schedule:', error);
            alert(t('mySkillTree.timeline.errors.connection'));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedResourceId('');
        setScheduledDate('');
        setDeadline('');
        setPriority('medium');
        setAiPrompt('');
        setAiSuggestions([]);
        setAiParsed(null);
        setAiError('');
    };

    const formatDate = (dateStr: string) => {
        // Use current language for date formatting (vi or en)
        const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
        return new Date(dateStr).toLocaleDateString(locale, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">{t('mySkillTree.timeline.title')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'manual'
                                ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                                : 'text-muted-foreground hover:bg-gray-50'
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        {t('mySkillTree.timeline.manual')}
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`flex-1 py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'ai'
                                ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50'
                                : 'text-muted-foreground hover:bg-gray-50'
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        {t('mySkillTree.timeline.ai')}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {activeTab === 'manual' ? (
                        <div className="space-y-4">
                            {/* Resource Select */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {t('mySkillTree.timeline.selectResource')}
                                </label>
                                <select
                                    value={selectedResourceId}
                                    onChange={(e) => setSelectedResourceId(e.target.value)}
                                    className="w-full p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                >
                                    <option value="">{t('mySkillTree.timeline.selectPlaceholder')}</option>
                                    {resources.map((res) => (
                                        <option key={res.id} value={res.id}>
                                            {res.title} ({res.nodeName})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date pickers */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {t('mySkillTree.timeline.date')}
                                    </label>
                                    <input
                                        type="date"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="w-full p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {t('mySkillTree.timeline.deadline')}
                                    </label>
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {t('mySkillTree.timeline.priority')}
                                </label>
                                <div className="flex gap-3">
                                    {['low', 'medium', 'high'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPriority(p)}
                                            className={`flex-1 py-2 px-4 rounded-xl border-2 font-medium transition-all ${priority === p
                                                    ? p === 'high'
                                                        ? 'border-red-500 bg-red-50 text-red-700'
                                                        : p === 'medium'
                                                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                            : 'border-gray-400 bg-gray-50 text-gray-700'
                                                    : 'border-border hover:bg-gray-50'
                                                }`}
                                        >
                                            {p === 'high' ? t('mySkillTree.timeline.priorities.high') : p === 'medium' ? t('mySkillTree.timeline.priorities.medium') : t('mySkillTree.timeline.priorities.low')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* AI Prompt Input */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {t('mySkillTree.timeline.aiPromptLabel')}
                                </label>
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder={t('mySkillTree.timeline.aiPromptPlaceholder')}
                                    className="w-full p-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px] resize-none"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    {t('mySkillTree.timeline.aiHint')}
                                </p>
                            </div>

                            {/* Generate Button */}
                            {aiSuggestions.length === 0 && (
                                <button
                                    onClick={handleAIGenerate}
                                    disabled={loading || !aiPrompt.trim()}
                                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-teal-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {t('mySkillTree.timeline.analyzing')}
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            {t('mySkillTree.timeline.generate')}
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Error */}
                            {aiError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                                    <AlertCircle className="w-5 h-5" />
                                    {aiError}
                                </div>
                            )}

                            {/* AI Parsed Info */}
                            {aiParsed && (
                                <div className="p-4 bg-violet-50 rounded-xl">
                                    <h4 className="font-medium text-violet-900 mb-2 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        {t('mySkillTree.timeline.aiunderstood')}
                                    </h4>
                                    <div className="text-sm text-violet-700 space-y-1">
                                        <p>📅 {t('mySkillTree.timeline.days')}: {aiParsed.days_of_week?.map((d: number) =>
                                            ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'][d]
                                        ).join(', ')}</p>
                                        <p>🕐 {t('mySkillTree.timeline.time')}: {aiParsed.time_start}</p>
                                        <p>⏱️ {t('mySkillTree.timeline.duration')}: {aiParsed.duration_minutes} phút</p>
                                    </div>
                                </div>
                            )}

                            {/* Suggestions Preview */}
                            {aiSuggestions.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-medium text-foreground">
                                        {t('mySkillTree.timeline.suggestions')} ({aiSuggestions.length}):
                                    </h4>
                                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                                        {aiSuggestions.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center text-white font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm truncate">{item.resourceName}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(item.scheduledDate)} lúc {item.scheduledTime}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {t('mySkillTree.timeline.cancel')}
                    </button>

                    {activeTab === 'manual' ? (
                        <button
                            onClick={handleManualSubmit}
                            disabled={loading || !selectedResourceId || !scheduledDate}
                            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-teal-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {t('mySkillTree.timeline.add')}
                        </button>
                    ) : aiSuggestions.length > 0 ? (
                        <button
                            onClick={handleAIConfirm}
                            disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-teal-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {t('mySkillTree.timeline.confirm')}
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
