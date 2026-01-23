import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import {
  ArrowRight, TreeDeciduous, Brain, Target, Sparkles, ChevronDown,
  Mail, Twitter, Github, Linkedin, Award, Check, Code, Flower2,
  Key, TrendingUp, Quote, Flag
} from 'lucide-react';
import { useState } from 'react';

export function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-purple-200/50 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-0 w-[600px] h-[600px] bg-pink-100/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] bg-violet-200/40 rounded-full mix-blend-multiply filter blur-[140px] opacity-70 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-md bg-white/70 rounded-full px-6 py-3 flex justify-between items-center shadow-lg border border-white/60">
            <div className="flex items-center gap-2">
              <TreeDeciduous className="w-7 h-7 text-violet-600" />
              <span className="font-bold text-xl text-slate-900 tracking-tight">NexusAI</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-sm font-medium hover:text-violet-600 transition-colors">
                Sign in
              </button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-all shadow-lg hover:shadow-violet-500/50"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10 space-y-8">
              <h1 className="font-bold text-6xl md:text-7xl leading-[1.1] text-slate-900">
                Elevate Your Mind Through <span className="italic bg-gradient-to-r from-violet-600 to-amber-600 bg-clip-text text-transparent">AI-Driven Mastery.</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-lg leading-relaxed font-light">
                Build personalized learning roadmaps powered by advanced AI. Track your progress, unlock new skills, and discover career opportunities tailored to your unique journey.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="relative group overflow-hidden px-8 py-4 rounded-full bg-violet-600 text-white font-medium shadow-xl hover:shadow-violet-500/50 transition-all transform hover:-translate-y-1"
                >
                  <span className="flex items-center gap-2">
                    <span>Start Learning Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button className="px-8 py-4 rounded-full border border-slate-300 font-medium hover:bg-white/50 backdrop-blur-sm transition-all text-slate-900">
                  Learn More
                </button>
              </div>
              <div className="flex items-center gap-4 pt-4 text-sm text-slate-500">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-violet-500 to-purple-500"></div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-teal-500 to-cyan-500"></div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-pink-500 to-rose-500"></div>
                </div>
                <p className="font-medium">Trusted by 10,000+ Learners</p>
              </div>
            </div>

            {/* Enhanced Tree Visualization */}
            <div className="relative z-10 h-[500px] lg:h-[650px] flex items-center justify-center">
              <div className="absolute inset-0 bg-violet-500/20 blur-[120px] rounded-full scale-75 animate-pulse"></div>
              <div className="relative w-full h-full max-w-[600px] mx-auto">
                <svg className="w-full h-full drop-shadow-[0_0_30px_rgba(124,58,237,0.3)]" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="trunkGrad" x1="0.5" y1="1" x2="0.5" y2="0">
                      <stop offset="0%" stopColor="#4C1D95" stopOpacity="0" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <path d="M250,500 C250,420 250,380 250,300" fill="none" stroke="url(#trunkGrad)" strokeWidth="4" strokeLinecap="round" />
                  <path d="M250,300 C250,220 180,240 140,180" fill="none" opacity="0.6" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
                  <path d="M250,300 C250,220 320,240 360,180" fill="none" opacity="0.6" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
                  <path d="M250,300 C250,240 250,200 250,140" fill="none" opacity="0.6" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />

                  <circle className="animate-pulse" cx="250" cy="300" r="10" fill="#6D28D9" filter="url(#glow)" stroke="#DDD6FE" strokeWidth="2" />
                  <circle cx="140" cy="180" r="8" fill="#7C3AED" stroke="#DDD6FE" strokeWidth="1.5" />
                  <circle cx="360" cy="180" r="8" fill="#7C3AED" stroke="#DDD6FE" strokeWidth="1.5" />
                  <circle cx="250" cy="140" r="8" fill="#7C3AED" stroke="#DDD6FE" strokeWidth="1.5" />
                  <circle cx="70" cy="80" r="6" fill="#F472B6" filter="url(#glow)" />
                  <circle cx="430" cy="80" r="6" fill="#F472B6" filter="url(#glow)" />
                  <circle cx="230" cy="40" r="5" fill="#A78BFA" filter="url(#glow)" />
                  <circle cx="270" cy="40" r="5" fill="#A78BFA" filter="url(#glow)" />
                </svg>

                {/* Floating Achievement Cards */}
                <div className="absolute top-[20%] right-0 backdrop-blur-md bg-white/70 p-4 rounded-xl shadow-lg animate-float border border-white/50" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Skill Unlocked</p>
                      <p className="text-sm font-bold text-slate-900">Neural Networks</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-[20%] left-0 backdrop-blur-md bg-white/70 p-4 rounded-xl shadow-lg animate-float border border-white/50" style={{ animationDelay: '2.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Progress</p>
                      <p className="text-sm font-bold text-slate-900">+240 XP Gained</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-20 -mt-20 mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '10k+', label: 'Active Learners' },
              { num: '50k+', label: 'Skills Unlocked' },
              { num: '95%', label: 'Success Rate' }
            ].map((stat, i) => (
              <div key={i} className="backdrop-blur-md bg-white/70 p-8 rounded-2xl text-center shadow-xl transform hover:-translate-y-2 transition-all duration-500 border-t border-white/80">
                <h3 className="font-bold text-5xl text-slate-900 mb-2">{stat.num}</h3>
                <p className="text-slate-500 font-medium tracking-wide uppercase text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-violet-600 font-bold tracking-[0.2em] text-xs uppercase mb-4 block">How It Works</span>
            <h2 className="font-bold text-4xl md:text-5xl text-slate-900 mb-6">Your Personalized Learning Path</h2>
            <p className="text-slate-600 text-lg font-light">Start your personalized learning journey in just four simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { icon: Flag, step: 'STEP 01', title: 'Tell Us Your Goals', desc: 'Share your interests, career aspirations, and current level.' },
              { icon: Brain, step: 'STEP 02', title: 'AI Creates Path', desc: 'Our AI analyzes and generates a bespoke curriculum for you.' },
              { icon: Flower2, step: 'STEP 03', title: 'Learn & Grow', desc: 'Follow your path and watch your skill tree bloom.' },
              { icon: Key, step: 'STEP 04', title: 'Unlock Opportunities', desc: 'Discover jobs matching your new capabilities.' }
            ].map((item, i) => (
              <div key={i} className="text-center group relative">
                <div className="w-24 h-24 mx-auto backdrop-blur-md bg-white/70 rounded-full flex items-center justify-center mb-8 shadow-lg group-hover:shadow-violet-500/50 group-hover:scale-110 transition-all duration-500">
                  <item.icon className="w-10 h-10 text-slate-700 group-hover:text-violet-600 transition-colors" />
                </div>
                <span className="text-xs font-bold text-violet-600 mb-3 block tracking-wider">{item.step}</span>
                <h3 className="font-bold text-xl mb-3 text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl md:text-5xl text-slate-900 mb-4">Why Choose NexusAI?</h2>
            <p className="text-slate-600 font-light text-lg">Everything you need to accelerate your journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* Large Feature Card - AI Roadmap */}
            <div className="col-span-1 md:col-span-4 md:row-span-2 backdrop-blur-md bg-white/70 rounded-3xl p-10 border border-white/60 hover:shadow-2xl transition-all">
              <Brain className="w-14 h-14 text-violet-600 mb-6" />
              <h3 className="font-bold text-3xl text-slate-900 mb-4">AI-Powered Roadmaps</h3>
              <p className="text-slate-600 max-w-md text-lg mb-8">Our AI analyzes millions of job descriptions to build dynamic, adaptive roadmaps that evolve as you do.</p>

              {/* Enhanced Roadmap Visualization */}
              <div className="relative h-64 w-full bg-white/50 rounded-xl border border-white/50 p-8 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#2DD4BF" />
                    </linearGradient>
                  </defs>

                  {/* Path Lines */}
                  <path d="M40,100 L100,100" stroke="#7C3AED" strokeWidth="3" />
                  <path d="M100,100 Q130,100 150,70" stroke="#7C3AED" strokeWidth="3" />
                  <path d="M150,70 L220,70" stroke="url(#pathGrad)" strokeWidth="3" />
                  <path d="M220,70 L300,70" stroke="#2DD4BF" strokeWidth="3" className="animate-pulse" />
                  <path d="M300,70 Q330,70 350,50" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,4" />
                  <path d="M300,70 Q330,70 350,130" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,4" />

                  {/* Nodes */}
                  <circle cx="40" cy="100" r="14" fill="#7C3AED">
                    <title>Start</title>
                  </circle>
                  <circle cx="100" cy="100" r="16" fill="white" stroke="#7C3AED" strokeWidth="3">
                    <title>Completed</title>
                  </circle>
                  <circle cx="150" cy="70" r="14" fill="#7C3AED">
                    <title>In Progress</title>
                  </circle>
                  <circle cx="220" cy="70" r="14" fill="#8B5CF6">
                    <title>Next Up</title>
                  </circle>

                  {/* Current Node - Highlighted */}
                  <g>
                    <circle className="animate-ping" cx="300" cy="70" r="20" fill="none" stroke="#2DD4BF" strokeWidth="2" opacity="0.4" />
                    <circle className="animate-pulse" cx="300" cy="70" r="20" fill="white" stroke="#2DD4BF" strokeWidth="4" />
                    <circle cx="300" cy="70" r="10" fill="#2DD4BF" />
                  </g>

                  {/* Future Nodes */}
                  <circle cx="350" cy="50" r="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
                  <circle cx="350" cy="130" r="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />

                  {/* Check mark in completed node */}
                  <path d="M95,100 L98,103 L105,96" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Live label */}
                  <rect x="280" y="40" width="80" height="16" rx="8" fill="#0F172A" opacity="0.8" />
                  <circle cx="288" cy="48" r="2" fill="#22C55E" />
                  <text x="295" y="51" fontSize="10" fill="white" fontWeight="bold">LIVE PATH</text>
                </svg>
              </div>
            </div>

            {/* Small Feature Cards */}
            <div className="col-span-1 md:col-span-2 backdrop-blur-md bg-white/70 rounded-3xl p-8 border border-white/60 hover:shadow-2xl transition-all">
              <TrendingUp className="w-12 h-12 text-purple-600 mb-6" />
              <h3 className="font-bold text-xl text-slate-900 mb-2">Visual Progress</h3>
              <p className="text-sm text-slate-600 mb-6">Watch your skill tree grow in real-time.</p>
              <div className="h-24 w-full flex items-end justify-between gap-2">
                {[30, 50, 40, 70, 60].map((h, i) => (
                  <div key={i} className={`w-full bg-violet-${300 + i * 100} rounded-t-sm transition-all duration-700`} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 backdrop-blur-md bg-white/70 rounded-3xl p-8 border border-white/60 hover:shadow-2xl transition-all">
              <Target className="w-12 h-12 text-amber-600 mb-6" />
              <h3 className="font-bold text-xl text-slate-900 mb-2">Career Alignment</h3>
              <p className="text-sm text-slate-600 mb-4">Map skills to open roles.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 border border-white/50">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-xs flex items-center justify-center">G</div>
                  <div className="h-2 w-16 bg-slate-200 rounded-full" />
                  <span className="ml-auto text-xs font-bold text-green-600">98%</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 border border-white/50 opacity-70">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-xs flex items-center justify-center">N</div>
                  <div className="h-2 w-12 bg-slate-200 rounded-full" />
                  <span className="ml-auto text-xs font-bold text-slate-400">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl text-slate-900 mb-4">What Our Learners Say</h2>
            <p className="text-slate-600">Join a community of success stories.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Chen', role: 'Data Scientist @ TechCorp', quote: 'AI Skill Tree helped me transition to data science in just 3 months. The personalized roadmap was exactly what I needed.' },
              { name: 'Michael Rodriguez', role: 'Full Stack Engineer', quote: 'The visual progress tracking keeps me motivated. Watching the tree grow is incredibly satisfying and rewarding.' },
              { name: 'Emily Watson', role: 'Product Designer', quote: 'Finally, a learning platform that understands the flow. No fluff, just direct recommendations that lead to results.' }
            ].map((testimonial, i) => (
              <div key={i} className="backdrop-blur-md bg-white/70 p-10 rounded-2xl border border-white/60 hover:shadow-2xl transition-all">
                <Quote className="w-10 h-10 text-violet-600 mb-6" />
                <p className="text-slate-600 italic leading-relaxed text-lg mb-6 font-serif">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-teal-500" />
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">{testimonial.name}</h4>
                    <p className="text-xs text-violet-600 font-bold uppercase tracking-wide">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 max-w-4xl mx-auto px-4">
        <h2 className="font-bold text-3xl md:text-4xl text-center text-slate-900 mb-2">Frequently Asked Questions</h2>
        <p className="text-center text-slate-500 mb-12">Everything you need to know</p>

        <div className="space-y-4">
          {[
            { q: 'What is NexusAI - AI Skill Tree?', a: 'AI Skill Tree is an advanced learning roadmap platform designed to help you master new skills efficiently using AI-powered personalization.' },
            { q: 'Is it free to use?', a: 'We offer a generous free tier. Our Pro plan unlocks unlimited trees and advanced career analytics.' },
            { q: 'How does the AI personalization work?', a: 'Our AI analyzes your current knowledge and matches it against millions of data points from successful professionals.' },
            { q: 'Can I customize my learning path?', a: 'Absolutely. You have full control to add, remove, or reorder modules as you see fit.' }
          ].map((faq, i) => (
            <div key={i} className="backdrop-blur-md bg-white/70 rounded-xl px-6 py-4 border border-white/50 hover:bg-white/80 transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center text-left"
              >
                <span className="font-medium text-slate-900 text-lg">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <p className="text-slate-600 mt-4 leading-relaxed">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-violet-950 to-indigo-950">
          <div className="relative z-10 py-16 px-8 md:px-20 text-center">
            <h2 className="font-bold text-3xl md:text-5xl text-white mb-6">Ready to Start Your Learning Journey?</h2>
            <p className="text-indigo-100 text-lg mb-10">Join 10,000+ learners growing their skills today.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white text-violet-600 px-10 py-5 rounded-full font-bold shadow-lg hover:bg-gray-50 transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/30 pt-16 pb-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <TreeDeciduous className="w-6 h-6 text-violet-600" />
                <span className="font-bold text-xl">NexusAI</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Empowering careers through AI-powered personalized roadmaps.</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-violet-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-violet-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-violet-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200">
            <p className="text-xs text-slate-400">© 2026 NexusAI. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-violet-600 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 hover:text-violet-600 transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 hover:text-violet-600 transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-slate-400 hover:text-violet-600 transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
