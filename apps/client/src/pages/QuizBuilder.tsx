import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  AlertTriangle,
  Clock,
  BookOpen,
  Layers,
  Gauge,
  Plus,
  FileText,
} from "lucide-react";
import { getLocalApiKey } from "../utils/crypto";

export const QuizBuilderPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [showAddFileMenu, setShowAddFileMenu] = useState(false);
  const addFileRef = useRef<HTMLDivElement>(null);

  // Close add file popup on click outside, focus outside, or Escape
  useEffect(() => {
    if (!showAddFileMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        addFileRef.current &&
        !addFileRef.current.contains(e.target as Node)
      ) {
        setShowAddFileMenu(false);
      }
    };
    const handleFocusOutside = (e: FocusEvent) => {
      if (
        addFileRef.current &&
        !addFileRef.current.contains(e.target as Node)
      ) {
        setShowAddFileMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddFileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("focusin", handleFocusOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("focusin", handleFocusOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAddFileMenu]);

  const maxAllowedQuestions = user?.hasCustomKey ? 50 : 10;
  const [questionCount, setQuestionCount] = useState<number>(
    Math.max(5, Math.min(10, maxAllowedQuestions)),
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [depth, setDepth] = useState<"foundational" | "in_depth">(
    "foundational",
  );
  const [quizMode, setQuizMode] = useState<"learning" | "exam">("learning");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!prompt.trim()) {
      setError("Please enter a topic prompt or paste source material.");
      return;
    }

    setLoading(true);
    setLoadingStage("Connecting to Groq engine...");

    try {
      const localKey = await getLocalApiKey();
      const customHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      if (localKey) {
        customHeaders["x-groq-api-key"] = localKey;
        customHeaders["x-custom-api-key"] = localKey;
      }

      setLoadingStage("Structuring questions with Groq...");
      const res = await fetch("/api/generator/generate", {
        method: "POST",
        headers: customHeaders,
        body: JSON.stringify({
          prompt,
          questionCount,
          difficulty,
          depth,
          allowedTypes: ["single_choice", "true_false"],
          settings: {
            mode: quizMode,
            timeLimitMinutes,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Quiz generation failed.",
        );
      }

      navigate(`/quizzes/${data.id}/play`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          Create AI Quiz
        </h1>
        <p className="text-sm sm:text-base text-brand-secondary mt-1">
          Synthesize structured, pedagogical assessments with Groq{" "}
          <code className="text-xs px-1.5 py-0.5 rounded bg-brand-elevated border border-brand-border">
            openai/gpt-oss-120b
          </code>
          .
        </p>
      </div>

      <form
        onSubmit={handleGenerate}
        className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-7 transition-colors"
      >
        {/* Unified Prompt & Source Material Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-brand-text">
              Topic, Source Material & Question Instructions
            </label>
            <span className="text-xs text-brand-muted">
              Paste text or define curriculum
            </span>
          </div>

          <div className="relative bg-brand-elevated/40 border border-brand-border rounded-2xl p-3.5 focus-within:ring-2 focus-within:ring-brand-ai focus-within:border-brand-ai transition">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your quiz topic, paste study notes/source material, and specify how questions should be framed or which concepts to test..."
              className="w-full text-sm sm:text-base bg-transparent text-brand-text placeholder:text-brand-muted focus:outline-none resize-y min-h-[96px]"
            />

            {/* In-Input Toolbar with + Icon */}
            <div className="pt-2.5 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-2">
              <div className="relative" ref={addFileRef}>
                <button
                  type="button"
                  onClick={() => setShowAddFileMenu((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition cursor-pointer active:scale-95 ${
                    showAddFileMenu
                      ? "bg-brand-elevated text-brand-text border-brand-border-strong shadow-xs"
                      : "hover:bg-brand-elevated text-brand-secondary border-brand-border"
                  }`}
                  title="Attach source file"
                >
                  <Plus className="w-4 h-4 text-brand-ai" />
                  <span>Add file</span>
                </button>

                {showAddFileMenu && (
                  <div className="absolute left-0 mt-2 z-20 w-80 p-3.5 bg-brand-card border border-brand-border rounded-2xl shadow-xl space-y-2 animate-fade-in">
                    <button
                      type="button"
                      disabled
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-brand-border/60 bg-brand-elevated/50 opacity-60 cursor-not-allowed text-left"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-brand-text">
                        <FileText className="w-4 h-4 text-brand-muted" />
                        <span>Upload Document (PDF / DOCX)</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-warning/15 text-brand-warning border border-brand-warning/30">
                        Disabled
                      </span>
                    </button>
                    <p className="text-[11px] text-brand-muted leading-relaxed">
                      Document uploads are temporarily disabled. Cloudinary
                      privacy pipeline with automated timed deletion will be
                      available soon.
                    </p>
                  </div>
                )}
              </div>

              <div className="text-xs text-brand-muted">
                {prompt.trim().length > 0
                  ? `${prompt.trim().length} chars`
                  : "Topic or source required"}
              </div>
            </div>
          </div>
        </div>

        {/* Centered Question Count Slider Section */}
        <div className="p-5 sm:p-6 bg-brand-elevated border border-brand-border rounded-2xl space-y-4">
          <div className="flex flex-col items-center justify-center text-center space-y-1.5">
            <span className="text-xs uppercase tracking-wider font-bold text-brand-muted">
              Target Question Count
            </span>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-card border border-brand-border shadow-sm">
              <span className="text-2xl font-black text-brand-primary">
                {questionCount}
              </span>
              <span className="text-sm font-medium text-brand-secondary">
                questions
              </span>
            </div>
            {!user?.hasCustomKey && (
              <span className="text-xs text-brand-warning font-medium">
                Free quota cap: 10 questions per quiz (BYO Key unlocks up to 50)
              </span>
            )}
          </div>

          <div className="max-w-md mx-auto w-full px-2">
            <input
              type="range"
              min={5}
              max={maxAllowedQuestions}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 bg-brand-card rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <div className="flex justify-between text-xs text-brand-muted mt-1 font-medium">
              <span>5 min</span>
              <span>{maxAllowedQuestions} max</span>
            </div>
          </div>
        </div>

        {/* Configuration Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* Depth Selector */}
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-ai" />
              Question Depth
            </label>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value as any)}
              className="w-full text-sm px-3.5 py-2.5 border border-brand-border bg-brand-card text-brand-text rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-ai transition"
            >
              <option value="foundational">
                Foundational (High-level concepts & definitions)
              </option>
              <option value="in_depth">
                In-depth (Detailed mechanics & analytical problems)
              </option>
            </select>
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-1.5 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-brand-ai" />
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full text-sm px-3.5 py-2.5 border border-brand-border bg-brand-card text-brand-text rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-ai transition"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Quiz Execution Mode */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-brand-text mb-1.5">
              Quiz Evaluation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setQuizMode("learning")}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  quizMode === "learning"
                    ? "border-brand-primary bg-brand-elevated text-brand-text shadow-sm"
                    : "border-brand-border hover:border-brand-border-strong text-brand-secondary bg-brand-card"
                }`}
              >
                <BookOpen className="w-5 h-5 text-brand-ai shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-brand-text">
                    Learning Mode
                  </div>
                  <div className="text-xs text-brand-secondary mt-0.5">
                    Instant feedback and detailed per-option rationale revealed
                    after checking answers.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setQuizMode("exam")}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  quizMode === "exam"
                    ? "border-brand-primary bg-brand-elevated text-brand-text shadow-sm"
                    : "border-brand-border hover:border-brand-border-strong text-brand-secondary bg-brand-card"
                }`}
              >
                <Clock className="w-5 h-5 text-brand-warning shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-brand-text">
                    Exam Mode
                  </div>
                  <div className="text-xs text-brand-secondary mt-0.5">
                    Timed exam setting with locked hints until full submission
                    and final scorecard.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-brand-error/10 border border-brand-error/30 text-brand-error rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-primary hover:bg-brand-hover text-brand-primary-text font-semibold text-base py-3.5 rounded-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? (
            <span>{loadingStage}</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Quiz with Groq</span>
            </>
          )}
        </button>

        {/* Recommended Scope Policy Callout */}
        <div className="bg-brand-elevated border border-brand-border rounded-2xl p-4 sm:p-5 flex gap-3.5 text-brand-secondary text-sm leading-relaxed transition-colors">
          <AlertTriangle className="w-5 h-5 text-brand-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold block text-brand-text">
              Recommended Scope Policy
            </strong>
            <p className="text-brand-secondary text-sm">
              For best question quality and accuracy, keep your topic or source
              material scope specific (e.g.{" "}
              <em>"Photosynthesis light reactions"</em> rather than broad{" "}
              <em>"Biology"</em>). If you require questions across a broad
              curriculum, select <strong>"Foundational"</strong> depth so
              questions focus cleanly on surface principles rather than deep
              nested subtopics.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
