import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Send } from 'lucide-react';

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

  if (loading || !quiz) return <div className="text-center py-12 text-slate-500">Loading quiz...</div>;

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Header Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="font-bold text-slate-900">{quiz.title}</h2>
          <span className="text-xs text-slate-500">Question {currentIndex + 1} of {quiz.questions.length}</span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-slate-100 font-medium text-slate-700 capitalize">
          {quiz.settings?.mode} Mode
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-semibold text-slate-900">{currentQ.prompt}</h3>

        {/* Dynamic Question Interface */}
        {currentQ.type === 'short_answer' ? (
          <div>
            <input
              type="text"
              placeholder="Type your answer here..."
              value={(currentAnswer as string) || ''}
              disabled={isChecked && isLearningMode}
              onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ) : (
          <div className="space-y-2">
            {currentQ.options.map((opt: any) => {
              const isSelected = Array.isArray(currentAnswer)
                ? currentAnswer.includes(opt.id)
                : currentAnswer === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-3.5 rounded-lg border text-sm transition flex items-center justify-between cursor-pointer ${
                    isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-medium' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{opt.text}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Learning Mode Instant Feedback */}
        {isLearningMode && (
          <div>
            {!isChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!currentAnswer}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                Check Answer
              </button>
            ) : (
              <div className={`p-4 rounded-lg text-xs space-y-1.5 ${isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
                <div className="flex items-center gap-1.5 font-bold">
                  {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                  <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                </div>
                <p>{currentQ.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {currentIndex < quiz.questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="flex items-center gap-1 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="flex items-center gap-1 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg cursor-pointer"
          >
            <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};
