import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ArrowRight, TreeDeciduous, Brain, Target } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-violet-50/30 to-teal-50/30">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreeDeciduous className="w-6 h-6 text-violet-600" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500 font-bold text-lg">
              AI Skill Tree
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-violet-600 to-teal-500 text-white hover:opacity-90">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="mb-6 text-4xl font-extrabold text-foreground leading-tight">
              Grow Your Mind,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500">
                Branch by Branch
              </span>
            </h1>
            <p className="text-muted-foreground mb-8 text-lg max-w-lg">
              Build personalized learning roadmaps powered by AI. Track your progress,
              unlock new skills, and discover career opportunities tailored to your journey.
            </p>
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-violet-600 to-teal-500 text-white hover:opacity-90 px-8 h-12 rounded-xl text-base font-semibold"
              >
                Start Learning <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="px-8 h-12 rounded-xl text-base font-semibold">
                Learn More
              </Button>
            </div>
          </div>

          {/* Abstract Tree Illustration */}
          <div className="relative">
            <div className="relative w-full aspect-square">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Tree trunk */}
                <line x1="200" y1="380" x2="200" y2="200" stroke="url(#gradient1)" strokeWidth="8" strokeLinecap="round" />
                
                {/* Main branches */}
                <line x1="200" y1="200" x2="100" y2="100" stroke="url(#gradient1)" strokeWidth="6" strokeLinecap="round" />
                <line x1="200" y1="200" x2="300" y2="100" stroke="url(#gradient1)" strokeWidth="6" strokeLinecap="round" />
                <line x1="200" y1="200" x2="150" y2="150" stroke="url(#gradient1)" strokeWidth="5" strokeLinecap="round" />
                <line x1="200" y1="200" x2="250" y2="150" stroke="url(#gradient1)" strokeWidth="5" strokeLinecap="round" />
                
                {/* Secondary branches */}
                <line x1="100" y1="100" x2="50" y2="50" stroke="url(#gradient2)" strokeWidth="4" strokeLinecap="round" />
                <line x1="100" y1="100" x2="120" y2="40" stroke="url(#gradient2)" strokeWidth="4" strokeLinecap="round" />
                <line x1="300" y1="100" x2="350" y2="50" stroke="url(#gradient2)" strokeWidth="4" strokeLinecap="round" />
                <line x1="300" y1="100" x2="280" y2="40" stroke="url(#gradient2)" strokeWidth="4" strokeLinecap="round" />
                
                {/* Nodes */}
                <circle cx="200" cy="200" r="16" fill="#8b5cf6" opacity="0.9" />
                <circle cx="100" cy="100" r="14" fill="#14b8a6" opacity="0.9" />
                <circle cx="300" cy="100" r="14" fill="#14b8a6" opacity="0.9" />
                <circle cx="150" cy="150" r="12" fill="#8b5cf6" opacity="0.8" />
                <circle cx="250" cy="150" r="12" fill="#8b5cf6" opacity="0.8" />
                <circle cx="50" cy="50" r="10" fill="#0891b2" opacity="0.8" />
                <circle cx="120" cy="40" r="10" fill="#0891b2" opacity="0.8" />
                <circle cx="350" cy="50" r="10" fill="#0891b2" opacity="0.8" />
                <circle cx="280" cy="40" r="10" fill="#0891b2" opacity="0.8" />
                
                {/* Gradients */}
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white rounded-xl p-8 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="mb-2">AI-Powered Roadmaps</h3>
            <p className="text-muted-foreground">
              Personalized learning paths generated from your interests and skill history.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center mb-4">
              <TreeDeciduous className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="mb-2">Visual Progress Tracking</h3>
            <p className="text-muted-foreground">
              Watch your skill tree grow as you unlock new capabilities and knowledge.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 border border-border shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-teal-50 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="mb-2">Career Alignment</h3>
            <p className="text-muted-foreground">
              Discover job opportunities that match your growing skill set.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
