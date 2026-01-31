/**
 * Quiz Module Providers - Dependency Injection
 */

import { QuizHttpGateway } from './infrastructure/http/QuizHttpGateway';
import { QuizService } from './domain/services/QuizService';

// Create singleton instances
const quizGateway = new QuizHttpGateway();
const quizService = new QuizService(quizGateway);

// Export instances
export { quizGateway, quizService };

// Export types
export type { QuizGateway } from './domain/ports/QuizGateway';
export type { QuizService } from './domain/services/QuizService';
export * from './domain/entities/Quiz';
