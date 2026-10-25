import { useEffect, useRef, useState } from "react";
import type {
  GenerationDifficulty,
  GenerationRequest,
  JobStatusResponse,
  UserPublic,
} from "@squizme/shared";
import {
  AlertCircle,
  Check,
  Copy,
  Home,
  Loader2,
  LogIn,
  LogOut,
  Play,
  Search,
  Square,
  Terminal,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { LandingPage } from "@/components/LandingPage";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

const API_BASE = "/api";

type AppView = "landing" | "login" | "register" | "forgot-password" | "generator";

export default function App() {
  // Navigation & Authentication state
  const [currentView, setCurrentView] = useState<AppView>("landing");
  const [currentUser, setCurrentUser] = useState<UserPublic | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Generator form state
  const [prompt, setPrompt] = useState("");
  const [questionCount, setQuestionCount] = useState<number | "">(5);
  const [difficulty, setDifficulty] = useState<GenerationDifficulty>("medium");
  const [mode, setMode] = useState<"learning" | "assessment">("assessment");

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [rawOutput, setRawOutput] = useState<unknown | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCheckingActive, setIsCheckingActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  // Restore authenticated session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("squizme_session_token");
    const savedUser = localStorage.getItem("squizme_user");

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setSessionToken(savedToken);
        setCurrentUser(user);
        setCurrentView("generator");

        // Validate session with backend
        fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
            throw new Error("Invalid session");
          })
          .then((data) => {
            setCurrentUser(data.user);
            localStorage.setItem("squizme_user", JSON.stringify(data.user));
          })
          .catch(() => {
            // Expired or invalid session
            localStorage.removeItem("squizme_session_token");
            localStorage.removeItem("squizme_user");
            setSessionToken(null);
            setCurrentUser(null);
            setCurrentView("landing");
          });
      } catch {
        localStorage.removeItem("squizme_session_token");
        localStorage.removeItem("squizme_user");
      }
    }

    return () => stopPolling();
  }, []);

  const handleAuthSuccess = (user: UserPublic, token: string) => {
    localStorage.setItem("squizme_session_token", token);
    localStorage.setItem("squizme_user", JSON.stringify(user));
    setSessionToken(token);
    setCurrentUser(user);
    setCurrentView("generator");
  };

  const handleLogout = async () => {
    if (sessionToken) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
      } catch {
        // Ignore network errors on logout
      }
    }
    localStorage.removeItem("squizme_session_token");
    localStorage.removeItem("squizme_user");
    setSessionToken(null);
    setCurrentUser(null);
    setCurrentView("landing");
  };

  // Poll single job status
  const pollJob = async (id: string) => {
    try {
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      }

      const res = await fetch(`${API_BASE}/quiz-generations/${id}`, { headers });
      const data: JobStatusResponse = await res.json();

      setJobStatus(data);

      if (data.status === "completed" && data.quizId) {
        stopPolling();
        // Fetch materialized quiz output
        try {
          const quizRes = await fetch(`${API_BASE}/quizzes/${data.quizId}`);
          if (quizRes.ok) {
            const quizJson = await quizRes.json();
            setRawOutput({
              job: data,
              generatedQuiz: quizJson,
            });
            return;
          }
        } catch (quizErr) {
          console.error("Failed to fetch generated quiz details", quizErr);
        }
        setRawOutput(data);
      } else if (data.status === "failed" || data.status === "cancelled") {
        stopPolling();
        setRawOutput(data);
        if (data.error?.message) {
          setErrorMessage(data.error.message);
        }
      } else {
        setRawOutput(data);
      }
    } catch (err: unknown) {
      console.error("Polling error:", err);
    }
  };

  const startPolling = (id: string) => {
    stopPolling();
    pollJob(id);
    pollTimerRef.current = setInterval(() => {
      pollJob(id);
    }, 1500);
  };

  // Validation rules
  const trimmedPrompt = prompt.trim();
  const promptCharCount = trimmedPrompt.length;
  const isPromptValid = promptCharCount >= 20;

  const isQuestionCountValid =
    typeof questionCount === "number" &&
    !isNaN(questionCount) &&
    questionCount >= 5 &&
    questionCount <= 50;

  const isQuestionCountBelowMin =
    questionCount === "" ||
    (typeof questionCount === "number" && !isNaN(questionCount) && questionCount < 5);

  const isQuestionCountAboveMax =
    typeof questionCount === "number" && !isNaN(questionCount) && questionCount > 50;

  // Submit new generation job
  const handleSubmit = async () => {
    if (!isPromptValid || !isQuestionCountValid) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setJobStatus(null);
    setRawOutput(null);
    stopPolling();

    const idempotencyKey = crypto.randomUUID();
    const payload: GenerationRequest = {
      idempotencyKey,
      prompt: prompt.trim(),
      mode,
      difficulty,
      questionCount: Number(questionCount),
    };

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      }

      const res = await fetch(`${API_BASE}/quiz-generations`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setRawOutput(data);

      if (!res.ok) {
        setErrorMessage(data.message || data.error || `HTTP ${res.status}`);
        return;
      }

      setJobId(data.jobId);
      setJobStatus(data);
      startPolling(data.jobId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error contacting server";
      setErrorMessage(msg);
      setRawOutput({ error: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel in-flight job
  const handleCancel = async () => {
    const targetJobId = jobId || jobStatus?.jobId;
    if (!targetJobId) return;

    setIsCancelling(true);
    try {
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      }

      const res = await fetch(`${API_BASE}/quiz-generations/${targetJobId}/cancel`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        stopPolling();
        pollJob(targetJobId);
      } else {
        setErrorMessage(data.message || "Failed to cancel job");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel job";
      setErrorMessage(msg);
      setRawOutput({ error: msg });
    } finally {
      setIsCancelling(false);
    }
  };

  // Query server for any active job
  const handleCheckActive = async () => {
    setIsCheckingActive(true);
    setErrorMessage(null);
    try {
      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers.Authorization = `Bearer ${sessionToken}`;
      }

      const res = await fetch(`${API_BASE}/quiz-generations/active`, { headers });
      if (res.status === 404) {
        setRawOutput({ message: "No active generation job found for user." });
        setJobStatus(null);
        return;
      }
      const data: JobStatusResponse = await res.json();
      setRawOutput(data);
      setJobStatus(data);
      setJobId(data.jobId);
      if (
        ["queued", "planning", "generating", "finalizing", "cancel_requested"].includes(
          data.status
        )
      ) {
        startPolling(data.jobId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to query active job";
      setErrorMessage(msg);
      setRawOutput({ error: msg });
    } finally {
      setIsCheckingActive(false);
    }
  };

  const handleCopyRaw = () => {
    if (!rawOutput) return;
    navigator.clipboard.writeText(JSON.stringify(rawOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    stopPolling();
    setJobId(null);
    setJobStatus(null);
    setRawOutput(null);
    setErrorMessage(null);
  };

  const isJobActive =
    jobStatus?.status &&
    ["queued", "planning", "generating", "finalizing", "cancel_requested"].includes(
      jobStatus.status
    );

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "failed":
        return "destructive";
      case "cancelled":
        return "warning";
      case "generating":
      case "planning":
      case "finalizing":
        return "default";
      default:
        return "outline";
    }
  };

  // 1. Landing View
  if (currentView === "landing") {
    return (
      <LandingPage
        onOpenAuth={(m) => setCurrentView(m)}
        onOpenGenerator={() => setCurrentView("generator")}
        isAuthenticated={Boolean(currentUser)}
        username={currentUser?.username}
        onLogout={handleLogout}
      />
    );
  }

  // 2. Auth Views
  if (currentView === "login" || currentView === "register" || currentView === "forgot-password") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md">
          {currentView === "login" && (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchMode={(m) => setCurrentView(m)}
              onCancel={() => setCurrentView(currentUser ? "generator" : "landing")}
            />
          )}
          {currentView === "register" && (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchMode={(m) => setCurrentView(m)}
              onCancel={() => setCurrentView(currentUser ? "generator" : "landing")}
            />
          )}
          {currentView === "forgot-password" && (
            <ForgotPasswordForm
              onSwitchMode={(m) => setCurrentView(m)}
              onCancel={() => setCurrentView("login")}
            />
          )}
        </div>
      </div>
    );
  }

  // 3. Generator Console View
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start p-4 sm:p-8 font-sans">
      <div className="w-full max-w-3xl space-y-6">
        {/* Top Header Bar with Auth status */}
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Squizme Generator
                </h1>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                  Console
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Asynchronous Multi-Model AI Quiz Synthesizer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("landing")}
              className="text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Home className="h-3.5 w-3.5" />
              Landing
            </Button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <Badge variant="secondary" className="gap-1 font-mono text-xs">
                  <User className="h-3 w-3" />
                  {currentUser.username}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <LogOut className="h-3 w-3" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 border-l border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentView("login")}
                  className="text-xs gap-1 cursor-pointer"
                >
                  <LogIn className="h-3 w-3" />
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCurrentView("register")}
                  className="text-xs gap-1 cursor-pointer"
                >
                  <UserPlus className="h-3 w-3" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Input Configuration Card */}
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wide">
              Quiz Generation Parameters
            </CardTitle>
            <CardDescription className="text-xs">
              Configure pedagogical topic, question volume, and cognitive difficulty
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Prompt Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="prompt-input" className="text-muted-foreground font-medium">
                  Prompt / Curriculum Focus
                </label>
                <span
                  className={`font-mono text-[11px] ${
                    isPromptValid ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {promptCharCount} / 20 min chars
                </span>
              </div>
              <Textarea
                id="prompt-input"
                placeholder="e.g. Modern TypeScript advanced type system, template literal types, conditional types, and distributed union inference with practical software architecture examples"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={Boolean(isJobActive)}
                className={`min-h-[110px] text-sm resize-y font-sans transition-colors ${
                  prompt.length > 0 && !isPromptValid
                    ? "border-destructive/50 focus-visible:ring-destructive/30"
                    : ""
                }`}
              />
              {prompt.length > 0 && !isPromptValid && (
                <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  Prompt must be at least 20 characters long.
                </p>
              )}
            </div>

            {/* Parameter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Question Count */}
              <div className="space-y-1">
                <label
                  htmlFor="question-count-input"
                  className="text-xs text-muted-foreground font-medium"
                >
                  Question Count
                </label>
                <input
                  id="question-count-input"
                  type="number"
                  min={0}
                  max={50}
                  value={questionCount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setQuestionCount("");
                    } else {
                      const num = parseInt(val, 10);
                      setQuestionCount(isNaN(num) ? "" : num);
                    }
                  }}
                  disabled={Boolean(isJobActive)}
                  className={`w-full rounded-md border bg-background px-3 py-1.5 text-sm font-mono shadow-sm focus:outline-none focus:ring-1 ${
                    !isQuestionCountValid
                      ? "border-destructive text-destructive focus:ring-destructive"
                      : "border-input text-foreground focus:ring-ring"
                  }`}
                />
                {isQuestionCountBelowMin && (
                  <p className="text-[11px] text-destructive">At least 5 questions</p>
                )}
                {isQuestionCountAboveMax && (
                  <p className="text-[11px] text-destructive">Question count cannot exceed 50.</p>
                )}
              </div>

              {/* Difficulty */}
              <div className="space-y-1">
                <label
                  htmlFor="difficulty-select"
                  className="text-xs text-muted-foreground font-medium"
                >
                  Difficulty
                </label>
                <select
                  id="difficulty-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as GenerationDifficulty)}
                  disabled={Boolean(isJobActive)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="mixed_easy_medium">Mixed (Easy & Medium)</option>
                  <option value="hard">Hard</option>
                  <option value="mixed_medium_hard">Mixed (Medium & Hard)</option>
                </select>
              </div>

              {/* Mode */}
              <div className="space-y-1">
                <label htmlFor="mode-select" className="text-xs text-muted-foreground font-medium">
                  Mode
                </label>
                <select
                  id="mode-select"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as "learning" | "assessment")}
                  disabled={Boolean(isJobActive)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="assessment">Assessment</option>
                  <option value="learning">Learning</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={
                  !isPromptValid ||
                  !isQuestionCountValid ||
                  !prompt.trim() ||
                  isSubmitting ||
                  Boolean(isJobActive)
                }
                className="gap-2 cursor-pointer font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Start Generation
                  </>
                )}
              </Button>

              {isJobActive && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={isCancelling || jobStatus?.status === "cancel_requested"}
                  className="gap-2 cursor-pointer"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Cancelling...
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4" /> Cancel Job
                    </>
                  )}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleCheckActive}
                disabled={isCheckingActive}
                className="gap-2 text-xs cursor-pointer ml-auto"
              >
                {isCheckingActive ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                Check Active Job
              </Button>

              {(rawOutput || jobStatus) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClear}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Notification */}
        {(errorMessage || (jobStatus?.status === "failed" && jobStatus.error?.message)) && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3.5 flex items-center gap-3 text-destructive-foreground text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="font-mono font-medium">
              {errorMessage || jobStatus?.error?.message}
            </p>
          </div>
        )}

        {/* Active Job Progress Strip */}
        {jobStatus && (
          <Card className="border-border bg-card/40">
            <CardContent className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Job ID:</span>
                <span className="font-mono text-foreground font-semibold">{jobStatus.jobId}</span>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <span className="text-muted-foreground mr-1.5">Batches:</span>
                  <span className="font-mono font-medium">
                    {jobStatus.completedBatches} / {jobStatus.totalBatches}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground mr-1.5">Questions:</span>
                  <span className="font-mono font-medium">
                    {jobStatus.acceptedQuestionCount} / {jobStatus.plannedQuestionCount}
                  </span>
                </div>
                <Badge
                  variant={getStatusBadgeVariant(jobStatus.status) as "default"}
                  className="capitalize font-mono text-[10px]"
                >
                  {jobStatus.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Raw Output Display */}
        <Card className="border-border bg-card/90">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between border-b border-border/60">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-xs uppercase font-mono tracking-wider text-muted-foreground">
                Raw Output (JSON)
              </CardTitle>
            </div>

            {Boolean(rawOutput) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyRaw}
                className="gap-1.5 h-7 text-xs cursor-pointer font-mono"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-primary" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" /> Copy JSON
                  </>
                )}
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-4">
            <pre className="font-mono text-xs overflow-x-auto max-h-[420px] rounded-md bg-muted/20 p-3 border border-border/40 text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {rawOutput
                ? JSON.stringify(rawOutput, null, 2)
                : '// Output from "Start Generation" or "Check Active Job" will appear here.\n// Polling updates every 1.5s during background inference.'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
