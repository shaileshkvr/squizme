import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? { email, password, name } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 sm:mt-12 bg-white dark:bg-slate-900 p-7 sm:p-9 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-center gap-2.5 mb-6 text-teal-600 dark:text-teal-400">
        <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Squizme</h1>
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-center text-slate-900 dark:text-white mb-6">
        {isRegister ? 'Create your account' : 'Sign in to your account'}
      </h2>

      {error && (
        <div className="flex items-center gap-2.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-3.5 rounded-xl border border-red-200 dark:border-red-800 mb-5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            Password (min 8 chars)
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-sm px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm sm:text-base py-3 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm mt-2"
        >
          {loading ? 'Please wait...' : isRegister ? 'Register' : 'Sign in'}
        </button>
      </form>

      <div className="text-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
          className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
        >
          {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
};
