import { useMemo } from 'react';
import { TimelineItem } from '@/modules/skill-tree/domain/types/learning';

interface MonthlyCalendarViewProps {
    currentDate: Date;
    timelineItems: TimelineItem[];
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export function MonthlyCalendarView({
    currentDate,
    timelineItems,
    selectedDate,
    onSelectDate
}: MonthlyCalendarViewProps) {
    // Generate calendar grid (42 days = 6 weeks)
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // First day of month
        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = firstDay.getDay();

        // Start from Monday of the week containing the 1st
        const startDate = new Date(firstDay);
        const mondayOffset = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
        startDate.setDate(firstDay.getDate() + mondayOffset);

        // Generate 42 days
        const days: Date[] = [];
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            days.push(date);
        }

        return days;
    }, [currentDate]);

    // Count items per date
    const itemCountByDate = useMemo(() => {
        const counts: Record<string, number> = {};
        timelineItems.forEach(item => {
            const dateStr = item.scheduledDate.toDateString();
            counts[dateStr] = (counts[dateStr] || 0) + 1;
        });
        return counts;
    }, [timelineItems]);

    const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
    const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();
    const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

    return (
        <div className="p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, index) => {
                    const today = isToday(date);
                    const selected = isSelected(date);
                    const currentMonth = isCurrentMonth(date);
                    const itemCount = itemCountByDate[date.toDateString()] || 0;

                    return (
                        <button
                            key={index}
                            onClick={() => onSelectDate(date)}
                            className={`
                aspect-square p-2 rounded-lg text-center transition-all
                ${currentMonth ? 'text-foreground' : 'text-muted-foreground opacity-40'}
                ${selected ? 'bg-primary text-primary-foreground font-bold ring-2 ring-primary/30' : 'hover:bg-muted'}
                ${today && !selected ? 'ring-2 ring-secondary/50' : ''}
              `}
                        >
                            <div className="flex flex-col items-center justify-center h-full">
                                <span className={`text-sm ${selected ? 'font-bold' : ''}`}>
                                    {date.getDate()}
                                </span>
                                {itemCount > 0 && (
                                    <div className="flex gap-0.5 mt-1">
                                        {Array.from({ length: Math.min(itemCount, 3) }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-1 h-1 rounded-full ${selected ? 'bg-primary-foreground' : 'bg-primary'
                                                    }`}
                                            />
                                        ))}
                                        {itemCount > 3 && (
                                            <span className={`text-[8px] ${selected ? 'text-primary-foreground' : 'text-primary'}`}>
                                                +{itemCount - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
