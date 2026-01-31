import React, { useEffect, useState } from 'react';
import { useLearningProgress } from '@/modules/skill-tree/ui/hooks/useLearningProgress';
import { useAuth } from '@/modules/auth/AuthProvider';
import { DailyAgendaDialog } from './DailyAgendaDialog';

export function GlobalDailyAgenda() {
  const { timelineItems } = useLearningProgress();
  const { user } = useAuth();
  const [showAgenda, setShowAgenda] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Reset state when user logs out
  useEffect(() => {
    if (!user) {
      setHasShown(false);
      setShowAgenda(false);
    }
  }, [user]);

  useEffect(() => {
    // If not logged in, do nothing
    if (!user) return;

    // If already shown for this session, do nothing
    if (hasShown) return;

    const checkAgenda = () => {
      const today = new Date();
      const todayTasks = timelineItems.filter(item => {
        const itemDate = new Date(item.scheduledDate);
        return itemDate.toDateString() === today.toDateString() && item.status !== 'completed';
      });

      console.log('GlobalDailyAgenda: Today tasks', { count: todayTasks.length });

      if (todayTasks.length > 0) {
        setShowAgenda(true);
        setHasShown(true);
      }
    };

    if (timelineItems.length > 0) {
      checkAgenda();
    }
  }, [timelineItems, user, hasShown]);

  const handleClose = () => {
    setShowAgenda(false);
    // No longer using sessionStorage to allow showing on every fresh login/reload
  };

  if (!showAgenda) return null;

  const today = new Date();
  const todayTasks = timelineItems.filter(item => {
    const itemDate = new Date(item.scheduledDate);
    return itemDate.toDateString() === today.toDateString() && item.status !== 'completed';
  });

  return (
    <DailyAgendaDialog 
      isOpen={showAgenda} 
      onClose={handleClose} 
      items={todayTasks} 
    />
  );
}

