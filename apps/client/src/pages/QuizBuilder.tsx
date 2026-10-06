import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Upload,
  FileText,
  Search,
  Sparkles,
  AlertTriangle,
  Clock,
  BookOpen,
  X,
  Layers,
  Gauge
} from 'lucide-react';
import { getLocalApiKey } from '../utils/crypto';

export const QuizBuilderPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'prompt' | 'document'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [researchEnabled, setResearchEnabled] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const maxAllowedQuestions = user?.hasCustomKey ? 50 : 10;
  const [questionCount, setQuestionCount] = useState<number>(Math.max(5, Math.min(10, maxAllowedQuestions)));
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [depth, setDepth] = useState<'foundational' | 'in_depth'>('foundational');
  const [quizMode, setQuizMode] = useState<'learning' | 'exam'>('learning');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 20 * 1024 * 1024) {
      setError('File exceeds 20MB limit. Please upload a smaller document.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoadingStage(mode === 'document' ? 'Extracting document text...' : 'Researching topic concepts...');

    try {
      const localKey = await getLocalApiKey();
      const customHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`
      };
      if (localKey) {
        customHeaders['x-gemini-api-key'] = localKey;
      }

      let res: Response;

      if (mode === 'document') {
        if (!file) throw new Error('Please select a PDF or DOCX file to upload.');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('data', JSON.stringify({
          questionCount,
          difficulty,
          depth,
          settings: {
            mode: quizMode,
            timeLimitMinutes
          }
        }));

        setLoadingStage('Generating structured questions with Gemini...');
        res = await fetch('/api/generator/generate', {
          method: 'POST',
          headers: customHeaders,
          body: formData
        });
      } else {
        if (!prompt.trim()) throw new Error('Please enter a topic prompt.');
        setLoadingStage(researchEnabled ? 'Searching the web for latest facts...' : 'Structuring questions with Gemini...');
        res = await fetch('/api/generator/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...customHeaders
          },
          body: JSON.stringify({
            prompt,
            researchEnabled,
            questionCount,
            difficulty,
            depth,
            settings: {
              mode: quizMode,
              timeLimitMinutes
            }
          })
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Quiz generation failed.');
      }

      navigate(`/quizzes/${data.id}/play`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">Create AI Quiz</h1>
        <p className="text-sm sm:text-base text-brand-secondary mt-1">
          Synthesize structured, pedagogical assessments from raw documents or research topics with Gemini 3.8 Flash.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-7 transition-colors">
        {/* Source Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-brand-elevated rounded-2xl border border-brand-border">
          <button
            type="button"
            onClick={() => setMode('prompt')}
            className={`py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 ${
              mode === 'prompt'
                ? 'bg-brand-card text-brand-text shadow-sm border border-brand-border'
                : 'text-brand-secondary hover:text-brand-text'
            }`}
          >
            <Sparkles className="w-4 h-4 text-brand-ai" />
            <span>From Topic Prompt</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('document')}
            className={`py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 ${
              mode === 'document'
                ? 'bg-brand-card text-brand-text shadow-sm border border-brand-border'
                : 'text-brand-secondary hover:text-brand-text'
            }`}
          >
            <Upload className="w-4 h-4 text-brand-ai" />
            <span>From Document (PDF/DOCX)</span>
          </button>
        </div>

        {/* Ingestion Input Container */}
        {mode === 'prompt' ? (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-brand-text">
              Topic or Subject Prompt
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Asynchronous event loop in JavaScript, microtask queues, and process.nextTick"
              className="w-full text-sm sm:text-base p-3.5 border border-brand-border bg-brand-card text-brand-text rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-ai transition"
            />
            <label className="flex items-center gap-2.5 cursor-pointer text-sm text-brand-secondary select-none">
              <input
                type="checkbox"
                checked={researchEnabled}
                onChange={(e) => setResearchEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-brand-border text-brand-primary focus:ring-brand-ai accent-brand-primary"
              />
              <span className="flex items-center gap-1.5 font-medium text-brand-text">
                <Search className="w-4 h-4 text-brand-ai" />
                Enable Google Search grounding for real-time web verification
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-brand-text">
              Upload Single Document (PDF or DOCX, max 20MB)
            </label>
            <div className="border-2 border-dashed border-brand-border rounded-2xl p-6 sm:p-8 text-center hover:border-brand-border-strong transition cursor-pointer relative bg-brand-elevated/40">
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileText className="w-10 h-10 text-brand-muted mx-auto mb-2" />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-brand-text font-semibold text-sm sm:text-base">
                  <span>{file.name}</span>
                  <span className="text-xs text-brand-muted">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="p-1 rounded-full hover:bg-brand-elevated text-brand-muted hover:text-brand-text"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-sm text-brand-secondary">
                  <span className="font-semibold text-brand-ai">Click to upload</span> or drag and drop PDF or DOCX file
                </div>
              )}
            </div>
          </div>
        )}

        {/* Centered Question Count Slider Section */}
        <div className="p-5 sm:p-6 bg-brand-elevated border border-brand-border rounded-2xl space-y-4">
          <div className="flex flex-col items-center justify-center text-center space-y-1.5">
            <span className="text-xs uppercase tracking-wider font-bold text-brand-muted">
              Target Question Count
            </span>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-card border border-brand-border shadow-sm">
              <span className="text-2xl font-black text-brand-primary">{questionCount}</span>
              <span className="text-sm font-medium text-brand-secondary">questions</span>
            </div>
            {!user?.hasCustomKey && (
              <span className="text-xs text-brand-warning font-medium">
                Free quota cap: 10 questions per quiz (BYO Key unlocks up to 50)
              </span>
            )}
          </div>

          <div className="max-w-md mx-auto w-full px-2">
            <input
              type="range"
              min={5}
              max={maxAllowedQuestions}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 bg-brand-card rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <div className="flex justify-between text-xs text-brand-muted mt-1 font-medium">
              <span>5 min</span>
              <span>{maxAllowedQuestions} max</span>
            </div>
          </div>
        </div>

        {/* Configuration Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* Depth Selector */}
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-ai" />
              Question Depth
            </label>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value as any)}
              className="w-full text-sm px-3.5 py-2.5 border border-brand-border bg-brand-card text-brand-text rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-ai transition"
            >
              <option value="foundational">Foundational (High-level concepts & definitions)</option>
              <option value="in_depth">In-depth (Detailed mechanics & analytical problems)</option>
            </select>
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-1.5 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-brand-ai" />
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full text-sm px-3.5 py-2.5 border border-brand-border bg-brand-card text-brand-text rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-ai transition"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Quiz Execution Mode */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-brand-text mb-1.5">
              Quiz Evaluation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setQuizMode('learning')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  quizMode === 'learning'
                    ? 'border-brand-primary bg-brand-elevated text-brand-text shadow-sm'
                    : 'border-brand-border hover:border-brand-border-strong text-brand-secondary bg-brand-card'
                }`}
              >
                <BookOpen className="w-5 h-5 text-brand-ai shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-brand-text">Learning Mode</div>
                  <div className="text-xs text-brand-secondary mt-0.5">
                    Instant feedback and detailed rationale revealed after every answer check.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setQuizMode('exam')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  quizMode === 'exam'
                    ? 'border-brand-primary bg-brand-elevated text-brand-text shadow-sm'
                    : 'border-brand-border hover:border-brand-border-strong text-brand-secondary bg-brand-card'
                }`}
              >
                <Clock className="w-5 h-5 text-brand-warning shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-brand-text">Exam Mode</div>
                  <div className="text-xs text-brand-secondary mt-0.5">
                    Timed exam setting with locked hints until full submission and final scorecard.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-brand-error/10 border border-brand-error/30 text-brand-error rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-primary hover:bg-brand-hover text-brand-primary-text font-semibold text-base py-3.5 rounded-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? (
            <span>{loadingStage}</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Quiz with Gemini</span>
            </>
          )}
        </button>

        {/* Recommended Scope Policy Callout — Placed BELOW the create button for enhanced visibility */}
        <div className="bg-brand-elevated border border-brand-border rounded-2xl p-4 sm:p-5 flex gap-3.5 text-brand-secondary text-sm leading-relaxed transition-colors">
          <AlertTriangle className="w-5 h-5 text-brand-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold block text-brand-text">
              Recommended Scope Policy
            </strong>
            <p className="text-brand-secondary text-sm">
              For best question quality and accuracy, keep your topic or document scope specific (e.g. <em>"Photosynthesis light reactions"</em> rather than broad <em>"Biology"</em>). If you require questions across a broad curriculum, select <strong>"Foundational"</strong> depth so questions focus cleanly on surface principles rather than deep nested subtopics.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
