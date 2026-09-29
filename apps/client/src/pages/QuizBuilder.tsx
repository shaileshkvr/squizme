import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, Search, Sparkles, AlertTriangle, Clock, BookOpen } from 'lucide-react';

export const QuizBuilderPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'prompt' | 'document'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [researchEnabled, setResearchEnabled] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const maxAllowedQuestions = user?.hasCustomKey ? 50 : 10;
  const [questionCount, setQuestionCount] = useState(Math.min(10, maxAllowedQuestions));
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
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      } else {
        if (!prompt.trim()) throw new Error('Please enter a topic prompt.');
        setLoadingStage(researchEnabled ? 'Searching the web for latest facts...' : 'Structuring questions with Gemini...');
        res = await fetch('/api/generator/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create AI Quiz</h1>
        <p className="text-sm text-slate-600">Upload lecture material or research topics directly with Google Gemini.</p>
      </div>

      {/* Scope Recommendation Callout */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 text-xs leading-relaxed">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-1">Recommended Scope Policy</strong>
          For optimal question quality, keep your topic or document focused (e.g. <em>"Photosynthesis light reactions"</em> rather than broad <em>"Biology"</em>). If you require questions on a wide topic, select <strong>"Foundational"</strong> depth below so questions focus on core principles.
        </div>
      </div>

      <form onSubmit={handleGenerate} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        {/* Source Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('prompt')}
            className={`py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition cursor-pointer ${
              mode === 'prompt' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            From Topic Prompt
          </button>
          <button
            type="button"
            onClick={() => setMode('document')}
            className={`py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition cursor-pointer ${
              mode === 'document' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            From Document (PDF/DOCX)
          </button>
        </div>

        {mode === 'prompt' ? (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">Topic Prompt</label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Asynchronous event loop in JavaScript and microtask queues"
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={researchEnabled}
                onChange={(e) => setResearchEnabled(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-indigo-600" />
                Enable Google Search grounding to fetch live web sources
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">Upload Single Document (Max 20MB)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              {file ? (
                <div className="text-sm font-medium text-indigo-600">{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</div>
              ) : (
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop PDF / DOCX
                </div>
              )}
            </div>
          </div>
        )}

        {/* Configuration Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Number of Questions: {questionCount}
              {!user?.hasCustomKey && <span className="text-amber-600 font-normal ml-1">(Free limit: 10)</span>}
            </label>
            <input
              type="range"
              min={3}
              max={maxAllowedQuestions}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Question Depth</label>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value as any)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="foundational">Foundational (High-level principles & definitions)</option>
              <option value="in_depth">In-depth (Nuanced mechanics & analytical problems)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quiz Execution Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQuizMode('learning')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
                  quizMode === 'learning' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                Learning Mode
              </button>
              <button
                type="button"
                onClick={() => setQuizMode('exam')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
                  quizMode === 'exam' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                Exam Mode
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
      </form>
    </div>
  );
};
