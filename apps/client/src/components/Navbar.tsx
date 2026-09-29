import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Key, LogOut, PlusCircle } from 'lucide-react';

export const Navbar: React.FC<{ onOpenApiKeyModal: () => void }> = ({ onOpenApiKeyModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Sparkles className="w-6 h-6 text-indigo-500" />
          <span>Squizme</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 hover:border-indigo-400 bg-slate-50 transition cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              {user.hasCustomKey ? (
                <span className="text-emerald-700 font-semibold">BYO Key Active</span>
              ) : (
                <span>Free: {user.freeGenerationsRemaining}/2 left</span>
              )}
            </button>

            <Link
              to="/quizzes/new"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Quiz</span>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              className="text-slate-500 hover:text-slate-700 p-2 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
};
