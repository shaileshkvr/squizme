import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, CheckCircle, Video, Key, X, AlertCircle } from 'lucide-react';

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
      const res = await fetch('/api/users/api-key', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ apiKey })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save API key');
      }

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
    if (!confirm('Remove your custom API key? You will revert to host quota.')) return;
    await fetch('/api/users/api-key', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    await refreshProfile();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative border border-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Key className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">Google Gemini API Key</h2>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Google AI Studio provides 100% free Gemini API keys without requiring a credit card. Connect your key to unlock unlimited quizzes with up to 50 questions each.
        </p>

        {/* 3-Step Walkthrough */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">How to get your free key in 30 seconds</h3>
          <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside">
            <li>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-1"
              >
                Open Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>{' '}
              and sign in with your Google account.
            </li>
            <li>Click the blue <strong>"Create API key"</strong> button.</li>
            <li>Copy the key and paste it into the box below.</li>
          </ol>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paste Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-200">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>API key verified and securely saved!</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://www.youtube.com/results?search_query=how+to+create+google+gemini+api+key"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <Video className="w-3.5 h-3.5" />
              Watch 1-min video tutorial
            </a>

            <div className="flex gap-2">
              {user?.hasCustomKey && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs text-red-600 hover:text-red-700 px-3 py-2 cursor-pointer"
                >
                  Remove Key
                </button>
              )}
              <button
                type="submit"
                disabled={status === 'saving'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {status === 'saving' ? 'Saving...' : 'Save API Key'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
