/**
 * Professional Timeline - Learning Schedule Dashboard
 * Complete features: Week/Month navigation, full CRUD, time period assignment
 */

import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useLearningProgress } from '@/modules/skill-tree/ui/contexts/LearningProgressContext';
import { TimelineItem, LearningStatus } from '@/modules/skill-tree/domain/types/learning';
import { AddToTimelineDialog } from '../components/AddToTimelineDialog';
import { MonthlyCalendarView } from '../components/MonthlyCalendarView';
import { useReminder } from '../hooks/useReminder';
import { learningGateway } from '../../providers';

type TimePeriod = 'morning' | 'afternoon' | 'evening';
type ViewMode = 'week' | 'month';

const TIME_PERIODS = {
  morning: { label: 'Buổi sáng', range: '06:00 - 12:00', icon: Sun, hours: [6, 12] },
  afternoon: { label: 'Buổi chiều', range: '12:00 - 18:00', icon: Sunset, hours: [12, 18] },
  evening: { label: 'Buổi tối', range: '18:00 - 24:00', icon: Moon, hours: [18, 24] },
};

export function Timeline() {
  const {
    timelineItems,
    updateTimelineItem,
    removeFromTimeline,
  } = useLearningProgress();

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
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return `${months[currentWeekStart.getMonth()]}, ${currentWeekStart.getFullYear()}`;
  }, [currentWeekStart]);

  // Filter items for selected date
  const itemsForSelectedDate = useMemo(() => {
    return timelineItems.filter(item => {
      const itemDate = item.scheduledDate;
      const isSameDay = itemDate.toDateString() === selectedDate.toDateString();
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return isSameDay && matchesStatus;
    });
  }, [timelineItems, selectedDate, filterStatus]);

  // Group items by time period based on scheduledTime or index
  const groupedItems = useMemo(() => {
    const groups: Record<TimePeriod, TimelineItem[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    itemsForSelectedDate.forEach((item, index) => {
      // If item has scheduledTime, use it to determine period
      if (item.scheduledTime) {
        const hour = parseInt(item.scheduledTime.split(':')[0]);
        if (hour >= 6 && hour < 12) groups.morning.push(item);
        else if (hour >= 12 && hour < 18) groups.afternoon.push(item);
        else groups.evening.push(item);
      } else {
        // Distribute evenly
        if (index % 3 === 0) groups.morning.push(item);
        else if (index % 3 === 1) groups.afternoon.push(item);
        else groups.evening.push(item);
      }
    });

    return groups;
  }, [itemsForSelectedDate]);

  // Count items for each date (for showing badges)
  const itemCountByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    timelineItems.forEach(item => {
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
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return {
      dayName: days[date.getDay()],
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
  };


  // Drag and drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const draggedItem = timelineItems.find(item => item.id === active.id as string);
    if (!draggedItem) return;

    // Parse the drop zone ID - format: "period-dateString"
    const dropId = over.id as string;
    const [period, ...dateParts] = dropId.split('-');
    const dateStr = dateParts.join('-'); // Rejoin in case date has dashes

    // Determine new scheduled time based on period
    let newTime = draggedItem.scheduledTime || '08:00';
    if (period === 'morning') newTime = '08:00';
    else if (period === 'afternoon') newTime = '14:00';
    else if (period === 'evening') newTime = '20:00';

    // Determine new date if dateStr is provided
    let newDate = draggedItem.scheduledDate;
    if (dateStr) {
      newDate = new Date(dateStr);
    }

    // Check if date actually changed (compare date strings to avoid time component issues)
    const dateChanged = newDate.toDateString() !== draggedItem.scheduledDate.toDateString();

    // Build update payload - only include fields that changed
    const updates: any = {
      scheduledTime: newTime,
    };

    if (dateChanged) {
      updates.scheduledDate = newDate.toISOString().split('T')[0];
    }

    // Call backend API to persist changes
    try {
      const success = await (learningGateway as any).updateTimelineItem(
        draggedItem.id,
        updates
      );

      if (success) {
        // Update local state after successful API call
        updateTimelineItem(draggedItem.id, {
          scheduledDate: newDate,
          scheduledTime: newTime,
        });
      } else {
        console.error('Failed to update timeline item on backend');
        alert('Không thể cập nhật lịch học. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error updating timeline item:', error);
      alert('Lỗi khi cập nhật lịch học.');
    }
  };

  const handleDelete = (item: TimelineItem) => {
    if (window.confirm(`Xác nhận xóa "${item.resourceName}" khỏi lịch học?`)) {
      removeFromTimeline(item.id);
    }
  };

  const renderTimelineCard = (item: TimelineItem) => {
    const priorityColors = {
      high: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Cao' },
      medium: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Trung bình' },
      low: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Thấp' },
    };
    const priority = priorityColors[item.priority];

    return <DraggableCard key={item.id} item={item} priority={priority} onStatusChange={handleStatusChange} onDelete={handleDelete} />;
  };

  // Draggable Card Component
  const DraggableCard = ({ item, priority, onStatusChange, onDelete }: any) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: item.id,
    });

    const style = transform
      ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
      : undefined;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`
          bg-card/80 backdrop-blur-sm border border-border
          p-4 rounded-xl relative group cursor-grab active:cursor-grabbing
          shadow-sm hover:shadow-md transition-all duration-300
          hover:-translate-y-0.5 hover:border-primary/30
          ${item.status === 'completed' ? 'opacity-60' : ''}
          ${item.status === 'in_progress' ? 'ring-1 ring-primary/30' : ''}
        `}
      >
        {/* Color bar */}
        <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full" />

        {/* Header */}
        <div className="flex justify-between items-start mb-2 pl-3">
          <span className={`text-xs font-semibold ${priority.text} ${priority.bg} px-2 py-0.5 rounded-md`}>
            {priority.label}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditingItem(item)}
              className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(item)}
              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground pl-3 group-hover:text-primary transition-colors line-clamp-2 mb-1">
          {item.resourceName}
        </h3>

        {/* Node name */}
        <p className="text-xs text-muted-foreground pl-3 mb-2 flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          {item.nodeName}
        </p>

        {/* Time & Deadline */}
        <div className="flex flex-wrap gap-2 pl-3 text-xs text-muted-foreground mb-2">
          {item.scheduledTime && (
            <span className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              {item.scheduledTime}
            </span>
          )}
          {item.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              DL: {item.deadline.toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pl-3 mt-3 pt-2 border-t border-border">
          <button
            onClick={() => handleStatusChange(item)}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${item.status === 'completed'
              ? 'bg-secondary/20 text-secondary'
              : item.status === 'in_progress'
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
              }`}
          >
            {item.status === 'completed' ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Circle className={`w-3 h-3 ${item.status === 'in_progress' ? 'fill-current' : ''}`} />
            )}
            {item.status === 'completed' ? 'Hoàn thành' : item.status === 'in_progress' ? 'Đang học' : 'Chưa bắt đầu'}
          </button>
        </div>
      </div>
    );
  };

  const renderTimePeriodColumn = (period: TimePeriod) => {
    const config = TIME_PERIODS[period];
    const items = groupedItems[period];
    const IconComponent = config.icon;

    const periodStyles = {
      morning: { gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
      afternoon: { gradient: 'from-secondary/20 to-secondary/5', iconBg: 'bg-secondary/10', iconColor: 'text-secondary' },
      evening: { gradient: 'from-violet-500/20 to-violet-500/5', iconBg: 'bg-violet-500/10', iconColor: 'text-violet-400' },
    };
    const style = periodStyles[period];

    return (
      <div className="flex flex-col h-full rounded-xl bg-card/50 backdrop-blur-sm border border-border overflow-hidden">
        {/* Header */}
        <div className={`px-4 py-3 border-b border-border flex justify-between items-center bg-gradient-to-r ${style.gradient}`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${style.iconBg}`}>
              <IconComponent className={`w-4 h-4 ${style.iconColor}`} />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">{config.label}</h2>
              <span className="text-[10px] text-muted-foreground">{config.range}</span>
            </div>
          </div>
          <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full font-medium">
            {items.length}
          </span>
        </div>

        {/* Items - Droppable Zone */}
        <DroppableZone id={`${period}-${selectedDate.toDateString()}`}>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {items.length > 0 ? (
              items.map(item => renderTimelineCard(item))
            ) : (
              <div
                onClick={() => setShowAddDialog(true)}
                className="h-24 border border-dashed border-border rounded-xl flex flex-col justify-center items-center text-muted-foreground group hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
              >
                <span className="text-xs font-medium group-hover:text-primary">Chưa có hoạt động</span>
                <span className="text-[10px] group-hover:text-primary/70">Nhấn để thêm mới</span>
              </div>
            )}
          </div>
        </DroppableZone>

        {/* Add button */}
        <button
          onClick={() => setShowAddDialog(true)}
          className="m-3 py-2.5 border border-dashed border-border rounded-lg text-muted-foreground text-xs font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all flex justify-center items-center gap-1.5 group"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Thêm hoạt động
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

  // Edit Modal
  const renderEditModal = () => {
    if (!editingItem) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Chỉnh sửa lịch học</h3>
            <button onClick={() => setEditingItem(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tài liệu</label>
              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{editingItem.resourceName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Ngày học</label>
              <input
                type="date"
                defaultValue={editingItem.scheduledDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  updateTimelineItem(editingItem.id, { scheduledDate: newDate });
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Giờ học</label>
              <input
                type="time"
                defaultValue={editingItem.scheduledTime || '08:00'}
                onChange={(e) => {
                  updateTimelineItem(editingItem.id, { scheduledTime: e.target.value });
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Deadline</label>
              <input
                type="date"
                defaultValue={editingItem.deadline?.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  const newDeadline = e.target.value ? new Date(e.target.value) : undefined;
                  updateTimelineItem(editingItem.id, { deadline: newDeadline });
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Độ ưu tiên</label>
              <select
                defaultValue={editingItem.priority}
                onChange={(e) => {
                  updateTimelineItem(editingItem.id, { priority: e.target.value as 'low' | 'medium' | 'high' });
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Trạng thái</label>
              <select
                defaultValue={editingItem.status}
                onChange={(e) => {
                  updateTimelineItem(editingItem.id, { status: e.target.value as LearningStatus });
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="not_started">Chưa bắt đầu</option>
                <option value="in_progress">Đang học</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEditingItem(null)}
              className="flex-1 py-2 border border-border rounded-lg text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                window.location.reload();
              }}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
          <div className="px-6 py-5 flex justify-between items-center">
            {/* Title & Navigation */}
            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded">
                  Lịch học
                </span>
                <h1 className="text-2xl font-bold text-foreground mt-2">Lịch Học Cá Nhân</h1>
              </div>

              {/* Week/Month Navigation */}
              <div className="flex items-center gap-3 ml-6">
                <button
                  onClick={goToPreviousWeek}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Tuần trước"
                >
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                </button>

                <button
                  onClick={() => setShowMonthPicker(!showMonthPicker)}
                  className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <span className="text-base font-semibold text-foreground">{currentMonthYear}</span>
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 ml-2 bg-muted p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${viewMode === 'week'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Tuần
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${viewMode === 'month'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Tháng
                  </button>
                </div>

                <button
                  onClick={goToNextWeek}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Tuần sau"
                >
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <button
                  onClick={goToToday}
                  className="ml-3 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Hôm nay
                </button>
              </div>
            </div>

            {/* Daily Progress Bar */}
            <div className="flex flex-col items-center gap-1.5 min-w-[200px]">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Tiến độ hôm nay</span>
                <span className="font-semibold text-foreground">
                  {itemsForSelectedDate.filter(i => i.status === 'completed').length}/{itemsForSelectedDate.length}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
                  style={{
                    width: `${itemsForSelectedDate.length > 0
                      ? (itemsForSelectedDate.filter(i => i.status === 'completed').length / itemsForSelectedDate.length * 100)
                      : 0}%`
                  }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                {itemsForSelectedDate.length > 0
                  ? `${Math.round(itemsForSelectedDate.filter(i => i.status === 'completed').length / itemsForSelectedDate.length * 100)}%`
                  : '0%'} hoàn thành
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Tổng số</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">Đang học</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Hoàn thành</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as LearningStatus | 'all')}
                  className="appearance-none px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground pr-8 cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">Tất cả</option>
                  <option value="not_started">Chưa bắt đầu</option>
                  <option value="in_progress">Đang học</option>
                  <option value="completed">Hoàn thành</option>
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
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
                className={`p-2 rounded-lg transition-colors ${notificationsEnabled && permission === 'granted'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                title={
                  permission === 'denied'
                    ? 'Thông báo bị chặn'
                    : notificationsEnabled
                      ? 'Tắt nhắc nhở'
                      : 'Bật nhắc nhở'
                }
              >
                {notificationsEnabled && permission === 'granted' ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm vào lịch
              </button>
            </div>
          </div>

          {/* Notification Permission Banner */}
          {permission === 'default' && (
            <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Bật thông báo để nhận nhắc nhở trước giờ học 15 phút
                </p>
              </div>
              <button
                onClick={requestPermission}
                className="px-3 py-1 text-xs font-medium bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
              >
                Cho phép
              </button>
            </div>
          )}

          {/* Active Notifications */}
          {notifications.length > 0 && (
            <div className="px-6 py-3 bg-primary/10 border-b border-primary/20">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary animate-pulse" />
                <p className="text-sm font-medium text-primary">
                  {notifications.map(n => n.item.resourceName).join(', ')} sắp bắt đầu!
                </p>
              </div>
            </div>
          )}

          {/* Day tabs - Only show in week view */}
          {viewMode === 'week' && (
            <div className="px-6 pb-0 overflow-x-auto scrollbar-hide border-t border-border">
              <div className="flex">
                {weekDates.map((date) => {
                  const { dayName, dayNumber } = formatDate(date);
                  const selected = isSelected(date);
                  const today = isToday(date);
                  const itemCount = itemCountByDate[date.toDateString()] || 0;

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 relative py-4 px-6 cursor-pointer transition-all ${selected ? '' : 'opacity-50 hover:opacity-80'
                        }`}
                    >
                      <span className={`text-xs font-semibold uppercase tracking-wide block mb-1 ${selected ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                        {today ? 'Hôm nay' : dayName}
                      </span>
                      <span className="text-xl font-bold text-foreground flex items-center gap-2">
                        Ngày {dayNumber}
                        {itemCount > 0 && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                            {itemCount}
                          </span>
                        )}
                      </span>
                      <div className={`absolute bottom-0 left-0 w-full h-1 rounded-t-full transition-colors ${selected ? 'bg-primary' : 'bg-transparent'
                        }`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </header>

        {/* Main content - Conditional rendering based on view mode */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          {viewMode === 'week' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full min-w-[800px]">
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

        {/* Floating add button for mobile */}
        <button
          onClick={() => setShowAddDialog(true)}
          className="md:hidden fixed bottom-6 right-6 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all z-50 active:scale-95"
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
      </div>
    </DndContext>
  );
}
