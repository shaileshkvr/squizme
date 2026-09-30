import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Send, BookOpen, Clock } from 'lucide-react';

export const QuizPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function initQuiz() {
      try {
        const quizRes = await fetch(`/api/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const quizData = await quizRes.json();
        setQuiz(quizData);

        const attemptRes = await fetch(`/api/attempts/start/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const attemptData = await attemptRes.json();
        setAttemptId(attemptData.attemptId);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initQuiz();
  }, [id, token]);

  if (loading || !quiz) {
    return (
      <div className="text-center py-16 text-brand-muted text-sm sm:text-base">
        Loading quiz session...
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const isLearningMode = quiz.settings?.mode === 'learning';
  const currentAnswer = answers[currentQ.id];
  const isChecked = checkedQuestions[currentQ.id];

  const handleSelectOption = (optId: string) => {
    if (isChecked && isLearningMode) return;
    if (currentQ.type === 'multiple_choice') {
      const existing = (currentAnswer as string[]) || [];
      const updated = existing.includes(optId) ? existing.filter((x) => x !== optId) : [...existing, optId];
      setAnswers({ ...answers, [currentQ.id]: updated });
    } else {
      setAnswers({ ...answers, [currentQ.id]: optId });
    }
  };

  const handleCheckAnswer = () => {
    setCheckedQuestions({ ...checkedQuestions, [currentQ.id]: true });
  };

  const handleSubmitQuiz = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    const formattedAnswers = Object.entries(answers).map(([questionId, submittedAnswer]) => ({
      questionId,
      submittedAnswer
    }));

    try {
      await fetch(`/api/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: formattedAnswers })
      });
      navigate(`/attempts/${attemptId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isCorrect = isChecked && (
    currentQ.type === 'multiple_choice'
      ? (currentQ.correctAnswers as string[]).every((a: string) => (currentAnswer as string[])?.includes(a))
      : (currentQ.correctAnswers as string[])[0] === currentAnswer
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-card p-4 sm:p-5 rounded-3xl border border-brand-border shadow-sm transition-colors">
        <div>
          <h2 className="font-bold text-base sm:text-lg text-brand-text line-clamp-1">{quiz.title}</h2>
          <span className="text-sm text-brand-muted">
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs sm:text-sm px-3.5 py-1 rounded-full bg-brand-elevated font-semibold text-brand-text border border-brand-border capitalize">
          {isLearningMode ? <BookOpen className="w-3.5 h-3.5 text-brand-ai" /> : <Clock className="w-3.5 h-3.5 text-brand-warning" />}
          {quiz.settings?.mode} Mode
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-brand-card p-6 sm:p-8 rounded-3xl border border-brand-border shadow-sm space-y-6 transition-colors">
        <h3 className="text-base sm:text-lg font-bold text-brand-text leading-relaxed">
          {currentQ.prompt}
        </h3>

        {/* Dynamic Question Option Interface */}
        {currentQ.type === 'short_answer' ? (
          <div>
            <input
              type="text"
              placeholder="Type your answer here..."
              value={(currentAnswer as string) || ''}
              disabled={isChecked && isLearningMode}
              onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
              className="w-full text-sm sm:text-base px-4 py-3 border border-brand-border bg-brand-card text-brand-text rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-ai transition"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {currentQ.options.map((opt: any) => {
              const isSelected = Array.isArray(currentAnswer)
                ? currentAnswer.includes(opt.id)
                : currentAnswer === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm sm:text-base transition-all duration-150 flex items-center justify-between cursor-pointer min-h-[52px] active:scale-[0.99] ${
                    isSelected
                      ? 'border-brand-primary bg-brand-elevated text-brand-text font-semibold shadow-sm'
                      : 'border-brand-border hover:border-brand-border-strong text-brand-secondary hover:bg-brand-elevated/40 bg-brand-card'
                  }`}
                >
                  <span className="leading-relaxed">{opt.text}</span>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-primary shrink-0 ml-3" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Learning Mode Instant Feedback */}
        {isLearningMode && (
          <div className="pt-2">
            {!isChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)}
                className="bg-brand-primary hover:bg-brand-hover text-brand-primary-text text-sm font-semibold px-6 py-2.5 rounded-full transition-all active:scale-95 disabled:opacity-40 cursor-pointer shadow-sm"
              >
                Check Answer
              </button>
            ) : (
              <div
                className={`p-4 sm:p-5 rounded-2xl text-sm space-y-2 border ${
                  isCorrect
                    ? 'bg-brand-card text-brand-text border-brand-success/40'
                    : 'bg-brand-card text-brand-text border-brand-error/40'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-base">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-brand-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-brand-error" />
                  )}
                  <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                </div>
                <p className="leading-relaxed text-brand-secondary">{currentQ.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-brand-secondary hover:text-brand-text disabled:opacity-30 cursor-pointer transition p-2"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {currentIndex < quiz.questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="flex items-center gap-1.5 text-sm sm:text-base font-semibold bg-brand-primary hover:bg-brand-hover text-brand-primary-text px-6 py-2.5 rounded-full transition-all duration-200 hover:shadow active:scale-95 cursor-pointer"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="flex items-center gap-1.5 text-sm sm:text-base font-semibold bg-brand-success hover:opacity-90 text-white px-7 py-2.5 rounded-full transition-all duration-200 hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
