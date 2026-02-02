/**
 * useQuiz Hook - Quiz state management
 */

import { useState, useCallback, useRef } from 'react';
import { quizService } from '../../providers';
import type {
    QuizAttempt,
    QuizQuestion,
    QuizResult,
    SubmitAnswerResult,
    QuizHistory
} from '../../domain/entities/Quiz';

export interface UseQuizOptions {
    nodeId: string;
    nodeName: string;
    nodeDescription?: string;
    numQuestions?: number;
}

export interface UseQuizReturn {
    // State
    isLoading: boolean;
    isGenerating: boolean;
    error: string | null;
    quiz: QuizAttempt | null;
    currentQuestionIndex: number;
    currentQuestion: QuizQuestion | null;
    selectedAnswer: number | null;
    answerResult: SubmitAnswerResult | null;
    quizResult: QuizResult | null;
    history: QuizHistory | null;
    timeStarted: number | null;

    // Actions
    startQuiz: () => Promise<void>;
    loadQuiz: (attemptId: string) => Promise<void>;
    selectAnswer: (index: number) => void;
    submitAnswer: () => Promise<void>;
    nextQuestion: () => void;
    completeQuiz: () => Promise<void>;
    loadHistory: () => Promise<void>;
    reset: () => void;
}

export function useQuiz(options: UseQuizOptions): UseQuizReturn {
    const { nodeId, nodeName, nodeDescription, numQuestions = 5 } = options;

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quiz, setQuiz] = useState<QuizAttempt | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answerResult, setAnswerResult] = useState<SubmitAnswerResult | null>(null);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [history, setHistory] = useState<QuizHistory | null>(null);
    const [timeStarted, setTimeStarted] = useState<number | null>(null);

    // Ref for tracking answer time
    const questionStartTime = useRef<number>(Date.now());

    const currentQuestion = quiz?.questions[currentQuestionIndex] || null;

    const startQuiz = useCallback(async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const result = await quizService.startQuiz({
                nodeId,
                nodeName,
                nodeDescription,
                numQuestions
            });

            if (result.status === 'error') {
                throw new Error(result.message);
            }

            // Load the quiz after generation
            const quizData = await quizService.loadQuiz(result.attemptId);
            setQuiz(quizData);
            setCurrentQuestionIndex(0);
            setTimeStarted(Date.now());
            questionStartTime.current = Date.now();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start quiz');
        } finally {
            setIsGenerating(false);
        }
    }, [nodeId, nodeName, nodeDescription, numQuestions]);

    const loadQuiz = useCallback(async (attemptId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const quizData = await quizService.loadQuiz(attemptId);
            setQuiz(quizData);
            setTimeStarted(Date.now());
            questionStartTime.current = Date.now();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load quiz');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const selectAnswer = useCallback((index: number) => {
        if (answerResult) return; // Already answered
        setSelectedAnswer(index);
    }, [answerResult]);

    const submitAnswer = useCallback(async () => {
        if (!quiz || !currentQuestion || selectedAnswer === null) return;

        setIsLoading(true);

        try {
            const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);

            const result = await quizService.submitAnswer({
                attemptId: quiz.attemptId,
                questionId: currentQuestion.id,
                selectedIndex: selectedAnswer,
                timeTakenSeconds: timeTaken
            });

            setAnswerResult(result);

            // Update the question in quiz state
            setQuiz(prev => {
                if (!prev) return null;
                const updatedQuestions = [...prev.questions];
                updatedQuestions[currentQuestionIndex] = {
                    ...updatedQuestions[currentQuestionIndex],
                    correctOptionIndex: result.correctOptionIndex,
                    explanation: result.explanation,
                    userSelectedIndex: result.selectedIndex,
                    isCorrect: result.isCorrect
                };
                return { ...prev, questions: updatedQuestions };
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit answer');
        } finally {
            setIsLoading(false);
        }
    }, [quiz, currentQuestion, selectedAnswer, currentQuestionIndex]);

    const nextQuestion = useCallback(() => {
        if (!quiz) return;

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setAnswerResult(null);
            questionStartTime.current = Date.now();
        }
    }, [quiz, currentQuestionIndex]);

    const completeQuiz = useCallback(async () => {
        if (!quiz) return;

        setIsLoading(true);

        try {
            const result = await quizService.completeQuiz(quiz.attemptId);
            setQuizResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete quiz');
        } finally {
            setIsLoading(false);
        }
    }, [quiz]);

    const loadHistory = useCallback(async () => {
        setIsLoading(true);

        try {
            const historyData = await quizService.getHistory(nodeId);
            setHistory(historyData);
        } catch (err) {
            // Silently fail for history - not critical
            console.error('Failed to load history:', err);
        } finally {
            setIsLoading(false);
        }
    }, [nodeId]);

    const reset = useCallback(() => {
        setQuiz(null);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswerResult(null);
        setQuizResult(null);
        setError(null);
        setTimeStarted(null);
    }, []);

    return {
        isLoading,
        isGenerating,
        error,
        quiz,
        currentQuestionIndex,
        currentQuestion,
        selectedAnswer,
        answerResult,
        quizResult,
        history,
        timeStarted,
        startQuiz,
        loadQuiz,
        selectAnswer,
        submitAnswer,
        nextQuestion,
        completeQuiz,
        loadHistory,
        reset
    };
}
