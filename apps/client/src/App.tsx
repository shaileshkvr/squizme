import { useEffect, useRef, useState } from "react";
import type {
  GenerationDifficulty,
  GenerationRequest,
  JobStatusResponse,
} from "@squizme/shared";
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  Play,
  Search,
  Square,
  Terminal,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = "/api";

export default function App() {
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

  useEffect(() => {
    return () => stopPolling();
  }, []);

  // Poll single job status
  const pollJob = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/quiz-generations/${id}`);
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

  const isPromptValid = prompt.trim().length >= 20;

  const isQuestionCountValid =
    typeof questionCount === "number" &&
    !isNaN(questionCount) &&
    questionCount >= 5 &&
    questionCount <= 50;

  const isQuestionCountBelowMin =
    typeof questionCount === "number" && !isNaN(questionCount) && questionCount < 5;

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
      const res = await fetch(`${API_BASE}/quiz-generations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`${API_BASE}/quiz-generations/${targetJobId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      setRawOutput(data);
      await pollJob(targetJobId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error cancelling job";
      setErrorMessage(msg);
      setRawOutput({ error: msg });
    } finally {
      setIsCancelling(false);
    }
  };

  // Query server for any active job (recovery or status check)
  const handleCheckActive = async () => {
    setIsCheckingActive(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${API_BASE}/quiz-generations/active`);
      if (res.status === 404) {
        setErrorMessage("No active generation job currently running.");
        setRawOutput({ message: "No active generation job found for user." });
        return;
      }

      const data: JobStatusResponse = await res.json();
      setJobId(data.jobId);
      setJobStatus(data);
      setRawOutput(data);
      startPolling(data.jobId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error querying active job";
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start p-4 sm:p-8 font-sans">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header Bar */}
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Squizme Generator API Test Bench
              </h1>
              <p className="text-xs text-muted-foreground">
                Temporary Test Harness • Asynchronous Engine • Raw API Inspection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {jobStatus && (
              <Badge variant={getStatusBadgeVariant(jobStatus.status)} className="capitalize font-mono">
                {jobStatus.status}
              </Badge>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCheckActive}
              disabled={isCheckingActive}
              className="gap-1.5 h-8 text-xs cursor-pointer"
            >
              {isCheckingActive ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span>Check Active</span>
            </Button>
          </div>
        </header>

        {/* Form Controls */}
        <Card className="border-border bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quiz Generation Prompt</CardTitle>
            <CardDescription className="text-xs">
              Enter quiz topic, instructions, or raw content. Submission dispatches a background job.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. '10 multiple-choice questions on Distributed Consensus Algorithms (Raft, Paxos, PBFT)'"
                className="min-h-[120px] font-mono text-sm resize-y"
              />
              <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                {prompt.length > 0 && !isPromptValid ? (
                  <span className="text-amber-400">
                    Prompt must be at least 20 characters ({prompt.trim().length}/20)
                  </span>
                ) : (
                  <span />
                )}
                <span className="text-muted-foreground ml-auto">
                  {prompt.trim().length} chars
                </span>
              </div>
            </div>

            {/* Parameter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-medium">
                  Question Count
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={questionCount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setQuestionCount("");
                    } else {
                      const parsed = parseInt(val, 10);
                      setQuestionCount(isNaN(parsed) ? "" : parsed);
                    }
                  }}
                  className={`w-full h-9 rounded-md border bg-background/50 px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 font-mono transition-colors ${
                    !isQuestionCountValid
                      ? "border-amber-500/70 focus:ring-amber-500 text-amber-200"
                      : "border-input focus:ring-ring"
                  }`}
                />
                {(isQuestionCountBelowMin || questionCount === "") && (
                  <p className="text-[11px] text-amber-400 mt-1 font-mono">
                    At least 5 questions
                  </p>
                )}
                {isQuestionCountAboveMax && (
                  <p className="text-[11px] text-amber-400 mt-1 font-mono">
                    Question count cannot exceed 50.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-medium">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as GenerationDifficulty)}
                  className="w-full h-9 rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="mixed_easy_medium">Mixed (Easy & Medium)</option>
                  <option value="hard">Hard</option>
                  <option value="mixed_medium_hard">Mixed (Medium & Hard)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1 font-medium">
                  Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as "learning" | "assessment")}
                  className="w-full h-9 rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                >
                  <option value="assessment">Assessment</option>
                  <option value="learning">Learning</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    isSubmitting ||
                    !isPromptValid ||
                    Boolean(isJobActive) ||
                    !isQuestionCountValid
                  }
                  onClick={handleSubmit}
                  className="gap-1.5 h-9 text-xs cursor-pointer font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Submit Job</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={!isJobActive || isCancelling}
                  onClick={handleCancel}
                  className="gap-1.5 h-9 text-xs cursor-pointer font-medium"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <Square className="h-3.5 w-3.5 fill-current" />
                      <span>Cancel Job</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {Boolean(rawOutput) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Notification */}
        {errorMessage && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3.5 flex items-center gap-3 text-destructive-foreground text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="font-mono">{errorMessage}</p>
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
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-muted-foreground" />
                    <span>Copy JSON</span>
                  </>
                )}
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {rawOutput ? (
              <pre className="p-4 text-xs font-mono overflow-x-auto max-h-[460px] text-foreground/90 whitespace-pre leading-relaxed select-text">
                {JSON.stringify(rawOutput, null, 2)}
              </pre>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground font-mono">
                No output yet. Enter a prompt and submit to view live API response payload.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
