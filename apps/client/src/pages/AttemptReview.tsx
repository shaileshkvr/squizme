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
      <div className="text-center py-16 text-brand-muted text-sm sm:text-base">
        Loading scorecard results...
      </div>
    );
  }

  const { attempt, items } = data;
  const percentage = Number(attempt.percentage).toFixed(0);

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      {/* Hero Score Banner */}
      <div className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-10 text-center shadow-sm space-y-4 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-brand-elevated border border-brand-border flex items-center justify-center mx-auto text-brand-ai">
          <Award className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          Quiz Completed!
        </h1>

        <div className="text-5xl font-black text-brand-primary tracking-tight">
          {percentage}%
        </div>

        <p className="text-sm sm:text-base text-brand-secondary">
          You scored <strong className="text-brand-text">{attempt.scoreAwarded}</strong> out of{' '}
          <strong className="text-brand-text">{attempt.totalPoints}</strong> points.
        </p>

        <div className="pt-3 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 border border-brand-border rounded-full hover:bg-brand-elevated text-brand-text transition-all active:scale-95 shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            to={`/quizzes/${attempt.quizId}/play`}
            className="flex items-center gap-2 text-sm font-semibold px-6 py-2.5 bg-brand-primary hover:bg-brand-hover text-brand-primary-text rounded-full transition-all duration-200 hover:shadow-md active:scale-95 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </Link>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-brand-text">Detailed Question Breakdown</h2>
        {items.map((item: any, idx: number) => (
          <div
            key={item.id}
            className="bg-brand-card border border-brand-border rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-brand-muted">
                Question {idx + 1}
              </span>
              {item.isCorrect ? (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-success bg-brand-success/10 px-3 py-1 rounded-full border border-brand-success/30">
                  <CheckCircle className="w-4 h-4" /> Correct (+{item.pointsEarned} pts)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-error bg-brand-error/10 px-3 py-1 rounded-full border border-brand-error/30">
                  <XCircle className="w-4 h-4" /> Incorrect (0 pts)
                </span>
              )}
            </div>

            <div className="text-sm text-brand-text bg-brand-elevated/70 p-3.5 rounded-2xl border border-brand-border">
              <strong className="block text-brand-text mb-1">Submitted Answer:</strong>
              {Array.isArray(item.submittedAnswer)
                ? item.submittedAnswer.join(', ')
                : item.submittedAnswer || '(Blank)'}
            </div>

            <p className="text-sm text-brand-secondary leading-relaxed">
              <strong className="text-brand-text">Explanation:</strong> {item.gradedFeedback}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
