import React, { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TimelineItem } from '@/modules/skill-tree/domain/types/learning';
import { 
  X, 
  Sun, 
  Moon, 
  Sunset, 
  Calendar, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

interface DailyAgendaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: TimelineItem[];
}

export function DailyAgendaDialog({ isOpen, onClose, items }: DailyAgendaDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => 
      (a.scheduledTime || '00:00').localeCompare(b.scheduledTime || '00:00')
    );
  }, [items]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: t('mySkillTree.timeline.agenda.goodMorning', 'Chào buổi sáng'), icon: Sun, color: 'text-amber-500' };
    if (hour < 18) return { text: t('mySkillTree.timeline.agenda.goodAfternoon', 'Chào buổi chiều'), icon: Sunset, color: 'text-orange-500' };
    return { text: t('mySkillTree.timeline.agenda.goodEvening', 'Chào buổi tối'), icon: Moon, color: 'text-indigo-500' };
  }, [t]);

  const stats = useMemo(() => {
    const high = items.filter(i => i.priority === 'high').length;
    return {
      total: items.length,
      high,
      normal: items.length - high
    };
  }, [items]);

  const handleStart = () => {
    navigate('/timeline');
    onClose();
  };

  // Auto-close logic
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Only auto-close if open and not hovered
    if (!isOpen || isHovered) return;

    const timer = setTimeout(() => {
      onClose();
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [isOpen, isHovered, onClose]);

  if (!isOpen) return null;

  const GreetingIcon = greeting.icon;

  return (
    <div 
      className="fixed bottom-6 right-6 z-[100] w-full max-w-xs animate-in slide-in-from-bottom-5 duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-violet-100 overflow-hidden ring-1 ring-violet-200">
        
        {/* Header Section - Purple Theme */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-sm">
                <GreetingIcon className="w-5 h-5 text-yellow-300" />
             </div>
             <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  {greeting.text}!
                </h2>
                <p className="text-xs text-white/90 font-medium">
                  {t('mySkillTree.timeline.agenda.summary', { count: stats.total, defaultValue: `Bạn có ${stats.total} phiên học hôm nay` })}
                </p>
             </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task List - Scrollable but limited height */}
        <div className="p-4 bg-white max-h-[300px] overflow-y-auto">
          {sortedItems.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {t('mySkillTree.timeline.agenda.schedule', 'Lịch trình hôm nay')}
              </h3>
              
              {sortedItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => navigate('/timeline')}
                  className="group flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-violet-50 transition-all border border-transparent hover:border-violet-200 cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-white text-violet-600 flex items-center justify-center font-bold text-[10px] shadow-sm border border-slate-100">
                      {item.scheduledTime || '00:00'}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 truncate group-hover:text-violet-700 transition-colors">
                      {item.resourceName}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate">
                      {item.nodeName}
                    </p>
                  </div>

                  {item.priority === 'high' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-violet-300" />
              <p className="text-xs">{t('mySkillTree.timeline.agenda.empty', 'Không có lịch học nào hôm nay.')}</p>
            </div>
          )}
        </div>

        {/* Footer - Simplified Actions */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2">
           <button
             onClick={onClose}
             className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors text-xs"
           >
             {t('mySkillTree.timeline.agenda.later', 'Để sau')}
           </button>
           <button
             onClick={handleStart}
             className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-violet-500/30 transition-all text-xs flex items-center justify-center gap-1.5"
           >
             {t('mySkillTree.timeline.agenda.start', 'Sẵn sàng')}
             <ArrowRight className="w-3 h-3" />
           </button>
        </div>
      </div>
    </div>
  );
}
