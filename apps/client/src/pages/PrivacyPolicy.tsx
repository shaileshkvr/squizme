import React from 'react';
import { ShieldCheck, Lock, FileText, Database, EyeOff, Server } from 'lucide-react';

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
        {/* Section 1: Account Data */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <Database className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            When you create an account, we store your name, email address, and a one-way cryptographic hash of your password generated using <strong>bcrypt</strong> (10 salt rounds). We never store your raw password in plain text.
          </p>
        </section>

        {/* Section 2: BYO API Key Security */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <Lock className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">2. Bring-Your-Own (BYO) API Key Security</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            If you provide a personal Google Gemini API key to unlock unlimited quizzes, it is protected with <strong>AES-256-GCM authenticated encryption</strong> before being saved to the database.
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
            <li>Your key is decrypted only in volatile server memory when executing your quiz generation requests.</li>
            <li>We never log, expose, or share your API key with other users, advertisers, or third parties.</li>
            <li>You can permanently delete your custom API key from your profile at any time with a single click.</li>
          </ul>
        </section>

        {/* Section 3: Document Uploads & Ingestion */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <FileText className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">3. Document Uploads & Retention</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            When you upload a PDF or DOCX file (up to the 20MB limit):
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
            <li>The file is parsed in-memory using <code>pdf-parse</code> or <code>mammoth</code> to extract selectable text.</li>
            <li>We do not store your original binary document files on disk or in object storage.</li>
            <li>Once text extraction and quiz question synthesis are complete, the temporary file buffer is released from memory.</li>
          </ul>
        </section>

        {/* Section 4: Third-Party AI Processing */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <Server className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">4. Third-Party AI Services</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Quiz question generation requests are processed through the Google Gemini API. When you supply your own key, requests are governed by your agreement with Google AI Studio. Prompts and extracted text fragments are transmitted over encrypted TLS connections directly to Google's API endpoints.
          </p>
        </section>

        {/* Section 5: Cookies and Tracking */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <EyeOff className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900">5. Storage, Cookies & Tracking</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Squizme uses your browser's <code>localStorage</code> strictly to store your JSON Web Token (JWT) session so you remain authenticated across page reloads. We do not use third-party tracking pixels, marketing cookies, or fingerprinting scripts.
          </p>
        </section>
      </div>
    </div>
  );
};
