import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

export const AppContent: React.FC = () => {
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onOpenApiKeyModal={() => setApiKeyModalOpen(true)} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/quizzes/new" element={<ProtectedRoute><QuizBuilderPage /></ProtectedRoute>} />
          <Route path="/quizzes/:id/play" element={<ProtectedRoute><QuizPlayerPage /></ProtectedRoute>} />
          <Route path="/attempts/:id" element={<ProtectedRoute><AttemptReviewPage /></ProtectedRoute>} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>© {new Date().getFullYear()} Squizme. Built with Google Gemini & TypeScript.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-indigo-600 transition">About</Link>
            <Link to="/privacy" className="hover:text-indigo-600 transition">Privacy & Policies</Link>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 transition"
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
