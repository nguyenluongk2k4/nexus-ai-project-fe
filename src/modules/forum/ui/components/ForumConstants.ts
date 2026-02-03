import { ThumbsUp, Heart, Lightbulb } from 'lucide-react';

export const MOCK_TOP_MEMBERS = [
    { id: 1, name: 'User A', avatar: '👤', isOnline: true, isTopContributor: true },
    { id: 2, name: 'User B', avatar: '👤', isOnline: true, isTopContributor: false },
    { id: 3, name: 'User C', avatar: '👤', isOnline: true, isTopContributor: false },
    { id: 4, name: 'User D', avatar: '👤', isOnline: false, isTopContributor: false },
];

export const MOCK_HOT_TAGS = ['ReactJS', 'ChatGPT', 'Python', 'MachineLearning', 'Startup', 'CareerAdvice'];

export const MOCK_REACTIONS = [
    { icon: ThumbsUp, label: 'Helpful', count: 24, color: 'text-blue-600' },
    { icon: Heart, label: 'Love', count: 18, color: 'text-rose-600' },
    { icon: Lightbulb, label: 'Insightful', count: 12, color: 'text-amber-600' },
];
