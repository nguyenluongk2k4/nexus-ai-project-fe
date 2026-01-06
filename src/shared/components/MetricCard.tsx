import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
}

export function MetricCard({ title, value, icon: Icon, subtitle, trend }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-violet-50 to-teal-50">
          <Icon className="w-6 h-6 text-violet-600" />
        </div>
        {trend && (
          <span className="text-teal-600 bg-teal-50 px-2 py-1 rounded">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-muted-foreground mb-1">{title}</h3>
      <p className="text-foreground mb-1">{value}</p>
      {subtitle && (
        <p className="text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
