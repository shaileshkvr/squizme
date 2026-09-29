import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, Search, Zap, Key, ShieldCheck, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Quiz Engineering</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Turn your notes and ideas into <span className="text-indigo-600">mastery-ready quizzes</span>.
        </h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Squizme is an AI-powered quiz builder designed to help students, developers, and researchers test their understanding with precision.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/quizzes/new"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition shadow-sm cursor-pointer"
          >
            <span>Create a Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm px-5 py-2.5 rounded-lg transition cursor-pointer"
          >
            <span>Sign In / Register</span>
          </Link>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Document Ingestion</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload PDF or DOCX files up to 20MB. Squizme parses raw lecture slides, syllabi, or textbook chapters to extract core concepts and formulate targeted questions.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Prompt & Search Grounding</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Provide any conceptual topic prompt. Toggle Google Search grounding to retrieve real-time facts, research citations, and up-to-date industry terminology.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Dual Learning Modes</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Practice in <strong>Learning Mode</strong> for instant rationale breakdowns, or challenge yourself in <strong>Exam Mode</strong> with countdown timers and final scorecard reviews.
          </p>
        </div>
      </section>

      {/* Bring Your Own Key Model */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-8 shadow-md space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Bring-Your-Own-Key (BYO-Key) Model</h2>
            <p className="text-xs text-indigo-200">Zero subscriptions. Complete ownership of your generation quota.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <span className="font-semibold text-indigo-300 text-sm block">1. Free Starter Tier</span>
            <p className="text-slate-300 leading-relaxed">
              Every registered user receives <strong>2 free host-funded quizzes</strong> (up to 10 questions each) without needing an API key.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <span className="font-semibold text-emerald-300 text-sm block">2. Unlimited Personal Key</span>
            <p className="text-slate-300 leading-relaxed">
              Connect your personal free Google Gemini API key from Google AI Studio to generate unlimited quizzes with up to 50 questions each.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>API keys are never stored on our servers—they are encrypted with AES-GCM and saved locally on your device.</span>
          </div>
          <p className="text-slate-400 pl-6 leading-relaxed">
            We collect zero data on you and your queries. Any prompt processing and logging performed by the Google Gemini model itself is governed under Google's independent AI terms and has nothing to do with us as a company.
          </p>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Engineering Philosophy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div>
            <strong className="block text-slate-800 mb-1">Modular Monolith</strong>
            Built in a strict TypeScript monorepo using Fastify 5, Drizzle ORM, and PostgreSQL 16 for type-safe persistence and high throughput.
          </div>
          <div>
            <strong className="block text-slate-800 mb-1">Structured Gemini Tool Calling</strong>
            Questions are generated via native Gemini Function Calling rather than loose markdown parsing, eliminating syntax corruptions.
          </div>
          <div>
            <strong className="block text-slate-800 mb-1">Strict Resource Limits</strong>
            Files are capped at 20MB per upload with in-memory parsing via `pdf-parse` and `mammoth` to prevent server exhaustion.
          </div>
          <div>
            <strong className="block text-slate-800 mb-1">Containerized Deployment</strong>
            Multi-stage Alpine Docker setup serving static assets and API routes in a single reproducible image.
          </div>
        </div>
      </section>
    </div>
  );
};
