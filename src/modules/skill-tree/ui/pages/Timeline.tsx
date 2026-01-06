import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  Circle,
  AlertCircle,
  Trash2,
  Edit,
  BookOpen,
} from 'lucide-react';
import { useLearningProgress } from '@/modules/skill-tree/ui/contexts/LearningProgressContext';
import { TimelineItem, LearningStatus } from '@/modules/skill-tree/domain/types/learning';

export function Timeline() {
  const {
    timelineItems,
    addToTimeline,
    updateTimelineItem,
    removeFromTimeline,
    getOverdueItems,
    progressData,
  } = useLearningProgress();

  const [filterStatus, setFilterStatus] = useState<LearningStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'deadline'>('date');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredItems = useMemo(() => {
    let items = [...timelineItems];

    if (filterStatus !== 'all') {
      items = items.filter((item) => item.status === filterStatus);
    }

    items.sort((a, b) => {
      if (sortBy === 'date') {
        return a.scheduledDate.getTime() - b.scheduledDate.getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.getTime() - b.deadline.getTime();
      }
    });

    return items;
  }, [timelineItems, filterStatus, sortBy]);

  const overdueItems = getOverdueItems();

  const getStatusColor = (status: LearningStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: LearningStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'in_progress':
        return <Circle className="w-5 h-5" />;
      default:
        return <Circle className="w-5 h-5 opacity-50" />;
    }
  };

  const isOverdue = (item: TimelineItem) => {
    return item.deadline && item.deadline < new Date() && item.status !== 'completed';
  };

  const groupByDate = (items: TimelineItem[]) => {
    const groups: { [key: string]: TimelineItem[] } = {};
    items.forEach((item) => {
      const dateKey = item.scheduledDate.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    return groups;
  };

  const groupedItems = groupByDate(filteredItems);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Ngày mai';
    } else {
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-white via-violet-50/20 to-teal-50/20 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Lịch Học Cá Nhân</h1>
          <p className="text-lg text-muted-foreground">
            Quản lý và theo dõi kế hoạch học tập của bạn
          </p>
        </div>

        {/* Overdue Alert */}
        {overdueItems.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                Bạn có {overdueItems.length} mục đã quá hạn
              </h3>
              <p className="text-sm text-red-700">
                Hãy cập nhật tiến độ hoặc điều chỉnh lịch học của bạn
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Tổng số</div>
            <div className="text-2xl font-bold text-foreground">{timelineItems.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Chưa học</div>
            <div className="text-2xl font-bold text-gray-600">
              {timelineItems.filter((i) => i.status === 'not_started').length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Đang học</div>
            <div className="text-2xl font-bold text-blue-600">
              {timelineItems.filter((i) => i.status === 'in_progress').length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Hoàn thành</div>
            <div className="text-2xl font-bold text-green-600">
              {timelineItems.filter((i) => i.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Lọc:</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as LearningStatus | 'all')}
                className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">Tất cả</option>
                <option value="not_started">Chưa học</option>
                <option value="in_progress">Đang học</option>
                <option value="completed">Hoàn thành</option>
              </select>

              <span className="text-sm font-medium text-foreground">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'deadline')}
                className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="date">Ngày học</option>
                <option value="priority">Độ ưu tiên</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-teal-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <Plus className="w-4 h-4" />
              Thêm vào lịch
            </button>
          </div>
        </div>

        {/* Timeline */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Chưa có mục nào trong lịch
            </h3>
            <p className="text-muted-foreground mb-6">
              Hãy thêm các tài liệu học tập vào lịch để tạo kế hoạch học tập cá nhân
            </p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-violet-600 to-teal-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Thêm mục đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([dateKey, items]) => (
              <div key={dateKey}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {formatDate(new Date(dateKey))}
                  </h3>
                  <div className="flex-1 h-px bg-border"></div>
                </div>

                <div className="space-y-3">
                  {items.map((item) => {
                    const progress = progressData.get(item.resourceId);
                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border-2 p-4 shadow-sm transition-all hover:shadow-md ${
                          isOverdue(item) ? 'border-red-300 bg-red-50/50' : 'border-border'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">
                                  {item.resourceName}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  <BookOpen className="w-4 h-4 inline mr-1" />
                                  {item.nodeName}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                    item.priority
                                  )}`}
                                >
                                  {item.priority === 'high'
                                    ? 'Cao'
                                    : item.priority === 'medium'
                                    ? 'Trung bình'
                                    : 'Thấp'}
                                </span>

                                {isOverdue(item) && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    Quá hạn
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {item.estimatedTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{item.estimatedTime}</span>
                                </div>
                              )}

                              {item.deadline && (
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>
                                    Deadline: {item.deadline.toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              )}

                              {progress && progress.progress > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-violet-500 to-teal-500"
                                      style={{ width: `${progress.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium">
                                    {progress.progress}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const newStatus =
                                  item.status === 'not_started'
                                    ? 'in_progress'
                                    : item.status === 'in_progress'
                                    ? 'completed'
                                    : 'not_started';
                                updateTimelineItem(item.id, { status: newStatus });
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cập nhật trạng thái"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => removeFromTimeline(item.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
