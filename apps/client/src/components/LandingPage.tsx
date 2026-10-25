import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  Cpu,
  Layers,
  LogIn,
  Shuffle,
  Sparkles,
  UserPlus,
  Zap,
} from "lucide-react";

interface LandingPageProps {
  onOpenAuth: (mode: "login" | "register") => void;
  onOpenGenerator: () => void;
  isAuthenticated: boolean;
  username?: string;
  onLogout?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onOpenGenerator,
  isAuthenticated,
  username,
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-sm">
              S
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-base">Squizme</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                v1.0
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <div className="text-xs text-muted-foreground mr-1">
                  Signed in as <span className="font-semibold text-foreground">{username}</span>
                </div>
                <Button
                  size="sm"
                  onClick={onOpenGenerator}
                  className="gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <BrainCircuit className="h-3.5 w-3.5" />
                  Quiz Console
                </Button>
                {onLogout && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLogout}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Log Out
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenAuth("login")}
                  className="gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => onOpenAuth("register")}
                  className="gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
        <Badge
          variant="secondary"
          className="mb-5 px-3 py-1 text-xs font-medium rounded-full gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Autonomous AI Assessment Engine
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl leading-[1.15]">
          Generate high-precision quizzes with verified pedagogical depth.
        </h1>

        <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Asynchronous multi-model inference pipeline powered by Groq. Deterministic curriculum
          decomposition, strict mathematical slot planning, and 5-tier difficulty calibration.
        </p>

        {/* CTA Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <Button
              size="lg"
              onClick={onOpenGenerator}
              className="gap-2 px-6 text-sm font-semibold cursor-pointer shadow-md"
            >
              <Zap className="h-4 w-4" />
              Launch Quiz Generator
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                onClick={() => onOpenAuth("register")}
                className="gap-2 px-6 text-sm font-semibold cursor-pointer shadow-md"
              >
                <UserPlus className="h-4 w-4" />
                Create Account
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onOpenAuth("login")}
                className="gap-2 px-6 text-sm font-medium cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Layers className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">
                Deterministic Curriculum Planning
              </CardTitle>
              <CardDescription className="text-xs">
                Decomposes subjects into 2–6 balanced subtopics with strict arithmetic total
                allocations.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Fast curriculum decomposition via specialized planning models before batch questions
              are synthesized.
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Cpu className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">
                5-Tier Pedagogical Calibration
              </CardTitle>
              <CardDescription className="text-xs">
                From foundational definitions to deep architectural failure mode analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Supports Easy, Medium, Mixed (Easy & Medium), Hard, and Mixed (Medium & Hard) with
              tailored directives.
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Shuffle className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">
                Anti-Bias Question Shuffling
              </CardTitle>
              <CardDescription className="text-xs">
                Fisher-Yates randomization eliminates positional bias and interleaves topics.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Evenly distributes correct option positions across A, B, C, D and prevents predictable
              topic clusters.
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} Squizme. Modular AI Assessment.</span>
          <span className="font-mono text-[11px]">Ports: 8000 (UI) &bull; 8001 (API)</span>
        </div>
      </footer>
    </div>
  );
};
