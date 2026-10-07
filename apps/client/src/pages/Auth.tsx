import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validatePassword } from "@squizme/shared";
import {
  Sparkles,
  AlertCircle,
  ArrowLeft,
  Mail,
  AlertTriangle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

type AuthMode = "login" | "register" | "forgot" | "otp";

export const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get("mode");

  const [mode, setMode] = useState<AuthMode>(() => {
    if (initialMode === "register") return "register";
    if (initialMode === "forgot") return "forgot";
    return "login";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSentEmail, setOtpSentEmail] = useState("");

  // Field touched states for validation feedback
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loginFailed, setLoginFailed] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Keep mode in sync with query parameter changes
  useEffect(() => {
    const qMode = searchParams.get("mode");
    if (qMode === "register" && mode !== "register") {
      setMode("register");
      setError("");
      setTouched({});
      setLoginFailed(false);
    } else if (qMode === "forgot" && mode !== "forgot" && mode !== "otp") {
      setMode("forgot");
      setError("");
      setTouched({});
      setLoginFailed(false);
    } else if (
      (qMode === "login" || !qMode) &&
      mode !== "login" &&
      mode !== "forgot" &&
      mode !== "otp"
    ) {
      setMode("login");
      setError("");
      setTouched({});
      setLoginFailed(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    setTouched({});
    setLoginFailed(false);
    if (newMode === "login") {
      setSearchParams({ mode: "login" });
    } else if (newMode === "register") {
      setSearchParams({ mode: "register" });
    } else if (newMode === "forgot") {
      setSearchParams({ mode: "forgot" });
    }
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Real-time Field Validation Rules
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const emailError = !email.trim()
    ? "Email is required."
    : !isEmailValid
      ? "Please enter a valid email (e.g. name@example.com)."
      : null;

  const isFirstNameValid = firstName.trim().length >= 1;
  const firstNameError = !firstName.trim() ? "First name is required." : null;

  const isLastNameValid = lastName.trim().length <= 100;
  const lastNameError = !isLastNameValid
    ? "Last name must be under 100 characters."
    : null;

  const passwordComplexityError = validatePassword(password);
  const isRegisterPasswordValid = passwordComplexityError === null;
  const isLoginPasswordValid = password.length > 0;
  const loginPasswordError = !password ? "Password is required." : null;

  // Validation Status Resolver
  const getFirstNameStatus = (): "neutral" | "valid" | "invalid" => {
    if (!touched.firstName) return "neutral";
    return isFirstNameValid ? "valid" : "invalid";
  };

  const getLastNameStatus = (): "neutral" | "valid" | "invalid" => {
    if (!touched.lastName || !lastName.trim()) return "neutral";
    return isLastNameValid ? "valid" : "invalid";
  };

  const getEmailStatus = (): "neutral" | "valid" | "invalid" => {
    if (loginFailed) return "invalid";
    if (!touched.email) return "neutral";
    return isEmailValid ? "valid" : "invalid";
  };

  const getPasswordStatus = (): "neutral" | "valid" | "invalid" => {
    if (loginFailed) return "invalid";
    if (!touched.password) return "neutral";
    if (mode === "register") {
      return isRegisterPasswordValid ? "valid" : "invalid";
    }
    return isLoginPasswordValid ? "valid" : "invalid";
  };

  const getInputClass = (status: "neutral" | "valid" | "invalid") => {
    const base =
      "peer w-full text-sm px-3.5 py-3 pr-10 rounded-2xl bg-brand-card text-brand-text transition-all duration-150 focus:outline-none placeholder-transparent";
    if (status === "valid") {
      return `${base} border-2 border-brand-success ring-1 ring-brand-success/20 focus:ring-2 focus:ring-brand-success`;
    }
    if (status === "invalid") {
      return `${base} border-2 border-brand-error ring-1 ring-brand-error/20 focus:ring-2 focus:ring-brand-error`;
    }
    return `${base} border border-brand-border focus:ring-2 focus:ring-brand-ai focus:border-brand-ai`;
  };

  const getLabelClass = (
    hasValue: boolean,
    status: "neutral" | "valid" | "invalid",
  ) => {
    const base =
      "absolute left-3.5 px-1.5 bg-brand-card pointer-events-none transition-all duration-200 origin-left select-none z-10";

    let color = "text-brand-secondary peer-focus:text-brand-ai";
    if (status === "valid") {
      color = "text-brand-success peer-focus:text-brand-success";
    } else if (status === "invalid") {
      color = "text-brand-error peer-focus:text-brand-error";
    }

    const floating = hasValue
      ? "top-0 -translate-y-1/2 text-xs font-semibold"
      : "top-1/2 -translate-y-1/2 text-sm peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:font-semibold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold";

    return `${base} ${color} ${floating}`;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoginFailed(false);

    // Touch all relevant fields on submit
    const isRegister = mode === "register";
    setTouched({
      firstName: isRegister,
      lastName: isRegister,
      email: true,
      password: true,
    });

    if (isRegister) {
      if (!isFirstNameValid) {
        setError(firstNameError || "Please check your first name.");
        return;
      }
      if (!isLastNameValid) {
        setError(lastNameError || "Please check your last name.");
        return;
      }
      if (!isEmailValid) {
        setError(emailError || "Please check your email input.");
        return;
      }
      if (!isRegisterPasswordValid) {
        setError(
          passwordComplexityError ||
            "Password does not meet complexity requirements.",
        );
        return;
      }
    } else {
      if (!isEmailValid || !password) {
        setError("Invalid email or password. Please provide both credentials.");
        return;
      }
    }

    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegister
      ? {
          email,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 && !isRegister) {
          setLoginFailed(true);
          throw new Error(
            "Invalid email or password. Please check your credentials.",
          );
        }
        throw new Error(data.error || "Authentication failed");
      }

      login(data.token, data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    markTouched("email");

    const trimmed = email.trim();
    if (!trimmed || !emailRegex.test(trimmed)) {
      setError("Please provide a valid email.");
      return;
    }

    setOtpSentEmail(trimmed);
    setMode("otp");
  };

  return (
    <div className="max-w-md mx-auto mt-6 sm:mt-12 bg-brand-card p-7 sm:p-9 rounded-3xl shadow-lg border border-brand-border transition-colors">
      {/* Screen Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text">
          {mode === "register" && "Create an account"}
          {mode === "login" && "Sign in to your account"}
          {mode === "forgot" && "Reset your password"}
          {mode === "otp" && "Verify your email"}
        </h2>

        <p className="text-xs sm:text-sm text-brand-secondary mt-1">
          {mode === "login" && "Welcome back"}
          {mode === "register" && "Let's get you started"}
          {mode === "forgot" && "You will receive a 6-digit recovery code."}
          {mode === "otp" && (
            <span>
              Sent 6-digit code to{" "}
              <strong className="text-brand-text">{otpSentEmail}</strong>
            </span>
          )}
        </p>
      </div>

      {/* Global Error Alert Banner */}
      {error && (
        <div className="flex items-center gap-2.5 text-sm text-brand-error bg-brand-error/10 p-3.5 rounded-2xl border border-brand-error/30 mb-5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Login / Register Forms */}
      {(mode === "login" || mode === "register") && (
        <form onSubmit={handleAuthSubmit} noValidate className="space-y-4.5">
          {/* First Name & Last Name Fields (Register Mode Only) */}
          {mode === "register" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
              {/* First Name */}
              <div>
                <div className="relative">
                  <input
                    id="firstName"
                    type="text"
                    placeholder=" "
                    value={firstName}
                    onBlur={() => markTouched("firstName")}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (!touched.firstName) markTouched("firstName");
                    }}
                    className={getInputClass(getFirstNameStatus())}
                  />
                  <label
                    htmlFor="firstName"
                    className={getLabelClass(
                      Boolean(firstName),
                      getFirstNameStatus(),
                    )}
                  >
                    First Name
                  </label>
                  {getFirstNameStatus() === "valid" && (
                    <Check className="w-4 h-4 text-brand-success absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  )}
                  {getFirstNameStatus() === "invalid" && (
                    <AlertCircle className="w-4 h-4 text-brand-error absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  )}
                </div>
                {getFirstNameStatus() === "invalid" && firstNameError && (
                  <p className="text-sm text-brand-error mt-1.5 flex items-center gap-1.5 font-medium animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{firstNameError}</span>
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <div className="relative">
                  <input
                    id="lastName"
                    type="text"
                    placeholder=" "
                    value={lastName}
                    onBlur={() => markTouched("lastName")}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (!touched.lastName) markTouched("lastName");
                    }}
                    className={getInputClass(getLastNameStatus())}
                  />
                  <label
                    htmlFor="lastName"
                    className={getLabelClass(
                      Boolean(lastName),
                      getLastNameStatus(),
                    )}
                  >
                    Last Name{" "}
                    <span className="text-xs text-brand-secondary font-normal">
                      (Optional)
                    </span>
                  </label>
                  {getLastNameStatus() === "valid" && (
                    <Check className="w-4 h-4 text-brand-success absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  )}
                  {getLastNameStatus() === "invalid" && (
                    <AlertCircle className="w-4 h-4 text-brand-error absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  )}
                </div>
                {getLastNameStatus() === "invalid" && lastNameError && (
                  <p className="text-sm text-brand-error mt-1.5 flex items-center gap-1.5 font-medium animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{lastNameError}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder=" "
                value={email}
                onBlur={() => markTouched("email")}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginFailed(false);
                  if (!touched.email) markTouched("email");
                }}
                className={getInputClass(getEmailStatus())}
              />
              <label
                htmlFor="email"
                className={getLabelClass(Boolean(email), getEmailStatus())}
              >
                Email
              </label>
              {getEmailStatus() === "valid" && (
                <Check className="w-4 h-4 text-brand-success absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              )}
              {getEmailStatus() === "invalid" && (
                <AlertCircle className="w-4 h-4 text-brand-error absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              )}
            </div>
            {getEmailStatus() === "invalid" && (
              <p className="text-sm text-brand-error mt-1.5 flex items-center gap-1.5 font-medium animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {loginFailed ? "Invalid email or password" : emailError}
                </span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder=" "
                value={password}
                onBlur={() => markTouched("password")}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginFailed(false);
                  if (!touched.password) markTouched("password");
                }}
                className={`${getInputClass(getPasswordStatus())} pr-16`}
              />
              <label
                htmlFor="password"
                className={getLabelClass(
                  Boolean(password),
                  getPasswordStatus(),
                )}
              >
                Password
              </label>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                {getPasswordStatus() === "valid" && (
                  <Check className="w-4 h-4 text-brand-success pointer-events-none" />
                )}
                {getPasswordStatus() === "invalid" && (
                  <AlertCircle className="w-4 h-4 text-brand-error pointer-events-none" />
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="p-1 rounded-lg text-brand-secondary hover:text-brand-text transition cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {mode === "login" && (
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-xs font-semibold text-brand-ai hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}
            {getPasswordStatus() === "invalid" && (
              <p className="text-sm text-brand-error mt-1.5 flex items-center gap-1.5 font-medium animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {loginFailed
                    ? "Invalid email or password"
                    : mode === "register"
                      ? passwordComplexityError
                      : loginPasswordError}
                </span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-hover text-brand-primary-text font-semibold text-sm sm:text-base py-3 rounded-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm mt-2"
          >
            {loading
              ? "Please wait..."
              : mode === "register"
                ? "Register"
                : "Sign in"}
          </button>
        </form>
      )}

      {/* 2. Forgot Password Request Form */}
      {mode === "forgot" && (
        <form onSubmit={handleForgotSubmit} noValidate className="space-y-4.5">
          <div>
            <div className="relative">
              <input
                id="forgotEmail"
                type="email"
                placeholder=" "
                value={email}
                onBlur={() => markTouched("email")}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!touched.email) markTouched("email");
                }}
                className={getInputClass(getEmailStatus())}
              />
              <label
                htmlFor="forgotEmail"
                className={getLabelClass(Boolean(email), getEmailStatus())}
              >
                Registered Email
              </label>
              {getEmailStatus() === "valid" && (
                <Check className="w-4 h-4 text-brand-success absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              )}
              {getEmailStatus() === "invalid" && (
                <AlertCircle className="w-4 h-4 text-brand-error absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              )}
            </div>
            {getEmailStatus() === "invalid" && emailError && (
              <p className="text-sm text-brand-error mt-1.5 flex items-center gap-1.5 font-medium animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-brand-primary hover:bg-brand-hover text-brand-primary-text font-semibold text-sm sm:text-base py-3 rounded-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-sm mt-2 flex items-center justify-center gap-2"
          >
            <span>Send Recovery OTP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* 3. OTP Code Verification Screen (Disabled with chained blocks) */}
      {mode === "otp" && (
        <div className="space-y-5 animate-fade-in">
          {/* Animated 6-Digit Chained OTP Input UI */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 py-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <React.Fragment key={index}>
                {index === 3 && (
                  <span className="text-brand-muted font-bold text-lg select-none px-0.5">
                    –
                  </span>
                )}
                <div
                  className="relative w-10 h-14 sm:w-12 sm:h-16 rounded-2xl border-2 border-brand-border bg-brand-elevated/60 flex items-center justify-center font-mono text-xl font-bold text-brand-text select-none cursor-not-allowed opacity-75 shadow-inner transition-all hover:border-brand-border-strong"
                  title="OTP input is currently disabled pending mail service integration"
                >
                  <input
                    type="text"
                    disabled
                    maxLength={1}
                    aria-label={`Digit ${index + 1}`}
                    className="w-full h-full text-center bg-transparent cursor-not-allowed text-brand-muted font-bold text-lg focus:outline-none select-none"
                    placeholder="•"
                  />
                  {index === 0 && (
                    <div className="absolute w-2 h-0.5 bg-brand-ai bottom-2.5 rounded-full animate-pulse" />
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Integration Notice Callout */}
          <div className="p-4 rounded-2xl bg-brand-elevated border border-brand-border space-y-1.5 text-xs text-brand-secondary">
            <div className="flex items-center gap-2 font-bold text-brand-text">
              <AlertTriangle className="w-4 h-4 text-brand-warning shrink-0" />
              <span>Email Service Integration Pending</span>
            </div>
            <p className="leading-relaxed text-brand-secondary text-xs">
              Sending real verification codes requires configuring an external
              SMTP server or transactional email service (e.g. AWS SES /
              Resend). This OTP input is disabled in development preview.
            </p>
          </div>

          {/* Disabled Submit Action */}
          <button
            type="button"
            disabled
            className="w-full bg-brand-primary opacity-50 cursor-not-allowed text-brand-primary-text font-semibold text-sm sm:text-base py-3 rounded-full shadow-sm mt-1"
          >
            Verify Code & Reset Password
          </button>

          {/* Change Email Action */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="text-xs text-brand-muted hover:text-brand-text transition font-medium cursor-pointer"
            >
              Entered wrong address? Change email
            </button>
          </div>
        </div>
      )}

      {/* Bottom Switcher Footer */}
      <div className="text-center mt-6 pt-4 border-t border-brand-border">
        {mode === "register" && (
          <button
            onClick={() => switchMode("login")}
            className="text-sm font-medium text-brand-ai hover:underline cursor-pointer"
          >
            Already have an account? Sign in
          </button>
        )}

        {mode === "login" && (
          <button
            onClick={() => switchMode("register")}
            className="text-sm font-medium text-brand-ai hover:underline cursor-pointer"
          >
            Don't have an account? Register
          </button>
        )}

        {(mode === "forgot" || mode === "otp") && (
          <button
            onClick={() => switchMode("login")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-ai hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign in</span>
          </button>
        )}
      </div>
    </div>
  );
};
