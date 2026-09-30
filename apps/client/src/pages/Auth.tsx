import React, { useState, useEffect } from 'react';
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

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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
    <div className="max-w-md mx-auto mt-6 sm:mt-12 bg-brand-card p-7 sm:p-9 rounded-3xl shadow-lg border border-brand-border transition-colors">
      <div className="flex items-center justify-center gap-2.5 mb-6 text-brand-ai">
        <div className="p-2 rounded-2xl bg-brand-elevated border border-brand-border">
          <Sparkles className="w-6 h-6 text-brand-ai" />
        </div>
        <h1 className="text-2xl font-bold text-brand-text tracking-tight">Squizme</h1>
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-center text-brand-text mb-6">
        {isRegister ? 'Create your account' : 'Sign in to your account'}
      </h2>

      {error && (
        <div className="flex items-center gap-2.5 text-sm text-brand-error bg-brand-error/10 p-3.5 rounded-2xl border border-brand-error/30 mb-5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-brand-border bg-brand-card text-brand-text rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-ai transition"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-brand-text mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm px-3.5 py-2.5 border border-brand-border bg-brand-card text-brand-text rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-ai transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-text mb-1.5">
            Password (min 8 chars)
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-sm px-3.5 py-2.5 border border-brand-border bg-brand-card text-brand-text rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-ai transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-primary hover:bg-brand-hover text-brand-primary-text font-semibold text-sm sm:text-base py-3 rounded-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm mt-2"
        >
          {loading ? 'Please wait...' : isRegister ? 'Register' : 'Sign in'}
        </button>
      </form>

      <div className="text-center mt-6 pt-4 border-t border-brand-border">
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
          className="text-sm font-medium text-brand-ai hover:underline cursor-pointer"
        >
          {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
};
