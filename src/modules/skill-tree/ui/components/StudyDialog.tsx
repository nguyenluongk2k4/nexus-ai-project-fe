import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, ExternalLink, Clock, BookOpen, MonitorPlay, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { TimelineItem } from '../pages/Timeline';

interface StudyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: TimelineItem | null;
  onStartLearning: (item: TimelineItem) => void;
}

export function StudyDialog({ isOpen, onClose, item, onStartLearning }: StudyDialogProps) {
  const { t } = useTranslation();

  if (!item) return null;

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <MonitorPlay className="w-6 h-6 text-violet-600" />;
      case 'article':
      case 'book':
        return <BookOpen className="w-6 h-6 text-emerald-600" />;
      default:
        return <FileText className="w-6 h-6 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'low':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Logic thời gian chuẩn: Low=30, Medium=60, High=90
  const getDuration = (priority: string, estimated?: number) => {
    if (estimated) return estimated;
    switch (priority?.toLowerCase()) {
      case 'high': return 90;
      case 'medium': return 60;
      case 'low': return 30;
      default: return 60;
    }
  };

  const handleStartLearning = () => {
    onStartLearning(item);
    
    if (item.url && (item.url.startsWith('http') || item.url.startsWith('www'))) {
      window.open(item.url, '_blank');
      onClose();
    } else {
      // Báo lỗi nếu không có link
      toast.error(t('mySkillTree.timeline.errors.noUrl', 'Chưa có liên kết học tập cho tài liệu này'));
      // Vẫn giữ dialog mở để user đọc thông tin nếu muốn
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg">
                            {getIcon(item.resourceType || 'article')}
                        </div>
                        <div>
                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-slate-900">
                            {item.resourceName}
                            </Dialog.Title>
                            <p className="text-sm text-slate-500 font-medium mt-0.5">{item.nodeName}</p>
                        </div>
                    </div>
                  
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="mt-6 space-y-4">
                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${getPriorityColor(item.priority)}`}>
                        {t(`mySkillTree.timeline.priorities.${item.priority}`, item.priority)}
                    </span>
                    {item.platform && (
                         <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {item.platform}
                         </span>
                    )}
                     <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {getDuration(item.priority, item.estimatedTime)} {t('common.minutes', 'phút')}
                     </span>
                  </div>

                  {/* Scheduled Time Info */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">{t('mySkillTree.timeline.scheduleInfo', 'Thông tin lịch học')}</h4>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">{t('mySkillTree.timeline.date', 'Ngày')}:</span>
                            <span className="text-slate-700 font-medium">
                                {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString(
                                    localStorage.getItem('i18nextLng') === 'en' ? 'en-US' : 'vi-VN'
                                ) : t('mySkillTree.timeline.notScheduled', 'Chưa xếp lịch')}
                            </span>
                        </div>
                        {item.scheduledTime && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{t('mySkillTree.timeline.time', 'Giờ')}:</span>
                                <span className="text-slate-700 font-medium">{item.scheduledTime}</span>
                            </div>
                        )}
                         {item.deadline && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{t('mySkillTree.timeline.deadline', 'Hạn chót')}:</span>
                                <span className="text-slate-700 font-medium">{new Date(item.deadline).toLocaleDateString(
                                     localStorage.getItem('i18nextLng') === 'en' ? 'en-US' : 'vi-VN'
                                )}</span>
                            </div>
                        )}
                    </div>
                  </div>

                  {/* Status */}
                   <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>{t('mySkillTree.timeline.currentStatus', 'Trạng thái')}:</span>
                        <span className={`font-medium ${item.status === 'completed' ? 'text-green-600' : item.status === 'in_progress' || item.status === 'in_progress' ? 'text-blue-600' : 'text-slate-600'}`}>
                            {t(`mySkillTree.timeline.statuses.${item.status}`, item.status)}
                        </span>
                   </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    className={`flex-1 inline-flex justify-center items-center gap-2 rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
                        ${!item.url 
                            ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                            : 'bg-violet-600 hover:bg-violet-700 shadow-violet-200 focus-visible:ring-violet-500'
                        }`}
                    onClick={handleStartLearning}
                    title={!item.url ? t('mySkillTree.timeline.errors.noUrl', 'Chưa có liên kết') : ''}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('common.learnNow', 'Học ngay')}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
