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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-brand-card rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-brand-border text-brand-text transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-brand-muted hover:text-brand-text p-1.5 rounded-full hover:bg-brand-elevated transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-brand-elevated border border-brand-border text-brand-ai">
            <Key className="w-6 h-6 text-brand-ai" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-text">Google Gemini API Key</h2>
            <span className="text-xs text-brand-muted">Bring Your Own Key (BYOK) Configuration</span>
          </div>
        </div>

        <p className="text-sm text-brand-secondary mb-5 leading-relaxed">
          Google AI Studio provides 100% free Gemini API keys without requiring a credit card. Connect your key to unlock unlimited quizzes with up to 50 questions each.
        </p>

        {/* 3-Step Walkthrough */}
        <div className="bg-brand-elevated/70 border border-brand-border rounded-2xl p-4 mb-5 space-y-2.5">
          <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider">How to get your free key in 30 seconds</h3>
          <ol className="text-sm text-brand-secondary space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-brand-ai hover:underline font-semibold inline-flex items-center gap-1"
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
        <div className="bg-brand-card border border-brand-border rounded-2xl p-4 mb-5 text-sm text-brand-secondary flex gap-3">
          <ShieldCheck className="w-5 h-5 text-brand-success shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block text-brand-text">Local-Only Encrypted Storage</strong>
            <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
              Your API key is never stored on our servers—it is saved locally on your device encrypted with AES-256-GCM. We collect zero data on you and your queries. Requests are evaluated by Google Gemini under its own independent AI terms.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-1.5">Paste Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full text-sm px-3.5 py-2.5 border border-brand-border bg-brand-card text-brand-text rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-ai transition"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-sm text-brand-error bg-brand-error/10 p-3 rounded-2xl border border-brand-error/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-sm text-brand-success bg-brand-success/10 p-3 rounded-2xl border border-brand-success/30">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>API key encrypted and saved locally on your device!</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <a
              href="https://www.youtube.com/results?search_query=how+to+create+google+gemini+api+key"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-brand-muted hover:text-brand-text flex items-center gap-1.5 transition"
            >
              <Video className="w-4 h-4 text-brand-ai" />
              Watch 1-min tutorial video
            </a>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {(user?.hasCustomKey || hasLocalApiKey()) && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-sm text-brand-error hover:underline px-3 py-2 cursor-pointer transition"
                >
                  Remove Key
                </button>
              )}
              <button
                type="submit"
                disabled={status === 'saving'}
                className="bg-brand-primary hover:bg-brand-hover text-brand-primary-text text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow active:scale-95 disabled:opacity-50 cursor-pointer"
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
