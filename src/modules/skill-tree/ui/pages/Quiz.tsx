import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Progress } from '../ui/progress';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: 'Which Python data structure is best suited for implementing a LIFO (Last In, First Out) structure?',
    options: ['List', 'Dictionary', 'Set', 'Tuple'],
    correctAnswer: 0,
    topic: 'Python Fundamentals'
  },
  {
    id: 2,
    question: 'What is the time complexity of searching for an element in a balanced binary search tree?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correctAnswer: 1,
    topic: 'Algorithms'
  },
  {
    id: 3,
    question: 'In machine learning, what is the primary purpose of a validation set?',
    options: [
      'To train the model',
      'To tune hyperparameters',
      'To test final performance',
      'To collect more data'
    ],
    correctAnswer: 1,
    topic: 'Machine Learning'
  }
];

export function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + (showFeedback ? 1 : 0)) / quizQuestions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setShowFeedback(true);
    if (selectedAnswer === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    return (
      <div className="flex-1 bg-gradient-to-br from-white via-violet-50/20 to-teal-50/20 p-8 overflow-auto flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl border border-border p-12 shadow-sm text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-teal-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-teal-600" />
            </div>
            <h1 className="text-foreground mb-4">Quiz Complete!</h1>
            <p className="text-muted-foreground mb-8">
              You scored {score} out of {quizQuestions.length} questions
            </p>
            <div className="mb-8">
              <div className="text-foreground mb-2">{percentage}% Accuracy</div>
              <Progress value={percentage} className="h-3" />
            </div>
            <button
              onClick={handleRestart}
              className="bg-gradient-to-r from-violet-600 to-teal-500 text-white py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-white via-violet-50/20 to-teal-50/20 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Knowledge Assessment</h1>
          <p className="text-muted-foreground">Test your understanding of key concepts</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
            <span className="text-violet-600">
              {question.topic}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl border border-border p-8 shadow-sm mb-6">
          <h2 className="text-foreground mb-8">{question.question}</h2>

          {/* Answer Options */}
          <div className="space-y-4">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showCorrect = showFeedback && isCorrect;
              const showIncorrect = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    showCorrect
                      ? 'border-teal-500 bg-teal-50'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50'
                      : isSelected
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-border hover:border-violet-300 hover:bg-violet-50/50'
                  } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{option}</span>
                    {showCorrect && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                    {showIncorrect && <XCircle className="w-5 h-5 text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback & Actions */}
        {showFeedback && (
          <div className={`rounded-xl border p-6 mb-6 ${
            selectedAnswer === question.correctAnswer
              ? 'bg-teal-50 border-teal-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {selectedAnswer === question.correctAnswer ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-teal-900 mb-1">Correct!</h3>
                    <p className="text-teal-700">
                      Well done. You're demonstrating strong understanding of this topic.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-red-900 mb-1">Incorrect</h3>
                    <p className="text-red-700">
                      The correct answer was: {question.options[question.correctAnswer]}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          {!showFeedback ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className={`flex items-center gap-2 py-3 px-8 rounded-lg transition-all ${
                selectedAnswer === null
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-teal-500 text-white hover:opacity-90'
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-teal-500 text-white py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
            >
              {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'View Results'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
