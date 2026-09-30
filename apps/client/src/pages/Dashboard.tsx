import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, PlusCircle, Sparkles, BookOpen, Clock, Calendar } from 'lucide-react';

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
    <div className="space-y-7">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Your Quizzes</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
            Author, manage, and retake AI-synthesized quizzes anytime.
          </p>        
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Loading your quizzes...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-2">No quizzes generated yet</h3>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Upload a lecture document (PDF/DOCX) or enter any concept prompt to synthesize your first quiz.
          </p>
          <Link
            to="/quizzes/new"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm sm:text-base font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Quiz</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-teal-500/50 dark:hover:border-teal-500/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 mb-3">
                  <span className="capitalize px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                    {quiz.sourceType}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-1.5 line-clamp-1">
                  {quiz.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-5">
                  {quiz.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5 capitalize font-medium">
                  {quiz.settings?.mode === 'exam' ? (
                    <Clock className="w-4 h-4 text-amber-500" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  )}
                  {quiz.settings?.mode || 'learning'}
                </span>
                <Link
                  to={`/quizzes/${quiz.id}/play`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 px-3 py-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Take Quiz</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
