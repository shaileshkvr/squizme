import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, Check, Loader2, UserPlus, X } from "lucide-react";
import type { UserPublic } from "@squizme/shared";

interface RegisterFormProps {
  onSuccess: (user: UserPublic, token: string) => void;
  onSwitchMode: (mode: "login") => void;
  onCancel?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchMode,
  onCancel,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Frontend validation checks
  const isUsernameLengthValid = username.trim().length >= 4;
  const isUsernameCharsValid = /^[a-zA-Z0-9_-]+$/.test(username.trim());
  const isUsernameValid = isUsernameLengthValid && isUsernameCharsValid;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber && hasSpecial;

  const isPasswordMatch = password.length > 0 && password === confirmPassword;

  const isFormValid =
    isUsernameValid && isEmailValid && isPasswordValid && isPasswordMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || "Registration failed");
        return;
      }

      onSuccess(data.user, data.sessionToken);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border">
      <CardHeader className="space-y-1">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="w-fit -ml-2 mb-1 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        )}
        <CardTitle className="text-xl font-semibold tracking-tight">Create your account</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your details below to register for Squizme
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-2">
          {errorMessage && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 flex items-center gap-2.5 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="reg-username" className="text-xs font-medium">
                Username
              </Label>
              <span className="text-[10px] text-muted-foreground">At least 4 chars</span>
            </div>
            <Input
              id="reg-username"
              type="text"
              autoComplete="username"
              placeholder="e.g. quantum_coder"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="text-sm"
              required
            />
            {username.length > 0 && !isUsernameValid && (
              <p className="text-[11px] text-destructive">
                {!isUsernameLengthValid
                  ? "Username must be at least 4 characters long"
                  : "Letters, numbers, underscores, and hyphens only"}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-email" className="text-xs font-medium">
              Email Address
            </Label>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="text-sm"
              required
            />
            {email.length > 0 && !isEmailValid && (
              <p className="text-[11px] text-destructive">Please enter a valid email address</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-password" className="text-xs font-medium">
              Password
            </Label>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="text-sm"
              required
            />

            {/* Password Validation Checklist */}
            <div className="rounded-md border border-border/60 bg-muted/30 p-2.5 space-y-1 text-[11px]">
              <span className="text-muted-foreground font-medium block mb-1">
                Password requirements:
              </span>
              <div className="grid grid-cols-2 gap-1">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLetter ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {hasLetter ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>At least 1 letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>At least 1 number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>1 special character</span>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-confirm-password" className="text-xs font-medium">
              Confirm Password
            </Label>
            <Input
              id="reg-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="text-sm"
              required
            />
            {confirmPassword.length > 0 && !isPasswordMatch && (
              <p className="text-[11px] text-destructive">Passwords do not match</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" /> Create Account
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onSwitchMode("login")}
              className="font-medium text-foreground underline-offset-4 hover:underline cursor-pointer"
            >
              Log in
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};
