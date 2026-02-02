/**
 * Professional Timeline - Learning Schedule Dashboard
 * Complete features: Week/Month navigation, full CRUD, time period assignment
 */

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  Calendar,
  Plus,
  Filter,
  Sun,
  Sunset,
  Moon,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Trash2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Edit3,
  X,
  Bell,
  BellOff,
  LayoutGrid,
} from 'lucide-react';
import { useLearningProgress } from '@/modules/skill-tree/ui/hooks/useLearningProgress';
import { TimelineItem, LearningStatus } from '@/modules/skill-tree/domain/types/learning';
import { AddToTimelineDialog } from '../components/AddToTimelineDialog';
import { StudyDialog } from '../components/StudyDialog';
import { MonthlyCalendarView } from '../components/MonthlyCalendarView';
import { useReminder } from '../hooks/useReminder';
import { learningGateway } from '../../providers';

type TimePeriod = 'morning' | 'afternoon' | 'evening';
type ViewMode = 'week' | 'month';

// Removed static TIME_PERIODS definition to move inside component or use translations


export function Timeline() {
  const {
    timelineItems,
    updateTimelineItem,
    removeFromTimeline,
    updateProgress,
  } = useLearningProgress();
  const { t, i18n } = useTranslation();

  const TIME_PERIODS = useMemo(() => ({
    morning: { label: t('mySkillTree.timeline.periods.morning'), range: '06:00 - 12:00', icon: Sun, hours: [6, 12] },
    afternoon: { label: t('mySkillTree.timeline.periods.afternoon'), range: '12:00 - 18:00', icon: Sunset, hours: [12, 18] },
    evening: { label: t('mySkillTree.timeline.periods.evening'), range: '18:00 - 24:00', icon: Moon, hours: [18, 24] },
  }), [t]);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Start from Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<LearningStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TimelineItem>>({});
  const [selectedStudyItem, setSelectedStudyItem] = useState<TimelineItem | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Reminder hook
  const { notifications, permission, requestPermission } = useReminder(
    timelineItems,
    notificationsEnabled
  );

  // Get dates for current week
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeekStart]);

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
    setSelectedDate(today);
  };

  // Month navigation
  const goToPreviousMonth = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setMonth(currentWeekStart.getMonth() - 1);
    setCurrentWeekStart(newStart);
  };

  const goToNextMonth = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setMonth(currentWeekStart.getMonth() + 1);
    setCurrentWeekStart(newStart);
  };

  // Get month/year for display
  const currentMonthYear = useMemo(() => {
    return new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', { month: 'long', year: 'numeric' }).format(currentWeekStart);
  }, [currentWeekStart, i18n.language]);

  // Filter items for selected date
  const itemsForSelectedDate = useMemo(() => {
    return timelineItems.filter(item => {
      if (!item.scheduledDate) return false; // Filter out backlog items
      const itemDate = item.scheduledDate;
      const isSameDay = itemDate.toDateString() === selectedDate.toDateString();
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return isSameDay && matchesStatus;
    });
  }, [timelineItems, selectedDate, filterStatus]);

  // Helper to add minutes to HH:mm string
  const addMinutes = (timeStr: string, minutes: number) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    date.setMinutes(date.getMinutes() + minutes);
    return date.toTimeString().slice(0, 5);
  };

  // Helper to format date as YYYY-MM-DD in LOCAL time
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDurationMinutes = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 90; // 1.5 hours
      case 'medium': return 60; // 1 hour
      case 'low': return 30;    // 30 mins
      default: return 60;
    }
  };

  // Group items by time period based on scheduledTime
  const groupedItems = useMemo(() => {
    const groups: Record<TimePeriod, TimelineItem[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    itemsForSelectedDate.forEach((item) => {
      // If item has scheduledTime, use it to determine period
      if (item.scheduledTime) {
        const hour = parseInt(item.scheduledTime.split(':')[0]);
        if (hour >= 0 && hour < 12) groups.morning.push(item);
        else if (hour >= 12 && hour < 18) groups.afternoon.push(item);
        else groups.evening.push(item);
      } else {
        // Fallback if no time (shouldn't happen often)
        groups.morning.push(item);
      }
    });

    // CRITICAL: Sort items by time to ensure correct visual order
    const compareTime = (a: TimelineItem, b: TimelineItem) =>
      (a.scheduledTime || '00:00').localeCompare(b.scheduledTime || '00:00');

    groups.morning.sort(compareTime);
    groups.afternoon.sort(compareTime);
    groups.evening.sort(compareTime);

    return groups;
  }, [itemsForSelectedDate]);

  // Count items for each date (for showing badges)
  const itemCountByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    timelineItems.forEach(item => {
      if (!item.scheduledDate) return; // Skip backlog items
      const dateStr = item.scheduledDate.toDateString();
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    return counts;
  }, [timelineItems]);

  const stats = useMemo(() => {
    return {
      total: timelineItems.length,
      notStarted: timelineItems.filter(i => i.status === 'not_started').length,
      inProgress: timelineItems.filter(i => i.status === 'in_progress').length,
      completed: timelineItems.filter(i => i.status === 'completed').length,
    };
  }, [timelineItems]);

  const formatDate = (date: Date) => {
    return {
      dayName: new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', { weekday: 'short' }).format(date),
      dayNumber: date.getDate(),
    };
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

  const handleStatusChange = (item: TimelineItem) => {
    const statusOrder: LearningStatus[] = ['not_started', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(item.status);
    const nextStatus = statusOrder[(currentIndex + 1) % 3];
    updateTimelineItem(item.id, { status: nextStatus });
    
    // Sync with Learning Progress (Skill Tree)
    if (item.resourceId) {
      updateProgress(item.resourceId, { status: nextStatus });
    }
  };


  // Drag and drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement to start drag, allowing clicks on child elements
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const draggedItem = timelineItems.find(item => item.id === active.id as string);
    if (!draggedItem) return;

    // CHECK 1: Is the drop target another Timeline Item? (SWAP LOGIC)
    const targetItem = timelineItems.find(item => item.id === over.id as string);

    if (targetItem) {
      // Perform Swap
      const draggedTime = draggedItem.scheduledTime;
      const draggedDate = draggedItem.scheduledDate;

      const targetTime = targetItem.scheduledTime;
      const targetDate = targetItem.scheduledDate;

      // Optimistic Update
      updateTimelineItem(draggedItem.id, { scheduledTime: targetTime, scheduledDate: targetDate });
      updateTimelineItem(targetItem.id, { scheduledTime: draggedTime, scheduledDate: draggedDate });

      try {
        // API Calls in parallel - USE formatLocalDate
        await Promise.all([
          (learningGateway as any).updateTimelineItem(draggedItem.id, {
            scheduledDate: formatLocalDate(targetDate),
            scheduledTime: targetTime
          }),
          (learningGateway as any).updateTimelineItem(targetItem.id, {
            scheduledDate: formatLocalDate(draggedDate),
            scheduledTime: draggedTime
          })
        ]);
      } catch (error) {
        console.error('Swap failed:', error);
        alert(t('mySkillTree.timeline.errors.connection'));
        window.location.reload();
      }
      return;
    }

    // CHECK 2: Is the drop target a Period Column? (SMART SCHEDULE LOGIC)
    const dropId = over.id as string;
    if (dropId.includes('-')) {
      const [period, ...dateParts] = dropId.split('-');
      const dateStr = dateParts.join('-');

      // Determine target date (Use local date string parsing)
      let newDate = draggedItem.scheduledDate;
      if (dateStr) {
        // Parse YYYY-MM-DD explicitly to local date
        const [y, m, d] = dateStr.split('-').map(Number);
        newDate = new Date(y, m - 1, d);
      }

      const newDateStr = formatLocalDate(newDate);

      // Determine default start time
      let baseTime = '08:00';
      if (period === 'afternoon') baseTime = '14:00';
      else if (period === 'evening') baseTime = '20:00';

      // Calculate smart start time
      // 1. Get existing items in the target period & date
      const targetItems = timelineItems.filter(item => {
        // Same date string match
        if (formatLocalDate(item.scheduledDate) !== newDateStr) return false;

        // Exclude self
        if (item.id === draggedItem.id) return false;

        // Check time period
        const h = parseInt(item.scheduledTime?.split(':')[0] || '0');
        let p = 'morning';
        if (h >= 12 && h < 18) p = 'afternoon';
        if (h >= 18) p = 'evening';

        return p === period;
      });

      // 2. Sort by time (Crucial for correct "last item" detection)
      targetItems.sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));

      // 3. Find next available slot
      let newTime = baseTime;
      if (targetItems.length > 0) {
        const lastItem = targetItems[targetItems.length - 1];
        const lastTime = lastItem.scheduledTime || baseTime;
        const duration = getDurationMinutes(lastItem.priority);
        newTime = addMinutes(lastTime, duration + 15);
      }

      // Build update payload
      const updates: any = {
        scheduledTime: newTime,
      };

      const dateChanged = formatLocalDate(draggedItem.scheduledDate) !== newDateStr;
      if (dateChanged) {
        updates.scheduledDate = newDateStr;
      }

      // Call backend API
      try {
        const success = await (learningGateway as any).updateTimelineItem(
          draggedItem.id,
          updates
        );

        if (success) {
          updateTimelineItem(draggedItem.id, {
            scheduledDate: newDate,
            scheduledTime: newTime,
          });
        } else {
          console.error('Failed to update timeline item on backend');
          alert(t('mySkillTree.timeline.errors.add'));
        }
      } catch (error) {
        console.error('Error updating timeline item:', error);
        alert(t('mySkillTree.timeline.errors.connection'));
      }
    }
  };

  const handleStartLearning = async (item: TimelineItem) => {
    if (item.status === 'in_progress') return;
    
    // Update to in_progress
    updateTimelineItem(item.id, { status: 'in_progress' });
    if (item.resourceId) {
      updateProgress(item.resourceId, { status: 'in_progress' });
    }
    
    // Call API (fire and forget for UI responsiveness)
    try {
        await (learningGateway as any).updateTimelineItem(item.id, { status: 'in_progress' });
    } catch (e) {
        console.error("Failed to update status", e);
    }
  };

  const handleDelete = (item: TimelineItem) => {
    if (window.confirm(t('mySkillTree.timeline.actions.deleteConfirm', { name: item.resourceName }))) {
      removeFromTimeline(item.id);
    }
  };

  const renderTimelineCard = (item: TimelineItem, barColor: string) => {
    const priorityColors = {
      high: { bg: 'bg-destructive/10', text: 'text-destructive', label: t('mySkillTree.timeline.priorities.high') },
      medium: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: t('mySkillTree.timeline.priorities.medium') },
      low: { bg: 'bg-muted', text: 'text-muted-foreground', label: t('mySkillTree.timeline.priorities.low') },
    };
    const priority = priorityColors[item.priority];

    return (
        <DraggableCard 
            key={item.id} 
            item={item} 
            priority={priority} 
            barColor={barColor} 
            onStatusChange={handleStatusChange} 
            onDelete={handleDelete}
            onClick={() => setSelectedStudyItem(item)}
        />
    );
  };

  // Draggable Card Component
  const DraggableCard = ({ item, priority, barColor, onStatusChange, onDelete, onClick }: any) => {
    // Make card both draggable AND droppable
    const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
      id: item.id,
    });

    // Use Droppable to accept drops on this item
    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
      id: item.id,
    });

    // Merge refs
    const setNodeRef = (node: HTMLElement | null) => {
      setDraggableRef(node);
      setDroppableRef(node);
    };

    const style = transform
      ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 50 : 1,
      }
      : undefined;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`
          bg-card p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative border 
          ${isOver ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-transparent hover:border-border'} 
          group cursor-pointer active:cursor-grabbing
          ${item.status === 'completed' ? 'opacity-60 grayscale' : ''}
        `}
        onClick={onClick}
      >
        {/* Color bar */}
        <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${barColor}`} />

        {/* Header: Priority & Actions */}
        <div className="flex justify-between items-start mb-3 pl-3">
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${priority.badge || priority.bg + ' ' + priority.text}`}>
            {t(`mySkillTree.timeline.priorities.${item.priority}`)}
          </span>

          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setEditingItem(item); setEditFormData({ ...item }); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors relative z-10"
              title={t('mySkillTree.timeline.actions.edit')}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors relative z-10"
              title={t('common.delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <h3 className="font-bold text-foreground pl-3 text-lg leading-tight mb-2 line-clamp-2">{item.resourceName}</h3>
        <p className="text-sm text-muted-foreground pl-3 leading-relaxed mb-5 line-clamp-2">{item.nodeName}</p>

        {/* Footer */}
        <div className="pt-4 border-t border-border/50 flex items-center justify-between pl-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">{item.scheduledTime || '08:00'}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(item);
            }}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            {item.status === 'completed' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : item.status === 'in_progress' ? (
              <Circle className="w-4 h-4 text-primary fill-current" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            <span className={`text-xs font-medium ${item.status === 'completed' ? 'text-emerald-500' : ''}`}>
              {t(`mySkillTree.timeline.statuses.${item.status}`)}
            </span>
          </button>
        </div>
      </div>
    );
  };

  const renderTimePeriodColumn = (period: TimePeriod) => {
    const config = TIME_PERIODS[period];
    const items = groupedItems[period];

    // Accents matching the Elite design
    const accents = {
      morning: { dot: 'bg-violet-500', text: 'text-violet-500', bg: 'bg-violet-500/10' },
      afternoon: { dot: 'bg-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/10' },
      evening: { dot: 'bg-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-600/10' },
    };
    const accent = accents[period];

    return (
      <div className="flex flex-col h-full bg-transparent">
        {/* Header */}
        <div className="flex items-center justify-between px-1 py-3 mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${accent.dot}`} />
            <h2 className="font-bold text-lg text-foreground">{config.label}</h2>
          </div>

          <span className="text-xs font-medium text-muted-foreground bg-card border border-border px-2.5 py-1 rounded">
            {config.range}
          </span>
        </div>

        {/* Droppable Zone */}
        <DroppableZone id={`${period}-${formatLocalDate(selectedDate)}`}>
          <div className="flex-1 space-y-4 min-h-[150px] pb-4">
            {items.map(item => renderTimelineCard(item, accent.dot))}

            {items.length === 0 && (
              <div className="bg-card rounded-xl border border-border h-64 flex flex-col justify-center items-center text-center p-6">
                <div className={`w-16 h-16 ${accent.bg} rounded-2xl flex items-center justify-center mb-4 ${accent.text}`}>
                  <config.icon className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">{t('mySkillTree.timeline.empty.title')}</h3>
                <span className="text-xs text-muted-foreground max-w-[200px]">
                  {t('mySkillTree.timeline.empty.subtitle')}
                </span>
              </div>
            )}
          </div>
        </DroppableZone>

        {/* Add Button (Bottom) */}
        <button
          onClick={() => setShowAddDialog(true)}
          className="mt-2 w-full py-3 border border-dashed border-border rounded-xl text-muted-foreground text-sm font-medium
                      hover:bg-card hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {t('mySkillTree.timeline.actions.addActivity')}
        </button>
      </div>
    );
  };

  // Droppable Zone Component
  const DroppableZone = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
      <div
        ref={setNodeRef}
        className={`transition-colors ${isOver ? 'bg-primary/5 ring-2 ring-primary/30 rounded-lg' : ''}`}
      >
        {children}
      </div>
    );
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      // 1. Prepare payload for API
      const payload: any = {
        status: editFormData.status,
        priority: editFormData.priority,
        scheduledTime: editFormData.scheduledTime,
      };

      if (editFormData.scheduledDate) {
        payload.scheduledDate = formatLocalDate(new Date(editFormData.scheduledDate));
      }

      if (editFormData.deadline) {
        payload.deadline = editFormData.deadline;
      }

      // 2. Call API
      const success = await (learningGateway as any).updateTimelineItem(editingItem.id, payload);
      
      if (!success) {
        throw new Error('Backend update failed');
      }

      // 3. Update Local Context
      updateTimelineItem(editingItem.id, editFormData as any);
      
      // Sync with Learning Progress (Skill Tree)
      if (editingItem.resourceId && editFormData.status) {
        updateProgress(editingItem.resourceId, { status: editFormData.status });
      }

      // 4. Close Modal
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert(t('mySkillTree.timeline.errors.connection'));
    }
  };

  // Edit Modal
  const renderEditModal = () => {
    if (!editingItem) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">{t('mySkillTree.timeline.actions.edit')}</h3>
            <button onClick={() => setEditingItem(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('mySkillTree.panel.resources')}</label>
              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{editingItem.resourceName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('mySkillTree.timeline.date')}</label>
              <input
                type="date"
                value={editFormData.scheduledDate ? new Date(editFormData.scheduledDate).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : undefined;
                  setEditFormData(prev => ({ ...prev, scheduledDate: newDate }));
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('mySkillTree.timeline.time')}</label>
              <input
                type="time"
                value={editFormData.scheduledTime || '08:00'}
                onChange={(e) => {
                  setEditFormData(prev => ({ ...prev, scheduledTime: e.target.value }));
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('mySkillTree.timeline.deadline')}</label>
              <input
                type="date"
                value={editFormData.deadline ? new Date(editFormData.deadline).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const newDeadline = e.target.value ? new Date(e.target.value) : undefined;
                  setEditFormData(prev => ({ ...prev, deadline: newDeadline }));
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('mySkillTree.timeline.priority')}</label>
              <select
                value={editFormData.priority}
                onChange={(e) => {
                  setEditFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }));
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="low">{t('mySkillTree.timeline.priorities.low')}</option>
                <option value="medium">{t('mySkillTree.timeline.priorities.medium')}</option>
                <option value="high">{t('mySkillTree.timeline.priorities.high')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('mySkillTree.timeline.status')}</label>
              <select
                value={editFormData.status}
                onChange={(e) => {
                  setEditFormData(prev => ({ ...prev, status: e.target.value as LearningStatus }));
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="not_started">{t('mySkillTree.timeline.statuses.not_started')}</option>
                <option value="in_progress">{t('mySkillTree.timeline.statuses.in_progress')}</option>
                <option value="completed">{t('mySkillTree.timeline.statuses.completed')}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEditingItem(null)}
              className="flex-1 py-2 border border-border rounded-lg text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              {t('mySkillTree.timeline.close')}
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {t('mySkillTree.timeline.save')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 overflow-hidden relative">
        {/* Header */}
        <header className="bg-card z-10 shadow-sm border-b border-border flex-shrink-0">
          <div className="px-4 md:px-8 py-4 md:py-5 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-border/50 gap-4">
            {/* Left: Title */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('mySkillTree.timeline.title')}</h1>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">{t('mySkillTree.timeline.subtitle')}</p>
            </div>

            {/* Center: Horizontal Stats */}
            <div className="hidden xl:flex items-center divide-x divide-border/60">
              <div className="px-8 text-center">
                <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">{t('mySkillTree.timeline.stats.total')}</div>
              </div>
              <div className="px-8 text-center">
                <div className="text-3xl font-bold text-primary">{stats.inProgress}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">{t('mySkillTree.timeline.stats.inProgress')}</div>
              </div>
              <div className="px-8 text-center">
                <div className="text-3xl font-bold text-emerald-500">{stats.completed}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">{t('mySkillTree.timeline.stats.completed')}</div>
              </div>
            </div>

            {/* Right: Actions & Nav */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap lg:flex-nowrap w-full lg:w-auto justify-end">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50 flex-shrink-0">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'week'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {t('mySkillTree.timeline.view.week')}
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'month'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {t('mySkillTree.timeline.view.month')}
                </button>
              </div>

              <button
                onClick={goToToday}
                className="px-3 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                {t('mySkillTree.timeline.view.today')}
              </button>

              {/* Date Nav */}
              <div className="flex items-center bg-background border border-border rounded-lg p-1 shadow-sm">
                <button
                  onClick={viewMode === 'week' ? goToPreviousWeek : goToPreviousMonth}
                  className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  title={viewMode === 'week' ? t('mySkillTree.timeline.view.prevWeek') : t('mySkillTree.timeline.view.prevMonth')}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-foreground"
                >
                  <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  <span>{currentMonthYear}</span>
                </button>
                <button
                  onClick={viewMode === 'week' ? goToNextWeek : goToNextMonth}
                  className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  title={viewMode === 'week' ? t('mySkillTree.timeline.view.nextWeek') : t('mySkillTree.timeline.view.nextMonth')}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Notification Toggle */}
              <button
                onClick={() => {
                  if (permission === 'default') {
                    requestPermission();
                  } else {
                    setNotificationsEnabled(!notificationsEnabled);
                  }
                }}
                className={`p-2.5 rounded-lg border border-transparent transition-colors ${notificationsEnabled && permission === 'granted'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                title={notificationsEnabled ? t('mySkillTree.timeline.notifications.off') : t('mySkillTree.timeline.notifications.on')}
              >
                {notificationsEnabled && permission === 'granted' ? (
                  <Bell className="w-5 h-5" />
                ) : (
                  <BellOff className="w-5 h-5" />
                )}
              </button>

              {/* Add Button */}
              <button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg font-medium"
              >
                <Plus className="w-5 h-5" />
                {t('mySkillTree.timeline.add')}
              </button>
            </div>
          </div>

          {/* Week View: Floating Cards */}
          {viewMode === 'week' && (
            <div className="px-4 md:px-8 py-4 md:py-6 overflow-x-auto border-b border-border bg-muted/20 no-scrollbar">
              <div className="flex md:justify-between gap-3 md:gap-0 min-w-full md:min-w-[800px] items-end pb-2">
                {weekDates.map((date) => {
                  const { dayName, dayNumber } = formatDate(date);
                  const selected = isSelected(date);
                  const today = isToday(date);
                  const taskCount = itemCountByDate[date.toDateString()] || 0;

                  // Active Day Card
                  if (selected) {
                    return (
                      <div key={date.toISOString()} className="relative flex flex-col items-center cursor-pointer -mt-2 z-10 flex-shrink-0">
                        <div className="bg-card rounded-xl shadow-lg border-t-4 border-primary px-6 md:px-10 py-3 md:py-4 transform -translate-y-1 md:-translate-y-2 min-w-[100px] md:min-w-[140px] flex flex-col items-center">
                          {today && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-card px-3">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">{t('mySkillTree.timeline.view.today')}</span>
                            </div>
                          )}
                          <div className="text-center mt-4">
                            <span className="block text-4xl font-bold text-foreground">{dayNumber}</span>
                            <span className="inline-block mt-2 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {taskCount} {t('mySkillTree.timeline.stats.tasks')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Inactive Day Item
                  return (
                    <div
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className="flex flex-col items-center group cursor-pointer pb-2 hover:-translate-y-1 transition-transform flex-shrink-0 min-w-[60px]"
                    >
                      <span className="text-xs font-semibold text-muted-foreground mb-2 uppercase">{dayName}</span>
                      <span className={`text-2xl font-medium ${today ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`}>
                        {dayNumber}
                      </span>
                      {today && <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1"></span>}
                      {taskCount > 0 && !today && (
                        <span className="mt-1 px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                          {taskCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </header>

        {/* Main content - Conditional rendering based on view mode */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent">
          <div className="p-4 md:p-6 lg:p-8 h-full">
          {viewMode === 'week' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-full pb-20 lg:pb-0">
              {renderTimePeriodColumn('morning')}
              {renderTimePeriodColumn('afternoon')}
              {renderTimePeriodColumn('evening')}
            </div>
          ) : (
            <MonthlyCalendarView
              currentDate={currentWeekStart}
              timelineItems={timelineItems}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setViewMode('week'); // Switch to week view when a date is selected
              }}
            />
          )}
          </div>
        </div>

        {/* Floating add button for mobile */}
        <button
          onClick={() => setShowAddDialog(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all z-50 active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Add Dialog */}
        <AddToTimelineDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => window.location.reload()}
        />

        {/* Edit Modal */}
        {renderEditModal()}

        {/* Study Dialog */}
        <StudyDialog
            isOpen={!!selectedStudyItem}
            onClose={() => setSelectedStudyItem(null)}
            item={selectedStudyItem}
            onStartLearning={handleStartLearning}
        />
      </div>
    </DndContext>
  );
}
// End of Timeline component
