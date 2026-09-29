import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { DashboardPage } from './pages/Dashboard';
import { AuthPage } from './pages/Auth';
import { QuizBuilderPage } from './pages/QuizBuilder';
import { QuizPlayerPage } from './pages/QuizPlayer';
import { AttemptReviewPage } from './pages/AttemptReview';
import { AboutPage } from './pages/About';
import { PrivacyPolicyPage } from './pages/PrivacyPolicy';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar onOpenApiKeyModal={() => setApiKeyModalOpen(true)} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <Routes>
          <Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/quizzes/new" element={<ProtectedRoute><QuizBuilderPage /></ProtectedRoute>} />
          <Route path="/quizzes/:id/play" element={<ProtectedRoute><QuizPlayerPage /></ProtectedRoute>} />
          <Route path="/attempts/:id" element={<ProtectedRoute><AttemptReviewPage /></ProtectedRoute>} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 py-8 mt-12 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div>
            <span>© {new Date().getFullYear()} Squizme. Built with Google Gemini & TypeScript.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/about" className="hover:text-teal-600 dark:hover:text-teal-400 transition font-medium">About</Link>
            <Link to="/privacy" className="hover:text-teal-600 dark:hover:text-teal-400 transition font-medium">Privacy & Policies</Link>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="hover:text-teal-600 dark:hover:text-teal-400 transition font-medium"
            >
              Google AI Studio
            </a>
          </div>
        </div>
      </footer>

      <ApiKeyModal isOpen={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
