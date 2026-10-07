import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "squizme_hero_question_state";

const QUESTION_DATA = {
  question: "How to survive Mircoslop?",
  options: [
    { id: 1, label: "A", text: "Switch to MAC" },
    { id: 2, label: "B", text: "Switch to Linux" },
    { id: 3, label: "C", text: "Debloat Windows" },
    { id: 4, label: "D", text: "Both 1 and 2" },
  ],
  correctId: 4,
  reason: {
    correct:
      "Spot on! Both macOS and Linux escape involuntary telemetry, baked-in ads, and mandatory online accounts.",
    partial: (
      <>
        Switching to either Mac or Linux is a valid way to survive Microslop, so{" "}
        <strong>Both 1 and 2</strong> is correct.
      </>
    ),
    incorrect:
      "Despite debloating, Windows tracks its users aggressively, it's best to switch to Mac or Linux.",
  },
};

export const LandingHero: React.FC = () => {
  const { user } = useAuth();

  const [selectedOption, setSelectedOption] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.selectedOption === "number"
          ? parsed.selectedOption
          : null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [submitted, setSubmitted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed.submitted);
      }
    } catch {
      // ignore
    }
    return false;
  });

  const [warning, setWarning] = useState<string | null>(null);

  const handleSelect = (id: number) => {
    if (submitted) return;
    setSelectedOption(id);
    if (warning) setWarning(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption === null) {
      setWarning("Please select an option before submitting.");
      return;
    }
    setSubmitted(true);
    setWarning(null);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ selectedOption, submitted: true }),
      );
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setWarning(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6 sm:py-10">
      {/* Left Column: Catchy Tagline & Value Proposition */}
      <div className="lg:col-span-7 space-y-6 text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-[#E3EEF1] dark:bg-[#1F343B] text-[#315765] dark:text-[#B9D8E1] border border-[#DDD1C2] dark:border-[#5A3E30]">
          <Sparkles className="w-4 h-4 text-[#416A7A] dark:text-[#79AFC2]" />
          <span>Active Recall Engine · Powered by Groq gpt-oss-120b</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#24150E] dark:text-[#F8F4EB] leading-[1.12]">
          Stop re-reading notes. <br />
          <span className="text-[#5A301D] dark:text-[#C28A69]">
            Start proving what you know.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#69594D] dark:text-[#CFC0B1] max-w-xl leading-relaxed">
          Upload dense lecture slides, PDFs, or enter any technical topic.
          Squizme synthesizes rigorous assessments with instant reason—testing
          deep comprehension instead of shallow trivia.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3.5 pt-2">
          <Link
            to={user ? "/quizzes/new" : "/auth?mode=register"}
            className="inline-flex items-center gap-2 bg-[#5A301D] hover:bg-[#472313] text-[#FFFDF8] dark:bg-[#C28A69] dark:hover:bg-[#D09A78] dark:text-[#1D0D00] font-semibold text-sm sm:text-base px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <span>{user ? "Create a Quiz" : "Get Started Free"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/privacy"
            className="inline-flex items-center gap-2 bg-[#FFFDF8] dark:bg-[#2A160B] hover:bg-[#F1EADF] dark:hover:bg-[#3B1E11] text-[#24150E] dark:text-[#F8F4EB] border border-[#DDD1C2] dark:border-[#5A3E30] font-semibold text-sm sm:text-base px-5 py-3 rounded-full transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-sm"
          >
            <Lock className="w-4 h-4 text-[#416A7A] dark:text-[#79AFC2]" />
            <span>Zero-Data Privacy</span>
          </Link>
        </div>

        {/* Feature Micro-Badges */}
        <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#847366] dark:text-[#A99584]">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#47705B] dark:text-[#82B99A]" />
            Client-Side Encrypted Keys
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <FileText className="w-4 h-4 text-[#416A7A] dark:text-[#79AFC2]" />
            20MB Single File Cap
          </span>
        </div>
      </div>

      {/* Right Column: Static, Grounded Interactive Assessment Card */}
      <div className="lg:col-span-5 flex justify-center">
        <div className="w-full max-w-md rounded-3xl bg-[#FFFDF8] dark:bg-[#2A160B] border border-[#DDD1C2] dark:border-[#5A3E30] p-6 sm:p-7 shadow-xl shadow-amber-950/5 dark:shadow-black/60 select-none relative">
          {/* Card Top Pill */}
          <div className="flex items-center justify-between pb-4 border-b border-[#DDD1C2] dark:border-[#5A3E30] mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#847366] dark:text-[#A99584]">
              Interactive Preview
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E3EEF1] dark:bg-[#1F343B] text-[#315765] dark:text-[#B9D8E1] border border-[#DDD1C2] dark:border-[#5A3E30]">
              Single Choice
            </span>
          </div>

          {/* Question Prompt */}
          <h3 className="text-base sm:text-lg font-bold text-[#24150E] dark:text-[#F8F4EB] leading-snug mb-4">
            {QUESTION_DATA.question}
          </h3>

          {/* 4 Interactive Radio Options */}
          <div className="space-y-2.5 mb-4">
            {QUESTION_DATA.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectOption = opt.id === QUESTION_DATA.correctId;

              let cardStyle =
                "border-[#DDD1C2] dark:border-[#5A3E30] bg-[#FFFDF8] dark:bg-[#2A160B] text-[#69594D] dark:text-[#CFC0B1]";
              let circleStyle = "border-[#DDD1C2] dark:border-[#5A3E30]";

              if (!submitted) {
                if (isSelected) {
                  cardStyle =
                    "border-[#5A301D] dark:border-[#C28A69] bg-[#F1EADF] dark:bg-[#3B1E11] text-[#24150E] dark:text-[#F8F4EB] shadow-sm";
                  circleStyle =
                    "border-[#5A301D] dark:border-[#C28A69] bg-[#5A301D] dark:bg-[#C28A69]";
                }
              } else {
                if (isCorrectOption) {
                  cardStyle =
                    "border-[#47705B] dark:border-[#82B99A] bg-[#E8F3ED] dark:bg-[#1C3326] text-[#24150E] dark:text-[#F8F4EB] shadow-sm";
                  circleStyle =
                    "border-[#47705B] dark:border-[#82B99A] bg-[#47705B] dark:bg-[#82B99A]";
                } else if (isSelected) {
                  if (opt.id === 1 || opt.id === 2) {
                    cardStyle =
                      "border-[#D2AE69] dark:border-[#96733B] bg-[#FDF6E2] dark:bg-[#2C2416] text-[#24150E] dark:text-[#F8F4EB]";
                    circleStyle =
                      "border-[#D2AE69] dark:border-[#96733B] bg-[#D2AE69] dark:bg-[#96733B]";
                  } else {
                    cardStyle =
                      "border-[#9A4D3F] dark:border-[#D98678] bg-[#FBECE9] dark:bg-[#341A16] text-[#24150E] dark:text-[#F8F4EB]";
                    circleStyle =
                      "border-[#9A4D3F] dark:border-[#D98678] bg-[#9A4D3F] dark:bg-[#D98678]";
                  }
                } else {
                  cardStyle =
                    "border-[#DDD1C2]/60 dark:border-[#5A3E30]/60 bg-[#FFFDF8]/60 dark:bg-[#2A160B]/60 text-[#847366] dark:text-[#A99584] opacity-70";
                }
              }

              const interactiveHover = !submitted
                ? "hover:scale-[1.015] hover:border-[#5A301D] dark:hover:border-[#C28A69] hover:shadow-md hover:shadow-amber-900/5 dark:hover:shadow-black/40 active:scale-[0.99] cursor-pointer"
                : "cursor-default";

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  disabled={submitted}
                  className={`w-full p-3 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between text-left transition-all duration-200 ${cardStyle} ${interactiveHover}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${circleStyle}`}
                    >
                      {isSelected && !submitted && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFFDF8] dark:bg-[#1D0D00]" />
                      )}
                      {submitted && isCorrectOption && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFFDF8] dark:bg-[#1D0D00]" />
                      )}
                    </div>
                    <span>{opt.text}</span>
                  </div>

                  {submitted && isCorrectOption && (
                    <span className="text-[11px] font-bold text-[#47705B] dark:text-[#82B99A] shrink-0 pl-2">
                      +1
                    </span>
                  )}
                  {submitted && isSelected && !isCorrectOption && (
                    <span
                      className={`text-[11px] font-bold shrink-0 pl-2 ${
                        opt.id === 1 || opt.id === 2
                          ? "text-[#96733B] dark:text-[#D2AE69]"
                          : "text-[#9A4D3F] dark:text-[#D98678]"
                      }`}
                    >
                      {opt.id === 1 || opt.id === 2 ? "Partial" : "Your answer"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Validation Warning */}
          {warning && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-[#FBECE9] dark:bg-[#341A16] border border-[#9A4D3F] dark:border-[#D98678] text-sm font-semibold text-[#7A362B] dark:text-[#E8A599] flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-[#9A4D3F] dark:text-[#D98678] shrink-0" />
              <span>{warning}</span>
            </div>
          )}

          {/* Submit Action or Completed State */}
          {!submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-[#5A301D] hover:bg-[#472313] text-[#FFFDF8] dark:bg-[#C28A69] dark:hover:bg-[#D09A78] dark:text-[#1D0D00] shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Submit Answer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-3 pt-1">
              {/* Reason Breakdown Box */}
              {(() => {
                const isCorrect = selectedOption === QUESTION_DATA.correctId;
                const isPartial = selectedOption === 1 || selectedOption === 2;

                let boxClass =
                  "bg-[#FBECE9] dark:bg-[#341A16] border-[#9A4D3F] dark:border-[#D98678] text-[#7A362B] dark:text-[#E8A599]";
                let IconComponent = AlertCircle;
                let iconClass = "text-[#9A4D3F] dark:text-[#D98678]";
                let reasonText: React.ReactNode =
                  QUESTION_DATA.reason.incorrect;
                let statusLabel = "Active recall reason";

                if (isCorrect) {
                  boxClass =
                    "bg-[#E8F3ED] dark:bg-[#1C3326] border-[#47705B] dark:border-[#82B99A] text-[#2D5340] dark:text-[#B1DEC4]";
                  IconComponent = CheckCircle2;
                  iconClass = "text-[#47705B] dark:text-[#82B99A]";
                  reasonText = QUESTION_DATA.reason.correct;
                  statusLabel = "Intuition verified";
                } else if (isPartial) {
                  boxClass =
                    "bg-[#FDF6E2] dark:bg-[#2C2416] border-[#D2AE69] dark:border-[#96733B] text-[#7A5B20] dark:text-[#E8D49E]";
                  IconComponent = AlertCircle;
                  iconClass = "text-[#96733B] dark:text-[#D2AE69]";
                  reasonText = QUESTION_DATA.reason.partial;
                  statusLabel = "Valid escape, but incomplete";
                }

                return (
                  <>
                    <div
                      className={`p-3.5 rounded-2xl border text-sm flex gap-2.5 transition-colors ${boxClass}`}
                    >
                      <IconComponent
                        className={`w-4 h-4 shrink-0 mt-0.5 ${iconClass}`}
                      />
                      <div className="leading-relaxed">
                        <strong>Reason: </strong>
                        {reasonText}
                      </div>
                    </div>

                    {/* Try Again Action */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#847366] dark:text-[#A99584]">
                        {statusLabel}
                      </span>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs font-semibold text-[#5A301D] dark:text-[#C28A69] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Try again</span>
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
