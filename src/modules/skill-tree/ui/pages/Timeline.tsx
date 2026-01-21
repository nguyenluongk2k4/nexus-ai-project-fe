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
  LayoutGrid,
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

  const renderTimelineCard = (item: TimelineItem, barColor: string) => {
    const priorityColors = {
      high: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Cao' },
      medium: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Trung bình' },
      low: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Thấp' },
    };
    const priority = priorityColors[item.priority];

    return <DraggableCard key={item.id} item={item} priority={priority} barColor={barColor} onStatusChange={handleStatusChange} onDelete={handleDelete} />;
  };

  // Draggable Card Component
  const DraggableCard = ({ item, priority, barColor, onStatusChange, onDelete }: any) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: item.id,
    });

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
          bg-card p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative border border-transparent hover:border-border group cursor-grab active:cursor-grabbing
          ${item.status === 'completed' ? 'opacity-60 grayscale' : ''}
        `}
      >
        {/* Color bar */}
        <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${barColor}`} />

        {/* Header: Priority & Actions */}
        <div className="flex justify-between items-start mb-3 pl-3">
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${priority.badge || priority.bg + ' ' + priority.text}`}>
            {item.priority === 'high' ? 'Cao' : item.priority === 'medium' ? 'Trung bình' : 'Thấp'}
          </span>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
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
              {item.status === 'completed' ? 'Hoàn thành' : item.status === 'in_progress' ? 'Đang học' : 'Chưa bắt đầu'}
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
      morning: { dot: 'bg-orange-500', text: 'text-orange-500', bg: 'bg-orange-500/10' },
      afternoon: { dot: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/10' },
      evening: { dot: 'bg-purple-600', text: 'text-purple-600', bg: 'bg-purple-600/10' },
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
        <DroppableZone id={`${period}-${selectedDate.toDateString()}`}>
          <div className="flex-1 space-y-4 min-h-[150px] pb-4">
            {items.map(item => renderTimelineCard(item, accent.dot))}

            {items.length === 0 && (
              <div className="bg-card rounded-xl border border-border h-64 flex flex-col justify-center items-center text-center p-6">
                <div className={`w-16 h-16 ${accent.bg} rounded-2xl flex items-center justify-center mb-4 ${accent.text}`}>
                  <config.icon className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">Chưa có hoạt động</h3>
                <span className="text-xs text-muted-foreground max-w-[200px]">
                  Khoảng thời gian trống để nghỉ ngơi!
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
      <div className="h-full flex flex-col bg-background overflow-hidden relative">
        {/* Header */}
        <header className="bg-card z-10 shadow-sm border-b border-border">
          <div className="px-8 py-5 flex justify-between items-center border-b border-border/50">
            {/* Left: Title */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Lịch Học Cá Nhân</h1>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">Quản lý tiến độ học tập</p>
            </div>

            {/* Center: Horizontal Stats */}
            <div className="hidden xl:flex items-center divide-x divide-border/60">
              <div className="px-8 text-center">
                <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">Tổng số</div>
              </div>
              <div className="px-8 text-center">
                <div className="text-3xl font-bold text-primary">{stats.inProgress}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">Đang học</div>
              </div>
              <div className="px-8 text-center">
                <div className="text-3xl font-bold text-emerald-500">{stats.completed}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">Hoàn thành</div>
              </div>
            </div>

            {/* Right: Actions & Nav */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'week'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Tuần
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'month'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  Tháng
                </button>
              </div>

              <button
                onClick={goToToday}
                className="px-3 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                Hôm nay
              </button>

              {/* Date Nav */}
              <div className="flex items-center bg-background border border-border rounded-lg p-1 shadow-sm">
                <button
                  onClick={viewMode === 'week' ? goToPreviousWeek : goToPreviousMonth}
                  className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  title={viewMode === 'week' ? 'Tuần trước' : 'Tháng trước'}
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
                  title={viewMode === 'week' ? 'Tuần sau' : 'Tháng sau'}
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
                title={notificationsEnabled ? 'Tắt nhắc nhở' : 'Bật nhắc nhở'}
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
                Thêm lịch
              </button>
            </div>
          </div>

          {/* Week View: Floating Cards */}
          {viewMode === 'week' && (
            <div className="px-8 py-6 overflow-x-auto border-b border-border bg-muted/20">
              <div className="flex justify-between min-w-[800px] items-end">
                {weekDates.map((date) => {
                  const { dayName, dayNumber } = formatDate(date);
                  const selected = isSelected(date);
                  const today = isToday(date);
                  const taskCount = itemCountByDate[date.toDateString()] || 0;

                  // Active Day Card
                  if (selected) {
                    return (
                      <div key={date.toISOString()} className="relative flex flex-col items-center cursor-pointer -mt-2 z-10">
                        <div className="bg-card rounded-xl shadow-lg border-t-4 border-primary px-10 py-4 transform -translate-y-2 min-w-[140px] flex flex-col items-center">
                          {today && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-card px-3">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest whitespace-nowrap">Hôm nay</span>
                            </div>
                          )}
                          <div className="text-center mt-4">
                            <span className="block text-4xl font-bold text-foreground">{dayNumber}</span>
                            <span className="inline-block mt-2 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {taskCount} Tasks
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
                      className="flex flex-col items-center group cursor-pointer pb-2 hover:-translate-y-1 transition-transform"
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
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6 lg:p-8">
          {viewMode === 'week' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-w-[1000px]">
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
      </div>
    </DndContext>
  );
}
// End of Timeline component
