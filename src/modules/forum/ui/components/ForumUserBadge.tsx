import React from 'react';
import { ForumRank } from '../../domain/entities/ForumEntities';
import { useTranslation } from 'react-i18next';

interface ForumUserBadgeProps {
    rank?: string | ForumRank;
    isAuthor?: boolean;
    className?: string;
}

const RANK_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    [ForumRank.EXPERT]: {
        bg: 'bg-orange-400',
        text: 'text-white',
        label: 'Expert'
    },
    [ForumRank.HOST]: {
        bg: 'bg-amber-500',
        text: 'text-white',
        label: 'Host'
    },
    [ForumRank.MODERATOR]: {
        bg: 'bg-emerald-500',
        text: 'text-white',
        label: 'Moderator'
    },
    [ForumRank.SENIOR]: {
        bg: 'bg-blue-600',
        text: 'text-white',
        label: 'Senior'
    },
    [ForumRank.MIDDLE]: {
        bg: 'bg-indigo-500',
        text: 'text-white',
        label: 'Middle'
    },
    [ForumRank.JUNIOR]: {
        bg: 'bg-cyan-500',
        text: 'text-white',
        label: 'Junior'
    },
    [ForumRank.MEMBER]: {
        bg: 'bg-slate-500',
        text: 'text-white',
        label: 'Member'
    },
};

export const ForumUserBadge: React.FC<ForumUserBadgeProps> = ({ rank, isAuthor, className = "" }) => {
    const { t } = useTranslation();

    if (!rank && !isAuthor) return null;

    let style;
    if (isAuthor) {
        style = {
            bg: 'bg-gradient-to-r from-pink-500 to-rose-600 shadow-pink-500/20',
            text: 'text-white',
            label: t('forum.badges.author', 'Tác giả')
        };
    } else {
        const key = rank as string;
        style = RANK_STYLES[key] || {
            bg: 'bg-slate-500',
            text: 'text-white',
            label: key
        };
    }

    return (
        <span className={`shiny-tag relative flex items-center justify-center ${style.bg} ${style.text} text-[12px] font-black px-3 py-0.5 rounded-lg uppercase tracking-tight border border-white/20 shadow-sm ${className}`}>
            <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                {style.label}
            </span>
        </span>
    );
};
