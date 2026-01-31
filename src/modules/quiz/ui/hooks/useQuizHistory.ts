/**
 * useQuizHistory Hook
 * Fetches quiz history for a specific node
 */

import { useState, useEffect, useCallback } from 'react';
import type { QuizHistory, QuizHistoryItem } from '../../domain/entities/Quiz';
import { QuizHttpGateway } from '../../infrastructure/http/QuizHttpGateway';

interface UseQuizHistoryResult {
    history: QuizHistoryItem[];
    weaknessAnalysis?: {
        weakTopics: string[];
        topicErrorCounts: Record<string, number>;
        totalAttempts: number;
        totalWrong: number;
        recommendedFocus: string[];
    };
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const gateway = new QuizHttpGateway();

export function useQuizHistory(nodeId: string | null): UseQuizHistoryResult {
    const [history, setHistory] = useState<QuizHistoryItem[]>([]);
    const [weaknessAnalysis, setWeaknessAnalysis] = useState<UseQuizHistoryResult['weaknessAnalysis']>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!nodeId) {
            setHistory([]);
            setWeaknessAnalysis(undefined);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await gateway.getQuizHistory(nodeId);
            // Sort by date descending and take only completed attempts
            const completedAttempts = data.attempts
                .filter(a => a.status === 'completed')
                .sort((a, b) => {
                    const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
                    const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
                    return dateB - dateA;
                });

            setHistory(completedAttempts);
            setWeaknessAnalysis(data.weaknessAnalysis);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load history';
            setError(message);
            setHistory([]);
        } finally {
            setIsLoading(false);
        }
    }, [nodeId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        history,
        weaknessAnalysis,
        isLoading,
        error,
        refetch: fetchHistory
    };
}
