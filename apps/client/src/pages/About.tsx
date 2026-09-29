import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, Search, Zap, Key, ShieldCheck, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
          <Sparkles className="w-4 h-4" />
          <span>Intelligent Quiz Engineering</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Turn your notes and ideas into <span className="text-teal-600 dark:text-teal-400">mastery-ready quizzes</span>.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Squizme is a privacy-first AI quiz builder designed to help students, developers, and researchers test their understanding with structured precision.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link
            to="/quizzes/new"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 shadow-sm cursor-pointer"
          >
            <span>Create a Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-sm sm:text-base px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <span>Sign In / Register</span>
          </Link>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors hover:border-teal-500/50 dark:hover:border-teal-500/50 hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">Document Ingestion</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Upload PDF or DOCX files up to 20MB. Squizme parses raw lecture slides, syllabi, or textbook chapters to extract core concepts and formulate targeted questions.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">Prompt & Search Grounding</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Provide any conceptual topic prompt. Toggle Google Search grounding to retrieve real-time facts, research citations, and up-to-date industry terminology.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors hover:border-teal-500/50 dark:hover:border-teal-500/50 hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">Dual Learning Modes</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Practice in <strong>Learning Mode</strong> for instant rationale breakdowns, or challenge yourself in <strong>Exam Mode</strong> with countdown timers and final scorecard reviews.
          </p>
        </div>
      </section>

      {/* Bring Your Own Key Model */}
      <section className="bg-slate-900 dark:bg-slate-900/90 text-white rounded-2xl p-7 sm:p-10 border border-slate-800 shadow-md space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-teal-500/20 rounded-xl border border-teal-400/30 text-teal-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Bring-Your-Own-Key (BYO-Key) Model</h2>
            <p className="text-sm text-teal-200/80 mt-0.5">Zero subscription fees. Complete control over your quiz generation capacity.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-2">
            <span className="font-semibold text-teal-300 text-base block">1. Free Starter Tier</span>
            <p className="text-slate-300 leading-relaxed">
              Every registered user receives <strong>2 free host-funded quizzes</strong> (up to 10 questions each) without needing an API key.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-2">
            <span className="font-semibold text-emerald-300 text-base block">2. Unlimited Personal Key</span>
            <p className="text-slate-300 leading-relaxed">
              Connect your personal free Google Gemini API key from Google AI Studio to generate unlimited quizzes with up to 50 questions each.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-3 border-t border-white/10 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-emerald-300">
              API keys are never stored on our servers—they are encrypted with AES-256-GCM and saved locally on your device.
            </span>
          </div>
          <p className="text-slate-400 pl-7 leading-relaxed">
            We collect zero data on you and your queries. Any prompt processing and logging performed by the Google Gemini model itself is governed under Google's independent AI terms and has nothing to do with us as a company.
          </p>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 sm:p-8 shadow-sm space-y-5 transition-colors">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Engineering Philosophy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-600 dark:text-slate-300">
          <div className="space-y-1">
            <strong className="block text-slate-900 dark:text-white font-semibold">Modular Monolith</strong>
            <p className="leading-relaxed">Built in a strict TypeScript monorepo using Fastify 5, Drizzle ORM, and PostgreSQL 16 for type-safe persistence and high throughput.</p>
          </div>
          <div className="space-y-1">
            <strong className="block text-slate-900 dark:text-white font-semibold">Structured Gemini Tool Calling</strong>
            <p className="leading-relaxed">Questions are synthesized via native Gemini function calling rather than markdown parsing, eliminating schema hallucinations.</p>
          </div>
          <div className="space-y-1">
            <strong className="block text-slate-900 dark:text-white font-semibold">Strict Resource Guardrails</strong>
            <p className="leading-relaxed">Documents are capped at 20MB per upload with in-memory parsing via `pdf-parse` and `mammoth` to prevent server memory bloat.</p>
          </div>
          <div className="space-y-1">
            <strong className="block text-slate-900 dark:text-white font-semibold">Containerized Deployment</strong>
            <p className="leading-relaxed">Multi-stage Alpine Docker setup serving static assets and API routes in a single reproducible image.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
