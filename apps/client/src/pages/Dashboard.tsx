import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, PlusCircle, Sparkles, BookOpen } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const res = await fetch('/api/quizzes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQuizzes();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Quizzes</h1>
          <p className="text-sm text-slate-600">Create, manage, and take AI-generated quizzes.</p>
        </div>
        <Link
          to="/quizzes/new"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <PlusCircle className="w-4 h-4" /> Create New Quiz
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading your quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">No quizzes generated yet</h3>
          <p className="text-xs text-slate-500 mb-4">Upload a PDF or enter a topic prompt to generate your first quiz.</p>
          <Link
            to="/quizzes/new"
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="capitalize px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-600">{quiz.sourceType}</span>
                  <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">{quiz.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{quiz.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {quiz.settings?.mode || 'learning'}
                </span>
                <Link
                  to={`/quizzes/${quiz.id}/play`}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Play className="w-3.5 h-3.5" /> Take Quiz
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
