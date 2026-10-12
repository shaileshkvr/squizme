import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  Plus,
  Send,
  Server,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface HealthStatus {
  backend: "checking" | "connected" | "error";
  db: "checking" | "connected" | "error";
  uptime?: number;
}

interface BackendTestResult {
  success: boolean;
  message: string;
  receivedPrompt: string;
  promptLength: number;
  groqConfigured: boolean;
  timestamp: string;
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<BackendTestResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [health, setHealth] = useState<HealthStatus>({
    backend: "checking",
    db: "checking",
  });

  // Fetch server health on initial mount
  const checkHealth = async () => {
    try {
      const res = await fetch("http://localhost:6001/health");
      if (res.ok) {
        const data = await res.json();
        const dbRes = await fetch("http://localhost:6001/health/db");
        setHealth({
          backend: "connected",
          db: dbRes.ok ? "connected" : "error",
          uptime: data.uptime,
        });
      } else {
        setHealth({ backend: "error", db: "error" });
      }
    } catch {
      setHealth({ backend: "error", db: "error" });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Send prompt to Fastify backend test endpoint
  const handleSendPrompt = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setTestResult(null);

    try {
      const response = await fetch("http://localhost:6001/api/generator/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server responded with ${response.status}`);
      }

      setTestResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to backend";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header Bar */}
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Squizme Generator</h1>
              <p className="text-xs text-muted-foreground">Fastify Backend • Groq SDK • shadcn UI</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={health.backend === "connected" ? "success" : "destructive"}
              className="gap-1.5"
            >
              <Server className="h-3 w-3" />
              API: {health.backend}
            </Badge>
            <Badge
              variant={health.db === "connected" ? "success" : "destructive"}
              className="gap-1.5"
            >
              <Database className="h-3 w-3" />
              DB: {health.db}
            </Badge>
          </div>
        </header>

        {/* Textarea & Input Controls via shadcn Card */}
        <Card className="border-border bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Prompt / Quiz Material</CardTitle>
                <CardDescription className="text-xs">
                  Enter topic or instructions to test data delivery to the Fastify backend.
                </CardDescription>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {prompt.length} chars
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative rounded-lg border border-input bg-background/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type quiz instructions here (e.g. 'Generate 5 questions on Distributed Systems algorithms')..."
                className="min-h-[140px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
              />

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between border-t border-border px-3 py-2 bg-muted/20">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className="gap-1.5 h-8 text-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  <span>Attach PDF</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isLoading || !prompt.trim()}
                  onClick={handleSendPrompt}
                  className="gap-1.5 h-8 text-xs cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send to Backend</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backend Response Display */}
        {testResult && (
          <Card className="border-emerald-500/30 bg-emerald-950/15">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Backend Received Data Successfully</span>
                </div>
                <Badge variant="outline" className="text-xs font-mono border-emerald-500/30 text-emerald-300">
                  {new Date(testResult.timestamp).toLocaleTimeString()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-border/40 pb-1.5 text-muted-foreground">
                <span>Received Length:</span>
                <span className="text-foreground font-mono font-medium">{testResult.promptLength} characters</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5 text-muted-foreground">
                <span>Groq SDK Initialized:</span>
                <span className={testResult.groqConfigured ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                  {testResult.groqConfigured ? "Configured with API Key" : "Ready (Awaiting API Key)"}
                </span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-muted-foreground">Backend Echo:</span>
                <p className="text-foreground bg-background/80 p-3 rounded-md border border-border whitespace-pre-wrap font-mono">
                  {testResult.receivedPrompt}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3 text-destructive-foreground text-xs">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      {/* shadcn Dialog for Uploading PDF (Disabled) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <DialogTitle>Upload PDF Document</DialogTitle>
            </div>
            <DialogDescription>
              Generate questions directly from slides or source documents.
            </DialogDescription>
          </DialogHeader>

          {/* Dropzone Area (Disabled) */}
          <div className="relative rounded-xl border-2 border-dashed border-border bg-background/60 p-6 flex flex-col items-center justify-center text-center opacity-60 cursor-not-allowed">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Drag & drop PDF here</p>
            <p className="text-xs text-muted-foreground mt-1">Supports files up to 20MB</p>

            <Badge variant="warning" className="mt-4">
              PDF Upload Disabled
            </Badge>

            <input type="file" accept=".pdf" disabled className="hidden" />
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed text-center">
            Direct PDF ingestion is currently disabled. Please paste the prompt or text excerpt directly into the textarea.
          </p>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
