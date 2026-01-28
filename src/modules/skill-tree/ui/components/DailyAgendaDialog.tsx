import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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

  if (!isOpen) return null;

  const GreetingIcon = greeting.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-8 text-center overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 p-12 bg-violet-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 p-12 bg-indigo-500/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={`p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-4 ${greeting.color}`}>
              <GreetingIcon className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {greeting.text}!
            </h2>
            
            <p className="text-slate-600 dark:text-slate-400">
              {t('mySkillTree.timeline.agenda.summary', `Bạn có ${stats.total} phiên học hôm nay`)}
            </p>
            
            {stats.high > 0 && (
              <span className="inline-block mt-2 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full uppercase tracking-wide">
                {stats.high} {t('mySkillTree.timeline.agenda.highPriority', 'Quan trọng')}
              </span>
            )}
          </div>

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task List */}
        <div className="p-6 bg-white dark:bg-slate-900 max-h-[40vh] overflow-y-auto">
          {sortedItems.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('mySkillTree.timeline.agenda.schedule', 'Lịch trình hôm nay')}
              </h3>
              
              {sortedItems.map((item) => (
                <div key={item.id} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
                      {item.scheduledTime || '00:00'}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-violet-600 transition-colors">
                      {item.resourceName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {item.nodeName}
                    </p>
                  </div>

                  <div className={`w-2 h-2 rounded-full mt-2.5 ${
                    item.priority === 'high' ? 'bg-red-500' : 
                    item.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
                  }`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>{t('mySkillTree.timeline.agenda.empty', 'Không có lịch học nào hôm nay.')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            {t('mySkillTree.timeline.agenda.later', 'Để sau')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all text-sm flex items-center justify-center gap-2"
          >
            {t('mySkillTree.timeline.agenda.start', 'Sẵn sàng')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

