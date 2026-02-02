import { useContext } from 'react';
import { LearningProgressContext } from '../contexts/LearningContext';

export function useLearningProgress() {
  const context = useContext(LearningProgressContext);
  if (!context) {
    throw new Error('useLearningProgress must be used within LearningProgressProvider');
  }
  return context;
}

