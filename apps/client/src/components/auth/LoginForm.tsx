import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, Loader2, LogIn } from "lucide-react";
import type { UserPublic } from "@squizme/shared";

interface LoginFormProps {
  onSuccess: (user: UserPublic, token: string) => void;
  onSwitchMode: (mode: "register" | "forgot-password") => void;
  onCancel?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchMode,
  onCancel,
}) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid = identifier.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || "Invalid username/email or password");
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
        <CardTitle className="text-xl font-semibold tracking-tight">Sign in to Squizme</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your username or email to access your quizzes
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

          <div className="space-y-1.5">
            <Label htmlFor="login-identifier" className="text-xs font-medium">
              Username or Email
            </Label>
            <Input
              id="login-identifier"
              type="text"
              autoComplete="username"
              placeholder="e.g. johndoe or john@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
              className="text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password" className="text-xs font-medium">
                Password
              </Label>
              <button
                type="button"
                onClick={() => onSwitchMode("forgot-password")}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="text-sm"
              required
            />
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
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Sign In
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => onSwitchMode("register")}
              className="font-medium text-foreground underline-offset-4 hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};
