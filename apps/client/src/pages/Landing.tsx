import React from 'react';
import { Link } from 'react-router-dom';
import { LandingHero } from '../components/LandingHero';
import { FileText, Search, Zap, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
      {/* Hero Section */}
      <LandingHero />

      {/* Feature Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-ai-soft text-brand-ai-text border border-brand-border">
            <Sparkles className="w-3.5 h-3.5 text-brand-ai" />
            <span>Built for Deep Comprehension</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text">
            Everything you need for active recall
          </h2>
          <p className="text-sm sm:text-base text-brand-secondary">
            Move beyond passive reading. Transform static lecture notes into structured, challenging assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-brand-border-strong transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-elevated border border-brand-border flex items-center justify-center text-brand-ai">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-brand-text">Dense Document Ingestion</h3>
              <p className="text-sm text-brand-secondary leading-relaxed">
                Upload PDFs or DOCX files up to 20MB. Squizme parses complex materials in-memory, extracting key themes, edge-cases, and conceptual models.
              </p>
            </div>
            <div className="pt-5 text-xs text-brand-muted flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-brand-success" />
              In-memory buffer parsing (zero disk storage)
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-brand-border-strong transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-elevated border border-brand-border flex items-center justify-center text-brand-ai">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-brand-text">Real-Time Search Grounding</h3>
              <p className="text-sm text-brand-secondary leading-relaxed">
                Enter any conceptual prompt and enable Google Search grounding. Questions are fact-checked against real-time scientific citations and latest industry standards.
              </p>
            </div>
            <div className="pt-5 text-xs text-brand-muted flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-brand-success" />
              Live web verification via Gemini 2.5 Flash
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-brand-border-strong transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-elevated border border-brand-border flex items-center justify-center text-brand-ai">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-brand-text">Dual Execution Modes</h3>
              <p className="text-sm text-brand-secondary leading-relaxed">
                Practice in <strong>Learning Mode</strong> with instant rationale breakdowns after each question, or simulate proctored pressure in <strong>Exam Mode</strong> with strict countdown timers.
              </p>
            </div>
            <div className="pt-5 text-xs text-brand-muted flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-brand-success" />
              Comprehensive scorecard review on completion
            </div>
          </div>
        </div>
      </section>

      {/* BYO-Key & Privacy Section */}
      <section className="bg-brand-card border border-brand-border rounded-3xl p-7 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-brand-elevated rounded-2xl border border-brand-border text-brand-ai">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-text">
                Your Keys, Your Machine, Zero Data Collection
              </h3>
              <p className="text-xs sm:text-sm text-brand-secondary mt-0.5">
                Privacy-first architecture by design. No surveillance, no tracking cookies, no server-side keys.
              </p>
            </div>
          </div>
          <Link
            to="/privacy"
            className="text-xs sm:text-sm font-semibold text-brand-ai hover:underline shrink-0"
          >
            Read Privacy Statement →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <div className="bg-brand-elevated/70 border border-brand-border rounded-2xl p-5 space-y-2">
            <span className="font-bold text-brand-text text-base block">Client-Side Key Encryption</span>
            <p className="text-brand-secondary leading-relaxed">
              When you add a Google Gemini API key, it is encrypted locally on your browser with AES-256-GCM. Our servers never store or log your key.
            </p>
          </div>
          <div className="bg-brand-elevated/70 border border-brand-border rounded-2xl p-5 space-y-2">
            <span className="font-bold text-brand-text text-base block">Zero Subscription Lock-in</span>
            <p className="text-brand-secondary leading-relaxed">
              Google AI Studio provides generous free Gemini API keys without requiring a credit card. Enjoy unlimited quiz generations with up to 50 questions each.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="text-center py-10 sm:py-14 bg-brand-elevated border border-brand-border rounded-3xl space-y-5 px-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
          Ready to test your actual understanding?
        </h2>
        <p className="text-sm sm:text-base text-brand-secondary max-w-lg mx-auto">
          Start generating rigorous assessments from your lecture notes, study guides, or technical concepts today.
        </p>
        <div className="pt-2">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-hover text-brand-primary-text font-semibold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
