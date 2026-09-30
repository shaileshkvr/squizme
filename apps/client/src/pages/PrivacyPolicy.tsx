import React from 'react';
import { ShieldCheck, Lock, FileText, Database, EyeOff, AlertTriangle } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-brand-ai-soft text-brand-ai-text border border-brand-border mb-3">
          <ShieldCheck className="w-4 h-4 text-brand-ai" />
          <span>Transparent Data Policies</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight">Privacy & Policies</h1>
        <p className="text-sm sm:text-base text-brand-secondary mt-2 leading-relaxed">
          Last updated: September 2026. This policy explains in clear, plain language how Squizme treats your data, documents, and API keys.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        {/* Section 1: API Key Storage (Local Device Only) */}
        <section className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center gap-2.5 text-brand-ai">
            <Lock className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-brand-text">
              1. Gemini API Keys: Saved Locally on Device (Never on Servers)
            </h2>
          </div>
          <p className="text-sm text-brand-secondary leading-relaxed">
            Your Google Gemini API keys are <strong>never stored on our servers</strong>. When you configure your personal key, it is encrypted using client-side <strong>AES-256-GCM authenticated encryption</strong> and saved strictly within your browser's local device storage.
          </p>
          <ul className="text-sm text-brand-secondary list-disc list-inside space-y-1.5 pl-1 leading-relaxed">
            <li>Our backend databases never persist or log your personal Gemini API key.</li>
            <li>When generating a quiz, your device passes the key over encrypted TLS solely in volatile memory to execute the Gemini request.</li>
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
            While Squizme does not collect any data on your queries, please be aware that the <strong>AI model itself (Google Gemini)</strong> may process, log, or handle generation prompts and context according to Google's own independent terms of service and AI privacy statements.
          </p>
          <p className="text-sm text-brand-text font-semibold leading-relaxed">
            Any data collection, caching, or logging performed by Google or the Gemini model is governed entirely between you and Google, and <strong>has nothing to do with us as a company</strong>.
          </p>
        </section>

        {/* Section 4: Document Ingestion & Ephemeral Handling */}
        <section className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center gap-2.5 text-brand-ai">
            <FileText className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-brand-text">
              4. Document Uploads & Ephemeral Processing
            </h2>
          </div>
          <p className="text-sm text-brand-secondary leading-relaxed">
            When you upload a PDF or DOCX file (up to the 20MB limit):
          </p>
          <ul className="text-sm text-brand-secondary list-disc list-inside space-y-1.5 pl-1 leading-relaxed">
            <li>The document is processed strictly in-memory using <code>pdf-parse</code> or <code>mammoth</code> to extract text.</li>
            <li>We do not write or store your original document files on disk or in persistent storage.</li>
            <li>Once text extraction and question generation complete, the in-memory buffer is immediately released.</li>
          </ul>
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
            We use your browser's <code>localStorage</code> strictly for functional session persistence (your JWT auth token and your locally encrypted Gemini API key). We employ zero advertising tracking pixels, third-party analytics cookies, or behavioral trackers.
          </p>
        </section>
      </div>
    </div>
  );
};
