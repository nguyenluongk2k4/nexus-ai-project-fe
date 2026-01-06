import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from '@/shared/components/Navigation';
import { Landing } from '@/modules/home/ui/pages/Landing';
import { Dashboard } from '@/modules/home/ui/pages/Dashboard';
import { SkillTree } from '@/modules/skill-tree/ui/pages/SkillTree';
import { Quiz } from '@/modules/skill-tree/ui/pages/Quiz';
import { JobRecommendation } from '@/modules/jobs/ui/pages/JobRecommendation';
import { LearningInsights } from '@/modules/skill-tree/ui/pages/LearningInsights';
import { Chat } from '@/modules/chat/ui/pages/Chat';
import { Forum } from '@/modules/forum/ui/pages/Forum';
import { SubForum } from '@/modules/forum/ui/pages/SubForum';
import { ThreadDetail } from '@/modules/forum/ui/pages/ThreadDetail';
import { Timeline } from '@/modules/skill-tree/ui/pages/Timeline';
import { LearningProgressProvider } from '@/modules/skill-tree/ui/contexts/LearningProgressContext';

export default function App() {
  return (
    <LearningProgressProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />
          
          {/* App Shell with Navigation */}
          <Route
            path="/*"
            element={
              <div className="flex h-screen w-screen overflow-hidden">
                <Navigation />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/skilltree" element={<SkillTree />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/jobs" element={<JobRecommendation />} />
                    <Route path="/insights" element={<LearningInsights />} />
                    <Route path="/timeline" element={<Timeline />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/forum/:category" element={<SubForum />} />
                    <Route path="/thread/:id" element={<ThreadDetail />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </LearningProgressProvider>
  );
}
