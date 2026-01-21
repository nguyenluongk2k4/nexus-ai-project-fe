import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
// import { cn } from '@/lib/utils'; // Not used in this version

interface ToastWithProgressProps {
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const ToastWithProgress = ({ 
  title, 
  message, 
  type = 'success', 
  duration = 2000 
}: ToastWithProgressProps) => {
  const [visible, setVisible] = useState(true);

  const colors = {
    success: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      icon: 'text-green-600 dark:text-green-400',
      bar: 'bg-green-500'
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      icon: 'text-red-600 dark:text-red-400',
      bar: 'bg-red-500'
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400',
      bar: 'bg-blue-500'
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      icon: 'text-yellow-600 dark:text-yellow-400',
      bar: 'bg-yellow-500'
    }
  };

  const Icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertCircle
  };

  const Icon = Icons[type];
  const color = colors[type];

  // Inline style for animation keyframes to avoid external CSS dependency for this component
  const animationStyle = `
    @keyframes shrink {
      from { width: 100%; }
      to { width: 0%; }
    }
  `;

  return (
    <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden pointer-events-auto flex flex-col">
      <div className="flex items-center gap-4 p-5">
        <div className={`w-12 h-12 ${color.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${color.icon}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          {message && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {message}
            </p>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div 
        className={`absolute bottom-0 left-0 h-1 ${color.bar} w-full`} 
        style={{ 
          animation: `shrink ${duration}ms linear forwards` 
        }} 
      />
      <style>{animationStyle}</style>
    </div>
  );
};
