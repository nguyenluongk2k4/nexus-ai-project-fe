import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  Brain,
  Target,
  Trophy,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { Progress } from '@/shared/components/ui/progress';
import { useQuiz } from '@/modules/quiz/ui/hooks/useQuiz';

// CSS for animations - Light theme with purple accents
const styles = `
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.2); }
    50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.35); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .quiz-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(139, 92, 246, 0.15);
    box-shadow: 0 4px 24px rgba(139, 92, 246, 0.08);
  }
  
  .option-btn {
    background: rgba(248, 250, 252, 0.9);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(148, 163, 184, 0.3);
    transition: all 0.3s ease;
  }
  
  .option-btn:hover:not(:disabled) {
    border-color: rgba(139, 92, 246, 0.5);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(99, 102, 241, 0.05));
    transform: translateX(4px);
  }
  
  .option-btn.selected {
    border-color: rgba(139, 92, 246, 0.7);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.08));
  }
  
  .option-btn.correct {
    border-color: rgba(34, 197, 94, 0.7);
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.08));
  }
  
  .option-btn.incorrect {
    border-color: rgba(239, 68, 68, 0.7);
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.08));
  }
  
  .gradient-btn {
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    transition: all 0.3s ease;
  }
  
  .gradient-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 40px rgba(139, 92, 246, 0.3);
  }
  
  .generating-animation {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .topic-badge {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(99, 102, 241, 0.12));
    border: 1px solid rgba(139, 92, 246, 0.25);
  }
  
  .weak-topic-badge {
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(239, 68, 68, 0.12));
    border: 1px solid rgba(251, 146, 60, 0.35);
  }
  
  .result-card {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(30px);
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
  }
`;


