import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Award, RotateCcw, Home } from 'lucide-react';

export const AttemptReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScorecard() {
      try {
        const res = await fetch(`/api/attempts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const resData = await res.json();
        setData(resData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadScorecard();
  }, [id, token]);

  if (loading || !data) {
    return (
      <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm sm:text-base">
        Loading scorecard results...
      </div>
    );
  }

  const { attempt, items } = data;
  const percentage = Number(attempt.percentage).toFixed(0);

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      {/* Hero Score Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 text-center shadow-sm space-y-4 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Quiz Completed!
        </h1>

        <div className="text-5xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
          {percentage}%
        </div>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          You scored <strong className="text-slate-900 dark:text-white">{attempt.scoreAwarded}</strong> out of{' '}
          <strong className="text-slate-900 dark:text-white">{attempt.totalPoints}</strong> points.
        </p>

        <div className="pt-3 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all active:scale-95 shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            to={`/quizzes/${attempt.quizId}/play`}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all duration-200 hover:shadow-md active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </Link>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Detailed Question Breakdown</h2>
        {items.map((item: any, idx: number) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                Question {idx + 1}
              </span>
              {item.isCorrect ? (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="w-4 h-4" /> Correct (+{item.pointsEarned} pts)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-800">
                  <XCircle className="w-4 h-4" /> Incorrect (0 pts)
                </span>
              )}
            </div>

            <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <strong className="block text-slate-900 dark:text-white mb-1">Submitted Answer:</strong>
              {Array.isArray(item.submittedAnswer)
                ? item.submittedAnswer.join(', ')
                : item.submittedAnswer || '(Blank)'}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Explanation:</strong> {item.gradedFeedback}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
