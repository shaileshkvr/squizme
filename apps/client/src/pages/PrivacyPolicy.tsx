import React from 'react';
import { ShieldCheck, Lock, FileText, Database, EyeOff, Server, AlertTriangle } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Transparent Data Practices</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy & Policies</h1>
        <p className="text-sm text-slate-600 mt-2">
          Last updated: September 2026. This policy explains in plain language how Squizme handles your data, documents, and API keys.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-6">
        {/* Section 1: API Key Storage (Local Device Only) */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <Lock className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">1. Gemini API Keys: Saved Locally on Device (Not on Servers)</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your Google Gemini API keys are <strong>never stored on our servers</strong>. When you configure your personal key, it is encrypted using client-side <strong>AES-256-GCM authenticated encryption</strong> and saved strictly within your browser's local device storage.
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
            <li>Our server databases never persist or hold your personal Gemini API key.</li>
            <li>When generating a quiz, your device passes the key over encrypted TLS solely in volatile memory to execute the Gemini request.</li>
            <li>You can erase your locally saved key at any time with a single click in settings.</li>
          </ul>
        </section>

        {/* Section 2: Zero User & Query Data Collection */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <EyeOff className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">2. Zero User & Query Data Collection</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            We do <strong>not collect, profile, monitor, or sell any data</strong> regarding you or your quiz queries. We do not inspect your study topics, build advertising profiles, or monetize your query history.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your account stores only the minimum credentials required to log you in (your email, name, and a one-way <strong>bcrypt</strong> hash of your password).
          </p>
        </section>

        {/* Section 3: Third-Party AI Model Disclaimer */}
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-amber-950">3. Third-Party AI Model & Provider Disclaimer</h2>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            While Squizme does not collect any data on your queries, please be aware that the <strong>AI model itself (Google Gemini)</strong> may process, log, or handle generation prompts and context according to Google's own independent terms of service and AI privacy statements.
          </p>
          <p className="text-xs text-amber-900 font-medium leading-relaxed">
            Any data collection, caching, or logging performed by Google or the Gemini model is governed entirely between you and Google, and <strong>has nothing to do with us as a company</strong>.
          </p>
        </section>

        {/* Section 4: Document Ingestion & Ephemeral Handling */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <FileText className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">4. Document Uploads & Ephemeral Processing</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            When you upload a PDF or DOCX file (up to the 20MB limit):
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
            <li>The document is processed strictly in-memory using <code>pdf-parse</code> or <code>mammoth</code> to extract text.</li>
            <li>We do not write or store your original document files on disk or in persistent storage.</li>
            <li>Once text extraction and question generation complete, the in-memory buffer is immediately released.</li>
          </ul>
        </section>

        {/* Section 5: Cookies and Session Storage */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <Database className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">5. Storage, Cookies & Tracking</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            We use your browser's <code>localStorage</code> strictly for functional session persistence (your JWT auth token and your locally encrypted Gemini API key). We employ zero advertising tracking pixels, third-party analytics cookies, or behavioral trackers.
          </p>
        </section>
      </div>
    </div>
  );
};
