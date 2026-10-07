import React from 'react';
import { ShieldCheck, Lock, EyeOff, AlertTriangle, FileText, Database } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-brand-elevated text-brand-ai border border-brand-border">
          <ShieldCheck className="w-4 h-4 text-brand-ai" />
          <span>Zero-Data Privacy Commitment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-brand-text tracking-tight">
          Privacy Policy & Key Storage Standards
        </h1>
        <p className="text-sm sm:text-base text-brand-secondary leading-relaxed">
          Squizme is designed from the ground up as a privacy-first educational tool. We believe in total transparency regarding how your credentials and queries are processed.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: API Key Storage (Local Device Only) */}
        <section className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center gap-2.5 text-brand-ai">
            <Lock className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-brand-text">
              1. Groq API Keys: Saved Locally on Device (Never on Servers)
            </h2>
          </div>
          <p className="text-sm text-brand-secondary leading-relaxed">
            Your Groq API keys are <strong>never stored on our servers</strong>. When you configure your personal key, it is encrypted using client-side <strong>AES-256-GCM authenticated encryption</strong> and saved strictly within your browser's local device storage.
          </p>
          <ul className="text-sm text-brand-secondary list-disc list-inside space-y-1.5 pl-1 leading-relaxed">
            <li>Our backend databases never persist or log your personal Groq API key.</li>
            <li>When generating a quiz, your device passes the key over encrypted TLS solely in volatile memory to execute the request.</li>
            <li>You can erase your locally saved key at any time with a single click in settings.</li>
          </ul>
        </section>

        {/* Section 2: Zero User & Query Data Collection */}
        <section className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center gap-2.5 text-brand-ai">
            <EyeOff className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-brand-text">
              2. Zero User & Query Data Collection
            </h2>
          </div>
          <p className="text-sm text-brand-secondary leading-relaxed">
            We do <strong>not collect, profile, monitor, or sell any data</strong> regarding you or your quiz queries. We do not inspect your study topics, build advertising profiles, or monetize your query history.
          </p>
          <p className="text-sm text-brand-secondary leading-relaxed">
            Your account stores only the minimum credentials required to log you in (your email, name, and a one-way <strong>bcrypt</strong> hash of your password).
          </p>
        </section>

        {/* Section 3: Third-Party AI Model Disclaimer */}
        <section className="bg-brand-elevated border border-brand-warning/30 rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center gap-2.5 text-brand-warning">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-brand-text">
              3. Third-Party AI Model & Provider Disclaimer
            </h2>
          </div>
          <p className="text-sm text-brand-secondary leading-relaxed">
            While Squizme does not collect any data on your queries, please be aware that the <strong>AI inference provider (Groq)</strong> processes generation prompts and context according to Groq's own independent terms of service and AI privacy policies.
          </p>
          <p className="text-sm text-brand-text font-semibold leading-relaxed">
            Any data transmission, processing, or logging performed by Groq is governed entirely between you and Groq, and <strong>has nothing to do with us as a company</strong>.
          </p>
        </section>

        {/* Section 4: Document Ingestion & Ephemeral Handling */}
        <section className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center gap-2.5 text-brand-ai">
            <FileText className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-brand-text">
              4. Document Uploads & Temporary Policy
            </h2>
          </div>
          <p className="text-sm text-brand-secondary leading-relaxed">
            Direct document file uploads (PDF/DOCX) are currently paused while we integrate a dedicated privacy storage pipeline with automated timed deletion.
          </p>
          <p className="text-sm text-brand-secondary leading-relaxed">
            In the meantime, you can paste study notes or text directly into the topic prompt input to generate quizzes without file uploads.
          </p>
        </section>

        {/* Section 5: Cookies and Session Storage */}
        <section className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center gap-2.5 text-brand-ai">
            <Database className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-brand-text">
              5. Storage, Cookies & Tracking
            </h2>
          </div>
          <p className="text-sm text-brand-secondary leading-relaxed">
            We use your browser's <code>localStorage</code> strictly for functional session persistence (your JWT auth token and your locally encrypted Groq API key). We employ zero advertising tracking pixels, third-party analytics cookies, or behavioral trackers.
          </p>
        </section>
      </div>
    </div>
  );
};
