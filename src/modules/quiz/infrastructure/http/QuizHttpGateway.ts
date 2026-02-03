/**
 * Quiz HTTP Gateway - API implementation
 */

import type { QuizGateway, GenerateQuizParams, SubmitAnswerParams } from '../../domain/ports/QuizGateway';
import type { QuizAttempt, SubmitAnswerResult, QuizResult, QuizHistory, QuizQuestion } from '../../domain/entities/Quiz';
import { apiConfig } from '@/shared/config/api.config';

export class QuizHttpGateway implements QuizGateway {
    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    }

    async generateQuiz(params: GenerateQuizParams): Promise<{
        attemptId: string;
        status: string;
        totalQuestions?: number;
        message: string;
    }> {
        const response = await fetch(apiConfig.getHttpUrl('/quiz/generate'), {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                node_id: params.nodeId,
                node_name: params.nodeName,
                node_description: params.nodeDescription || '',
                num_questions: params.numQuestions || 5
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate quiz');
        }

        const data = await response.json();
        return {
            attemptId: data.attempt_id,
            status: data.status,
            totalQuestions: data.total_questions,
            message: data.message
        };
    }

    async getQuiz(attemptId: string): Promise<QuizAttempt> {
        const response = await fetch(apiConfig.getHttpUrl(`/quiz/${attemptId}`), {
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to load quiz');
        }

        const data = await response.json();

        // Map snake_case to camelCase, including review mode fields
        const questions: QuizQuestion[] = data.questions.map((q: any) => ({
            id: q.id,
            orderIndex: q.order_index,
            content: q.content,
            options: q.options,
            topicTag: q.topic_tag,
            // Review mode fields (only present for completed quizzes)
            correctOptionIndex: q.correct_option_index,
            explanation: q.explanation,
            userSelectedIndex: q.user_selected_index,
            isCorrect: q.is_correct,
            sourceResourceId: q.source_resource_id,
            sourceResourceTitle: q.source_resource_title
        }));

        return {
            attemptId: data.attempt_id,
            status: data.status,
            score: data.score,
            correctCount: data.correct_count,
            totalQuestions: data.total_questions,
            questions,
            config: data.config
        };
    }

    async submitAnswer(params: SubmitAnswerParams): Promise<SubmitAnswerResult> {
        const response = await fetch(apiConfig.getHttpUrl(`/quiz/${params.attemptId}/answer`), {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                question_id: params.questionId,
                selected_index: params.selectedIndex,
                time_taken_seconds: params.timeTakenSeconds
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to submit answer');
        }

        const data = await response.json();
        return {
            isCorrect: data.is_correct,
            correctOptionIndex: data.correct_option_index,
            explanation: data.explanation,
            selectedIndex: data.selected_index
        };
    }

    async completeQuiz(attemptId: string): Promise<QuizResult> {
        const response = await fetch(apiConfig.getHttpUrl(`/quiz/${attemptId}/complete`), {
            method: 'POST',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to complete quiz');
        }

        const data = await response.json();
        return {
            status: data.status,
            score: data.score,
            correctCount: data.correct_count,
            totalQuestions: data.total_questions,
            topicBreakdown: data.topic_breakdown,
            passed: data.passed
        };
    }

    async getQuizHistory(nodeId: string): Promise<QuizHistory> {
        const response = await fetch(apiConfig.getHttpUrl(`/quiz/history/${nodeId}`), {
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to load quiz history');
        }

        const data = await response.json();
        return {
            nodeId: data.node_id,
            attempts: data.attempts.map((a: any) => ({
                attemptId: a.attempt_id,
                status: a.status,
                score: a.score,
                totalQuestions: a.total_questions,
                startedAt: a.started_at,
                completedAt: a.completed_at
            })),
            weaknessAnalysis: data.weakness_analysis ? {
                weakTopics: data.weakness_analysis.weak_topics,
                topicErrorCounts: data.weakness_analysis.topic_error_counts,
                totalAttempts: data.weakness_analysis.total_attempts,
                totalWrong: data.weakness_analysis.total_wrong,
                recommendedFocus: data.weakness_analysis.recommended_focus
            } : undefined
        };
    }

    async getUserStats(): Promise<{
        totalQuizzesCompleted: number;
        totalQuizzesPassed: number;
        averageScore: number;
        weakTopics: string[];
        recommendedFocus: string[];
        recentNodeId?: string;
    }> {
        const response = await fetch(apiConfig.getHttpUrl('/quiz/user-stats'), {
            headers: this.getHeaders()
        });

        if (!response.ok) {
            // Return default stats if error
            return {
                totalQuizzesCompleted: 0,
                totalQuizzesPassed: 0,
                averageScore: 0,
                weakTopics: [],
                recommendedFocus: []
            };
        }

        const data = await response.json();
        return {
            totalQuizzesCompleted: data.total_quizzes_completed,
            totalQuizzesPassed: data.total_quizzes_passed,
            averageScore: data.average_score,
            weakTopics: data.weak_topics || [],
            recommendedFocus: data.recommended_focus || [],
            recentNodeId: data.recent_node_id
        };
    }
}
