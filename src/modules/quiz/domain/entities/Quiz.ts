/**
 * Quiz Domain Entities
 * TypeScript interfaces for quiz data structures
 */

export type QuizStatus = 'generating' | 'ready' | 'in_progress' | 'completed' | 'error';

export interface QuizQuestion {
    id: string;
    orderIndex: number;
    content: string;
    options: string[];
    topicTag?: string;
    // These are only available after answering or in review mode
    correctOptionIndex?: number;
    explanation?: string;
    userSelectedIndex?: number;
    isCorrect?: boolean;
    // Source resource for suggested learning
    sourceResourceId?: string;
    sourceResourceTitle?: string;
}

export interface QuizAttempt {
    attemptId: string;
    status: QuizStatus;
    score?: number;
    correctCount?: number;
    totalQuestions: number;
    questions: QuizQuestion[];
    config?: QuizConfig;
}

export interface QuizConfig {
    focusTopics?: string[];
    difficulty?: string;
    weaknessAnalysis?: {
        totalAttempts: number;
        totalWrong: number;
        topicErrorCounts: Record<string, number>;
    };
}

export interface SubmitAnswerResult {
    isCorrect: boolean;
    correctOptionIndex: number;
    explanation?: string;
    selectedIndex: number;
}

export interface QuizResult {
    status: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    topicBreakdown: Record<string, { correct: number; total: number }>;
    passed: boolean;
}

export interface WeaknessAnalysis {
    weakTopics: string[];
    topicErrorCounts: Record<string, number>;
    totalAttempts: number;
    totalWrong: number;
    recommendedFocus: string[];
}

export interface QuizHistoryItem {
    attemptId: string;
    status: QuizStatus;
    score?: number;
    totalQuestions: number;
    startedAt: string;
    completedAt?: string;
}

export interface QuizHistory {
    nodeId: string;
    attempts: QuizHistoryItem[];
    weaknessAnalysis?: WeaknessAnalysis;
}
