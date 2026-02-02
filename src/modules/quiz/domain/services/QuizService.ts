/**
 * Quiz Service - Domain service for quiz business logic
 */

import type { QuizGateway, GenerateQuizParams, SubmitAnswerParams } from '../ports/QuizGateway';
import type { QuizAttempt, SubmitAnswerResult, QuizResult, QuizHistory } from '../entities/Quiz';

export class QuizService {
    constructor(private gateway: QuizGateway) { }

    /**
     * Start a new quiz for a skill node
     */
    async startQuiz(params: GenerateQuizParams): Promise<{
        attemptId: string;
        status: string;
        message: string;
    }> {
        if (!params.nodeId || !params.nodeName) {
            throw new Error('Node ID and name are required');
        }
        return this.gateway.generateQuiz(params);
    }

    /**
     * Load quiz with questions
     */
    async loadQuiz(attemptId: string): Promise<QuizAttempt> {
        if (!attemptId) {
            throw new Error('Attempt ID is required');
        }
        return this.gateway.getQuiz(attemptId);
    }

    /**
     * Submit an answer and get feedback
     */
    async submitAnswer(params: SubmitAnswerParams): Promise<SubmitAnswerResult> {
        if (params.selectedIndex < 0 || params.selectedIndex > 3) {
            throw new Error('Invalid answer selection');
        }
        return this.gateway.submitAnswer(params);
    }

    /**
     * Complete quiz and get final results
     */
    async completeQuiz(attemptId: string): Promise<QuizResult> {
        return this.gateway.completeQuiz(attemptId);
    }

    /**
     * Get quiz history for learning insights
     */
    async getHistory(nodeId: string): Promise<QuizHistory> {
        return this.gateway.getQuizHistory(nodeId);
    }
}
