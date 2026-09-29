import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, CheckCircle, Video, Key, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { saveLocalApiKey, removeLocalApiKey, hasLocalApiKey } from '../utils/crypto';

export const ApiKeyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, token, refreshProfile } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage('');

    try {
      const trimmed = apiKey.trim();
      if (trimmed.length < 10) {
        throw new Error('Please enter a valid Gemini API key (at least 10 characters).');
      }

      // Save encrypted locally on the user's device
      await saveLocalApiKey(trimmed);

      setStatus('success');
      await refreshProfile();
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove your custom API key from this device? You will revert to host quota.')) return;
    removeLocalApiKey();
    if (token) {
      await fetch('/api/users/api-key', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    await refreshProfile();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
            <Key className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Google Gemini API Key</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Bring Your Own Key (BYOK) Configuration</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
          Google AI Studio provides 100% free Gemini API keys without requiring a credit card. Connect your key to unlock unlimited quizzes with up to 50 questions each.
        </p>

        {/* 3-Step Walkthrough */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 mb-5 space-y-2.5">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">How to get your free key in 30 seconds</h3>
          <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 dark:text-teal-400 hover:underline font-semibold inline-flex items-center gap-1"
              >
                Open Google AI Studio <ExternalLink className="w-3.5 h-3.5" />
              </a>{' '}
              and sign in with your Google account.
            </li>
            <li>Click the blue <strong>"Create API key"</strong> button.</li>
            <li>Copy the key and paste it below.</li>
          </ol>
        </div>

        {/* Privacy & Storage Guarantee Notice */}
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-5 text-sm text-emerald-900 dark:text-emerald-200 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block text-emerald-950 dark:text-emerald-100">Local-Only Encrypted Storage</strong>
            <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
              Your API key is never stored on our servers—it is saved locally on your device encrypted with AES-256-GCM. We collect zero data on you and your queries. Requests are evaluated by Google Gemini under its own independent AI terms.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Paste Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full text-sm px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-3 rounded-xl border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>API key encrypted and saved locally on your device!</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <a
              href="https://www.youtube.com/results?search_query=how+to+create+google+gemini+api+key"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition"
            >
              <Video className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Watch 1-min tutorial video
            </a>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {(user?.hasCustomKey || hasLocalApiKey()) && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline px-3 py-2 cursor-pointer transition"
                >
                  Remove Key
                </button>
              )}
              <button
                type="submit"
                disabled={status === 'saving'}
                className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {status === 'saving' ? 'Encrypting & Saving...' : 'Save Locally'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
