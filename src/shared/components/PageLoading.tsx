import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message }: PageLoadingProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 h-full flex items-center justify-center bg-white min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="text-lg font-medium text-slate-600 animate-pulse">
          {message || t('common.loading')}
        </span>
      </div>
    </div>
  );
}
