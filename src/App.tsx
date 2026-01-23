import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navigation } from '@/shared/components/Navigation';
import { Landing } from '@/modules/home/ui/pages/Landing';
import { Dashboard } from '@/modules/home/ui/pages/Dashboard';
import { SkillTree } from '@/modules/skill-tree/ui/pages/SkillTree';
import { MySkillTree } from '@/modules/skill-tree/ui/pages/MySkillTree';
import { Quiz } from '@/modules/skill-tree/ui/pages/Quiz';
import { JobRecommendation } from '@/modules/jobs/ui/pages/JobRecommendation';
import { LearningInsights } from '@/modules/skill-tree/ui/pages/LearningInsights';
import { Chat } from '@/modules/chat/ui/pages/Chat';
import { Forum } from '@/modules/forum/ui/pages/Forum';
import { SubForum } from '@/modules/forum/ui/pages/SubForum';
import { ThreadDetail } from '@/modules/forum/ui/pages/ThreadDetail';
import { CreatePost } from '@/modules/forum/ui/pages/CreatePost';
import { Timeline } from '@/modules/skill-tree/ui/pages/Timeline';
import { Profile } from '@/modules/profile/ui/pages/Profile';
import { Purchase } from '@/modules/purchase/ui/pages/Purchase';
import { PurchaseSuccess } from '@/modules/purchase/ui/pages/PurchaseSuccess';
import { Plans } from '@/modules/subscription/ui/pages/Plans';
import { LearningProgressProvider } from '@/modules/skill-tree/ui/contexts/LearningProgressContext';
import { AuthProvider, useAuth } from '@/modules/auth/AuthProvider';
import { LoginPage } from '@/modules/auth/ui/LoginPage';
import { RegisterPage } from '@/modules/auth/ui/RegisterPage';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

import { Toaster } from 'sonner';

// ... existing code ...

export default function App() {
  return (
    <LearningProgressProvider>
      <Toaster position="top-right" richColors />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/*"
                element={
                  <div className="flex h-screen w-screen overflow-hidden">
                    <Navigation />
                    <main className="flex-1 overflow-auto bg-white">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/skilltree" element={<SkillTree />} />
                        <Route path="/my-skills" element={<MySkillTree />} />
                        <Route path="/quiz" element={<Quiz />} />
                        <Route path="/jobs" element={<JobRecommendation />} />
                        <Route path="/insights" element={<LearningInsights />} />
                        <Route path="/timeline" element={<Timeline />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/chat/c/:sessionId" element={<Chat />} />
                        <Route path="/forum" element={<Forum />} />
                        <Route path="/forum/new" element={<CreatePost />} />
                        <Route path="/forum/:category" element={<SubForum />} />
                        <Route path="/thread/:id" element={<ThreadDetail />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/purchase" element={<Purchase />} />
                        <Route path="/purchase/success" element={<PurchaseSuccess />} />
                        <Route path="/plans" element={<Plans />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </main>
                  </div>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LearningProgressProvider>
  );
}
