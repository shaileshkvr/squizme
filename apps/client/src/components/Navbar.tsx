import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles,
  Key,
  LogOut,
  PlusCircle,
  Info,
  Shield,
  User as UserIcon,
  Sun,
  Moon,
  Lock,
  Edit2,
  Check,
  X,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC<{ onOpenApiKeyModal: () => void }> = ({ onOpenApiKeyModal }) => {
  const { user, logout, updateName, changePassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll detection for dynamic Create Quiz button
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 140);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showCreateButton = user && (location.pathname !== '/' || isScrolled);

  // Profile popup state
  const [profileOpen, setProfileOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Click outside to close popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen]);

  // Profile editing state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setNameInput(user.name);
  }, [user?.name]);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setNameSaving(true);
    try {
      await updateName(nameInput.trim());
      setEditingName(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setNameSaving(false);
    }
  };

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus('saving');
    setPasswordError('');
    try {
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }
      await changePassword(currentPassword, newPassword);
      setPasswordStatus('success');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => {
        setPasswordStatus('idle');
        setShowPasswordChange(false);
      }, 1500);
    } catch (err: any) {
      setPasswordStatus('error');
      setPasswordError(err.message || 'Failed to change password');
    }
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-xl text-teal-600 dark:text-teal-400 hover:opacity-90 transition-all active:scale-[0.98]"
          >
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="tracking-tight text-slate-900 dark:text-white">Squizme</span>
          </Link>
        </div>

        {/* Right side: Navigation Links & User Controls */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Static informational links moved to right */}
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link
              to="/about"
              className="hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1.5 transition py-1"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </Link>
            <Link
              to="/privacy"
              className="hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1.5 transition py-1"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy & Policies</span>
            </Link>
          </nav>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Conditional Create Quiz Button */}
          {showCreateButton && (
            <Link
              to="/quizzes/new"
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-200 active:scale-95 animate-fade-in"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Create Quiz</span>
            </Link>
          )}

          {user ? (
            /* User Avatar & Dropdown Popup Trigger */
            <div className="relative" ref={popupRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition cursor-pointer active:scale-95"
                aria-label="User account menu"
                aria-expanded={profileOpen}
              >
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Popup Window */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-4 z-50 transition-all text-slate-900 dark:text-slate-100">
                  {/* Profile Header */}
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Profile</span>
                      <button
                        onClick={() => setProfileOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Name edit */}
                    {editingName ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          onClick={handleSaveName}
                          disabled={nameSaving}
                          className="p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingName(false)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{user.email}</p>
                        </div>
                        <button
                          onClick={() => setEditingName(true)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                          title="Edit display name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Quota Badge */}
                    <div className="pt-1">
                      {user.hasCustomKey ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <Key className="w-3 h-3" /> BYO Key Active (Unlimited)
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <Sparkles className="w-3 h-3" /> Free Quota: {user.freeGenerationsRemaining}/2 left
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="py-2 space-y-1">
                    {/* API Key Modal Action */}
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onOpenApiKeyModal();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 text-sm font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Key className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        Gemini API Key Settings
                      </span>
                      <span className="text-xs text-slate-400">Configure</span>
                    </button>

                    {/* Password Change Action */}
                    <button
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 text-sm font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        Change Password
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showPasswordChange ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Password Change Subform */}
                    {showPasswordChange && (
                      <form onSubmit={handleChangePassword} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 mt-1">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
                          <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">New Password (min 8 chars)</label>
                          <input
                            type="password"
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        {passwordError && (
                          <p className="text-xs text-red-600 dark:text-red-400">{passwordError}</p>
                        )}
                        {passwordStatus === 'success' && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">Password updated successfully!</p>
                        )}
                        <button
                          type="submit"
                          disabled={passwordStatus === 'saving'}
                          className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                        >
                          {passwordStatus === 'saving' ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Sign Out Button with Redish Accent */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        navigate('/auth');
                      }}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged-out state: show Sign In (never show signup when logged in) */
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                className="text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white px-4 py-2 rounded-lg transition-all active:scale-95 shadow-sm"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
