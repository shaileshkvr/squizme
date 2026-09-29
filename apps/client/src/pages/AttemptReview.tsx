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

  if (loading || !data) return <div className="text-center py-12 text-slate-500">Loading results...</div>;

  const { attempt, items } = data;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero Score Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm space-y-3">
        <Award className="w-12 h-12 text-indigo-600 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">Quiz Completed!</h1>
        <div className="text-4xl font-extrabold text-indigo-600">{Number(attempt.percentage).toFixed(0)}%</div>
        <p className="text-sm text-slate-600">
          You scored {attempt.scoreAwarded} out of {attempt.totalPoints} points.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
          <Link
            to={`/quizzes/${attempt.quizId}/play`}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            <RotateCcw className="w-4 h-4" /> Retake Quiz
          </Link>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Question Review</h2>
        {items.map((item: any, idx: number) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
              {item.isCorrect ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle className="w-4 h-4" /> Correct (+{item.pointsEarned} pts)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                  <XCircle className="w-4 h-4" /> Incorrect (0 pts)
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
              <strong className="block text-slate-700 mb-0.5">Submitted Answer:</strong>
              {Array.isArray(item.submittedAnswer) ? item.submittedAnswer.join(', ') : item.submittedAnswer || '(Blank)'}
            </div>
            <p className="text-xs text-slate-600">
              <strong className="text-slate-700">Explanation:</strong> {item.gradedFeedback}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
