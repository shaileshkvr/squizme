import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, FileText, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingHero: React.FC = () => {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Subtle 3D tilt: max +-7 degrees on X and Y
    const rotateY = (mouseX / (rect.width / 2)) * 7;
    const rotateX = -(mouseY / (rect.height / 2)) * 6;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6 sm:py-10">
      {/* Left Column: Catchy Tagline & Value Proposition */}
      <div className="lg:col-span-7 space-y-6 text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-[#E3EEF1] dark:bg-[#1F343B] text-[#315765] dark:text-[#B9D8E1] border border-[#DDD1C2] dark:border-[#5A3E30]">
          <Sparkles className="w-4 h-4 text-[#416A7A] dark:text-[#79AFC2]" />
          <span>Active Recall Engine · Powered by Gemini 2.5</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#24150E] dark:text-[#F8F4EB] leading-[1.12]">
          Stop re-reading notes. <br />
          <span className="text-[#5A301D] dark:text-[#C28A69]">Start proving what you know.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#69594D] dark:text-[#CFC0B1] max-w-xl leading-relaxed">
          Upload dense lecture slides, PDFs, or enter any technical topic. Squizme synthesizes rigorous assessments with instant rationales—testing deep comprehension instead of shallow trivia.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3.5 pt-2">
          <Link
            to={user ? "/quizzes/new" : "/auth?mode=register"}
            className="inline-flex items-center gap-2 bg-[#5A301D] hover:bg-[#472313] text-[#FFFDF8] dark:bg-[#C28A69] dark:hover:bg-[#D09A78] dark:text-[#1D0D00] font-semibold text-sm sm:text-base px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <span>{user ? 'Create a Quiz' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/privacy"
            className="inline-flex items-center gap-2 bg-[#FFFDF8] dark:bg-[#2A160B] hover:bg-[#F1EADF] dark:hover:bg-[#3B1E11] text-[#24150E] dark:text-[#F8F4EB] border border-[#DDD1C2] dark:border-[#5A3E30] font-semibold text-sm sm:text-base px-5 py-3 rounded-full transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-sm"
          >
            <Lock className="w-4 h-4 text-[#416A7A] dark:text-[#79AFC2]" />
            <span>Zero-Data Privacy</span>
          </Link>
        </div>

        {/* Feature Micro-Badges */}
        <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#847366] dark:text-[#A99584]">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#47705B] dark:text-[#82B99A]" />
            Client-Side Encrypted Keys
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <FileText className="w-4 h-4 text-[#416A7A] dark:text-[#79AFC2]" />
            20MB Single File Cap
          </span>
        </div>
      </div>

      {/* Right Column: 3D Mouse-Tilt Interactive Question Card */}
      <div className="lg:col-span-5 flex justify-center">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: isHovered
              ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`
              : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out'
          }}
          className="w-full max-w-md rounded-3xl bg-[#FFFDF8] dark:bg-[#2A160B] border border-[#DDD1C2] dark:border-[#5A3E30] p-6 sm:p-7 shadow-xl shadow-amber-950/5 dark:shadow-black/60 select-none cursor-default relative will-change-transform"
        >
          {/* Card Top Pill */}
          <div className="flex items-center justify-between pb-4 border-b border-[#DDD1C2] dark:border-[#5A3E30] mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#847366] dark:text-[#A99584]">
              Preview
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E3EEF1] dark:bg-[#1F343B] text-[#315765] dark:text-[#B9D8E1] border border-[#DDD1C2] dark:border-[#5A3E30]">
              Learning Mode
            </span>
          </div>

          {/* Question Prompt */}
          <h3 className="text-sm sm:text-base font-bold text-[#24150E] dark:text-[#F8F4EB] leading-snug mb-4">
            Which mechanism in the JavaScript runtime processes queued callbacks before any macro-task or UI repainting?
          </h3>

          {/* 4 Softly Rounded Radio Options */}
          <div className="space-y-2.5">
            {[
              { id: 'opt-a', label: 'A', text: 'setTimeout(callback, 0)', selected: false },
              { id: 'opt-b', label: 'B', text: 'Microtask Queue (process.nextTick / Promises)', selected: true },
              { id: 'opt-c', label: 'C', text: 'setImmediate() execution cycle', selected: false },
              { id: 'opt-d', label: 'D', text: 'requestAnimationFrame() frame sync', selected: false }
            ].map((opt) => (
              <div
                key={opt.id}
                className={`p-3 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between transition-colors ${
                  opt.selected
                    ? 'border-[#5A301D] dark:border-[#C28A69] bg-[#F1EADF] dark:bg-[#3B1E11] text-[#24150E] dark:text-[#F8F4EB]'
                    : 'border-[#DDD1C2] dark:border-[#5A3E30] bg-[#FFFDF8] dark:bg-[#2A160B] text-[#69594D] dark:text-[#CFC0B1]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      opt.selected
                        ? 'border-[#5A301D] dark:border-[#C28A69] bg-[#5A301D] dark:bg-[#C28A69]'
                        : 'border-[#DDD1C2] dark:border-[#5A3E30]'
                    }`}
                  >
                    {opt.selected && <div className="w-1.5 h-1.5 rounded-full bg-[#FFFDF8] dark:bg-[#1D0D00]" />}
                  </div>
                  <span>{opt.text}</span>
                </div>
                {opt.selected && (
                  <span className="text-xs font-bold text-[#47705B] dark:text-[#82B99A] shrink-0">
                    +1 pt
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Rationale Breakdown Box */}
          <div className="mt-4 p-3 rounded-2xl bg-[#E3EEF1]/80 dark:bg-[#1F343B]/80 border border-[#DDD1C2] dark:border-[#5A3E30] text-xs text-[#315765] dark:text-[#B9D8E1] flex gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#47705B] dark:text-[#82B99A] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Rationale:</strong> Microtasks are drained completely after the currently executing script finishes, before the event loop advances to the next task.
            </p>
          </div>

          {/* Interactive Hint */}
          <div className="text-center pt-3 text-[11px] text-[#847366] dark:text-[#A99584] italic">
            Hover and tilt to explore tactile assessment preview
          </div>
        </div>
      </div>
    </div>
  );
};
