import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { validatePassword } from "@squizme/shared";
import {
  Sparkles,
  Key,
  LogOut,
  Info,
  Shield,
  Sun,
  Moon,
  Lock,
  Edit2,
  Check,
  X,
  ChevronDown,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export const Navbar: React.FC<{ onOpenApiKeyModal: () => void }> = ({
  onOpenApiKeyModal,
}) => {
  const { user, logout, updateName, changePassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Profile popup state
  const [profileOpen, setProfileOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Click or focus outside and Escape key to close popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleFocusOutside = (e: FocusEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("focusin", handleFocusOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("focusin", handleFocusOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  // Profile editing state
  const [editingName, setEditingName] = useState(false);
  const [firstNameInput, setFirstNameInput] = useState(
    user?.firstName || user?.name?.split(" ")[0] || "",
  );
  const [lastNameInput, setLastNameInput] = useState(
    user?.lastName ?? (user?.name?.split(" ").slice(1).join(" ") || ""),
  );
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstNameInput(user.firstName || user.name?.split(" ")[0] || "");
      setLastNameInput(
        user.lastName !== undefined
          ? user.lastName
          : user.name?.split(" ").slice(1).join(" ") || "",
      );
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!firstNameInput.trim()) return;
    setNameSaving(true);
    try {
      await updateName(firstNameInput.trim(), lastNameInput.trim());
      setEditingName(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setNameSaving(false);
    }
  };

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [passwordError, setPasswordError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState<{
    current?: boolean;
    new?: boolean;
  }>({});

  const newPassValidationError = validatePassword(newPassword);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordTouched({ current: true, new: true });
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (newPassValidationError) {
      setPasswordError(newPassValidationError);
      return;
    }

    setPasswordStatus("saving");
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setPasswordTouched({});
      setTimeout(() => {
        setPasswordStatus("idle");
        setShowPasswordChange(false);
      }, 1500);
    } catch (err: any) {
      setPasswordStatus("error");
      setPasswordError(err.message || "Failed to change password");
    }
  };

  return (
    <header className="sticky top-3 sm:top-5 z-40 max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 mb-8 pointer-events-none transition-all duration-300">
      {/* Floating Island Container matching main content width */}
      <div className="pointer-events-auto w-full h-14 sm:h-16 px-4 sm:px-6 rounded-full bg-[#FFFDF8]/95 dark:bg-[#2A160B]/95 backdrop-blur-md border border-[#DDD1C2] dark:border-[#5A3E30] shadow-md hover:shadow-lg dark:shadow-black/50 flex items-center justify-between transition-all duration-200">
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
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#D2AE69]" />
            ) : (
              <Moon className="w-4 h-4 text-[#5A301D]" />
            )}
          </button>

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
                  {user.firstName
                    ? user.firstName.charAt(0).toUpperCase()
                    : user.name
                      ? user.name.charAt(0).toUpperCase()
                      : "U"}
                </div>
                <span className="hidden md:inline text-xs sm:text-sm font-semibold text-[#24150E] dark:text-[#F8F4EB] max-w-[100px] truncate">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                    user.name ||
                    user.email}
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
                      <div className="space-y-2 pt-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="First name"
                            value={firstNameInput}
                            onChange={(e) => setFirstNameInput(e.target.value)}
                            className="flex-1 min-w-0 text-sm px-3 py-1.5 rounded-xl border border-[#DDD1C2] dark:border-[#5A3E30] bg-[#FFFDF8] dark:bg-[#1D0D00] focus:outline-none focus:ring-2 focus:ring-[#5A301D] dark:focus:ring-[#C28A69]"
                          />
                          <input
                            type="text"
                            placeholder="Last name"
                            value={lastNameInput}
                            onChange={(e) => setLastNameInput(e.target.value)}
                            className="flex-1 min-w-0 text-sm px-3 py-1.5 rounded-xl border border-[#DDD1C2] dark:border-[#5A3E30] bg-[#FFFDF8] dark:bg-[#1D0D00] focus:outline-none focus:ring-2 focus:ring-[#5A301D] dark:focus:ring-[#C28A69]"
                          />
                        </div>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={handleSaveName}
                            disabled={nameSaving || !firstNameInput.trim()}
                            className="px-3 py-1 text-xs font-semibold bg-[#5A301D] dark:bg-[#C28A69] text-[#FFFDF8] dark:text-[#1D0D00] rounded-xl hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingName(false);
                              if (user) {
                                setFirstNameInput(
                                  user.firstName ||
                                    user.name?.split(" ")[0] ||
                                    "",
                                );
                                setLastNameInput(
                                  user.lastName !== undefined
                                    ? user.lastName
                                    : user.name
                                        ?.split(" ")
                                        .slice(1)
                                        .join(" ") || "",
                                );
                              }
                            }}
                            className="px-2.5 py-1 text-xs text-[#847366] dark:text-[#A99584] rounded-xl hover:bg-[#F1EADF] dark:hover:bg-[#3B1E11] cursor-pointer flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-[#24150E] dark:text-[#F8F4EB]">
                            {[user.firstName, user.lastName]
                              .filter(Boolean)
                              .join(" ") ||
                              user.name ||
                              user.email}
                          </h4>
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
                          <Key className="w-3.5 h-3.5" /> BYO Key Active
                          (Unlimited)
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1EADF] dark:bg-[#3B1E11] text-[#69594D] dark:text-[#CFC0B1] border border-[#DDD1C2] dark:border-[#5A3E30]">
                          <Sparkles className="w-3.5 h-3.5 text-[#96733B] dark:text-[#D2AE69]" />
                          <span>
                            Free Quota: {user.freeGenerationsRemaining}/2 left
                          </span>
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
                        Groq API Key Settings
                      </span>
                      <span className="text-xs text-[#847366] dark:text-[#A99584]">
                        Configure
                      </span>
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
                          showPasswordChange ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showPasswordChange && (
                      <form
                        onSubmit={handleChangePassword}
                        noValidate
                        className="p-3.5 bg-[#F1EADF] dark:bg-[#1D0D00] rounded-2xl space-y-2.5 mt-1 border border-[#DDD1C2] dark:border-[#5A3E30]"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-[#69594D] dark:text-[#CFC0B1]">
                              Current Password
                            </label>
                            {passwordTouched.current && currentPassword && (
                              <span className="text-xs text-[#47705B] dark:text-[#82B99A] font-semibold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Valid
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              value={currentPassword}
                              onBlur={() =>
                                setPasswordTouched((prev) => ({
                                  ...prev,
                                  current: true,
                                }))
                              }
                              onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                if (!passwordTouched.current) {
                                  setPasswordTouched((prev) => ({
                                    ...prev,
                                    current: true,
                                  }));
                                }
                              }}
                              className={`w-full text-sm px-3 py-1.5 pr-16 rounded-xl bg-[#FFFDF8] dark:bg-[#2A160B] focus:outline-none transition-all ${
                                !passwordTouched.current
                                  ? "border border-[#DDD1C2] dark:border-[#5A3E30] focus:ring-2 focus:ring-[#5A301D] dark:focus:ring-[#C28A69]"
                                  : currentPassword
                                    ? "border-2 border-[#47705B] dark:border-[#82B99A]"
                                    : "border-2 border-[#9A4D3F] dark:border-[#D98678]"
                              }`}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                              {passwordTouched.current && currentPassword && (
                                <Check className="w-4 h-4 text-[#47705B] dark:text-[#82B99A] pointer-events-none" />
                              )}
                              {passwordTouched.current && !currentPassword && (
                                <AlertCircle className="w-4 h-4 text-[#9A4D3F] dark:text-[#D98678] pointer-events-none" />
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setShowCurrentPassword((prev) => !prev)
                                }
                                className="p-1 rounded-lg text-[#69594D] dark:text-[#CFC0B1] hover:text-[#24150E] dark:hover:text-[#F8F4EB] transition cursor-pointer"
                                aria-label={
                                  showCurrentPassword
                                    ? "Hide current password"
                                    : "Show current password"
                                }
                                title={
                                  showCurrentPassword
                                    ? "Hide current password"
                                    : "Show current password"
                                }
                                tabIndex={-1}
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                          {passwordTouched.current && !currentPassword && (
                            <p className="text-sm text-[#9A4D3F] dark:text-[#D98678] font-medium flex items-center gap-1.5 mt-1">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>Current password is required.</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-[#69594D] dark:text-[#CFC0B1]">
                              New Password
                            </label>
                            {passwordTouched.new &&
                              newPassValidationError === null && (
                                <span className="text-xs text-[#47705B] dark:text-[#82B99A] font-semibold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Strong
                                  password
                                </span>
                              )}
                          </div>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={newPassword}
                              onBlur={() =>
                                setPasswordTouched((prev) => ({
                                  ...prev,
                                  new: true,
                                }))
                              }
                              onChange={(e) => {
                                setNewPassword(e.target.value);
                                if (!passwordTouched.new) {
                                  setPasswordTouched((prev) => ({
                                    ...prev,
                                    new: true,
                                  }));
                                }
                              }}
                              className={`w-full text-sm px-3 py-1.5 pr-16 rounded-xl bg-[#FFFDF8] dark:bg-[#2A160B] focus:outline-none transition-all ${
                                !passwordTouched.new
                                  ? "border border-[#DDD1C2] dark:border-[#5A3E30] focus:ring-2 focus:ring-[#5A301D] dark:focus:ring-[#C28A69]"
                                  : newPassValidationError === null
                                    ? "border-2 border-[#47705B] dark:border-[#82B99A]"
                                    : "border-2 border-[#9A4D3F] dark:border-[#D98678]"
                              }`}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                              {passwordTouched.new &&
                                newPassValidationError === null && (
                                  <Check className="w-4 h-4 text-[#47705B] dark:text-[#82B99A] pointer-events-none" />
                                )}
                              {passwordTouched.new &&
                                newPassValidationError !== null && (
                                  <AlertCircle className="w-4 h-4 text-[#9A4D3F] dark:text-[#D98678] pointer-events-none" />
                                )}
                              <button
                                type="button"
                                onClick={() =>
                                  setShowNewPassword((prev) => !prev)
                                }
                                className="p-1 rounded-lg text-[#69594D] dark:text-[#CFC0B1] hover:text-[#24150E] dark:hover:text-[#F8F4EB] transition cursor-pointer"
                                aria-label={
                                  showNewPassword
                                    ? "Hide new password"
                                    : "Show new password"
                                }
                                title={
                                  showNewPassword
                                    ? "Hide new password"
                                    : "Show new password"
                                }
                                tabIndex={-1}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                          {passwordTouched.new && newPassValidationError && (
                            <p className="text-sm text-[#9A4D3F] dark:text-[#D98678] font-medium flex items-center gap-1.5 mt-1">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{newPassValidationError}</span>
                            </p>
                          )}
                        </div>

                        {passwordError && passwordStatus === "error" && (
                          <div className="flex items-center gap-1.5 text-sm text-[#9A4D3F] dark:text-[#D98678] font-medium p-2 rounded-xl bg-[#9A4D3F]/10 border border-[#9A4D3F]/20">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{passwordError}</span>
                          </div>
                        )}
                        {passwordStatus === "success" && (
                          <div className="flex items-center gap-1.5 text-sm text-[#47705B] dark:text-[#82B99A] font-medium p-2 rounded-xl bg-[#47705B]/10 border border-[#47705B]/20">
                            <Check className="w-4 h-4 shrink-0" />
                            <span>Password updated successfully!</span>
                          </div>
                        )}
                        <button
                          type="submit"
                          disabled={passwordStatus === "saving"}
                          className="w-full py-2 bg-[#5A301D] hover:bg-[#472313] text-[#FFFDF8] dark:bg-[#C28A69] dark:hover:bg-[#D09A78] dark:text-[#1D0D00] rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                          {passwordStatus === "saving"
                            ? "Updating..."
                            : "Update Password"}
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
                        navigate("/auth");
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
              to="/auth?mode=login"
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
