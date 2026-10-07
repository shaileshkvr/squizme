import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Play,
  PlusCircle,
  Sparkles,
  BookOpen,
  Clock,
  Calendar,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const res = await fetch("/api/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
            Your Quizzes
          </h1>
          <p className="text-sm sm:text-base text-brand-secondary mt-1">
            Author, manage, and retake AI-synthesized quizzes anytime.
          </p>
        </div>
        <Link
          to="/quizzes/new"
          className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-hover text-brand-primary-text font-semibold text-sm sm:text-base px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-200 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Quiz</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-brand-muted text-sm sm:text-base">
          Loading your quizzes...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 bg-brand-card border border-brand-border rounded-3xl p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-brand-elevated border border-brand-border flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-brand-ai" />
          </div>
          <h3 className="font-bold text-lg sm:text-xl text-brand-text mb-2">
            No quizzes generated yet
          </h3>
          <p className="text-sm sm:text-base text-brand-secondary max-w-md mx-auto mb-6">
            Upload a lecture document (PDF/DOCX) or enter any concept prompt to
            synthesize your first quiz.
          </p>
          <Link
            to="/quizzes/new"
            className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-hover text-brand-primary-text text-sm sm:text-base font-semibold px-6 py-3 rounded-full shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
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
              className="bg-brand-card border border-brand-border rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-brand-border-strong hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-brand-muted mb-3">
                  <span className="capitalize px-2.5 py-1 rounded-full bg-brand-elevated font-semibold text-brand-text border border-brand-border">
                    {quiz.sourceType}
                  </span>
                  <span className="flex items-center gap-1 text-brand-muted text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-brand-text text-base sm:text-lg mb-1.5 line-clamp-1">
                  {quiz.title}
                </h3>
                <p className="text-sm text-brand-secondary line-clamp-2 mb-5">
                  {quiz.description}
                </p>
              </div>

              <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                <span className="text-sm text-brand-secondary flex items-center gap-1.5 capitalize font-medium">
                  {quiz.settings?.mode === "exam" ? (
                    <Clock className="w-4 h-4 text-brand-warning" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-brand-ai" />
                  )}
                  {quiz.settings?.mode || "learning"}
                </span>
                <Link
                  to={`/quizzes/${quiz.id}/play`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand-ai hover:text-brand-text px-3 py-1.5 rounded-full hover:bg-brand-elevated transition-colors"
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
