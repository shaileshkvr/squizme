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
      setIsScrolled(window.scrollY > 120);
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
    <header className="sticky top-3 sm:top-5 z-40 px-3 sm:px-4 pointer-events-none transition-all duration-300">
      {/* Floating 80% Island Container */}
      <div className="pointer-events-auto max-w-5xl w-[94%] sm:w-[88%] md:w-[80%] mx-auto h-14 sm:h-16 px-4 sm:px-6 rounded-full bg-[#FFFDF8]/95 dark:bg-[#2A160B]/95 backdrop-blur-md border border-[#DDD1C2] dark:border-[#5A3E30] shadow-md hover:shadow-lg dark:shadow-black/50 flex items-center justify-between transition-all duration-200">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-lg sm:text-xl tracking-tight text-[#24150E] dark:text-[#F8F4EB] hover:opacity-90 transition-all active:scale-[0.98]"
          >
            <div className="p-1.5 rounded-full bg-[#F1EADF] dark:bg-[#3B1E11] border border-[#DDD1C2] dark:border-[#5A3E30] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#416A7A] dark:text-[#79AFC2]" />
            </div>
            <span>Squizme</span>
          </Link>
        </div>

        {/* Right: Actions, Links & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Informational Links */}
          <nav className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-[#69594D] dark:text-[#CFC0B1]">
            <Link
              to="/about"
              className="hover:text-[#24150E] dark:hover:text-[#F8F4EB] flex items-center gap-1.5 transition py-1"
            >
              <Info className="w-4 h-4 text-[#416A7A] dark:text-[#79AFC2]" />
              <span className="hidden sm:inline">About</span>
            </Link>
            <Link
              to="/privacy"
              className="hover:text-[#24150E] dark:hover:text-[#F8F4EB] flex items-center gap-1.5 transition py-1"
            >
              <Shield className="w-4 h-4 text-[#416A7A] dark:text-[#79AFC2]" />
              <span className="hidden sm:inline">Privacy</span>
            </Link>
          </nav>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-[#69594D] dark:text-[#CFC0B1] hover:bg-[#F1EADF] dark:hover:bg-[#3B1E11] transition active:scale-95 cursor-pointer"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#D2AE69]" /> : <Moon className="w-4 h-4 text-[#5A301D]" />}
          </button>

          {/* Dynamic Create Quiz Button */}
          {showCreateButton && (
            <Link
              to="/quizzes/new"
              className="flex items-center gap-1.5 bg-[#5A301D] hover:bg-[#472313] text-[#FFFDF8] dark:bg-[#C28A69] dark:hover:bg-[#D09A78] dark:text-[#1D0D00] text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm hover:shadow transition-all duration-200 active:scale-95 animate-fade-in"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Create</span>
            </Link>
          )}

          {user ? (
            /* User Avatar & Profile Popup Trigger */
            <div className="relative" ref={popupRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-full border border-[#DDD1C2] dark:border-[#5A3E30] bg-[#F8F4EB] dark:bg-[#1D0D00] hover:border-[#CFC1B2] dark:hover:border-[#6D4B3B] transition cursor-pointer active:scale-95"
                aria-label="User account menu"
                aria-expanded={profileOpen}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5A301D] dark:bg-[#C28A69] text-[#FFFDF8] dark:text-[#1D0D00] flex items-center justify-center font-bold text-xs sm:text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline text-xs sm:text-sm font-semibold text-[#24150E] dark:text-[#F8F4EB] max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#847366] dark:text-[#A99584]" />
              </button>

              {/* Profile Popup Window */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-88 rounded-3xl bg-[#FFFDF8] dark:bg-[#2A160B] border border-[#DDD1C2] dark:border-[#5A3E30] shadow-2xl p-5 z-50 text-[#24150E] dark:text-[#F8F4EB] animate-fade-in">
                  {/* Profile Header */}
                  <div className="pb-3 border-b border-[#DDD1C2] dark:border-[#5A3E30] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#847366] dark:text-[#A99584]">
                        Account Profile
                      </span>
                      <button
                        onClick={() => setProfileOpen(false)}
                        className="text-[#847366] hover:text-[#24150E] dark:text-[#A99584] dark:hover:text-[#F8F4EB] p-1 rounded-full cursor-pointer"
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
                          className="flex-1 text-sm px-3 py-1.5 rounded-xl border border-[#DDD1C2] dark:border-[#5A3E30] bg-[#FFFDF8] dark:bg-[#1D0D00] focus:outline-none focus:ring-2 focus:ring-[#5A301D] dark:focus:ring-[#C28A69]"
                        />
                        <button
                          onClick={handleSaveName}
                          disabled={nameSaving}
                          className="p-1.5 bg-[#5A301D] dark:bg-[#C28A69] text-[#FFFDF8] dark:text-[#1D0D00] rounded-xl hover:opacity-90 disabled:opacity-50 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingName(false)}
                          className="p-1.5 text-[#847366] dark:text-[#A99584] cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-[#24150E] dark:text-[#F8F4EB]">{user.name}</h4>
                          <p className="text-xs sm:text-sm text-[#69594D] dark:text-[#CFC0B1] truncate max-w-[200px]">
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={() => setEditingName(true)}
                          className="p-1.5 text-[#847366] hover:text-[#5A301D] dark:text-[#A99584] dark:hover:text-[#C28A69] rounded-xl hover:bg-[#F1EADF] dark:hover:bg-[#3B1E11] cursor-pointer transition"
                          title="Edit display name"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Quota Badge */}
                    <div className="pt-1">
                      {user.hasCustomKey ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E3EEF1] dark:bg-[#1F343B] text-[#315765] dark:text-[#B9D8E1] border border-[#DDD1C2] dark:border-[#5A3E30]">
                          <Key className="w-3.5 h-3.5" /> BYO Key Active (Unlimited)
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1EADF] dark:bg-[#3B1E11] text-[#69594D] dark:text-[#CFC0B1] border border-[#DDD1C2] dark:border-[#5A3E30]">
                          <Sparkles className="w-3.5 h-3.5 text-[#96733B] dark:text-[#D2AE69]" />
                          <span>Free Quota: {user.freeGenerationsRemaining}/2 left</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="py-2.5 space-y-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onOpenApiKeyModal();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1EADF] dark:hover:bg-[#3B1E11] text-sm font-medium text-[#24150E] dark:text-[#F8F4EB] transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Key className="w-4 h-4 text-[#416A7A] dark:text-[#79AFC2]" />
                        Gemini API Key Settings
                      </span>
                      <span className="text-xs text-[#847366] dark:text-[#A99584]">Configure</span>
                    </button>

                    <button
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F1EADF] dark:hover:bg-[#3B1E11] text-sm font-medium text-[#24150E] dark:text-[#F8F4EB] transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-[#416A7A] dark:text-[#79AFC2]" />
                        Change Password
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#847366] dark:text-[#A99584] transition-transform ${
                          showPasswordChange ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {showPasswordChange && (
                      <form
                        onSubmit={handleChangePassword}
                        className="p-3.5 bg-[#F1EADF] dark:bg-[#1D0D00] rounded-2xl space-y-2.5 mt-1 border border-[#DDD1C2] dark:border-[#5A3E30]"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-[#69594D] dark:text-[#CFC0B1] mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full text-sm px-3 py-1.5 rounded-xl border border-[#DDD1C2] dark:border-[#5A3E30] bg-[#FFFDF8] dark:bg-[#2A160B] focus:outline-none focus:ring-2 focus:ring-[#5A301D] dark:focus:ring-[#C28A69]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#69594D] dark:text-[#CFC0B1] mb-1">
                            New Password (min 8 chars)
                          </label>
                          <input
                            type="password"
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full text-sm px-3 py-1.5 rounded-xl border border-[#DDD1C2] dark:border-[#5A3E30] bg-[#FFFDF8] dark:bg-[#2A160B] focus:outline-none focus:ring-2 focus:ring-[#5A301D] dark:focus:ring-[#C28A69]"
                          />
                        </div>
                        {passwordError && (
                          <p className="text-xs text-[#9A4D3F] dark:text-[#D98678] font-medium">{passwordError}</p>
                        )}
                        {passwordStatus === 'success' && (
                          <p className="text-xs text-[#47705B] dark:text-[#82B99A] font-medium">Password updated!</p>
                        )}
                        <button
                          type="submit"
                          disabled={passwordStatus === 'saving'}
                          className="w-full py-2 bg-[#5A301D] hover:bg-[#472313] text-[#FFFDF8] dark:bg-[#C28A69] dark:hover:bg-[#D09A78] dark:text-[#1D0D00] rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                          {passwordStatus === 'saving' ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-2 border-t border-[#DDD1C2] dark:border-[#5A3E30]">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        navigate('/auth');
                      }}
                      className="w-full flex items-center gap-2 p-2.5 rounded-2xl text-sm font-semibold text-[#9A4D3F] dark:text-[#D98678] hover:bg-[#9A4D3F]/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="text-xs sm:text-sm font-semibold bg-[#5A301D] hover:bg-[#472313] text-[#FFFDF8] dark:bg-[#C28A69] dark:hover:bg-[#D09A78] dark:text-[#1D0D00] px-4 py-2 rounded-full transition-all active:scale-95 shadow-sm"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
