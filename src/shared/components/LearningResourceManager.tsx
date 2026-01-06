import { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Play,
  Calendar,
  Clock,
  Star,
  FileText,
  Bell,
  ExternalLink,
  Pause,
} from 'lucide-react';
import { useLearningProgress } from '@/modules/skill-tree/ui/contexts/LearningProgressContext';
import { LearningStatus } from '@/modules/skill-tree/domain/types/learning';

interface LearningResourceManagerProps {
  resourceUrl: string;
  resourceName: string;
  nodeId: string;
  nodeName: string;
  specializationId: string;
  specializationName: string;
  estimatedTime?: string;
}

export function LearningResourceManager({
  resourceUrl,
  resourceName,
  nodeId,
  nodeName,
  specializationId,
  specializationName,
  estimatedTime,
}: LearningResourceManagerProps) {
  const {
    getProgress,
    updateProgress,
    addResource,
    startSession,
    endSession,
    activeSession,
    addToTimeline,
    addReminder,
  } = useLearningProgress();

  const resourceId = `${nodeId}_${resourceUrl}`;
  const progress = getProgress(resourceId);
  const [showAddToTimeline, setShowAddToTimeline] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(progress?.notes || '');
  const [rating, setRating] = useState(progress?.rating || 0);

  // Timeline form state
  const [scheduledDate, setScheduledDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Reminder form state
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');

  const isActiveSession = activeSession?.resourceId === resourceId;

  const handleStatusChange = (newStatus: LearningStatus) => {
    if (!progress) {
      // Create new progress entry
      addResource({
        resourceId,
        resourceName,
        resourceUrl,
        nodeId,
        nodeName,
        specializationId,
        specializationName,
        status: newStatus,
        progress: newStatus === 'completed' ? 100 : 0,
        startedAt: newStatus !== 'not_started' ? new Date() : undefined,
        completedAt: newStatus === 'completed' ? new Date() : undefined,
        estimatedTime,
      });
    } else {
      const updates: any = { status: newStatus };
      if (newStatus === 'in_progress' && !progress.startedAt) {
        updates.startedAt = new Date();
      }
      if (newStatus === 'completed') {
        updates.completedAt = new Date();
        updates.progress = 100;
      }
      updateProgress(resourceId, updates);
    }
  };

  const handleToggleSession = () => {
    if (isActiveSession && activeSession) {
      endSession(activeSession.id);
    } else {
      startSession(resourceId);
      if (!progress || progress.status === 'not_started') {
        handleStatusChange('in_progress');
      }
    }
  };

  const handleSaveNotes = () => {
    if (progress) {
      updateProgress(resourceId, { notes });
    }
    setShowNotes(false);
  };

  const handleRating = (value: number) => {
    setRating(value);
    if (progress) {
      updateProgress(resourceId, { rating: value });
    }
  };

  const handleAddToTimeline = () => {
    if (!scheduledDate) return;

    addToTimeline({
      resourceId,
      resourceName,
      nodeId,
      nodeName,
      scheduledDate: new Date(scheduledDate),
      deadline: deadline ? new Date(deadline) : undefined,
      status: progress?.status || 'not_started',
      priority,
      estimatedTime,
    });

    setShowAddToTimeline(false);
    setScheduledDate('');
    setDeadline('');
  };

  const handleAddReminder = () => {
    if (!reminderDate || !reminderTime) return;

    const dateTime = new Date(`${reminderDate}T${reminderTime}`);
    addReminder({
      resourceId,
      resourceName,
      scheduledTime: dateTime,
      enabled: true,
    });

    setShowAddReminder(false);
    setReminderDate('');
    setReminderTime('09:00');
  };

  const getStatusIcon = (status?: LearningStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Circle className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status?: LearningStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status?: LearningStatus) => {
    switch (status) {
      case 'completed':
        return 'Học xong';
      case 'in_progress':
        return 'Đang học';
      default:
        return 'Chưa học';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-lg p-4 space-y-3">
      {/* Resource Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getStatusIcon(progress?.status)}
          <div className="flex-1">
            <a
              href={resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-700 hover:underline flex items-center gap-1 group"
            >
              {resourceName}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            {progress && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(progress.status)}`}>
                  {getStatusText(progress.status)}
                </span>
                {progress.actualTimeSpent && progress.actualTimeSpent > 0 && (
                  <span className="text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {Math.round(progress.actualTimeSpent)} phút
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {progress && progress.status !== 'not_started' && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tiến độ</span>
            <span className="font-medium text-violet-700">{progress.progress}%</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-teal-500 transition-all"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Toggle */}
        <select
          value={progress?.status || 'not_started'}
          onChange={(e) => handleStatusChange(e.target.value as LearningStatus)}
          className="text-xs px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
        >
          <option value="not_started">Chưa học</option>
          <option value="in_progress">Đang học</option>
          <option value="completed">Học xong</option>
        </select>

        {/* Session Timer */}
        <button
          onClick={handleToggleSession}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            isActiveSession
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {isActiveSession ? (
            <>
              <Pause className="w-3 h-3" />
              Dừng
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              Bắt đầu
            </>
          )}
        </button>

        {/* Add to Timeline */}
        <button
          onClick={() => setShowAddToTimeline(!showAddToTimeline)}
          className="text-xs px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors flex items-center gap-1.5"
        >
          <Calendar className="w-3 h-3" />
          Lịch
        </button>

        {/* Add Reminder */}
        <button
          onClick={() => setShowAddReminder(!showAddReminder)}
          className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1.5"
        >
          <Bell className="w-3 h-3" />
          Nhắc
        </button>

        {/* Notes */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
        >
          <FileText className="w-3 h-3" />
          Ghi chú
        </button>

        {/* Rating */}
        {progress?.status === 'completed' && (
          <div className="flex items-center gap-1 ml-auto">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleRating(value)}
                className="transition-colors"
              >
                <Star
                  className={`w-4 h-4 ${
                    value <= rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeline Form */}
      {showAddToTimeline && (
        <div className="bg-white rounded-lg p-3 border border-violet-200 space-y-2">
          <div className="text-xs font-medium text-foreground mb-2">Thêm vào lịch học</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Ngày học</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs px-2 py-1.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs px-2 py-1.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Độ ưu tiên</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full text-xs px-2 py-1.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddToTimeline}
              className="flex-1 text-xs px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Thêm
            </button>
            <button
              onClick={() => setShowAddToTimeline(false)}
              className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Reminder Form */}
      {showAddReminder && (
        <div className="bg-white rounded-lg p-3 border border-amber-200 space-y-2">
          <div className="text-xs font-medium text-foreground mb-2">Đặt lời nhắc</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Ngày</label>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full text-xs px-2 py-1.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Giờ</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full text-xs px-2 py-1.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddReminder}
              className="flex-1 text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Đặt nhắc
            </button>
            <button
              onClick={() => setShowAddReminder(false)}
              className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Notes */}
      {showNotes && (
        <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
          <div className="text-xs font-medium text-foreground mb-2">Ghi chú</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Thêm ghi chú về tài liệu này..."
            className="w-full text-xs px-2 py-1.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveNotes}
              className="flex-1 text-xs px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Lưu
            </button>
            <button
              onClick={() => setShowNotes(false)}
              className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