export function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const nodeId = searchParams.get('nodeId') || '';
  const nodeName = searchParams.get('nodeName') || 'Skill Assessment';
  const nodeDescription = searchParams.get('nodeDescription') || '';

  // Review mode detection
  const attemptIdParam = searchParams.get('attemptId');
  const isReviewMode = searchParams.get('review') === 'true' && !!attemptIdParam;

  const {
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
    startQuiz,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    completeQuiz,
    loadHistory,
    loadQuiz,
    reset
  } = useQuiz({
    nodeId,
    nodeName,
    nodeDescription,
    numQuestions: 5
  });

  // Load existing quiz if in review mode
  useEffect(() => {
    if (isReviewMode && attemptIdParam && !quiz) {
      loadQuiz(attemptIdParam);
    }
  }, [isReviewMode, attemptIdParam, quiz, loadQuiz]);

  // Load history on mount (for non-review mode)
  useEffect(() => {
    if (nodeId && !isReviewMode) {
      loadHistory();
    }
  }, [nodeId, loadHistory, isReviewMode]);

  // Inject styles
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const progress = quiz ? ((currentQuestionIndex + (answerResult ? 1 : 0)) / quiz.totalQuestions) * 100 : 0;
  const isLastQuestion = quiz ? currentQuestionIndex === quiz.questions.length - 1 : false;

  // ============ GENERATING STATE ============
  if (isGenerating) {
    return (
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100 p-8 overflow-auto flex items-center justify-center min-h-screen">
        <div className="quiz-card generating-animation rounded-3xl p-12 text-center max-w-md">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto">
              <Brain className="w-12 h-12 text-violet-600 animate-pulse" />
            </div>
            <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-amber-500 animate-bounce" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Đang tạo Quiz cá nhân hóa...
          </h2>
          <p className="text-slate-500 mb-6">
            AI đang phân tích điểm yếu và tạo câu hỏi phù hợp với bạn
          </p>

          {history?.weaknessAnalysis?.recommendedFocus && history.weaknessAnalysis.recommendedFocus.length > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-violet-50 border border-violet-100">
              <p className="text-sm text-slate-600 mb-2">Tập trung vào:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {history.weaknessAnalysis.recommendedFocus.map((topic, idx) => (
                  <span key={idx} className="weak-topic-badge px-3 py-1 rounded-full text-sm text-orange-600">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mt-8" />
        </div>
      </div>
    );
  }

  // ============ REVIEW MODE - Show completed quiz for review ============
  if (isReviewMode && quiz && quiz.status === 'completed') {
    return (
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100 p-8 overflow-auto min-h-screen">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-violet-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </button>

            <button
              onClick={() => {
                reset();
                navigate(`/quiz?nodeId=${nodeId}&nodeName=${encodeURIComponent(nodeName)}`);
              }}
              className="gradient-btn px-6 py-2.5 text-white rounded-xl font-semibold flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Làm lại với đề mới
            </button>
          </div>

          {/* Score Summary */}
          <div className="quiz-card rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">
                  Xem lại bài kiểm tra
                </h1>
                <p className="text-slate-500">{nodeName}</p>
              </div>
              <div className={`text-center px-6 py-3 rounded-xl ${(quiz.score || 0) >= 70 ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                <div className={`text-3xl font-bold ${(quiz.score || 0) >= 70 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                  {quiz.score?.toFixed(0)}%
                </div>
                <div className={`text-sm ${(quiz.score || 0) >= 70 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                  {quiz.correctCount}/{quiz.totalQuestions} câu đúng
                </div>
              </div>
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-4">
            {quiz.questions.map((question, qIdx) => (
              <div key={question.id} className="quiz-card rounded-2xl p-6">
                {/* Question Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${question.isCorrect ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                    {question.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-violet-600">Câu {qIdx + 1}</span>
                      {question.topicTag && (
                        <span className="topic-badge px-2 py-0.5 rounded text-xs text-violet-600">
                          {question.topicTag}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-800 font-medium">{question.content}</p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 ml-14">
                  {question.options.map((option, optIdx) => {
                    const isUserAnswer = question.userSelectedIndex === optIdx;
                    const isCorrectAnswer = question.correctOptionIndex === optIdx;

                    let optionClass = 'option-btn';
                    if (isCorrectAnswer) optionClass += ' correct';
                    else if (isUserAnswer && !question.isCorrect) optionClass += ' incorrect';

                    return (
                      <div
                        key={optIdx}
                        className={`${optionClass} rounded-xl p-3 flex items-center justify-between`}
                      >
                        <span className="text-slate-700">{option}</span>
                        <div className="flex items-center gap-2">
                          {isUserAnswer && (
                            <span className="text-xs px-2 py-1 rounded bg-slate-200 text-slate-600">
                              Bạn chọn
                            </span>
                          )}
                          {isCorrectAnswer && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="mt-4 ml-14 p-4 bg-violet-50 border border-violet-100 rounded-xl">
                    <p className="text-sm font-medium text-violet-700 mb-1">💡 Giải thích:</p>
                    <p className="text-sm text-slate-600">{question.explanation}</p>
                  </div>
                )}

                {/* Source Resource Suggestion */}
                {!question.isCorrect && question.sourceResourceTitle && (
                  <div className="mt-3 ml-14 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-700">
                      📚 Xem lại: <strong>{question.sourceResourceTitle}</strong>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Action */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                reset();
                navigate(`/quiz?nodeId=${nodeId}&nodeName=${encodeURIComponent(nodeName)}`);
              }}
              className="gradient-btn px-8 py-3 text-white rounded-xl font-semibold shadow-lg"
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Làm lại với đề mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ LOADING STATE for Review Mode ============
  if (isReviewMode && isLoading && !quiz) {
    return (
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100 p-8 overflow-auto flex items-center justify-center min-h-screen">
        <div className="quiz-card rounded-3xl p-12 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">
            Đang tải bài kiểm tra...
          </h2>
          <p className="text-slate-500">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  // ============ START SCREEN (only for non-review mode) ============
  if (!quiz && !quizResult && !isReviewMode) {
    return (
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100 p-8 overflow-auto min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          <div className="quiz-card rounded-3xl p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-violet-600" />
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Kiểm tra kiến thức
            </h1>
            <p className="text-xl text-violet-600 mb-4">{nodeName}</p>
            <p className="text-slate-500 mb-8">
              AI sẽ tạo quiz cá nhân hóa dựa trên lịch sử học tập của bạn
            </p>

            {/* Previous Attempts Info */}
            {history && history.attempts.length > 0 && (
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-8">
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-700">{history.attempts.length}</div>
                    <div className="text-slate-500">Lần thử</div>
                  </div>
                  <div className="h-10 w-px bg-violet-200" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {Math.round(history.attempts.filter(a => a.score && a.score >= 70).length / history.attempts.length * 100)}%
                    </div>
                    <div className="text-slate-500">Đạt</div>
                  </div>
                  {history.weaknessAnalysis && history.weaknessAnalysis.weakTopics.length > 0 && (
                    <>
                      <div className="h-10 w-px bg-violet-200" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">
                          {history.weaknessAnalysis.weakTopics.length}
                        </div>
                        <div className="text-slate-500">Điểm yếu</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Weak Topics */}
            {history?.weaknessAnalysis?.recommendedFocus && history.weaknessAnalysis.recommendedFocus.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Chủ đề cần cải thiện</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {history.weaknessAnalysis.recommendedFocus.map((topic, idx) => (
                    <span key={idx} className="weak-topic-badge px-3 py-1.5 rounded-full text-sm text-orange-600">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={startQuiz}
              disabled={isLoading || !nodeId}
              className="gradient-btn text-white py-4 px-10 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Bắt đầu Quiz
              </span>
            </button>

            {!nodeId && (
              <p className="text-sm text-red-500 mt-4">
                Vui lòng chọn một skill node để làm quiz
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============ RESULT SCREEN ============
  if (quizResult) {
    const percentage = quizResult.score;
    const isPassed = quizResult.passed;

    return (
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100 p-8 overflow-auto min-h-screen flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="result-card rounded-3xl p-12 text-center border border-violet-100">
            {/* Trophy or Target Icon */}
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isPassed
              ? 'bg-gradient-to-br from-emerald-100 to-green-100'
              : 'bg-gradient-to-br from-orange-100 to-amber-100'
              }`}>
              {isPassed ? (
                <Trophy className="w-12 h-12 text-emerald-600" />
              ) : (
                <TrendingUp className="w-12 h-12 text-orange-600" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {isPassed ? 'Xuất sắc!' : 'Tiếp tục cố gắng!'}
            </h1>
            <p className="text-slate-500 mb-8">
              {isPassed
                ? 'Bạn đã nắm vững kiến thức này'
                : 'Hãy ôn lại các chủ đề yếu và thử lại'}
            </p>

            {/* Score Display */}
            <div className="mb-8">
              <div className={`text-6xl font-bold ${isPassed ? 'text-emerald-600' : 'text-orange-500'}`}>
                {percentage.toFixed(0)}%
              </div>
              <div className="text-slate-500 mt-2">
                {quizResult.correctCount} / {quizResult.totalQuestions} câu đúng
              </div>
            </div>

            <div className="mb-8">
              <Progress
                value={percentage}
                className="h-3 bg-slate-200"
              />
            </div>

            {/* Topic Breakdown */}
            {quizResult.topicBreakdown && Object.keys(quizResult.topicBreakdown).length > 0 && (
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-6 mb-8 text-left">
                <h3 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-600" />
                  Phân tích theo chủ đề
                </h3>
                <div className="space-y-3">
                  {Object.entries(quizResult.topicBreakdown).map(([topic, stats]) => {
                    const topicPercent = (stats.correct / stats.total) * 100;
                    return (
                      <div key={topic} className="flex items-center gap-4">
                        <span className={`topic-badge px-3 py-1 rounded-full text-sm ${topicPercent >= 70 ? 'text-emerald-700' : 'text-orange-600'}`}>
                          {topic}
                        </span>
                        <div className="flex-1">
                          <Progress
                            value={topicPercent}
                            className="h-2 bg-slate-200"
                          />
                        </div>
                        <span className={`text-sm font-medium ${topicPercent >= 70 ? 'text-emerald-600' : 'text-orange-500'}`}>
                          {stats.correct}/{stats.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  reset();
                  startQuiz();
                }}
                className="gradient-btn flex items-center gap-2 text-white py-3 px-8 rounded-xl font-semibold"
              >
                <RotateCcw className="w-5 h-5" />
                Làm lại Quiz
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 px-8 rounded-xl font-semibold transition-colors"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ QUIZ IN PROGRESS ============
  return (
    <div className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100 p-8 overflow-auto min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-slate-800">{nodeName}</h1>
            {quiz?.config?.focusTopics && quiz.config.focusTopics.length > 0 && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="text-sm text-violet-600">Quiz cá nhân hóa</span>
              </div>
            )}
          </div>
          <p className="text-slate-500">Kiểm tra kiến thức của bạn</p>
        </div>

        {/* Progress Card */}
        <div className="quiz-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-slate-600">
              Câu hỏi {currentQuestionIndex + 1} / {quiz?.totalQuestions}
            </span>
            {currentQuestion?.topicTag && (
              <span className="topic-badge px-3 py-1 rounded-full text-sm text-violet-700">
                {currentQuestion.topicTag}
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2 bg-slate-200" />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="quiz-card rounded-2xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-8 leading-relaxed">
              {currentQuestion.content}
            </h2>

            {/* Options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const showResult = answerResult !== null;
                const isCorrect = showResult && index === answerResult.correctOptionIndex;
                const isWrong = showResult && isSelected && !answerResult.isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    disabled={showResult || isLoading}
                    className={`option-btn w-full text-left p-5 rounded-xl ${isCorrect ? 'correct' :
                      isWrong ? 'incorrect' :
                        isSelected ? 'selected' : ''
                      } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">{option}</span>
                      {isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                      {isWrong && <XCircle className="w-6 h-6 text-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback */}
        {answerResult && (
          <div className={`rounded-2xl p-6 mb-6 border ${answerResult.isCorrect
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200'
            }`}>
            <div className="flex items-start gap-4">
              {answerResult.isCorrect ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-7 h-7 text-red-500 flex-shrink-0" />
              )}
              <div>
                <h3 className={`font-semibold text-lg ${answerResult.isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                  {answerResult.isCorrect ? 'Chính xác!' : 'Chưa đúng'}
                </h3>
                {answerResult.explanation && (
                  <p className="text-slate-600 mt-2">{answerResult.explanation}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          {!answerResult ? (
            <button
              onClick={submitAnswer}
              disabled={selectedAnswer === null || isLoading}
              className={`flex items-center gap-2 py-3 px-8 rounded-xl font-semibold transition-all ${selectedAnswer === null || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'gradient-btn text-white'
                }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Xác nhận'
              )}
            </button>
          ) : (
            <button
              onClick={isLastQuestion ? completeQuiz : nextQuestion}
              disabled={isLoading}
              className="gradient-btn flex items-center gap-2 text-white py-3 px-8 rounded-xl font-semibold"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLastQuestion ? (
                <>
                  Xem kết quả
                  <Trophy className="w-5 h-5" />
                </>
              ) : (
                <>
                  Câu tiếp theo
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
