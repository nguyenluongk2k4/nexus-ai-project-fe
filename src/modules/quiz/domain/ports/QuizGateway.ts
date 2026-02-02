/**
 * Quiz Gateway Port - Interface for quiz API operations
 */

import type {
    QuizAttempt,
    SubmitAnswerResult,
    QuizResult,
    QuizHistory
} from '../entities/Quiz';

export interface GenerateQuizParams {
    nodeId: string;
    nodeName: string;
    nodeDescription?: string;
    numQuestions?: number;
}

export interface SubmitAnswerParams {
    attemptId: string;
    questionId: string;
    selectedIndex: number;
    timeTakenSeconds?: number;
}

export interface QuizGateway {
    /**
     * Generate a new personalized quiz for a skill node
     */
    generateQuiz(params: GenerateQuizParams): Promise<{
        attemptId: string;
        status: string;
        totalQuestions?: number;
        message: string;
    }>;

    /**
     * Get quiz details with questions
     */
    getQuiz(attemptId: string): Promise<QuizAttempt>;

    /**
     * Submit an answer for a question
     */
    submitAnswer(params: SubmitAnswerParams): Promise<SubmitAnswerResult>;

    /**
     * Complete the quiz and get results
     */
    completeQuiz(attemptId: string): Promise<QuizResult>;

    /**
     * Get quiz history for a node
     */
    getQuizHistory(nodeId: string): Promise<QuizHistory>;
}
